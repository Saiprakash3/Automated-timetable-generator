"""Base model for all ORM models"""
from sqlalchemy.orm import declarative_base
from sqlalchemy import event
from datetime import datetime

Base = declarative_base()


@event.listens_for(Base, "before_delete", propagate=True)
def soft_delete(mapper, connection, target):
    """Intercept deletes and convert to soft deletes (mark deleted_at)"""
    if hasattr(target, "deleted_at"):
        target.deleted_at = datetime.utcnow()

        # Cascade soft delete to related entries if timetable
        if hasattr(target, "entries"):
            for entry in target.entries:
                entry.deleted_at = datetime.utcnow()

        # Prevent actual deletion
        connection.execute(
            target.__table__.update()
            .where(target.__table__.c.id == target.id)
            .values(deleted_at=datetime.utcnow())
        )
