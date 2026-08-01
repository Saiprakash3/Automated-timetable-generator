# Phase 4: Conflict Detection Engine - Design Report

**Status:** Architecture Decision Document  
**Date:** 2026-07-24

---

## CONFIGURATION SUMMARY

| Decision | Choice | Details |
|----------|--------|---------|
| **Configuration** | Fully Configurable | All limits in .env, not hardcoded |
| **Daily Limit Calculation** | Dynamic | Based on working hours - breaks / period length |
| **Weekly Limit** | Configurable | Admins can set max days/week per role |
| **Lab Scheduling** | Continuous Only | Labs must be unbroken blocks (period_start < period_end) |
| **Conflict Severity** | 3-tier | Blocking, Warning, Informational (per API_CONTRACT.md) |

---

## CONFIGURATION PARAMETERS (.env)

```
# Working Hours & Breaks
WORKING_HOURS_START=9        # 9 AM
WORKING_HOURS_END=17         # 5 PM (8 hours)
LUNCH_BREAK_MINUTES=60       # 1 hour
SHORT_BREAKS_MINUTES=30      # Total for all short breaks
PERIOD_LENGTH_MINUTES=60     # Duration of one period

# Calculated (auto-derived at startup):
# Available hours = (17 - 9) - (60 + 30) / 60 = 6.5 hours = 6 periods max per day

# Faculty Constraints
FACULTY_MAX_PERIODS_PER_DAY=6              # Auto-calculated, can override
FACULTY_MAX_DAYS_PER_WEEK=5                # Configurable
FACULTY_MAX_LAB_DAYS_PER_WEEK=3            # Max days with lab assignments

# Lab Coordinator Constraints
LAB_COORDINATOR_MAX_PERIODS_PER_DAY=4      # Less than faculty (more prep time)
LAB_COORDINATOR_MAX_DAYS_PER_WEEK=5        # Configurable

# Conflict Behavior
ALLOW_BLOCKING_CONFLICTS_IN_DRAFT=false    # If true, allow edits even with blocking conflicts (risky)
```

---

## CONFLICT DETECTION - 6 CHECKS

### Check #1: Faculty Double-Booking
**Severity:** BLOCKING  
**When:** Same faculty assigned to two classes at same day/time  
**How:** For each faculty_id in proposed entries:
- Group all entries (existing + proposed) by day
- Check time overlap: `periodStart <= other.periodEnd AND periodEnd >= other.periodStart`
- If overlap found AND different entries → BLOCKING

```python
{
  "id": "conflict_001",
  "type": "faculty_double_booking",
  "severity": "blocking",
  "message": "Dr. Ramesh Kumar is already scheduled for Data Structures (CSE-3A) at this time.",
  "affectedEntries": ["entry_001", "entry_017"]
}
```

---

### Check #2: Faculty Daily Period Limit
**Severity:** WARNING  
**When:** Faculty teaching more than `FACULTY_MAX_PERIODS_PER_DAY` periods per day  
**How:** For each faculty_id:
- Group entries (existing + proposed) by day
- Count total periods: `SUM(periodEnd - periodStart + 1)`
- If count > max → WARNING

```python
{
  "id": "conflict_002",
  "type": "faculty_daily_period_limit",
  "severity": "warning",
  "message": "Dr. Ramesh Kumar would exceed 6 periods on Tuesday (has 5, adding 2 more).",
  "affectedEntries": ["entry_001"]
}
```

---

### Check #3: Faculty Weekly Day Limit
**Severity:** INFORMATIONAL  
**When:** Faculty teaching on more than `FACULTY_MAX_DAYS_PER_WEEK` days per week  
**How:**
- Group entries by faculty_id and day
- Count distinct days in week (existing + proposed)
- If count > max → INFORMATIONAL (not blocking because week view is spread out)

```python
{
  "id": "conflict_003",
  "type": "faculty_weekly_day_limit",
  "severity": "informational",
  "message": "Dr. Ramesh Kumar would teach 6 days this week (beyond 5-day preference).",
  "affectedEntries": ["entry_001"]
}
```

---

