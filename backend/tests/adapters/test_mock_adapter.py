"""Tests for MockAdapter."""

import pytest

from app.adapters.mock.adapter import MockAdapter


@pytest.fixture
def mock_adapter():
    """Create a MockAdapter instance with default sample data."""
    return MockAdapter()


@pytest.mark.asyncio
async def test_lookup_work_order_by_name(mock_adapter):
    """Test looking up work orders by customer name."""
    results = await mock_adapter.lookup_work_order(customer_name="John Smith")

    assert len(results) >= 1
    assert results[0]["customer_name"] == "John Smith"
    assert "vehicle" in results[0]
    assert "status" in results[0]


@pytest.mark.asyncio
async def test_lookup_work_order_by_last_name(mock_adapter):
    """Test looking up work orders by last name only."""
    results = await mock_adapter.lookup_work_order(last_name="Johnson")

    assert len(results) >= 1
    assert "Johnson" in results[0]["customer_name"]


@pytest.mark.asyncio
async def test_lookup_work_order_by_license_plate(mock_adapter):
    """Test looking up work orders by license plate."""
    results = await mock_adapter.lookup_work_order(license_plate="ABC1234")

    assert len(results) >= 1
    assert results[0]["vehicle"]["license_plate"] == "ABC1234"


@pytest.mark.asyncio
async def test_lookup_work_order_not_found(mock_adapter):
    """Test looking up work orders that don't exist."""
    results = await mock_adapter.lookup_work_order(customer_name="Nobody Here")

    assert len(results) == 0


@pytest.mark.asyncio
async def test_get_work_order_status(mock_adapter):
    """Test getting work order status by ID."""
    result = await mock_adapter.get_work_order_status("WO-2024-001")

    assert result["order_id"] == "WO-2024-001"
    assert "status" in result
    assert "services" in result


@pytest.mark.asyncio
async def test_get_business_hours(mock_adapter):
    """Test getting business hours."""
    hours = await mock_adapter.get_business_hours()

    assert "monday" in hours
    assert "sunday" in hours
    assert hours["sunday"]["closed"] is True


@pytest.mark.asyncio
async def test_get_location(mock_adapter):
    """Test getting shop location."""
    location = await mock_adapter.get_location()

    assert "address" in location
    assert "city" in location
    assert "state" in location


@pytest.mark.asyncio
async def test_list_services(mock_adapter):
    """Test listing available services."""
    services = await mock_adapter.list_services()

    assert len(services) > 0
    assert "Oil Change" in services


@pytest.mark.asyncio
async def test_get_customer_vehicles(mock_adapter):
    """Test getting customer vehicles by phone."""
    vehicles = await mock_adapter.get_customer_vehicles(phone="555-123-4567")

    assert len(vehicles) > 0
    assert "make" in vehicles[0]
    assert "model" in vehicles[0]
