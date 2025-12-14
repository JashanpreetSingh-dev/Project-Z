"""Work order management endpoints."""

from fastapi import APIRouter, File, Query, UploadFile, status

from app.modules.work_orders import service
from app.modules.work_orders.models import WorkOrder, WorkOrderStatus
from app.modules.work_orders.schemas import (
    CSVImportResult,
    WorkOrderCreate,
    WorkOrderResponse,
    WorkOrderUpdate,
)

router = APIRouter()


@router.get("", response_model=list[WorkOrderResponse])
async def list_work_orders(
    shop_id: str | None = Query(None, description="Filter by shop ID"),
    status: WorkOrderStatus | None = Query(None, description="Filter by status"),
    customer_name: str | None = Query(None, description="Search by customer name"),
) -> list[WorkOrder]:
    """List work orders with optional filters."""
    return await service.get_work_orders(shop_id, status, customer_name)


@router.post("", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_work_order(order_data: WorkOrderCreate) -> WorkOrder:
    """Create a new work order."""
    return await service.create_work_order(order_data)


@router.get("/{order_id}", response_model=WorkOrderResponse)
async def get_work_order(order_id: str) -> WorkOrder:
    """Get a specific work order by ID."""
    return await service.get_work_order_by_id(order_id)


@router.patch("/{order_id}", response_model=WorkOrderResponse)
async def update_work_order(order_id: str, order_data: WorkOrderUpdate) -> WorkOrder:
    """Update a work order."""
    return await service.update_work_order(order_id, order_data)


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_order(order_id: str) -> None:
    """Delete a work order."""
    await service.delete_work_order(order_id)


@router.post("/import/csv", response_model=CSVImportResult)
async def import_work_orders_csv(
    shop_id: str = Query(..., description="Shop ID to import orders for"),
    file: UploadFile = File(..., description="CSV file with work orders"),
) -> CSVImportResult:
    """
    Import work orders from a CSV file.

    Expected CSV columns:
    - order_number (required)
    - customer_name (required)
    - customer_phone
    - vehicle_make (required)
    - vehicle_model (required)
    - vehicle_year
    - vehicle_color
    - license_plate
    - status (PENDING, IN_PROGRESS, WAITING_PARTS, READY, PICKED_UP, CANCELLED)
    - services (comma-separated list)
    - notes
    """
    return await service.import_from_csv(shop_id, file)
