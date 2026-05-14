# Cafeteria Management System

Welcome to **Grand Cafeteria**, a production-ready, full-stack cafeteria management system built for streamlining orders, managing inventory, and overseeing employees through a premium, modern interface.

## Project Overview

A full-stack web application with a rich animated React frontend (glassmorphism, dark mode, Framer Motion) backed by a Django REST Framework API with JWT authentication and PostgreSQL database support.

## Documentation

- 📄 [frontend.md](./frontend/frontend.md) — React architecture, state management, and UI design system.
- 📄 [backend.md](./backend/backend.md) — Django REST Framework API architecture.
- 📄 [test.md](./test.md) — Comprehensive testing guide (automated + manual).
- 📄 [render.md](./render.md) — Step-by-step Render.com deployment guide.
- 📄 [SECURITY.md](./SECURITY.md) — Security policy and vulnerability reporting.

## Features

- **JWT Authentication & RBAC**: Secure token-based auth. Admins manage users; employees are restricted from salary/admin routes.
- **Menu Management**: Glassmorphism cards with availability toggles, photo upload (file or URL), category filtering.
- **Advanced Ordering**: Multi-step Payment Modal supporting Cash, Zaad, PayPal, and Mastercard.
- **Live Inventory**: Visual low-stock alerts with threshold tracking.
- **Payroll Module**: Admin-only salary records with net pay auto-calculation and payment status tracking.
- **Real-Time Dashboard**: Live clock, animated stat cards, dual charts (area/bar), recent orders table.
- **Global Undo System**: 7-second animated undo popup for accidental deletions.
- **Theme System**: Light/dark mode with preference persistence.
- **Premium Animations**: Page transitions, ripple effects, hover-lift cards powered by Framer Motion.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, TailwindCSS, Framer Motion |
| Backend | Django 5, Django REST Framework, SimpleJWT |
| Database | PostgreSQL (production) / SQLite (local dev) |
| Deployment | Render.com (Blueprint + Static Site) |
| Static Files | WhiteNoise |
| Auth | JWT (access 8h / refresh 30d) |

## Local Setup

### 1. Backend (Django)

```powershell
cd backend

# Activate virtual environment
Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned
.\venv\Scripts\Activate.ps1

# Install dependencies
python -m pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed demo data (creates admin/staff users + sample data)
python seed_data.py

# Start server
python manage.py runserver
```

### 2. Frontend (React)

```powershell
cd frontend
npm install
npm run dev
```

### 3. Login Credentials (after seeding)

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `admin1234` |
| Staff | `staff` | `staff1234` |

## Running Tests

```powershell
cd backend
python manage.py test tests --verbosity=2
```

See [test.md](./test.md) for the full test coverage breakdown.

## Deployment

This project is configured for one-click deployment to Render via `render.yaml` (Infrastructure as Code).

See [render.md](./render.md) for the full step-by-step deployment guide.

**Quick deploy:**

1. Push to GitHub.
2. Render Dashboard → **New → Blueprint** → connect repo → **Apply**.
3. Separately: **New → Static Site** for the React frontend.
