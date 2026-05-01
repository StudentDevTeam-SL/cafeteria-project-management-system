# Backend Architecture (Django REST Framework) - [IMPLEMENTED]

The backend for Cafeteria Management is implemented using **Django** and **Django REST Framework (DRF)**. It serves as a secure API providing data to the React frontend with JWT authentication and RBAC.

## 1. Authentication & Security
- **JWT (JSON Web Tokens)**: Implement using `djangorestframework-simplejwt`.
- **Role-Based Access Control (RBAC)**: Ensure APIs restrict endpoints based on user roles (Admin vs Employee).
  - Admin: Full CRUD access to all endpoints.
  - Employee: Can create orders, view menu, but cannot modify employees, inventory, or salaries.

## 2. API Endpoints Required

### Authentication & User Management
- `POST /api/auth/login/` - Obtain JWT access & refresh tokens.
- `POST /api/auth/refresh/` - Refresh expired access token.
- `POST /api/auth/logout/` - Blacklist refresh token.
- `GET /api/auth/users/` - List all system users (Admin only).
- `POST /api/auth/users/` - Create a new system user with password hashing.
- `DELETE /api/auth/users/<id>/` - Delete a system user.

### Employees
- `GET /api/employees/` - List all employees (Admin only).
- `POST /api/employees/` - Create a new employee.
- `PUT/PATCH /api/employees/<id>/` - Update employee details.
- `DELETE /api/employees/<id>/` - Deactivate/delete employee.

### Menu
- `GET /api/menu/` - List all active menu items.
- `POST /api/menu/` - Create new menu item (Admin only).
- `PUT/PATCH /api/menu/<id>/` - Update item (price, status, image).
- `DELETE /api/menu/<id>/` - Remove item from menu.

### Orders
- `GET /api/orders/` - List all orders (filter by status, date).
- `POST /api/orders/` - Create a new order (with nested `order_items`).
- `PATCH /api/orders/<id>/status/` - Update order status (e.g., pending -> processing -> completed).

### Inventory
- `GET /api/inventory/` - List all inventory items.
- `POST /api/inventory/` - Add a new stock item.
- `PUT/PATCH /api/inventory/<id>/` - Update stock levels (e.g., after an order or manual restock).
- `DELETE /api/inventory/<id>/` - Remove an item.

### Salaries / Payroll
- `GET /api/salaries/` - List payroll records (filter by month/employee).
- `POST /api/salaries/` - Generate a new payroll record.
- `PATCH /api/salaries/<id>/status/` - Mark salary as Paid.

## 3. Recommended App Structure
```text
backend/
├── manage.py
├── config/                 # Main settings, urls, wsgi
├── accounts/               # Custom User model, JWT config, User Management
├── employees/              # Employee model & views
├── menu/                   # Menu item models & views
├── orders/                 # Order, OrderItem models & views
├── inventory/              # Inventory models & views
├── salaries/               # Salary/Payroll models & views
├── analytics/              # Dashboard stats endpoint
└── db.sqlite3              # SQLite database (data persists here)
```
