"""Work order model for vehicle service tracking."""

from datetime import datetime
from enum import Enum
from typing import Optional

from beanie import Document, Indexed, Link
from pydantic import BaseModel, Field


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
    year: Optional[int] = Field(None, description="Vehicle year")
    color: Optional[str] = Field(None, description="Vehicle color")
    license_plate: Optional[str] = Field(None, description="License plate number")
    vin: Optional[str] = Field(None, description="Vehicle Identification Number")


class ServiceItem(BaseModel):
    """Individual service on a work order."""

    name: str = Field(..., description="Service name")
    status: WorkOrderStatus = Field(default=WorkOrderStatus.PENDING)
    notes: Optional[str] = Field(None, description="Service notes")


class WorkOrder(Document):
    """Work order document for tracking vehicle services."""

    # Identifiers
    order_number: Indexed(str) = Field(..., description="Unique work order number")  # type: ignore
    shop_id: Indexed(str) = Field(..., description="Reference to shop")  # type: ignore

    # Customer info
    customer_name: Indexed(str) = Field(..., description="Customer full name")  # type: ignore
    customer_phone: Optional[str] = Field(None, description="Customer phone number")
    customer_email: Optional[str] = Field(None, description="Customer email")

    # Vehicle
    vehicle: Vehicle = Field(..., description="Vehicle information")

    # Service details
    services: list[ServiceItem] = Field(default=[], description="Services on this order")
    status: WorkOrderStatus = Field(default=WorkOrderStatus.PENDING)

    # Dates
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    estimated_completion: Optional[datetime] = Field(None)
    completed_at: Optional[datetime] = Field(None)

    # Notes
    notes: Optional[str] = Field(None, description="General notes")

    class Settings:
        name = "work_orders"
        use_state_management = True

    def __str__(self) -> str:
        return f"WorkOrder({self.order_number})"
