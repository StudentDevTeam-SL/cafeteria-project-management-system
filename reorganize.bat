@echo off
echo ================================================
echo  Reorganizing project: frontend + backend only
echo ================================================

cd /d "%~dp0"

:: Create docs sub-folders
mkdir backend\docs 2>nul
mkdir frontend\docs 2>nul

:: Move db.sqlite3 into backend (in case it still exists in database/)
if exist database\db.sqlite3 (
    copy /Y database\db.sqlite3 backend\db.sqlite3 >nul
    echo [OK] Moved db.sqlite3 to backend\
)

:: Move loose markdown docs to backend\docs
for %%F in (render.md run.md test.md project_system.md AI_Proding_README.md) do (
    if exist %%F (
        move /Y %%F backend\docs\%%F >nul
        echo [OK] Moved %%F to backend\docs\
    )
)

:: Move backend-specific docs
if exist database\database.md (
    move /Y database\database.md backend\docs\database.md >nul
    echo [OK] Moved database.md to backend\docs\
)
if exist backend\backend.md (
    move /Y backend\backend.md backend\docs\backend.md >nul
    echo [OK] Moved backend.md to backend\docs\
)

:: Move frontend-specific docs
if exist frontend\frontend.md (
    move /Y frontend\frontend.md frontend\docs\frontend.md >nul
    echo [OK] Moved frontend.md to frontend\docs\
)

:: Move render.yaml into backend
if exist render.yaml (
    move /Y render.yaml backend\render.yaml >nul
    echo [OK] Moved render.yaml to backend\
)

:: Remove now-empty folders
if exist database (
    rmdir /S /Q database
    echo [OK] Removed database\ folder
)
if exist frontend\pages (
    rmdir /S /Q frontend\pages
    echo [OK] Removed empty frontend\pages\ folder
)

echo.
echo ================================================
echo  Done! Root directory now contains:
echo ================================================
dir /B
echo.
pause
