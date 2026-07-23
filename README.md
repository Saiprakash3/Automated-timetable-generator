# Automated Timetable Generator

A comprehensive system for generating, managing, and validating academic timetables with intelligent conflict detection and approval workflows.

## 📋 Project Overview

This is a full-stack application built with:
- **Frontend**: React + Vite + TypeScript
- **Backend**: FastAPI + SQLAlchemy + PostgreSQL
- **Testing**: Pytest (Unit, Integration, Regression tests)
- **Authentication**: JWT with dual-token strategy (access + refresh)

### Key Features

✨ **Conflict Detection** - 7-tier intelligent validation system
- Faculty double-booking detection (BLOCKING)
- Daily/weekly period limits (WARNING/INFORMATIONAL)
- Room double-booking detection (BLOCKING)
- Lab continuity validation (WARNING)
- Role-specific constraints

🔐 **Authentication & Authorization**
- JWT-based authentication with token rotation
- Role-based access control (RBAC) with 5 roles
- Token blacklist for logout functionality

🔄 **Workflow Management**
- State machine: draft → pending → approved/rejected → published
- Multi-level approval system
- Soft delete audit trail with cascade behavior

📊 **Comprehensive Testing**
- 30+ passing tests across 3 tiers
- Unit tests for security and conflict detection
- Integration tests for auth flow and CRUD operations
- Regression tests for complete workflows

## 🏗️ Project Structure

```
Automated-timetable-generator/
├── Backend/
│   ├── fastapi-backend/              # FastAPI application
│   │   ├── app/
│   │   │   ├── api/                  # API endpoints
│   │   │   ├── models/               # SQLAlchemy models
│   │   │   ├── schemas/              # Pydantic schemas
│   │   │   ├── services/             # Business logic
│   │   │   ├── utils/                # Utilities (security, tokens)
│   │   │   ├── config.py             # Configuration
│   │   │   ├── database.py           # Database setup
│   │   │   └── main.py               # FastAPI app
│   │   ├── tests/
│   │   │   ├── unit/                 # Unit tests
│   │   │   ├── integration/          # Integration tests
│   │   │   └── regression/           # End-to-end tests
│   │   ├── seed_db.py                # Database seeding script
│   │   ├── venv/                     # Python virtual environment
│   │   └── requirements.txt          # Python dependencies
│   ├── mock-backend/                 # Mock data (db.json)
│   └── .env.example                  # Environment template
├── Frontend/
│   ├── src/
│   │   ├── components/               # React components
│   │   ├── features/                 # Feature modules
│   │   ├── hooks/                    # Custom hooks
│   │   ├── services/                 # API services
│   │   ├── pages/                    # Page components
│   │   └── App.tsx                   # Root component
│   ├── .env.example                  # Environment template
│   └── package.json                  # Node dependencies
├── CLAUDE.md                         # Technical documentation
└── README.md                         # This file
```

## 🚀 Getting Started

### Prerequisites

- **Python 3.10+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL 14+** (database)
- **npm or yarn** (package manager)

### 1. Backend Setup

#### Clone and navigate to backend

```bash
cd Backend/fastapi-backend
```

#### Create virtual environment

```bash
python -m venv venv
```

#### Activate virtual environment

**Windows:**
```bash
venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

#### Install dependencies

```bash
pip install -r requirements.txt
```

#### Configure environment variables

Copy `.env.example` to `.env` and update values:

```bash
cp ../.env.example .env
```

Edit `.env` with your configuration (see Backend Environment Variables section below)

#### Initialize database

```bash
python -c "from app.database import engine; from app.models.base import Base; Base.metadata.create_all(bind=engine)"
```

#### Seed mock data (optional)

```bash
python seed_db.py
```

This populates the database with:
- 8 test users (admin, HOD, faculty, lab coordinators, student)
- 3 sample timetables in different states
- Test data for conflict detection

#### Run backend server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be available at: `http://localhost:8000`
API docs: `http://localhost:8000/docs`

#### Run tests

```bash
# All tests
python -m pytest tests/ -v

# Specific test suite
python -m pytest tests/unit/ -v        # Unit tests
python -m pytest tests/integration/ -v # Integration tests
python -m pytest tests/regression/ -v  # Regression tests
```

### 2. Frontend Setup

#### Navigate to frontend

```bash
cd Frontend
```

#### Install dependencies

```bash
npm install
```

#### Configure environment variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your API base URL (see Frontend Environment Variables section below)

#### Run development server

```bash
npm run dev
```

Frontend will be available at: `http://localhost:5173`

#### Build for production

```bash
npm run build
```

## 🔑 Environment Variables

### Backend Environment Variables

Create `Backend/.env` with these values:

```env
# Environment
APP_ENV=development
DEBUG=false
LOG_LEVEL=INFO

# Database URLs
DB_DEV=postgresql://user:password@localhost:5432/timetable_dev
DB_TEST=postgresql://user:password@localhost:5432/timetable_test
DB_PROD=postgresql://user:password@localhost:5432/timetable_prod

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-min-32-characters-long
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=8

# Frontend
VITE_API_BASE_URL=http://localhost:8000/api

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:5173"]

# Working Hours Configuration (in 24-hour format)
WORKING_HOURS_START=9
WORKING_HOURS_END=17

# Break Configuration (in minutes)
LUNCH_BREAK_MINUTES=60
SHORT_BREAKS_MINUTES=30
PERIOD_LENGTH_MINUTES=60

# Faculty Constraints
FACULTY_MAX_PERIODS_PER_DAY=6
FACULTY_MAX_DAYS_PER_WEEK=5
FACULTY_MAX_LAB_DAYS_PER_WEEK=3

# Lab Coordinator Constraints
LAB_COORDINATOR_MAX_PERIODS_PER_DAY=4
LAB_COORDINATOR_MAX_DAYS_PER_WEEK=5

# Conflict Detection Behavior
ALLOW_BLOCKING_CONFLICTS_IN_DRAFT=false
```

