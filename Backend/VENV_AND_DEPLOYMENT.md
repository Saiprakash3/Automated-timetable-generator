# Virtual Environment & Deployment Strategy

## THE PROBLEM

If you use global Python, you get:
- ❌ Package conflicts between projects
- ❌ Dependencies from project A affecting project B
- ❌ Reproducibility issues (works on your machine, breaks on CI/prod)
- ❌ Permission issues (installing global requires admin)

## THE SOLUTION: Virtual Environments (venv)

### What is a venv?

A **virtual environment** is an isolated Python installation in a folder. Each project has its own:
- Python interpreter
- pip/Poetry package manager
- Installed packages (site-packages/)
- Different versions per project

```
Your Computer
├── Global Python 3.12
│   └── (system-wide packages)
│
├── Project A venv/
│   ├── Python 3.12
│   └── Django 4.0, requests 2.28
│
└── Project B venv/
    ├── Python 3.12
    └── FastAPI 0.104, sqlalchemy 2.0
```

Project A and B can have **different package versions** without conflicts!

---

## DEVELOPMENT (LOCAL MACHINE)

### How Poetry Handles venv

```bash
cd Backend/fastapi-backend

# Poetry AUTOMATICALLY creates & manages venv
poetry install

# Activate it
poetry shell

# Or run commands through poetry (no activation needed)
poetry run python test_db_connection.py
poetry run uvicorn app.main:app --reload
```

**Where is the venv?**
```
C:\Users\user\AppData\Local\pypoetry\Cache\virtualenvs\
└── timetable-backend-xxxxx/  ← isolated Python environment
    ├── pyvenv.cfg
    ├── Scripts/
    │   ├── python.exe
    │   ├── pip.exe
    │   └── pytest.exe
    └── Lib/site-packages/
        ├── fastapi/
        ├── sqlalchemy/
        └── ... (all installed packages)
```

### What to .gitignore (LOCAL)

```gitignore
# Poetry virtual environment (auto-managed, don't commit)
venv/
.venv/
env/
ENV/

# Poetry lock file (optional, but SHOULD commit poetry.lock)
# poetry.lock        ← DO NOT ignore this!

# Python cache
__pycache__/
*.pyc
*.pyo
*.pyd
```

✅ **GOOD:** Commit `poetry.lock` (locks exact versions)  
❌ **BAD:** Commit venv/ folder (100s of MB, different per OS)

---

## TESTING (CI/CD PIPELINE)

### GitHub Actions / GitLab CI Example

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      # CI creates fresh venv automatically
      - uses: actions/setup-python@v4
        with:
          python-version: "3.12"
      
      - name: Install Poetry
        run: pip install poetry
      
      # Poetry creates fresh venv, installs from poetry.lock
      - name: Install dependencies
        run: poetry install
      
      # Run tests in venv
      - name: Run tests
        run: poetry run pytest
```

**Key points:**
- ✅ Each CI run = fresh venv (no pollution)
- ✅ poetry.lock ensures reproducible builds
- ✅ No venv committed to repo

---

## PRODUCTION (DEPLOYED APPLICATION)

### Option 1: Traditional Server Deployment

```
Production Server
├── Global Python 3.12 (system package)
│
└── /app/fastapi-backend/
    ├── venv/                    ← Created by Gunicorn/systemd
    │   └── Python 3.12
    ├── poetry.lock
    ├── pyproject.toml
    └── app/
```

**Startup Script:**
```bash
#!/bin/bash
cd /app/fastapi-backend

# Create fresh venv on deploy
python3.12 -m venv venv

# Activate and install
source venv/bin/activate
poetry install --no-dev

# Run with Gunicorn in venv
gunicorn app.main:app -w 4 -b 0.0.0.0:8000
```

**What's on server:**
- ✅ poetry.lock (locked versions)
- ✅ venv/ (created fresh on each deploy)
- ❌ NOT committed to git

---

### Option 2: Docker Deployment (RECOMMENDED)

```dockerfile
# Dockerfile
FROM python:3.12-slim

WORKDIR /app

# Copy only dependency files (not venv)
COPY pyproject.toml poetry.lock ./

# Install Poetry in container
RUN pip install poetry

# Install dependencies in container's venv
RUN poetry install --no-dev --no-root

# Copy application code
COPY app/ app/

# Run FastAPI in container's venv
CMD ["poetry", "run", "uvicorn", "app.main:app", "-h", "0.0.0.0"]
```

**How Docker handles venv:**
```
Docker Container (isolated OS)
├── Python 3.12 (FROM python:3.12-slim)
│
└── /app/
    ├── venv/ (created in container, not on host)
    ├── pyproject.toml
    ├── poetry.lock
    └── app/
