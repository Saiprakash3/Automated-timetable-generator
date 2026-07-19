# API Contract — Automated Timetable Generator

**Status:** Draft for frontend build. Not yet implemented on backend — this is the contract the frontend will build against until the backend developer joins.

**Base URL (dev):** `http://localhost:4000/api`

**Scope:** Auth, Timetable CRUD, Conflict Check only (minimum viable contract per current project stage). Additional endpoints (user management, setup wizard, bulk import) to be added when their screens are built.

---

## Conventions

- All request/response bodies are JSON.
- All authenticated requests send `Authorization: Bearer <token>`.
- Timestamps are ISO 8601 strings (UTC).
- Role values: `"admin" | "hod" | "faculty" | "lab_coordinator" | "student"`.
- Conflict severity values: `"blocking" | "warning" | "informational"` (3-tier model per INTERACTION_DECISIONS.md).
- Workflow state values: `"draft" | "pending" | "approved" | "rejected" | "published"`.
- Standard error shape:
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The ID or password entered is incorrect."
  }
}
```

---

## 1. Auth

### POST /auth/login

Single login page, all 5 roles. Role is a UI convenience only — **must be validated server-side against the credential**, per confirmed decision.

**Request**
```json
{
  "identifier": "F1023",
  "password": "********",
  "selectedRole": "faculty"
}
```

**Response — 200 success**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "F1023",
    "name": "Dr. Ramesh Kumar",
    "role": "faculty",
    "department": "CSE"
  }
}
```

