"""Work order management endpoints."""

import csv
import io
from datetime import UTC, datetime
from typing import Any

from beanie import PydanticObjectId
from fastapi import APIRouter, File, HTTPException, Query, UploadFile, status
from pydantic import BaseModel, Field

from app.models.work_order import ServiceItem, Vehicle, WorkOrder, WorkOrderStatus

router = APIRouter()


# ============================================
# Request/Response Schemas
# ============================================


class VehicleCreate(BaseModel):
    """Schema for vehicle information."""

    make: str
    model: str
    year: int | None = None
    color: str | None = None
    license_plate: str | None = None
    vin: str | None = None


class WorkOrderCreate(BaseModel):
    """Schema for creating a work order."""

    order_number: str = Field(..., min_length=1)
    shop_id: str
    customer_name: str = Field(..., min_length=1)
    customer_phone: str | None = None
    customer_email: str | None = None
    vehicle: VehicleCreate
    services: list[ServiceItem] = []
    status: WorkOrderStatus = WorkOrderStatus.PENDING
    notes: str | None = None
    estimated_completion: datetime | None = None


class WorkOrderUpdate(BaseModel):
    """Schema for updating a work order."""

    customer_name: str | None = None
    customer_phone: str | None = None
    customer_email: str | None = None
    vehicle: VehicleCreate | None = None
    services: list[ServiceItem] | None = None
    status: WorkOrderStatus | None = None
    notes: str | None = None
    estimated_completion: datetime | None = None


class WorkOrderResponse(BaseModel):
    """Schema for work order response."""

    id: str
    order_number: str
    shop_id: str
    customer_name: str
    customer_phone: str | None
    customer_email: str | None
    vehicle: Vehicle
    services: list[ServiceItem]
    status: WorkOrderStatus
    notes: str | None
    created_at: datetime
    updated_at: datetime
    estimated_completion: datetime | None
    completed_at: datetime | None


class CSVImportResult(BaseModel):
    """Result of CSV import operation."""

    total_rows: int
    imported: int
    skipped: int
    errors: list[str]


# ============================================
# Endpoints
# ============================================


@router.get("", response_model=list[WorkOrderResponse])
async def list_work_orders(
    shop_id: str | None = Query(None, description="Filter by shop ID"),
    status: WorkOrderStatus | None = Query(None, description="Filter by status"),
    customer_name: str | None = Query(None, description="Search by customer name"),
) -> list[WorkOrder]:
    """List work orders with optional filters."""
    query: dict[str, Any] = {}

    if shop_id:
        query["shop_id"] = shop_id
    if status:
        query["status"] = status
    if customer_name:
        query["customer_name"] = {"$regex": customer_name, "$options": "i"}

    return await WorkOrder.find(query).to_list()


@router.post("", response_model=WorkOrderResponse, status_code=status.HTTP_201_CREATED)
async def create_work_order(order_data: WorkOrderCreate) -> WorkOrder:
    """Create a new work order."""
    # Check if order number already exists for this shop
    existing = await WorkOrder.find_one(
        WorkOrder.shop_id == order_data.shop_id,
        WorkOrder.order_number == order_data.order_number,
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Work order {order_data.order_number} already exists for this shop",
        )

    work_order = WorkOrder(
        **order_data.model_dump(),
        vehicle=Vehicle(**order_data.vehicle.model_dump()),
    )
    await work_order.insert()
    return work_order


@router.get("/{order_id}", response_model=WorkOrderResponse)
async def get_work_order(order_id: str) -> WorkOrder:
    """Get a specific work order by ID."""
    order = await WorkOrder.get(PydanticObjectId(order_id))
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work order with id {order_id} not found",
        )
    return order


@router.patch("/{order_id}", response_model=WorkOrderResponse)
async def update_work_order(order_id: str, order_data: WorkOrderUpdate) -> WorkOrder:
    """Update a work order."""
    order = await WorkOrder.get(PydanticObjectId(order_id))
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work order with id {order_id} not found",
        )

    update_data = order_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = datetime.now(UTC)

    # Handle status change to PICKED_UP
    if order_data.status == WorkOrderStatus.PICKED_UP and order.status != WorkOrderStatus.PICKED_UP:
        update_data["completed_at"] = datetime.now(UTC)

    await order.update({"$set": update_data})
    await order.sync()

    return order


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_work_order(order_id: str) -> None:
    """Delete a work order."""
    order = await WorkOrder.get(PydanticObjectId(order_id))
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Work order with id {order_id} not found",
        )

    await order.delete()


# ============================================
# CSV Import
# ============================================


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
    if not file.filename or not file.filename.endswith(".csv"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be a CSV",
        )

    content = await file.read()
    decoded = content.decode("utf-8")
    reader = csv.DictReader(io.StringIO(decoded))

    result = CSVImportResult(total_rows=0, imported=0, skipped=0, errors=[])

    for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
        result.total_rows += 1

        try:
            # Validate required fields
            if not row.get("order_number"):
                result.errors.append(f"Row {row_num}: Missing order_number")
                result.skipped += 1
                continue

            if not row.get("customer_name"):
                result.errors.append(f"Row {row_num}: Missing customer_name")
                result.skipped += 1
                continue

            if not row.get("vehicle_make") or not row.get("vehicle_model"):
                result.errors.append(f"Row {row_num}: Missing vehicle_make or vehicle_model")
                result.skipped += 1
                continue

            # Check for existing order
            existing = await WorkOrder.find_one(
                WorkOrder.shop_id == shop_id,
                WorkOrder.order_number == row["order_number"],
            )
            if existing:
                result.errors.append(f"Row {row_num}: Order {row['order_number']} already exists")
                result.skipped += 1
                continue

            # Parse status
            status_str = row.get("status", "PENDING").upper()
            try:
                order_status = WorkOrderStatus(status_str)
            except ValueError:
                order_status = WorkOrderStatus.PENDING

            # Parse year
            year = None
            if row.get("vehicle_year"):
                try:
                    year = int(row["vehicle_year"])
                except ValueError:
                    pass

            # Parse services
            services = []
            if row.get("services"):
                for service_name in row["services"].split(","):
                    service_name = service_name.strip()
                    if service_name:
                        services.append(ServiceItem(name=service_name))

            # Create work order
            work_order = WorkOrder(
                order_number=row["order_number"],
                shop_id=shop_id,
                customer_name=row["customer_name"],
                customer_phone=row.get("customer_phone"),
                vehicle=Vehicle(
                    make=row["vehicle_make"],
                    model=row["vehicle_model"],
                    year=year,
                    color=row.get("vehicle_color"),
                    license_plate=row.get("license_plate"),
                    vin=row.get("vin"),
                ),
                services=services,
                status=order_status,
                notes=row.get("notes"),
            )

            await work_order.insert()
            result.imported += 1

        except Exception as e:
            result.errors.append(f"Row {row_num}: {str(e)}")
            result.skipped += 1

    return result
