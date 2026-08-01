"""Seed data for testing and development"""
from datetime import datetime
from app.utils.security import hash_password
from app.models import User, Timetable, TimetableEntry, ApprovalLog


# Test Users
USERS_DATA = [
    {
        "id": "A001",
        "name": "Suresh Patnaik",
        "email": "admin@institution.edu",
        "department": "Administration",
        "role": "admin",
        "password": "admin123",
    },
    {
        "id": "H001",
        "name": "Dr. Lakshmi Prasad",
        "email": "hod@cse.edu",
        "department": "CSE",
        "role": "hod",
        "password": "hod123",
    },
    {
        "id": "F1023",
        "name": "Dr. Ramesh Kumar",
        "email": "ramesh@cse.edu",
        "department": "CSE",
        "role": "faculty",
        "password": "fac123",
    },
    {
        "id": "F1088",
        "name": "Dr. Anitha Rao",
        "email": "anitha@cse.edu",
        "department": "CSE",
        "role": "faculty",
        "password": "fac123",
    },
    {
        "id": "F1099",
        "name": "Dr. Vijay Singh",
        "email": "vijay@cse.edu",
        "department": "CSE",
        "role": "faculty",
        "password": "fac123",
    },
    {
        "id": "LC004",
        "name": "K. Srinivas",
        "email": "srinivas@cse.edu",
        "department": "CSE",
        "role": "lab_coordinator",
        "password": "labco123",
    },
    {
        "id": "LC005",
        "name": "Dr. Anitha Rao",
        "email": "anitha.lab@cse.edu",
        "department": "CSE",
        "role": "lab_coordinator",
        "password": "labco123",
    },
    {
        "id": "S3021",
        "name": "P. Naveen",
        "email": "naveen@student.edu",
        "department": "CSE",
        "role": "student",
        "password": "stu123",
    },
]


def create_users(db):
    """Create seed users"""
    users = []
    for user_data in USERS_DATA:
        user = User(
            id=user_data["id"],
            name=user_data["name"],
            email=user_data.get("email"),
            department=user_data["department"],
            role=user_data["role"],
            password_hash=hash_password(user_data["password"]),
            is_active=True,
            created_at=datetime.utcnow(),
        )
        users.append(user)
        db.add(user)

    db.commit()
    return users


def create_sample_timetables(db):
    """Create sample timetables"""
    timetables = []

    # Sample Timetable 1: CSE 3A (Draft)
    tt1 = Timetable(
        id="tt_2026_cse_3a",
        department="CSE",
        year=3,
        section="A",
        state="draft",
        created_by="A001",
        created_at=datetime.utcnow(),
    )
    db.add(tt1)
    timetables.append(tt1)

    # Sample Timetable 2: CSE 4A (Pending)
    tt2 = Timetable(
        id="tt_2026_cse_4a",
        department="CSE",
        year=4,
        section="A",
        state="pending",
        created_by="A001",
        created_at=datetime.utcnow(),
        submitted_by="A001",
        submitted_at=datetime.utcnow(),
        submission_note="All labs scheduled in second half",
    )
    db.add(tt2)
    timetables.append(tt2)

    # Sample Timetable 3: CSE 2A (Published)
    tt3 = Timetable(
        id="tt_2026_cse_2a",
        department="CSE",
        year=2,
        section="A",
        state="published",
        created_by="A001",
        created_at=datetime.utcnow(),
        approved_by="H001",
        approved_at=datetime.utcnow(),
        published_by="A001",
        published_at=datetime.utcnow(),
    )
    db.add(tt3)
    timetables.append(tt3)

    db.commit()
    return timetables


def create_sample_entries(db):
    """Create sample timetable entries"""
    entries = []

    # Entries for CSE 3A
    entry1 = TimetableEntry(
        id="entry_001",
        timetable_id="tt_2026_cse_3a",
        day="Monday",
        period_start=1,
        period_end=1,
        subject="Data Structures",
        entry_type="regular",
        faculty_id="F1023",
        faculty_name="Dr. Ramesh Kumar",
        room="CSE-201",
    )
    db.add(entry1)
    entries.append(entry1)

    entry2 = TimetableEntry(
        id="entry_002",
        timetable_id="tt_2026_cse_3a",
        day="Monday",
        period_start=4,
        period_end=6,
        subject="DBMS Lab",
        entry_type="lab",
        faculty_id="F1088",
        faculty_name="Dr. Anitha Rao",
        lab_coordinator_id="LC004",
        room="CSE-Lab-2",
    )
    db.add(entry2)
    entries.append(entry2)

    entry3 = TimetableEntry(
        id="entry_003",
        timetable_id="tt_2026_cse_3a",
        day="Wednesday",
        period_start=5,
        period_end=5,
        subject="Cloud Computing",
        entry_type="elective",
        faculty_id="F1099",
        faculty_name="Dr. Vijay Singh",
        room="CSE-305",
        basket="B",
        applicable_years=[3, 4],
    )
    db.add(entry3)
    entries.append(entry3)

    # Entries for CSE 2A
    entry4 = TimetableEntry(
        id="entry_201",
        timetable_id="tt_2026_cse_2a",
        day="Monday",
        period_start=1,
        period_end=1,
        subject="Discrete Mathematics",
        entry_type="regular",
        faculty_id="F1023",
        faculty_name="Dr. Ramesh Kumar",
        room="CSE-101",
    )
    db.add(entry4)
    entries.append(entry4)

    db.commit()
    return entries


def seed_database(db):
    """Seed database with sample data"""
    try:
        # Create users
        print("Creating users...")
        create_users(db)
        print(f"✅ {len(USERS_DATA)} users created")

        # Create sample timetables
        print("Creating sample timetables...")
        timetables = create_sample_timetables(db)
        print(f"✅ {len(timetables)} timetables created")

        # Create sample entries
        print("Creating sample entries...")
        entries = create_sample_entries(db)
        print(f"✅ {len(entries)} entries created")

        print("\n✅ Database seeded successfully!")
        return True

    except Exception as e:
        print(f"❌ Error seeding database: {str(e)}")
        db.rollback()
        return False
