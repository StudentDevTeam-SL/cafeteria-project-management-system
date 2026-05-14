# Database Schema (Django Models) - [IMPLEMENTED]

The following schema is implemented via Django Models and is currently running on **SQLite** for development, with full compatibility for PostgreSQL in production.

## 1. Employees (`users_employee`)
Stores all staff and admin users.
- `id` (Primary Key, UUID or Integer)
- `user_id` (String, unique - e.g., 'EMP001')
- `full_name` (String, max_length=255)
- `phone` (String, max_length=20)
- `job_title` (String, max_length=100)
- `status` (String, choices: 'active', 'inactive')
- `shift` (String, choices: 'Morning', 'Evening', 'Night')
- `hours` (String, e.g., '08:00 AM - 04:00 PM')
- `role` (String, choices: 'Admin', 'Employee') - *Used for system access control*

## 2. Menu Items (`menu_item`)
Stores all food/beverage items available for ordering.
- `id` (Primary Key)
- `name` (String, max_length=255)
- `category` (String, choices: 'Main Course', 'Beverages', 'Salads', 'Snacks', 'Desserts')
- `price` (DecimalField, max_digits=10, decimal_places=2)
- `is_active` (Boolean, default=True)
- `status` (String, choices: 'active', 'pending', 'rejected') - *For admin approval workflow*
- `image` (ImageField, upload_to='menu_items/', null=True, blank=True)

## 3. Orders (`orders_order`)
Stores customer/employee orders.
- `id` (Primary Key, or custom tracking ID like '#ORD-001')
- `employee_id` (ForeignKey -> Employee, null=True) OR `customer_name` (String)
- `total` (DecimalField, max_digits=10, decimal_places=2)
- `status` (String, choices: 'pending', 'processing', 'completed', 'cancelled')
- `payment_method` (String, choices: 'Cash', 'Mastercard', 'PayPal', 'Zaad')
- `created_at` (DateTimeField, auto_now_add=True)
- `notes` (TextField, blank=True) - *For custom instructions like "no onions"*

## 4. Order Items (`orders_orderitem`)
Bridge table for Order to Menu Items.
- `id` (Primary Key)
- `order_id` (ForeignKey -> Order)
- `menu_item_id` (ForeignKey -> Menu Item)
- `quantity` (IntegerField)
- `price_at_time` (DecimalField, max_digits=10, decimal_places=2)

## 5. Inventory (`inventory_item`)
Stores stock levels and supplies.
- `id` (Primary Key)
- `item_name` (String, max_length=255)
- `category` (String, choices: 'Protein', 'Beverages', 'Vegetables', 'Grains', 'Dairy', 'Bakery', 'Condiments')
- `quantity` (DecimalField, max_digits=10, decimal_places=2)
- `unit` (String, choices: 'kg', 'g', 'liters', 'ml', 'units', 'boxes')
- `min_stock` (DecimalField) - *Threshold for low stock alerts*
- `cost_per_unit` (DecimalField, max_digits=10, decimal_places=2)
- `last_updated` (DateTimeField, auto_now=True)

## 6. Salaries / Payroll (`payroll_salary`)
Stores monthly payroll records.
- `id` (Primary Key)
- `employee_id` (ForeignKey -> Employee)
- `month` (DateField)
- `base_salary` (DecimalField)
- `bonus` (DecimalField, default=0)
- `deductions` (DecimalField, default=0)
- `net_salary` (DecimalField) - *(Calculated: Base + Bonus - Deductions)*
- `status` (String, choices: 'Paid', 'Pending')