```

**Key advantages:**
- ✅ Entire OS + Python + venv isolated
- ✅ Works identically: local machine → CI → production
- ✅ No venv in git (Docker builds fresh each time)
- ✅ Easy scaling (multiple containers)

---

## COMPARISON: VENV vs DOCKER

| Aspect | venv (Local) | Docker (Prod) |
|--------|--------------|--------------|
| **Isolation** | Per-project | Per-container OS + project |
| **Size** | ~500MB-1GB | 500MB-2GB (includes Python) |
| **Setup Time** | 2-3 min | 5-10 min (first build) |
| **Reproducibility** | poetry.lock helps | Perfect (exact OS + Python) |
| **Scaling** | Single machine | Multiple containers |
| **Networking** | localhost | Container network |
| **Database** | Local/cloud | Can use linked containers |

---

## .GITIGNORE STRATEGY

### Backend/fastapi-backend/.gitignore

```gitignore
# ========== Virtual Environment ==========
venv/
.venv/
env/
ENV/
venv.bak/
env.bak/

# ========== Python ==========
__pycache__/
*.py[cod]          # .pyc, .pyo, .pyd
*$py.class
*.so
.Python
build/
develop-eggs/
dist/
downloads/
eggs/
.eggs/
lib/
lib64/
parts/
sdist/
var/
wheels/
*.egg-info/
.installed.cfg
*.egg
MANIFEST

# ========== Poetry ==========
poetry.lock        # ← OPINION: DO commit this (or don't, but be consistent)
dist/

# ========== IDE & Editor ==========
.vscode/
.idea/
*.swp
*.swo
*~
.DS_Store

# ========== Environment & Secrets ==========
.env                # ← Local secrets (NEVER commit)
.env.local
.env.*.local

# ========== Testing ==========
.pytest_cache/
.coverage
.coverage.*
htmlcov/
.hypothesis/
.tox/
test.db
*.sqlite

# ========== Database ==========
*.db
*.sqlite
*.sqlite3

# ========== Logs ==========
*.log
logs/

# ========== OS ==========
Thumbs.db
desktop.ini
.DS_Store
```

### Root .gitignore Updates

```gitignore
# ========== Backend venv ==========
Backend/fastapi-backend/venv/
Backend/fastapi-backend/.venv/
Backend/fastapi-backend/env/
Backend/fastapi-backend/__pycache__/

# ========== Backend secrets ==========
Backend/fastapi-backend/.env
Backend/fastapi-backend/.env.local
```

---

## RECOMMENDED WORKFLOW

### LOCAL DEVELOPMENT

```bash
# 1. Clone repo
git clone ...
cd Backend/fastapi-backend

# 2. Poetry creates venv automatically
poetry install

# 3. Activate (Poetry manages it)
poetry shell

# 4. Run server
poetry run uvicorn app.main:app --reload

# 5. Run tests
poetry run pytest
```

**venv location:** Managed by Poetry (user AppData)  
**Commit to git:** poetry.lock (yes), venv/ (no)

---

### PRODUCTION DEPLOYMENT

**Option A: Systemd Service + venv**
```bash
# Server startup script
#!/bin/bash
cd /app/fastapi-backend
python3.12 -m venv venv
source venv/bin/activate
poetry install --no-dev
gunicorn app.main:app -w 4 -b 0.0.0.0:8000
```

**Option B: Docker (RECOMMENDED)**
```bash
# Build once
docker build -t timetable-backend .

# Run anywhere (identically)
docker run -p 8000:8000 timetable-backend
```

---

## SUMMARY

| Scenario | venv Handling | .gitignore Rule |
|----------|---------------|-----------------|
| **Local dev** | Poetry auto-creates in AppData | venv/ |
| **CI/CD tests** | CI creates fresh venv | (not committed anyway) |
| **Prod (traditional)** | Deployment script creates fresh | N/A (on server, not git) |
| **Prod (Docker)** | Docker builds with venv inside | N/A (in container layer) |

**Golden Rule:** 
- ✅ Commit `poetry.lock` (reproduces exact versions)
- ✅ Never commit venv/ (too large, OS-specific)
- ✅ Never commit `.env` (contains secrets)

---

## NEXT STEPS

1. Update `.gitignore` with venv patterns (done below)
2. Run `poetry install` locally (creates venv)
3. Use `poetry run` or `poetry shell` for all commands
4. Later: Add Dockerfile when deploying to prod

This way:
- ✅ Local development isolated per project
- ✅ CI tests with fresh environment
- ✅ Production runs in Docker (same as CI environment)
- ✅ Zero dependency conflicts
