# Baseline Report

## Backend Tests (pytest)
- **Status:** 6 FAILED, 10 PASSED.
- **Failures:** `test_08_pilot_requires_shortlisted_application` through `test_13_decision_support_calculates_correct_ratio`.
- **Reason:** `AttributeError: 'dict' object has no attribute '_sa_instance_state'` in `app.schemas.pilot.populate_application_dict`. This is an existing bug where a Pydantic validator assigns a dict to an SQLAlchemy relationship attribute.

## Frontend (tsc, lint, build)
- **Status:** Skipped (Node.js/npm paths not loaded in baseline executor shell).

## Conclusion
The baseline confirms the current code relies heavily on the `X-User-Id` bypass and has failing backend tests due to improper Pydantic/SQLAlchemy interaction. We will fix these in the upcoming steps.
