# Phase 1: Database Models & Migrations - Design Report

**Status:** Architecture Decision Document  
**Date:** 2026-07-21  

---

## CONFIGURATION SUMMARY

| Decision | Choice | Details |
|----------|--------|---------|
| **Delete Strategy** | Soft Delete | Mark as deleted with timestamp, preserve history |
| **Cascade Behavior** | CASCADE + Audit Trail | Delete parent → mark children as deleted, keep audit log |
| **Migration Approach** | Auto-generate (Alembic) | Alembic detects changes, creates migrations automatically |
| **Timestamps** | Yes (created_at, updated_at) | Auto-tracked on all models |
| **Audit Logging** | Yes (deleted_at + history) | Track deletions for compliance/recovery |

---

## DATA MODELS

### Entity Relationship Diagram (Simplified)

```
User (id, name, role, department, password_hash)
  │
  ├── 1:N ─→ Timetable (id, department, year, section, state)
  │           │
  │           └── 1:N ─→ TimetableEntry (id, day, period, subject, faculty)
  │
  └── Can be → ApprovalLog (id, timetable_id, approver_id, action, timestamp)
```

### Model Details

#### 1. **User Model**

```python
class User(Base):
    __tablename__ = "users"
    
    # Primary Key
    id = Column(String(50), primary_key=True)  # F1023, H001, A001, etc.
    
    # User Info
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=True)  # For future use
    department = Column(String(100), nullable=False)  # CSE, ECE, etc.
    
    # Role & Status
    role = Column(String(50), nullable=False)  # admin, hod, faculty, lab_coordinator, student
    is_active = Column(Boolean, default=True)
    
    # Security
    password_hash = Column(String(255), nullable=False)  # bcrypt hash, not plain text
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete marker
    
    # Relationships
    timetables = relationship("Timetable", back_populates="created_by_user")
    approvals = relationship("ApprovalLog", back_populates="user")
```

**Constraints:**
- `id` is UNIQUE, NOT NULL (primary key)
- `role` must be one of: admin, hod, faculty, lab_coordinator, student
- `password_hash` never stores plain text password
- `deleted_at` is NULL if active, datetime if soft-deleted

---

#### 2. **Timetable Model**

```python
class Timetable(Base):
    __tablename__ = "timetables"
    
    # Primary Key
    id = Column(String(50), primary_key=True)  # tt_2026_cse_3a, etc.
    
    # Metadata
    department = Column(String(100), nullable=False)  # CSE, ECE, etc.
    year = Column(Integer, nullable=False)  # 1, 2, 3, 4
    section = Column(String(10), nullable=False)  # A, B, C, etc.
    
    # Workflow State
    state = Column(String(50), default="draft")  # draft, pending, approved, rejected, published
    
    # Creator & Timestamps
    created_by = Column(String(50), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete marker
    
    # Approval Info (nullable until approved)
    approved_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    approved_at = Column(DateTime, nullable=True)
    
    # Publication Info
    published_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    published_at = Column(DateTime, nullable=True)
    
    # Rejection Info (if rejected)
    rejection_reason = Column(Text, nullable=True)
    rejected_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    rejected_at = Column(DateTime, nullable=True)
    
    # Approval Note (from admin to HOD)
    submission_note = Column(Text, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    submitted_by = Column(String(50), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    created_by_user = relationship("User", foreign_keys=[created_by], back_populates="timetables")
    entries = relationship("TimetableEntry", cascade="all, delete-orphan", back_populates="timetable")
    approval_logs = relationship("ApprovalLog", back_populates="timetable")
```

**Constraints:**
- `department`, `year`, `section` create unique constraint (one timetable per class)
- `state` must be one of: draft, pending, approved, rejected, published
- `created_by` always has a User (FK not nullable)
- Soft delete: if `deleted_at` is NULL, timetable is active
- CASCADE delete: if this timetable is deleted, all its entries are marked as deleted too

---

#### 3. **TimetableEntry Model**

