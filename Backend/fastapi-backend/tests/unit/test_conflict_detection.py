"""Integration tests for conflict detection engine"""
import pytest
from app.services.conflict_service import ConflictService
from app.models import TimetableEntry
from app.config import Settings


class TestConflictDetection:
    """Test all 7 conflict checks with database"""

    @pytest.fixture
    def settings(self):
        """Mock settings for conflict detection"""
        settings = Settings()
        settings.faculty_max_periods_per_day = 6
        settings.faculty_max_days_per_week = 5
        settings.lab_coordinator_max_periods_per_day = 4
        settings.lab_coordinator_max_days_per_week = 5
        return settings

    def test_faculty_double_booking_detected(self, db, settings):
        """Check #1: Faculty double-booking should be detected as BLOCKING"""
        # Add existing entry to database
        existing = TimetableEntry(
            id="entry_001",
            timetable_id="tt_123",
            day="Monday",
            period_start=2,
            period_end=2,
            subject="Data Structures",
            entry_type="regular",
            faculty_id="F1023",
            faculty_name="Dr. Ramesh",
            room="CSE-201",
        )
        db.add(existing)
        db.commit()

        # Propose conflicting entry
        proposed = [
            {
                "id": "entry_002",
                "day": "Monday",
                "periodStart": 2,
                "periodEnd": 2,
                "subject": "DBMS",
                "entry_type": "regular",
                "facultyId": "F1023",
                "facultyName": "Dr. Ramesh",
                "room": "CSE-202",
            }
        ]

        conflicts = ConflictService.check_conflicts(db, "tt_123", proposed, settings)

        blocking = [c for c in conflicts["conflicts"] if c["severity"] == "blocking"]
        assert len(blocking) > 0
        assert any("double_booking" in c["type"] for c in blocking)

    def test_faculty_daily_period_limit_exceeded(self, db, settings):
        """Check #2: Faculty exceeding daily period limit should be WARNING"""
        # Add multiple existing entries for same faculty on same day
        for i in range(1, 7):
            entry = TimetableEntry(
                id=f"existing_{i}",
                timetable_id="tt_123",
                day="Monday",
                period_start=i,
                period_end=i,
                subject=f"Class {i}",
                entry_type="regular",
                faculty_id="F1023",
                faculty_name="Dr. Ramesh",
                room=f"CSE-{200 + i}",
            )
            db.add(entry)
        db.commit()

        # Propose 7th period (exceeds limit of 6)
        proposed = [
            {
                "id": "entry_007",
                "day": "Monday",
                "periodStart": 7,
                "periodEnd": 7,
                "subject": "Class 7",
                "entry_type": "regular",
                "facultyId": "F1023",
                "facultyName": "Dr. Ramesh",
                "room": "CSE-207",
            }
        ]

        conflicts = ConflictService.check_conflicts(db, "tt_123", proposed, settings)

        warning = [c for c in conflicts["conflicts"] if c["severity"] == "warning"]
        assert any("daily_period_limit" in c["type"] for c in warning)

    def test_room_double_booking_detected(self, db, settings):
        """Check #6: Room double-booking should be detected as BLOCKING"""
        # Add existing entry
        existing = TimetableEntry(
            id="entry_001",
            timetable_id="tt_123",
            day="Tuesday",
            period_start=3,
            period_end=3,
            subject="Class 1",
            entry_type="regular",
            faculty_id="F1023",
            faculty_name="Dr. Ramesh",
            room="CSE-201",
        )
        db.add(existing)
        db.commit()

        # Propose conflicting entry with same room
        proposed = [
            {
                "id": "entry_002",
                "day": "Tuesday",
                "periodStart": 3,
                "periodEnd": 3,
                "subject": "Class 2",
                "entry_type": "regular",
                "facultyId": "F1088",
                "facultyName": "Dr. Anitha",
                "room": "CSE-201",
            }
        ]

        conflicts = ConflictService.check_conflicts(db, "tt_123", proposed, settings)

        blocking = [c for c in conflicts["conflicts"] if c["severity"] == "blocking"]
        assert any("room_double_booking" in c["type"] for c in blocking)

    def test_lab_continuity_warning(self, db, settings):
        """Check #7: Single-period lab should trigger WARNING"""
        proposed = [
            {
                "id": "entry_001",
                "day": "Wednesday",
                "periodStart": 2,
                "periodEnd": 2,  # Single period
                "subject": "Lab",
                "entry_type": "lab",
                "facultyId": "F1023",
                "facultyName": "Dr. Ramesh",
                "room": "CSE-Lab-1",
            }
        ]

        conflicts = ConflictService.check_conflicts(db, "tt_123", proposed, settings)

        warning = [c for c in conflicts["conflicts"] if c["severity"] == "warning"]
        assert any("lab_not_continuous" in c["type"] for c in warning)

    def test_no_conflicts_clean_schedule(self, db, settings):
        """Clean schedule should have no conflicts"""
        proposed = [
            {
                "id": "entry_001",
                "day": "Monday",
                "periodStart": 1,
                "periodEnd": 1,
                "subject": "Class 1",
                "entry_type": "regular",
                "facultyId": "F1023",
                "facultyName": "Dr. Ramesh",
                "room": "CSE-201",
            }
        ]

        conflicts = ConflictService.check_conflicts(db, "tt_123", proposed, settings)

        assert len(conflicts["conflicts"]) == 0
        assert conflicts["summary"]["blocking"] == 0

    def test_conflict_summary_counts(self, db, settings):
        """Summary should accurately count conflict severity levels"""
        # Add existing entry
        existing = TimetableEntry(
            id="entry_001",
            timetable_id="tt_123",
            day="Monday",
            period_start=2,
            period_end=2,
            subject="Class 1",
            entry_type="regular",
            faculty_id="F1023",
            faculty_name="Dr. Ramesh",
            room="CSE-201",
        )
        db.add(existing)
        db.commit()

        # Propose conflicting entry
        proposed = [
            {
                "id": "entry_002",
                "day": "Monday",
                "periodStart": 2,
                "periodEnd": 2,
                "subject": "Class 2",
                "entry_type": "regular",
                "facultyId": "F1023",
                "facultyName": "Dr. Ramesh",
                "room": "CSE-202",
            }
        ]

        conflicts = ConflictService.check_conflicts(db, "tt_123", proposed, settings)

        assert "blocking" in conflicts["summary"]
        assert "warning" in conflicts["summary"]
        assert "informational" in conflicts["summary"]
        assert sum(conflicts["summary"].values()) == len(conflicts["conflicts"])
