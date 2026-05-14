# test.md — Cafeteria Management System — Full Testing Guide

## How to Run Tests

### Backend Automated Tests (Django)

Run all test suites from the `backend/` directory with the venv activated:

```powershell
# Run ALL tests
python manage.py test tests --verbosity=2

# Run specific test suites
python manage.py test tests.test_models --verbosity=2
python manage.py test tests.test_api --verbosity=2
python manage.py test tests.test_db_integrity --verbosity=2
```

**Expected output:**

```
System check identified no issues (0 silenced).
...
Ran 40+ tests in X.XXXs
OK
```

### Seed Demo Data

We have an automated script that tests the database connection, ensures migrations are applied, and seeds the database with realistic demo data. Run this from the `backend` directory:

```powershell
python test_and_seed.py
```

This tests your PostgreSQL setup and creates:

- **Admin user**: `admin` / `admin1234`
- **Staff user**: `employee` / `1234`
- 25 menu items across 5 categories
- 20 inventory items (including low-stock alerts)
- 10 employees with salary records
- 150 sample orders

*(If you need to completely wipe the database and re-seed, you can run `python seed_full.py --force`)*

---

## Automated Test Coverage

### Model Tests (`tests/test_models.py`)

| Test | What It Verifies |
|---|---|
| `test_create_user_with_role` | CustomUser role field saves correctly |
| `test_admin_user` | `is_admin` property returns `True` for Admin role |
| `test_default_role_is_capitalized` | Default role is `Staff` |
| `test_full_name_property` | `user.full_name` concatenates first + last name |
| `test_menu_item_defaults` | New MenuItem status defaults to `active` |
| `test_category_str` | Category `__str__` returns the name |
| `test_inventory_item_new_fields` | `min_stock`, `category`, `cost` fields persist |
| `test_inventory_str` | InventoryItem `__str__` contains item name |
| `test_order_creation_with_new_fields` | Order + OrderItems save with correct status |
| `test_order_processing_status` | `processing` status accepted by model |
| `test_employee_new_fields` | `job_title`, `shift`, `status` fields persist |
| `test_employee_str` | Employee `__str__` returns full_name |
| `test_salary_net_calculation` | `net_salary = base + bonus - deduction` |
| `test_salary_default_status` | New SalaryRecord status defaults to `pending` |

### API Tests (`tests/test_api.py`)

#### Authentication

| Test | Expected |
|---|---|
| `test_login_returns_tokens` | `POST /api/auth/login/` → 200 with `access` + `refresh` tokens |
| `test_login_wrong_password_returns_401` | Wrong password → 401 |
| `test_me_endpoint_returns_current_user` | `GET /api/auth/me/` → 200 with username |
| `test_me_unauthenticated_returns_401` | No token → 401 |
| `test_logout_blacklists_token` | `POST /api/auth/logout/` → 200 |
| `test_token_refresh` | `POST /api/auth/token/refresh/` → 200 with new `access` |

#### Menu API

| Test | Expected |
|---|---|
| `test_list_menu_authenticated` | Employee can list menu → 200 |
| `test_list_menu_unauthenticated_returns_401` | No token → 401 |
| `test_create_menu_item_admin` | Admin creates item → 201 |
| `test_create_menu_item_employee_returns_403` | Employee cannot create → 403 |
| `test_get_single_menu_item` | Fetch by ID → 200 with name |
| `test_update_menu_item_admin` | Admin PUT → 200 with updated name |
| `test_delete_menu_item_admin` | Admin DELETE → 204, item gone |
| `test_delete_menu_item_employee_returns_403` | Employee DELETE → 403 |
| `test_toggle_availability_admin` | PATCH `/toggle/` flips `is_available` |
| `test_filter_menu_by_category` | `?category=Beverages` returns only beverages |
| `test_create_menu_item_negative_price_returns_400` | Negative price rejected → 400 |

#### Orders API

| Test | Expected |
|---|---|
| `test_employee_can_place_order` | Employee POST order → 201, `order_number` starts with `ORD-` |
| `test_order_items_created_with_order` | Items array in response has correct length |
| `test_employee_sees_only_own_orders` | Employee list → only own orders |
| `test_admin_sees_all_orders` | Admin list → all orders |
| `test_update_order_status_admin` | Admin PATCH `/status/` → 200, status updated |
| `test_update_order_status_employee_returns_403` | Employee cannot change status → 403 |
| `test_unauthenticated_order_list_returns_401` | No token → 401 |

#### Inventory API