```python
class TimetableEntry(Base):
    __tablename__ = "timetable_entries"
    
    # Primary Key
    id = Column(String(50), primary_key=True)  # entry_001, entry_002, etc.
    
    # Foreign Key
    timetable_id = Column(String(50), ForeignKey("timetables.id"), nullable=False)
    
    # Schedule
    day = Column(String(20), nullable=False)  # Monday, Tuesday, etc.
    period_start = Column(Integer, nullable=False)  # 1-6 (or more)
    period_end = Column(Integer, nullable=False)  # 1-6
    
    # Subject & Type
    subject = Column(String(255), nullable=False)  # Data Structures, DBMS Lab, etc.
    entry_type = Column(String(50), default="regular")  # regular, lab, elective, tutorial
    
    # Faculty & Coordinators
    faculty_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    faculty_name = Column(String(255), nullable=True)  # Denormalized for convenience
    
    lab_coordinator_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    
    # Location
    room = Column(String(100), nullable=False)  # CSE-201, CSE-Lab-2, etc.
    
    # Elective Info (if type = elective)
    basket = Column(String(10), nullable=True)  # A, B, C (elective basket)
    applicable_years = Column(JSON, nullable=True)  # [3, 4] for which years this applies
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    deleted_at = Column(DateTime, nullable=True)  # Soft delete marker
    
    # Relationships
    timetable = relationship("Timetable", back_populates="entries")
    faculty = relationship("User", foreign_keys=[faculty_id])
    lab_coordinator = relationship("User", foreign_keys=[lab_coordinator_id])
```

**Constraints:**
- `timetable_id` must reference existing Timetable (FK)
- `day` restricted to: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- `entry_type` must be: regular, lab, elective, tutorial, practical
- `period_start` ≤ `period_end`
- Soft delete: `deleted_at` tracks when entry was deleted (CASCADE from timetable)
- `room` unique per day+period (no two entries in same room at same time)

---

#### 4. **ApprovalLog Model** (Audit Trail)

```python
class ApprovalLog(Base):
    __tablename__ = "approval_logs"
    
    # Primary Key
    id = Column(String(50), primary_key=True)  # UUID
    
    # What happened
    timetable_id = Column(String(50), ForeignKey("timetables.id"), nullable=False)
    action = Column(String(50), nullable=False)  # sent_for_approval, approved, rejected, published
    
    # Who did it
    user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    
    # Details
    reason = Column(Text, nullable=True)  # Rejection reason, approval note, etc.
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    timetable = relationship("Timetable", back_populates="approval_logs")
    user = relationship("User", back_populates="approvals")
```

**Purpose:** Complete audit trail of all timetable state changes
- Track who approved/rejected/published
- Keep rejection reasons
- Recover deletion history if needed

---

## DATABASE SCHEMA FEATURES

### 1. **Soft Deletes**

Instead of removing records, mark them with `deleted_at`:

```sql
-- Hard delete (BAD - loses history)
DELETE FROM timetables WHERE id = 'tt_123';

-- Soft delete (GOOD - preserves history)
UPDATE timetables SET deleted_at = NOW() WHERE id = 'tt_123';

-- Query active records only
SELECT * FROM timetables WHERE deleted_at IS NULL;

-- Query deleted records
SELECT * FROM timetables WHERE deleted_at IS NOT NULL;

-- Restore if needed
UPDATE timetables SET deleted_at = NULL WHERE id = 'tt_123';
```

**Benefits:**
- ✅ Preserve audit trail
- ✅ Recover deleted data if needed
- ✅ Comply with data retention policies
- ✅ Keep historical reports accurate

### 2. **CASCADE Deletes with Soft Delete**

When a Timetable is deleted:

```python
# In SQLAlchemy:
entries = relationship("TimetableEntry", 
                      cascade="all, delete-orphan",  # Physical delete entries
                      back_populates="timetable")

# But Soft Delete Hook:
@event.listens_for(Timetable, "before_delete")
def soft_delete_timetable(mapper, connection, target):
    # Instead of hard delete, soft delete
    target.deleted_at = datetime.utcnow()
    
    # Also mark all entries as deleted
    for entry in target.entries:
        entry.deleted_at = datetime.utcnow()
    
    # Log to ApprovalLog
    log = ApprovalLog(
        timetable_id=target.id,
        user_id=current_user_id,
        action="deleted",
        reason="Soft delete"
    )
    connection.add(log)
```

**Behavior:**
- Delete Timetable → mark as deleted
- Automatically mark all Entries as deleted
- Log action in ApprovalLog
- Data is recoverable

### 3. **Automatic Timestamps**

