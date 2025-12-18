"""Call queue manager using asyncio.Queue for managing queued calls."""

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
    timeout_task: asyncio.Task[None] | None = None


# Global dictionary to store queues per shop
_queues: dict[str, asyncio.Queue[QueuedCall]] = {}
_queue_metadata: dict[str, list[QueuedCall]] = {}  # Track queue position for lookup


def get_queue(shop_id: str) -> asyncio.Queue[QueuedCall]:
    """Get or create a queue for a shop.

    Args:
        shop_id: The shop's ID.

    Returns:
        The queue for this shop.
    """
    if shop_id not in _queues:
        _queues[shop_id] = asyncio.Queue()
        _queue_metadata[shop_id] = []
        logger.debug("Created queue for shop %s", shop_id)
    return _queues[shop_id]


async def enqueue_call(
    shop_id: str,
    call_sid: str,
    from_number: str,
    to_number: str,
    timeout_seconds: int = 300,
) -> int:
    """Add a call to the queue.

    Args:
        shop_id: The shop's ID.
        call_sid: Twilio call SID.
        from_number: Caller's phone number.
        to_number: Called phone number.
        timeout_seconds: Maximum time to wait in queue (default 5 minutes).

    Returns:
        Position in queue (1-based).
    """
    queue = get_queue(shop_id)

    queued_call = QueuedCall(
        call_sid=call_sid,
        from_number=from_number,
        to_number=to_number,
        shop_id=shop_id,
        queued_at=time.time(),
    )

    # Add to queue
    await queue.put(queued_call)
    _queue_metadata[shop_id].append(queued_call)

    position = len(_queue_metadata[shop_id])
    logger.info("Enqueued call %s for shop %s (position %d)", call_sid, shop_id, position)

    # Schedule timeout task
    queued_call.timeout_task = asyncio.create_task(
        _timeout_call(shop_id, call_sid, timeout_seconds)
    )

    return position


async def _timeout_call(shop_id: str, call_sid: str, timeout_seconds: int) -> None:
    """Remove call from queue after timeout."""
    await asyncio.sleep(timeout_seconds)

    # Check if still in queue
    if shop_id in _queue_metadata:
        call_index = next(
            (i for i, call in enumerate(_queue_metadata[shop_id]) if call.call_sid == call_sid),
            None,
        )
        if call_index is not None:
            logger.warning("Call %s timed out in queue for shop %s", call_sid, shop_id)
            remove_from_queue(shop_id, call_sid)


async def dequeue_call(shop_id: str) -> QueuedCall | None:
    """Get the next call from the queue.

    This will wait if the queue is empty.

    Args:
        shop_id: The shop's ID.

    Returns:
        The next queued call, or None if queue doesn't exist.
    """
    if shop_id not in _queues:
        return None

    try:
        queued_call = await _queues[shop_id].get()
        # Remove from metadata
        if shop_id in _queue_metadata:
            _queue_metadata[shop_id] = [
                call for call in _queue_metadata[shop_id] if call.call_sid != queued_call.call_sid
            ]

        # Cancel timeout task if still running
        if queued_call.timeout_task and not queued_call.timeout_task.done():
            queued_call.timeout_task.cancel()

        logger.info("Dequeued call %s for shop %s", queued_call.call_sid, shop_id)
        return queued_call
    except asyncio.CancelledError:
        return None


def remove_from_queue(shop_id: str, call_sid: str) -> None:
    """Remove a call from the queue (e.g., if caller hung up).

    Args:
        shop_id: The shop's ID.
        call_sid: Twilio call SID to remove.
    """
    if shop_id not in _queue_metadata:
        return

    # Find and remove from metadata
    call_to_remove = next(
        (call for call in _queue_metadata[shop_id] if call.call_sid == call_sid), None
    )

    if call_to_remove:
        _queue_metadata[shop_id] = [
            call for call in _queue_metadata[shop_id] if call.call_sid != call_sid
        ]

        # Cancel timeout task
        if call_to_remove.timeout_task and not call_to_remove.timeout_task.done():
            call_to_remove.timeout_task.cancel()

        logger.info("Removed call %s from queue for shop %s", call_sid, shop_id)


def get_queue_size(shop_id: str) -> int:
    """Get the current queue size for a shop.

    Args:
        shop_id: The shop's ID.

    Returns:
        Number of calls in queue.
    """
    return len(_queue_metadata.get(shop_id, []))


def get_queue_position(shop_id: str, call_sid: str) -> int | None:
    """Get the position of a call in the queue.

    Args:
        shop_id: The shop's ID.
        call_sid: Twilio call SID.

    Returns:
        Position in queue (1-based), or None if not found.
    """
    if shop_id not in _queue_metadata:
        return None

    for i, call in enumerate(_queue_metadata[shop_id], start=1):
        if call.call_sid == call_sid:
            return i

    return None


def get_queued_call(shop_id: str, call_sid: str) -> QueuedCall | None:
    """Get a queued call by call_sid.

    Args:
        shop_id: The shop's ID.
        call_sid: Twilio call SID.

    Returns:
        The queued call, or None if not found.
    """
    if shop_id not in _queue_metadata:
        return None

    return next((call for call in _queue_metadata[shop_id] if call.call_sid == call_sid), None)
