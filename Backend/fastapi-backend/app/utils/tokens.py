"""Token management: generation, validation, blacklist"""
from datetime import datetime, timedelta
from typing import Optional, Set
from jose import JWTError, jwt
from app.config import settings

# In-memory token blacklist (tokens that have been logged out)
# In production, use Redis
TOKEN_BLACKLIST: Set[str] = set()


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT access token (15 minutes)"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "access"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    return encoded_jwt


def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create JWT refresh token (7 days)"""
    to_encode = data.copy()

    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=7)

    to_encode.update({
        "exp": expire,
        "iat": datetime.utcnow(),
        "type": "refresh"
    })

    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret_key,
        algorithm=settings.jwt_algorithm,
    )

    return encoded_jwt


def verify_token(token: str, token_type: str = "access") -> Optional[dict]:
    """Verify JWT token and return payload"""
    try:
        # Check if token is blacklisted
        if is_token_blacklisted(token):
            return None

        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )

        # Verify token type
        if payload.get("type") != token_type:
            return None

        return payload

    except JWTError:
        return None


def blacklist_token(token: str) -> None:
    """Add token to blacklist on logout"""
    TOKEN_BLACKLIST.add(token)


def is_token_blacklisted(token: str) -> bool:
    """Check if token is blacklisted"""
    return token in TOKEN_BLACKLIST


def clear_blacklist() -> None:
    """Clear all blacklisted tokens (for testing)"""
    TOKEN_BLACKLIST.clear()
