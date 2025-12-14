"""Tests for work_orders module."""


def test_work_order_model_import():
    """Verify work order model imports correctly."""
    from app.modules.work_orders.models import (
        ServiceItem,
        Vehicle,
        WorkOrder,
        WorkOrderStatus,
    )

    assert WorkOrder is not None
    assert WorkOrderStatus is not None
    assert Vehicle is not None
    assert ServiceItem is not None


def test_work_order_schemas_import():
    """Verify work order schemas import correctly."""
    from app.modules.work_orders.schemas import (
        WorkOrderCreate,
        WorkOrderResponse,
        WorkOrderUpdate,
    )

    assert WorkOrderCreate is not None
    assert WorkOrderResponse is not None
    assert WorkOrderUpdate is not None
