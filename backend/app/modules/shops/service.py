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


async def get_shop_config_by_phone(phone: str) -> ShopConfig | None:
    """Get a shop configuration by phone number (for call routing)."""
    return await ShopConfig.find_one(ShopConfig.phone == phone)


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
        phone=data.phone,
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

    await config.update({"$set": update_data})
    await config.sync()

    return config


async def update_shop_config_by_owner(
    owner_id: str, data: ShopConfigUpdate
) -> ShopConfig:
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
