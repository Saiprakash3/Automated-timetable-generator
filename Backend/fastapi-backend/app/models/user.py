"""User model"""
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Index
from app.models.base import Base


class User(Base):
    __tablename__ = "users"

    # Primary Key
    id = Column(String(50), primary_key=True)

    # User Info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True, index=True)
    department = Column(String(100), nullable=False, index=True)

    # Role & Status
    role = Column(String(50), nullable=False, index=True)
    is_active = Column(Boolean, default=True, index=True)

    # Security
    password_hash = Column(String(255), nullable=False)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True, index=True)

    # Composite Indexes
    __table_args__ = (
        Index('ix_users_role_active', 'role', 'is_active'),
        Index('ix_users_dept_role', 'department', 'role'),
        Index('ix_users_deleted_active', 'deleted_at', 'is_active'),
    )

    def __repr__(self):
        return f"<User(id={self.id}, name={self.name}, role={self.role})>"
