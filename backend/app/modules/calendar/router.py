"""Calendar OAuth router for Google Calendar integration."""

import logging
import os
import uuid
from typing import Any

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request, status
from google_auth_oauthlib.flow import Flow  # type: ignore[import-untyped]

# Allow Google to add additional scopes (like 'openid') during OAuth flow
os.environ.setdefault("OAUTHLIB_RELAX_TOKEN_SCOPE", "1")

from app.common.auth import AuthenticatedUser, get_current_user
from app.config import get_settings
from app.modules.shops.service import get_shop_config_by_owner

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/calendar", tags=["calendar"])

_settings = get_settings()

# Google OAuth scopes
SCOPES = [
    "openid",  # Required when requesting userinfo scopes
    "https://www.googleapis.com/auth/calendar",
    "https://www.googleapis.com/auth/userinfo.email",  # To get user email
]


def _get_oauth_flow(redirect_uri: str) -> Flow:
    """Create OAuth flow for Google Calendar.

    Args:
        redirect_uri: OAuth redirect URI

    Returns:
        Configured OAuth flow
    """
    return Flow.from_client_config(
        {
            "web": {
                "client_id": _settings.google_client_id,
                "client_secret": _settings.google_client_secret,
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
                "redirect_uris": [redirect_uri],
            }
        },
        scopes=SCOPES,
        redirect_uri=redirect_uri,
    )


@router.get("/google/auth")
async def initiate_google_auth(
    request: Request,
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Initiate Google Calendar OAuth flow.

    Returns:
        Authorization URL to redirect user to
    """
    # Get shop config
    shop_config = await get_shop_config_by_owner(user.user_id)
    if not shop_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop configuration not found",
        )

    # Build redirect URI
    base_url = str(request.base_url).rstrip("/")
    redirect_uri = f"{base_url}/api/calendar/google/callback"

    # Create OAuth flow
    flow = _get_oauth_flow(redirect_uri)

    # Generate authorization URL with user_id in state
    state = f"{user.user_id}:{uuid.uuid4().hex[:16]}"
    authorization_url, _ = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",  # Force consent to get refresh token
        state=state,
    )

    return {"authorization_url": authorization_url}


@router.get("/google/callback")
async def handle_google_callback(
    request: Request,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> dict[str, Any]:
    """Handle Google OAuth callback.

    Args:
        code: Authorization code from Google
        state: OAuth state parameter (should contain user_id)
        error: Error from OAuth flow (if any)

    Returns:
        Success message with redirect instructions
    """
    if error:
        logger.error("OAuth error: %s", error)
        return {
            "success": False,
            "error": error,
            "message": "Authorization failed. Please try again.",
        }

    if not code:
        return {
            "success": False,
            "error": "Missing authorization code",
            "message": "Invalid OAuth callback. Please try again.",
        }

    # Build redirect URI
    base_url = str(request.base_url).rstrip("/")
    redirect_uri = f"{base_url}/api/calendar/google/callback"

    try:
        # Create OAuth flow and exchange code for tokens
        flow = _get_oauth_flow(redirect_uri)
        flow.fetch_token(code=code)

        credentials = flow.credentials

        # Extract user_id from state (format: "user_id:random_string")
        # For now, we'll need to find the shop by checking all shops with pending OAuth
        # In production, you'd store state in a session or include user_id in state
        # This is a simplified implementation - you may want to use sessions
        user_id = None
        if state:
            # Try to extract user_id from state
            parts = state.split(":", 1)
            if len(parts) == 2:
                user_id = parts[0]

        if not user_id:
            # Fallback: try to find shop with matching state in credentials
            # This is not ideal but works for MVP
            return {
                "success": False,
                "error": "Could not identify user",
                "message": "Please complete OAuth from the settings page while logged in.",
            }

        # Get shop config
        shop_config = await get_shop_config_by_owner(user_id)
        if not shop_config:
            return {
                "success": False,
                "error": "Shop configuration not found",
                "message": "Please set up your shop first.",
            }

        # Fetch user email from Google
        user_email = None
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(
                    "https://www.googleapis.com/oauth2/v2/userinfo",
                    headers={"Authorization": f"Bearer {credentials.token}"},
                    timeout=5.0,
                )
                logger.info("Google userinfo response status: %s", response.status_code)
                if response.status_code == 200:
                    user_info = response.json()
                    logger.info("Google userinfo response: %s", user_info)
                    user_email = user_info.get("email")
                    logger.info("Fetched user email from Google: %s", user_email)
                else:
                    logger.error(
                        "Failed to fetch email from Google. Status: %s, Response: %s",
                        response.status_code,
                        response.text,
                    )
        except Exception as e:
            logger.error("Exception while fetching user email from Google: %s", e, exc_info=True)

        # Store credentials
        shop_config.settings.calendar_settings.credentials = {
            "access_token": credentials.token,
            "refresh_token": credentials.refresh_token,
            "token_uri": "https://oauth2.googleapis.com/token",  # Standard Google OAuth token URI
            "client_id": credentials.client_id,
            "client_secret": credentials.client_secret,
            "scopes": credentials.scopes,
            "expires_at": credentials.expiry.isoformat() if credentials.expiry else None,
            "email": user_email,  # Store the email we fetched
        }
        shop_config.settings.calendar_settings.provider = "google"

        await shop_config.save()

        return {
            "success": True,
            "message": "Google Calendar connected successfully! You can close this window.",
        }

    except Exception as e:
        logger.exception("Error handling OAuth callback: %s", e)
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to complete authorization.",
        }


@router.post("/google/disconnect")
async def disconnect_google_calendar(
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Disconnect Google Calendar integration.

    Clears stored OAuth tokens.
    """
    shop_config = await get_shop_config_by_owner(user.user_id)
    if not shop_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop configuration not found",
        )

    # Clear calendar credentials
    shop_config.settings.calendar_settings.credentials = {}
    shop_config.settings.calendar_settings.provider = "none"
    shop_config.settings.calendar_settings.mode = "read_only"

    await shop_config.save()

    return {"success": True, "message": "Google Calendar disconnected"}


