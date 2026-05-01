"""
create_db.py — Create the PostgreSQL database and user programmatically.
Run with: python create_db.py
Requires psycopg2-binary to be installed.
"""

import sys
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT

# ── Configuration ─────────────────────────────────────────────
import getpass

POSTGRES_HOST      = 'localhost'
POSTGRES_PORT      = 5432
POSTGRES_SUPERUSER = 'postgres'

print("=" * 55)
print("  Cafeteria Management — PostgreSQL Database Setup")
print("=" * 55)
POSTGRES_PASSWORD = getpass.getpass("Enter your PostgreSQL 'postgres' user password: ")

DB_NAME     = 'cafeteriamanagement'
DB_USER     = 'cafeuser'
DB_PASSWORD = 'yourpassword'
# ──────────────────────────────────────────────────────────────

def run(conn, sql, params=None):
    cur = conn.cursor()
    try:
        cur.execute(sql, params)
        print(f"  ✔ {sql.strip()[:80]}")
    except psycopg2.errors.DuplicateDatabase:
        print(f"  ℹ Database '{DB_NAME}' already exists — skipping.")
    except psycopg2.errors.DuplicateObject:
        print(f"  ℹ User '{DB_USER}' already exists — skipping.")
    except Exception as e:
        print(f"  ✘ Error: {e}")
    finally:
        cur.close()


def main():
    print("Connecting to PostgreSQL as superuser...")
    try:
        conn = psycopg2.connect(
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            user=POSTGRES_SUPERUSER,
            password=POSTGRES_PASSWORD,
            dbname='postgres',
        )
    except psycopg2.OperationalError as e:
        print(f"\nERROR: Could not connect to PostgreSQL.\n{e}")
        print("\nFix: Edit the POSTGRES_PASSWORD variable at the top of create_db.py")
        print("     and make sure the PostgreSQL service is running.")
        sys.exit(1)

    conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)

    print("\nStep 1 — Creating database and user...")
    run(conn, f"CREATE DATABASE {DB_NAME}")
    run(conn, f"CREATE USER {DB_USER} WITH PASSWORD %s", (DB_PASSWORD,))
    run(conn, f"GRANT ALL PRIVILEGES ON DATABASE {DB_NAME} TO {DB_USER}")

    conn.close()

    # Connect to the new DB to grant schema privileges (required for PG 15+)
    print("\nStep 2 — Granting schema privileges (PostgreSQL 15+)...")
    try:
        conn2 = psycopg2.connect(
            host=POSTGRES_HOST,
            port=POSTGRES_PORT,
            user=POSTGRES_SUPERUSER,
            password=POSTGRES_PASSWORD,
            dbname=DB_NAME,
        )
        conn2.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        run(conn2, f"GRANT ALL ON SCHEMA public TO {DB_USER}")
        run(conn2, f"ALTER DATABASE {DB_NAME} OWNER TO {DB_USER}")
        conn2.close()
    except Exception as e:
        print(f"  ⚠ Could not grant schema privileges: {e}")

    print(f"""
═══════════════════════════════════════════════════
  ✅ Database setup complete!
  DB Name : {DB_NAME}
  User    : {DB_USER}

  Next steps:
    1. Make sure backend/.env has:
         DB_PASSWORD={DB_PASSWORD}
    2. Run migrations:
         python manage.py makemigrations accounts menu orders inventory employees
         python manage.py migrate
    3. Run tests:
         python manage.py test tests --verbosity=2
═══════════════════════════════════════════════════
""")


if __name__ == '__main__':
    main()
