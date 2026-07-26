"""Timetable model"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, Text, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.models.base import Base


class Timetable(Base):
    __tablename__ = "timetables"

    # Primary Key
    id = Column(String(50), primary_key=True)

    # Metadata
    department = Column(String(100), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    section = Column(String(10), nullable=False)

    # Workflow State
    state = Column(String(50), default="draft", index=True)

    # Creator & Timestamps
    created_by = Column(String(50), ForeignKey("users.id"), nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, index=True)

    # Approval Info
    approved_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)

    # Publication Info
    published_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    published_at = Column(DateTime, nullable=True, index=True)

    # Rejection Info
    rejection_reason = Column(Text, nullable=True)
    rejected_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    rejected_at = Column(DateTime, nullable=True)

    # Approval Note
    submission_note = Column(Text, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    submitted_by = Column(String(50), ForeignKey("users.id"), nullable=True)

    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by])
    entries = relationship("TimetableEntry", cascade="all, delete-orphan", back_populates="timetable")
    approval_logs = relationship("ApprovalLog", back_populates="timetable")

    # Composite Indexes
    __table_args__ = (
        Index('ix_tt_dept_year_section', 'department', 'year', 'section'),
        Index('ix_tt_dept_state', 'department', 'state'),
        Index('ix_tt_state_deleted', 'state', 'deleted_at'),
        Index('ix_tt_created_by_state', 'created_by', 'state'),
    )

    def __repr__(self):
        return f"<Timetable(id={self.id}, department={self.department}, state={self.state})>"
