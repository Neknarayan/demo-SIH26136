# ──────────────────────────────────────────────────────────────────────────────
# Makefile — ProcureBridge (SIH 26136) dev shortcuts
# Works on Linux, macOS, and Windows (Git Bash / WSL)
# ──────────────────────────────────────────────────────────────────────────────

.PHONY: help setup db backend frontend seed test lint build docker-up docker-down docker-logs clean

help: ## Show this help
	@echo ""
	@echo "  ProcureBridge — Available Commands"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'
	@echo ""

# ── First-time setup ──────────────────────────────────────────────────────────

setup: ## Full first-time setup (db + backend + frontend env)
	@echo "⏳ Step 1/4 — Starting PostgreSQL..."
	docker compose -f docker-compose.dev.yml up -d
	@echo "⏳ Step 2/4 — Setting up Python virtualenv..."
	cd backend && python -m venv .venv
	@echo "⏳ Step 3/4 — Installing backend dependencies..."
	cd backend && .venv/bin/pip install -r requirements.txt -r requirements-dev.txt
	@echo "⏳ Step 4/4 — Copying .env files (if not already present)..."
	@test -f backend/.env || cp backend/.env.example backend/.env
	@test -f frontend/.env || cp frontend/.env.example frontend/.env
	@echo ""
	@echo "✅ Setup complete! Now run:"
	@echo "   make migrate    → apply database migrations"
	@echo "   make seed       → load demo accounts"
	@echo "   make backend    → start FastAPI"
	@echo "   make frontend   → start Vite dev server (new terminal)"

# ── Database ──────────────────────────────────────────────────────────────────

db: ## Start PostgreSQL via Docker (dev only)
	docker compose -f docker-compose.dev.yml up -d

migrate: ## Run Alembic migrations
	cd backend && .venv/bin/alembic upgrade head

seed: ## Seed demo accounts into the database
	cd backend && .venv/bin/python seed.py

# ── Development servers ───────────────────────────────────────────────────────

backend: ## Start FastAPI backend (port 8000)
	cd backend && .venv/bin/uvicorn app.main:app --reload --port 8000

frontend: ## Start Vite frontend dev server (port 5173)
	cd frontend && npm run dev

# ── Testing & Quality ─────────────────────────────────────────────────────────

test: ## Run backend tests
	cd backend && DATABASE_URL=sqlite:///./test.db JWT_SECRET_KEY=test-secret-key-32-chars-minimum APP_ENV=test .venv/bin/python -m pytest --tb=short -q

lint: ## Run backend linter (ruff)
	cd backend && .venv/bin/ruff check .

build: ## Build frontend for production
	cd frontend && npm run build

# ── Docker (production) ───────────────────────────────────────────────────────

docker-up: ## Build and start all services in production mode
	@test -f .env || (echo "❌ Missing .env — copy .env.example and fill values" && exit 1)
	docker compose up --build -d

docker-down: ## Stop all production services
	docker compose down

docker-logs: ## Tail logs from all containers
	docker compose logs -f

# ── Cleanup ───────────────────────────────────────────────────────────────────

clean: ## Remove Python caches and test databases
	find backend -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null; true
	find backend -name "*.pyc" -delete 2>/dev/null; true
	rm -f backend/test.db backend/sih.db backend/sih26136.db
