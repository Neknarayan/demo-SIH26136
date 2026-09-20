# ProcureBridge (SIH 26136) — Production Plan

## Audit Findings Confirmation
- **F1 (Confirmed):** `frontend/src/api/client.ts` relies on `X-User-Id` for all API calls except `/api/auth/me`. The JWT login is indeed decorative for dashboards.
- **F2 (Confirmed):** `backend/app/auth.py`'s `get_current_user` allows complete auth bypass by falling back to the `X-User-Id` header.
- **F3 (Confirmed):** `backend/app/api/users.py` lacks authentication for the `GET /users` and `GET /users/{id}` routes, leaking all PII.
- **F4 (Confirmed):** `backend/app/api/auth.py` and `frontend/src/pages/RegisterPage.tsx` allow anyone to create an account as any role, including an independent evaluator or government officer, due to lack of server-side validation against a white-list or invite system.
- **F5 (Confirmed):** `backend/app/config.py` contains default production secrets and passwords. `CORS_ORIGINS` allows `*` while using credentials. `API_BASE` is hardcoded.
- **F6 (Confirmed):** Object-level authorization gaps are present across endpoints (e.g., evaluators can score any application, anyone can read evaluations).
- **F7 (Confirmed):** Lack of state machines. Any officer can mutate any status to any string at any time.
- **F8 (Confirmed):** Decision support relies on `any(ev.status == 'approved')` rather than comparing `submitted_value` against `target_value`.
- **F9 (Confirmed):** `evidence.file_ref` is just a string without real binary upload handling.
- **F10 (Confirmed):** `startup.dpiit_status` is self-declared with no real verification gate.
- **F11 (Confirmed):** Landing page challenges are strictly hardcoded in `ActiveProblemStatements.tsx`. No real router exists.
- **F12 (Confirmed):** The SQLite database test environment diverges from the PostgreSQL production environment. Evaluator logic allows only one evaluation per application.
- **F13 (Confirmed):** `TEAM_SETUP_GUIDE.md` instructions conflict with actual driver requirements (`postgresql+psycopg://` vs `postgresql://`).
- **F14 (Confirmed):** `requirements.txt` is unpinned and uses outdated libraries (`passlib`, `python-jose`).
- **F15 (Confirmed):** The pitched scale-up, payments, contracting, and matching functionalities are missing entirely.

## Phased, Risk-Ordered Implementation Plan

### Phase 1: Baseline, Security & Auth (Prompts 1 & 2)
1. Stabilize the environment, introduce `.env` overrides, pin dependencies, and fix Docker/PostgreSQL onboarding (`Prompt 1`).
2. Implement strict JWT-only authentication. Eliminate the `X-User-Id` backdoor (`Prompt 2`).
3. Add role-based access control, secure password hashing (`argon2id`), rate-limiting, and email verification.

### Phase 2: Object-Level Auth & Audit Logs (Prompt 3)
1. Introduce a strict object-level authorization model (departments, ownership).
2. Build explicit state machines (Workflows) to prevent arbitrary status transitions.
3. Introduce an immutable `audit_logs` table for tracking all mutations.

### Phase 3: Core Domain Logic & Verifications (Prompt 4)
1. Enhance the evaluation system to support multiple evaluators, rubrics, and conflict-of-interest declarations.
2. Implement the DPIIT verification queue.
3. Fix the decision-support KPI mathematical models to use baseline/target values properly.

### Phase 4: Full Pitch Lifecycle (Prompt 5)
1. Implement Discovery/Matching logic (scoring algorithms).
2. Build the Contracts, Milestones, and Payments schemas.
3. Implement the Scale-up ("Proven Solutions") catalogue and the pilot monitoring module.

### Phase 5: Frontend Architecture (Prompt 6)
1. Migrate the UI to `react-router-dom` and `TanStack Query`.
2. Break down monolithic components into maintainable pages.
3. Introduce accessible, i18n-ready, and dynamic screens based on the new backend endpoints.

### Phase 6: File Uploads & Production Readiness (Prompts 7 & 8)
1. Implement real, secure file storage via S3/LocalDisk interface.
2. Configure Docker deployments, CI pipelines, logging, and observability.
3. Finalize DPDP Act compliance documentation and launch checklists.

## Questions for You
1. Do you have a preferred S3 provider for the production deployment (e.g., AWS S3, MinIO, Google Cloud Storage), or should I stick to MinIO for local dev and generic boto3?
2. For the Government Email Allow-list (Phase 1/2), do you want to hardcode `['gov.in', 'nic.in']` or load it strictly from `.env`?
