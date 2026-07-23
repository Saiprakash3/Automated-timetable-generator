"""Conflict detection endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.schemas.conflict import ConflictCheckRequest, ConflictCheckResponse
from app.services.conflict_service import ConflictService
from app.api.dependencies import get_current_user
from app.models import User, Timetable
from sqlalchemy import and_

router = APIRouter(prefix="/api/conflicts", tags=["conflicts"])


@router.post("/check", response_model=ConflictCheckResponse)
async def check_conflicts(
    request: ConflictCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Check conflicts for proposed timetable entries

    Runs all 7 conflict checks:
    1. Faculty double-booking (blocking)
    2. Faculty daily period limit (warning)
    3. Faculty weekly day limit (informational)
    4. Lab coordinator daily limit (warning)
    5. Lab coordinator weekly day limit (informational)
    6. Room double-booking (blocking)
    7. Lab continuity (warning)

    Access: All authenticated users
    """
    # Verify timetable exists
    timetable = db.query(Timetable).filter(
        and_(
            Timetable.id == request.timetableId,
            Timetable.deleted_at == None,
        )
    ).first()

    if not timetable:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timetable not found",
        )

    # Convert proposed entries to dicts
    proposed_dicts = [
        {
            "id": e.id,
            "day": e.day,
            "periodStart": e.periodStart,
            "periodEnd": e.periodEnd,
            "subject": e.subject,
            "entry_type": e.entry_type,
            "facultyId": e.facultyId,
            "facultyName": e.facultyName,
            "lab_coordinator_id": e.lab_coordinator_id,
            "room": e.room,
            "basket": e.basket,
            "applicable_years": e.applicable_years,
        }
        for e in request.proposedEntries
    ]

    # Run conflict checks
    result = ConflictService.check_conflicts(
        db, request.timetableId, proposed_dicts, settings
    )

    return ConflictCheckResponse(
        conflicts=result["conflicts"], summary=result["summary"]
    )
