"""Approval Log model for audit trail"""
from datetime import datetime
from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from app.models.base import Base


class ApprovalLog(Base):
    __tablename__ = "approval_logs"

    # Primary Key
    id = Column(String(50), primary_key=True)

    # What happened
    timetable_id = Column(String(50), ForeignKey("timetables.id"), nullable=False)
    action = Column(String(50), nullable=False)  # sent_for_approval, approved, rejected, published, deleted

    # Who did it
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)

    # Details
    reason = Column(Text, nullable=True)

    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    timetable = relationship("Timetable", back_populates="approval_logs")
    user = relationship("User")

    def __repr__(self):
        return f"<ApprovalLog(id={self.id}, action={self.action}, timetable_id={self.timetable_id})>"
