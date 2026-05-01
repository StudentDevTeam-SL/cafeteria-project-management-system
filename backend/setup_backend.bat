@echo off
echo =========================================
echo CAFETERIA MANAGEMENT SYSTEM - BACKEND SETUP
echo =========================================

echo.
echo [1/4] Checking Virtual Environment...
IF NOT EXIST "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate

echo.
echo [2/4] Installing Dependencies...
pip install -r requirements.txt

echo.
echo [3/4] Running Database Migrations...
python manage.py makemigrations accounts menu orders inventory employees salaries
python manage.py migrate

echo.
echo [4/4] Starting Django Server...
python manage.py runserver

pause
