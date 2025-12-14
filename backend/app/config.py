"""Application configuration using Pydantic Settings."""

from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    # Database
    mongodb_url: str = "mongodb://localhost:27017"
    database_name: str = "voice_receptionist"

    # OpenAI
    openai_api_key: str = ""

    # OpenAI Realtime API (Phase 3)
    realtime_model: str = "gpt-4o-realtime-preview"
    realtime_voice: str = "alloy"  # Options: alloy, echo, fable, onyx, nova, shimmer

    # Deepgram (fallback/alternative)
    deepgram_api_key: str = ""

    # Twilio (Phase 4)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_phone_number: str = ""
    twilio_webhook_base_url: str = ""  # e.g., "https://your-ngrok-url.ngrok.io"
    default_transfer_number: str = ""  # Fallback if shop has no transfer number

    # Clerk Authentication
    clerk_secret_key: str = ""
    clerk_publishable_key: str = ""

    # App Settings
    debug: bool = False
    log_level: str = "INFO"


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()
