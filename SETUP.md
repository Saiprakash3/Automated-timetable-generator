# Complete Setup Guide

Complete step-by-step guide to get the entire application running from scratch.

## 🖥️ System Requirements

- **OS**: Windows, macOS, or Linux
- **Python**: 3.10 or higher
- **Node.js**: 18.0 or higher
- **PostgreSQL**: 14 or higher
- **Git**: For version control

## 📋 Installation Steps

### Phase 1: Install System Dependencies

#### Windows

1. **Python**
   - Download from https://www.python.org/downloads/
   - Run installer, check "Add Python to PATH"
   - Verify: python --version

2. **Node.js**
   - Download from https://nodejs.org/
   - Use LTS version
   - Verify: node --version and npm --version

3. **PostgreSQL**
   - Download from https://www.postgresql.org/download/windows/
   - Install with default options
   - Remember password for postgres user
   - Verify: PostgreSQL should appear in Start menu

#### macOS

Using Homebrew:
- Python: brew install python3
- Node.js: brew install node
- PostgreSQL: brew install postgresql@15, brew services start postgresql@15

#### Linux (Ubuntu/Debian)

- Python: sudo apt install python3 python3-pip python3-venv
- Node.js: sudo apt install nodejs npm
- PostgreSQL: sudo apt install postgresql postgresql-contrib

### Phase 2: Setup Backend

1. Navigate to backend: cd Backend/fastapi-backend
2. Create venv: python -m venv venv
3. Activate: venv\Scripts\Activate.ps1 (Windows) or source venv/bin/activate (Mac/Linux)
4. Configure database in PostgreSQL
5. Copy .env.example to .env and update values
6. Install: pip install -r requirements.txt
7. Initialize: python -c "from app.database import engine; from app.models.base import Base; Base.metadata.create_all(bind=engine)"
8. Seed: python seed_db.py
9. Run: uvicorn app.main:app --reload

Backend at: http://localhost:8000
Docs at: http://localhost:8000/docs

### Phase 3: Setup Frontend

1. Navigate to frontend: cd Frontend
2. Install: npm install
3. Copy .env.example to .env (defaults should work)
4. Run: npm run dev

Frontend at: http://localhost:5173

## ✅ Verification

Backend tests:
- cd Backend/fastapi-backend
- pytest tests/ -v
- Should see: 30 passed

Login test:
- Go to http://localhost:5173
- Login with: A001 / admin123
- Should see dashboard

## 📚 Next Steps

1. Read README.md for full documentation
2. Check API docs at http://localhost:8000/docs
3. Review CLAUDE.md for architecture

## 💡 Tips

- Keep 2-3 terminals open: Backend, Frontend, Tests
- Auto-reload is enabled on both
- Use API docs frequently for endpoint reference
- Run tests after each major change
- Git commit frequently
