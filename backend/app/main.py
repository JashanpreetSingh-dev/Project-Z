"""FastAPI application entry point."""

import logging
from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.common.health import router as health_router
from app.config import get_settings
from app.database import close_db, init_db
from app.modules.billing.router import router as billing_router
from app.modules.calendar.router import router as calendar_router
from app.modules.calls.router import router as calls_router
from app.modules.context.router import router as context_router
from app.modules.shops.router import router as shops_router
from app.modules.sms.router import router as sms_router
from app.modules.voice.router import router as voice_router
from app.modules.voice.telephony import router as twilio_router

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Application lifespan handler for startup/shutdown."""
    # Startup
    logger.info("Starting Voice Receptionist API...")
    await init_db()
    logger.info("Application started successfully")
    yield
    # Shutdown
    logger.info("Shutting down...")
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
    app.include_router(shops_router, prefix="/api/shops", tags=["Shop Config"])
    app.include_router(calls_router, prefix="/api/calls", tags=["Call Logs"])
    app.include_router(voice_router, prefix="/api/voice", tags=["Voice AI"])
    app.include_router(twilio_router, prefix="/api/twilio", tags=["Twilio Telephony"])
    app.include_router(billing_router, prefix="/api/billing", tags=["Billing"])
    app.include_router(context_router, prefix="/api/context", tags=["Customer Context"])
    app.include_router(sms_router, prefix="/api/sms", tags=["SMS"])
    app.include_router(calendar_router, tags=["Calendar"])

    # Static files for voice test page
    static_dir = Path(__file__).parent.parent / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

        @app.get("/voice-test", include_in_schema=False)
        async def voice_test_page() -> FileResponse:
            """Serve the voice test HTML page."""
            return FileResponse(static_dir / "voice_test.html")

    return app


app = create_app()
