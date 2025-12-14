"""Pytest configuration and fixtures."""

import asyncio
from typing import AsyncGenerator

import pytest
from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient
from httpx import AsyncClient, ASGITransport

from app.main import app
from app.models import Shop, WorkOrder, CallLog


@pytest.fixture(scope="session")
def event_loop():
    """Create event loop for async tests."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="session")
async def db_client() -> AsyncGenerator[AsyncIOMotorClient, None]:
    """Create MongoDB client for testing."""
    client = AsyncIOMotorClient("mongodb://localhost:27017")

    # Initialize Beanie with test database
    await init_beanie(
        database=client["test_voice_receptionist"],
        document_models=[Shop, WorkOrder, CallLog],
    )

    yield client

    # Cleanup: drop test database
    await client.drop_database("test_voice_receptionist")
    client.close()


@pytest.fixture
async def client(db_client: AsyncIOMotorClient) -> AsyncGenerator[AsyncClient, None]:
    """Create async HTTP client for testing."""
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac


@pytest.fixture
async def sample_shop(db_client: AsyncIOMotorClient) -> AsyncGenerator[Shop, None]:
    """Create a sample shop for testing."""
    shop = Shop(
        name="Test Auto Shop",
        phone="555-123-4567",
        address="123 Main St",
        city="Testville",
        state="TX",
        zip_code="12345",
        services=["Oil Change", "Brake Repair", "Tire Rotation"],
    )
    await shop.insert()

    yield shop

    # Cleanup
    await shop.delete()


@pytest.fixture
async def sample_work_order(
    db_client: AsyncIOMotorClient, sample_shop: Shop
) -> AsyncGenerator[WorkOrder, None]:
    """Create a sample work order for testing."""
    from app.models.work_order import Vehicle, WorkOrderStatus

    work_order = WorkOrder(
        order_number="WO-001",
        shop_id=str(sample_shop.id),
        customer_name="John Doe",
        customer_phone="555-987-6543",
        vehicle=Vehicle(
            make="Honda",
            model="Civic",
            year=2020,
            color="Blue",
            license_plate="ABC123",
        ),
        status=WorkOrderStatus.IN_PROGRESS,
    )
    await work_order.insert()

    yield work_order

    # Cleanup
    await work_order.delete()
