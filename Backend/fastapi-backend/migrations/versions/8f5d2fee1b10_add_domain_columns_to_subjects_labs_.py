"""add domain columns to subjects, labs, sections

Revision ID: 8f5d2fee1b10
Revises: 52ae7170462e
Create Date: 2026-08-01 22:56:38.424477

Adds the columns the frontend domain model needs but the schema never had:
Subject.credits / type / defaultFacultyId, Lab.room / equipment / available,
and Section.studentCount. Without these, wiring the setup screens to Postgres
would hand the UI `undefined` for fields the generator and the Cell Edit
Drawer both read.

All columns are nullable so this is additive over existing rows. As with the
previous revision, autogenerate also proposed ~30 CREATE INDEX statements for
pre-existing index drift on users / timetables / timetable_entries; that is
unrelated to this change and is deliberately excluded.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8f5d2fee1b10'
down_revision: Union[str, Sequence[str], None] = '52ae7170462e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('subjects', sa.Column('credits', sa.Integer(), nullable=True))
    op.add_column('subjects', sa.Column('subject_type', sa.String(), nullable=True))
    op.add_column('subjects', sa.Column('default_faculty_id', sa.String(), nullable=True))
    op.add_column('labs', sa.Column('room', sa.String(), nullable=True))
    op.add_column('labs', sa.Column('equipment', sa.String(), nullable=True))
    op.add_column('labs', sa.Column('available', sa.Boolean(), nullable=True))
    op.add_column('sections', sa.Column('student_count', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('sections', 'student_count')
    op.drop_column('labs', 'available')
    op.drop_column('labs', 'equipment')
    op.drop_column('labs', 'room')
    op.drop_column('subjects', 'default_faculty_id')
    op.drop_column('subjects', 'subject_type')
    op.drop_column('subjects', 'credits')
