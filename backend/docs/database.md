# 🗄️ Database Schema

The Cafeteria Management System uses **PostgreSQL** in both development and production. The schema is implemented using Django's ORM.

## Database Connection

- **Local:** Connects via `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` in `.env`.
- **Production (Render):** Connects via the `DATABASE_URL` environment variable.

## Schema Architecture

### 1. Accounts (`accounts_customuser`)
Stores all staff and admin users for authentication and authorization.
- `id` (Primary Key)
- `username` (String, unique)
- `email` (String, unique)
- `role` (String, choices: 'admin', 'employee')
- *Plus standard Django User fields (password, is_staff, is_active, etc.)*

### 2. Employees (`employees_employee`)
Detailed profiles for staff members, linked to their account.
- `id` (Primary Key)
- `user` (OneToOneField -> CustomUser)
- `employee_id` (String, unique - e.g., 'EMP-1001')
- `phone` (String, max_length=20)
- `job_title` (String, max_length=100)
- `shift` (String, choices: 'Morning', 'Evening', 'Night')
- `status` (String, choices: 'Active', 'On Leave', 'Inactive')

### 3. Menu Items (`menu_menuitem`)
Stores all food/beverage items available for ordering.
- `id` (Primary Key)
- `name` (String, max_length=255)
- `category` (String, choices: 'Main Course', 'Beverages', 'Salads', 'Snacks', 'Desserts')
- `price` (DecimalField, max_digits=10, decimal_places=2)
- `is_available` (Boolean, default=True)
- `image` (ImageField, upload_to='menu_items/', null=True, blank=True)

### 4. Orders (`orders_order`)
Stores customer/employee orders and their status.
- `id` (Primary Key)
- `order_number` (String, unique - auto-generated, e.g., 'ORD-20260514-A1B2')
- `cashier` (ForeignKey -> CustomUser)
- `total_amount` (DecimalField, max_digits=10, decimal_places=2)
- `status` (String, choices: 'pending', 'processing', 'completed', 'cancelled')
- `payment_method` (String, choices: 'Cash', 'Card', 'Mobile Money')
- `created_at` (DateTimeField, auto_now_add=True)
- `updated_at` (DateTimeField, auto_now=True)

### 5. Order Items (`orders_orderitem`)
Bridge table linking Orders to Menu Items with quantities and locked-in prices.
- `id` (Primary Key)
- `order` (ForeignKey -> Order)
- `menu_item` (ForeignKey -> MenuItem)
- `quantity` (IntegerField, default=1)
- `price_at_time` (DecimalField, max_digits=10, decimal_places=2)

### 6. Inventory (`inventory_inventoryitem`)
Stores raw materials, stock levels, and supplies.
- `id` (Primary Key)
- `item_name` (String, max_length=255)
- `category` (String, choices: 'Produce', 'Meat', 'Dairy', 'Beverages', 'Dry Goods', 'Supplies')
- `quantity` (DecimalField, max_digits=10, decimal_places=2)
- `unit` (String, choices: 'kg', 'g', 'L', 'ml', 'pcs', 'boxes')
- `min_stock` (DecimalField, default=0) - *Threshold for low stock alerts*
- `cost_per_unit` (DecimalField, max_digits=10, decimal_places=2)
- `last_updated` (DateTimeField, auto_now=True)

### 7. Salaries / Payroll (`salaries_salaryrecord`)
Stores monthly payroll records for employees.
- `id` (Primary Key)
- `employee` (ForeignKey -> Employee)
- `month` (DateField) - *Usually stores the first day of the relevant month*
- `base_salary` (DecimalField, max_digits=10, decimal_places=2)
- `bonus` (DecimalField, max_digits=10, decimal_places=2, default=0)
- `deductions` (DecimalField, max_digits=10, decimal_places=2, default=0)
- `net_salary` (DecimalField) - *(Calculated: Base + Bonus - Deductions)*
- `status` (String, choices: 'Pending', 'Paid')
- `payment_date` (DateField, null=True, blank=True)
