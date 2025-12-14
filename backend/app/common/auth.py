"""Clerk JWT authentication middleware for FastAPI."""

import logging
import time
from dataclasses import dataclass
from typing import Annotated

import httpx
import jwt
from cryptography.hazmat.primitives.asymmetric.rsa import RSAPublicKey
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.config import get_settings

logger = logging.getLogger(__name__)

# HTTP Bearer token security scheme
security = HTTPBearer(auto_error=False)

# JWKS cache TTL in seconds (5 minutes)
_JWKS_CACHE_TTL = 300


@dataclass
class AuthenticatedUser:
    """Represents an authenticated user from Clerk."""

    user_id: str
    email: str | None = None
    first_name: str | None = None
    last_name: str | None = None


# Cache for Clerk JWKS (JSON Web Key Set)
_jwks_cache: dict | None = None
_jwks_cache_time: float = 0


async def _fetch_clerk_jwks() -> dict:
    """Fetch Clerk's JWKS from the API."""
    settings = get_settings()
    if not settings.clerk_secret_key:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Clerk secret key not configured",
        )

    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://api.clerk.com/v1/jwks",
                headers={"Authorization": f"Bearer {settings.clerk_secret_key}"},
            )
            response.raise_for_status()
            return response.json()
    except httpx.HTTPError as e:
        logger.error("Failed to fetch Clerk JWKS: %s", e)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify authentication",
        ) from e


async def _get_clerk_jwks(force_refresh: bool = False) -> dict:
    """Fetch Clerk's JWKS for JWT verification.

    Args:
        force_refresh: If True, bypass cache and fetch fresh JWKS.

    Returns cached version if available and not expired.
    """
    global _jwks_cache, _jwks_cache_time

    now = time.time()
    cache_expired = (now - _jwks_cache_time) > _JWKS_CACHE_TTL

    if not force_refresh and _jwks_cache is not None and not cache_expired:
        return _jwks_cache

    _jwks_cache = await _fetch_clerk_jwks()
    _jwks_cache_time = now
    return _jwks_cache


def _find_signing_key(jwks: dict, kid: str) -> RSAPublicKey | None:
    """Find the signing key in JWKS that matches the given kid."""
    from jwt.algorithms import RSAAlgorithm

    for key in jwks.get("keys", []):
        if key.get("kid") == kid:
            rsa_key = RSAAlgorithm.from_jwk(key)
            if isinstance(rsa_key, RSAPublicKey):
                return rsa_key
    return None


async def _get_signing_key(token: str) -> RSAPublicKey:
    """Get the signing key from JWKS that matches the token's kid.

    If the key is not found in cache, refreshes the JWKS and retries.
    """
    try:
        unverified_header = jwt.get_unverified_header(token)
        kid = unverified_header.get("kid")

        if not kid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token missing key ID",
            )

        # Try with cached JWKS first
        jwks = await _get_clerk_jwks(force_refresh=False)
        signing_key = _find_signing_key(jwks, kid)

        if signing_key is not None:
            return signing_key

        # Key not found - refresh JWKS and retry (handles key rotation)
        logger.info("Signing key not found in cache, refreshing JWKS")
        jwks = await _get_clerk_jwks(force_refresh=True)
        signing_key = _find_signing_key(jwks, kid)

        if signing_key is not None:
            return signing_key

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Unable to find signing key",
        )
    except jwt.exceptions.DecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token format",
        ) from e


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> AuthenticatedUser:
    """Dependency to get the current authenticated user from Clerk JWT.

    Args:
        credentials: The HTTP Bearer credentials from the request.

    Returns:
        AuthenticatedUser with user details from the JWT.

    Raises:
        HTTPException: If authentication fails.
    """
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token = credentials.credentials

    try:
        # Get signing key (handles JWKS caching and refresh)
        signing_key = await _get_signing_key(token)

        # Verify and decode the JWT
        # Add leeway to handle clock skew between servers
        payload = jwt.decode(
            token,
            signing_key,
            algorithms=["RS256"],
            options={"verify_aud": False},  # Clerk tokens may not have aud
            leeway=60,  # Allow 60 seconds of clock skew
        )

        # Extract user info from Clerk JWT claims
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: missing user ID",
            )

        return AuthenticatedUser(
            user_id=user_id,
            email=payload.get("email"),
            first_name=payload.get("first_name"),
            last_name=payload.get("last_name"),
        )

    except jwt.ExpiredSignatureError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        ) from e
    except jwt.InvalidTokenError as e:
        logger.warning("Invalid JWT token: %s", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication token",
        ) from e


async def get_optional_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)],
) -> AuthenticatedUser | None:
    """Dependency to optionally get the current user.

    Returns None if no valid authentication is provided instead of raising.
    """
    if credentials is None:
        return None

    try:
        return await get_current_user(credentials)
    except HTTPException:
        return None
