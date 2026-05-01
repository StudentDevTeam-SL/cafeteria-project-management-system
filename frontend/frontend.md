# Frontend Architecture (React + Vite)

Cafeteria Management is a modern, high-performance single-page application built with React 19.

## Tech Stack
- **Framework**: React 19 + Vite (for fast HMR and optimized builds)
- **Styling**: Tailwind CSS (with native dark/light mode support)
- **Animations**: Framer Motion (for fluid, hardware-accelerated UI transitions)
- **Icons**: Lucide React
- **Routing**: React Router DOM (v6)

## State Management
Global state is managed using React Context API to ensure a lightweight and predictable state flow without heavy external libraries.
- `AuthContext`: Manages user login, session, and Role-Based Access Control.
- `ThemeContext`: Handles Light/Dark mode toggling and OS preference detection.
- `SoundContext`: Provides an auditory feedback system for Point-of-Sale interactions.
- `ToastContext`: Provides a global, animated popup notification system with built-in 7-second "Undo" functionality for critical destructive actions.

## Layout & Structure
The app utilizes a dual-layout system based on authentication state:
- **Public Layout**: Simple wrapper with a Navbar/Footer for marketing pages (`Home`, `About`, `Contact`, `Login`).
- **Admin Layout**: A sidebar-driven application shell with a top header (for user profile & theme toggle). Restricted to logged-in users.

## Core Features & Modules
1. **Point of Sale (POS) / Menu (`Menu.jsx`)**: 
   - A visual, touch-friendly catalog for taking orders.
   - Image upload functionality supporting local files and internet URLs.
   - Includes an interactive cart and checkout modal.
   - Haptic-style audio feedback on button presses.
2. **Order Management (`Orders.jsx`)**:
   - Kanban-style status tracking (Pending -> Processing -> Completed).
   - Multi-step Payment Modal supporting Cash, Zaad, PayPal, and Mastercard.
3. **Inventory Control (`Inventory.jsx`)**:
   - Data table for tracking raw ingredients.
   - Visual low-stock indicators and progress bars.
4. **Employee Management (`Employees.jsx`)**:
   - List and manage staff members, shift tracking.
   - Quick status toggles directly on the employee cards (Active/Inactive).
   - Filter tabs to easily view All, Active, or Inactive staff.
   - *Restricted to Admin users.*
5. **Payroll (`Salaries.jsx`)**:
   - Track base pay, bonuses, deductions, and payment status.
   - *Restricted to Admin users.*
6. **Dashboard (`Dashboard.jsx`)**:
   - Live clock and stat cards.
   - Dual analytics charts (Area and Bar).
   - Recent orders table.

## Design System & CSS Philosophy
All styling uses Tailwind utility classes, extended by a custom `index.css` file containing:
- **Glassmorphism**: Reusable `.glass`, `.glass-dark`, and `.glass-card` classes for premium UI overlays.
- **Animations**: Custom `@keyframes` (float, shimmer, pulse) injected globally.
- **Responsive Design**: Mobile-first approach using `md:`, `lg:`, `xl:` breakpoints.
