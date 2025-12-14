"""Call log endpoints."""

from fastapi import APIRouter, Query, status

from app.modules.calls import service
from app.modules.calls.models import CallLog
from app.modules.calls.schemas import CallLogCreate, CallLogResponse

router = APIRouter()


@router.get("", response_model=list[CallLogResponse])
async def list_call_logs(
    shop_id: str | None = Query(None, description="Filter by shop ID"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of results"),
) -> list[CallLog]:
    """List call logs with optional filters."""
    return await service.get_call_logs(shop_id, limit)


@router.post("", response_model=CallLogResponse, status_code=status.HTTP_201_CREATED)
async def create_call_log(call_data: CallLogCreate) -> CallLog:
    """Create a new call log."""
    return await service.create_call_log(call_data)


@router.get("/{call_id}", response_model=CallLogResponse)
async def get_call_log(call_id: str) -> CallLog:
    """Get a specific call log by ID."""
    return await service.get_call_log_by_id(call_id)
