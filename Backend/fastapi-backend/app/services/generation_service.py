"""Backend Timetable Generation Engine Service.

Rewritten 2026-08-01. The previous implementation was a stub: it cycled a
hardcoded DEFAULT_SUBJECTS list (invented faculty like "Dr. M. Iyer", rooms
like "CS-101"), took no database session at all, and persisted nothing. So the
nine Setup categories had no effect on generation whatsoever, and a generated
timetable vanished on reload — it existed only in the HTTP response.

This version reads the real Setup tables and writes the result to Postgres.
"""
import uuid
from datetime import datetime, timezone
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models import Timetable, TimetableEntry
from app.models.setup_models import (
    FacultyModel,
    LabModel,
    RoomModel,
    SectionModel,
    SubjectFacultyMappingModel,
    SubjectModel,
)

DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
# Period 4 is post-lunch; the lunch break itself is not a schedulable period
# (INTERACTION_DECISIONS.md §8 — 6 teaching periods, lunch between P3 and P4).
PERIODS = [1, 2, 3, 4, 5, 6]
PRE_LUNCH = [1, 2, 3]
POST_LUNCH = [4, 5, 6]


class GenerationError(Exception):
    """Raised when Setup lacks the data generation requires."""


class TimetableGeneratorService:
    @staticmethod
    def generate(
        db: Session,
        created_by: str,
        department: str = "CSE",
        year: int = 3,
        section: str = "A",
    ) -> Dict[str, Any]:
        section_label = f"{year}{section}"

        section_row = (
            db.query(SectionModel)
            .filter(SectionModel.year == year, SectionModel.name == section)
            .first()
        )
        if section_row is None:
            raise GenerationError(
                f"No section {section_label} in Setup. Add it under Setup › Sections first."
            )

        mappings = (
            db.query(SubjectFacultyMappingModel)
            .filter(SubjectFacultyMappingModel.section_id == section_row.id)
            .all()
        )
        if not mappings:
            raise GenerationError(
                f"No subjects are mapped to section {section_label}. "
                "Add them under Setup › Subject–Faculty Mapping."
            )

        subjects = {s.id: s for s in db.query(SubjectModel).all()}
        faculty = {f.id: f for f in db.query(FacultyModel).all()}
        rooms = db.query(RoomModel).all()
        labs = [l for l in db.query(LabModel).all() if l.available is not False]

        if not rooms:
            raise GenerationError("No rooms in Setup. Add rooms before generating.")

        # --- build the work list: one item per required session ---------------
        # A subject needs `credits` sessions a week; a lab needs one 2-period
        # block. Sorting labs first matters: they need a contiguous pair inside
        # one half-day, so they must claim slots before singles fragment them.
        work: List[Dict[str, Any]] = []
        for m in mappings:
            subj = subjects.get(m.subject_id)
            if subj is None:
                continue
            is_lab = (subj.subject_type or ("lab" if subj.requires_lab else "regular")) == "lab"
            sessions = 1 if is_lab else (subj.credits or subj.weekly_lectures or 1)
            for _ in range(sessions):
                work.append({
                    "subject": subj,
                    "faculty_id": m.faculty_id,
                    "is_lab": is_lab,
                })
        work.sort(key=lambda w: not w["is_lab"])  # labs first

        # --- placement --------------------------------------------------------
        entries: List[Dict[str, Any]] = []
        # Occupancy keyed by (day, period) so a resource is never double-booked.
        faculty_busy = set()   # (faculty_id, day, period)
        room_busy = set()      # (room, day, period)
        section_busy = set()   # (day, period) — this section can be in one place
        gaps = 0
        room_cycle = 0

        def block_free(fid, room, day, periods):
            for p in periods:
                if (day, p) in section_busy:
                    return False
                if fid and (fid, day, p) in faculty_busy:
                    return False
                if (room, day, p) in room_busy:
                    return False
            return True

        def claim(fid, room, day, periods):
            for p in periods:
                section_busy.add((day, p))
                if fid:
                    faculty_busy.add((fid, day, p))
                room_busy.add((room, day, p))

        for item in work:
            subj = item["subject"]
            fid = item["faculty_id"]
            fac = faculty.get(fid)
            placed = False

            if item["is_lab"]:
                candidates = labs or rooms
                for day in DAYS:
                    # A lab is 2 consecutive periods and may not straddle lunch
                    # (conflict #10), so only pairs inside one half-day qualify.
                    for half in (PRE_LUNCH, POST_LUNCH):
                        for i in range(len(half) - 1):
                            pair = [half[i], half[i + 1]]
                            for lab in candidates:
                                room_name = getattr(lab, "room", None) or getattr(lab, "room_number", None) or lab.name
                                if block_free(fid, room_name, day, pair):
                                    claim(fid, room_name, day, pair)
                                    entries.append({
                                        "id": f"ent-{uuid.uuid4().hex[:8]}",
                                        "day": day,
                                        "periodStart": pair[0],
                                        "periodEnd": pair[1],
                                        "type": "lab",
                                        "subject": subj.name,
                                        "facultyId": fid,
                                        "facultyName": fac.name if fac else None,
                                        "room": room_name,
                                        "section": section_label,
                                    })
                                    placed = True
                                    break
                            if placed:
                                break
                        if placed:
                            break
                    if placed:
                        break
            else:
                for day in DAYS:
                    for period in PERIODS:
                        # Rotate the starting room so early subjects don't all
                        # pile into room #1 and starve later ones.
                        for k in range(len(rooms)):
                            room = rooms[(room_cycle + k) % len(rooms)]
                            if block_free(fid, room.room_number, day, [period]):
                                claim(fid, room.room_number, day, [period])
                                room_cycle += 1
                                entries.append({
                                    "id": f"ent-{uuid.uuid4().hex[:8]}",
                                    "day": day,
                                    "periodStart": period,
                                    "periodEnd": period,
                                    "type": subj.subject_type or "regular",
                                    "subject": subj.name,
                                    "facultyId": fid,
                                    "facultyName": fac.name if fac else None,
                                    "room": room.room_number,
                                    "section": section_label,
                                })
                                placed = True
                                break
                        if placed:
                            break
                    if placed:
                        break

            if not placed:
                gaps += 1

        # --- persist ----------------------------------------------------------
        now_utc = datetime.now(timezone.utc)
        timetable_id = f"tt_{now_utc.year}_{department.lower()}_{year}{section.lower()}"

        existing = db.query(Timetable).filter(Timetable.id == timetable_id).first()
        if existing is not None:
            # Regenerate replaces this section's timetable wholesale, matching
            # the documented Regenerate semantics (PATTERNS.md §6.3).
            db.query(TimetableEntry).filter(TimetableEntry.timetable_id == timetable_id).delete()
            existing.state = "draft"
            existing.updated_at = now_utc
            # created_at is the *generation* time as far as the UI is concerned
            # ("Generated 7/1/2026" next to freshly generated entries was just
            # the original seed date). A regenerate replaces every entry, so
            # the timetable genuinely dates from now.
            existing.created_at = now_utc
            timetable = existing
        else:
            timetable = Timetable(
                id=timetable_id,
                department=department,
                year=year,
                section=section,
                state="draft",
                created_by=created_by,
                created_at=now_utc,
                updated_at=now_utc,
            )
            db.add(timetable)
        db.flush()

        for e in entries:
            db.add(TimetableEntry(
                id=e["id"],
                timetable_id=timetable_id,
                day=e["day"],
                period_start=e["periodStart"],
                period_end=e["periodEnd"],
                subject=e["subject"],
                entry_type=e["type"],
                faculty_id=e["facultyId"],
                faculty_name=e["facultyName"],
                room=e["room"],
            ))
        db.commit()

        return {
            "id": timetable_id,
            "department": department,
            "year": year,
            "section": section,
            "state": "draft",
            "createdAt": now_utc.isoformat(),
            "summary": {
                "totalNeeded": len(work),
                "placed": len(entries),
                "gaps": gaps,
                "adjustedByRepair": 0,
            },
            "entries": entries,
        }
