"""Setup ORM models for Faculty, Subjects, Rooms, Labs, Sections, Mappings,
Lab Coordinators, and Elective Baskets"""
from datetime import datetime
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.models.base import Base


class FacultyModel(Base):
    __tablename__ = "faculty"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    can_serve_as_lab_coordinator = Column(Boolean, default=False)
    # Which subjects this person is qualified to teach — the source of truth for
    # conflict #18. Deliberately NOT derived from subject_faculty_mappings: a
    # mapping records a decision already made, this records what may be decided,
    # and deriving one from the other would flag every first-ever assignment as
    # unqualified. An empty list means "unrestricted", not "can teach nothing"
    # (INTERACTION_DECISIONS.md §13).
    can_teach_subject_ids = Column(JSON, nullable=True, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class SubjectModel(Base):
    __tablename__ = "subjects"

    id = Column(String, primary_key=True)
    code = Column(String, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    year = Column(Integer, nullable=False, default=1)
    weekly_lectures = Column(Integer, nullable=False, default=3)
    requires_lab = Column(Boolean, default=False)
    # Domain fields the UI reads (Subjects table, CellEditDrawer's subject
    # filter, and the generator's period budget). Nullable so the migration is
    # additive over existing rows; the API layer supplies defaults.
    credits = Column(Integer, nullable=True)
    subject_type = Column(String, nullable=True)  # regular | lab | elective
    default_faculty_id = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class RoomModel(Base):
    __tablename__ = "rooms"

    id = Column(String, primary_key=True)
    room_number = Column(String, nullable=False)
    building = Column(String, nullable=False, default="Main Building")
    capacity = Column(Integer, nullable=False, default=60)
    is_lab = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class LabModel(Base):
    __tablename__ = "labs"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    capacity = Column(Integer, nullable=False, default=30)
    # `available` gates a lab out of both the generator's lab pool and the Cell
    # Edit Drawer's room picker, so it has to round-trip through the DB.
    room = Column(String, nullable=True)
    equipment = Column(String, nullable=True)
    available = Column(Boolean, nullable=True, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SectionModel(Base):
    __tablename__ = "sections"

    id = Column(String, primary_key=True)
    year = Column(Integer, nullable=False)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    student_count = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SubjectFacultyMappingModel(Base):
    __tablename__ = "subject_faculty_mappings"

    id = Column(String, primary_key=True)
    subject_id = Column(String, nullable=False)
    faculty_id = Column(String, nullable=False)
    section_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class LabCoordinatorModel(Base):
    """The dedicated Lab Coordinator pool — distinct from a Faculty member's
    own `can_serve_as_lab_coordinator` flag. `lab_ids` is a JSON array of
    LabModel.id values: the set is small, always read whole, and never queried
    by individual member, so a join table would cost a join for no benefit."""

    __tablename__ = "lab_coordinators"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    lab_ids = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)


class ElectiveBasketModel(Base):
    """F-06's entity: a year, a period, the contributing sections, and a list
    of electives. `period` alone (no day) is deliberate — the generator picks
    the day. `section_ids` is JSON for the same reason as `lab_ids` above."""

    __tablename__ = "elective_baskets"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    year = Column(Integer, nullable=False)
    period = Column(Integer, nullable=False)
    section_ids = Column(JSON, nullable=False, default=list)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Electives ARE a real table rather than JSON: each one carries its own
    # subject/faculty/room triple that the generator resolves individually,
    # and deleting a basket must take its electives with it.
    electives = relationship(
        "ElectiveModel",
        back_populates="basket",
        cascade="all, delete-orphan",
        lazy="selectin",
    )


class ElectiveModel(Base):
    """One elective subject within a basket, with its own faculty and room."""

    __tablename__ = "electives"

    id = Column(String, primary_key=True)
    basket_id = Column(
        String, ForeignKey("elective_baskets.id", ondelete="CASCADE"), nullable=False, index=True
    )
    subject_id = Column(String, nullable=False)
    faculty_id = Column(String, nullable=False)
    room_id = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    basket = relationship("ElectiveBasketModel", back_populates="electives")
