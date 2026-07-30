"""Pydantic schemas for setup data entities"""
from pydantic import BaseModel, ConfigDict
from typing import Optional, List


# Faculty Schemas
class FacultyBase(BaseModel):
    name: str
    department: str
    can_serve_as_lab_coordinator: bool = False


class FacultyCreate(FacultyBase):
    id: Optional[str] = None


class FacultyResponse(FacultyBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Subject Schemas
class SubjectBase(BaseModel):
    code: str
    name: str
    department: str
    year: int = 1
    weekly_lectures: int = 3
    requires_lab: bool = False


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
    department: str
    capacity: int = 30


class LabCreate(LabBase):
    id: Optional[str] = None


class LabResponse(LabBase):
    id: str
    model_config = ConfigDict(from_attributes=True)


# Section Schemas
class SectionBase(BaseModel):
    year: int
    name: str
    department: str


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
