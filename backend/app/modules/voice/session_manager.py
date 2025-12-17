"""Session manager for tracking active concurrent calls per shop."""

import asyncio
import logging

from app.config import get_settings
from app.modules.billing.constants import CONCURRENT_CALL_LIMITS
from app.modules.billing.service import get_or_create_subscription
from app.modules.shops.models import ShopConfig

logger = logging.getLogger(__name__)
_settings = get_settings()


class SessionManager:
    """Manages active session tracking per shop with thread-safe operations."""

    def __init__(self) -> None:
        """Initialize session manager with thread-safe data structures."""
        # Track active sessions per shop: {shop_id: set of session_ids}
        self._active_sessions_by_shop: dict[str, set[str]] = {}
        # Lock for thread-safe operations
        self._lock = asyncio.Lock()
        # Global active count
        self._global_active_count: int = 0

    async def get_active_count(self, shop_id: str) -> int:
        """Get number of active sessions for a shop.

        Args:
            shop_id: The shop's ID.

        Returns:
            Number of active sessions for the shop.
        """
        async with self._lock:
            return len(self._active_sessions_by_shop.get(shop_id, set()))

    async def get_global_count(self) -> int:
        """Get total number of active sessions across all shops.

        Returns:
            Total active sessions globally.
        """
        async with self._lock:
            return self._global_active_count

    async def can_accept_call(
        self, shop_id: str, shop_config: ShopConfig | None
    ) -> tuple[bool, str]:
        """Check if a new call can be accepted for a shop.

        Args:
            shop_id: The shop's ID.
            shop_config: Shop configuration (optional, will be fetched if not provided).

        Returns:
            Tuple of (can_accept: bool, reason: str)
        """
        async with self._lock:
            # Check global limit first
            if self._global_active_count >= _settings.max_global_concurrent_calls:
                return (
                    False,
                    f"Global concurrent call limit reached ({_settings.max_global_concurrent_calls})",
                )

            # Get shop config if not provided
            if not shop_config:
                from app.modules.shops.service import get_shop_config_by_id

                shop_config = await get_shop_config_by_id(shop_id)

            if not shop_config:
                # No shop config, allow with default limit
                return True, "No shop config found, using default limits"

            # Get shop's concurrent call limit
            limit = await self._get_shop_limit(shop_id, shop_config)

            # Get current active count for this shop
            active_count = len(self._active_sessions_by_shop.get(shop_id, set()))

            if active_count >= limit:
                return (
                    False,
                    f"Shop concurrent call limit reached ({active_count}/{limit})",
                )

            return True, "Capacity available"

    async def _get_shop_limit(self, shop_id: str, shop_config: ShopConfig | None) -> int:
        """Get the concurrent call limit for a shop.

        Args:
            shop_id: The shop's ID.
            shop_config: Shop configuration (optional).

        Returns:
            Maximum concurrent calls allowed for this shop.
        """
        # Get shop config if not provided
        if not shop_config:
            from app.modules.shops.service import get_shop_config_by_id

            shop_config = await get_shop_config_by_id(shop_id)

        # Check if shop has override setting
        if shop_config and shop_config.settings.max_concurrent_calls is not None:
            return shop_config.settings.max_concurrent_calls

        # Otherwise, use plan-based limit
        subscription = await get_or_create_subscription(shop_id)
        return CONCURRENT_CALL_LIMITS.get(subscription.plan_tier, 1)

    async def register_session(self, shop_id: str, session_id: str) -> None:
        """Register a new active session.

        Args:
            shop_id: The shop's ID.
            session_id: The session ID (call_sid for Twilio calls).
        """
        async with self._lock:
            if shop_id not in self._active_sessions_by_shop:
                self._active_sessions_by_shop[shop_id] = set()
            self._active_sessions_by_shop[shop_id].add(session_id)
            self._global_active_count += 1
            active_count = len(self._active_sessions_by_shop[shop_id])

        # Get limit for logging (outside lock to avoid blocking)
        try:
            from app.modules.shops.service import get_shop_config_by_id

            shop_config = await get_shop_config_by_id(shop_id)
            limit = await self._get_shop_limit(shop_id, shop_config)
        except Exception:
            limit = 1  # Default fallback

        logger.info(
            "Session registered: shop=%s session=%s (active: %d/%d)",
            shop_id,
            session_id,
            active_count,
            limit,
        )

    async def unregister_session(self, shop_id: str, session_id: str) -> None:
        """Unregister an active session.

        Args:
            shop_id: The shop's ID.
            session_id: The session ID (call_sid for Twilio calls).
        """
        async with self._lock:
            if shop_id in self._active_sessions_by_shop:
                if session_id in self._active_sessions_by_shop[shop_id]:
                    self._active_sessions_by_shop[shop_id].remove(session_id)
                    self._global_active_count = max(0, self._global_active_count - 1)
                    logger.info(
                        "Session unregistered: shop=%s session=%s (active: %d)",
                        shop_id,
                        session_id,
                        len(self._active_sessions_by_shop[shop_id]),
                    )
                    # Clean up empty shop entries
                    if not self._active_sessions_by_shop[shop_id]:
                        del self._active_sessions_by_shop[shop_id]

    async def get_all_active_sessions(self) -> dict[str, list[str]]:
        """Get all active sessions grouped by shop (for monitoring).

        Returns:
            Dictionary mapping shop_id to list of session_ids.
        """
        async with self._lock:
            return {
                shop_id: list(sessions)
                for shop_id, sessions in self._active_sessions_by_shop.items()
            }


# Global session manager instance
_session_manager = SessionManager()


def get_session_manager() -> SessionManager:
    """Get the global session manager instance."""
    return _session_manager
