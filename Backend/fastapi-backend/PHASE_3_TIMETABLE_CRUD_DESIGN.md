# Phase 3: Timetable CRUD & Workflow - Design Report

**Status:** Architecture Decision Document  
**Date:** 2026-07-22  

---

## CONFIGURATION SUMMARY

| Decision | Choice | Details |
|----------|--------|---------|
| **List Filtering** | Frontend-driven | Implement filters frontend asks for, not pre-guessing |
| **Workflow Validation** | Conflict-based** | If no conflicts → allow state movement, else block |
| **Access Control** | Open viewing, admin controls | Anyone can view all timetables, admin/HOD manage |
| **Pagination** | Yes (limit & offset) | Supports large datasets efficiently |

---

## ENDPOINTS TO BUILD

### 1. GET /api/timetables (List all timetables)
```
Query Parameters:
  - limit: int (default 20, max 100)
  - offset: int (default 0)
  - department: str (optional, CSE, ECE, etc.)
  - year: int (optional, 1-4)
  - section: str (optional, A, B, C)
  - state: str (optional, draft, pending, approved, rejected, published)
  - created_by: str (optional, user ID)

Response 200:
{
  "timetables": [
    {
      "id": "tt_2026_cse_3a",
      "department": "CSE",
      "year": 3,
      "section": "A",
      "state": "draft",
      "createdBy": "A001",
      "createdAt": "2026-07-01T09:00:00Z",
      "updatedAt": "2026-07-15T11:30:00Z",
      "approvedBy": null,
      "publishedAt": null
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

**Access:** Anyone (Admin sees all, others see filtered by role)

---

### 2. GET /api/timetables/:id (Get timetable detail)
```
Response 200:
{
  "id": "tt_2026_cse_3a",
  "department": "CSE",
  "year": 3,
  "section": "A",
  "state": "draft",
  "entries": [
    {
      "id": "entry_001",
      "day": "Monday",
      "periodStart": 1,
      "periodEnd": 1,
      "type": "regular",
      "subject": "Data Structures",
      "facultyId": "F1023",
      "facultyName": "Dr. Ramesh Kumar",
      "room": "CSE-201"
    }
  ],
  "createdBy": "A001",
  "createdAt": "2026-07-01T09:00:00Z"
}
```

**Access:** Anyone

---

### 3. POST /api/timetables (Create new timetable)
```
Request (Admin only):
{
  "department": "CSE",
  "year": 3,
  "section": "A"
}

Response 201:
{
  "id": "tt_2026_cse_3a",
  "department": "CSE",
  "year": 3,
  "section": "A",
  "state": "draft",
  "entries": [],
  "createdBy": "A001",
  "createdAt": "2026-07-22T10:00:00Z"
}
```

**Access:** Admin only  
**Validation:** department, year, section required

---

### 4. PATCH /api/timetables/:id (Update timetable entries)
```
Request (Admin only):
{
  "entries": [
    {
      "id": "entry_001",
      "day": "Tuesday",
      "periodStart": 2,
      "periodEnd": 2,
      "subject": "Data Structures",
      "facultyId": "F1023",
      "room": "CSE-201"
    }
  ]
}

Response 200:
{
  "id": "tt_2026_cse_3a",
  "state": "draft",
  "entries": [...updated entries...]
}
```

**Access:** Admin only  
**Validation:** 
  - Timetable must be in draft state
  - Check for conflicts (but allow if admin chooses to)
  - Validate entry fields

---

### 5. POST /api/timetables/:id/send-for-approval (Submit for HOD review)
```
Request (Admin only):
{
  "note": "All labs scheduled in second half of week"
}

Response 200:
{
  "id": "tt_2026_cse_3a",
  "state": "pending",
  "note": "All labs scheduled in second half of week",
  "submittedBy": "A001",
  "submittedAt": "2026-07-22T11:00:00Z"
}
```

**Access:** Admin only  
**Validation:** 
  - Timetable must be in draft state
  - Check for BLOCKING conflicts (if any, reject)
  - Transition to pending

---

### 6. POST /api/timetables/:id/approve (HOD approves)
```
Request (HOD only):
{}

Response 200:
{
  "id": "tt_2026_cse_3a",
  "state": "approved",
  "approvedBy": "H001",
  "approvedAt": "2026-07-22T14:00:00Z"
}
```

**Access:** HOD only  
**Validation:** Timetable must be in pending state

---

### 7. POST /api/timetables/:id/request-changes (HOD requests changes)
```
Request (HOD only):
{
  "reason": "Period clash for Dr. Rao on Monday"
}

Response 200:
{
  "id": "tt_2026_cse_3a",
  "state": "rejected",
  "reason": "Period clash for Dr. Rao on Monday",
  "requestedBy": "H001",
  "requestedAt": "2026-07-22T14:00:00Z"
}
```

**Access:** HOD only  
**Validation:** Timetable must be in pending state

---

### 8. POST /api/timetables/:id/publish (Admin publishes)
```
Request (Admin only):
{}

Response 200:
{
  "id": "tt_2026_cse_3a",
  "state": "published",
  "publishedBy": "A001",
  "publishedAt": "2026-07-22T15:00:00Z"
}
```

**Access:** Admin only  
**Validation:** 
  - Timetable must be in approved state
  - Check for BLOCKING conflicts (if any, reject)

---

## WORKFLOW STATE MACHINE

### Allowed Transitions

```
draft
  ├─→ pending (send-for-approval, conflict check)
  └─→ deleted (soft delete)

pending
  ├─→ approved (HOD approves, no conflict check needed)
  ├─→ rejected (HOD requests changes, no conflict check)
  └─→ draft (revert to draft for more edits)

