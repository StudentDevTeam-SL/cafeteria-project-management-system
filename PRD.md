# Product Requirements Document (PRD)

## Project Name
Catateria Project Management System

## Purpose
The Catateria Project Management System is a cafeteria operations platform designed to serve both public website visitors and internal staff. It provides a public-facing website for contact, newsletter subscriptions, and job applications, while offering authenticated staff with menu management, point-of-sale ordering, inventory control, employee management, payroll tracking, and reporting.

## Objectives
- Deliver a complete cafeteria operations workflow from public engagement through back-office management.
- Provide secure role-based access for staff, managers, and administrators.
- Enable menu and order management with inventory deduction and payroll visibility.
- Support contact, newsletter, and job application intake via a public website.
- Ensure maintainable, tested, and deployable architecture using React/Vite frontend and Django REST backend.

## Target Users
1. Public Visitor
   - Views cafeteria information.
   - Submits contact messages.
   - Subscribes to newsletters.
   - Applies for jobs.

2. Staff
   - Logs in to view dashboard metrics.
   - Creates and updates orders.
   - Views menu and inventory availability.

3. Manager
   - Manages menu items and categories.
   - Reviews everyday orders and tables.
   - Monitors inventory and reports.
   - Manages employees and salary records.

4. Administrator
   - Manages system users and access.
   - Reviews contact messages, newsletter subscriptions, and job applications.
   - Accesses admin-only operations and deeper system controls.

## High-Level Features
- Public website with contact form, newsletter signup, and job application submission.
- Authentication with username/password and Google sign-in.
- Role-based access control across pages and API endpoints.
- Dashboard displaying key performance indicators.
- Menu management, including categories, item status, recipes, and modifiers.
- Order creation and management with status updates and optional payment metadata.
- Inventory CRUD and low-stock monitoring.
- Employee management with active/inactive toggles.
- Salary record CRUD with automatic net salary calculations.
- Reports pages with export and print capabilities.
- Health check endpoint for deployment monitoring.

## Functional Requirements
### Public Website
- FR1: Visitors can submit contact messages.
- FR2: Visitors can subscribe to the newsletter.
- FR3: Visitors can submit job applications with CV uploads.

### Authentication & Authorization
- FR4: System supports login via email/password.
- FR5: System supports Google OAuth login.
- FR6: Users receive JWT access/refresh tokens.
- FR7: Protected routes must be blocked for unauthenticated users.
- FR8: Manager/Admin-only routes must be blocked for unauthorized users.
- FR9: Admin-only routes are restricted to admin users.

### Menu Management
- FR10: Managers can create, update, and delete menu categories.
- FR11: Managers can create, update, and delete menu items.
- FR12: Managers can toggle menu item availability.
- FR13: Menu items support recipe and modifier configuration.

### Order Management
- FR14: Staff can create new orders from active menu items.
- FR15: Order creation calculates totals using item prices and selected modifiers.
- FR16: Orders with recipe ingredients deduct inventory quantities.
- FR17: Staff can update order status and delete orders where permitted.
- FR18: Orders can store payment method metadata and status.

### Inventory Control
- FR19: Managers can create, read, update, and delete inventory items.
- FR20: Inventory items include stock quantity, cost, and minimum thresholds.
- FR21: Low-stock conditions are visible in reports and dashboards.

### Employees & Salaries
- FR22: Managers can manage employee profiles.
- FR23: Managers can toggle employee active/inactive status.
- FR24: Salary records can be created, updated, and deleted.
- FR25: Salary records automatically compute net salary as `base + bonus - deductions`.
- FR26: Salary and phone details are masked for non-admin users where appropriate.

### Reporting & Admin Review
- FR27: Dashboard shows revenue, order, staff, and stock KPIs.
- FR28: Managers can view contact messages and newsletter subscriptions.
- FR29: Admins can review and manage job applications.
- FR30: Reports can be exported to CSV and printed from the frontend.

### System & Infrastructure
- FR31: Backend exposes a health endpoint for deployment checks.
- FR32: Frontend builds successfully with Vite and passes linting.
- FR33: Backend passes Django check and automated tests.
- FR34: Deployment is supported via `render.yaml`.

## Nonfunctional Requirements
- NFR1: The system must maintain responsive UI behavior across desktop browsers.
- NFR2: All persisted operations must use secure API calls with JWT authentication.
- NFR3: Password and token handling must follow best practices for storage and refresh.
- NFR4: Public forms must validate input and provide user-friendly error feedback.
- NFR5: The app must be maintainable by separating frontend and backend concerns.
- NFR6: The backend must support PostgreSQL in production and local development.
- NFR7: Build and test commands must be documented and repeatable.

## UX and UI Requirements
- The application must provide a clear navigation structure with separate public and authenticated layouts.
- Authenticated users must see UI feedback for loading states, errors, and success notifications.
- Forms must support required fields, validation messages, and contextual help.
- Reports pages must include CSV export and print UI affordances.
- Settings should allow profile updates and local theme/sound preferences.

## Data & API Requirements
- The backend API must expose REST endpoints for auth, menu, orders, inventory, employees, and salaries.
- The API must enforce permissions on create/update/delete operations.
- Public endpoints must allow contact messages, subscriptions, and job applications.
- Menu and order endpoints must support nested relationships for modifiers and recipe ingredients.
- JWT refresh flow must be implemented in the Axios client.

## Metrics of Success
- Successful local deployment with working frontend and backend.
- All backend tests pass and frontend build/lint succeed.
- Public forms submit successfully and persist records.
- Authenticated users can execute core workflows: menu editing, order creation, inventory updates, employee/salary management.
- Admin users can review incoming messages, subscriptions, and job applications.

## Constraints and Assumptions
- External payment processing is not required; payment metadata is stored locally per order.
- Demo accounts are seeded via scripts and not automatically created in production.
- Production deployment is expected to run with `DEBUG=False` and secure environment variables.
- CV uploads are stored through Django media handling and validated for accepted file types.

## Roadmap / Next Enhancements
- Add live stock alerts for inventory thresholds.
- Add role-based analytics dashboards per user type.
- Add email notifications for job applications and contact messages.
- Add full payment provider integration for order checkout.
- Add multi-location cafeteria support with branch-level data.
