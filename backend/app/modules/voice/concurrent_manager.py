"""Concurrent call manager using asyncio.Semaphore for per-shop call limits."""

import asyncio
import logging

logger = logging.getLogger(__name__)

# Global dictionary to store semaphores per shop
_semaphores: dict[str, asyncio.Semaphore] = {}
_semaphore_locks: dict[str, asyncio.Lock] = {}
_call_counts: dict[str, int] = {}  # Track actual call count for metrics


def _get_semaphore_lock(shop_id: str) -> asyncio.Lock:
    """Get or create a lock for managing semaphore creation."""
    if shop_id not in _semaphore_locks:
        _semaphore_locks[shop_id] = asyncio.Lock()
    return _semaphore_locks[shop_id]


def get_semaphore(shop_id: str, limit: int) -> asyncio.Semaphore:
    """Get or create a semaphore for a shop.

    Args:
        shop_id: The shop's ID.
        limit: Maximum concurrent calls allowed.

    Returns:
        The semaphore for this shop.
    """
    if shop_id not in _semaphores:
        # Create semaphore with the limit
        _semaphores[shop_id] = asyncio.Semaphore(limit)
        _call_counts[shop_id] = 0
        logger.debug("Created semaphore for shop %s with limit %d", shop_id, limit)
    return _semaphores[shop_id]


async def acquire_call_slot(shop_id: str, limit: int) -> bool:
    """Try to acquire a call slot (non-blocking).

    Args:
        shop_id: The shop's ID.
        limit: Maximum concurrent calls allowed.

    Returns:
        True if slot was acquired, False if limit reached.
    """
    if limit is None:  # Unlimited
        _call_counts[shop_id] = _call_counts.get(shop_id, 0) + 1
        return True

    semaphore = get_semaphore(shop_id, limit)

    # Try to acquire without blocking using zero timeout
    try:
        await asyncio.wait_for(semaphore.acquire(), timeout=0.0)
        _call_counts[shop_id] = _call_counts.get(shop_id, 0) + 1
        logger.debug(
            "Acquired call slot for shop %s (%d/%d)", shop_id, _call_counts[shop_id], limit
        )
        return True
    except TimeoutError:
        logger.debug("Call slot limit reached for shop %s (%d/%d)", shop_id, limit, limit)
        return False


def release_call_slot(shop_id: str) -> None:
    """Release a call slot when a call ends.

    Args:
        shop_id: The shop's ID.
    """
    if shop_id in _semaphores:
        _semaphores[shop_id].release()
        _call_counts[shop_id] = max(0, _call_counts.get(shop_id, 1) - 1)
        logger.debug("Released call slot for shop %s (%d active)", shop_id, _call_counts[shop_id])


def get_available_slots(shop_id: str, limit: int | None) -> int | None:
    """Get the number of available call slots.

    Args:
        shop_id: The shop's ID.
        limit: Maximum concurrent calls allowed (None for unlimited).

    Returns:
        Number of available slots, or None if unlimited.
    """
    if limit is None:
        return None

    current_count = _call_counts.get(shop_id, 0)
    available = max(0, limit - current_count)
    return available


def get_concurrent_count(shop_id: str) -> int:
    """Get the current number of concurrent calls for a shop.

    Args:
        shop_id: The shop's ID.

    Returns:
        Current number of active calls.
    """
    return _call_counts.get(shop_id, 0)
