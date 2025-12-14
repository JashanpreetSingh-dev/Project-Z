"""Tests for shops module."""


def test_shop_model_import():
    """Verify shop model imports correctly."""
    from app.modules.shops.models import Shop, ShopSettings

    assert Shop is not None
    assert ShopSettings is not None


def test_shop_schemas_import():
    """Verify shop schemas import correctly."""
    from app.modules.shops.schemas import ShopCreate, ShopResponse, ShopUpdate

    assert ShopCreate is not None
    assert ShopResponse is not None
    assert ShopUpdate is not None
