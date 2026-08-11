"""Pydantic schemas for setup data entities"""
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional, List


# Faculty Schemas
class FacultyBase(BaseModel):
    name: str
    department: str = ""
    can_serve_as_lab_coordinator: bool = False
    can_teach_subject_ids: List[str] = Field(default_factory=list)


class FacultyCreate(FacultyBase):
    id: Optional[str] = None


class FacultyResponse(FacultyBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Subject Schemas
class SubjectBase(BaseModel):
    code: str
    name: str
    department: str = ""
    year: int = 1
    weekly_lectures: int = 3
    requires_lab: bool = False
    credits: Optional[int] = None
    subject_type: Optional[str] = None  # regular | lab | elective
    default_faculty_id: Optional[str] = None
    max_periods_per_week: int = 3
    total_periods_required: int = 45


class SubjectCreate(SubjectBase):
    id: Optional[str] = None


class SubjectResponse(SubjectBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Room Schemas
class RoomBase(BaseModel):
    room_number: str
    building: str = "Main Building"
    capacity: int = 60
    is_lab: bool = False


class RoomCreate(RoomBase):
    id: Optional[str] = None


class RoomResponse(RoomBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Lab Schemas
class LabBase(BaseModel):
    name: str
    department: str = ""
    capacity: int = 30
    room: Optional[str] = None
    equipment: Optional[str] = None
    available: bool = True


class LabCreate(LabBase):
    id: Optional[str] = None


class LabResponse(LabBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Section Schemas
class SectionBase(BaseModel):
    year: int
    name: str
    department: str = ""
    student_count: Optional[int] = None


class SectionCreate(SectionBase):
    id: Optional[str] = None


class SectionResponse(SectionBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Subject Faculty Mapping Schemas
class SubjectFacultyMappingBase(BaseModel):
    subject_id: str
    faculty_id: str
    section_id: str


class SubjectFacultyMappingCreate(SubjectFacultyMappingBase):
    id: Optional[str] = None


class SubjectFacultyMappingResponse(SubjectFacultyMappingBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Lab Coordinator Schemas
class LabCoordinatorBase(BaseModel):
    name: str
    department: str
    lab_ids: List[str] = Field(default_factory=list)


class LabCoordinatorCreate(LabCoordinatorBase):
    id: Optional[str] = None


class LabCoordinatorResponse(LabCoordinatorBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Elective / Elective Basket Schemas
class ElectiveBase(BaseModel):
    subject_id: str
    faculty_id: str
    room_id: str


class ElectiveCreate(ElectiveBase):
    id: Optional[str] = None


class ElectiveResponse(ElectiveBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


class ElectiveBasketBase(BaseModel):
    name: str
    year: int
    period: int
    section_ids: List[str] = Field(default_factory=list)


class ElectiveBasketCreate(ElectiveBasketBase):
    id: Optional[str] = None
    # Electives arrive with the basket: the UI configures a whole basket on one
    # screen and saves it in a single action, so accepting them nested keeps
    # that atomic instead of requiring N follow-up requests.
    electives: List[ElectiveCreate] = Field(default_factory=list)


class ElectiveBasketResponse(ElectiveBasketBase):
    id: str
    electives: List[ElectiveResponse] = Field(default_factory=list)
    model_config = ConfigDict(from_attributes=True)
