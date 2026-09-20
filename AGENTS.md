# AGENTS.md — ProcureBridge (SIH 26136) production build

This file SUPERSEDES the demo-era rules ("exactly 9 tables", "no JWT / AI / external APIs /
Redis / Celery", "X-User-Id header auth"). The project is now a real, deployable government
platform, not a demo.

## Core loop
PLAN -> IMPLEMENT -> RUN -> TEST -> FIX -> VERIFY -> COMMIT -> NEXT
One concern per commit, conventional commit messages (feat:, fix:, refactor:, test:, docs:).

## Stack (keep it unless asked)
Backend: FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic, PostgreSQL.
Frontend: React 19, Vite, TypeScript, lucide-react.

## Non-negotiables
- Never trust the client. Every authorization decision is enforced on the server, per object
  (ownership / department / assignment), not only per role.
- No secrets, default passwords or real personal data in code or git. Config comes from env.
  In production the app must refuse to start with a missing/default secret.
- Every schema change is an Alembic migration (upgrade AND downgrade, tested on PostgreSQL) and
  preserves existing data. Ask before dropping any table/column.
- Every status change goes through an explicit state machine and writes an audit log row.
- Decision support stays deterministic and explainable. Any AI/ML is optional, behind an
  interface, off by default, advisory only, and shows its reasons. A human makes every decision.
- Never weaken, delete or skip a test to make it pass. If a test encodes old demo behaviour
  (e.g. X-User-Id auth), rewrite it for the new behaviour and say so in your report.
- Keep the existing Government of Maharashtra visual identity unless a task says otherwise.
- Do not invent government API endpoints or credentials. Build adapter interfaces with a
  manual/sandbox implementation and document what real onboarding is needed.

## Definition of done (every task)
- Backend: pytest passes on PostgreSQL. Frontend: `npm run build` (tsc -b) and `npm run lint` pass.
- New behaviour has tests, including negative/permission tests.
- Docs updated (README / ARCHITECTURE / .env.example).
- End every task with a short report: What changed / How to verify / What's left / Risks.
