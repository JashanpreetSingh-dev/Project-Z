"""Mock adapter that returns sample JSON data for MVP testing."""

import json
from pathlib import Path
from typing import Any

from app.adapters.base import ShopSystemAdapter


class MockAdapter(ShopSystemAdapter):
    """Mock adapter that returns sample data from JSON files.

    Used for MVP testing before integrating with real shop management systems.
    """

    def __init__(self, data_dir: Path | None = None):
        """Initialize mock adapter.

        Args:
            data_dir: Directory containing sample JSON files.
                     Defaults to the 'data' subdirectory.
        """
        if data_dir is None:
            data_dir = Path(__file__).parent / "data"
        self.data_dir = data_dir
        self._cache: dict[str, Any] = {}

    def _load_json(self, filename: str) -> Any:
        """Load JSON data from file, with caching."""
        if filename not in self._cache:
            filepath = self.data_dir / filename
            if filepath.exists():
                with open(filepath) as f:
                    self._cache[filename] = json.load(f)
            else:
                self._cache[filename] = {}
        return self._cache[filename]

    # =========================================================================
    # Work Order Tools
    # =========================================================================

    async def lookup_work_order(
        self,
        customer_name: str | None = None,
        license_plate: str | None = None,
        phone: str | None = None,
        last_name: str | None = None,
    ) -> list[dict[str, Any]]:
        """Look up work orders from sample data."""
        data = self._load_json("work_orders.json")
        work_orders = data.get("work_orders", [])

        results = []
        for order in work_orders:
            # Match by any provided criteria
            if customer_name:
                if customer_name.lower() not in order.get("customer_name", "").lower():
                    continue
            if last_name:
                name_parts = order.get("customer_name", "").lower().split()
                if not name_parts or last_name.lower() not in name_parts:
                    continue
            if license_plate:
                if license_plate.lower() != order.get("vehicle", {}).get("license_plate", "").lower():
                    continue
            if phone:
                # Normalize phone comparison (remove non-digits)
                order_phone = "".join(c for c in order.get("customer_phone", "") if c.isdigit())
                search_phone = "".join(c for c in phone if c.isdigit())
                if search_phone not in order_phone:
                    continue

            results.append(order)

        return results

    async def get_work_order_status(self, order_id: str) -> dict[str, Any]:
        """Get detailed status of a specific work order."""
        data = self._load_json("work_orders.json")
        work_orders = data.get("work_orders", [])

        for order in work_orders:
            if order.get("order_id") == order_id:
                return {
                    "order_id": order["order_id"],
                    "status": order.get("status", "UNKNOWN"),
                    "services": order.get("services", []),
                    "estimated_completion": order.get("estimated_completion"),
                    "notes": order.get("notes"),
                }

        return {"error": f"Work order {order_id} not found"}

    # =========================================================================
    # Shop Information Tools
    # =========================================================================

    async def get_business_hours(self) -> dict[str, Any]:
        """Get business hours from sample data."""
        data = self._load_json("shop_info.json")
        return data.get("hours", {})

    async def get_location(self) -> dict[str, Any]:
        """Get shop location from sample data."""
        data = self._load_json("shop_info.json")
        return data.get("location", {})

    async def list_services(self) -> list[str]:
        """Get list of services from sample data."""
        data = self._load_json("shop_info.json")
        return data.get("services", [])

    # =========================================================================
    # Customer Tools
    # =========================================================================

    async def get_customer_vehicles(
        self,
        phone: str | None = None,
        customer_name: str | None = None,
    ) -> list[dict[str, Any]]:
        """Look up customer vehicles from sample data."""
        data = self._load_json("customers.json")
        customers = data.get("customers", [])

        for customer in customers:
            if phone:
                customer_phone = "".join(c for c in customer.get("phone", "") if c.isdigit())
                search_phone = "".join(c for c in phone if c.isdigit())
                if search_phone in customer_phone:
                    return customer.get("vehicles", [])

            if customer_name:
                if customer_name.lower() in customer.get("name", "").lower():
                    return customer.get("vehicles", [])

        return []
