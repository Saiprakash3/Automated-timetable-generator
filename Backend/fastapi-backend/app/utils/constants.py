"""Application constants and enums"""
from enum import Enum


class UserRole(str, Enum):
    """User roles in the system"""
    ADMIN = "admin"
    HOD = "hod"
    FACULTY = "faculty"
    LAB_COORDINATOR = "lab_coordinator"
    STUDENT = "student"


class WorkflowState(str, Enum):
    """Timetable workflow states"""
    DRAFT = "draft"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    PUBLISHED = "published"


class ConflictSeverity(str, Enum):
    """Conflict severity levels"""
    BLOCKING = "blocking"
    WARNING = "warning"
    INFORMATIONAL = "informational"


class ConflictType(str, Enum):
    """Types of conflicts"""
    FACULTY_DOUBLE_BOOKING = "faculty_double_booking"
    FACULTY_DAILY_PERIOD_LIMIT = "faculty_daily_period_limit"
    FACULTY_WEEKLY_PERIOD_LIMIT = "faculty_weekly_period_limit"
    FACULTY_MIN_DAILY_PERIODS = "faculty_min_daily_periods"
    LAB_COORDINATOR_DAILY_LIMIT = "lab_coordinator_daily_limit"
    LAB_COORDINATOR_WEEKLY_DAY_LIMIT = "lab_coordinator_weekly_day_limit"
    ROOM_DOUBLE_BOOKING = "room_double_booking"
    ELECTIVE_BASKET_CLASH = "elective_basket_clash"


class EntryType(str, Enum):
    """Types of timetable entries"""
    REGULAR = "regular"
    LAB = "lab"
    ELECTIVE = "elective"
    TUTORIAL = "tutorial"
    PRACTICAL = "practical"