```python
created_at = Column(DateTime, default=datetime.utcnow)      # Set once
updated_at = Column(DateTime, onupdate=datetime.utcnow)     # Updates automatically
deleted_at = Column(DateTime, nullable=True)                # Set on soft delete
```

### 4. **Indexes for Performance**

Automatic indexes on:
- Primary keys (id)
- Foreign keys (timetable_id, user_id)
- Frequently queried columns (department, year, section, state, deleted_at)

---

## MIGRATION STRATEGY

### Auto-Generate with Alembic

```bash
# 1. Define model in app/models/user.py, timetable.py, etc.

# 2. Auto-generate migration
poetry run alembic revision --autogenerate -m "create users table"

# Creates: alembic/versions/0001_create_users_table.py

# 3. Review migration file (optional, usually correct)

# 4. Apply migration to database
poetry run alembic upgrade head

# Now tables exist in PostgreSQL!
```

### How It Works

1. Alembic compares your SQLAlchemy models to database schema
2. Detects differences (new tables, columns, constraints)
3. Generates Python migration file with SQL commands
4. You review and run the migration
5. `alembic_version` table tracks which migrations have been applied

**Files Created:**
```
migrations/
├── alembic.ini              ← Alembic config
├── env.py                   ← Migration environment setup
├── script.py.mako           ← Migration template
└── versions/
    ├── 0001_initial_schema.py
    ├── 0002_add_deleted_at.py
    └── ... (future migrations)
```

---

## RELATIONSHIPS & CONSTRAINTS

### Foreign Key Relationships

```
Users
  ├── created_by_user ← Timetable (many timetables per creator)
  ├── approved_by ← Timetable (HOD approval)
  ├── published_by ← Timetable (Admin publish)
  └── approvals ← ApprovalLog (audit trail)

Timetables
  └── entries ← TimetableEntry (many entries per timetable)

Entries
  ├── faculty_id ← User
  └── lab_coordinator_id ← User
```

### Cascade Behavior

- **Timetable → TimetableEntry:** CASCADE (soft delete entries when timetable deleted)
- **User → Timetable:** RESTRICT (cannot delete user if they created timetables) — OR SET NULL
- **User → ApprovalLog:** RESTRICT (keep audit trail even if user deleted)

---

## DATABASE QUERIES (Examples)

### Get Active Timetables Only

```python
active = db.query(Timetable).filter(Timetable.deleted_at == None).all()
```

### Get Timetable with All Entries

```python
tt = db.query(Timetable)\
    .filter(Timetable.id == 'tt_123', Timetable.deleted_at == None)\
    .first()

entries = [e for e in tt.entries if e.deleted_at is None]
```

### Get Audit Log (History)

```python
logs = db.query(ApprovalLog)\
    .filter(ApprovalLog.timetable_id == 'tt_123')\
    .order_by(ApprovalLog.created_at.desc())\
    .all()
```

### Get All Users

```python
users = db.query(User).filter(User.deleted_at == None).all()
```

---

## IMPLEMENTATION CHECKLIST

When we implement Phase 1, we will:

- ✅ Create `app/models/user.py` with User model
- ✅ Create `app/models/timetable.py` with Timetable model
- ✅ Create `app/models/timetable_entry.py` with TimetableEntry model
- ✅ Create `app/models/approval_log.py` with ApprovalLog model
- ✅ Set up Alembic migrations folder
- ✅ Auto-generate initial migration (0001_initial_schema.py)
- ✅ Apply migration to all 3 databases (dev, test, prod)
- ✅ Implement soft-delete hooks in SQLAlchemy
- ✅ Create seed data (test users, sample timetables)
- ✅ Create pytest fixtures for models
- ✅ Write unit tests for model relationships

---

## READY TO IMPLEMENT PHASE 1?

**Decisions confirmed:**
- ✅ Soft delete strategy (with deleted_at timestamp)
- ✅ CASCADE deletes + audit trail via ApprovalLog
- ✅ Auto-generate migrations with Alembic
- ✅ Automatic timestamps (created_at, updated_at, deleted_at)

**Expected outcome:**
- Database tables created in all 3 environments (dev/test/prod)
- Models ready for Phase 2 (Authentication)
- Test data seeded and ready
- Migration system in place for future schema changes

---

**Ready to proceed? 🚀**
