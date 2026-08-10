"""What is still using a Setup record, and therefore blocks its removal.

Implements INTERACTION_DECISIONS.md §12.3/§12.4: removal is **blocked** while
live configuration still references the record, and the blocker must be able to
say exactly what is using it — a bare "can't delete this" is worse than the
problem it prevents.

§12.4's carve-out matters here: entries belonging to a **published or archived**
timetable deliberately do NOT block. Those are snapshots (the entry stores the
faculty name and room as plain strings alongside the id), so the published grid
keeps rendering after the record is gone. Counting them would freeze Setup for
the whole term — nobody could fix a misspelt name until the timetable retired.
Only the current editable **draft** blocks.
"""
from typing import Any, Dict, List

from sqlalchemy.orm import Session

from app.models import Timetable, TimetableEntry
from app.models.setup_models import (
    ElectiveBasketModel,
    ElectiveModel,
    FacultyModel,
    LabCoordinatorModel,
    LabModel,
    RoomModel,
    SectionModel,
    SubjectFacultyMappingModel,
    SubjectModel,
)


def _draft_timetable_ids(db: Session) -> List[str]:
    return [
        t.id
        for t in db.query(Timetable).filter(Timetable.state.in_(["draft", "pending", "approved"])).all()
    ]


def _dep(kind: str, count: int, detail: str = "") -> Dict[str, Any]:
    return {"type": kind, "count": count, "detail": detail}


def find_dependents(db: Session, entity: str, record_id: str) -> List[Dict[str, Any]]:
    """Return the live references to `record_id`. Empty list means safe to remove."""
    deps: List[Dict[str, Any]] = []
    draft_ids = _draft_timetable_ids(db)

    if entity == "faculty":
        maps = db.query(SubjectFacultyMappingModel).filter(
            SubjectFacultyMappingModel.faculty_id == record_id
        ).all()
        if maps:
            sections = sorted({m.section_id for m in maps})
            deps.append(_dep("Subject–Faculty mappings", len(maps), ", ".join(sections)))

        subs = db.query(SubjectModel).filter(SubjectModel.default_faculty_id == record_id).all()
        if subs:
            deps.append(_dep("subjects (default faculty)", len(subs), ", ".join(s.name for s in subs[:3])))

        els = db.query(ElectiveModel).filter(ElectiveModel.faculty_id == record_id).all()
        if els:
            deps.append(_dep("basket electives", len(els)))

        if draft_ids:
            n = db.query(TimetableEntry).filter(
                TimetableEntry.faculty_id == record_id,
                TimetableEntry.timetable_id.in_(draft_ids),
            ).count()
            if n:
                deps.append(_dep("sessions in the working timetable", n))

    elif entity == "subjects":
        maps = db.query(SubjectFacultyMappingModel).filter(
            SubjectFacultyMappingModel.subject_id == record_id
        ).all()
        if maps:
            sections = sorted({m.section_id for m in maps})
            deps.append(_dep("Subject–Faculty mappings", len(maps), ", ".join(sections)))

        els = db.query(ElectiveModel).filter(ElectiveModel.subject_id == record_id).all()
        if els:
            deps.append(_dep("basket electives", len(els)))

    elif entity == "rooms":
        room = db.query(RoomModel).filter(RoomModel.id == record_id).first()
        els = db.query(ElectiveModel).filter(ElectiveModel.room_id == record_id).all()
        if els:
            deps.append(_dep("basket electives", len(els)))
        if room and draft_ids:
            n = db.query(TimetableEntry).filter(
                TimetableEntry.room == room.room_number,
                TimetableEntry.timetable_id.in_(draft_ids),
            ).count()
            if n:
                deps.append(_dep("sessions in the working timetable", n))

    elif entity == "labs":
        lab = db.query(LabModel).filter(LabModel.id == record_id).first()
        # lab_ids is a JSON array, so this is filtered in Python rather than SQL.
        coords = [
            c for c in db.query(LabCoordinatorModel).all() if record_id in (c.lab_ids or [])
        ]
        if coords:
            deps.append(_dep("lab coordinators", len(coords), ", ".join(c.name for c in coords[:3])))
        if lab and lab.room and draft_ids:
            n = db.query(TimetableEntry).filter(
                TimetableEntry.room == lab.room,
                TimetableEntry.timetable_id.in_(draft_ids),
            ).count()
            if n:
                deps.append(_dep("sessions in the working timetable", n))

    elif entity == "sections":
        maps = db.query(SubjectFacultyMappingModel).filter(
            SubjectFacultyMappingModel.section_id == record_id
        ).all()
        if maps:
            deps.append(_dep("Subject–Faculty mappings", len(maps)))
        baskets = [
            b for b in db.query(ElectiveBasketModel).all() if record_id in (b.section_ids or [])
        ]
        if baskets:
            deps.append(_dep("elective baskets", len(baskets), ", ".join(b.name for b in baskets[:3])))

    elif entity == "lab-coordinators":
        if draft_ids:
            n = db.query(TimetableEntry).filter(
                TimetableEntry.lab_coordinator_id == record_id,
                TimetableEntry.timetable_id.in_(draft_ids),
            ).count()
            if n:
                deps.append(_dep("lab sessions in the working timetable", n))

    # mappings and elective baskets are leaves — nothing references them, and a
    # basket's electives cascade with it.
    return deps


def dependents_payload(deps: List[Dict[str, Any]], record_name: str) -> Dict[str, Any]:
    total = sum(d["count"] for d in deps)
    return {
        "code": "HAS_DEPENDENTS",
        "message": f"{record_name} is still used in {total} place{'s' if total != 1 else ''}.",
        "dependents": deps,
    }
