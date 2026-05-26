# Frontend Architecture (React + Vite)

The frontend is a modern single-page application built with **React 19** and **Vite**.

## Tech Stack
- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios

## Project Structure
- `src/App.jsx` — main app wrapper and route configuration
- `src/main.jsx` — app entry point
- `src/pages/` — page-level route components
- `src/components/` — reusable UI components and layout wrappers
- `src/context/` — React Context providers for auth, theme, sound, and notifications
- `src/assets/` — static image and icon assets

## State Management
The app uses React Context API for lightweight global state.
- `AuthContext.jsx` — login, logout, token storage, and protected routes
- `ThemeContext.jsx` — light/dark mode support and preference persistence
- `SoundContext.jsx` — UI feedback sounds for button actions and notifications
- `ToastContext.jsx` — global notification system for success/error messages

## Layout & Routing
There are two main layout types:
- **PublicLayout** — landing pages, login, about, and contact pages
- **AdminLayout** — authenticated dashboard shell with sidebar navigation

Protected routing is handled with `ProtectedRoute.jsx` and `PublicRoute.jsx`.

## Core Pages
- `Dashboard.jsx` — KPIs, charts, and recent order summary
- `Menu.jsx` — menu catalog, item search, filters, and ordering flow
- `Orders.jsx` — order history, status updates, and order details
- `Inventory.jsx` — stock list, quantity details, and low-stock alerts
- `Employees.jsx` — employee directory and profile management
- `Salaries.jsx` — payroll records, net salary, and payment status
- `Reports.jsx` — analytics and revenue charts
- `Settings.jsx` — account and app preferences

## Deployment
This frontend is built as a static app and can be deployed to Render or any static host.

- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `dist`
- **Required Env**: `VITE_API_URL` should point to the backend API base URL
- **SPA Routing**: All unmatched routes should rewrite to `index.html`

Example Render environment variable:

```env
VITE_API_URL=https://cafeteria-backend.onrender.com/api/
```
