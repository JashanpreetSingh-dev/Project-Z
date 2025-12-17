"""Tests for shop configuration service."""

from unittest.mock import MagicMock

from app.modules.shops.models import CalendarSettings, ShopConfig, ShopSettings
from app.modules.shops.service import get_allowed_intents


class TestAllowedIntents:
    """Tests for dynamic allowed intents helper."""

    def test_base_intents_without_shop_config(self):
        """Test that base intents are returned when shop config is None."""
        intents = get_allowed_intents(None)
        assert "CHECK_STATUS" in intents
        assert "GET_HOURS" in intents
        assert "GET_LOCATION" in intents
        assert "GET_SERVICES" in intents
        assert "TRANSFER_HUMAN" in intents
        assert "SCHEDULE_APPOINTMENT" not in intents

    def test_base_intents_without_booking_enabled(self):
        """Test that SCHEDULE_APPOINTMENT is not included when booking is disabled."""
        calendar_settings = CalendarSettings(mode="read_only", provider="google")
        settings = ShopSettings(calendar_settings=calendar_settings)
        shop_config = MagicMock(spec=ShopConfig)
        shop_config.settings = settings
        intents = get_allowed_intents(shop_config)
        assert "SCHEDULE_APPOINTMENT" not in intents

    def test_booking_intent_with_booking_enabled(self):
        """Test that SCHEDULE_APPOINTMENT is included when booking is enabled."""
        calendar_settings = CalendarSettings(mode="booking_enabled", provider="google")
        settings = ShopSettings(calendar_settings=calendar_settings)
        shop_config = MagicMock(spec=ShopConfig)
        shop_config.settings = settings
        intents = get_allowed_intents(shop_config)
        assert "SCHEDULE_APPOINTMENT" in intents
        assert "CHECK_STATUS" in intents
        assert "GET_HOURS" in intents

    def test_booking_intent_not_included_without_provider(self):
        """Test that SCHEDULE_APPOINTMENT is not included when provider is none."""
        calendar_settings = CalendarSettings(mode="booking_enabled", provider="none")
        settings = ShopSettings(calendar_settings=calendar_settings)
        shop_config = MagicMock(spec=ShopConfig)
        shop_config.settings = settings
        intents = get_allowed_intents(shop_config)
        assert "SCHEDULE_APPOINTMENT" not in intents
