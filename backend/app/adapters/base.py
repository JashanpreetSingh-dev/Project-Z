"""Base adapter interface for shop management systems (MCP-style).

This module defines the interface that all shop system adapters must implement.
Each method corresponds to a tool that the LLM can call during a conversation.
"""

from abc import ABC, abstractmethod
from typing import Any


class WorkOrderResult:
    """Structured result from work order lookup."""

    def __init__(
        self,
        order_id: str,
        customer_name: str,
        vehicle: dict[str, Any],
        status: str,
        services: list[dict[str, Any]],
        estimated_completion: str | None = None,
        notes: str | None = None,
    ):
        self.order_id = order_id
        self.customer_name = customer_name
        self.vehicle = vehicle
        self.status = status
        self.services = services
        self.estimated_completion = estimated_completion
        self.notes = notes

    def to_dict(self) -> dict[str, Any]:
        return {
            "order_id": self.order_id,
            "customer_name": self.customer_name,
            "vehicle": self.vehicle,
            "status": self.status,
            "services": self.services,
            "estimated_completion": self.estimated_completion,
            "notes": self.notes,
        }


class ShopSystemAdapter(ABC):
    """Abstract adapter for external shop management systems.

    This is an MCP-style interface where each method corresponds to a tool
    that the LLM can call. Implementations fetch data from external systems
    (Tekmetric, Shop-Ware, or mock data for testing).
    """

    # =========================================================================
    # Work Order Tools
    # =========================================================================

    @abstractmethod
    async def lookup_work_order(
        self,
        customer_name: str | None = None,
        license_plate: str | None = None,
        phone: str | None = None,
        last_name: str | None = None,
    ) -> list[dict[str, Any]]:
        """Look up work orders by customer information.

        The LLM calls this when a caller asks about their vehicle status.
        At least one search parameter should be provided.

        Args:
            customer_name: Full or partial customer name
            license_plate: Vehicle license plate number
            phone: Customer phone number
            last_name: Customer last name only

        Returns:
            List of matching work orders with status, vehicle info, services.
        """
        ...

    @abstractmethod
    async def get_work_order_status(self, order_id: str) -> dict[str, Any]:
        """Get detailed status of a specific work order.

        Args:
            order_id: The work order identifier

        Returns:
            Detailed status including services breakdown and ETA.
        """
        ...

    # =========================================================================
    # Shop Information Tools
    # =========================================================================

    @abstractmethod
    async def get_business_hours(self) -> dict[str, Any]:
        """Get the shop's business hours.

        Returns:
            Weekly schedule with open/close times per day.
        """
        ...

    @abstractmethod
    async def get_location(self) -> dict[str, Any]:
        """Get the shop's address and location info.

        Returns:
            Address, city, state, zip, and optional directions.
        """
        ...

    @abstractmethod
    async def list_services(self) -> list[str]:
        """Get list of services offered by the shop.

        Returns:
            List of service names (e.g., "Oil Change", "Brake Repair").
        """
        ...

    # =========================================================================
    # Customer Tools
    # =========================================================================

    @abstractmethod
    async def get_customer_vehicles(
        self,
        phone: str | None = None,
        customer_name: str | None = None,
    ) -> list[dict[str, Any]]:
        """Look up vehicles associated with a customer.

        Args:
            phone: Customer phone number
            customer_name: Customer name

        Returns:
            List of vehicles with make, model, year, license plate.
        """
        ...
