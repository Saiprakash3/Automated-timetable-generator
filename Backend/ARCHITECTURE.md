# FastAPI Backend Architecture — Timetable Generator

**Status:** Architecture Decision Document (pre-implementation)  
**Date:** 2026-07-21  
**Author:** Backend Design Phase

---

## TABLE OF CONTENTS

1. [Architecture Overview](#architecture-overview)
2. [Database Strategy (Dev/Test/Prod)](#database-strategy)
3. [Testing Strategy (Unit/Integration/Regression)](#testing-strategy)
4. [Project Structure](#project-structure)
5. [Technology Stack](#technology-stack)
6. [API & Data Flow](#api--data-flow)
7. [Security & Authentication](#security--authentication)
8. [Deployment & Environment Configuration](#deployment--environment-configuration)

---

## ARCHITECTURE OVERVIEW

### High-Level Design

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React/TS)                      │
│              (Separate repo, ignored for now)               │
└────────────────────┬────────────────────────────────────────┘
                     │ HTTP/REST (JSON)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                    FastAPI Application                      │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Auth API   │  │ Timetable    │  │  Conflict Check  │  │
│  │   Layer      │  │   API Layer  │  │      Layer       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Middleware Layer                            │   │
│  │  • JWT Token Validation                             │   │
│  │  • Role-Based Access Control (RBAC)                 │   │
│  │  • Request/Response Logging                         │   │
│  │  • Error Handling                                   │   │
│  └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Business Logic Layer                        │   │
│  │  • Authentication Services                          │   │
│  │  • Timetable Management Services                    │   │
│  │  • Conflict Detection Engine                        │   │
│  │  • Workflow State Machine                           │   │
│  └──────────────────────────────────────────────────────┘   │
├──────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────┐   │
│  │         Data Access Layer (SQLAlchemy ORM)          │   │
│  │  • Models Definition                                │   │
│  │  • Query Builder                                    │   │
│  │  • Relationships & Constraints                      │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────┬────────────────────────────────────────┘
                     │
     ┌───────────────┼───────────────┐
     │               │               │
┌────▼────┐  ┌──────▼──────┐  ┌─────▼──────┐
│   Dev   │  │    Test     │  │ Production │
│   DB    │  │     DB      │  │     DB     │
│PostgreSQL  │ PostgreSQL  │  │PostgreSQL  │
└─────────┘  └─────────────┘  └────────────┘
 (Local)     (In-Memory/    (AWS RDS/
             Isolated DB)    Neon/etc)
```

---

## DATABASE STRATEGY

### Three-Environment Setup

#### 1. **Development Environment**
```
Connection: Local PostgreSQL (Docker or Local Install)
Purpose: Developer-friendly, full data persistence
Configuration:
  - DATABASE_URL: postgresql://user:pass@localhost:5432/timetable_dev
  - Auto-migrations on app startup
  - Seed data loaded from fixtures
  - Full logging enabled
  - No performance constraints
Features:
  - Hot-reload on code changes
  - Full database inspection via pgAdmin (optional)
  - Reset-and-seed capability for clean slate testing during development
```

#### 2. **Test Environment**
```
Connection: Isolated PostgreSQL Instance (Separate DB or In-Memory SQLite fallback)
Purpose: Fast, isolated, reproducible testing
Configuration:
  - DATABASE_URL: postgresql://user:pass@localhost:5432/timetable_test
  - OR: SQLite in-memory (sqlite:///:memory:) for ultra-fast tests
  - Fresh schema per test run (via pytest fixtures)
  - No seed data (tests must set up their own)
  - Minimal logging (only errors)
Strategy:
  - Each test gets a clean database
  - Transactions rolled back after each test
  - No side effects between tests
  - Fast execution (< 5 seconds for full suite)
Recommendation:
  - Use PostgreSQL with transactional rollback for integration tests (realistic)
  - SQLite in-memory for unit tests (speed)
  - Hybrid approach: SQLite for unit, PostgreSQL for integration
```

#### 3. **Production Environment**
```
Connection: Managed PostgreSQL Service
Options:
  - AWS RDS (PostgreSQL managed service)
  - Neon (Serverless PostgreSQL)
  - Supabase (PostgreSQL + extras)
  - DigitalOcean Managed PostgreSQL
Configuration:
  - DATABASE_URL: from environment secret (Heroku/Railway/AWS env var)
  - SSL/TLS connection required
  - Connection pooling (PgBouncer or app-level)
  - Read replicas (optional, for scaling)
  - Automated backups
  - Monitoring & alerts
Strategy:
  - No migrations run manually (CI/CD pipeline runs them)
  - Connection pool size tuned for concurrency
  - Query optimization & indexing verified
  - Sensitive data encrypted at rest
```

### Database Connection Architecture

```python
# pseudocode structure

class DatabaseConfig:
    def __init__(self, environment: str):
        if environment == "dev":
            self.database_url = "postgresql://user:pass@localhost:5432/timetable_dev"
            self.echo = True  # log all SQL
            self.pool_size = 5
            self.max_overflow = 10
            
        elif environment == "test":
            self.database_url = "sqlite:///:memory:"  # OR isolated PostgreSQL
            self.echo = False
            self.pool_size = 1
            
        elif environment == "production":
            self.database_url = os.getenv("DATABASE_URL")
            self.echo = False
            self.pool_size = 20
            self.max_overflow = 40
            self.ssl_mode = "require"
```

### Connection Pooling Strategy

```
├── Development
│   └── 5 connections, 10 overflow (for quick experiments)
│
├── Test
│   └── 1 connection per test (or in-memory, no pooling)
│
└── Production
    └── 20 connections, 40 overflow (tune based on load)
        └── PgBouncer if needed for additional connection management
```

---

## TESTING STRATEGY

### Three-Layer Testing Pyramid

```
                     ▲
                    ╱ ╲
                   ╱   ╲        End-to-End Tests
                  ╱     ╲       (Regression)
                 ╱───────╲      5-10 tests
                ╱         ╲
               ╱───────────╲    Integration Tests
              ╱             ╲   40-60 tests
             ╱───────────────╲
            ╱─────────────────╲  Unit Tests
           ╱                   ╲ 80-100 tests
          ╱─────────────────────╲
```

### 1. **Unit Tests** (80-100 tests)

**What:** Test individual functions/services in isolation

**Examples:**
```
- Authentication Service
  ✓ Hash password correctly
  ✓ Verify password matches hash
  ✓ Generate JWT token with correct payload
  ✓ Validate JWT token signature
  ✓ Detect expired token

- Conflict Detection Engine
  ✓ Detect faculty double-booking
  ✓ Detect faculty daily period limit exceeded
  ✓ Detect room double-booking
  ✓ Detect lab coordinator limits
  ✓ Calculate correct conflict severity

- Validation
  ✓ Validate timetable entry times
  ✓ Validate user role enum
  ✓ Validate workflow state transitions
```

**Database:** SQLite in-memory (mocked queries, no DB access)  
**Speed:** < 3 seconds for full suite  
**Tools:** pytest, pytest-cov (coverage)  
**Execution:** During development, pre-commit hook

### 2. **Integration Tests** (40-60 tests)

**What:** Test complete workflows with real database

**Examples:**
```
- Authentication Flow
  ✓ User login → receive token → token valid
  ✓ Login with wrong password → 401 error
  ✓ Login role mismatch → 401 error
  ✓ Get /auth/me with valid token → return user
  ✓ Get /auth/me with invalid token → 401 error
  ✓ Logout invalidates token

- Timetable CRUD Flow
  ✓ Admin creates timetable → stored in DB → retrievable
  ✓ Admin updates timetable entries → changes persisted
  ✓ Non-admin attempts create → 403 Forbidden
  ✓ Faculty views own timetable via /timetables/me
  ✓ HOD sees department timetables via filters

- Workflow State Machine
  ✓ Draft → Pending (admin sends for approval)
  ✓ Pending → Approved (HOD approves)
  ✓ Pending → Rejected (HOD requests changes)
  ✓ Approved → Published (admin publishes)
  ✓ Invalid transitions are rejected

- Conflict Check Flow
  ✓ POST /conflicts/check returns correct severity
  ✓ Blocking conflict blocks publish
  ✓ Warning conflict allows but flags
```

**Database:** Isolated PostgreSQL instance (fresh schema per test)  
**Speed:** 10-15 seconds for full suite  
**Tools:** pytest, pytest-asyncio, SQLAlchemy Session fixtures  
**Execution:** CI/CD pipeline, before merge

### 3. **Regression Tests** (End-to-End) (5-10 tests)

**What:** Test critical user journeys, catch breaking changes

**Examples:**
```
- Admin Timetable Creation & Publishing Journey
  1. Admin logs in
  2. Creates timetable for CSE 3A
  3. Adds 20 entries (various types)
  4. Checks conflicts (should have 0 blocking)
  5. Sends for approval
  6. HOD approves
  7. Admin publishes
  8. Faculty sees it in /timetables/me

- Faculty/Student View Journey
  1. Faculty logs in
  2. Views own schedule via /timetables/me
  3. Sees all 20 entries correctly
  4. Cannot modify (no edit button)

- Conflict Detection Regression
  1. Scenario: Dr. Kumar scheduled 8am-9am Mon AND 8am-9am Mon (duplicate)
  2. Conflict check returns faculty_double_booking (blocking)
  3. Cannot publish until resolved

- Role-Based Access Control
  1. Student tries to access /api/timetables (admin endpoint)
  2. Returns 403 Forbidden
  3. Student can access /api/timetables/me
  4. Results match their year+section only
```

**Database:** Production-like PostgreSQL  
**Speed:** 30-60 seconds for full suite  
**Tools:** pytest, httpx (async HTTP client), fixtures  
**Execution:** Before production deployment, manual smoke tests

---

## PROJECT STRUCTURE

```
Backend/
├── fastapi-backend/                    ← MAIN APPLICATION
│   ├── .env.example                    ← Template
│   ├── .env                            ← GITIGNORE (local secrets)
│   ├── .env.test                       ← Test database URL
│   ├── .env.prod                       ← Production URL (CI/CD secrets)
│   ├── pyproject.toml                  ← Dependencies (Poetry)
│   ├── requirements.txt                ← Frozen dependencies
│   ├── requirements-dev.txt            ← Dev-only dependencies
│   ├── Dockerfile                      ← Container image
│   ├── docker-compose.yml              ← Dev stack (app + PostgreSQL)
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                     ← FastAPI app + startup/shutdown
│   │   ├── config.py                   ← Pydantic Settings (env vars)
│   │   ├── database.py                 ← SQLAlchemy setup, SessionLocal
│   │   │
│   │   ├── models/                     ← SQLAlchemy ORM models
│   │   │   ├── __init__.py
│   │   │   ├── base.py                 ← Base model class
│   │   │   ├── user.py                 ← User model
│   │   │   ├── timetable.py            ← Timetable model
│   │   │   ├── timetable_entry.py      ← TimetableEntry model
│   │   │   └── approval.py             ← Approval workflow model
│   │   │
│   │   ├── schemas/                    ← Pydantic schemas (request/response)
│   │   │   ├── __init__.py
│   │   │   ├── user.py                 ← UserLogin, UserResponse
│   │   │   ├── timetable.py            ← TimetableCreate, TimetableUpdate
│   │   │   ├── timetable_entry.py      ← EntryCreate, EntryResponse
│   │   │   └── conflict.py             ← ConflictCheck request/response
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                 ← Auth endpoints (login, logout, me)
│   │   │   ├── timetables.py           ← Timetable CRUD endpoints
│   │   │   ├── conflicts.py            ← Conflict check endpoint
│   │   │   └── dependencies.py         ← Shared dependencies (get_current_user)
│   │   │
│   │   ├── services/                   ← Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── auth_service.py         ← Login, token generation
│   │   │   ├── user_service.py         ← User queries/updates
│   │   │   ├── timetable_service.py    ← Timetable CRUD logic
│   │   │   ├── workflow_service.py     ← State machine (draft→pending→etc)
│   │   │   └── conflict_service.py     ← Conflict detection algorithm
│   │   │
│   │   ├── middleware/
│   │   │   ├── __init__.py
│   │   │   ├── auth.py                 ← JWT validation middleware
│   │   │   ├── rbac.py                 ← Role-based access control
│   │   │   └── logging.py              ← Request/response logging
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── security.py             ← Password hashing, JWT logic
│   │   │   ├── constants.py            ← Enums (Roles, States, Severities)
│   │   │   └── exceptions.py           ← Custom exceptions
│   │   │
│   │   └── migrations/                 ← Alembic database migrations
│   │       ├── env.py
│   │       └── versions/
│   │           ├── 0001_initial_schema.py
│   │           └── ... (future migrations)
│   │
│   ├── tests/                          ← TEST SUITE
│   │   ├── conftest.py                 ← Pytest fixtures (DB, client, etc)
│   │   ├── __init__.py
│   │   │
│   │   ├── unit/                       ← UNIT TESTS (no DB)
│   │   │   ├── test_security.py        ← JWT, password hashing tests
│   │   │   ├── test_constants.py       ← Enum validation
│   │   │   ├── test_conflict_logic.py  ← Conflict detection algorithm
│   │   │   └── test_utils.py
│   │   │
│   │   ├── integration/                ← INTEGRATION TESTS (with DB)
│   │   │   ├── test_auth_flow.py       ← Login, logout, token tests
│   │   │   ├── test_timetable_crud.py  ← Create, read, update tests
│   │   │   ├── test_workflow_states.py ← State machine transitions
│   │   │   ├── test_rbac.py            ← Permission tests per role
│   │   │   └── test_conflict_endpoint.py
│   │   │
│   │   ├── regression/                 ← END-TO-END TESTS
│   │   │   ├── test_admin_workflow.py  ← Full admin journey
│   │   │   ├── test_hod_workflow.py    ← Full HOD journey
│   │   │   └── test_faculty_workflow.py
│   │   │
│   │   ├── fixtures/                   ← Seed data for tests
│   │   │   ├── users.json              ← Test users
│   │   │   └── timetables.json
│   │   │
│   │   └── e2e/                        ← Optional: Selenium/Playwright tests
│   │       └── (ignored for now)
│   │
│   ├── .pytest.ini                     ← Pytest configuration
│   ├── pytest.ini                      ← Coverage settings
│   ├── Makefile                        ← Quick commands (make test, make run)
│   │
│   └── README.md                       ← Setup & run instructions

├── API_CONTRACT.md                     ← EXISTING: API specification
├── README.md                           ← EXISTING: Mock backend note
└── ARCHITECTURE.md                     ← THIS FILE
```

---

## TECHNOLOGY STACK

### Core Framework
- **FastAPI** (0.104+)
  - Modern, fast, async/await native
  - Automatic OpenAPI (Swagger) docs
  - Built-in dependency injection
  - Type hints everywhere

### Database
- **SQLAlchemy 2.0+** (ORM)
  - Industry standard
  - Relationship management
  - Query building
- **Alembic** (migrations)
  - Version control for schema
  - Up/down migrations
  - Version tracking
- **PostgreSQL** (production DB)
- **SQLite** (unit tests)

### Authentication & Security
- **python-jose** (JWT handling)
- **passlib + bcrypt** (password hashing)
- **python-dotenv** (environment variables)

### Testing
- **pytest** (test runner)
- **pytest-asyncio** (async test support)
- **pytest-cov** (coverage reporting)
- **pytest-postgresql** (isolated test DB)
- **httpx** (async HTTP client for API tests)
- **factory-boy** (test data generation)

### Code Quality
- **ruff** (linter + formatter)
- **mypy** (type checking)
- **black** (code formatter)
- **pre-commit** (git hooks)

### Deployment
- **Uvicorn** (ASGI server)
- **Gunicorn** (production ASGI server with multiple workers)
- **Docker** (containerization)

### Monitoring & Logging
- **structlog** (structured logging)
- **Sentry** (error tracking, optional)

---

## API & DATA FLOW

### Authentication Flow

```
1. Client POST /api/auth/login
   {
     "identifier": "F1023",
     "password": "fac123",
     "selectedRole": "faculty"
   }

2. Backend:
   a. Query User by identifier
   b. Verify password (bcrypt check)
   c. Verify role matches selected role (server-side validation)
   d. Generate JWT token (expires in 8 hours)
   e. Return token + user object

3. Response 200 OK
   {
     "token": "eyJhbGciOiJIUzI1NiIs...",
     "user": {
       "id": "F1023",
       "name": "Dr. Ramesh Kumar",
       "role": "faculty",
       "department": "CSE"
     }
   }

4. Client stores token in localStorage
5. Subsequent requests include: Authorization: Bearer {token}
6. Backend validates token on every protected endpoint
```

### Timetable CRUD Flow

```
GET /api/timetables?department=CSE&state=draft
├─ Extract JWT from header
├─ Validate token & get current user
├─ Check permission (admin only, or HOD for their dept)
├─ Build query filter (department, year, section, state)
├─ Execute SELECT from timetables table
└─ Return filtered list

POST /api/timetables
├─ Extract & validate JWT
├─ Check user is admin (403 if not)
├─ Validate request body (department, year, section)
├─ Create Timetable record (state=draft)
├─ Assign to creator (createdBy)
├─ Save to DB
└─ Return 201 with timetable object

PATCH /api/timetables/:id
├─ Validate JWT, check admin
├─ Find timetable by ID
├─ Update entries list
├─ Sync to DB
├─ Return updated timetable

POST /api/timetables/:id/send-for-approval
├─ Validate JWT, check admin
├─ Check timetable state == draft
├─ Change state to pending
├─ Record submittedBy + submittedAt
├─ Return success response (NO EMAIL SENT - in-app only)
```

### Conflict Detection Flow

```
POST /api/conflicts/check
{
  "timetableId": "tt_2026_cse_3a",
  "proposedEntries": [
    { "id": "entry_001", "day": "Tuesday", "periodStart": 2, "facultyId": "F1023" }
  ]
}

Backend Algorithm:
├─ Get timetable & current entries
├─ Merge proposed entries into working set
├─ Run 6 checks:
│  1. Faculty double-booking ← loop all entries, find same faculty+time
│  2. Faculty daily period limit ← group by faculty+day, count > 6
│  3. Faculty weekly limit ← count distinct days
│  4. Lab coordinator daily limit ← similar to faculty
│  5. Lab coordinator weekly day limit ← similar to faculty
│  6. Room double-booking ← same room same time
├─ Categorize conflicts by severity (blocking, warning, informational)
├─ Return conflicts array + summary count
└─ Client displays badge (red/yellow/blue based on severity)
```

---

## SECURITY & AUTHENTICATION

### Password Security
- **Hash:** bcrypt with salt (cost factor = 12)
- **Never store:** Plain-text passwords
- **Reset:** Out of scope initially (per API contract, admin-issued only)

### JWT Token Strategy
```
Header: HS256 (HMAC SHA-256)
Secret: Stored in .env, never committed
TTL: 8 hours (per FRONTEND_DOCUMENTATION_CHECKLIST.md)
Payload:
  {
    "sub": "F1023",              // user ID
    "role": "faculty",
    "exp": 1234567890,
    "iat": 1234567890
  }
```

### Role-Based Access Control (RBAC)
```
Endpoint                          Admin  HOD  Faculty  Lab Coord  Student
─────────────────────────────────────────────────────────────────────────
POST /auth/login                   ✓     ✓     ✓        ✓         ✓
GET  /auth/me                      ✓     ✓     ✓        ✓         ✓
POST /auth/logout                  ✓     ✓     ✓        ✓         ✓
GET  /timetables (list all)        ✓     ✓ (dept only)
GET  /timetables/:id               ✓     ✓ (dept only)
GET  /timetables/me                ✓     ✓     ✓        ✓         ✓
POST /timetables (create)          ✓
PATCH /timetables/:id (edit)       ✓
POST /timetables/:id/send-approval ✓
POST /timetables/:id/approve                ✓
POST /timetables/:id/request-changes       ✓
POST /timetables/:id/publish       ✓
POST /conflicts/check              ✓     ✓     ✓        ✓         ✓
```

### Data Validation
- **Request:** Pydantic schemas validate all inputs (type, length, enum values)
- **Database:** Constraints (NOT NULL, UNIQUE, FK, CHECK)
- **Business logic:** State transitions, workflow rules

### Error Handling
```
Standard error response:
{
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "The ID or password entered is incorrect."
  }
}

Status codes:
- 200: Success
- 201: Created
- 400: Bad request (validation)
- 401: Unauthenticated (missing/invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not found
- 500: Server error
```

---

## DEPLOYMENT & ENVIRONMENT CONFIGURATION

### Environment Variables (.env file structure)

```
# Database
DATABASE_URL=postgresql://user:pass@host:5432/timetable_db
DATABASE_ECHO=false  # log SQL queries (dev only)

# JWT
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=8

# Server
APP_ENV=development  # development | test | production
DEBUG=false
LOG_LEVEL=INFO

# CORS (frontend URL)
CORS_ORIGINS=["http://localhost:3000", "https://yourdomain.com"]

# Optional: Sentry (error tracking)
SENTRY_DSN=https://xxx@sentry.io/project
```

### Configuration Per Environment

| Setting | Dev | Test | Prod |
|---------|-----|------|------|
| `DEBUG` | `true` | `false` | `false` |
| `DATABASE_ECHO` | `true` | `false` | `false` |
| `LOG_LEVEL` | `DEBUG` | `WARNING` | `INFO` |
| `DB_POOL_SIZE` | 5 | 1 | 20 |
| `CORS_ORIGINS` | `["*"]` | `["*"]` | `["domain.com"]` |
| `JWT_EXPIRATION` | 8h | 8h | 8h |

### Startup/Shutdown Hooks

```python
@app.on_event("startup")
async def startup_event():
    # 1. Test database connection
    # 2. Run pending migrations (Alembic)
    # 3. Verify JWT secret is set
    # 4. Log startup info
    pass

@app.on_event("shutdown")
async def shutdown_event():
    # 1. Close database connections
    # 2. Cleanup resources
    pass
```

---

## IMPLEMENTATION ROADMAP (Next Phase)

Once this architecture is approved:

1. **Phase 0:** Project setup (dependencies, structure, .env)
2. **Phase 1:** Database & models (SQLAlchemy ORM, Alembic)
3. **Phase 2:** Authentication (JWT, password hashing, login endpoint)
4. **Phase 3:** Timetable CRUD (endpoints, services, RBAC)
5. **Phase 4:** Conflict detection (algorithm, endpoint)
6. **Phase 5:** Testing (unit, integration, regression)
7. **Phase 6:** Deployment (Docker, CI/CD)

---

## QUESTIONS FOR REVIEW

Before implementation, please confirm:

1. ✅ **Database Strategy:** Happy with Dev/Test/Prod separation?
2. ✅ **Testing Layers:** Unit (SQLite) + Integration (PostgreSQL) + Regression approach okay?
3. ✅ **Project Structure:** Makes sense? Any changes?
4. ✅ **Tech Stack:** Python FastAPI + SQLAlchemy + PostgreSQL confirmed?
5. ✅ **Security:** JWT 8-hour TTL, bcrypt hashing acceptable?
6. ✅ **RBAC:** Permission matrix covers all endpoints?
7. ✅ **Ready to move to Phase 0:** Project setup?
