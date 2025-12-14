"""Tests for shop endpoints."""

import pytest
from httpx import AsyncClient

from app.models.shop import Shop


@pytest.mark.asyncio
async def test_create_shop(client: AsyncClient):
    """Test creating a new shop."""
    shop_data = {
        "name": "New Auto Shop",
        "phone": "555-111-2222",
        "address": "456 Oak Ave",
        "city": "Austin",
        "state": "TX",
        "zip_code": "78701",
        "services": ["Oil Change"],
    }

    response = await client.post("/api/shops", json=shop_data)
    assert response.status_code == 201

    data = response.json()
    assert data["name"] == "New Auto Shop"
    assert data["city"] == "Austin"
    assert "id" in data

    # Cleanup
    await Shop.find_one(Shop.name == "New Auto Shop").delete()


@pytest.mark.asyncio
async def test_get_shop(client: AsyncClient, sample_shop: Shop):
    """Test getting a shop by ID."""
    response = await client.get(f"/api/shops/{sample_shop.id}")
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == sample_shop.name
    assert data["phone"] == sample_shop.phone


@pytest.mark.asyncio
async def test_get_shop_not_found(client: AsyncClient):
    """Test getting a non-existent shop returns 404."""
    response = await client.get("/api/shops/507f1f77bcf86cd799439011")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_list_shops(client: AsyncClient, sample_shop: Shop):
    """Test listing all shops."""
    response = await client.get("/api/shops")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 1


@pytest.mark.asyncio
async def test_update_shop(client: AsyncClient, sample_shop: Shop):
    """Test updating a shop."""
    update_data = {"name": "Updated Auto Shop"}

    response = await client.patch(f"/api/shops/{sample_shop.id}", json=update_data)
    assert response.status_code == 200

    data = response.json()
    assert data["name"] == "Updated Auto Shop"
