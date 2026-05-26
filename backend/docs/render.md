# Render Deployment Guide

Last updated: May 26, 2026

This project includes `render.yaml` for deploying the PostgreSQL database, Django backend, and React frontend on Render.

## Services

| Service | Purpose |
| --- | --- |
| `cafeteria-db` | PostgreSQL database |
| `cafeteria-backend` | Django REST API |
| `cafeteria-frontend` | React static frontend |

## Backend Service

Recommended Render settings:

| Setting | Value |
| --- | --- |
| Runtime | Python |
| Root directory | `backend` |
| Build command | `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate` |
| Start command | `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --worker-class gthread --threads 4 --timeout 120` |
| Health check path | `/health/` |

Required backend environment variables:

```env
SECRET_KEY=<generated-secret>
DEBUG=False
ALLOWED_HOSTS=cafeteria-backend.onrender.com
CORS_ALLOWED_ORIGINS=https://cafeteria-frontend.onrender.com
CSRF_TRUSTED_ORIGINS=https://cafeteria-frontend.onrender.com,https://cafeteria-backend.onrender.com
DATABASE_URL=<injected-by-render-postgres>
PGSSLMODE=require
PYTHON_VERSION=3.12.3
```

Do not enable `CREATE_DEMO_USERS` in production. Create production users intentionally through Django admin, a secure management command, or a controlled seed process.

## Frontend Service

Recommended Render settings:

| Setting | Value |
| --- | --- |
| Runtime | Static site |
| Root directory | `frontend` |
| Build command | `npm install && npm run build` |
| Publish directory | `dist` |
| Rewrite rule | `/*` to `/index.html` |

Required frontend environment variable:

```env
VITE_API_URL=https://cafeteria-backend.onrender.com/api/
```

## Database

Render PostgreSQL should be connected to the backend through `DATABASE_URL`.

The backend health endpoint checks both application and database connectivity:

```bash
curl https://cafeteria-backend.onrender.com/health/
```

Expected:

```json
{"status":"ok","db":"connected"}
```

## Post-Deployment Checklist

1. Confirm backend health returns `status: ok`.
2. Open the frontend and verify it loads.
3. Confirm the frontend calls the backend URL configured in `VITE_API_URL`.
4. Create a production admin user intentionally.
5. Log in and verify Dashboard, Menu, Orders, Inventory, Employees, Salaries, Reports, and message screens.
6. Submit public Contact, Newsletter, and Job Application forms.

## Common Issues

| Issue | Fix |
| --- | --- |
| 403/CORS errors | Check `CORS_ALLOWED_ORIGINS` and `CSRF_TRUSTED_ORIGINS` exactly match deployed URLs |
| Backend health shows database unreachable | Confirm PostgreSQL service is ready and `DATABASE_URL` is injected |
| Static files missing | Confirm `collectstatic --noinput` completed in backend build |
| Frontend loads but API fails | Check `VITE_API_URL` ends with `/api/` |
| Login users missing | Create users intentionally; demo auto-creation is disabled by default |
| HTTPS redirect loop | Confirm Render service is behind HTTPS and `DEBUG=False` settings are correct |

## Migration Rollback

Use Render shell for the backend service:

```bash
python manage.py showmigrations
python manage.py migrate <app_name> <migration_name>
```

Example:

```bash
python manage.py migrate orders 0003
```

## Related Docs

- [System data flow](data_flow.md)
- [Backend architecture](backend.md)
- [Security policy](../../SECURITY.md)
