"""Tests for shops module."""


def test_shop_config_model_import():
    """Verify shop config model imports correctly."""
    from app.modules.shops.models import AdapterType, ShopConfig, ShopSettings

    assert ShopConfig is not None
    assert ShopSettings is not None
    assert AdapterType is not None


def test_shop_config_schemas_import():
    """Verify shop config schemas import correctly."""
    from app.modules.shops.schemas import (
        ShopConfigCreate,
        ShopConfigResponse,
        ShopConfigUpdate,
    )

    assert ShopConfigCreate is not None
    assert ShopConfigResponse is not None
    assert ShopConfigUpdate is not None


def test_adapter_type_values():
    """Verify adapter types are defined."""
    from app.modules.shops.models import AdapterType

    assert AdapterType.MOCK == "mock"
    assert AdapterType.TEKMETRIC == "tekmetric"
    assert AdapterType.SHOPWARE == "shopware"
