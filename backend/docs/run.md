# Run Guide — Cafeteria Management System

This document explains how to run the Cafeteria Management System locally for both backend and frontend development.

## Prerequisites

- **Python** 3.10+
- **Node.js** 18+
- **PostgreSQL** 14+
- **Git**

## Backend Setup

1. Open a terminal and switch to the backend folder:
   ```bash
   cd backend
   ```

2. Create and activate the virtual environment:
   ```bash
   python -m venv venv
   .\venv\Scripts\activate
   ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy environment variables:
   ```bash
   copy .env.example .env
   ```
   Update `.env` if necessary with your PostgreSQL credentials.

5. Initialize the database and run migrations:
   ```bash
   python setup_db.py
   ```

6. Seed demo data and verify connectivity:
   ```bash
   python test_and_seed.py
   ```

7. Start the backend server:
   ```bash
   python manage.py runserver
   ```

The API will be available at `http://localhost:8000/`.

## Frontend Setup

1. Open a second terminal and switch to the frontend folder:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The frontend will run at `http://localhost:5173/`.

## Default Credentials

- Admin: `admin` / `admin`
- Employee: `employee` / `1234`

## Common Tasks

- **Run backend tests:**
  ```bash
  cd backend
  .\venv\Scripts\activate
  python manage.py test
  ```
- **Reset and seed fresh data:**
  ```bash
  python seed_full.py --force
  ```

## Troubleshooting

- If PostgreSQL is not reachable, confirm the service is running and the credentials in `.env` are correct.
- If the frontend cannot reach the backend, verify `VITE_API_URL` is set and the backend is running on `http://localhost:8000/`.
- If migrations fail, delete the local database and rerun `python setup_db.py`.
