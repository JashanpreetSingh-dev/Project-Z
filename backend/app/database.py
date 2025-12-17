"""MongoDB database connection and initialization."""

import logging

from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from app.config import get_settings
from app.modules.billing.models import Subscription, UsageRecord
from app.modules.calls.models import CallLog
from app.modules.context.models import CustomerContext
from app.modules.shops.models import ShopConfig
from app.modules.sms.models import SmsOptOut

logger = logging.getLogger(__name__)


async def init_db() -> None:
    """Initialize database connection and Beanie ODM."""
    settings = get_settings()

    logger.info("Connecting to MongoDB at %s...", settings.mongodb_url.split("@")[-1])

    # Create Motor client
    client: AsyncIOMotorClient = AsyncIOMotorClient(settings.mongodb_url)

    # Initialize Beanie with document models
    # Note: WorkOrder is NOT stored locally - it comes from adapters
    await init_beanie(
        database=client[settings.database_name],  # type: ignore[arg-type]
        document_models=[
            ShopConfig,  # Shop configuration and adapter settings
            CallLog,  # AI call interaction logs
            Subscription,  # Billing subscriptions
            UsageRecord,  # Usage tracking per period
            CustomerContext,  # Cross-channel customer interaction history
            SmsOptOut,  # SMS opt-out tracking
        ],
    )

    logger.info("Connected to MongoDB database: %s", settings.database_name)


async def close_db() -> None:
    """Close database connection."""
    # Motor handles connection pooling automatically
    # This is a placeholder for any cleanup if needed
    pass
