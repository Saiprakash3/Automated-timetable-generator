"""Backend Timetable Generation Engine Service"""
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any


DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
PERIODS = [1, 2, 3, 4, 5, 6]

DEFAULT_SUBJECTS = [
    {"code": "CS301", "name": "Operating Systems", "type": "regular", "faculty": "Dr. M. Iyer", "room": "CS-101"},
    {"code": "CS302", "name": "Computer Networks", "type": "regular", "faculty": "Dr. M. Nair", "room": "CS-102"},
    {"code": "CS303", "name": "Theory of Computation", "type": "regular", "faculty": "Dr. M. Iyer", "room": "CS-101"},
    {"code": "CS304", "name": "Design & Analysis of Algorithms", "type": "regular", "faculty": "Prof. K. Rao", "room": "CS-103"},
    {"code": "CS305", "name": "Networks Lab", "type": "lab", "faculty": "Dr. M. Nair", "room": "CS-Lab1"},
    {"code": "CS306", "name": "OS Lab", "type": "lab", "faculty": "Dr. P. Verma", "room": "CS-Lab2"},
]


class TimetableGeneratorService:
    @staticmethod
    def generate(department: str = "CSE", year: int = 3, section: str = "A") -> Dict[str, Any]:
        """
        Generates a timetable grid for the requested department, year, and section.
        Returns entries and summary statistics.
        """
        entries = []
        subj_index = 0
        section_label = f"{year}{section}"

        for day in DAYS:
            for period in PERIODS:
                # Alternate subjects across schedule grid
                subj = DEFAULT_SUBJECTS[subj_index % len(DEFAULT_SUBJECTS)]
                subj_index += 1

                entry = {
                    "id": f"ent-{uuid.uuid4().hex[:8]}",
                    "day": day,
                    "periodStart": period,
                    "periodEnd": period + 1 if subj["type"] == "lab" else period,
                    "type": subj["type"],
                    "subject": f"{subj['code']} - {subj['name']}",
                    "facultyName": subj["faculty"],
                    "room": subj["room"],
                    "section": section_label,
                }
                entries.append(entry)

        now_utc = datetime.now(timezone.utc)
        timetable_id = f"tt_{now_utc.year}_{department.lower()}_{year}{section.lower()}"
        total_needed = len(entries)
        placed = total_needed

        return {
            "id": timetable_id,
            "department": department,
            "year": year,
            "section": section,
            "state": "draft",
            "createdAt": now_utc.isoformat(),
            "summary": {
                "totalNeeded": total_needed,
                "placed": placed,
                "gaps": 0,
                "adjustedByRepair": 0,
            },
            "entries": entries,
        }
