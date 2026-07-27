"""Authentication business logic"""
from sqlalchemy.orm import Session
from datetime import timedelta
from app.models import User
from app.utils.security import verify_password
from app.utils.tokens import (
    create_access_token,
    create_refresh_token,
    verify_token,
    blacklist_token,
)
from app.schemas.auth import LoginRequest


class AuthService:
    """Handle authentication logic"""

    @staticmethod
    def login(db: Session, request: LoginRequest) -> dict:
        """
        Authenticate user and return dual tokens

        Raises:
            ValueError: If credentials invalid or role mismatch
        """
        # Find user by identifier (ID or email)
        user = db.query(User).filter(
            (User.id == request.identifier) | (User.email == request.identifier)
        ).first()

        if not user:
            raise ValueError("INVALID_CREDENTIALS")

        # Verify password
        if not verify_password(request.password, user.password_hash):
            raise ValueError("INVALID_CREDENTIALS")

        # Verify role matches
        if user.role != request.selectedRole:
            raise ValueError("ROLE_MISMATCH")

        # Generate tokens (industry-standard dual-token approach)
        access_token = create_access_token(
            data={"sub": user.id, "role": user.role},
            expires_delta=timedelta(minutes=15),
        )

        refresh_token = create_refresh_token(
            data={"sub": user.id, "role": user.role},
            expires_delta=timedelta(days=7),
        )

        # Return response with dual tokens
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": 900,  # 15 minutes in seconds
            "user": {
                "id": user.id,
                "name": user.name,
                "role": user.role,
                "department": user.department,
                "email": user.email,
            },
        }

    @staticmethod
    def logout(token: str) -> dict:
        """
        Logout user by blacklisting token

        Returns:
            Success response
        """
        blacklist_token(token)
        return {
            "success": True,
            "message": "Logged out successfully",
        }

    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> dict:
        """
        Refresh access token using refresh token

        Raises:
            ValueError: If refresh token invalid

        Returns:
            New tokens
        """
        # Verify refresh token
        payload = verify_token(refresh_token, token_type="refresh")

        if not payload:
            raise ValueError("INVALID_REFRESH_TOKEN")

        user_id = payload.get("sub")

        # Get user from database (verify still exists)
        user = db.query(User).filter(User.id == user_id).first()

        if not user or user.deleted_at is not None:
            raise ValueError("INVALID_REFRESH_TOKEN")

        # Generate new tokens
        access_token = create_access_token(
            data={"sub": user.id, "role": user.role},
            expires_delta=timedelta(minutes=15),
        )

        new_refresh_token = create_refresh_token(
            data={"sub": user.id, "role": user.role},
            expires_delta=timedelta(days=7),
        )

        # Blacklist old refresh token (rotation)
        blacklist_token(refresh_token)

        return {
            "access_token": access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": 900,  # 15 minutes in seconds
        }

    @staticmethod
    def get_current_user(db: Session, token: str) -> User:
        """
        Get current user from token

        Raises:
            ValueError: If token invalid

        Returns:
            User object
        """
        # Verify access token
        payload = verify_token(token, token_type="access")

        if not payload:
            raise ValueError("UNAUTHENTICATED")

        user_id = payload.get("sub")

        # Get user from database
        user = db.query(User).filter(User.id == user_id).first()

        if not user or user.deleted_at is not None:
            raise ValueError("UNAUTHENTICATED")

        return user
