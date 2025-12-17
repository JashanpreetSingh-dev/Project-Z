"""Calendar service layer for adapter management and permission validation."""

import logging

from app.adapters import get_calendar_adapter as _get_calendar_adapter
from app.adapters.calendar.base import CalendarAdapter
from app.modules.shops.models import ShopConfig

logger = logging.getLogger(__name__)


def get_calendar_adapter(shop_config: ShopConfig | None) -> CalendarAdapter | None:
    """Delegate to the central adapter registry to resolve calendar adapter.

    This preserves the existing service interface while ensuring that
    all adapter routing logic lives in app.adapters.
    """
    return _get_calendar_adapter(shop_config)


def validate_booking_permission(shop_config: ShopConfig | None) -> bool:
    """Validate that booking is enabled and properly configured.

    Args:
        shop_config: Shop configuration, or None

    Returns:
        True if booking is enabled and provider is configured with credentials
    """
    if shop_config is None:
        return False

    calendar_settings = shop_config.settings.calendar_settings

    # Booking must be explicitly enabled
    if calendar_settings.mode != "booking_enabled":
        return False

    # Provider must be configured
    if calendar_settings.provider == "none":
        return False

    # Credentials must be available
    credentials = calendar_settings.credentials
    if not credentials or not credentials.get("access_token"):
        return False

    return True
