# 🛠️ Backend — Django REST API

## Structure

```
backend/
├── config/           # Django settings, URLs, WSGI
├── accounts/         # Custom user model, JWT auth
├── employees/        # Employee management
├── menu/             # Menu categories & items
├── inventory/        # Stock management
├── orders/           # Order processing
├── salaries/         # Payroll records
├── analytics/        # Dashboard & reports
├── media/            # Uploaded images
├── docs/             # Documentation
├── manage.py
├── requirements.txt
├── .env              # Local secrets (gitignored)
├── .env.example      # Template for .env
├── setup_db.py       # Auto PostgreSQL setup script
└── test_and_seed.py  # DB test + seed data script
```

---

## ⚙️ Environment Variables

Copy `.env.example` → `.env` and fill in:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Local PostgreSQL
DB_NAME=cafeteria_db
DB_USER=postgres
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

# Production (Render)
# DATABASE_URL=postgres://user:pass@host:port/db
```

---

## 🗄️ Database Setup

```bash
# Auto-detects PostgreSQL password, creates DB, runs migrations
python setup_db.py

# Test connection + seed full data
python test_and_seed.py

# Force re-seed (wipe + reload)
python seed_full.py --force
```

---

## 🔌 API Endpoints

| Prefix | App |
|--------|-----|
| `/api/auth/` | Login, refresh, logout |
| `/api/employees/` | Employee CRUD |
| `/api/menu/` | Menu items & categories |
| `/api/inventory/` | Inventory management |
| `/api/orders/` | Order management |
| `/api/salaries/` | Salary records |
| `/api/dashboard/` | Analytics & KPIs |
| `/health/` | Health check (used by Render) |
| `/admin/` | Django admin panel |

---

## 🚀 Running Locally

```bash
# Activate venv
venv\Scripts\activate

# Start dev server
python manage.py runserver
# API available at http://localhost:8000
```

---

## 🌐 Production (Render)

- Build: `pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
- Start: `gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2`
- DB: PostgreSQL via `DATABASE_URL` environment variable (auto-set by Render)
