@echo off
REM ================================================================
REM setup.bat — One-click backend setup for Cafeteria Management
REM Run this from the backend\ directory
REM ================================================================

echo [1/5] Creating Python virtual environment...
python -m venv venv
call venv\Scripts\activate

echo [2/5] Installing dependencies...
pip install -r requirements.txt

echo [3/5] Checking for .env file...
if not exist .env (
    copy .env.example .env
    echo IMPORTANT: Edit backend\.env with your PostgreSQL credentials before continuing!
    pause
)

echo [4/5] Running database migrations...
python manage.py makemigrations accounts menu orders inventory employees
python manage.py migrate

echo [5/5] Creating superuser...
python manage.py createsuperuser

echo.
echo ================================================================
echo  Setup complete! Start the server with:
echo    venv\Scripts\activate
echo    python manage.py runserver
echo.
echo  Run tests with:
echo    python manage.py test tests --verbosity=2
echo ================================================================
