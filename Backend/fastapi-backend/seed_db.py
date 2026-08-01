"""Seed database with mock data from db.json"""
import json
import sys
from datetime import datetime
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.base import Base
from app.models import User, Timetable, TimetableEntry
from app.utils.security import hash_password

# Load mock data
with open("../mock-backend/db.json", "r") as f:
    mock_data = json.load(f)

# Create tables
Base.metadata.create_all(bind=engine)
Session = sessionmaker(bind=engine)
db = Session()

try:
    # Clear existing data
    print("Clearing existing data...")
    db.query(TimetableEntry).delete()
    db.query(Timetable).delete()
    db.query(User).delete()
    db.commit()
    print("Cleared all existing data")

    # Seed users
    print("Seeding users...")
    for user_data in mock_data["users"]:
        user = User(
            id=user_data["id"],
            name=user_data["name"],
            email=f"{user_data['id'].lower()}@test.edu",
            department=user_data.get("department", ""),
            role=user_data["role"],
            password_hash=hash_password(user_data["password"]),
            is_active=True,
        )
        db.add(user)
    db.commit()
    print(f"Added {len(mock_data['users'])} users")

    # Seed timetables and entries
    print("Seeding timetables...")
    for tt_data in mock_data["timetables"]:
        timetable = Timetable(
            id=tt_data["id"],
            department=tt_data["department"],
            year=tt_data["year"],
            section=tt_data["section"],
            state=tt_data["state"],
            created_by=tt_data["createdBy"],
            created_at=datetime.fromisoformat(tt_data["createdAt"].replace("Z", "+00:00")),
            updated_at=datetime.fromisoformat(tt_data["updatedAt"].replace("Z", "+00:00")),
            approved_by=tt_data.get("approvedBy"),
            approved_at=datetime.fromisoformat(tt_data["approvedAt"].replace("Z", "+00:00")) if tt_data.get("approvedAt") else None,
            published_by=tt_data.get("publishedBy"),
            published_at=datetime.fromisoformat(tt_data["publishedAt"].replace("Z", "+00:00")) if tt_data.get("publishedAt") else None,
        )
        db.add(timetable)
        db.flush()

        # Add entries for this timetable
        for entry_data in tt_data.get("entries", []):
            entry = TimetableEntry(
                id=entry_data["id"],
                timetable_id=timetable.id,
                day=entry_data["day"],
                period_start=entry_data["periodStart"],
                period_end=entry_data["periodEnd"],
                subject=entry_data["subject"],
                entry_type=entry_data["type"],
                faculty_id=entry_data.get("facultyId"),
                faculty_name=entry_data.get("facultyName"),
                lab_coordinator_id=entry_data.get("labCoordinatorId"),
                room=entry_data["room"],
                basket=entry_data.get("basket"),
                applicable_years=entry_data.get("applicableYears"),
            )
            db.add(entry)

    db.commit()
    print(f"Added {len(mock_data['timetables'])} timetables with entries")

    print("\nDatabase seeding complete!")
    print("\nMock Data Summary:")
    print(f"  Users: {len(mock_data['users'])}")
    for user in mock_data["users"]:
        print(f"    - {user['id']}: {user['name']} ({user['role']})")
    print(f"\n  Timetables: {len(mock_data['timetables'])}")
    for tt in mock_data["timetables"]:
        print(f"    - {tt['id']}: {tt['department']} Year {tt['year']} ({tt['state']})")

except Exception as e:
    print(f"Error seeding database: {e}")
    db.rollback()
    sys.exit(1)
finally:
    db.close()
