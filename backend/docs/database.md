# 🗄️ Database Schema

The Cafeteria Management System uses **PostgreSQL** for development and production. The schema is created through Django models and migrations.

## Database Connection

- **Local**: configured using `.env` values:
  - `DB_NAME`
  - `DB_USER`
  - `DB_PASSWORD`
  - `DB_HOST`
  - `DB_PORT`
- **Production / Render**: uses `DATABASE_URL`

## Core Tables

### Accounts (`accounts_customuser`)
Stores user authentication and role data.
- `id`
- `username` (unique)
- `email` (unique)
- `role` (`Admin`, `Manager`, `Staff`, `Employee`)
- `password`
- `is_staff`
- `is_superuser`
- `is_active`
- `first_name`
- `last_name`
- `phone_number`

### Employees (`employees_employee`)
Employee profile details.
- `id`
- `user` (OneToOneField → CustomUser)
- `employee_id`
- `full_name`
- `phone`
- `job_title`
- `shift`
- `status`
- `hire_date`

### Menu Items (`menu_menuitem`)
Holds cafeteria menu items.
- `id`
- `name`
- `description`
- `category`
- `price`
- `is_available`
- `image`
- `created_at`
- `updated_at`

### Orders (`orders_order`)
Tracks each order and payment detail.
- `id`
- `order_number`
- `cashier` (ForeignKey → CustomUser)
- `total_amount`
- `status`
- `payment_method`
- `created_at`
- `updated_at`

### Order Items (`orders_orderitem`)
Links orders to menu items.
- `id`
- `order` (ForeignKey → Order)
- `menu_item` (ForeignKey → MenuItem)
- `quantity`
- `price_at_time`

### Inventory (`inventory_inventoryitem`)
Manages stock items and thresholds.
- `id`
- `item_name`
- `category`
- `quantity`
- `unit`
- `min_stock`
- `cost_per_unit`
- `last_updated`

### Salaries (`salaries_salaryrecord`)
Stores payroll records for employees.
- `id`
- `employee` (ForeignKey → Employee)
- `month`
- `base_salary`
- `bonus`
- `deductions`
- `net_salary`
- `status`
- `payment_date`

## Notes

- The backend uses `dj-database-url` to parse `DATABASE_URL` in production.
- Default users are created automatically after migrations via the `accounts` app startup hook.
- Use `python manage.py migrate` to apply schema changes and `python seed_full.py --force` to refresh seeded demo data.
