"""Workflow state machine logic"""
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models import Timetable, ApprovalLog, TimetableEntry
from app.services.conflict_service import ConflictService
from app.config import settings
from datetime import datetime


class WorkflowService:
    """Handle timetable workflow state transitions"""

    @staticmethod
    def send_for_approval(db: Session, timetable_id: str, note: str = None, user_id: str = None) -> Timetable:
        """Send timetable for approval (draft → pending)"""
        tt = db.query(Timetable).filter(Timetable.id == timetable_id).first()

        if not tt:
            raise ValueError("NOT_FOUND")

        if tt.state != "draft":
            raise ValueError("INVALID_STATE")

        # Check for blocking conflicts
        entries = db.query(TimetableEntry).filter(
            and_(
                TimetableEntry.timetable_id == timetable_id,
                TimetableEntry.deleted_at == None,
            )
        ).all()

        proposed_dicts = [
            {
                "id": e.id,
                "day": e.day,
                "periodStart": e.period_start,
                "periodEnd": e.period_end,
                "subject": e.subject,
                "entry_type": e.entry_type,
                "facultyId": e.faculty_id,
                "facultyName": e.faculty_name,
                "lab_coordinator_id": e.lab_coordinator_id,
                "room": e.room,
            }
            for e in entries
        ]

        conflict_result = ConflictService.check_conflicts(
            db, timetable_id, proposed_dicts, settings
        )

        # Reject if blocking conflicts exist
        if conflict_result["summary"]["blocking"] > 0:
            blocking_conflicts = [
                c for c in conflict_result["conflicts"] if c["severity"] == "blocking"
            ]
            raise ValueError(
                f"BLOCKING_CONFLICTS: {len(blocking_conflicts)} blocking conflict(s) found"
            )

        tt.state = "pending"
        tt.submission_note = note
        tt.submitted_by = user_id
        tt.submitted_at = datetime.utcnow()

        # Log approval action
        log = ApprovalLog(
            id=f"log_{datetime.utcnow().timestamp()}",
            timetable_id=timetable_id,
            action="sent_for_approval",
            user_id=user_id,
            reason=note,
        )
        db.add(log)
        db.commit()
        db.refresh(tt)

        return tt

    @staticmethod
    def approve_timetable(db: Session, timetable_id: str, user_id: str) -> Timetable:
        """Approve timetable (pending → approved)"""
        tt = db.query(Timetable).filter(Timetable.id == timetable_id).first()

        if not tt:
            raise ValueError("NOT_FOUND")

        if tt.state != "pending":
            raise ValueError("INVALID_STATE")

        tt.state = "approved"
        tt.approved_by = user_id
        tt.approved_at = datetime.utcnow()

        # Log approval action
        log = ApprovalLog(
            id=f"log_{datetime.utcnow().timestamp()}",
            timetable_id=timetable_id,
            action="approved",
            user_id=user_id,
        )
        db.add(log)
        db.commit()
        db.refresh(tt)

        return tt

    @staticmethod
    def request_changes(db: Session, timetable_id: str, reason: str, user_id: str) -> Timetable:
        """Request changes (pending → rejected)"""
        tt = db.query(Timetable).filter(Timetable.id == timetable_id).first()

        if not tt:
            raise ValueError("NOT_FOUND")

        if tt.state != "pending":
            raise ValueError("INVALID_STATE")

        tt.state = "rejected"
        tt.rejection_reason = reason
        tt.rejected_by = user_id
        tt.rejected_at = datetime.utcnow()

        # Log approval action
        log = ApprovalLog(
            id=f"log_{datetime.utcnow().timestamp()}",
            timetable_id=timetable_id,
            action="rejected",
            user_id=user_id,
            reason=reason,
        )
        db.add(log)
        db.commit()
        db.refresh(tt)

        return tt

    @staticmethod
    def publish_timetable(db: Session, timetable_id: str, user_id: str) -> Timetable:
        """Publish timetable (approved → published)"""
        tt = db.query(Timetable).filter(Timetable.id == timetable_id).first()

        if not tt:
            raise ValueError("NOT_FOUND")

        if tt.state != "approved":
            raise ValueError("INVALID_STATE")

        # Check for blocking conflicts
        entries = db.query(TimetableEntry).filter(
            and_(
                TimetableEntry.timetable_id == timetable_id,
                TimetableEntry.deleted_at == None,
            )
        ).all()

        proposed_dicts = [
            {
                "id": e.id,
                "day": e.day,
                "periodStart": e.period_start,
                "periodEnd": e.period_end,
                "subject": e.subject,
                "entry_type": e.entry_type,
                "facultyId": e.faculty_id,
                "facultyName": e.faculty_name,
                "lab_coordinator_id": e.lab_coordinator_id,
                "room": e.room,
            }
            for e in entries
        ]

        conflict_result = ConflictService.check_conflicts(
            db, timetable_id, proposed_dicts, settings
        )

        # Reject if blocking conflicts exist
        if conflict_result["summary"]["blocking"] > 0:
            blocking_conflicts = [
                c for c in conflict_result["conflicts"] if c["severity"] == "blocking"
            ]
            raise ValueError(
                f"BLOCKING_CONFLICTS: {len(blocking_conflicts)} blocking conflict(s) found"
            )

        tt.state = "published"
        tt.published_by = user_id
        tt.published_at = datetime.utcnow()

        # Log approval action
        log = ApprovalLog(
            id=f"log_{datetime.utcnow().timestamp()}",
            timetable_id=timetable_id,
            action="published",
            user_id=user_id,
        )
        db.add(log)
        db.commit()
        db.refresh(tt)

        return tt
