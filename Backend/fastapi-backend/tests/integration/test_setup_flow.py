"""Integration tests for setup endpoints (Faculty, Subjects, Rooms, Labs, Sections, Mappings)"""
import pytest
import traceback


def test_faculty_crud(client):
    try:
        payload = {
            "name": "Dr. Test Faculty",
            "department": "Computer Science",
            "can_serve_as_lab_coordinator": True,
        }
        response = client.post("/api/setup/faculty", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == payload["name"]
        assert "id" in data
        faculty_id = data["id"]

        list_res = client.get("/api/setup/faculty")
        assert list_res.status_code == 200
        faculty_list = list_res.json()
        assert any(f["id"] == faculty_id for f in faculty_list)

        del_res = client.delete(f"/api/setup/faculty/{faculty_id}")
        assert del_res.status_code == 204
    except Exception as e:
        print("FACULTY_ERROR_TRACE:", traceback.format_exc())
        raise e


def test_subject_crud(client):
    try:
        payload = {
            "code": "TEST101",
            "name": "Test Subject",
            "department": "CSE",
            "year": 3,
            "weekly_lectures": 4,
            "requires_lab": False,
        }
        response = client.post("/api/setup/subjects", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["code"] == "TEST101"
        sub_id = data["id"]

        list_res = client.get("/api/setup/subjects")
        assert list_res.status_code == 200
        assert any(s["id"] == sub_id for s in list_res.json())

        del_res = client.delete(f"/api/setup/subjects/{sub_id}")
        assert del_res.status_code == 204
    except Exception as e:
        print("SUBJECT_ERROR_TRACE:", traceback.format_exc())
        raise e


def test_room_crud(client):
    try:
        payload = {
            "room_number": "R-999",
            "building": "Test Block",
            "capacity": 75,
            "is_lab": False,
        }
        response = client.post("/api/setup/rooms", json=payload)
        assert response.status_code == 201
        data = response.json()
        assert data["room_number"] == "R-999"
        room_id = data["id"]

        list_res = client.get("/api/setup/rooms")
        assert list_res.status_code == 200
        assert any(r["id"] == room_id for r in list_res.json())

        del_res = client.delete(f"/api/setup/rooms/{room_id}")
        assert del_res.status_code == 204
    except Exception as e:
        print("ROOM_ERROR_TRACE:", traceback.format_exc())
        raise e


def test_backend_generation_endpoint(client):
    try:
        response = client.post("/api/timetables/generate?department=CSE&year=3&section=A")
        assert response.status_code == 200
        data = response.json()
        assert data["department"] == "CSE"
        assert data["year"] == 3
        assert data["section"] == "A"
        assert "entries" in data
        assert len(data["entries"]) > 0
    except Exception as e:
        print("GENERATION_ERROR_TRACE:", traceback.format_exc())
        raise e
