# Database Schema

Last updated: May 26, 2026

The system uses PostgreSQL. Tables are created and changed through Django models and migrations.

## Connection Modes

Local development uses individual variables:

```env
DB_NAME=cafeteria_db
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
```

Production uses `DATABASE_URL` when it is set:

```env
DATABASE_URL=postgres://user:password@host:port/dbname
```

## Entity Relationship Overview

```mermaid
erDiagram
    accounts_customuser ||--o| employees_employee : "optional profile"
    employees_employee ||--o{ salaries_salaryrecord : "has salary records"
    menu_category ||--o{ menu_menuitem : "groups"
    menu_menuitem ||--o| menu_recipe : "may have recipe"
    menu_recipe ||--o{ menu_recipeingredient : "uses"
    inventory_inventoryitem ||--o{ menu_recipeingredient : "ingredient"
    menu_menuitem ||--o{ orders_orderitem : "ordered as"
    orders_order ||--o{ orders_orderitem : "contains"
    orders_table ||--o{ orders_order : "assigned to"
    menu_modifiergroup ||--o{ menu_modifieroption : "contains"
    menu_menuitem ||--o{ menu_menuitemmodifier : "supports"
    menu_modifiergroup ||--o{ menu_menuitemmodifier : "attached by"
    orders_orderitem ||--o{ orders_orderitemmodifier : "selected"
    menu_modifieroption ||--o{ orders_orderitemmodifier : "chosen"
```

## Accounts

### `accounts_customuser`

Extends Django `AbstractUser`.

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `username` | Unique login name |
| `password` | Hashed password |
| `email` | Email address, not unique by model definition |
| `first_name`, `last_name` | Name fields |
| `role` | `Admin`, `Manager`, `Staff`, or `Employee` |
| `phone_number` | Optional phone |
| `is_staff`, `is_superuser`, `is_active` | Django auth flags |

## Employees

### `employees_employee`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `user_id` | Optional one-to-one link to `accounts_customuser`; set null on user delete |
| `full_name` | Required display name |
| `job_title` | Current job title |
| `position` | Compatibility field |
| `phone` | Phone number |
| `salary` | Employee salary value |
| `hire_date` | Auto-created date |
| `status` | `active` or `inactive` |
| `shift` | Shift label |
| `hours` | Shift hours text |

## Menu

### `menu_category`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `name` | Unique category name |
| `description` | Optional text |
| `created_at` | Auto timestamp |

### `menu_menuitem`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `category_id` | Optional FK to category; cascade delete |
| `name` | Menu item name |
| `description` | Optional text |
| `price` | Decimal price |
| `image` | Optional upload path |
| `status` | `active` or `inactive` |
| `created_at` | Auto timestamp |

### `menu_contactmessage`

Stores public contact form messages.

| Field | Notes |
| --- | --- |
| `name` | Sender name |
| `email` | Sender email |
| `subject` | Message subject |
| `message` | Message body |
| `created_at` | Auto timestamp |

### `menu_newslettersubscription`

Stores footer newsletter email subscriptions.

| Field | Notes |
| --- | --- |
| `email` | Unique, normalized lowercase |
| `source` | Defaults to `footer` |
| `created_at` | Auto timestamp |

### `menu_jobapplication`

Stores public job applications and uploaded CV files.

| Field | Notes |
| --- | --- |
| `first_name`, `last_name` | Applicant name |
| `email`, `phone` | Contact info |
| `position` | Applied position |
| `experience_level` | Experience selection |
| `availability` | Optional availability |
| `start_date` | Optional date |
| `expected_salary` | Optional text |
| `portfolio_url` | Optional URL |
| `cover_letter` | Required message |
| `cv` | Uploaded file |
| `agreed_to_policy` | Required boolean |
| `status` | `new`, `reviewing`, `contacted`, or `closed` |
| `created_at` | Auto timestamp |

### Recipe and Modifier Tables

| Table | Purpose |
| --- | --- |
| `menu_recipe` | One recipe per menu item |
| `menu_recipeingredient` | Links recipe to inventory item and quantity |
| `menu_modifiergroup` | Option group such as extras or sizes |
| `menu_modifieroption` | Individual modifier option with price adjustment |
| `menu_menuitemmodifier` | Connects menu item to modifier group |

## Orders

### `orders_table`

| Field | Notes |
| --- | --- |
| `table_number` | Unique table label |
| `status` | `vacant`, `occupied`, or `reserved` |
| `seating_capacity` | Positive integer |

### `orders_order`

| Field | Notes |
| --- | --- |
| `id` | Primary key |
| `user_id` | Optional FK to user; set null on user delete |
| `customer_name` | Optional customer name |
| `employee_name` | Employee/cashier display name |
| `payment_method` | `cash`, `mastercard`, `paypal`, or `zaad` |
| `notes` | Optional notes |
| `total_price` | Calculated decimal total |
| `status` | `pending`, `processing`, `completed`, or `cancelled` |
| `created_at` | Auto timestamp |
| `table_id` | Optional FK to table |
| `order_type` | `dine_in`, `takeaway`, or `delivery` |
| `payment_status` | `unpaid`, `paid`, or `refunded` |

### `orders_orderitem`

| Field | Notes |
| --- | --- |
| `order_id` | FK to order; cascade delete |
| `menu_item_id` | FK to menu item |
| `quantity` | Positive integer |
| `subtotal` | Calculated item subtotal |

### `orders_orderitemmodifier`

Links an order item to selected modifier options.

## Inventory

### `inventory_inventoryitem`

| Field | Notes |
| --- | --- |
| `item_name` | Unique item name |
| `quantity` | Integer stock quantity |
| `unit` | Unit such as kg, pcs, liters |
| `min_stock` | Low-stock threshold |
| `category` | Stock category |
| `cost` | Decimal cost |
| `updated_at` | Auto-updated timestamp |

## Salaries

### `salaries_salaryrecord`

| Field | Notes |
| --- | --- |
| `employee_id` | FK to employee; cascade delete |
| `base_salary` | Decimal base pay |
| `bonus` | Decimal bonus |
| `deduction` | Decimal deduction |
| `net_salary` | Auto-calculated on save |
| `payment_date` | Date |
| `status` | `paid` or `pending` |

## Data Integrity Rules

- Usernames are unique.
- Category names are unique.
- Inventory item names are unique.
- Salary records require an employee.
- Deleting an order cascades to its order items.
- Deleting an employee cascades to salary records.
- Deleting a category cascades to menu items.
- Deleting a user sets related employee/order user links to null where configured.

## Related Docs

- [System data flow](data_flow.md)
- [Backend architecture](backend.md)
- [Test guide](test.md)
