"""Timetable Entry model"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, JSON, Index
from sqlalchemy.orm import relationship
from app.models.base import Base


class TimetableEntry(Base):
    __tablename__ = "timetable_entries"

    # Primary Key
    id = Column(String(50), primary_key=True)

    # Foreign Key
    timetable_id = Column(String(50), ForeignKey("timetables.id"), nullable=False, index=True)

    # Schedule
    day = Column(String(20), nullable=False, index=True)
    period_start = Column(Integer, nullable=False)
    period_end = Column(Integer, nullable=False)

    # Subject & Type
    subject = Column(String(255), nullable=False)
    entry_type = Column(String(50), default="regular", index=True)

    # Faculty & Coordinators
    faculty_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)
    faculty_name = Column(String(255), nullable=True)

    lab_coordinator_id = Column(String(50), ForeignKey("users.id"), nullable=True, index=True)

    # Location
    room = Column(String(100), nullable=False, index=True)

    # Elective Info
    basket = Column(String(10), nullable=True)
    applicable_years = Column(JSON, nullable=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, index=True)

    # Relationships
    timetable = relationship("Timetable", back_populates="entries")
    faculty = relationship("User", foreign_keys=[faculty_id])
    lab_coordinator = relationship("User", foreign_keys=[lab_coordinator_id])

    # Composite Indexes
    __table_args__ = (
        Index('ix_entry_timetable_deleted', 'timetable_id', 'deleted_at'),
        Index('ix_entry_faculty_day', 'faculty_id', 'day'),
        Index('ix_entry_room_day', 'room', 'day'),
        Index('ix_entry_faculty_day_period', 'faculty_id', 'day', 'period_start', 'period_end'),
        Index('ix_entry_room_day_period', 'room', 'day', 'period_start', 'period_end'),
    )

    def __repr__(self):
        return f"<TimetableEntry(id={self.id}, day={self.day}, subject={self.subject})>"
