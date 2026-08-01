# Timetable Generator - FastAPI Backend

Modern FastAPI backend for automated timetable generation and management system.

## Tech Stack

- **Framework:** FastAPI 0.104+
- **Database:** PostgreSQL (SQLAlchemy ORM)
- **Authentication:** JWT (python-jose) + bcrypt
- **Testing:** pytest + pytest-asyncio
- **Dependency Management:** Poetry
- **Python:** 3.12+

## Quick Start

### 1. Install Dependencies

```bash
cd Backend/fastapi-backend

# Install Poetry (if not already installed)
curl -sSL https://install.python-poetry.org | python3 -

# Install project dependencies
poetry install
```

### 2. Set Up Environment

```bash
# .env file already exists with Neon PostgreSQL URLs
# Update if needed:
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run Application

```bash
# Activate virtual environment
poetry shell

# Run development server (auto-reload on code changes)
poetry run uvicorn app.main:app --reload

# Server runs at: http://localhost:8000
# API Docs: http://localhost:8000/docs (Swagger)
# Alternative Docs: http://localhost:8000/redoc
```

### 4. Run Tests

```bash
# Run all tests
poetry run pytest

# Run with coverage
poetry run pytest --cov=app

# Run specific test file
poetry run pytest tests/unit/test_security.py

# Run specific test
poetry run pytest tests/unit/test_security.py::test_hash_password
```

## Project Structure

```
fastapi-backend/
├── app/
│   ├── models/          # SQLAlchemy ORM models (User, Timetable, etc.)
│   ├── schemas/         # Pydantic request/response schemas
│   ├── api/             # FastAPI endpoints
│   ├── services/        # Business logic
│   ├── middleware/      # Auth, RBAC, logging
│   ├── utils/           # Constants, exceptions, security
│   ├── main.py          # FastAPI app initialization
│   ├── config.py        # Environment configuration
│   └── database.py      # Database connection setup
├── tests/
│   ├── unit/            # Unit tests (no DB)
│   ├── integration/     # Integration tests (with DB)
│   └── regression/      # E2E tests
├── pyproject.toml       # Poetry dependencies
├── .env                 # Environment variables (local)
├── .env.example         # Environment template
└── README.md            # This file
```

## Environment Variables

See `.env.example` for all available variables:

```env
APP_ENV=development          # development | test | production
DEBUG=true                   # Enable debug mode
LOG_LEVEL=DEBUG              # Logging level

db_dev=postgresql://...      # Development database URL
db_test=postgresql://...     # Test database URL
db_prod=postgresql://...     # Production database URL

JWT_SECRET_KEY=...          # JWT signing secret (min 32 chars)
JWT_ALGORITHM=HS256         # JWT algorithm
JWT_EXPIRATION_HOURS=8      # Token expiration time

CORS_ORIGINS=[...]          # Allowed CORS origins
```

## Database Setup

### Migrations (Alembic)

```bash
# Create migration
poetry run alembic revision --autogenerate -m "description"

# Apply migrations
poetry run alembic upgrade head

# Rollback migration
poetry run alembic downgrade -1
```

## API Endpoints

### Health & Status
- `GET /health` - Health check
- `GET /` - API info

### Authentication (Phase 2)
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Current user

### Timetables (Phase 3)
- `GET /api/timetables` - List timetables
- `GET /api/timetables/:id` - Get timetable detail
- `GET /api/timetables/me` - Get user's personal timetable
- `POST /api/timetables` - Create timetable
- `PATCH /api/timetables/:id` - Update timetable

### Workflow (Phase 3)
- `POST /api/timetables/:id/send-for-approval` - Submit for approval
- `POST /api/timetables/:id/approve` - Approve (HOD)
- `POST /api/timetables/:id/request-changes` - Request changes (HOD)
- `POST /api/timetables/:id/publish` - Publish (Admin)

### Conflicts (Phase 4)
- `POST /api/conflicts/check` - Check for conflicts

## Development Workflow

### Before Committing

```bash
# Run all tests
poetry run pytest

# Check for issues
poetry run pytest --cov=app
```

### Code Quality (Future)

Once added:
```bash
poetry run ruff check app/
poetry run black app/
poetry run mypy app/
```

## Key Concepts

### Authentication Flow
1. User logs in with credentials
2. Backend validates and returns JWT token
3. Frontend stores token and includes in all requests
4. Backend validates token on protected endpoints
5. Token expires after 8 hours

### Role-Based Access Control (RBAC)
- **Admin:** Full system access
- **HOD:** Department timetable approval
- **Faculty:** View own schedule, request changes
- **Lab Coordinator:** View own lab assignments
- **Student:** View own timetable only

### Workflow States
```
draft → pending → approved → published
             ↓
          rejected → draft
```

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
poetry run python -c "from app.config import settings; from app.database import engine; engine.connect()"
```

### Tests Fail
```bash
# Clear test database
rm test.db

# Run tests again
poetry run pytest
```

## Next Phases

- **Phase 1:** Database models & migrations
- **Phase 2:** Authentication & JWT
- **Phase 3:** Timetable CRUD & Workflow
- **Phase 4:** Conflict Detection
- **Phase 5:** Full test coverage
- **Phase 6:** Deployment & CI/CD

## Documentation

- API Contract: [Backend/API_CONTRACT.md](../API_CONTRACT.md)
- Architecture: [Backend/ARCHITECTURE.md](../ARCHITECTURE.md)
- FastAPI Docs: [https://fastapi.tiangolo.com/](https://fastapi.tiangolo.com/)
- SQLAlchemy Docs: [https://docs.sqlalchemy.org/](https://docs.sqlalchemy.org/)

## Support

For issues or questions, refer to:
1. API_CONTRACT.md (API specifications)
2. ARCHITECTURE.md (System design)
3. FastAPI official documentation
