"""Tests for work order endpoints."""

import pytest
from httpx import AsyncClient

from app.models.shop import Shop
from app.models.work_order import WorkOrder


@pytest.mark.asyncio
async def test_create_work_order(client: AsyncClient, sample_shop: Shop):
    """Test creating a new work order."""
    order_data = {
        "order_number": "WO-TEST-001",
        "shop_id": str(sample_shop.id),
        "customer_name": "Jane Smith",
        "customer_phone": "555-444-3333",
        "vehicle": {
            "make": "Toyota",
            "model": "Camry",
            "year": 2021,
            "color": "Silver",
        },
        "status": "PENDING",
    }

    response = await client.post("/api/work-orders", json=order_data)
    assert response.status_code == 201

    data = response.json()
    assert data["order_number"] == "WO-TEST-001"
    assert data["customer_name"] == "Jane Smith"
    assert data["vehicle"]["make"] == "Toyota"

    # Cleanup
    await WorkOrder.find_one(WorkOrder.order_number == "WO-TEST-001").delete()


@pytest.mark.asyncio
async def test_get_work_order(client: AsyncClient, sample_work_order: WorkOrder):
    """Test getting a work order by ID."""
    response = await client.get(f"/api/work-orders/{sample_work_order.id}")
    assert response.status_code == 200

    data = response.json()
    assert data["order_number"] == sample_work_order.order_number
    assert data["customer_name"] == sample_work_order.customer_name


@pytest.mark.asyncio
async def test_list_work_orders_by_shop(
    client: AsyncClient, sample_shop: Shop, sample_work_order: WorkOrder
):
    """Test listing work orders filtered by shop."""
    response = await client.get(f"/api/work-orders?shop_id={sample_shop.id}")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    assert all(order["shop_id"] == str(sample_shop.id) for order in data)


@pytest.mark.asyncio
async def test_update_work_order_status(client: AsyncClient, sample_work_order: WorkOrder):
    """Test updating work order status."""
    update_data = {"status": "READY"}

    response = await client.patch(
        f"/api/work-orders/{sample_work_order.id}", json=update_data
    )
    assert response.status_code == 200

    data = response.json()
    assert data["status"] == "READY"


@pytest.mark.asyncio
async def test_search_by_customer_name(
    client: AsyncClient, sample_shop: Shop, sample_work_order: WorkOrder
):
    """Test searching work orders by customer name."""
    response = await client.get("/api/work-orders?customer_name=John")
    assert response.status_code == 200

    data = response.json()
    assert len(data) >= 1
    assert any("John" in order["customer_name"] for order in data)
