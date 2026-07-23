"""Regression tests for complete admin timetable workflow"""
import pytest
from app.models import User, Timetable, TimetableEntry
from app.utils.security import hash_password


class TestAdminTimetableWorkflow:
    """Test complete admin journey: create → edit → submit → approve → publish"""

    @pytest.fixture
    def admin_user(self, db):
        """Create admin user"""
        user = User(
            id="A001",
            name="Admin",
            email="admin@test.edu",
            department="Administration",
            role="admin",
            password_hash=hash_password("admin123"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        return user

    @pytest.fixture
    def hod_user(self, db):
        """Create HOD user"""
        user = User(
            id="H001",
            name="HOD",
            email="hod@cse.edu",
            department="CSE",
            role="hod",
            password_hash=hash_password("hod123"),
            is_active=True,
        )
        db.add(user)
        db.commit()
        return user

    @pytest.fixture
    def admin_token(self, client, admin_user):
        """Get admin auth token"""
        response = client.post(
            "/api/auth/login",
            json={
                "identifier": "A001",
                "password": "admin123",
                "selectedRole": "admin",
            },
        )
        return response.json()["access_token"]

    @pytest.fixture
    def hod_token(self, client, hod_user):
        """Get HOD auth token"""
        response = client.post(
            "/api/auth/login",
            json={
                "identifier": "H001",
                "password": "hod123",
                "selectedRole": "hod",
            },
        )
        return response.json()["access_token"]

    def test_workflow_create_timetable(self, client, admin_token):
        """Step 1: Admin creates new timetable"""
        response = client.post(
            "/api/timetables",
            json={
                "department": "CSE",
                "year": 3,
                "section": "A",
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 201
        data = response.json()
        assert data["state"] == "draft"
        assert data["department"] == "CSE"
        assert data["year"] == 3
        assert data["section"] == "A"

        return data["id"]

    def test_workflow_add_entries(self, client, admin_token, db, admin_user):
        """Step 2: Admin adds entries to timetable"""
        # Create timetable
        tt_response = client.post(
            "/api/timetables",
            json={"department": "CSE", "year": 3, "section": "A"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        tt_id = tt_response.json()["id"]

        # Add entries
        response = client.patch(
            f"/api/timetables/{tt_id}",
            json={
                "entries": [
                    {
                        "day": "Monday",
                        "period_start": 1,
                        "period_end": 1,
                        "subject": "Data Structures",
                        "entry_type": "regular",
                        "faculty_id": "F1023",
                        "faculty_name": "Dr. Ramesh",
                        "room": "CSE-201",
                    }
                ]
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["entries"]) == 1
        assert data["entries"][0]["subject"] == "Data Structures"

    def test_workflow_send_for_approval(self, client, admin_token, db, admin_user):
        """Step 3: Admin submits timetable for approval"""
        # Create and populate timetable
        tt_response = client.post(
            "/api/timetables",
            json={"department": "CSE", "year": 3, "section": "A"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        tt_id = tt_response.json()["id"]

        client.patch(
            f"/api/timetables/{tt_id}",
            json={
                "entries": [
                    {
                        "day": "Monday",
                        "period_start": 1,
                        "period_end": 1,
                        "subject": "Data Structures",
                        "entry_type": "regular",
                        "faculty_id": "F1023",
                        "faculty_name": "Dr. Ramesh",
                        "room": "CSE-201",
                    }
                ]
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # Send for approval
        response = client.post(
            f"/api/timetables/{tt_id}/send-for-approval",
            json={"note": "Ready for review"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["state"] == "pending"
        assert data["note"] == "Ready for review"

    def test_workflow_hod_approve(self, client, admin_token, hod_token, db, admin_user):
        """Step 4: HOD approves timetable"""
        # Admin creates and submits
        tt_response = client.post(
            "/api/timetables",
            json={"department": "CSE", "year": 3, "section": "A"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        tt_id = tt_response.json()["id"]

        client.patch(
            f"/api/timetables/{tt_id}",
            json={
                "entries": [
                    {
                        "day": "Monday",
                        "period_start": 1,
                        "period_end": 1,
                        "subject": "Data Structures",
                        "entry_type": "regular",
                        "faculty_id": "F1023",
                        "faculty_name": "Dr. Ramesh",
                        "room": "CSE-201",
                    }
                ]
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        client.post(
            f"/api/timetables/{tt_id}/send-for-approval",
            json={"note": "Ready for review"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        # HOD approves
        response = client.post(
            f"/api/timetables/{tt_id}/approve",
            headers={"Authorization": f"Bearer {hod_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["state"] == "approved"

    def test_workflow_admin_publish(self, client, admin_token, hod_token, db, admin_user):
        """Step 5: Admin publishes approved timetable"""
        # Create, add entries, submit, approve
        tt_response = client.post(
            "/api/timetables",
            json={"department": "CSE", "year": 3, "section": "A"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        tt_id = tt_response.json()["id"]

        client.patch(
            f"/api/timetables/{tt_id}",
            json={
                "entries": [
                    {
                        "day": "Monday",
                        "period_start": 1,
                        "period_end": 1,
                        "subject": "Data Structures",
                        "entry_type": "regular",
                        "faculty_id": "F1023",
                        "faculty_name": "Dr. Ramesh",
                        "room": "CSE-201",
                    }
                ]
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        client.post(
            f"/api/timetables/{tt_id}/send-for-approval",
            json={"note": "Ready for review"},
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        client.post(
            f"/api/timetables/{tt_id}/approve",
            headers={"Authorization": f"Bearer {hod_token}"},
        )

        # Admin publishes
        response = client.post(
            f"/api/timetables/{tt_id}/publish",
            headers={"Authorization": f"Bearer {admin_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert data["state"] == "published"
