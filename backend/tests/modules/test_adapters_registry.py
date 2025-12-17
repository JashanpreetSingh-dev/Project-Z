"""Tests for central adapter registry (shop + calendar)."""

from unittest.mock import MagicMock

from app.adapters import get_calendar_adapter, get_shop_adapter
from app.modules.shops.models import CalendarSettings, ShopConfig, ShopSettings


class TestShopAdapterRegistry:
    """Tests for shop-system adapter resolution."""

    def test_get_shop_adapter_with_none_config_uses_mock(self):
        """None config should return a mock adapter instance."""
        adapter = get_shop_adapter(None)

        from app.adapters.mock.adapter import MockAdapter

        assert isinstance(adapter, MockAdapter)

    def test_get_shop_adapter_with_mock_type_uses_mock(self):
        """ShopConfig with adapter_type=mock should use MockAdapter."""
        config = MagicMock(spec=ShopConfig)
        config.adapter_type = "mock"  # AdapterType.MOCK under the hood

        adapter = get_shop_adapter(config)

        from app.adapters.mock.adapter import MockAdapter

        assert isinstance(adapter, MockAdapter)


class TestCalendarAdapterRegistry:
    """Tests for calendar adapter resolution."""

    def _build_shop_config(
        self,
        provider: str = "none",
        credentials: dict | None = None,
        mode: str = "read_only",
    ) -> ShopConfig:
        """Helper to create a ShopConfig-like object for calendar tests."""
        calendar_settings = CalendarSettings(
            mode=mode,
            provider=provider,
            credentials=credentials or {},
        )
        settings = ShopSettings(calendar_settings=calendar_settings)
        config = MagicMock(spec=ShopConfig)
        config.settings = settings
        config.id = "shop123"
        return config

    def test_get_calendar_adapter_returns_none_when_no_config(self):
        """No shop config => no calendar adapter."""
        adapter = get_calendar_adapter(None)
        assert adapter is None

    def test_get_calendar_adapter_returns_none_when_provider_none(self):
        """Provider 'none' => calendar disabled."""
        shop_config = self._build_shop_config(provider="none")
        adapter = get_calendar_adapter(shop_config)
        assert adapter is None

    def test_get_calendar_adapter_returns_none_without_credentials(self):
        """Google provider without credentials should not create adapter."""
        shop_config = self._build_shop_config(provider="google", credentials={})
        adapter = get_calendar_adapter(shop_config)
        assert adapter is None

    def test_get_calendar_adapter_returns_google_adapter_with_credentials(self):
        """Google provider with access token should create GoogleCalendarAdapter."""
        creds = {
            "access_token": "test-token",
            "refresh_token": "refresh",
            "client_id": "cid",
            "client_secret": "secret",
        }
        shop_config = self._build_shop_config(provider="google", credentials=creds)

        adapter = get_calendar_adapter(shop_config)

        from app.adapters.calendar.google import GoogleCalendarAdapter

        assert isinstance(adapter, GoogleCalendarAdapter)
