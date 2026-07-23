"""Conflict detection request/response schemas"""
from pydantic import BaseModel
from typing import Optional, List, Dict


class TimetableEntryForConflictCheck(BaseModel):
    """Timetable entry for conflict checking"""
    id: Optional[str] = None
    day: str
    periodStart: int
    periodEnd: int
    subject: str
    entry_type: str = "regular"
    facultyId: Optional[str] = None
    facultyName: Optional[str] = None
    lab_coordinator_id: Optional[str] = None
    room: str
    basket: Optional[str] = None
    applicable_years: Optional[List[int]] = None


class ConflictCheckRequest(BaseModel):
    """Request to check conflicts"""
    timetableId: str
    proposedEntries: List[TimetableEntryForConflictCheck]


class Conflict(BaseModel):
    """Single conflict"""
    id: str
    type: str
    severity: str  # blocking, warning, informational
    message: str
    affectedEntries: List[str]


class ConflictCheckResponse(BaseModel):
    """Conflict check response"""
    conflicts: List[Conflict]
    summary: Dict[str, int]  # {"blocking": 0, "warning": 1, "informational": 0}
