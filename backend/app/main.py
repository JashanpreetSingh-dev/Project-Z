"""FastAPI application entry point."""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.common.health import router as health_router
from app.config import get_settings
from app.database import close_db, init_db
from app.modules.calls.router import router as calls_router
from app.modules.shops.router import router as shops_router
from app.modules.work_orders.router import router as work_orders_router


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for startup/shutdown."""
    # Startup
    await init_db()
    yield
    # Shutdown
    await close_db()


def create_app() -> FastAPI:
    """Create and configure FastAPI application."""
    settings = get_settings()

    app = FastAPI(
        title="Voice Receptionist API",
        description="AI-powered phone receptionist for auto shops",
        version="0.1.0",
        lifespan=lifespan,
        debug=settings.debug,
    )

    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],  # Configure appropriately for production
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Include routers
    app.include_router(health_router, tags=["Health"])
    app.include_router(shops_router, prefix="/api/shops", tags=["Shops"])
    app.include_router(work_orders_router, prefix="/api/work-orders", tags=["Work Orders"])
    app.include_router(calls_router, prefix="/api/calls", tags=["Calls"])

    return app


app = create_app()
