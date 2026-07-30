"""Setup ORM models for Faculty, Subjects, Rooms, Labs, Sections, and Mappings"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime
from app.models.base import Base


class FacultyModel(Base):
    __tablename__ = "faculty"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    can_serve_as_lab_coordinator = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SubjectModel(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    year = Column(Integer, nullable=False, default=1)
    weekly_lectures = Column(Integer, nullable=False, default=3)
    requires_lab = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class RoomModel(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True)
    room_number = Column(String, nullable=False)
    building = Column(String, nullable=False, default="Main Building")
    capacity = Column(Integer, nullable=False, default=60)
    is_lab = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class LabModel(Base):
    __tablename__ = "labs"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False, default=30)
    created_at = Column(DateTime, default=datetime.utcnow)


class SectionModel(Base):
    __tablename__ = "sections"

    id = Column(String, primary_key=True)
    year = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class SubjectFacultyMappingModel(Base):
    __tablename__ = "subject_faculty_mappings"

    id = Column(String, primary_key=True)
    subject_id = Column(String, nullable=False)
    faculty_id = Column(String, nullable=False)
    section_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
