"""Add period constraint columns to subjects table"""
import sys
from sqlalchemy import text
from sqlalchemy.orm import sessionmaker
from app.database import engine
from app.models.base import Base
from app.models.setup_models import SubjectModel

# Create tables (adds new columns if they don't exist)
Base.metadata.create_all(bind=engine)

Session = sessionmaker(bind=engine)
db = Session()

try:
    # Check if columns exist and add them if they don't
    inspector_sql = text("""
        SELECT column_name FROM information_schema.columns
        WHERE table_name='subjects' AND column_name IN ('max_periods_per_week', 'total_periods_required')
    """)

    result = db.execute(inspector_sql)
    existing_cols = {row[0] for row in result}

    if 'max_periods_per_week' not in existing_cols:
        print("Adding max_periods_per_week column...")
        db.execute(text("ALTER TABLE subjects ADD COLUMN max_periods_per_week INTEGER DEFAULT 3"))

    if 'total_periods_required' not in existing_cols:
        print("Adding total_periods_required column...")
        db.execute(text("ALTER TABLE subjects ADD COLUMN total_periods_required INTEGER DEFAULT 45"))

    db.commit()
    print("Migration complete! Period constraint columns added.")

except Exception as e:
    print(f"Error during migration: {e}")
    db.rollback()
    sys.exit(1)
finally:
    db.close()
