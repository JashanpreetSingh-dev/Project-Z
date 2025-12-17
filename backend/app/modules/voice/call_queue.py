"""Call queue system for managing calls when concurrent limits are reached."""

import asyncio
import logging
import time
from dataclasses import dataclass

logger = logging.getLogger(__name__)


@dataclass
class QueuedCall:
    """Represents a call waiting in the queue."""

    call_sid: str
    from_number: str
    to_number: str
    shop_id: str
    queued_at: float
    timeout_at: float

    def is_expired(self) -> bool:
        """Check if this queued call has expired."""
        return time.time() > self.timeout_at


class CallQueue:
    """Manages per-shop call queues with timeout handling."""

    def __init__(self) -> None:
        """Initialize call queue with per-shop queues."""
        # Per-shop queues: {shop_id: asyncio.Queue[QueuedCall]}
        self._queues: dict[str, asyncio.Queue[QueuedCall]] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()
        # Background task for processing expired items
        self._cleanup_task: asyncio.Task[None] | None = None

    async def start_cleanup_task(self) -> None:
        """Start background task to remove expired queue items."""
        if self._cleanup_task is None or self._cleanup_task.done():
            self._cleanup_task = asyncio.create_task(self._cleanup_loop())

    async def stop_cleanup_task(self) -> None:
        """Stop the background cleanup task."""
        if self._cleanup_task and not self._cleanup_task.done():
            self._cleanup_task.cancel()
            try:
                await self._cleanup_task
            except asyncio.CancelledError:
                pass

    async def _cleanup_loop(self) -> None:
        """Background loop to remove expired queue items."""
        from app.config import get_settings

        settings = get_settings()
        interval = settings.queue_processing_interval_seconds

        while True:
            try:
                await asyncio.sleep(interval)
                expired = await self.remove_expired()
                if expired:
                    logger.info("Removed %d expired calls from queues", len(expired))
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.exception("Error in queue cleanup loop: %s", e)

    async def enqueue(
        self, call_sid: str, from_number: str, to_number: str, shop_id: str, timeout_seconds: int
    ) -> bool:
        """Add a call to the queue.

        Args:
            call_sid: Twilio call SID.
            from_number: Caller's phone number.
            to_number: Called phone number.
            shop_id: Shop ID.
            timeout_seconds: Maximum wait time in queue.

        Returns:
            True if call was added to queue, False if queue is full.
        """
        async with self._lock:
            # Get or create queue for this shop
            if shop_id not in self._queues:
                self._queues[shop_id] = asyncio.Queue()

            queue = self._queues[shop_id]

            # Check queue size limit (0 = no limit)
            from app.modules.shops.service import get_shop_config_by_id

            try:
                shop_config = await get_shop_config_by_id(shop_id)
                max_size = shop_config.settings.max_queue_size
            except Exception:
                max_size = 5  # Default fallback

            if max_size > 0 and queue.qsize() >= max_size:
                logger.warning(
                    "Queue full for shop %s (size: %d), rejecting call %s",
                    shop_id,
                    queue.qsize(),
                    call_sid,
                )
                return False

            # Create queued call
            now = time.time()
            queued_call = QueuedCall(
                call_sid=call_sid,
                from_number=from_number,
                to_number=to_number,
                shop_id=shop_id,
                queued_at=now,
                timeout_at=now + timeout_seconds,
            )

            await queue.put(queued_call)
            logger.info(
                "Call queued: shop=%s call=%s queue_size=%d timeout_in=%ds",
                shop_id,
                call_sid,
                queue.qsize(),
                timeout_seconds,
            )
            return True

    async def dequeue(self, shop_id: str) -> QueuedCall | None:
        """Get the next call from the queue for a shop.

        Args:
            shop_id: Shop ID.

        Returns:
            Next queued call, or None if queue is empty.
        """
        async with self._lock:
            if shop_id not in self._queues:
                return None

            queue = self._queues[shop_id]

            # Try to get next item (non-blocking)
            try:
                queued_call = queue.get_nowait()
                # Check if expired
                if queued_call.is_expired():
                    logger.warning("Dequeued expired call: %s", queued_call.call_sid)
                    # Try to get next one
                    return await self.dequeue(shop_id)
                logger.info(
                    "Call dequeued: shop=%s call=%s queue_size=%d",
                    shop_id,
                    queued_call.call_sid,
                    queue.qsize(),
                )
                return queued_call
            except asyncio.QueueEmpty:
                return None

    async def get_queue_size(self, shop_id: str) -> int:
        """Get the current queue size for a shop.

        Args:
            shop_id: Shop ID.

        Returns:
            Number of calls in queue.
        """
        async with self._lock:
            if shop_id not in self._queues:
                return 0
            return self._queues[shop_id].qsize()

    async def remove_expired(self) -> list[QueuedCall]:
        """Remove all expired calls from all queues.

        Returns:
            List of expired calls that were removed.
        """
        expired: list[QueuedCall] = []
        async with self._lock:
            for shop_id, queue in list(self._queues.items()):
                # Collect all items from queue
                temp_items: list[QueuedCall] = []
                while True:
                    try:
                        item = queue.get_nowait()
                        if item.is_expired():
                            expired.append(item)
                            logger.info("Removed expired call from queue: %s", item.call_sid)
                        else:
                            temp_items.append(item)
                    except asyncio.QueueEmpty:
                        break

                # Put non-expired items back
                for item in temp_items:
                    await queue.put(item)

                # Remove empty queues
                if queue.qsize() == 0:
                    del self._queues[shop_id]

        return expired

    async def clear_shop_queue(self, shop_id: str) -> None:
        """Clear all queued calls for a shop.

        Args:
            shop_id: Shop ID.
        """
        async with self._lock:
            if shop_id in self._queues:
                # Clear the queue
                queue = self._queues[shop_id]
                while True:
                    try:
                        queue.get_nowait()
                    except asyncio.QueueEmpty:
                        break
                del self._queues[shop_id]
                logger.info("Cleared queue for shop: %s", shop_id)


# Global call queue instance
_call_queue = CallQueue()


def get_call_queue() -> CallQueue:
    """Get the global call queue instance."""
    return _call_queue
