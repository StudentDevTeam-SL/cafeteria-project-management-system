-- ============================================================
-- Cafeteria Management — PostgreSQL Database Setup Script
-- Run this ONCE as a PostgreSQL superuser (e.g., postgres)
-- ============================================================

-- 1. Create the database and user
CREATE DATABASE cafeteriamanagement;
CREATE USER cafeuser WITH PASSWORD 'yourpassword';
GRANT ALL PRIVILEGES ON DATABASE cafeteriamanagement TO cafeuser;

-- 2. Connect to the new database
\c cafeteriamanagement;

-- 3. Grant schema privileges (PostgreSQL 15+ requires this)
GRANT ALL ON SCHEMA public TO cafeuser;

-- ============================================================
-- The tables below are created automatically by Django
-- migrations. This section documents the expected schema
-- for reference and manual inspection.
-- ============================================================

-- accounts_customuser (extends Django auth_user)
-- Django creates this via: python manage.py migrate

-- ============================================================
-- 4. Indexes (also created by Django migrations, listed here
--    for reference)
-- ============================================================

-- Speed up order lookups by status and date
-- CREATE INDEX idx_orders_status   ON orders_order (status);
-- CREATE INDEX idx_orders_created  ON orders_order (created_at);
-- CREATE INDEX idx_orders_employee ON orders_order (employee_id);

-- Speed up menu queries by category and availability
-- CREATE INDEX idx_menu_category   ON menu_menuitem (category);
-- CREATE INDEX idx_menu_available  ON menu_menuitem (is_available);

-- Salary by employee + month
-- CREATE INDEX idx_salary_employee ON employees_salary (employee_id, month);

-- Inventory low-stock alerts
-- CREATE INDEX idx_inventory_stock ON inventory_inventoryitem (quantity);

-- ============================================================
-- 5. Verify tables exist after migration
-- ============================================================
-- \dt            -- list all tables
-- \d orders_order  -- inspect a specific table

-- ============================================================
-- 6. Sample seed data (optional, for testing)
-- ============================================================

-- Insert test admin user (password hashing is done by Django,
-- use: python manage.py createsuperuser instead)

-- Insert sample menu items
-- INSERT INTO menu_menuitem (name, description, price, category, is_available, rating, created_at, updated_at)
-- VALUES
--   ('Grilled Chicken', 'Tender grilled chicken with herbs', 8.50, 'Main Course', TRUE, 4.7, NOW(), NOW()),
--   ('Caesar Salad',    'Fresh romaine, croutons, parmesan', 5.00, 'Salads',      TRUE, 4.5, NOW(), NOW()),
--   ('Fresh Orange Juice', 'Freshly squeezed OJ',          3.50, 'Beverages',   TRUE, 4.8, NOW(), NOW());
