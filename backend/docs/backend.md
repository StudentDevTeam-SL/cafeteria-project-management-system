# 🛠️ Backend — Django REST API

## Structure

```text
backend/
├── accounts/         # Custom user model, JWT auth, registration
├── analytics/        # Dashboard & report endpoints
├── config/           # Settings, URLs, WSGI
├── inventory/        # Stock management
├── menu/             # Menu categories & items
├── media/            # Uploaded media assets
├── orders/           # Order processing
├── salaries/         # Payroll records
├── tests/            # Automated model, API, and integrity tests
├── docs/             # Project documentation
├── manage.py
├── requirements.txt
├── .env.example
├── setup_db.py
└── test_and_seed.py
```

## Environment Variables

Copy `.env.example` to `.env` and configure for local development:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=cafeteria_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

# Production only:
# DATABASE_URL=postgres://user:pass@host:port/dbname
```

The backend also supports:

- `CORS_ALLOWED_ORIGINS`
- `CSRF_TRUSTED_ORIGINS`
- `PGSSLMODE`
- `PYTHON_VERSION`

## Database Setup

```bash
python setup_db.py
python test_and_seed.py
python seed_full.py --force
```

## API Endpoints

| Prefix | Purpose |
|--------|---------|
| `/api/auth/` | Authentication and token operations |
| `/api/employees/` | Employee CRUD and profile data |
| `/api/menu/` | Menu items and categories |
| `/api/inventory/` | Inventory management |
| `/api/orders/` | Order creation and tracking |
| `/api/salaries/` | Salary records and payroll |
| `/api/dashboard/` | Analytics and KPIs |
| `/health/` | Application and DB health check |
| `/admin/` | Django admin interface |

## Running Locally

```bash
cd backend
venv\Scripts\activate
python manage.py runserver
```

Visit `http://localhost:8000` to confirm the backend is active.

## Production Notes

Render service uses the backend root `backend/` and runs:

```bash
pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate
```

Then starts the app with:

```bash
gunicorn config.wsgi:application --bind 0.0.0.0:$PORT --workers 2 --worker-class gthread --threads 4 --timeout 120
```

## Backend Features

- JWT authentication via `rest_framework_simplejwt`
- CORS support with `django-cors-headers`
- Static media served through WhiteNoise in production
- Automatic default user creation after migrations
- Health check endpoint for uptime monitoring
