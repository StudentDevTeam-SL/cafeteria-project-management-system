@echo off
echo =======================================================
echo Cafeteria System — Full DB Reset and Test
echo =======================================================

echo.
echo [1/5] Deleting db.sqlite3...
if exist db.sqlite3 del /f /q db.sqlite3

echo.
echo [2/5] Cleaning old migration files...
for /d %%d in (accounts employees inventory menu orders salaries) do (
    if exist "%%d\migrations" (
        for %%f in ("%%d\migrations\*.py") do (
            if not "%%~nxf"=="__init__.py" del /f /q "%%f"
        )
    )
)

echo.
echo [3/5] Making fresh migrations and migrating...
python manage.py makemigrations accounts employees inventory menu orders salaries
python manage.py migrate

echo.
echo [4/5] Running tests...
python manage.py test tests

echo.
echo [5/5] Seeding database with demo data...
python seed_data.py

echo.
echo =======================================================
echo Process complete! 
echo If tests passed, you can now start the servers:
echo  Terminal 1: python manage.py runserver
echo  Terminal 2: cd ../frontend ^&^& npm run dev
echo =======================================================
pause
