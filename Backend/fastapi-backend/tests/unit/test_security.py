"""Unit tests for security utilities"""
import pytest
from app.utils.security import hash_password, verify_password
from app.utils.tokens import create_access_token, create_refresh_token, verify_token
from datetime import timedelta


class TestPasswordSecurity:
    """Test password hashing and verification"""

    def test_hash_password_creates_hash(self):
        """Password should be hashed, not stored as plain text"""
        password = "test_password_123"
        hashed = hash_password(password)

        assert hashed != password
        assert len(hashed) > 20

    def test_hash_password_different_each_time(self):
        """Each hash should be different (due to salt)"""
        password = "test_password_123"
        hash1 = hash_password(password)
        hash2 = hash_password(password)

        assert hash1 != hash2

    def test_verify_password_correct(self):
        """Correct password should verify"""
        password = "correct_password"
        hashed = hash_password(password)

        assert verify_password(password, hashed) is True

    def test_verify_password_incorrect(self):
        """Incorrect password should not verify"""
        password = "correct_password"
        wrong_password = "wrong_password"
        hashed = hash_password(password)

        assert verify_password(wrong_password, hashed) is False


class TestJWTTokens:
    """Test JWT token creation and verification"""

    def test_create_access_token(self):
        """Access token should be created with correct payload"""
        data = {"sub": "user123", "role": "admin"}
        token = create_access_token(data, expires_delta=timedelta(minutes=15))

        assert token
        assert isinstance(token, str)
        assert token.count(".") == 2  # JWT has 3 parts separated by dots

    def test_create_refresh_token(self):
        """Refresh token should be created with type='refresh'"""
        data = {"sub": "user123", "role": "admin"}
        token = create_refresh_token(data, expires_delta=timedelta(days=7))

        assert token
        assert isinstance(token, str)

    def test_verify_valid_access_token(self):
        """Valid access token should verify"""
        data = {"sub": "user123", "role": "admin"}
        token = create_access_token(data, expires_delta=timedelta(minutes=15))

        payload = verify_token(token, token_type="access")
        assert payload["sub"] == "user123"
        assert payload["role"] == "admin"

    def test_verify_valid_refresh_token(self):
        """Valid refresh token should verify"""
        data = {"sub": "user123", "role": "admin"}
        token = create_refresh_token(data, expires_delta=timedelta(days=7))

        payload = verify_token(token, token_type="refresh")
        assert payload["sub"] == "user123"

    def test_verify_invalid_token(self):
        """Invalid token should return None"""
        token = "invalid.token.here"

        payload = verify_token(token, token_type="access")
        assert payload is None

    def test_verify_wrong_token_type(self):
        """Token verified with wrong type should return None"""
        data = {"sub": "user123"}
        access_token = create_access_token(data, expires_delta=timedelta(minutes=15))

        payload = verify_token(access_token, token_type="refresh")
        assert payload is None
