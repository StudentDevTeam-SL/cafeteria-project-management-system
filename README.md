# 🍽️ Cafeteria Project Management System

Welcome! This repository contains a full cafeteria operations platform designed for restaurant administrators, staff, and managers.

A complete cafeteria operations management system built with:
- **Django REST Framework** for the backend API
- **React + Vite** for the frontend single-page application
- **PostgreSQL** for data persistence

This system is designed to manage cafeteria operations end-to-end, including menu management, order processing, inventory control, employee management, and payroll.

---

## 🧠 What this system does

The Cafeteria Project Management System centralizes cafeteria workflows into a single application.
It supports:
- **POS-style order creation** for cafeteria staff
- **Menu item administration** with categories, availability, and media support
- **Real-time inventory tracking** and low-stock alerting
- **Employee profile management** with roles and status control
- **Salary record tracking** and payroll status updates
- **Business analytics** for revenue, orders, and inventory trends
- **Role-based access control** for Admin and Employee users

---

## 🚦 Key System Modules

### 🔐 Authentication
- JWT-based login and refresh tokens
- Role-based permissions for `Admin` and `Employee`
- Token-backed session security and API protection

### 🍕 Menu Management
- Manage menu categories and menu items
- Create, read, update, delete menu entries
- Toggle item availability for real-time status control
- Upload or associate images for each menu item

### 🛒 Order Processing
- Create new orders from the POS interface
- Track order status from `pending` to `processing` to `completed`
- Save payment method metadata for Cash, Card, and Mobile Money
- Store order history for reporting and analytics

### 📦 Inventory Control
- Track raw ingredients and supply stock levels
- Manage units, cost per unit, and minimum stock alert thresholds
- Detect low-stock items before supplies run out

### 👥 Employee Management
- Maintain employee profiles, roles, and job details
- Track active status, assigned shift, and contact information
- Restrict payroll and personnel features to authorized users

### 💰 Payroll / Salaries
- Store salary records per employee
- Calculate net salary from base pay, bonus, and deductions
- Mark salaries as paid and record payment dates

### 📈 Analytics & Dashboard
- Summarize sales, orders, inventory, and staffing metrics
- Provide dashboard KPI views for quick operations monitoring
- Support manager decisions with data insights

---

## 📦 Project Structure

```text
catateria-project-management-system/
├── backend/          # Django REST API, models, tests, scripts, docs
├── frontend/         # React + Vite user interface
├── render.yaml       # Render deployment blueprint
├── reorganize.bat    # Folder restructure script
└── .gitignore
```

---

## 🧰 Tech Stack

**Backend:** Django 5.0.4 · Django REST Framework 3.15.1 · SimpleJWT · django-cors-headers · dj-database-url · gunicorn · WhiteNoise

**Frontend:** React 19.2.5 · Vite · TailwindCSS · Recharts · Framer Motion · Axios

**Database:** PostgreSQL 14+

**Deployment:** Render.com

---

## 🚀 Local Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- PostgreSQL 14+

### Backend Setup

```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/macOS
pip install -r requirements.txt
copy .env.example .env
# Edit .env with your PostgreSQL credentials
python setup_db.py
python test_and_seed.py
python manage.py runserver
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

---

## 🔑 Default Accounts

| Role     | Username   | Password |
| -------- | ---------- | -------- |
| Admin    | `admin`    | `admin`  |
| Employee | `employee` | `1234`   |

> Default accounts are automatically created by the backend after migrations.

---

## ✅ Useful Commands

### Backend
```bash
# Run all backend tests
cd backend
venv\Scripts\activate
python manage.py test

# Seed data
python test_and_seed.py

# Reset and reseed
python seed_full.py --force
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Deployment with Render

This repository includes a `render.yaml` blueprint for Render deployment.
It provisions:
- PostgreSQL database (`cafeteria-db`)
- Django backend service (`cafeteria-backend`)
- React frontend static site (`cafeteria-frontend`)

See [`backend/docs/render.md`](backend/docs/render.md) for deployment details.

---

## 📘 Additional Documentation

- `backend/docs/run.md` — local run guide
- `backend/docs/test.md` — backend test guide
- `backend/docs/database.md` — database schema details
- `backend/docs/backend.md` — backend architecture
- `frontend/docs/frontend.md` — frontend architecture
- `backend/docs/project_system.md` — project team and structure

---

## 💡 Notes

- Use the `VITE_API_URL` environment variable in the frontend to point to the backend API.
- Production backend uses `DATABASE_URL` and secure settings when `DEBUG=False`.
- Static files are served via WhiteNoise in production.
