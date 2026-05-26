# Run Guide

Last updated: May 26, 2026

This guide explains how to run the backend and frontend locally.

## Prerequisites

- Python 3.10 or newer
- Node.js 18 or newer
- PostgreSQL 14 or newer
- Git

## Backend Setup

From the repository root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and confirm the database values:

```env
SECRET_KEY=your-local-secret
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=cafeteria_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Apply migrations:

```powershell
python manage.py migrate
```

Optional: verify the database and seed demo data:

```powershell
python test_and_seed.py
```

Run the backend:

```powershell
python manage.py runserver
```

Backend URLs:

- API root: `http://localhost:8000/api/`
- Health check: `http://localhost:8000/health/`
- Django admin: `http://localhost:8000/admin/`

## Frontend Setup

Open a second terminal:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173/
```

If the backend API is not on `http://localhost:8000/api/`, set:

```env
VITE_API_URL=http://localhost:8000/api/
```

## Demo Users

Demo users are created by seed scripts, not automatically on every migration.

Common local seed credentials:

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin` or `admin1234` |
| Manager | `manager` | `manager` |
| Employee | `employee` | `1234` |

For local demo environments only, optional post-migration demo user creation can be enabled with:

```env
CREATE_DEMO_USERS=true
```

Leave it disabled in production.

## Common Commands

```powershell
# Backend checks and tests
cd backend
.\venv\Scripts\activate
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

```powershell
# Frontend checks
cd frontend
npm run lint
npm run build
```

```powershell
# Reset and seed richer demo data
cd backend
python seed_full.py --force
```

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Backend cannot connect to database | Start PostgreSQL and verify `.env` DB values |
| Frontend API calls fail | Confirm backend is running and `VITE_API_URL` points to `/api/` |
| Login fails after reseed | Check which seed script was used and confirm the seeded password |
| Migrations fail locally | Recreate the local database, then run `python manage.py migrate` |
| CORS error | Add the frontend origin to `CORS_ALLOWED_ORIGINS` |

## Related Docs

- [System data flow](data_flow.md)
- [Backend architecture](backend.md)
- [Frontend architecture](../../frontend/docs/frontend.md)
