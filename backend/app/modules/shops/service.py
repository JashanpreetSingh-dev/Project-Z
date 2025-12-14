"""Business logic for shop configuration management."""

from beanie import PydanticObjectId

from app.common.exceptions import NotFoundError
from app.common.utils import utc_now
from app.modules.shops.models import AdapterCredentials, ShopConfig, ShopSettings
from app.modules.shops.schemas import ShopConfigCreate, ShopConfigUpdate


async def get_all_shop_configs() -> list[ShopConfig]:
    """Get all shop configurations.

    Note: This is an admin-only function. Regular users should use
    get_shop_config_by_owner instead.
    """
    return await ShopConfig.find_all().to_list()


async def get_shop_config_by_id(shop_id: str) -> ShopConfig:
    """Get a shop configuration by ID."""
    config = await ShopConfig.get(PydanticObjectId(shop_id))
    if not config:
        raise NotFoundError("ShopConfig", shop_id)
    return config


async def get_shop_config_by_owner(owner_id: str) -> ShopConfig | None:
    """Get a shop configuration by owner ID.

    Args:
        owner_id: The Clerk user ID of the shop owner.

    Returns:
        The shop config if found, None otherwise.
    """
    return await ShopConfig.find_one(ShopConfig.owner_id == owner_id)


def normalize_phone(phone: str) -> str:
    """Normalize phone number to E.164 format (+1XXXXXXXXXX for US/CA).

    Handles various input formats:
    - +15551234567 -> +15551234567
    - 15551234567 -> +15551234567
    - 5551234567 -> +15551234567 (assumes US/CA)
    - (555) 123-4567 -> +15551234567
    """
    # Remove all non-digit characters except leading +
    digits = "".join(c for c in phone if c.isdigit())

    # If 10 digits, assume US/CA and add +1
    if len(digits) == 10:
        return f"+1{digits}"
    # If 11 digits starting with 1, add +
    if len(digits) == 11 and digits.startswith("1"):
        return f"+{digits}"
    # Already has country code
    if phone.startswith("+"):
        return f"+{digits}"
    # Fallback: return with +
    return f"+{digits}" if digits else phone


async def get_shop_config_by_phone(phone: str) -> ShopConfig | None:
    """Get a shop configuration by phone number (for call routing).

    Tries multiple phone formats to handle different storage conventions.
    """
    normalized = normalize_phone(phone)

    # Try exact match first (E.164 format)
    shop = await ShopConfig.find_one(ShopConfig.phone == normalized)
    if shop:
        return shop

    # Try without country code (10 digits)
    digits_only = "".join(c for c in phone if c.isdigit())
    if len(digits_only) >= 10:
        last_10 = digits_only[-10:]
        shop = await ShopConfig.find_one(ShopConfig.phone == last_10)
        if shop:
            return shop

    # Try with just the digits
    shop = await ShopConfig.find_one(ShopConfig.phone == digits_only)
    return shop


async def create_shop_config(data: ShopConfigCreate, owner_id: str) -> ShopConfig:
    """Create a new shop configuration.

    Args:
        data: The shop configuration data.
        owner_id: The Clerk user ID who will own this shop.

    Returns:
        The created shop configuration.
    """
    config = ShopConfig(
        owner_id=owner_id,
        name=data.name,
        phone=normalize_phone(data.phone),  # Normalize to E.164
        adapter_type=data.adapter_type,
        adapter_credentials=data.adapter_credentials or AdapterCredentials(),
        settings=data.settings or ShopSettings(),
    )
    await config.insert()
    return config


async def update_shop_config(shop_id: str, data: ShopConfigUpdate) -> ShopConfig:
    """Update a shop configuration."""
    config = await get_shop_config_by_id(shop_id)

    update_data = data.model_dump(exclude_unset=True)
    update_data["updated_at"] = utc_now()

    # Normalize phone if being updated
    if "phone" in update_data and update_data["phone"]:
        update_data["phone"] = normalize_phone(update_data["phone"])

    await config.update({"$set": update_data})
    await config.sync()

    return config


async def update_shop_config_by_owner(owner_id: str, data: ShopConfigUpdate) -> ShopConfig:
    """Update the shop configuration for a specific owner.

    Args:
        owner_id: The Clerk user ID of the shop owner.
        data: The update data.

    Returns:
        The updated shop configuration.

    Raises:
        NotFoundError: If no shop is found for this owner.
    """
    config = await get_shop_config_by_owner(owner_id)
    if not config:
        raise NotFoundError("ShopConfig", f"owner:{owner_id}")

    update_data = data.model_dump(exclude_unset=True)
    update_data["updated_at"] = utc_now()

    # Normalize phone if being updated
    if "phone" in update_data and update_data["phone"]:
        update_data["phone"] = normalize_phone(update_data["phone"])

    await config.update({"$set": update_data})
    await config.sync()

    return config


async def delete_shop_config(shop_id: str) -> None:
    """Delete a shop configuration."""
    config = await get_shop_config_by_id(shop_id)
    await config.delete()


async def delete_shop_config_by_owner(owner_id: str) -> None:
    """Delete the shop configuration for a specific owner.

    Args:
        owner_id: The Clerk user ID of the shop owner.

    Raises:
        NotFoundError: If no shop is found for this owner.
    """
    config = await get_shop_config_by_owner(owner_id)
    if not config:
        raise NotFoundError("ShopConfig", f"owner:{owner_id}")
    await config.delete()
