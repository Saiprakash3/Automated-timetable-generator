"""Database models"""
from app.models.base import Base
from app.models.user import User
from app.models.timetable import Timetable
from app.models.timetable_entry import TimetableEntry
from app.models.approval_log import ApprovalLog
from app.models.setup_models import (
    FacultyModel,
    SubjectModel,
    RoomModel,
    LabModel,
    SectionModel,
    SubjectFacultyMappingModel,
)

__all__ = [
    "Base",
    "User",
    "Timetable",
    "TimetableEntry",
    "ApprovalLog",
    "FacultyModel",
    "SubjectModel",
    "RoomModel",
    "LabModel",
    "SectionModel",
    "SubjectFacultyMappingModel",
]
