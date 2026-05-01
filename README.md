# Cafeteria Management

Welcome to **Cafeteria Management**, a premium open-source cafeteria management system designed to streamline orders, manage inventory, and oversee employees through a beautiful, modern interface.

## Project Overview

Cafeteria Management is a full-stack web application. It features a rich, animated React frontend with advanced UI paradigms like glassmorphism, responsive dark mode, and an integrated audio-feedback Point-of-Sale (POS) system. It is designed to be backed by a powerful Django REST Framework API.

### Current State
Currently, the **Frontend and Backend are Fully Integrated** (100% complete). The system uses a Django REST Framework API with JWT authentication and a SQLite database (ready for PostgreSQL) to handle all data persistence for Menu, Orders, Inventory, Employees, Salaries, and User Management.

## Documentation
To understand the inner workings and setup of the project, please review the following documentation files:
- 📄 [frontend.md](./frontend.md) - Details the React architecture, state management, and UI design system.
- 📄 [backend.md](./backend.md) - Outlines the Django REST Framework API architecture.
- 📄 [database.md](./database/database.md) - Defines the database schema and models.
- 📄 [test.md](./test.md) - Comprehensive testing guide for the integrated system.

## Features
- **Global Undo System**: 7-second animated popup timer to prevent accidental deletions across Menu, Orders, Inventory, and Employees.
- **User Management & RBAC**: Real backend JWT token authentication. Admins can securely create usernames and passwords for new staff directly from the Settings page. Employees are restricted from accessing sensitive routes like salaries and system logs.
- **Dynamic Catalog UI**: Menu items feature responsive glassmorphism cards with 3D tilt effects. Waiters can instantly toggle availability to temporarily hide out-of-stock items.
- **Advanced Ordering**: Multi-step Payment Modal supporting Cash, Zaad, PayPal, and Mastercard (integrated with API).
- **Dynamic Menu Management**: Upload photos from local files or internet URLs.
- **Real-Time Dashboard**: Live clock, stat cards with animated counters, dual charts (area/bar), and recent orders table.
- **Live Inventory**: Visual low-stock alerts and tracking.
- **Payroll & Staffing**: Admin-only modules for managing shifts, tracking salaries, and quickly toggling active/inactive status via fast filters.
- **Theme System**: Intelligent light/dark mode system tailored for visibility in different environments.
- **Premium Animations**: Smooth page transitions, ripple button effects, hover-lift cards, breathing glow indicators, staggered reveal animations, and spring-based sidebar/nav transitions powered by Framer Motion + CSS keyframes.

## How to Run the System

### 1. Backend Setup (Django)
1. Navigate to the `backend/` directory.
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```
3. Install dependencies: `pip install django djangorestframework djangorestframework-simplejwt django-cors-headers`
4. Run migrations: `python manage.py migrate`
5. **(Optional)** Seed the database with mock data: Run `.\reset_and_test.bat` (Windows) to instantly recreate the database with realistic sample items, employees, and orders.
6. Start the server: `python manage.py runserver`

### 2. Frontend Setup (React)
1. Navigate to the `frontend/` directory.
2. Install dependencies: `npm install`
3. Start the development server: `npm run dev`

### 3. Login Credentials
- **Admin**: `admin` / `admin`
- **Employee Demo**: `employee` / `1234`
*(Note: These default users are automatically created when the backend server starts. Additional employees can be created through the Employee Management module in the Admin panel.)*

### to run
- cd backend
- (Set-ExecutionPolicy -Scope Process -ExecutionPolicy RemoteSigned) ; (& "c:\Users\pc\Desktop\New folder (2)\backend\venv\Scripts\Activate.ps1")
- python manage.py runserver
 <h2>this backend run</h2>

<h1>to run frontend</h1>
- cd frontend
- npm run dev

