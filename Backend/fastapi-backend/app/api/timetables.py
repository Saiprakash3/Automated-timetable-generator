"""Timetable CRUD endpoints"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.timetable import (
    TimetableCreate,
    TimetableUpdate,
    TimetableSendForApproval,
    TimetableRequestChanges,
)
from app.services.timetable_service import TimetableService
from app.services.workflow_service import WorkflowService
from app.api.dependencies import get_current_user, get_current_admin, get_current_hod
from app.models import User

from app.services.generation_service import TimetableGeneratorService, GenerationError
from app.services.conflict_service import ConflictService
from app.config import settings

router = APIRouter(prefix="/api/timetables", tags=["timetables"])


@router.post("/generate")
async def generate_timetable(
    department: str = Query("CSE"),
    year: int = Query(3),
    section: str = Query("A"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Generate a timetable from the Setup data and persist it.

    Previously took neither a db session nor an authenticated user — it was the
    only mutating endpoint in the API with no auth, and it could not read Setup
    or save its result.
    """
    try:
        return TimetableGeneratorService.generate(
            db=db,
            created_by=current_user.id,
            department=department,
            year=year,
            section=section,
        )
    except GenerationError as exc:
        # A Setup gap is the caller's problem to fix, not a server fault — 422
        # so the UI can show the specific missing category.
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail=str(exc))


@router.get("")
async def list_timetables(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    department: str = Query(None),
    year: int = Query(None),
    section: str = Query(None),
    state: str = Query(None),
    created_by: str = Query(None),
):
    """
    List timetables with filters and pagination

    Anyone can view, filters applied accordingly
    """
    try:
        result = TimetableService.list_timetables(
            db,
            limit=limit,
            offset=offset,
            department=department,
            year=year,
            section=section,
            state=state,
            created_by=created_by,
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/me")
async def get_my_timetable(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current user's resolved published schedule"""
    return TimetableService.get_my_timetable(db, current_user)


@router.get("/{timetable_id}")

async def get_timetable(
    timetable_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get timetable detail with entries"""
    try:
        result = TimetableService.get_timetable_with_entries(db, timetable_id)
        return result

    except ValueError as e:
        if str(e) == "NOT_FOUND":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_timetable(
    request: TimetableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Create new timetable (Admin only)"""
    try:
        tt = TimetableService.create_timetable(db, request, current_user.id)
        result = TimetableService.get_timetable_with_entries(db, tt.id)
        return result

    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.patch("/{timetable_id}")
async def update_timetable(
    timetable_id: str,
    request: TimetableUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Update timetable entries (Admin only).

    Blocking conflicts are rejected here. Until 2026-08-01 this endpoint wrote
    whatever it was given: `ConflictService` existed but nothing ever called it,
    so the only enforcement in the system was the browser's own check — which
    meant the API happily accepted a double-booked room from any other client,
    or from a stale tab. The client-side check stays for live feedback in the
    drawer; this is the boundary that actually holds.
    """
    try:
        # ConflictService reads camelCase (`periodStart`), the request schema is
        # snake_case (`period_start`). Handing it model_dump() directly would
        # give it keys it never looks at, so every check would quietly find
        # nothing and pass — enforcement that exists but can't fail.
        proposed = []
        for e in request.entries or []:
            d = e.model_dump() if hasattr(e, "model_dump") else dict(e)
            proposed.append(
                {
                    **d,
                    "periodStart": d.get("period_start"),
                    "periodEnd": d.get("period_end"),
                    "facultyId": d.get("faculty_id"),
                    "facultyName": d.get("faculty_name"),
                }
            )
        if proposed:
            report = ConflictService.check_conflicts(db, timetable_id, proposed, settings)
            blocking = [c for c in report["conflicts"] if c["severity"] == "blocking"]
            if blocking:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail={
                        "code": "BLOCKING_CONFLICTS",
                        "message": f"{len(blocking)} blocking conflict{'s' if len(blocking) != 1 else ''} would be created.",
                        "conflicts": blocking,
                    },
                )

        TimetableService.update_timetable_entries(db, timetable_id, request)
        result = TimetableService.get_timetable_with_entries(db, timetable_id)
        return result

    except HTTPException:
        raise

    except ValueError as e:
        if str(e) == "NOT_FOUND":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found")
        elif str(e) == "INVALID_STATE":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Timetable must be in draft state to edit")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{timetable_id}/send-for-approval")
async def send_for_approval(
    timetable_id: str,
    request: TimetableSendForApproval,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Send timetable for approval (Admin only)"""
    try:
        tt = WorkflowService.send_for_approval(db, timetable_id, request.note, current_user.id)
        return {
            "id": tt.id,
            "state": tt.state,
            "note": tt.submission_note,
            "submittedBy": tt.submitted_by,
            "submittedAt": tt.submitted_at.isoformat(),
        }

    except ValueError as e:
        error_str = str(e)
        if error_str == "NOT_FOUND":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found")
        elif error_str == "INVALID_STATE":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Timetable must be in draft state")
        elif error_str.startswith("BLOCKING_CONFLICTS"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot submit: {error_str}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_str)


@router.post("/{timetable_id}/approve")
async def approve_timetable(
    timetable_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_hod),
):
    """Approve timetable (HOD only)"""
    try:
        tt = WorkflowService.approve_timetable(db, timetable_id, current_user.id)
        return {
            "id": tt.id,
            "state": tt.state,
            "approvedBy": tt.approved_by,
            "approvedAt": tt.approved_at.isoformat(),
        }

    except ValueError as e:
        if str(e) == "NOT_FOUND":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found")
        elif str(e) == "INVALID_STATE":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Timetable must be in pending state")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{timetable_id}/request-changes")
async def request_changes(
    timetable_id: str,
    request: TimetableRequestChanges,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_hod),
):
    """Request changes (HOD only)"""
    try:
        tt = WorkflowService.request_changes(db, timetable_id, request.reason, current_user.id)
        return {
            "id": tt.id,
            "state": tt.state,
            "reason": tt.rejection_reason,
            "requestedBy": tt.rejected_by,
            "requestedAt": tt.rejected_at.isoformat(),
        }

    except ValueError as e:
        if str(e) == "NOT_FOUND":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found")
        elif str(e) == "INVALID_STATE":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Timetable must be in pending state")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.post("/{timetable_id}/publish")
async def publish_timetable(
    timetable_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),
):
    """Publish timetable (Admin only)"""
    try:
        tt = WorkflowService.publish_timetable(db, timetable_id, current_user.id)
        return {
            "id": tt.id,
            "state": tt.state,
            "publishedBy": tt.published_by,
            "publishedAt": tt.published_at.isoformat(),
        }

    except ValueError as e:
        error_str = str(e)
        if error_str == "NOT_FOUND":
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Timetable not found")
        elif error_str == "INVALID_STATE":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Timetable must be in approved state")
        elif error_str.startswith("BLOCKING_CONFLICTS"):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Cannot publish: {error_str}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error_str)
