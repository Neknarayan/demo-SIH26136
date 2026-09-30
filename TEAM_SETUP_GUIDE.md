# 🚀 ProcureBridge — Team Setup Guide (SIH 26136)

> **Goal:** Full stack running locally — backend + frontend + database + CI/CD — in under 10 minutes.

---

## Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Git | any | `git --version` |
| Python | 3.11 or 3.12 | `python --version` |
| Node.js | 20.x or later | `node --version` |
| npm | 9.x or later | `npm --version` |
| Docker Desktop | any | `docker --version` |

> ⚠️ **Python 3.14 is not yet stable** — stick to 3.11 or 3.12.

---

## Option A — Fastest Path (Linux / macOS / WSL)

If you have `make` installed:

```bash
# 1. Clone
git clone https://github.com/<your-org>/demo-SIH26136.git
cd demo-SIH26136

# 2. Install frontend dependencies
cd frontend && npm install && cd ..

# 3. One-command setup (creates venv, installs deps, copies .env files, starts DB)
make setup

# 4. Apply migrations + seed demo accounts
make migrate
make seed

# 5. Start servers (two terminals)
make backend      # Terminal 1 — http://localhost:8000
make frontend     # Terminal 2 — http://localhost:5173
```

Done! Open **http://localhost:5173** and log in with demo accounts below.

---

## Option B — Step by Step (Windows PowerShell / Any OS)

### Step 1 — Clone the repo

```bash
git clone https://github.com/<your-org>/demo-SIH26136.git
cd demo-SIH26136
```

### Step 2 — Start PostgreSQL (Docker)

```bash
docker compose -f docker-compose.dev.yml up -d
```

This starts PostgreSQL on port 5432 with:
- User: `postgres` | Password: `mysecretpassword` | Database: `sih_db`

> **No Docker?** Install PostgreSQL 15 locally and create a DB called `sih_db`.

---

### Step 3 — Backend setup

```bash
cd backend

# Create virtual environment
python -m venv .venv

# Activate it
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
# Windows CMD:
.\.venv\Scripts\activate.bat
# Mac / Linux:
source .venv/bin/activate
```

> ⚠️ **Windows users — IMPORTANT:** Never use `echo 'text' > .env` in PowerShell.
> It creates a **broken UTF-16 file** that Python silently fails to read.
> **Always copy the example file:**

```bash
# Windows:
copy .env.example .env
# Mac/Linux:
cp .env.example .env
```

Open `backend/.env` in VS Code / Notepad++ and verify:

```env
DATABASE_URL=postgresql+psycopg://postgres:mysecretpassword@localhost:5432/sih_db
APP_ENV=development
JWT_SECRET_KEY=my-local-dev-secret-change-in-production
```

```bash
# Install dependencies
pip install -r requirements.txt -r requirements-dev.txt

# Run database migrations (creates all tables)
alembic upgrade head

# Seed demo accounts
python seed.py

# Start the server
uvicorn app.main:app --reload --port 8000
```

The API is live at **http://localhost:8000**
Swagger docs: **http://localhost:8000/docs**

---

### Step 4 — Frontend setup

Open a **new terminal** (keep backend running):

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Copy env file (no changes needed — Vite proxy handles backend routing)
# Windows:
copy .env.example .env
# Mac/Linux:
cp .env.example .env

# Start dev server
npm run dev
```

The app is at **http://localhost:5173**

> 💡 The Vite dev server proxies all API calls (`/challenges`, `/api/auth`, etc.)
> directly to `localhost:8000` — no CORS issues, no URL config needed.

---

## Demo Accounts (after `python seed.py`)

| Role | Email | Password | What they can do |
|------|-------|----------|-----------------|
| 🏢 Government Officer | priya.nair@gov.in | demo123 | Post challenges, review pilots, make decisions |
| 🚀 Startup | contact@aquasense.io | demo123 | Browse challenges, submit proposals, upload PDFs |
| 🎯 Evaluator | rahul.verma@gov.in | demo123 | Score applications, submit evaluation notes |

---

## Running Tests

Tests use SQLite in-memory — no PostgreSQL required for CI:

```bash
cd backend
# Activate venv first!

