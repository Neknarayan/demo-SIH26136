# SIH 26136 — Challenge-to-Pilot Lifecycle Platform

A demo-ready MVP enabling an end-to-end innovation procurement and pilot deployment lifecycle between Government Officers, Startups, and Evaluators.

## Core Workflow
1. **Officer** creates and publishes an Innovation Challenge.
2. **Startup** browses challenges, views informational eligibility, and submits an application.
3. **Evaluator** scores applications (0–100) and leaves qualitative notes.
4. **Officer** reviews applications and shortlists the top candidate.
5. **Officer** creates a Pilot and defines target KPIs.
6. **Startup** submits evidence for assigned KPIs.
7. **Officer** approves or rejects submitted evidence.
8. **System** calculates the KPI achievement ratio and generates an explainable, rule-based recommendation.
9. **Officer** records the final pilot decision (e.g. Recommend Scale, Extend Pilot, Discontinue).

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Custom CSS
- **Backend**: Python 3.11/3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Uvicorn
- **Database**: PostgreSQL with Alembic migrations
- **Testing**: Pytest

## Getting Started
Please see the [TEAM_SETUP_GUIDE.md](./TEAM_SETUP_GUIDE.md) for the Docker-first installation instructions. You can have the entire system running in under 10 minutes.
