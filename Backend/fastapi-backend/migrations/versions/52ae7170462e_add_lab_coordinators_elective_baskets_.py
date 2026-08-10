"""add lab_coordinators, elective_baskets, electives

Revision ID: 52ae7170462e
Revises: bd4923716594
Create Date: 2026-08-01 22:50:57.511788

Scope note: `alembic revision --autogenerate` also proposed ~30 CREATE INDEX
statements against the pre-existing users / timetables / timetable_entries
tables. Those indexes are declared in the models but have never been applied
to the database (verified: all three tables report 0 indexes), so the drift is
real — but it predates this change and is unrelated to it. Creating them is a
separate, deliberate decision, so they are deliberately NOT included here.
This migration adds only the three new setup tables.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '52ae7170462e'
down_revision: Union[str, Sequence[str], None] = 'bd4923716594'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'elective_baskets',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('year', sa.Integer(), nullable=False),
        sa.Column('period', sa.Integer(), nullable=False),
        sa.Column('section_ids', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'lab_coordinators',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('name', sa.String(), nullable=False),
        sa.Column('department', sa.String(), nullable=False),
        sa.Column('lab_ids', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_table(
        'electives',
        sa.Column('id', sa.String(), nullable=False),
        sa.Column('basket_id', sa.String(), nullable=False),
        sa.Column('subject_id', sa.String(), nullable=False),
        sa.Column('faculty_id', sa.String(), nullable=False),
        sa.Column('room_id', sa.String(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(['basket_id'], ['elective_baskets.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_electives_basket_id'), 'electives', ['basket_id'], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_electives_basket_id'), table_name='electives')
    op.drop_table('electives')
    op.drop_table('lab_coordinators')
    op.drop_table('elective_baskets')