# Windows:
$env:DATABASE_URL="sqlite:///./test.db"
$env:JWT_SECRET_KEY="test-secret-key-32-chars-minimum"
$env:APP_ENV="test"
python -m pytest --tb=short -q

# Mac/Linux:
DATABASE_URL=sqlite:///./test.db JWT_SECRET_KEY=test-secret-key-32-chars-minimum APP_ENV=test python -m pytest --tb=short -q

# Or with make:
make test
```

---

## Production Deployment with Docker

```bash
# 1. Create root .env (NOT inside backend/ or frontend/)
copy .env.example .env   # Windows
cp .env.example .env     # Mac/Linux

# 2. Edit .env with your secrets:
#   POSTGRES_PASSWORD=yourStrongPassword
#   JWT_SECRET_KEY=yourRandomSecret32CharsMin
#   CORS_ORIGINS=https://yourdomain.com

# 3. Build and run
docker compose up --build -d

# App is served at http://localhost (port 80)
```

On first deploy, the backend **automatically runs Alembic migrations** before starting.

---

## CI/CD Pipeline (GitHub Actions)

On every `push` to `main` or `feat/*` and on `pull_request`:

1. **Backend** — ruff lint + pytest (16 tests, ~65s)
2. **Frontend** — TypeScript check + Vite build
3. **Docker** — builds both images (only on push to main)

No GitHub Secrets needed for tests — CI uses SQLite.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| `Field required: DATABASE_URL` | `.env` file missing or corrupt | `copy .env.example .env` (don't use `echo`) |
| `Connection refused port 5432` | PostgreSQL not started | `docker compose -f docker-compose.dev.yml up -d` |
| `alembic: command not found` | Venv not activated | Run `.\.venv\Scripts\Activate.ps1` first |
| Login gives 404 / CORS error | Backend not running | `uvicorn app.main:app --reload --port 8000` |
| `npm run dev` API calls fail | Venv backend not running | Start backend first, then frontend |
| `pytest` crashes before any test | Missing env vars | Set `DATABASE_URL`, `JWT_SECRET_KEY`, `APP_ENV` |
| Upload fails silently | `backend/uploads/` missing | `mkdir backend/uploads` |
| `port 8000 already in use` | Old backend process still running | `Stop-Process -Id (Get-NetTCPConnection -LocalPort 8000).OwningProcess -Force` |
| Officer can't register | Email domain not in allowlist | Set `ALLOW_OPEN_GOV_REGISTRATION=true` in `backend/.env` for dev |

---

## Project Structure

```
demo-SIH26136/
├── backend/                 # FastAPI + SQLAlchemy + Alembic
│   ├── app/
│   │   ├── api/            # Route handlers (one file per domain)
│   │   ├── models/         # SQLAlchemy ORM models
│   │   ├── schemas/        # Pydantic v2 schemas
│   │   ├── policies/       # Authorization (per-object checks)
│   │   └── workflows/      # State machines (challenge, application, pilot)
│   ├── migrations/         # Alembic migration versions
│   ├── tests/              # Pytest test suite
│   ├── seed.py             # Demo data seeder
│   ├── requirements.txt    # Production dependencies
│   ├── requirements-dev.txt # Dev/test dependencies
│   └── .env.example        # Copy to .env
├── frontend/               # React 19 + Vite + TypeScript
│   ├── src/
│   │   ├── components/     # UI components (per role dashboards)
│   │   ├── pages/          # Route pages
│   │   ├── api/            # API client (client.ts)
│   │   └── types/          # TypeScript interfaces
│   ├── vite.config.ts      # Vite config with dev proxy
│   └── .env.example        # Copy to .env
├── docker-compose.yml       # Production — all services
├── docker-compose.dev.yml   # Dev — PostgreSQL only
├── Makefile                 # Developer shortcuts
└── TEAM_SETUP_GUIDE.md     # This file
```
