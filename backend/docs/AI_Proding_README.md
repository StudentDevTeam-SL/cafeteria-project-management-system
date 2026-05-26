# Backend Overview for AI and Project Review

Last updated: May 26, 2026

This document is a compact review guide for understanding the backend quickly. Use it with [data_flow.md](data_flow.md), [backend.md](backend.md), and [database.md](database.md).

## What the Backend Provides

The backend provides:

- JWT authentication and refresh.
- User roles: `Admin`, `Manager`, `Staff`, and `Employee`.
- CRUD APIs for menu, inventory, employees, salaries, orders, tables, and users.
- Public APIs for contact messages, newsletter subscriptions, and job applications.
- Dashboard aggregation for revenue, orders, active staff, and low-stock inventory.
- PostgreSQL-backed persistence.
- CV/media upload support.
- Role-based permissions for protected management actions.

## Important Files

| File | Purpose |
| --- | --- |
| `config/settings.py` | Installed apps, database, auth, CORS, JWT, static/media settings |
| `config/urls.py` | Top-level API routing and health check |
| `accounts/models.py` | Custom user and role field |
| `accounts/views.py` | Login, logout, email check, Google login, users API |
| `accounts/permissions.py` | Main role-based permission classes |
| `menu/models.py` | Menu, public messages, applications, recipes, modifiers |
| `orders/serializers.py` | Order creation, totals, modifiers, inventory deduction |
| `analytics/views.py` | Dashboard KPI aggregation |
| `tests/` | Main backend automated tests |

## Current API Coverage

| Feature | Status |
| --- | --- |
| Auth login/refresh/logout | Implemented |
| Google token login | Implemented |
| System users | Implemented |
| Menu CRUD and toggle | Implemented |
| Contact messages | Implemented |
| Newsletter subscriptions | Implemented |
| Job applications and CV upload | Implemented |
| Orders, tables, status updates | Implemented |
| Inventory CRUD | Implemented |
| Employees CRUD and toggle | Implemented |
| Salaries CRUD and net salary calculation | Implemented |
| Dashboard stats | Implemented |
| Real payment gateway | Not implemented; payment modal saves payment metadata only |

## Recent Corrections

- Removed automatic demo user creation unless `CREATE_DEMO_USERS=true` is explicitly set.
- Prevented `backend/test_serializer.py` from printing during Django test discovery.
- Updated test role data to use valid role choices.
- Cleaned frontend auth API imports and React lint issues.
- Confirmed backend tests pass with 48 tests.

## Safe Review Checklist

When changing the backend:

1. Check whether the endpoint already exists in `config/urls.py` and app `urls.py`.
2. Confirm the serializer fields match the frontend payload.
3. Confirm permission classes match the user role expected by the UI.
4. Run:

```powershell
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

5. If frontend calls are affected, run:

```powershell
cd ..\frontend
npm run lint
npm run build
```

## Data Flow Link

The complete UI-to-database map is in [data_flow.md](data_flow.md).
