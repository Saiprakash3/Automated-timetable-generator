"""Authentication endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import (
    LoginRequest,
    LoginResponse,
    LogoutResponse,
    RefreshTokenRequest,
    RefreshTokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService
from app.api.dependencies import get_token, get_current_user
from app.models import User

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    db: Session = Depends(get_db),
):
    """
    User login endpoint

    Returns:
        - access_token: JWT access token (15 minutes)
        - refresh_token: JWT refresh token (7 days)
        - user: Current user info
    """
    try:
        response = AuthService.login(db, request)
        return response

    except ValueError as e:
        error_code = str(e)
        if error_code == "INVALID_CREDENTIALS":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "INVALID_CREDENTIALS",
                        "message": "The ID or password entered is incorrect.",
                    }
                },
            )
        elif error_code == "ROLE_MISMATCH":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={
                    "error": {
                        "code": "ROLE_MISMATCH",
                        "message": "This account is not registered as the selected role.",
                    }
                },
            )


@router.post("/logout", response_model=LogoutResponse)
async def logout(
    token: str = Depends(get_token),
):
    """
    User logout endpoint

    Blacklists the token so it can't be used again
    """
    response = AuthService.logout(token)
    return response


@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: User = Depends(get_current_user),
):
    """
    Get current authenticated user

    Returns current user info from valid token
    """
    return UserResponse(
        id=current_user.id,
        name=current_user.name,
        role=current_user.role,
        department=current_user.department,
        email=current_user.email,
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db),
):
    """
    Refresh access token

    Use refresh token to get new access + refresh tokens
    """
    try:
        response = AuthService.refresh_access_token(db, request.refresh_token)
        return response

    except ValueError as e:
        error_code = str(e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "INVALID_REFRESH_TOKEN",
                    "message": "Refresh token is invalid or expired.",
                }
            },
        )
