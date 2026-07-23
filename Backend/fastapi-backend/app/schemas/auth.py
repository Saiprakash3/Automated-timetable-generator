"""Authentication request/response schemas"""
from pydantic import BaseModel, Field
from typing import Optional


class LoginRequest(BaseModel):
    """Login request payload"""
    identifier: str = Field(..., description="User ID (e.g., F1023, H001, A001)")
    password: str = Field(..., description="User password")
    selectedRole: str = Field(..., description="Selected role (admin, hod, faculty, lab_coordinator, student)")


class UserResponse(BaseModel):
    """User response (no password)"""
    id: str
    name: str
    role: str
    department: str
    email: Optional[str] = None


class LoginResponse(BaseModel):
    """Login response with dual tokens (access + refresh)"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse


class LogoutRequest(BaseModel):
    """Logout request"""
    pass


class LogoutResponse(BaseModel):
    """Logout response"""
    success: bool = True
    message: str = "Logged out successfully"


class RefreshTokenRequest(BaseModel):
    """Refresh token request"""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Refresh token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class TokenPayload(BaseModel):
    """JWT token payload"""
    sub: str  # subject (user id)
    role: Optional[str] = None
    exp: Optional[int] = None  # expiration
    iat: Optional[int] = None  # issued at
    type: Optional[str] = "access"  # access or refresh
