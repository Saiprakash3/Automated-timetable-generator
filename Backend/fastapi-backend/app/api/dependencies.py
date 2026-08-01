"""API endpoint dependencies"""
from fastapi import Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.services.auth_service import AuthService
from app.models import User


async def get_token(authorization: Optional[str] = Header(None)) -> str:
    """Extract token from Authorization header"""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": "UNAUTHENTICATED",
                    "message": "Missing or invalid token.",
                }
            },
        )
    return authorization.split(" ")[1]


async def get_current_user(
    token: str = Depends(get_token),
    db: Session = Depends(get_db),
) -> User:
    """Get current authenticated user from token"""
    try:
        user = AuthService.get_current_user(db, token)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": str(e),
                    "message": "Missing or invalid token.",
                }
            },
        )


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verify current user is admin"""
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "Admin access required.",
                }
            },
        )
    return current_user


async def get_current_hod(
    current_user: User = Depends(get_current_user),
) -> User:
    """Verify current user is HOD"""
    if current_user.role != "hod":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": "FORBIDDEN",
                    "message": "HOD access required.",
                }
            },
        )
    return current_user
