"""Abstract adapter for external shop management systems (Phase 7+).

This module defines the interface for integrating with shop management systems
like Tekmetric and Shop-Ware. Implementations will be added when we build
out the integration phase.
"""

from abc import ABC, abstractmethod


class ShopSystemAdapter(ABC):
    """Abstract adapter for external shop management systems.

    This interface allows the voice receptionist to fetch work order data
    from the shop's existing management system (Tekmetric, Shop-Ware, etc.)
    instead of requiring manual data entry.
    """

    @abstractmethod
    async def get_work_orders(self, shop_id: str) -> list[dict]:
        """Fetch all work orders for a shop.

        Args:
            shop_id: The shop identifier in the external system.

        Returns:
            List of work order dictionaries normalized to our schema.
        """
        ...

    @abstractmethod
    async def get_work_order_status(self, order_id: str) -> str:
        """Get the current status of a specific work order.

        Args:
            order_id: The work order identifier in the external system.

        Returns:
            Status string (e.g., "PENDING", "IN_PROGRESS", "READY").
        """
        ...

    @abstractmethod
    async def sync_work_orders(self, shop_id: str) -> int:
        """Sync work orders from external system to local database.

        Args:
            shop_id: The shop identifier in the external system.

        Returns:
            Number of work orders synced.
        """
        ...

    @abstractmethod
    async def get_customer_vehicles(self, customer_phone: str) -> list[dict]:
        """Look up vehicles by customer phone number.

        Args:
            customer_phone: The customer's phone number.

        Returns:
            List of vehicle dictionaries associated with the customer.
        """
        ...


# Implementations to be added in Phase 7:
# - TekmetricAdapter
# - ShopWareAdapter
