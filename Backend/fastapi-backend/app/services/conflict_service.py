"""Conflict detection engine"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Timetable, TimetableEntry
from app.config import Settings
from typing import List, Dict
from datetime import datetime


class ConflictService:
    """Detect scheduling conflicts"""

    @staticmethod
    def check_conflicts(
        db: Session,
        timetable_id: str,
        proposed_entries: List[dict],
        settings: Settings,
    ) -> dict:
        """
        Run all 7 conflict checks against proposed entries

        Returns:
            {
                "conflicts": [...],
                "summary": {"blocking": 0, "warning": 1, "informational": 0}
            }
        """
        # Get existing entries from database
        existing_entries = db.query(TimetableEntry).filter(
            and_(
                TimetableEntry.timetable_id == timetable_id,
                TimetableEntry.deleted_at == None,
            )
        ).all()

        # Convert to dicts for easier processing
        existing_dicts = [
            {
                "id": e.id,
                "day": e.day,
                "periodStart": e.period_start,
                "periodEnd": e.period_end,
                "subject": e.subject,
                "entry_type": e.entry_type,
                "facultyId": e.faculty_id,
                "facultyName": e.faculty_name,
                "lab_coordinator_id": e.lab_coordinator_id,
                "room": e.room,
            }
            for e in existing_entries
        ]

        # Merge existing and proposed (exclude entries being replaced by same ID)
        all_entries = existing_dicts.copy()
        proposed_ids = {e.get("id") for e in proposed_entries if e.get("id")}
        all_entries = [e for e in all_entries if e["id"] not in proposed_ids]
        all_entries.extend(proposed_entries)

        conflicts = []
        conflict_counter = 1

        # Check #1: Faculty double-booking
        conflicts.extend(
            ConflictService._check_faculty_double_booking(
                all_entries, proposed_entries, conflict_counter
            )
        )
        conflict_counter += len(
            [c for c in conflicts if c["type"] == "faculty_double_booking"]
        )

        # Check #2: Faculty daily period limit
        conflicts.extend(
            ConflictService._check_faculty_daily_limit(
                all_entries, proposed_entries, settings, conflict_counter
            )
        )
        conflict_counter += len(
            [c for c in conflicts if c["type"] == "faculty_daily_period_limit"]
        )

        # Check #3: Faculty weekly day limit
        conflicts.extend(
            ConflictService._check_faculty_weekly_limit(
                all_entries, proposed_entries, settings, conflict_counter
            )
        )
        conflict_counter += len(
            [c for c in conflicts if c["type"] == "faculty_weekly_day_limit"]
        )

        # Check #4: Lab coordinator daily limit
        conflicts.extend(
            ConflictService._check_lab_coord_daily_limit(
                all_entries, proposed_entries, settings, conflict_counter
            )
        )
        conflict_counter += len(
            [c for c in conflicts if c["type"] == "lab_coordinator_daily_limit"]
        )

        # Check #5: Lab coordinator weekly day limit
        conflicts.extend(
            ConflictService._check_lab_coord_weekly_limit(
                all_entries, proposed_entries, settings, conflict_counter
            )
        )
        conflict_counter += len(
            [c for c in conflicts if c["type"] == "lab_coordinator_weekly_day_limit"]
        )

        # Check #6: Room double-booking
        conflicts.extend(
            ConflictService._check_room_double_booking(
                all_entries, proposed_entries, conflict_counter
            )
        )
        conflict_counter += len(
            [c for c in conflicts if c["type"] == "room_double_booking"]
        )

        # Check #7: Lab continuity
        conflicts.extend(
            ConflictService._check_lab_continuity(
                proposed_entries, conflict_counter
            )
        )

        # Summary
        summary = {
            "blocking": len([c for c in conflicts if c["severity"] == "blocking"]),
            "warning": len([c for c in conflicts if c["severity"] == "warning"]),
            "informational": len(
                [c for c in conflicts if c["severity"] == "informational"]
            ),
        }

        return {"conflicts": conflicts, "summary": summary}

    @staticmethod
    def _periods_overlap(a_start: int, a_end: int, b_start: int, b_end: int) -> bool:
        """Check if two time periods overlap"""
        return a_start <= b_end and b_start <= a_end

    @staticmethod
    def _check_faculty_double_booking(
        all_entries: List[dict], proposed_entries: List[dict], counter: int
    ) -> List[dict]:
        """Check #1: Faculty double-booking (BLOCKING)"""
        conflicts = []
        faculty_conflicts = {}

        for proposed in proposed_entries:
            if not proposed.get("facultyId"):
                continue

            faculty_id = proposed["facultyId"]
            proposed_day = proposed["day"]
            proposed_start = proposed["periodStart"]
            proposed_end = proposed["periodEnd"]

            for other in all_entries:
                if other.get("id") == proposed.get("id"):
                    continue
                if other.get("facultyId") != faculty_id:
                    continue
                if other["day"] != proposed_day:
                    continue
                if not ConflictService._periods_overlap(
                    proposed_start, proposed_end, other["periodStart"], other["periodEnd"]
                ):
                    continue

                # Found overlap
                key = f"{faculty_id}_{proposed_day}_{proposed_start}_{proposed_end}"
                if key not in faculty_conflicts:
                    faculty_conflicts[key] = {
                        "entries": set(),
                        "faculty_name": proposed.get("facultyName", "Faculty"),
                        "other_subject": other.get("subject", "Unknown"),
                    }
                faculty_conflicts[key]["entries"].add(proposed.get("id", "unknown"))
                faculty_conflicts[key]["entries"].add(other.get("id", "unknown"))

        for key, data in faculty_conflicts.items():
            conflicts.append(
                {
                    "id": f"conflict_{counter}",
                    "type": "faculty_double_booking",
                    "severity": "blocking",
                    "message": f"{data['faculty_name']} is already scheduled for {data['other_subject']} at this time.",
                    "affectedEntries": list(data["entries"]),
                }
            )
            counter += 1

        return conflicts

    @staticmethod
    def _check_faculty_daily_limit(
        all_entries: List[dict], proposed_entries: List[dict], settings: Settings, counter: int
    ) -> List[dict]:
        """Check #2: Faculty daily period limit (WARNING)"""
        conflicts = []
        max_periods = settings.faculty_max_periods_per_day

        faculty_daily_periods: Dict[str, Dict[str, int]] = {}

        for entry in all_entries:
            if not entry.get("facultyId"):
                continue

            faculty_id = entry["facultyId"]
            day = entry["day"]
            periods = entry["periodEnd"] - entry["periodStart"] + 1

            key = f"{faculty_id}_{day}"
            if key not in faculty_daily_periods:
                faculty_daily_periods[key] = {
                    "faculty_name": entry.get("facultyName", "Faculty"),
                    "day": day,
                    "total_periods": 0,
                    "entries": [],
                }

            faculty_daily_periods[key]["total_periods"] += periods
            faculty_daily_periods[key]["entries"].append(entry.get("id", "unknown"))

        for key, data in faculty_daily_periods.items():
            if data["total_periods"] > max_periods:
                # Only flag if proposed entries contributed to this
                proposed_ids = {e.get("id") for e in proposed_entries}
                affected = [e for e in data["entries"] if e in proposed_ids]
                if affected:
                    conflicts.append(
                        {
                            "id": f"conflict_{counter}",
                            "type": "faculty_daily_period_limit",
                            "severity": "warning",
                            "message": f"{data['faculty_name']} would exceed {max_periods} periods on {data['day']} (has {data['total_periods']}).",
                            "affectedEntries": affected,
                        }
                    )
                    counter += 1

        return conflicts

    @staticmethod
    def _check_faculty_weekly_limit(
        all_entries: List[dict], proposed_entries: List[dict], settings: Settings, counter: int
    ) -> List[dict]:
        """Check #3: Faculty weekly day limit (INFORMATIONAL)"""
        conflicts = []
        max_days = settings.faculty_max_days_per_week

        faculty_days: Dict[str, set] = {}
        faculty_names: Dict[str, str] = {}

        for entry in all_entries:
            if not entry.get("facultyId"):
                continue

            faculty_id = entry["facultyId"]
            if faculty_id not in faculty_days:
                faculty_days[faculty_id] = set()
                faculty_names[faculty_id] = entry.get("facultyName", "Faculty")

            faculty_days[faculty_id].add(entry["day"])

        for faculty_id, days in faculty_days.items():
            if len(days) > max_days:
                proposed_ids = {e.get("id") for e in proposed_entries}
                proposed_faculty = {
                    e.get("id")
                    for e in proposed_entries
                    if e.get("facultyId") == faculty_id
                }
                if proposed_faculty:
                    conflicts.append(
                        {
                            "id": f"conflict_{counter}",
                            "type": "faculty_weekly_day_limit",
                            "severity": "informational",
                            "message": f"{faculty_names[faculty_id]} would teach {len(days)} days this week (beyond {max_days}-day preference).",
                            "affectedEntries": list(proposed_faculty),
                        }
                    )
                    counter += 1

        return conflicts

    @staticmethod
    def _check_lab_coord_daily_limit(
        all_entries: List[dict], proposed_entries: List[dict], settings: Settings, counter: int
    ) -> List[dict]:
        """Check #4: Lab coordinator daily period limit (WARNING)"""
        conflicts = []
        max_periods = settings.lab_coordinator_max_periods_per_day

        lab_coord_daily: Dict[str, Dict[str, int]] = {}

        for entry in all_entries:
            if not entry.get("lab_coordinator_id"):
                continue

            lab_coord_id = entry["lab_coordinator_id"]
            day = entry["day"]
            periods = entry["periodEnd"] - entry["periodStart"] + 1

            key = f"{lab_coord_id}_{day}"
            if key not in lab_coord_daily:
                lab_coord_daily[key] = {
                    "lab_coord_id": lab_coord_id,
                    "day": day,
                    "total_periods": 0,
                    "entries": [],
                }

            lab_coord_daily[key]["total_periods"] += periods
            lab_coord_daily[key]["entries"].append(entry.get("id", "unknown"))

        for key, data in lab_coord_daily.items():
            if data["total_periods"] > max_periods:
                proposed_ids = {e.get("id") for e in proposed_entries}
                affected = [e for e in data["entries"] if e in proposed_ids]
                if affected:
                    conflicts.append(
                        {
                            "id": f"conflict_{counter}",
                            "type": "lab_coordinator_daily_limit",
                            "severity": "warning",
                            "message": f"Lab coordinator would exceed {max_periods} periods on {data['day']} (has {data['total_periods']}).",
                            "affectedEntries": affected,
                        }
                    )
                    counter += 1

        return conflicts

    @staticmethod
    def _check_lab_coord_weekly_limit(
        all_entries: List[dict], proposed_entries: List[dict], settings: Settings, counter: int
    ) -> List[dict]:
        """Check #5: Lab coordinator weekly day limit (INFORMATIONAL)"""
        conflicts = []
        max_days = settings.lab_coordinator_max_days_per_week

        lab_coord_days: Dict[str, set] = {}

        for entry in all_entries:
            if not entry.get("lab_coordinator_id"):
                continue

            lab_coord_id = entry["lab_coordinator_id"]
            if lab_coord_id not in lab_coord_days:
                lab_coord_days[lab_coord_id] = set()

            lab_coord_days[lab_coord_id].add(entry["day"])

        for lab_coord_id, days in lab_coord_days.items():
            if len(days) > max_days:
                proposed_ids = {e.get("id") for e in proposed_entries}
                proposed_lab_coords = {
                    e.get("id")
                    for e in proposed_entries
                    if e.get("lab_coordinator_id") == lab_coord_id
                }
                if proposed_lab_coords:
                    conflicts.append(
                        {
                            "id": f"conflict_{counter}",
                            "type": "lab_coordinator_weekly_day_limit",
                            "severity": "informational",
                            "message": f"Lab coordinator would have assignments on {len(days)} days (beyond {max_days}-day preference).",
                            "affectedEntries": list(proposed_lab_coords),
                        }
                    )
                    counter += 1

        return conflicts

    @staticmethod
    def _check_room_double_booking(
        all_entries: List[dict], proposed_entries: List[dict], counter: int
    ) -> List[dict]:
        """Check #6: Room double-booking (BLOCKING)"""
        conflicts = []
        room_conflicts = {}

        for proposed in proposed_entries:
            if not proposed.get("room"):
                continue

            room = proposed["room"]
            proposed_day = proposed["day"]
            proposed_start = proposed["periodStart"]
            proposed_end = proposed["periodEnd"]

            for other in all_entries:
                if other.get("id") == proposed.get("id"):
                    continue
                if other.get("room") != room:
                    continue
                if other["day"] != proposed_day:
                    continue
                if not ConflictService._periods_overlap(
                    proposed_start, proposed_end, other["periodStart"], other["periodEnd"]
                ):
                    continue

                key = f"{room}_{proposed_day}_{proposed_start}_{proposed_end}"
                if key not in room_conflicts:
                    room_conflicts[key] = {
                        "entries": set(),
                        "room": room,
                        "other_subject": other.get("subject", "Unknown"),
                    }
                room_conflicts[key]["entries"].add(proposed.get("id", "unknown"))
                room_conflicts[key]["entries"].add(other.get("id", "unknown"))

        for key, data in room_conflicts.items():
            conflicts.append(
                {
                    "id": f"conflict_{counter}",
                    "type": "room_double_booking",
                    "severity": "blocking",
                    "message": f"{data['room']} is already booked for {data['other_subject']} at this time.",
                    "affectedEntries": list(data["entries"]),
                }
            )
            counter += 1

        return conflicts

    @staticmethod
    def _check_lab_continuity(proposed_entries: List[dict], counter: int) -> List[dict]:
        """Check #7: Lab continuity - labs should be continuous (WARNING)"""
        conflicts = []

        for entry in proposed_entries:
            if entry.get("entry_type") != "lab":
                continue

            if entry["periodStart"] == entry["periodEnd"]:
                conflicts.append(
                    {
                        "id": f"conflict_{counter}",
                        "type": "lab_not_continuous",
                        "severity": "warning",
                        "message": f"{entry.get('subject', 'Lab')} is only 1 period — labs should be continuous 2+ periods.",
                        "affectedEntries": [entry.get("id", "unknown")],
                    }
                )
                counter += 1

        return conflicts