### Check #4: Lab Coordinator Daily Limit
**Severity:** WARNING  
**When:** Lab coordinator assigned to more than `LAB_COORDINATOR_MAX_PERIODS_PER_DAY` periods per day  
**How:** Same as Check #2, but for lab_coordinator_id, stricter limit (4 instead of 6)

```python
{
  "id": "conflict_004",
  "type": "lab_coordinator_daily_limit",
  "severity": "warning",
  "message": "K. Srinivas would exceed 4 periods on Monday.",
  "affectedEntries": ["entry_002"]
}
```

---

### Check #5: Lab Coordinator Weekly Day Limit
**Severity:** INFORMATIONAL  
**When:** Lab coordinator assigned on more than `LAB_COORDINATOR_MAX_DAYS_PER_WEEK` days per week  
**How:** Same as Check #3, for lab_coordinator_id

```python
{
  "id": "conflict_005",
  "type": "lab_coordinator_weekly_day_limit",
  "severity": "informational",
  "message": "K. Srinivas would have lab assignments on 6 days (beyond 5-day preference).",
  "affectedEntries": ["entry_002"]
}
```

---

### Check #6: Room Double-Booking
**Severity:** BLOCKING  
**When:** Same room booked for two different classes at same day/time  
**How:** For each room:
- Group entries by day and check time overlap
- If overlap found AND different entries → BLOCKING

```python
{
  "id": "conflict_006",
  "type": "room_double_booking",
  "severity": "blocking",
  "message": "CSE-Lab-2 is already booked for DBMS Lab (CSE-3A) at this time.",
  "affectedEntries": ["entry_002", "entry_018"]
}
```

---

### Check #7: Lab Continuity (Non-standard)
**Severity:** WARNING  
**When:** Lab entry is split across multiple time slots (period_start != period_end)  
**How:**
- Check entry_type == "lab"
- If periodStart != periodEnd → entries are continuous (good)
- If periodStart == periodEnd (single period) → split across sessions (flag as warning)

```python
{
  "id": "conflict_007",
  "type": "lab_not_continuous",
  "severity": "warning",
  "message": "DBMS Lab (entry_002) is only 1 period — labs should be continuous 2+ periods.",
  "affectedEntries": ["entry_002"]
}
```

---

## API ENDPOINT

### POST /api/conflicts/check

**Request:**
```json
{
  "timetableId": "tt_2026_cse_3a",
  "proposedEntries": [
    {
      "id": "entry_001",
      "day": "Tuesday",
      "periodStart": 2,
      "periodEnd": 2,
      "subject": "Data Structures",
      "entry_type": "regular",
      "facultyId": "F1023",
      "facultyName": "Dr. Ramesh Kumar",
      "lab_coordinator_id": null,
      "room": "CSE-201"
    }
  ]
}
```

**Response 200:**
```json
{
  "conflicts": [
    {
      "id": "conflict_001",
      "type": "faculty_double_booking",
      "severity": "blocking",
      "message": "Dr. Ramesh Kumar is already scheduled for Data Structures at this time.",
      "affectedEntries": ["entry_001", "entry_017"]
    },
    {
      "id": "conflict_002",
      "type": "faculty_daily_period_limit",
      "severity": "warning",
      "message": "Dr. Ramesh Kumar would exceed 6 periods on Tuesday.",
      "affectedEntries": ["entry_001"]
    }
  ],
  "summary": {
    "blocking": 1,
    "warning": 1,
    "informational": 0
  }
}
```

**Access:** Anyone (all authenticated users can check conflicts)

---

## WORKFLOW INTEGRATION

### 1. Draft Edits (PATCH /api/timetables/:id)
- Frontend calls `/conflicts/check` BEFORE or AFTER edit
- Backend allows edit regardless of conflicts (admin controls override)
- UI shows warning badge if conflicts detected
- No enforcement on backend (frontend responsibility)

### 2. Send for Approval (POST /api/timetables/:id/send-for-approval)
- Backend runs `/conflicts/check` internally
- If **BLOCKING conflicts** exist → **REJECT** with error
- If only WARNING/INFORMATIONAL → **ALLOW** (HOD can review)
- Response includes detected conflicts so frontend can show them

