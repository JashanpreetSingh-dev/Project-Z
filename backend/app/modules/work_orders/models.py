"""Work order model for vehicle service tracking."""

from datetime import datetime
from enum import Enum

from beanie import Document, Indexed
from pydantic import BaseModel, Field

from app.common.utils import utc_now


class WorkOrderStatus(str, Enum):
    """Status of a work order."""

    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    WAITING_PARTS = "WAITING_PARTS"
    READY = "READY"
    PICKED_UP = "PICKED_UP"
    CANCELLED = "CANCELLED"


class Vehicle(BaseModel):
    """Vehicle information."""

    make: str = Field(..., description="Vehicle make (e.g., Honda)")
    model: str = Field(..., description="Vehicle model (e.g., Civic)")
    year: int | None = Field(default=None, description="Vehicle year")
    color: str | None = Field(default=None, description="Vehicle color")
    license_plate: str | None = Field(default=None, description="License plate number")
    vin: str | None = Field(default=None, description="Vehicle Identification Number")


class ServiceItem(BaseModel):
    """Individual service on a work order."""

    name: str = Field(..., description="Service name")
    status: WorkOrderStatus = Field(default=WorkOrderStatus.PENDING)
    notes: str | None = Field(default=None, description="Service notes")


class WorkOrder(Document):
    """Work order document for tracking vehicle services."""

    # Identifiers
    order_number: Indexed(str) = Field(..., description="Unique work order number")  # type: ignore[valid-type]
    shop_id: Indexed(str) = Field(..., description="Reference to shop")  # type: ignore[valid-type]

    # Customer info
    customer_name: Indexed(str) = Field(..., description="Customer full name")  # type: ignore[valid-type]
    customer_phone: str | None = Field(default=None, description="Customer phone number")
    customer_email: str | None = Field(default=None, description="Customer email")

    # Vehicle
    vehicle: Vehicle = Field(..., description="Vehicle information")

    # Service details
    services: list[ServiceItem] = Field(default_factory=list, description="Services on this order")
    status: WorkOrderStatus = Field(default=WorkOrderStatus.PENDING)

    # Dates
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    estimated_completion: datetime | None = Field(default=None)
    completed_at: datetime | None = Field(default=None)

    # Notes
    notes: str | None = Field(default=None, description="General notes")

    class Settings:
        name = "work_orders"
        use_state_management = True

    def __str__(self) -> str:
        return f"WorkOrder({self.order_number})"
