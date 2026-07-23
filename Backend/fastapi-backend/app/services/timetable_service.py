"""Timetable CRUD business logic"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Timetable, TimetableEntry, User
from app.schemas.timetable import TimetableCreate, TimetableUpdate
from datetime import datetime
import uuid


class TimetableService:
    """Handle timetable CRUD operations"""

    @staticmethod
    def list_timetables(
        db: Session,
        limit: int = 20,
        offset: int = 0,
        department: str = None,
        year: int = None,
        section: str = None,
        state: str = None,
        created_by: str = None,
    ) -> dict:
        """List timetables with filters and pagination"""
        query = db.query(Timetable).filter(Timetable.deleted_at == None)

        # Apply filters
        if department:
            query = query.filter(Timetable.department == department)
        if year:
            query = query.filter(Timetable.year == year)
        if section:
            query = query.filter(Timetable.section == section)
        if state:
            query = query.filter(Timetable.state == state)
        if created_by:
            query = query.filter(Timetable.created_by == created_by)

        # Get total count
        total = query.count()

        # Apply pagination
        timetables = query.offset(offset).limit(limit).all()

        # Build response
        timetable_list = []
        for tt in timetables:
            timetable_list.append({
                "id": tt.id,
                "department": tt.department,
                "year": tt.year,
                "section": tt.section,
                "state": tt.state,
                "createdBy": tt.created_by,
                "createdAt": tt.created_at.isoformat(),
                "updatedAt": tt.updated_at.isoformat(),
                "approvedBy": tt.approved_by,
                "publishedAt": tt.published_at.isoformat() if tt.published_at else None,
            })

        return {
            "timetables": timetable_list,
            "total": total,
            "limit": limit,
            "offset": offset,
            "hasMore": (offset + limit) < total,
        }

    @staticmethod
    def get_timetable(db: Session, timetable_id: str) -> Timetable:
        """Get timetable by ID"""
        tt = db.query(Timetable).filter(
            and_(Timetable.id == timetable_id, Timetable.deleted_at == None)
        ).first()

        if not tt:
            raise ValueError("NOT_FOUND")

        return tt

    @staticmethod
    def create_timetable(db: Session, request: TimetableCreate, user_id: str) -> Timetable:
        """Create new timetable (admin only)"""
        # Generate ID
        tt_id = f"tt_{datetime.utcnow().year}_{request.department.lower()}_{request.year}{request.section.lower()}"

        # Create timetable
        timetable = Timetable(
            id=tt_id,
            department=request.department,
            year=request.year,
            section=request.section,
            state="draft",
            created_by=user_id,
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow(),
        )

        db.add(timetable)
        db.commit()
        db.refresh(timetable)

        return timetable

    @staticmethod
    def update_timetable_entries(
        db: Session, timetable_id: str, request: TimetableUpdate
    ) -> Timetable:
        """Update timetable entries (admin only)"""
        tt = TimetableService.get_timetable(db, timetable_id)

        if tt.state != "draft":
            raise ValueError("INVALID_STATE")

        # Clear existing entries
        db.query(TimetableEntry).filter(TimetableEntry.timetable_id == timetable_id).delete()

        # Add new entries
        for entry_data in request.entries:
            entry_id = entry_data.id or f"entry_{uuid.uuid4().hex[:6]}"

            entry = TimetableEntry(
                id=entry_id,
                timetable_id=timetable_id,
                day=entry_data.day,
                period_start=entry_data.period_start,
                period_end=entry_data.period_end,
                subject=entry_data.subject,
                entry_type=entry_data.entry_type,
                faculty_id=entry_data.faculty_id,
                faculty_name=entry_data.faculty_name,
                lab_coordinator_id=entry_data.lab_coordinator_id,
                room=entry_data.room,
                basket=entry_data.basket,
                applicable_years=entry_data.applicable_years,
            )
            db.add(entry)

        tt.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(tt)

        return tt

    @staticmethod
    def get_timetable_with_entries(db: Session, timetable_id: str) -> dict:
        """Get timetable with all entries"""
        tt = TimetableService.get_timetable(db, timetable_id)

        entries = db.query(TimetableEntry).filter(
            and_(
                TimetableEntry.timetable_id == timetable_id,
                TimetableEntry.deleted_at == None
            )
        ).all()

        return {
            "id": tt.id,
            "department": tt.department,
            "year": tt.year,
            "section": tt.section,
            "state": tt.state,
            "entries": [
                {
                    "id": e.id,
                    "day": e.day,
                    "periodStart": e.period_start,
                    "periodEnd": e.period_end,
                    "type": e.entry_type,
                    "subject": e.subject,
                    "facultyId": e.faculty_id,
                    "facultyName": e.faculty_name,
                    "labCoordinatorId": e.lab_coordinator_id,
                    "room": e.room,
                    "basket": e.basket,
                    "applicableYears": e.applicable_years,
                }
                for e in entries
            ],
            "createdBy": tt.created_by,
            "createdAt": tt.created_at.isoformat(),
            "updatedAt": tt.updated_at.isoformat(),
            "approvedBy": tt.approved_by,
            "publishedAt": tt.published_at.isoformat() if tt.published_at else None,
        }
