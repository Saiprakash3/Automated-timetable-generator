# Quick Start Guide - Backend Development

Get the backend running in 5 minutes!

## 🚀 Prerequisites

- Python 3.10+
- PostgreSQL 14+ (or use Docker)
- Virtual environment already set up (recommended)

## ⚡ Quick Setup

### 1. Activate Virtual Environment

**Windows:**
```powershell
venv\Scripts\Activate.ps1
```

**macOS/Linux:**
```bash
source venv/bin/activate
```

### 2. Configure Environment

```bash
# Copy template
cp ../.env.example .env

# Edit .env with your PostgreSQL connection
# At minimum, update: DB_DEV, JWT_SECRET_KEY
```

### 3. Create Database

```bash
# Ensure PostgreSQL is running, then:
createdb timetable_dev
```

### 4. Install Dependencies

```bash
pip install -r requirements.txt
```

### 5. Run Server

```bash
uvicorn app.main:app --reload
```

Server starts at: **http://localhost:8000**
Docs at: **http://localhost:8000/docs**

### 6. Seed Test Data (Optional)

```bash
python seed_db.py
```

Use these test accounts:
- Admin: `A001` / `admin123`
- Faculty: `F1023` / `fac123`
- HOD: `H001` / `hod123`

## 🧪 Run Tests

```bash
# All tests
pytest tests/ -v

# Only unit tests
pytest tests/unit/ -v

# With coverage
pytest tests/ --cov=app
```

## 🔧 Common Commands

```bash
# Restart server (auto-reload is enabled)
# Just save a file

# Check database
psql timetable_dev

# Generate migration (if using Alembic)
alembic revision --autogenerate -m "description"

# Format code
black app/ tests/

# Lint
flake8 app/ tests/
```

## 📝 Project Structure

```
app/
├── api/              # Route handlers
├── models/           # Database models
├── schemas/          # Request/response schemas
├── services/         # Business logic
├── utils/            # Helpers (auth, security)
├── config.py         # Settings
├── database.py       # DB connection
└── main.py           # FastAPI app

tests/
├── unit/             # Unit tests
├── integration/      # Integration tests
└── regression/       # End-to-end tests
```

## 🆘 Troubleshooting

### Port already in use
```bash
uvicorn app.main:app --port 8001
```

### Database connection failed
```bash
# Check PostgreSQL is running
psql postgres

# Create database manually
createdb timetable_dev

# Check connection string in .env
```

### Missing dependencies
```bash
pip install --upgrade -r requirements.txt
```

### Tests failing
```bash
# Run with detailed output
pytest tests/ -vv --tb=short

# Run single test
pytest tests/unit/test_security.py::TestPasswordSecurity::test_hash_password_creates_hash -v
```

## 📚 Next Steps

1. Read [README.md](../../README.md) for full documentation
2. Check API docs at http://localhost:8000/docs
3. Review test examples in `tests/integration/`
4. See [CLAUDE.md](../../CLAUDE.md) for architecture details

## 💡 Pro Tips

- Use `--reload` flag for auto-restart on file changes
- Add `--log-level debug` for verbose logging
- Use `uvicorn app.main:app --port 8000 --ssl-keyfile=key.pem --ssl-certfile=cert.pem` for HTTPS testing
- Database changes auto-create/alter tables on server start

Happy coding! 🎉
