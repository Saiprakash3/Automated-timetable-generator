"""add faculty can_teach_subject_ids

Revision ID: 2c6034723d36
Revises: 8f5d2fee1b10
Create Date: 2026-08-01

Backs conflict #18 (faculty not qualified to teach the assigned subject).
Stored rather than derived from subject_faculty_mappings — see
INTERACTION_DECISIONS.md §13. Nullable, so existing rows are unaffected; a
NULL/empty list reads as "unrestricted", which is what stops this from
flagging every entry on every existing timetable the moment it ships.

As with the two preceding revisions, autogenerate also proposed ~30 CREATE
INDEX statements for pre-existing index drift on users / timetables /
timetable_entries. That drift is unrelated to this change and is excluded.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '2c6034723d36'
down_revision: Union[str, Sequence[str], None] = '8f5d2fee1b10'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('faculty', sa.Column('can_teach_subject_ids', sa.JSON(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('faculty', 'can_teach_subject_ids')
