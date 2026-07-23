"""Timetable Entry model"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    # Primary Key
    id = Column(String(50), primary_key=True)

    # Foreign Key
    timetable_id = Column(String(50), ForeignKey("timetables.id"), nullable=False)

    # Schedule
    day = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    period_start = Column(Integer, nullable=False)
    period_end = Column(Integer, nullable=False)

    # Subject & Type
    subject = Column(String(255), nullable=False)
    entry_type = Column(String(50), default="regular")  # regular, lab, elective, tutorial, practical

    # Faculty & Coordinators
    faculty_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    faculty_name = Column(String(255), nullable=True)

    lab_coordinator_id = Column(String(50), ForeignKey("users.id"), nullable=True)

    # Location
    room = Column(String(100), nullable=False)

    # Elective Info
    basket = Column(String(10), nullable=True)
    applicable_years = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    # Relationships
    timetable = relationship("Timetable", back_populates="entries")
    faculty = relationship("User", foreign_keys=[faculty_id])
    lab_coordinator = relationship("User", foreign_keys=[lab_coordinator_id])

    def __repr__(self):
        return f"<TimetableEntry(id={self.id}, day={self.day}, subject={self.subject})>"