**Response — 401 role mismatch** (identifier/password valid, but doesn't match selected role — this is the server-side trust check the dropdown does NOT perform on its own)
```json
{
  "error": {
    "code": "ROLE_MISMATCH",
    "message": "This account is not registered as Faculty."
  }
}
```

**Response — 401 invalid credentials**
```json
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The ID or password entered is incorrect."
  }
}
```

> Note: no lockout / attempt limit, per confirmed decision (passwords are admin-issued, no self-service reset).

### POST /auth/logout
No body. Invalidates token server-side.

### GET /auth/me
Returns current session's user object (same shape as login response `user`). Used on app load to restore session.

---

## Dummy Users (for frontend dev/testing)

| identifier | password | role | notes |
|---|---|---|---|
| `A001` | `admin123` | admin | sole setup/edit authority |
| `H001` | `hod123` | hod | also has a Faculty record (teaches) |
| `F1023` | `fac123` | faculty | regular faculty, no HOD/coordinator role |
| `LC004` | `labco123` | lab_coordinator | Lab-Coordinator-only, no Faculty identity |
| `LC005` | `labco123` | lab_coordinator | also has a separate Faculty record (the ~30% overlap case) |
| `S3021` | `stu123` | student | 3rd year section A |

---

## 2. Timetable CRUD

### GET /timetables

List timetables, filterable. Admin sees all; HOD sees their department's; Faculty/Student/Lab Coordinator see only their own resolved view (handled via `/timetables/me` below instead).

**Query params:** `?department=CSE&year=3&section=A&state=draft`

**Response — 200**
```json
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
  ]
}
```

### GET /timetables/:id

Full timetable detail including all scheduled entries.

**Response — 200**
```json
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
    },
    {
      "id": "entry_002",
      "day": "Monday",
      "periodStart": 4,
      "periodEnd": 6,
      "type": "lab",
      "subject": "DBMS Lab",
      "facultyId": "F1088",
      "facultyName": "Dr. Anitha Rao",
      "labCoordinatorId": "LC004",
      "room": "CSE-Lab-2"
    },
    {
      "id": "entry_003",
      "day": "Wednesday",
      "periodStart": 5,
      "periodEnd": 5,
      "type": "elective",
      "subject": "Cloud Computing (Elective Basket B)",
      "facultyId": "F1099",
      "facultyName": "Dr. Vijay Singh",
      "room": "CSE-305",
      "basket": "B",
      "applicableYears": [3, 4]
    }
  ]
}
```

### POST /timetables

Create a new (draft) timetable. Admin only.

**Request**
```json
{
  "department": "CSE",
  "year": 3,
  "section": "A"
}
```
**Response — 201** → same shape as GET /timetables/:id, `entries: []`, `state: "draft"`.

### PATCH /timetables/:id

Edit entries, metadata. Admin only (manual editing per PS-02).

**Request** (example: edit a single entry)
```json
{
  "entries": [
    {
      "id": "entry_001",
      "day": "Tuesday",
      "periodStart": 2,
      "periodEnd": 2
    }
  ]
}
```
**Response — 200** → updated timetable object. **Note:** this endpoint does NOT auto-check conflicts — frontend must call `POST /conflicts/check` separately before/after edits, per the safe-editing pattern in PS-02.

### POST /timetables/:id/send-for-approval

Admin action: submits the timetable for HOD review and locks it, all in-app. Sets `state: "pending"`. **No email is sent by this endpoint** — the email hand-off was removed from the design (`INTERACTION_DECISIONS.md` §11); the HOD is notified purely by the item appearing in their in-app Approvals queue.

**Request**
```json
{
  "note": "All labs are scheduled in the second half of the week."
}
```
Optional note to HOD (persisted, shown on Approval Detail — F-04 step 3).

**Response — 200**
```json
{
  "id": "tt_2026_cse_3a",
  "state": "pending",
  "note": "All labs are scheduled in the second half of the week.",
  "submittedBy": "A001",
  "submittedAt": "2026-07-16T10:00:00Z"
}
```

### POST /timetables/:id/approve

HOD action only. Sets `state: "approved"`. **Does not publish** — approval and publish are separate steps per confirmed decision.

**Response — 200**
```json
{
  "id": "tt_2026_cse_3a",
  "state": "approved",
  "approvedBy": "H001",
  "approvedAt": "2026-07-16T14:20:00Z"
}
```

### POST /timetables/:id/request-changes

HOD action (the renamed "Reject" per PATTERNS.md — UI label is "Request changes"). Sets `state: "rejected"`, requires a reason.

**Request**
```json
{
  "reason": "Period clash for Dr. Rao on Monday — please review lab scheduling."
}
```
**Response — 200**
```json
{
  "id": "tt_2026_cse_3a",
  "state": "rejected",
  "reason": "Period clash for Dr. Rao on Monday — please review lab scheduling.",
  "requestedBy": "H001",
  "requestedAt": "2026-07-16T14:25:00Z"
}
```

### POST /timetables/:id/publish

Admin-only, manual, and only valid when `state: "approved"`. Sets `state: "published"`.

**Response — 200**
```json
{
  "id": "tt_2026_cse_3a",
  "state": "published",
  "publishedBy": "A001",
  "publishedAt": "2026-07-16T15:00:00Z"
}
```

### GET /timetables/me

Resolved read-only schedule for the logged-in user — used by Faculty, Student, Lab Coordinator, and HOD-on-mobile (routed to Faculty view). Backend resolves which timetable(s)/entries apply based on token identity, not a role param from the client.

**Response — 200**
```json
{
  "role": "faculty",
  "entries": [
    { "id": "entry_001", "day": "Monday", "periodStart": 1, "periodEnd": 1, "type": "regular", "subject": "Data Structures", "section": "CSE-3A", "room": "CSE-201" }
  ]
}
```

---

## 3. Conflict Check

### POST /conflicts/check

Runs the full 6-check taxonomy against a proposed timetable state (existing + pending edits). Called by frontend before/after any manual edit, per PS-02 safe-editing pattern. Designed extensibly — backend may return additional check types beyond the current 6 without breaking this contract.

**Request**
```json
{
  "timetableId": "tt_2026_cse_3a",
  "proposedEntries": [
    { "id": "entry_001", "day": "Tuesday", "periodStart": 2, "periodEnd": 2, "facultyId": "F1023" }
  ]
}
```

**Response — 200**
```json
{
  "conflicts": [
    {
      "id": "conflict_001",
      "type": "faculty_double_booking",
      "severity": "blocking",
      "message": "Dr. Ramesh Kumar is already scheduled for another class at this time.",
      "affectedEntries": ["entry_001", "entry_017"]
    },
    {
      "id": "conflict_002",
      "type": "faculty_daily_period_limit",
      "severity": "warning",
      "message": "Dr. Ramesh Kumar would exceed 6 periods on Tuesday.",
      "affectedEntries": ["entry_001"]
    },
    {
      "id": "conflict_003",
      "type": "lab_coordinator_weekly_day_limit",
      "severity": "informational",
      "message": "This lab coordinator is nearing the 4-day/week assignment limit.",
      "affectedEntries": ["entry_002"]
    }
  ],
  "summary": {
    "blocking": 1,
    "warning": 1,
    "informational": 1
  }
}
```

> **Known conflict `type` values (extensible — do not hardcode an exhaustive enum in frontend types):**
> `faculty_double_booking`, `room_double_booking`, `faculty_daily_period_limit`, `faculty_weekly_period_limit`, `faculty_min_daily_periods`, `lab_coordinator_daily_limit`, `lab_coordinator_weekly_day_limit`, `elective_basket_clash`, `faculty_max_lab_days`. (9 listed here across the 6 conceptual check categories — exact taxonomy to be finalized against INTERACTION_DECISIONS.md; frontend should treat `type` as an open string, not a fixed union, and drive display purely off `severity`.)

---

## Open items affecting this contract

- ~~Conflict Badge color-per-severity mapping is unresolved~~ — **resolved.** `FOUNDATIONS.md` §10.2 defines it: `bg=100/fg=700/border=500` per tier (danger/blocking, warning, info/informational). No `OPEN_QUESTIONS.md` exists in this project — that reference was stale.
- ~~Workflow-state → semantic color mapping unresolved~~ — **resolved**, same section: draft=neutral, pending=warning, approved=success, published=**primary** (not success).
- Bulk Import Stepper, Setup Wizard, and user management endpoints are **not yet in scope** for this contract — add when those screens are built.

---

## For the backend developer

This contract + the dummy data above should be enough to stand up a mock JSON server (`json-server`, or a simple Express + in-memory store) so frontend work isn't blocked. Recommended: mirror this exact shape when the real DB/API is built, then swap the frontend's `services/api/client.ts` base URL — no component changes should be needed if the contract is honored.
