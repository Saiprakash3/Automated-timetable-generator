"""Setup REST endpoints for managing setup data entities"""
import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.setup_models import (
    FacultyModel,
    SubjectModel,
    RoomModel,
    LabModel,
    SectionModel,
    SubjectFacultyMappingModel,
)
from app.schemas.setup import (
    FacultyCreate,
    FacultyResponse,
    SubjectCreate,
    SubjectResponse,
    RoomCreate,
    RoomResponse,
    LabCreate,
    LabResponse,
    SectionCreate,
    SectionResponse,
    SubjectFacultyMappingCreate,
    SubjectFacultyMappingResponse,
)

router = APIRouter(prefix="/api/setup", tags=["setup"])


# --- Faculty ---
@router.get("/faculty", response_model=List[FacultyResponse])
def list_faculty(db: Session = Depends(get_db)):
    return db.query(FacultyModel).all()


@router.post("/faculty", response_model=FacultyResponse, status_code=status.HTTP_201_CREATED)
def create_faculty(data: FacultyCreate, db: Session = Depends(get_db)):
    faculty_id = data.id or f"F-{uuid.uuid4().hex[:8]}"
    item = FacultyModel(
        id=faculty_id,
        name=data.name,
        department=data.department,
        can_serve_as_lab_coordinator=data.can_serve_as_lab_coordinator,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/faculty/{faculty_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_faculty(faculty_id: str, db: Session = Depends(get_db)):
    item = db.query(FacultyModel).filter(FacultyModel.id == faculty_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Faculty member not found")
    db.delete(item)
    db.commit()
    return None


# --- Subjects ---
@router.get("/subjects", response_model=List[SubjectResponse])
def list_subjects(db: Session = Depends(get_db)):
    return db.query(SubjectModel).all()


@router.post("/subjects", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(data: SubjectCreate, db: Session = Depends(get_db)):
    sub_id = data.id or f"SUB-{uuid.uuid4().hex[:8]}"
    item = SubjectModel(
        id=sub_id,
        code=data.code,
        name=data.name,
        department=data.department,
        year=data.year,
        weekly_lectures=data.weekly_lectures,
        requires_lab=data.requires_lab,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(subject_id: str, db: Session = Depends(get_db)):
    item = db.query(SubjectModel).filter(SubjectModel.id == subject_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(item)
    db.commit()
    return None


# --- Rooms ---
@router.get("/rooms", response_model=List[RoomResponse])
def list_rooms(db: Session = Depends(get_db)):
    return db.query(RoomModel).all()


@router.post("/rooms", response_model=RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(data: RoomCreate, db: Session = Depends(get_db)):
    room_id = data.id or f"R-{uuid.uuid4().hex[:8]}"
    item = RoomModel(
        id=room_id,
        room_number=data.room_number,
        building=data.building,
        capacity=data.capacity,
        is_lab=data.is_lab,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/rooms/{room_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_room(room_id: str, db: Session = Depends(get_db)):
    item = db.query(RoomModel).filter(RoomModel.id == room_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Room not found")
    db.delete(item)
    db.commit()
    return None


# --- Labs ---
@router.get("/labs", response_model=List[LabResponse])
def list_labs(db: Session = Depends(get_db)):
    return db.query(LabModel).all()


@router.post("/labs", response_model=LabResponse, status_code=status.HTTP_201_CREATED)
def create_lab(data: LabCreate, db: Session = Depends(get_db)):
    lab_id = data.id or f"L-{uuid.uuid4().hex[:8]}"
    item = LabModel(
        id=lab_id,
        name=data.name,
        department=data.department,
        capacity=data.capacity,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/labs/{lab_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_lab(lab_id: str, db: Session = Depends(get_db)):
    item = db.query(LabModel).filter(LabModel.id == lab_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Lab not found")
    db.delete(item)
    db.commit()
    return None


# --- Sections ---
@router.get("/sections", response_model=List[SectionResponse])
def list_sections(db: Session = Depends(get_db)):
    return db.query(SectionModel).all()


@router.post("/sections", response_model=SectionResponse, status_code=status.HTTP_201_CREATED)
def create_section(data: SectionCreate, db: Session = Depends(get_db)):
    sec_id = data.id or f"SEC-{uuid.uuid4().hex[:8]}"
    item = SectionModel(
        id=sec_id,
        year=data.year,
        name=data.name,
        department=data.department,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/sections/{section_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_section(section_id: str, db: Session = Depends(get_db)):
    item = db.query(SectionModel).filter(SectionModel.id == section_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Section not found")
    db.delete(item)
    db.commit()
    return None


# --- Subject Faculty Mappings ---
@router.get("/mappings", response_model=List[SubjectFacultyMappingResponse])
def list_mappings(db: Session = Depends(get_db)):
    return db.query(SubjectFacultyMappingModel).all()


@router.post("/mappings", response_model=SubjectFacultyMappingResponse, status_code=status.HTTP_201_CREATED)
def create_mapping(data: SubjectFacultyMappingCreate, db: Session = Depends(get_db)):
    map_id = data.id or f"MAP-{uuid.uuid4().hex[:8]}"
    item = SubjectFacultyMappingModel(
        id=map_id,
        subject_id=data.subject_id,
        faculty_id=data.faculty_id,
        section_id=data.section_id,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/mappings/{mapping_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_mapping(mapping_id: str, db: Session = Depends(get_db)):
    item = db.query(SubjectFacultyMappingModel).filter(SubjectFacultyMappingModel.id == mapping_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Mapping not found")
    db.delete(item)
    db.commit()
    return None