@router.get("/google/status")
async def get_google_status(
    user: AuthenticatedUser = Depends(get_current_user),
) -> dict[str, Any]:
    """Get Google Calendar connection status.

    Returns:
        Connection status and email (if connected)
    """
    shop_config = await get_shop_config_by_owner(user.user_id)
    if not shop_config:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shop configuration not found",
        )

    calendar_settings = shop_config.settings.calendar_settings
    credentials = calendar_settings.credentials

    if calendar_settings.provider != "google" or not credentials.get("access_token"):
        return {
            "connected": False,
            "provider": calendar_settings.provider,
        }

    # Get email from stored credentials, or try to fetch it if missing
    email = credentials.get("email")

    # If email is not stored or is "Unknown", try to fetch it from Google
    if not email or email == "Unknown":
        access_token = credentials.get("access_token")
        if access_token:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.get(
                        "https://www.googleapis.com/oauth2/v2/userinfo",
                        headers={"Authorization": f"Bearer {access_token}"},
                        timeout=5.0,
                    )
                    logger.info("Google userinfo status check - Status: %s", response.status_code)
                    if response.status_code == 200:
                        user_info = response.json()
                        logger.info("Google userinfo data: %s", user_info)
                        fetched_email = user_info.get("email")
                        # Update credentials with the email for future requests
                        if fetched_email:
                            credentials["email"] = fetched_email
                            shop_config.settings.calendar_settings.credentials = credentials
                            await shop_config.save()
                            email = fetched_email
                            logger.info("Fetched and stored email from Google: %s", email)
                        else:
                            logger.warning("Email not found in userinfo response: %s", user_info)
                    else:
                        logger.error(
                            "Failed to fetch email. Status: %s, Response: %s",
                            response.status_code,
                            response.text,
                        )
            except Exception as e:
                logger.error(
                    "Exception while fetching email from Google userinfo: %s", e, exc_info=True
                )
                email = None

    return {
        "connected": True,
        "provider": "google",
        "email": email,
    }
