# Backend Testing Guide

This document explains how to run the backend test suite and seed demonstration data for the Cafeteria Management System.

## Running Tests

From the `backend/` directory with your virtual environment activated:

```powershell
cd backend
venv\Scripts\activate
python manage.py test
```

To run a specific subset of tests:

```powershell
python manage.py test tests.test_models
python manage.py test tests.test_api
python manage.py test tests.test_db_integrity
```

### Expected Output

A successful test run should include:

```text
System check identified no issues (0 silenced).
...
Ran X tests in Y.YYYs
OK
```

## Seed Demo Data

Use `test_and_seed.py` to verify the database connection and populate demo data:

```powershell
python test_and_seed.py
```

This can create or update seeded data such as:

- Default admin user: `admin` / `admin`
- Default employee user: `employee` / `1234`
- Sample menu items, inventory items, employee records, salary records, and orders

If you need a full reset, run:

```powershell
python seed_full.py --force
```

## Test Coverage Areas

The backend test suite covers:

- **Model validation** and field behavior
- **API endpoints** for authentication, menu, orders, inventory, salaries, and dashboard
- **Permission enforcement** for admin vs employee roles
- **Database integrity** and relationships

## Recommended Workflow

1. Apply migrations:
   ```powershell
   python manage.py migrate
   ```
2. Seed demo data:
   ```powershell
   python test_and_seed.py
   ```
3. Run tests:
   ```powershell
   python manage.py test
   ```

## Notes

The backend automatically creates the default `admin` and `employee` users after migrations via the `accounts` app startup hook.
