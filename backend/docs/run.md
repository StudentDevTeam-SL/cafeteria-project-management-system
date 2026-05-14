# 🏃‍♂️ Cafeteria Management System - Run Guide

This document provides instructions on how to set up, run, and use the Cafeteria Management System project locally.

## 🛠️ Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v18 or higher)
- **Python** (v3.10 or higher)
- **PostgreSQL** (v14 or higher)
- **Git**

## 🔙 Backend Setup (Django + PostgreSQL)

We have fully automated the backend setup process on Windows.

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate
   
   # macOS/Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment Variables:**
   Copy `.env.example` to `.env`. The auto-setup script will populate the password for you.

5. **Auto-Setup PostgreSQL Database (Windows only):**
   This script will auto-elevate to admin, create the `cafeteria_db` database, reset the `postgres` user password, update your `.env` file, and run Django migrations.
   ```bash
   python setup_db.py
   ```
   *(If prompted by Windows UAC, click "Yes")*

6. **Test Connection & Seed Data:**
   This verifies the connection and populates the database with test data (menus, inventory, employees, orders).
   ```bash
   python test_and_seed.py
   ```

7. **Start the backend server:**
   ```bash
   python manage.py runserver
   ```
   The backend API will be available at `http://localhost:8000/`.

## 🎨 Frontend Setup (React + Vite)

1. **Open a new terminal window and navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install Node dependencies:**
   ```bash
   npm install
   ```

3. **Start the React development server:**
   ```bash
   npm run dev
   ```
   The frontend application will open at `http://localhost:5173/`.

## 🧑‍💻 Usage Flow

1. **Login:** Access the frontend application at `http://localhost:5173/login`.
2. **Credentials:** 
   - **Admin:** Username: `admin` | Password: `admin`
   - **Employee:** Username: `employee` | Password: `1234`
3. **Admin Dashboard:** Admins can manage menu items, approve new menu item requests, manage employees, payroll, and view analytics.
4. **Employee POS:** Employees can view the menu, add items to the cart, process checkouts, and view inventory.

## ⚠️ Troubleshooting

- **PostgreSQL Connection Errors:** Ensure the PostgreSQL service is running (`services.msc` -> `postgresql-x64`). Run `python setup_db.py` to auto-fix credentials.
- **CORS Issues:** Ensure the backend `CORS_ALLOWED_ORIGINS` setting in `.env` matches your frontend URL.
- **No Data:** If the app is empty, run `python seed_full.py --force` in the backend directory to wipe and re-seed the database.
