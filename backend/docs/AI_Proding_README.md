# Cafeteria Management System — Backend Overview

## Project Overview
This backend is implemented with **Django REST Framework** and **PostgreSQL** to support the Cafeteria Management System frontend.

## Backend Apps
- `accounts` — Custom user model, JWT authentication, default users
- `menu` — Menu item and category management
- `orders` — Order creation, line items, and status updates
- `inventory` — Stock and inventory tracking
- `employees` — Employee profiles and staff management
- `salaries` — Payroll and salary record tracking
- `analytics` — Dashboard metrics and reporting

## API Endpoints
The backend exposes the following major API prefixes:

- `/api/auth/`
- `/api/menu/`
- `/api/orders/`
- `/api/inventory/`
- `/api/employees/`
- `/api/salaries/`
- `/api/dashboard/`
- `/health/`
- `/admin/`

## Setup Summary

### Local Development

1. Activate backend virtual environment:
   ```bash
   cd backend
   python -m venv venv
   .\venv\Scripts\activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create `.env` from `.env.example`.
4. Run database setup:
   ```bash
   python setup_db.py
   ```
5. Seed demo content:
   ```bash
   python test_and_seed.py
   ```
6. Run the server:
   ```bash
   python manage.py runserver
   ```

### Default Users

- **Admin:** `admin` / `admin`
- **Employee:** `employee` / `1234`

Those users are created automatically after migrations by the `accounts` app.

## Notes

- Django settings use `dj-database-url` for production `DATABASE_URL` parsing.
- In production, the backend serves static files via WhiteNoise.
- The health endpoint at `/health/` verifies DB connectivity.
- The backend is configured for Render deployment using `render.yaml`.

## Testing

Run the backend test suite:
```bash
cd backend
venv\Scripts\activate
python manage.py test
```

## Frontend Compatibility

Ensure the frontend `VITE_API_URL` points to the backend API base URL, for example:
```env
VITE_API_URL=https://cafeteria-backend.onrender.com/api/
```

## Security & Deployment

- `DEBUG=False` in production
- `CSRF_TRUSTED_ORIGINS` configured for the frontend URL
- `CORS_ALLOWED_ORIGINS` configured for the frontend URL
- `PGSSLMODE=require` is recommended for production
