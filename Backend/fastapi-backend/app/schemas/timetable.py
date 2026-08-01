"""Timetable request/response schemas"""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class TimetableEntryCreate(BaseModel):
    """Create/update timetable entry"""
    id: Optional[str] = None
    day: str = Field(..., description="Monday-Sunday")
    period_start: int
    period_end: int
    subject: str
    entry_type: str = "regular"  # regular, lab, elective, tutorial, practical
    faculty_id: Optional[str] = None
    faculty_name: Optional[str] = None
    lab_coordinator_id: Optional[str] = None
    room: str
    basket: Optional[str] = None
    applicable_years: Optional[List[int]] = None


class TimetableEntryResponse(BaseModel):
    """Timetable entry response"""
    id: str
    day: str
    period_start: int
    period_end: int
    subject: str
    entry_type: str
    faculty_id: Optional[str] = None
    faculty_name: Optional[str] = None
    lab_coordinator_id: Optional[str] = None
    room: str
    basket: Optional[str] = None
    applicable_years: Optional[List[int]] = None


class TimetableCreate(BaseModel):
    """Create timetable request"""
    department: str
    year: int = Field(..., ge=1, le=4)
    section: str


class TimetableUpdate(BaseModel):
    """Update timetable entries"""
    entries: List[TimetableEntryCreate]


class TimetableSendForApproval(BaseModel):
    """Send timetable for approval"""
    note: Optional[str] = None


class TimetableRequestChanges(BaseModel):
    """Request changes on timetable"""
    reason: str


class TimetableListResponse(BaseModel):
    """Timetable list response with pagination"""
    timetables: List[dict]
    total: int
    limit: int
    offset: int
    hasMore: bool


class TimetableResponse(BaseModel):
    """Full timetable response"""
    id: str
    department: str
    year: int
    section: str
    state: str
    entries: List[TimetableEntryResponse]
    created_by: str
    created_at: datetime
    updated_at: datetime
    deleted_at: Optional[datetime] = None
    approved_by: Optional[str] = None
    approved_at: Optional[datetime] = None
    published_by: Optional[str] = None
    published_at: Optional[datetime] = None
    rejection_reason: Optional[str] = None
    rejected_by: Optional[str] = None
    rejected_at: Optional[datetime] = None
    submission_note: Optional[str] = None
    submitted_at: Optional[datetime] = None
    submitted_by: Optional[str] = None
