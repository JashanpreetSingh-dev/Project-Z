"""Calendar service layer for adapter management and permission validation."""

import logging

from app.adapters.calendar.base import CalendarAdapter
from app.modules.shops.models import ShopConfig

logger = logging.getLogger(__name__)


def get_calendar_adapter(shop_config: ShopConfig | None) -> CalendarAdapter | None:
    """Get the appropriate calendar adapter based on shop configuration.

    Args:
        shop_config: Shop configuration, or None if no shop

    Returns:
        Calendar adapter instance, or None if disabled or no provider configured
    """
    if shop_config is None:
        return None

    calendar_settings = shop_config.settings.calendar_settings

    # No provider configured
    if calendar_settings.provider == "none":
        return None

    # Google Calendar adapter
    if calendar_settings.provider == "google":
        from app.adapters.calendar.google import GoogleCalendarAdapter

        # Check if credentials are available
        credentials = calendar_settings.credentials
        if not credentials or not credentials.get("access_token"):
            logger.warning(
                "Google Calendar selected but no credentials found for shop %s",
                shop_config.id,
            )
            return None

        try:
            return GoogleCalendarAdapter(
                calendar_id=calendar_settings.calendar_id,
                credentials=credentials,
                default_duration_minutes=calendar_settings.default_duration_minutes,
                business_hours_only=calendar_settings.business_hours_only,
            )
        except Exception as e:
            logger.exception("Failed to create Google Calendar adapter: %s", e)
            return None

    # Unknown provider
    logger.warning("Unknown calendar provider: %s", calendar_settings.provider)
    return None


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
