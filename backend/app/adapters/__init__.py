"""External data source adapters (MCP-style).

This module also provides factory helpers to resolve the correct adapter
implementation for a given shop configuration. It acts as a simple
registry for adapter domains (shop system, calendar).
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

from app.adapters.base import ShopSystemAdapter, WorkOrderResult
from app.adapters.mock import MockAdapter

logger = logging.getLogger(__name__)

if TYPE_CHECKING:  # Avoid runtime import cycles
    from app.adapters.calendar.base import CalendarAdapter
    from app.modules.shops.models import ShopConfig


def get_shop_adapter(config: ShopConfig | None) -> ShopSystemAdapter:
    """Resolve the shop-system adapter for a given shop config.

    For now this routes everything to the mock adapter, but centralizing
    the logic here makes it easy to plug in Tekmetric / Shop-Ware later
    without touching the voice modules.
    """

    # No config yet: use mock adapter for demo/MVP flows
    if config is None:
        return MockAdapter()

    from app.modules.shops.models import AdapterType  # Local import to avoid cycles

    if config.adapter_type == AdapterType.MOCK:
        return MockAdapter()

    if config.adapter_type == AdapterType.TEKMETRIC:
        logger.warning("Tekmetric adapter not implemented yet, falling back to MockAdapter")
        return MockAdapter()

    if config.adapter_type == AdapterType.SHOPWARE:
        logger.warning("Shop-Ware adapter not implemented yet, falling back to MockAdapter")
        return MockAdapter()

    logger.warning("Unknown adapter_type %s, falling back to MockAdapter", config.adapter_type)
    return MockAdapter()


def get_calendar_adapter(config: ShopConfig | None) -> CalendarAdapter | None:
    """Resolve the calendar adapter for a given shop config.

    Returns None when calendar integration is disabled or misconfigured.
    """
    if config is None:
        return None

    calendar_settings = config.settings.calendar_settings

    # No provider configured
    if calendar_settings.provider == "none":
        return None

    # Google Calendar adapter
    if calendar_settings.provider == "google":
        from app.adapters.calendar.google import GoogleCalendarAdapter

        credentials = calendar_settings.credentials
        if not credentials or not credentials.get("access_token"):
            logger.warning(
                "Google Calendar selected but no credentials found for shop %s",
                getattr(config, "id", "<unknown>"),
            )
            return None

        try:
            return GoogleCalendarAdapter(
                calendar_id=calendar_settings.calendar_id,
                credentials=credentials,
                default_duration_minutes=calendar_settings.default_duration_minutes,
                business_hours_only=calendar_settings.business_hours_only,
            )
        except Exception as exc:  # pragma: no cover - defensive
            logger.exception("Failed to create Google Calendar adapter: %s", exc)
            return None

    logger.warning("Unknown calendar provider: %s", calendar_settings.provider)
    return None


__all__ = [
    "ShopSystemAdapter",
    "WorkOrderResult",
    "get_shop_adapter",
    "get_calendar_adapter",
]
