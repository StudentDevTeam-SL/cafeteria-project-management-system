<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# Cafeteria Management

Welcome to **Cafeteria Management**, a premium open-source cafeteria management system designed to streamline orders, manage inventory, and oversee employees through a beautiful, modern interface.

## Project Overview

Cafeteria Management is a full-stack web application. It features a rich, animated React frontend with advanced UI paradigms like glassmorphism, responsive dark mode, and an integrated audio-feedback Point-of-Sale (POS) system. It is designed to be backed by a powerful Django REST Framework API.

### Current State
Currently, the **Frontend Application is 100% complete** and running in a "Mock Mode." It contains beautifully designed screens, state management (Auth, Theme, Sound), and navigation logic, but relies on static mock data.

The **Backend Application** is the next phase of development.

## Documentation
To understand the inner workings and future requirements of the project, please review the following documentation files:
- 📄 [frontend.md](./frontend.md) - Details the React architecture, state management, and UI design system.
- 📄 [backend.md](./backend.md) - Outlines the required Django REST Framework API endpoints and security models.
- 📄 [database.md](./database.md) - Defines the Entity Relationship schema required for the database.
- 📄 [continue.md](./continue.md) - Next steps for developers continuing the project (Moving from Mock to Production).

## Features
- **Global Undo System**: 7-second animated popup timer to prevent accidental deletions across Menu, Orders, Inventory, and Employees.
- **Role-Based Access**: Distinct interfaces and permissions for 'Admins' vs 'Employees'.
- **Interactive POS**: Touch-friendly catalog with audio feedback for rapid order taking.
- **Advanced Ordering**: Multi-step Payment Modal supporting Cash, Zaad, PayPal, and Mastercard.
- **Dynamic Menu Management**: Upload photos from local files or internet URLs.
- **Real-Time Dashboard**: Live clock, stat cards, dual charts (area/bar), and recent orders table.
- **Live Inventory**: Visual low-stock alerts and tracking.
- **Payroll & Staffing**: Admin-only modules for managing shifts, tracking salaries, and quickly toggling active/inactive status via fast filters.
- **Theme System**: Intelligent light/dark mode system tailored for visibility in different environments.

## How to Run the Frontend
1. Ensure you have Node.js installed.
2. Run `npm install` to install dependencies.
3. Run `npm run dev` to start the Vite development server.
4. Login using the mock credentials:
   - Admin: `admin` / `admin123`
   - Employee: `emp` / `emp123`
>>>>>>> b17e05f9477a53c4c9ea788ef4d509aded512ca2
