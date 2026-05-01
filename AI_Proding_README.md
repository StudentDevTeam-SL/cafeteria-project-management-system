# Cafeteria Management System - Backend Reconstruction

## Project Overview
This project involves a completely clean reconstruction of the backend for the Cafeteria Management System using Django REST Framework and PostgreSQL, replacing an inconsistent legacy backend while preserving the React frontend contract.

## Backend Structure
The backend uses a modular Django design with the following apps:
- `accounts`: Custom User Model (`role`, `phone_number`), JWT Auth.
- `menu`: Catalog management (`Category`, `MenuItem`).
- `orders`: Transaction tracking (`Order`, `OrderItem`).
- `inventory`: Stock management (`InventoryItem`).
- `employees`: Employee profiles (`Employee`).
- `salaries`: Financial salary records (`SalaryRecord`).
- `analytics`: (Placeholder for dashboard aggregation).

## Database Schema
- PostgreSQL is the primary database.
- **Relations:** 
  - `OrderItem` -> `MenuItem` and `Order`.
  - `MenuItem` -> `Category`.
  - `SalaryRecord` -> `Employee`.
  - `Employee` -> `CustomUser` (OneToOne).

## API Endpoints
All endpoints are prefixed with `/api/`:
- **Auth:** `auth/login/`, `auth/refresh/`, `auth/logout/`
- **Menu:** `menu/`, `menu/<id>/`, `menu/<id>/toggle/`
- **Orders:** `orders/`, `orders/<id>/`, `orders/<id>/status/`
- **Inventory:** `inventory/`, `inventory/<id>/`
- **Employees:** `employees/`, `employees/<id>/`, `employees/<id>/toggle/`
- **Salaries:** `salaries/`, `salaries/<id>/`

## Setup Steps
1. **Database:** Ensure PostgreSQL is running and a database named `cafeteria_db` exists (user/pass: `postgres/postgres`).
2. **Environment:** Create a virtual environment: `python -m venv venv` and activate it.
3. **Dependencies:** Run `pip install -r requirements.txt`.
4. **Migrations:** 
   - `python manage.py makemigrations accounts menu orders inventory employees salaries`
   - `python manage.py migrate`
5. **Superuser:** `python manage.py createsuperuser`

## Run Steps
Start the Django development server:
`python manage.py runserver 8000`

## Test Steps
To test endpoints, use tools like Postman or run Django's test suite:
`python manage.py test`

## Developer Notes
- AI tools generated the original codebase. This reconstruction standardizes the API endpoints for full compatibility with the existing React frontend.
- JWT tokens now contain `role` and `username` claims to avoid extra profile fetches on the frontend.
- Ensure the `CORS_ALLOWED_ORIGINS` in `settings.py` matches your frontend port (e.g., `http://localhost:3000` or `http://localhost:5173`).
