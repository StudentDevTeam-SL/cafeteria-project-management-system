# Testing and Verification Guide

Last updated: May 26, 2026

This guide documents the project checks used to verify backend, frontend, database wiring, and API behavior.

## Current Verified Result

The latest local verification in this workspace:

- `python manage.py check` passed.
- `python manage.py makemigrations --check --dry-run` passed with no model changes detected.
- `python manage.py test` passed with 48 tests.
- `npm run lint` passed.
- `npm run build` passed.

## Backend Checks

Run from `backend/`:

```powershell
.\venv\Scripts\activate
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Run a specific backend test module:

```powershell
python manage.py test tests.test_models
python manage.py test tests.test_api
python manage.py test tests.test_db_integrity
python manage.py test orders.tests
```

Expected successful output:

```text
System check identified no issues (0 silenced).
Ran 48 tests in ...
OK
```

The test suite covers:

- Custom user model behavior.
- Menu, inventory, employee, order, and salary model behavior.
- Authentication endpoints.
- Google/Gmail login lookup behavior.
- Role-based API access.
- Database uniqueness, nullability, foreign keys, cascade behavior, and decimal precision.
- Advanced POS order behavior including modifiers, table assignment, totals, and inventory deduction.

## Frontend Checks

Run from `frontend/`:

```powershell
npm run lint
npm run build
```

The build should complete with Vite. A chunk-size warning can appear because the app is large; this is not a failing error.

## API Smoke Tests

With backend running:

```powershell
curl http://localhost:8000/health/
```

Expected:

```json
{"status":"ok","db":"connected"}
```

Manual UI smoke flow:

1. Log in as a seeded Admin user.
2. Create a menu item.
3. Create an inventory item.
4. Create an employee.
5. Create an order from Menu or Orders.
6. Change order status to completed.
7. Create a salary record.
8. Submit a public contact message and confirm it appears in Contact Messages.
9. Submit a newsletter email and confirm it appears in System Messages.
10. Submit a job application and confirm it appears in Jobs.

## Data Setup for Testing

Seed demo data:

```powershell
cd backend
python test_and_seed.py
```

Reset richer demo data:

```powershell
python seed_full.py --force
```

Optional local/demo-only post-migration demo user creation:

```env
CREATE_DEMO_USERS=true
```

Leave this disabled in production.

## Recent Test Stability Fixes

- Demo users are no longer auto-created during migrations unless `CREATE_DEMO_USERS=true` is explicitly set.
- The standalone `backend/test_serializer.py` script no longer prints during Django test discovery.
- Test-only role values now use the real model role choices.

## Related Docs

- [System data flow](data_flow.md)
- [Backend architecture](backend.md)
- [Database schema](database.md)
