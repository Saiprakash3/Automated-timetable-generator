"""Integration tests for authentication flow"""
import pytest
from app.models import User
from app.utils.security import hash_password


class TestLoginFlow:
    """Test complete login workflow"""

    @pytest.fixture
    def test_admin(self, db):
        """Create a test admin user"""
        user = User(
            id="A001",
            name="Admin User",
            email="admin@test.edu",
            department="Administration",
            role="admin",
            password_hash=hash_password("admin123"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        return user

    def test_login_success(self, client, test_admin):
        """Admin login with correct credentials should succeed"""
        response = client.post(
            "/api/auth/login",
            json={
                "identifier": "A001",
                "password": "admin123",
                "selectedRole": "admin",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["user"]["id"] == "A001"
        assert data["user"]["role"] == "admin"

    def test_login_invalid_credentials(self, client, test_admin):
        """Login with wrong password should fail"""
        response = client.post(
            "/api/auth/login",
            json={
                "identifier": "A001",
                "password": "wrongpassword",
                "selectedRole": "admin",
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert data["detail"]["error"]["code"] == "INVALID_CREDENTIALS"

    def test_login_role_mismatch(self, client, test_admin):
        """Login with correct password but mismatched role should fail"""
        response = client.post(
            "/api/auth/login",
            json={
                "identifier": "A001",
                "password": "admin123",
                "selectedRole": "faculty",  # Wrong role
            },
        )

        assert response.status_code == 401
        data = response.json()
        assert data["detail"]["error"]["code"] == "ROLE_MISMATCH"

    def test_login_nonexistent_user(self, client):
        """Login for non-existent user should fail"""
        response = client.post(
            "/api/auth/login",
            json={
                "identifier": "NOTEXIST",
                "password": "somepassword",
                "selectedRole": "admin",
            },
        )

        assert response.status_code == 401


class TestGetCurrentUser:
    """Test GET /api/auth/me endpoint"""

    @pytest.fixture
    def admin_with_token(self, client, db):
        """Create admin and get valid token"""
        user = User(
            id="A001",
            name="Admin User",
            email="admin@test.edu",
            department="Administration",
            role="admin",
            password_hash=hash_password("admin123"),
            is_active=True,
        )
        db.add(user)
        db.commit()

        # Login to get token
        response = client.post(
            "/api/auth/login",
            json={
                "identifier": "A001",
                "password": "admin123",
                "selectedRole": "admin",
            },
        )
        token = response.json()["access_token"]
        return user, token

    def test_get_current_user_with_valid_token(self, client, admin_with_token):
        """GET /me with valid token should return user"""
        user, token = admin_with_token

        response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == "A001"
        assert data["name"] == "Admin User"
        assert data["role"] == "admin"

    def test_get_current_user_without_token(self, client):
        """GET /me without token should fail"""
        response = client.get("/api/auth/me")

        assert response.status_code == 401

    def test_get_current_user_invalid_token(self, client):
        """GET /me with invalid token should fail"""
        response = client.get(
            "/api/auth/me",
            headers={"Authorization": "Bearer invalid.token.here"},
        )

        assert response.status_code == 401


class TestLogout:
    """Test logout and token blacklist"""

    @pytest.fixture
    def admin_with_token(self, client, db):
        """Create admin and get valid token"""
        user = User(
            id="A001",
            name="Admin User",
            email="admin@test.edu",
            department="Administration",
            role="admin",
            password_hash=hash_password("admin123"),
            is_active=True,
        )
        db.add(user)
        db.commit()

        response = client.post(
            "/api/auth/login",
            json={
                "identifier": "A001",
                "password": "admin123",
                "selectedRole": "admin",
            },
        )
        token = response.json()["access_token"]
        return user, token

    def test_logout_success(self, client, admin_with_token):
        """Logout should succeed and return success message"""
        user, token = admin_with_token

        response = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["success"] is True

    def test_logout_blacklists_token(self, client, admin_with_token):
        """After logout, token should be blacklisted"""
        user, token = admin_with_token

        # Logout
        logout_response = client.post(
            "/api/auth/logout",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert logout_response.status_code == 200

        # Try to use the same token again
        me_response = client.get(
            "/api/auth/me",
            headers={"Authorization": f"Bearer {token}"},
        )
        assert me_response.status_code == 401
