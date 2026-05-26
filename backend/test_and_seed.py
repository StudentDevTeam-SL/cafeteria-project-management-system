"""
test_and_seed.py
-----------------
1. Tests PostgreSQL connection
2. Checks / runs Django migrations
3. Seeds the database with initial cafeteria data
"""

import os
import sys
import subprocess
import psycopg2
from pathlib import Path

# Make sure Django can find settings
BASE_DIR = Path(__file__).parent
sys.path.insert(0, str(BASE_DIR))
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")

# ── Load .env values ─────────────────────────────────────────────────────────
from decouple import config

DB_NAME = config("DB_NAME", default="cafeteria_db")
DB_USER = config("DB_USER", default="postgres")
DB_PASS = config("DB_PASSWORD", default="postgres")
DB_HOST = config("DB_HOST", default="localhost")
DB_PORT = config("DB_PORT", default="5432")


def sep(title=""):
    line = "─" * 50
    print(f"\n{line}")
    if title:
        print(f"  {title}")
        print(line)


# ── 1. Raw psycopg2 connection test ──────────────────────────────────────────
def test_connection():
    sep("1/3  Testing database connection")
    try:
        conn = psycopg2.connect(
            dbname=DB_NAME, user=DB_USER, password=DB_PASS,
            host=DB_HOST, port=DB_PORT, connect_timeout=5,
        )
        cur = conn.cursor()
        cur.execute("SELECT version();")
        version = cur.fetchone()[0]
        cur.close()
        conn.close()
        print(f"  ✅ Connected to: {version[:60]}...")
        print(f"  ✅ Database    : {DB_NAME}")
        print(f"  ✅ Host        : {DB_HOST}:{DB_PORT}")
        return True
    except psycopg2.OperationalError as e:
        print(f"  ❌ Connection failed: {e}")
        print(f"\n  Make sure you ran setup_db.py first.")
        return False


# ── 2. Run migrations ─────────────────────────────────────────────────────────
def run_migrations():
    sep("2/3  Running Django migrations")
    result = subprocess.run(
        [sys.executable, str(BASE_DIR / "manage.py"), "migrate", "--run-syncdb"],
        cwd=str(BASE_DIR),
    )
    if result.returncode == 0:
        print("  ✅ Migrations applied successfully.")
        return True
    else:
        print("  ❌ Migration failed.")
        return False


# ── 3. Seed data ──────────────────────────────────────────────────────────────
def seed_data():
    sep("3/3  Seeding database with initial data")

    # Try seed_full.py first (richer data), fallback to seed_data.py
    for seed_file in ["seed_full.py", "seed_data.py"]:
        seed_path = BASE_DIR / seed_file
        if seed_path.exists():
            print(f"  Running {seed_file}...")
            result = subprocess.run(
                [sys.executable, str(seed_path)],
                cwd=str(BASE_DIR),
            )
            if result.returncode == 0:
                print(f"  ✅ Seed data loaded from {seed_file}.")
                return True
            else:
                print(f"  ⚠️  {seed_file} failed — trying next...")

    # Fallback: create superuser only
    print("  ⚠️  No seed file worked. Creating superuser only...")
    result = subprocess.run(
        [sys.executable, str(BASE_DIR / "manage.py"), "shell", "-c",
         """
from accounts.models import CustomUser
if not CustomUser.objects.filter(username='admin').exists():
    u = CustomUser.objects.create_superuser('admin', 'admin@cafeteria.com', 'admin1234')
    u.role = 'Admin'
    u.save()
    print('  ✅ Superuser created: admin / admin1234')
else:
    print('  ✅ Superuser already exists.')
"""],
        cwd=str(BASE_DIR),
    )
    return result.returncode == 0


# ── Summary ───────────────────────────────────────────────────────────────────
def print_summary(conn_ok, mig_ok, seed_ok):
    sep("Setup Summary")
    print(f"  Connection  : {'✅ OK' if conn_ok  else '❌ FAILED'}")
    print(f"  Migrations  : {'✅ OK' if mig_ok   else '❌ FAILED'}")
    print(f"  Seed data   : {'✅ OK' if seed_ok  else '❌ FAILED'}")

    if conn_ok and mig_ok:
        print("\n  🚀 Database is ready! Start the server with:")
        print("     python manage.py runserver")
        print("\n  Default login:")
        print("     Username : admin")
        print("     Password : admin1234")
    print("─" * 50)


def main():
    print("=" * 50)
    print("  Cafeteria — DB Test & Seed")
    print("=" * 50)

    conn_ok = test_connection()
    if not conn_ok:
        print_summary(False, False, False)
        sys.exit(1)

    mig_ok = run_migrations()
    seed_ok = False
    if mig_ok:
        seed_ok = seed_data()

    print_summary(conn_ok, mig_ok, seed_ok)


if __name__ == "__main__":
    main()
