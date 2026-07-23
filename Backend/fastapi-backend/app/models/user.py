"""User model"""
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    # Primary Key
    id = Column(String(50), primary_key=True)

    # User Info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)
    department = Column(String(100), nullable=False)

    # Role & Status
    role = Column(String(50), nullable=False)  # admin, hod, faculty, lab_coordinator, student
    is_active = Column(Boolean, default=True)

    # Security
    password_hash = Column(String(255), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, role={self.role})>"
