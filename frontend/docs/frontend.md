# Frontend Architecture

Last updated: May 26, 2026

The frontend is a React 19 single-page application built with Vite. It uses Axios to connect to the Django REST API and React Router for public/protected navigation.

## Stack

| Area | Tool |
| --- | --- |
| App framework | React 19 with Vite |
| Routing | React Router DOM v7 |
| Styling | Tailwind CSS and local CSS utilities |
| HTTP | Axios client in `src/api/axios.js` |
| Charts | Recharts |
| Animation | Framer Motion |
| Icons | Lucide React |

## Runtime API Configuration

The frontend talks to the backend through:

```env
VITE_API_URL=http://localhost:8000/api/
```

If `VITE_API_URL` is not set, the Axios client defaults to:

```text
http://localhost:8000/api/
```

## Main Structure

| Path | Purpose |
| --- | --- |
| `src/App.jsx` | Route tree and provider wiring |
| `src/api/axios.js` | API base URL, auth token attachment, token refresh handling |
| `src/context/AuthContext.jsx` | Login, Google login, logout, profile update, local session state |
| `src/context/ThemeContext.jsx` | Light/dark theme state |
| `src/context/SoundContext.jsx` | UI sound preference state |
| `src/context/ToastContext.jsx` | App notifications |
| `src/components/Layout/PublicLayout.jsx` | Public website shell and newsletter form |
| `src/components/Layout/AdminLayout.jsx` | Authenticated dashboard shell |
| `src/components/ProtectedRoute.jsx` | Role-protected routes |
| `src/pages/` | Route-level pages |

## Page-to-API Map

| Page/component | Main actions | API connection |
| --- | --- | --- |
| `Login.jsx` | Email check, username/password login, Google login start | `auth/check-email/`, `auth/login/`, `auth/google-social-login/` |
| `Contact.jsx` | Public contact form submit | `menu/contact-messages/` |
| `PublicLayout.jsx` | Public newsletter subscribe | `menu/newsletter-subscriptions/` |
| `JobApplication.jsx` | Public job application with CV upload | `menu/job-applications/` |
| `Dashboard.jsx` | KPIs and recent orders | `dashboard/stats/`, `orders/` |
| `Menu.jsx` | Menu CRUD, item toggle, POS order, table list | `menu/`, `menu/:id/toggle/`, `orders/`, `orders/tables/` |
| `Orders.jsx` | Order list, create order, status update, delete | `orders/`, `orders/:id/status/`, `menu/`, `employees/` |
| `Inventory.jsx` | Stock CRUD and filters | `inventory/` |
| `Employees.jsx` | Employee CRUD and active/inactive toggle | `employees/`, `employees/:id/toggle/` |
| `Salaries.jsx` | Salary CRUD | `salaries/`, `employees/` |
| `ContactMessages.jsx` | Read/delete contact messages | `menu/contact-messages/` |
| `SystemMessages.jsx` | Read/export/delete newsletter subscriptions | `menu/newsletter-subscriptions/` |
| `Jobs.jsx` | Review applications and change status | `menu/job-applications/` |
| `Reports.jsx` | Reports, CSV, print receipts | Reads `menu/`, `orders/`, `inventory/`, `salaries/`, `menu/job-applications/` |
| `Settings.jsx` | Profile update, user create/delete, contact messages panel | `auth/users/`, `menu/contact-messages/` |

## Buttons and Tables

Backend-backed tables:

- Menu item table/cards save through `/api/menu/`.
- Orders table saves through `/api/orders/`.
- Inventory table saves through `/api/inventory/`.
- Employees table saves through `/api/employees/`.
- Salaries table saves through `/api/salaries/`.
- Contact Messages, System Messages, Jobs, and Reports load database rows from their API endpoints.

Client-only controls:

- Search, filters, sort controls, pagination, modal state, and active report tab.
- Theme, accent color, sound setting, performance mode, and avatar preview in Settings.
- CSV downloads and print buttons in Reports, Jobs, and System Messages.

Payment note:

- `PaymentModal.jsx` simulates collection of payment method/details. It does not contact a bank, card processor, PayPal, or mobile money API. The selected payment method is saved on the order.

## Authentication Behavior

1. The user logs in through `AuthContext.login`.
2. Access and refresh tokens are saved in local storage.
3. `src/api/axios.js` attaches `Authorization: Bearer <token>` to API requests.
4. If the backend returns `401`, Axios attempts `auth/refresh/`.
5. If refresh succeeds, Axios retries the original request.
6. If refresh fails, local storage is cleared and the user is redirected to `/login`.

## Route Access

Public routes:

- `/home`
- `/about`
- `/contact-us`
- `/jobs`
- `/login`

Authenticated routes:

- `/dashboard`
- `/menu`
- `/orders`
- `/inventory`
- `/contact-messages`
- `/settings`
- `/reports`

Manager/Admin routes:

- `/employees`
- `/salaries`
- `/system/messages`

Admin-only routes:

- `/admin/jobs`

## Verification

Validated commands:

```powershell
cd frontend
npm run lint
npm run build
```

The production build currently succeeds. Vite may warn that the bundled JavaScript is larger than 500 kB; that is a performance warning, not a functional failure.

## Related Docs

- [System data flow](../../backend/docs/data_flow.md)
- [Backend architecture](../../backend/docs/backend.md)
- [Database schema](../../backend/docs/database.md)
