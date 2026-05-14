# 🍽️ Cafeteria Project Management System

A full-stack cafeteria management web application built with **Django REST Framework** (backend) and **React + Vite** (frontend), backed by **PostgreSQL**.

---

## 🗂️ Project Structure

```
catateria-project-management-system/
├── backend/          # Django REST API
├── frontend/         # React + Vite SPA
├── render.yaml       # Render.com deployment blueprint
├── reorganize.bat    # One-click folder restructure script
└── .gitignore
```

---

## ✨ Features

| Module | Description |
|--------|-------------|
| 🔐 Auth | JWT login/refresh, role-based access (admin / employee) |
| 📊 Dashboard | Revenue, orders, inventory KPIs |
| 🍕 Menu | Full CRUD for menu categories and items |
| 📦 Inventory | Stock management with low-stock alerts |
| 👥 Employees | Employee profiles and management |
| 💰 Salaries | Salary records and payroll tracking |
| 🛒 Orders | Order creation, status tracking |
| 📈 Analytics | Revenue and order reports with charts |

---

## 🚀 Quick Start (Local)

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL 14+ (running locally)

### 1. Backend Setup

```bash
cd backend

# Create & activate virtual environment
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Linux/macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env
# Edit .env with your PostgreSQL credentials

# Auto-setup database (creates DB, runs migrations, seeds data)
python setup_db.py
python test_and_seed.py

# Start server
python manage.py runserver
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`  
Backend API at: `http://localhost:8000`

---

## 🔑 Default Login

| Role | Username | Password |
|------|----------|----------|
| Admin | `admin` | `admin` |
| Employee | `employee` | `1234` |

---

## 🌐 Deployment (Render)

This project includes a `render.yaml` blueprint that auto-creates:
- PostgreSQL database (`cafeteria-db`)
- Django backend web service (`cafeteria-backend`)
- React frontend static site (`cafeteria-frontend`)

See [`backend/docs/render.md`](backend/docs/render.md) for full deployment instructions.

---

## 🧰 Tech Stack

**Backend:** Django 5 · DRF · SimpleJWT · psycopg2 · gunicorn · WhiteNoise  
**Frontend:** React 19 · Vite · TailwindCSS · Recharts · Framer Motion · Axios  
**Database:** PostgreSQL 18  
**Deployment:** Render.com