| Test | Expected |
|---|---|
| `test_list_inventory_authenticated` | Any auth user can list → 200 |
| `test_create_inventory_item_admin` | Admin creates item → 201 |
| `test_create_inventory_item_employee_returns_403` | Employee cannot create → 403 |
| `test_low_stock_endpoint_returns_low_items_only` | `/low-stock/` only returns items below threshold |
| `test_update_inventory_item_admin` | Admin PUT → 200 |
| `test_delete_inventory_item_admin` | Admin DELETE → 204 |

#### Salary API

| Test | Expected |
|---|---|
| `test_list_salaries_admin` | Admin can list → 200 |
| `test_list_salaries_employee_returns_403` | Employee cannot list → 403 |
| `test_create_salary_admin` | Admin creates record → 201, `net_salary` auto-computed |
| `test_mark_salary_paid` | PATCH `/pay/` → 200, status=`paid`, `paid_at` set |
| `test_salary_deduction_exceeds_total_returns_400` | Over-deduction rejected → 400 |
| `test_duplicate_salary_month_returns_400` | Same employee + month → 400/409 |

---

## Security Testing

### Dependency Audit

```powershell
# Backend
pip install safety
safety check

# Frontend
npm audit
```

### Security Headers (post-deployment)

After deploying to Render, visit these services to verify headers:

- **Headers check**: [securityheaders.com](https://securityheaders.com)
- **SSL check**: [ssllabs.com](https://www.ssllabs.com/ssltest/)

Expected headers in production (`DEBUG=False`):

| Header | Expected Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Content-Security-Policy` | Set by Django security middleware |

### Health Check Endpoint

```powershell
# Local
curl http://localhost:8000/health/

# Production (after deploy)
curl https://cafeteria-backend.onrender.com/health/
```

Expected response:

```json
{"status": "ok", "db": "connected"}
```

---

## Manual Frontend Testing

### 1. Login

| Scenario | Steps | Expected |
|---|---|---|
| Admin login | Username: `admin`, Password: `admin` | Redirected to `/dashboard`, full sidebar visible |
| Staff login | Username: `employee`, Password: `1234` | Dashboard loads, Salaries/Employees links hidden |
| Wrong credentials | Any bad username/password | Red error: "Invalid credentials. Please try again." |

### 2. Menu Page (`/menu`)

| Scenario | Steps | Expected |
|---|---|---|
| View items | Navigate to `/menu` | 25 items in grid with category badges |
| Filter by category | Click "Salads" tab | Only salad items visible |
| Search | Type "burger" in search | Only "Classic Beef Burger" shows |
| Toggle availability | Click toggle on any card | Card shows "Unavailable" overlay |
| Add item | Click "+ Add Item", fill form | New card appears in grid |
| Edit item | Click ✏️ icon, change price | Card updates immediately |
| Delete + Undo | Click 🗑️ icon | Item disappears; 7-second undo popup appears |

### 3. Orders Page (`/orders`)

| Scenario | Steps | Expected |
|---|---|---|
| View orders | Navigate to `/orders` | Sample orders table with status badges |
| New order | Click "+ New Order", add items | Order appears in table |
| Cash payment | Select Cash, click Pay | Green success screen, order saved |
| Zaad payment | Select Zaad, enter phone | Success animation plays |
| Card validation | Leave card fields empty, click Pay | Red validation errors appear |

### 4. Dark Mode

1. Click 🌙 moon icon in navbar.
2. Expected: Deep navy dark theme applied across all pages.
3. Click ☀️ to switch back.
4. Expected: Warm gray light mode.

### 5. Mobile Responsive

1. Open DevTools (F12) → Device toolbar → iPhone 12 Pro (390px).
2. Expected: Hamburger menu appears, sidebar collapses to drawer, menu cards in single column.

---

## Project Integration Status

| Component | Status | Notes |
|---|---|---|
| Authentication | ✅ Production-Ready | JWT with role-based access, CSRF hardened |
| Database | ✅ Production-Ready | PostgreSQL via `dj-database-url` on Render |
| Static Files | ✅ Production-Ready | Served via WhiteNoise |
| Health Check | ✅ Production-Ready | `/health/` with DB connectivity probe |
| Security Headers | ✅ Production-Ready | HSTS, XFrame, CSP enforced in production |
| Render Deployment | ✅ Ready | `render.yaml` configured, `.env.example` documented |
| Payment Flow | ✅ Integrated | Orders saved with payment method metadata |
| Photo Upload | ✅ Integrated | Local file upload + URL supported |
| Dashboard Charts | ✅ Integrated | Real-time stats from DB |
