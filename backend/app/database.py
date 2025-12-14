"""MongoDB database connection and initialization."""

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings
from app.models.shop import Shop
from app.models.work_order import WorkOrder
from app.models.call_log import CallLog


async def init_db() -> None:
    """Initialize database connection and Beanie ODM."""
    settings = get_settings()

    # Create Motor client
    client = AsyncIOMotorClient(settings.mongodb_url)

    # Initialize Beanie with document models
    await init_beanie(
        database=client[settings.database_name],
        document_models=[
            Shop,
            WorkOrder,
            CallLog,
        ],
    )


async def close_db() -> None:
    """Close database connection."""
    # Motor handles connection pooling automatically
    # This is a placeholder for any cleanup if needed
    pass
