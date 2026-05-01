import os
import glob

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

print("==================================================")
print("  Cleaning up old databases & migrations...")
print("==================================================")

# 1. Delete SQLite Database so ONLY Postgres is used
sqlite_db = os.path.join(BASE_DIR, 'db.sqlite3')
if os.path.exists(sqlite_db):
    os.remove(sqlite_db)
    print(" [X] Deleted old db.sqlite3")
else:
    print(" [ ] No db.sqlite3 found.")

# 2. Delete old migration history to prevent conflicts
apps = ['accounts', 'menu', 'orders', 'inventory', 'employees', 'salaries']
for app in apps:
    migrations_dir = os.path.join(BASE_DIR, app, 'migrations')
    if os.path.exists(migrations_dir):
        for py_file in glob.glob(os.path.join(migrations_dir, '*.py')):
            if not py_file.endswith('__init__.py'):
                os.remove(py_file)
                print(f" [X] Deleted old migration: {os.path.basename(py_file)}")

print("==================================================")
print(" Cleanup Complete! You are now strictly on Postgres.")
print("==================================================")
print("NEXT STEP: Update your DB_PASSWORD in backend/.env")
print("Then run: python manage.py makemigrations accounts menu orders inventory employees salaries")
print("Then run: python manage.py migrate")
