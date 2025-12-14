"""Health check tests."""


def test_common_imports():
    """Verify common module imports correctly."""
    from app.common.exceptions import NotFoundError
    from app.common.utils import utc_now

    assert utc_now is not None
    assert NotFoundError is not None


def test_health_router_import():
    """Verify health router imports correctly."""
    from app.common.health import router

    assert router is not None