### Frontend Environment Variables

Create `Frontend/.env` with these values:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Application
VITE_APP_TITLE=Automated Timetable Generator
VITE_APP_VERSION=1.0.0
```

## 🔐 Test Credentials

Use these credentials to test the application after seeding mock data:

| Role | ID | Password | Use Case |
|------|-----|----------|----------|
| Admin | A001 | admin123 | Create/manage timetables |
| HOD | H001 | hod123 | Approve timetables |
| Faculty | F1023 | fac123 | View assigned classes |
| Lab Coordinator | LC004 | labco123 | Manage lab sessions |
| Student | S3021 | stu123 | View published timetables |

## 📚 API Documentation

Once the backend is running, access interactive API docs at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Key API Endpoints

#### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

#### Timetables
- `POST /api/timetables` - Create new timetable
- `GET /api/timetables` - List timetables
- `GET /api/timetables/{id}` - Get timetable details
- `PATCH /api/timetables/{id}` - Update timetable entries
- `POST /api/timetables/{id}/send-for-approval` - Submit for approval
- `POST /api/timetables/{id}/approve` - Approve timetable
- `POST /api/timetables/{id}/publish` - Publish timetable

#### Conflict Detection
- `POST /api/conflicts/check` - Check for scheduling conflicts

## 🧪 Testing

### Test Structure

- **Unit Tests** (10 tests)
  - Password security and hashing
  - JWT token creation and verification

- **Integration Tests** (9 tests)
  - Login flow and authentication
  - Token management and logout
  - Current user retrieval

- **Conflict Detection Tests** (6 tests)
  - Faculty double-booking detection
  - Daily/weekly period limits
  - Room conflicts
  - Lab continuity validation

- **Regression Tests** (5 tests)
  - Complete admin workflow
  - State machine transitions
  - Approval process

### Running Tests

```bash
# Run all tests with coverage
pytest tests/ -v --cov=app

# Run specific test file
pytest tests/unit/test_security.py -v

# Run with detailed output
pytest tests/ -vv --tb=short
```

## 🏛️ Architecture Highlights

### Authentication Flow

1. User sends credentials to `/api/auth/login`
2. Server validates and generates dual tokens:
   - `access_token`: 15-minute TTL for API requests
   - `refresh_token`: 7-day TTL for getting new access tokens
3. Client stores both tokens in sessionStorage
4. For subsequent requests, include: `Authorization: Bearer {access_token}`
5. When access_token expires, use refresh_token to get new pair

### Conflict Detection Pipeline

The 7-tier conflict detection system checks in order:

1. **Faculty Double-Booking** (BLOCKING) - Same faculty, same time
2. **Faculty Daily Limit** (WARNING) - Exceeds max periods/day
3. **Faculty Weekly Limit** (INFORMATIONAL) - Approaching max days/week
4. **Lab Coordinator Daily Limit** (WARNING) - Exceeds max periods/day
5. **Lab Coordinator Weekly Limit** (INFORMATIONAL) - Approaching max days/week
6. **Room Double-Booking** (BLOCKING) - Same room, same time
7. **Lab Continuity** (WARNING) - Single-period labs (prefer 2+ continuous)

### State Machine

```
draft
  ↓
pending (send-for-approval)
  ├→ approved (approve)
  │   ↓
  │ published (publish)
  │
  └→ rejected (request-changes)
     ↓
    draft (re-edit)
```

## 📦 Deployment

### Docker Setup (Optional)

Build and run with Docker:

```bash
docker-compose up --build
```

### Production Checklist

- Set `APP_ENV=production` in `.env`
- Use strong `JWT_SECRET_KEY` (min 32 characters)
- Configure production PostgreSQL database
- Set `DEBUG=false`
- Update `CORS_ORIGINS` for production domains
- Enable HTTPS in frontend
- Set up database backups
- Configure logging service
- Run full test suite

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
uvicorn app.main:app --port 8001
```

**Database connection error:**
- Verify PostgreSQL is running
- Check `DB_DEV` URL in `.env`
- Ensure database exists: `createdb timetable_dev`

**Import errors:**
```bash
pip install -r requirements.txt --force-reinstall
```

### Frontend Issues

**CORS errors:**
- Verify `VITE_API_BASE_URL` matches backend URL
- Check `CORS_ORIGINS` in backend `.env`

**Build errors:**
```bash
rm -rf node_modules package-lock.json
npm install
```

## 📖 Documentation

- **Technical Details**: See CLAUDE.md for architecture, design decisions, and implementation notes
- **Design System**: See DESIGN_SYSTEM.md for UI component guidelines
- **API Contract**: See API_CONTRACT.md for endpoint specifications

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Make changes and write tests
3. Run test suite: `pytest tests/`
4. Commit: `git commit -m "Add my feature"`
5. Push and create pull request

## 📝 License

This project is licensed under the MIT License - see LICENSE file for details.

## 👥 Team

Developed by Prakash with focus on:
- Automated scheduling and conflict resolution
- Robust authentication and authorization
- Comprehensive testing and documentation
- Industry-standard architecture patterns

## 🎯 Next Phases

- Phase 6: Docker containerization and deployment
- Phase 7: CI/CD pipeline setup (GitHub Actions)
- Phase 8: Performance optimization and caching
- Phase 9: Advanced reporting and analytics
- Phase 10: Mobile app support

---

**Questions?** Check the documentation or refer to the technical guides.

**Last Updated**: July 24, 2026