approved
  ├─→ published (admin publishes, conflict check)
  ├─→ rejected (revert if issues found)
  └─→ draft (revert for edits)

rejected
  └─→ draft (revert to draft for edits)

published
  ├─→ draft (revert if needed)
  └─→ deleted (soft delete)

deleted
  └─ (no further transitions)
```

### Conflict Handling Strategy

**On Draft Edits (PATCH /timetables/:id):**
- Run conflict check
- Show warnings but ALLOW edit (admin chooses to ignore)
- No blocking (user controls override)

**On Submit for Approval (POST /send-for-approval):**
- Run conflict check
- If BLOCKING conflicts exist → REJECT with error
- If only WARNING/INFO → ALLOW (HOD can evaluate)

**On Publish (POST /publish):**
- Run conflict check
- If BLOCKING conflicts exist → REJECT
- If only WARNING/INFO → ALLOW (final decision by admin)

---

## FILTERING STRATEGY

### Frontend Asks For Filters

Since frontend drives this, we implement what it requests:

**Initial (likely):**
```
GET /api/timetables?department=CSE&state=draft
GET /api/timetables?year=3&section=A
GET /api/timetables?created_by=A001
```

**Add these as frontend needs them:**
```
GET /api/timetables?search=Math
GET /api/timetables?created_after=2026-07-01
GET /api/timetables?faculty_id=F1023
```

**We'll implement:**
- Always support: department, year, section, state
- Easy to add: created_by, created_after, created_before
- Later: text search, faculty filters

---

## PAGINATION IMPLEMENTATION

### Query Parameters
```
limit:  int (default 20, max 100)
offset: int (default 0)
```

### Response Format
```json
{
  "timetables": [...],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "hasMore": true
}
```

### Example Queries
```
GET /api/timetables?limit=20&offset=0      # Page 1
GET /api/timetables?limit=20&offset=20     # Page 2
GET /api/timetables?limit=20&offset=40     # Page 3
```

---

## ACCESS CONTROL MATRIX

| Endpoint | Admin | HOD | Faculty | Lab Coord | Student |
|----------|-------|-----|---------|-----------|---------|
| GET /timetables | See all | See dept | See own | See own | See own |
| GET /timetables/:id | See all | See dept | See own | See own | See own |
| POST /timetables | ✅ Create | ❌ | ❌ | ❌ | ❌ |
| PATCH /timetables/:id | ✅ Edit | ❌ | ❌ | ❌ | ❌ |
| POST /send-for-approval | ✅ Submit | ❌ | ❌ | ❌ | ❌ |
| POST /approve | ❌ | ✅ Approve | ❌ | ❌ | ❌ |
| POST /request-changes | ❌ | ✅ Request | ❌ | ❌ | ❌ |
| POST /publish | ✅ Publish | ❌ | ❌ | ❌ | ❌ |

**"See own" = Resolved based on user role**
- Faculty: entries where they're faculty_id
- Student: timetable matching their year+section
- Lab Coord: entries where they're lab_coordinator_id

---

## FILES TO CREATE/UPDATE

### Backend Files

**New:**
- `app/schemas/timetable.py` - Timetable request/response schemas
- `app/schemas/timetable_entry.py` - Entry schemas
- `app/api/timetables.py` - 8 timetable endpoints
- `app/services/timetable_service.py` - CRUD business logic
- `app/services/workflow_service.py` - State machine logic

**Update:**
- `app/main.py` - Include timetable routes

### Frontend Files (Manual)

**Update:**
- `Frontend/src/services/api/client.ts` - Add timetable methods
- `Frontend/src/types/timetable.ts` - Add types

---

## IMPLEMENTATION APPROACH

### Step 1: Create Schemas (Pydantic)
```python
class TimetableCreate(BaseModel):
    department: str
    year: int
    section: str

class TimetableUpdate(BaseModel):
    entries: List[TimetableEntryCreate]

class TimetableResponse(BaseModel):
    id: str
    state: str
    entries: List[TimetableEntryResponse]
    ...
```

### Step 2: Create Services
```python
class TimetableService:
    def list(db, filters, limit, offset)
    def get(db, id)
    def create(db, data, user)
    def update(db, id, data, user)
    def send_for_approval(db, id, note, user)
    def approve(db, id, user)
    def request_changes(db, id, reason, user)
    def publish(db, id, user)
```

### Step 3: Create Endpoints
```python
@router.get("/timetables")
@router.get("/timetables/:id")
@router.post("/timetables")
@router.patch("/timetables/:id")
@router.post("/timetables/:id/send-for-approval")
@router.post("/timetables/:id/approve")
@router.post("/timetables/:id/request-changes")
@router.post("/timetables/:id/publish")
```

---

## TESTING PLAN

**Unit Tests:**
- State transitions (valid vs invalid)
- Conflict detection logic
- Filter building

**Integration Tests:**
- Full workflow: draft → pending → approved → published
- Draft rejection if blocking conflicts
- Role-based access control
- Pagination

**Manual Tests:**
- Admin creates timetable
- Admin adds entries with conflicts
- Admin submits for approval
- HOD approves/rejects
- Admin publishes

---

## READY FOR PHASE 3?

**Decisions confirmed:**
- ✅ Frontend-driven filtering
- ✅ Conflict-based state transitions
- ✅ Open viewing, admin control
- ✅ Pagination with limit/offset

**Expected outcome:**
- 8 timetable endpoints working
- Full workflow state machine
- Conflict checking integrated
- Pagination support
- Role-based access control

---

**Ready to proceed? 🚀**
