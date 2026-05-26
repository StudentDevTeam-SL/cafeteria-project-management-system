# Backend Architecture

Last updated: May 26, 2026

The backend is a Django 5.0.4 and Django REST Framework API. It provides JWT authentication, role permissions, business endpoints, file/media upload handling, PostgreSQL persistence, and a health check for deployment monitoring.

## Backend Apps

| App | Purpose |
| --- | --- |
| `accounts` | Custom user model, JWT login, Google login, user management, role permissions |
| `analytics` | Dashboard statistics endpoint |
| `employees` | Employee profiles, status toggle, salary visibility masking |
| `inventory` | Stock items, cost, min-stock thresholds |
| `menu` | Menu items, categories, contact messages, newsletter subscriptions, job applications, recipes, modifiers |
| `orders` | Tables, orders, order items, order modifiers, inventory deduction on recipes |
| `salaries` | Payroll records and net salary calculation |
| `config` | Django settings, URL routing, pagination, WSGI/ASGI |
| `tests` | Model, API, database integrity, and order feature tests |

## Request Flow

```mermaid
flowchart LR
    Request["HTTP request"] --> Urls["config/urls.py"]
    Urls --> ViewSet["APIView or ViewSet"]
    ViewSet --> Permission["Permission class"]
    Permission --> Serializer["Serializer"]
    Serializer --> Model["Model"]
    Model --> DB["PostgreSQL"]
    DB --> Model --> Serializer --> ViewSet --> Response["JSON response"]
```

## API Endpoints

| Prefix | Main handlers | Purpose |
| --- | --- | --- |
| `/api/auth/login/` | `CustomTokenObtainPairView` | Username/password login |
| `/api/auth/refresh/` | SimpleJWT `TokenRefreshView` | Refresh access token |
| `/api/auth/logout/` | `LogoutView` | Session logout response |
| `/api/auth/check-email/` | `CheckEmailView` | Public Google/Gmail user lookup |
| `/api/auth/google-social-login/` | `GoogleSocialLoginView` | Verify Google token and issue JWTs |
| `/api/auth/users/` | `UserViewSet` | User list/create/update/delete |
| `/api/menu/` | `MenuItemViewSet` | Menu item CRUD and availability toggle |
| `/api/menu/categories/` | `CategoryViewSet` | Menu categories |
| `/api/menu/contact-messages/` | `ContactMessageViewSet` | Public contact submit and admin review |
| `/api/menu/newsletter-subscriptions/` | `NewsletterSubscriptionViewSet` | Public newsletter submit and system review |
| `/api/menu/job-applications/` | `JobApplicationViewSet` | Public applications and admin status review |
| `/api/menu/recipes/` | `RecipeViewSet` | Recipes for inventory deduction |
| `/api/menu/modifier-groups/` | `ModifierGroupViewSet` | Modifier groups |
| `/api/menu/modifier-options/` | `ModifierOptionViewSet` | Modifier options |
| `/api/orders/` | `OrderViewSet` | Orders and status updates |
| `/api/orders/tables/` | `TableViewSet` | Dining table records |
| `/api/inventory/` | `InventoryItemViewSet` | Inventory CRUD |
| `/api/employees/` | `EmployeeViewSet` | Employee CRUD and toggle |
| `/api/salaries/` | `SalaryRecordViewSet` | Salary CRUD |
| `/api/dashboard/stats/` | `DashboardStatsView` | Revenue, order, staff, low-stock KPIs |
| `/health/` | `health_check` | App and database health |
| `/admin/` | Django admin | Admin console |

## Permissions

| Permission | Behavior |
| --- | --- |
| `IsAdminRole` | Admin role only |
| `IsManagerOrAdmin` | Manager or Admin only |
| `IsManagerOrAdminOrReadOnly` | Authenticated reads; Manager/Admin writes |
| `IsAdminOrDeleteDenied` | Authenticated read/create/update; delete only for Admin |

## Important Behaviors

- `OrderSerializer.create` calculates order totals from menu item prices and selected modifiers.
- If a menu item has a recipe, order creation deducts ingredient quantities from inventory.
- `SalaryRecord.save` recalculates `net_salary = base_salary + bonus - deduction`.
- `MenuItemSerializer` accepts category names and creates categories as needed.
- `JobApplicationSerializer` accepts CV uploads and validates PDF/DOC/DOCX extension.
- `NewsletterSubscriptionSerializer` normalizes email addresses and avoids duplicate subscription errors by reusing existing records.
- `EmployeeSerializer` masks salary and phone for non-admin users who are not viewing their own employee profile.

## Environment Variables

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_NAME=cafeteria_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432

CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
CSRF_TRUSTED_ORIGINS=https://your-frontend.onrender.com
```

Production can use:

```env
DATABASE_URL=postgres://user:password@host:port/dbname
DEBUG=False
PGSSLMODE=require
```

Optional local/demo helper:

```env
CREATE_DEMO_USERS=true
```

Leave `CREATE_DEMO_USERS` disabled in production. Seed scripts are the preferred way to create local demo data.

## Running

```powershell
cd backend
.\venv\Scripts\activate
python manage.py migrate
python manage.py runserver
```

## Verification

```powershell
python manage.py check
python manage.py makemigrations --check --dry-run
python manage.py test
```

Current workspace result: 48 backend tests pass.

## Related Docs

- [System data flow](data_flow.md)
- [Database schema](database.md)
- [Run guide](run.md)
- [Test guide](test.md)
- [Render deployment](render.md)
- [Frontend architecture](../../frontend/docs/frontend.md)
