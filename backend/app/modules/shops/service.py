"""Business logic for shop management."""

from beanie import PydanticObjectId

from app.common.exceptions import NotFoundError
from app.common.utils import utc_now
from app.modules.shops.models import Shop, ShopSettings
from app.modules.shops.schemas import ShopCreate, ShopUpdate


async def get_all_shops() -> list[Shop]:
    """Get all shops."""
    return await Shop.find_all().to_list()


async def get_shop_by_id(shop_id: str) -> Shop:
    """Get a shop by ID."""
    shop = await Shop.get(PydanticObjectId(shop_id))
    if not shop:
        raise NotFoundError("Shop", shop_id)
    return shop


async def create_shop(shop_data: ShopCreate) -> Shop:
    """Create a new shop."""
    shop = Shop(
        **shop_data.model_dump(exclude_unset=True),
        settings=shop_data.settings or ShopSettings(),
    )
    await shop.insert()
    return shop


async def update_shop(shop_id: str, shop_data: ShopUpdate) -> Shop:
    """Update a shop."""
    shop = await get_shop_by_id(shop_id)

    update_data = shop_data.model_dump(exclude_unset=True)
    update_data["updated_at"] = utc_now()

    await shop.update({"$set": update_data})
    await shop.sync()

    return shop


async def delete_shop(shop_id: str) -> None:
    """Delete a shop."""
    shop = await get_shop_by_id(shop_id)
    await shop.delete()
