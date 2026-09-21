# Team Setup Guide

Welcome to the SIH 26136 ProcureBridge team! Follow these instructions to get your local development environment running in under 10 minutes.

## Prerequisites
- Node.js >= 20.x
- Python 3.10 to 3.12 (3.14 is not officially released, stick to stable 3.11/3.12)
- Docker Desktop (recommended for database)

## 1. Start the Database (Docker-first)

The easiest way to run PostgreSQL is using the provided Docker Compose file:

```bash
docker compose -f docker-compose.dev.yml up -d db
```

*Alternative (Manual PostgreSQL):* If you prefer to install PostgreSQL locally, ensure it is running on port 5432 with a password and create a database named `sih26136`.

## 2. Backend Setup

```bash
cd backend
python -m venv .venv

# Activate virtual environment
# Windows:
.\.venv\Scripts\activate
# Mac/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt
pip install -r requirements-dev.txt

# Create .env file (or copy from .env.example)
echo 'DATABASE_URL=postgresql+psycopg://postgres:mysecretpassword@localhost:5432/sih26136' > .env
echo 'APP_ENV=development' >> .env
echo 'JWT_SECRET_KEY=my-local-dev-secret' >> .env

# Run database migrations
alembic upgrade head

# Start the API server
uvicorn app.main:app --reload --port 8000
```

## 3. Frontend Setup

In a new terminal:
```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at http://localhost:5173 and the API at http://localhost:8000.

## 4. Running Tests
Tests use the same PostgreSQL database. Ensure you are in the `backend` directory with the virtual environment activated:
```bash
# Add current directory to PYTHONPATH and run
PYTHONPATH=. pytest tests/
```
