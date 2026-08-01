# FastAPI Backend - Local Setup Guide

## Quick Start (5 minutes)

### 1. Install Poetry (One Time)

**Windows:**
```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

**macOS/Linux:**
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

Verify installation:
```bash
poetry --version
```

### 2. Create Virtual Environment & Install Dependencies

```bash
cd Backend/fastapi-backend

# Poetry automatically creates virtual environment in isolated location
# and installs all dependencies from pyproject.toml
poetry install
```

**What just happened:**
- ✅ Poetry created a venv in `C:\Users\user\AppData\Local\pypoetry\Cache\virtualenvs\`
- ✅ Installed FastAPI, SQLAlchemy, psycopg (PostgreSQL driver), etc.
- ✅ Everything is isolated to this project (no conflicts with global Python)

### 3. Verify Setup

```bash
# Test database connections
poetry run python test_db_connection.py
```

**Expected output:**
```
============================================================
DATABASE CONNECTION TEST SUITE
============================================================
Environment: development

============================================================
Testing DEV Database
============================================================
Host: ep-flat-surf-azqwxr7i-pooler.c-3.ap-southeast-1.aws.neon.tech
Database: DEV
✅ Connection Successful!
PostgreSQL Version: PostgreSQL 15.x ...
Connected as: neondb_owner
Database: DEV

============================================================
Testing TEST Database
============================================================
✅ Connection Successful!
...

============================================================
Testing PROD Database
============================================================
✅ Connection Successful!
...

============================================================
SUMMARY
============================================================
Dev Database:  ✅ PASS
Test Database: ✅ PASS
Prod Database: ✅ PASS

Overall: ✅ ALL DATABASES WORKING
```

### 4. Run Development Server

```bash
# Activate poetry environment (optional, or use 'poetry run' prefix)
poetry shell

# Start server with auto-reload
poetry run uvicorn app.main:app --reload
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000 (Press CTRL+C to quit)
INFO:     Application startup complete
```

### 5. Test API

Open in browser or Postman:
- **Health Check:** `GET http://localhost:8000/health`
- **API Docs:** `GET http://localhost:8000/docs` (Swagger UI)
- **ReDoc:** `GET http://localhost:8000/redoc`

---

## Using Poetry (Common Commands)

### Running Commands in Virtual Environment

**Option A: Use `poetry run` prefix (recommended)**
```bash
poetry run python -c "import fastapi; print(fastapi.__version__)"
poetry run pytest
poetry run uvicorn app.main:app --reload
```

**Option B: Activate shell (one-time)**
```bash
poetry shell
python -c "import fastapi; print(fastapi.__version__)"
pytest
exit              # Exit the poetry shell
```

### Adding New Dependencies

```bash
# Add a package (updates pyproject.toml & poetry.lock)
poetry add requests

# Add dev-only package
poetry add --group dev black

# Install all dependencies from pyproject.toml
poetry install
```

### Viewing Installed Packages

```bash
poetry show
poetry show fastapi
```

### Update Dependencies

```bash
# Update all packages to latest compatible versions
poetry update

# Update specific package
poetry update requests
```

---

## Understanding Virtual Environments

### Where is the venv?

```
C:\Users\user\AppData\Local\pypoetry\Cache\virtualenvs\
└── timetable-backend-xxxxx/
    ├── Scripts/
    │   ├── python.exe
    │   ├── pip.exe
    │   └── pytest.exe
    └── Lib/site-packages/
        ├── fastapi/
        ├── sqlalchemy/
        └── (all your installed packages)
```

### Why is it not in the project folder?

✅ **Advantages:**
- Keeps project folder clean (not 1GB of packages)
- Easier to git ignore
- Reuses venv if same Python version
- Faster to delete/reinstall

❌ **Disadvantage:**
- Not immediately visible where venv is

If you prefer venv in project folder:
```bash
poetry config virtualenvs.in-project true
poetry install
```
Then it creates: `Backend/fastapi-backend/.venv/`

---

## Git & Version Control

### What to Commit

```
✅ COMMIT THESE
├── pyproject.toml       (dependency definitions)
├── poetry.lock          (exact locked versions)
├── app/                 (your code)
├── tests/               (your tests)
└── README.md

❌ DO NOT COMMIT THESE
├── venv/                (too large, auto-generated)
├── .env                 (contains secrets)
├── __pycache__/         (Python cache)
└── test.db              (test database)
```

All the "DO NOT COMMIT" files are already in `.gitignore`.

---

## Troubleshooting

### "poetry: command not found"

**Fix:** Add Poetry to PATH
```powershell
$env:Path += ";C:\Users\user\AppData\Roaming\Python\Scripts"
```

Or reinstall:
```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

### "ModuleNotFoundError: No module named 'fastapi'"

**Fix:** Make sure you're using Poetry's Python:
```bash
poetry run python -c "import fastapi"

# Or activate shell
poetry shell
python -c "import fastapi"
```

### Database Connection Failed

**Fix:** Check .env file
```bash
# View current database URLs
cat .env

# Verify connection
poetry run python test_db_connection.py
```

### Slow Poetry Install

**Fix:** Try clearing cache
```bash
poetry cache clear . --all
poetry install
```

---

## Production Deployment

### Traditional Server

On production server, create fresh venv:
```bash
cd /app/fastapi-backend
python3.12 -m venv venv
source venv/bin/activate
poetry install --no-dev
gunicorn app.main:app -w 4
```

### Docker (Recommended)

Dockerfile handles everything:
```dockerfile
FROM python:3.12-slim
RUN pip install poetry
COPY pyproject.toml poetry.lock ./
RUN poetry install --no-dev
COPY app/ app/
CMD ["poetry", "run", "uvicorn", "app.main:app", "-h", "0.0.0.0"]
```

No need to manage venv locally - Docker creates one in the container.

---

## Next: Test Database Connections

```bash
cd Backend/fastapi-backend
poetry install
poetry run python test_db_connection.py
```

If all databases show ✅ PASS, you're ready for Phase 1! 🚀