### 3. Publish (POST /api/timetables/:id/publish)
- Backend runs `/conflicts/check` internally
- If **BLOCKING conflicts** exist → **REJECT** with error
- If only WARNING/INFORMATIONAL → **ALLOW** (final admin decision)
- Response includes detected conflicts

---

## FILES TO CREATE/UPDATE

### Backend Files

**New:**
- `app/schemas/conflict.py` - Conflict check request/response schemas
- `app/services/conflict_service.py` - Conflict detection algorithm
- `app/api/conflicts.py` - Conflict check endpoint

**Update:**
- `app/config.py` - Add configuration parameters
- `app/main.py` - Include conflicts router
- `app/services/workflow_service.py` - Add conflict check to send_for_approval & publish

### Database
- No schema changes

---

## IMPLEMENTATION APPROACH

### Step 1: Create Config (app/config.py additions)
```python
# Add to settings
WORKING_HOURS_START: int = 9
WORKING_HOURS_END: int = 17
LUNCH_BREAK_MINUTES: int = 60
SHORT_BREAKS_MINUTES: int = 30
PERIOD_LENGTH_MINUTES: int = 60

FACULTY_MAX_PERIODS_PER_DAY: int = 6
FACULTY_MAX_DAYS_PER_WEEK: int = 5
LAB_COORDINATOR_MAX_PERIODS_PER_DAY: int = 4
LAB_COORDINATOR_MAX_DAYS_PER_WEEK: int = 5

# Auto-calculate
def calculate_max_periods(self) -> int:
    available_minutes = (self.WORKING_HOURS_END - self.WORKING_HOURS_START) * 60 - \
                       self.LUNCH_BREAK_MINUTES - self.SHORT_BREAKS_MINUTES
    return available_minutes // self.PERIOD_LENGTH_MINUTES
```

### Step 2: Create Schemas
```python
class ConflictCheckRequest(BaseModel):
    timetableId: str
    proposedEntries: List[TimetableEntryCreate]

class Conflict(BaseModel):
    id: str
    type: str
    severity: str  # blocking, warning, informational
    message: str
    affectedEntries: List[str]

class ConflictCheckResponse(BaseModel):
    conflicts: List[Conflict]
    summary: Dict[str, int]  # {"blocking": 1, "warning": 2, "informational": 0}
```

### Step 3: Create Conflict Service
```python
class ConflictService:
    @staticmethod
    def check_conflicts(db, timetable_id, proposed_entries, settings) -> ConflictCheckResponse:
        # Get existing entries
        # Merge with proposed
        # Run 7 checks
        # Return conflicts + summary
```

### Step 4: Create Endpoint
```python
@router.post("/conflicts/check")
async def check_conflicts(
    request: ConflictCheckRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Call ConflictService
    # Return response
```

### Step 5: Update Workflow Service
- In `send_for_approval()`: check conflicts before state transition
- In `publish_timetable()`: check conflicts before state transition
- If BLOCKING conflicts → raise error
- Return conflicts in response

---

## TESTING PLAN

**Unit Tests:**
- Period overlap logic
- Day/week counting
- Constraint validation

**Integration Tests:**
- Detect faculty double-booking
- Detect room conflicts
- Calculate daily period limits correctly
- Enforce BLOCKING conflicts on send-for-approval
- Allow WARNING conflicts to proceed

**Manual Tests:**
- Admin adds overlapping faculty entries → shows as BLOCKING in check
- Admin sends for approval with WARNING conflicts → succeeds with warnings shown
- Admin publishes with BLOCKING conflicts → rejected

---

## READY FOR PHASE 4?

**Decisions confirmed:**
- ✅ Configuration fully flexible (all limits in .env)
- ✅ Daily periods calculated dynamically from working hours
- ✅ Weekly limits configurable per role
- ✅ Labs must be continuous blocks
- ✅ 3-tier severity model (blocking/warning/informational)
- ✅ API contracts with frontend

**Expected outcome:**
- `/conflicts/check` endpoint working
- 7 conflict checks detecting all issues
- Workflow integration (send-for-approval & publish validate conflicts)
- Frontend can call `/conflicts/check` before edits
- Full conflict detection pipeline operational

---

**Ready to proceed? 🚀**
