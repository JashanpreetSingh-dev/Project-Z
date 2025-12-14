"""Health check endpoints."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/health")
async def health_check() -> dict[str, str]:
    """Basic health check endpoint."""
    return {"status": "healthy"}


@router.get("/")
async def root() -> dict[str, str]:
    """Root endpoint."""
    return {
        "service": "Voice Receptionist API",
        "version": "0.1.0",
        "status": "running",
    }
