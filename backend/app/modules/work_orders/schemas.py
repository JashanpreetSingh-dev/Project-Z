"""Request/response schemas for work orders."""

from datetime import datetime

from pydantic import BaseModel, Field

from app.modules.work_orders.models import ServiceItem, Vehicle, WorkOrderStatus


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
    services: list[ServiceItem] = Field(default_factory=list)
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
