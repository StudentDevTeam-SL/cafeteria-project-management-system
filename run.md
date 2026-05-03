# Cafeteria Management System - Run Guide

This document provides instructions on how to set up, run, and use the Cafeteria Management System project.

## Prerequisites

Before you begin, ensure you have the following installed on your machine:
- **Node.js** (v16 or higher)
- **Python** (v3.10 or higher)
- **Git**

## Backend Setup

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

4. **Apply database migrations:**
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

5. **Start the backend server:**
   ```bash
   python manage.py runserver
   ```
   The backend API will be available at `http://127.0.0.1:8000/`.

## Frontend Setup

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
   The frontend application will open in your default browser at `http://localhost:5173/` or `http://localhost:3000/`.

## Usage Flow

1. **Login:** Access the frontend application and navigate to the login page.
2. **Credentials:** You must log in using your registered credentials. Auto-login has been disabled for security. If you don't have an account, the backend will need to create one (e.g., via `python manage.py createsuperuser`).
3. **Admin Dashboard:** Admins can manage menu items, approve new menu item requests, manage employees, and view analytics.
4. **Employee POS:** Employees can view the menu, add items to the cart, and checkout orders.

## Troubleshooting

- **CORS Issues:** Ensure the backend `CORS_ALLOWED_ORIGINS` setting in `settings.py` matches your frontend URL.
- **Database Errors:** If you encounter database issues, ensure migrations are fully applied, or try deleting the SQLite database file and re-running migrations for a clean slate (use `reset_and_test.bat` if available).
