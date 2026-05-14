"""
Cafeteria DB Setup - Full Auto
-------------------------------
Fully automatic PostgreSQL setup:
  1. Elevates to Admin if needed
  2. Edits pg_hba.conf to allow passwordless local login (trust)
  3. Restarts PostgreSQL service
  4. Resets postgres password to 'postgres'
  5. Creates cafeteria_db
  6. Restores pg_hba.conf & restarts service
  7. Updates .env
  8. Runs Django migrations
"""

import os
import sys
import ctypes
import subprocess
import time
import psycopg2
from pathlib import Path

# ── Config ──────────────────────────────────────────────────────────────────
ENV_PATH   = Path(__file__).parent / ".env"
PSQL       = Path(r"C:\Program Files\PostgreSQL\18\bin\psql.exe")
PG_DATA    = Path(r"C:\Program Files\PostgreSQL\18\data")
PG_HBA     = PG_DATA / "pg_hba.conf"
SERVICE    = "postgresql-x64-18"
NEW_PASS   = "postgres"
DB_NAME    = "cafeteria_db"
DB_USER    = "postgres"
DB_HOST    = "localhost"
DB_PORT    = "5432"
# ─────────────────────────────────────────────────────────────────────────────


def is_admin():
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except Exception:
        return False


def relaunch_as_admin():
    """Relaunch this script with UAC elevation."""
    script = str(Path(__file__).resolve())
    params = f'"{sys.executable}" "{script}"'
    print("  → Requesting Administrator privileges (UAC prompt will appear)...")
    ret = ctypes.windll.shell32.ShellExecuteW(
        None, "runas", sys.executable, f'"{script}"', str(Path(__file__).parent), 1
    )
    if ret <= 32:
        print("  ❌ UAC elevation failed. Please right-click setup_db.py → Run as Administrator.")
        sys.exit(1)
    sys.exit(0)


def run(cmd, **kwargs):
    return subprocess.run(cmd, shell=True, capture_output=True, text=True, **kwargs)


def service_restart():
    print(f"  Stopping service '{SERVICE}'...")
    run(f'net stop "{SERVICE}" /y')
    time.sleep(2)
    print(f"  Starting service '{SERVICE}'...")
    result = run(f'net start "{SERVICE}"')
    time.sleep(2)
    if result.returncode != 0:
        # Try sc start as fallback
        run(f'sc start "{SERVICE}"')
        time.sleep(2)


def connect(password="", dbname="postgres"):
    try:
        conn = psycopg2.connect(
            dbname=dbname, user=DB_USER, password=password,
            host=DB_HOST, port=DB_PORT, connect_timeout=5,
        )
        conn.close()
        return True
    except Exception:
        return False


def patch_hba(trust=True):
    """Add or remove the trust rule at top of pg_hba.conf."""
    MARKER = "# CAFETERIA_SETUP_TRUST\n"
    TRUST_LINE = (
        "# CAFETERIA_SETUP_TRUST\n"
        "host    all             postgres        127.0.0.1/32            trust\n"
        "host    all             postgres        ::1/128                 trust\n"
    )
    content = PG_HBA.read_text(encoding="utf-8")

    if trust:
        if "CAFETERIA_SETUP_TRUST" not in content:
            PG_HBA.write_text(TRUST_LINE + content, encoding="utf-8")
            print("  ✅ pg_hba.conf patched (trust mode).")
        else:
            print("  Already patched.")
    else:
        # Remove our lines
        lines = content.splitlines(keepends=True)
        cleaned = [l for l in lines if "CAFETERIA_SETUP_TRUST" not in l
                   and "127.0.0.1/32            trust" not in l
                   and "::1/128                 trust" not in l]
        PG_HBA.write_text("".join(cleaned), encoding="utf-8")
        print("  ✅ pg_hba.conf restored.")


def create_db_and_reset_password(password=""):
    conn = psycopg2.connect(
        dbname="postgres", user=DB_USER, password=password,
        host=DB_HOST, port=DB_PORT,
    )
    conn.autocommit = True
    cur = conn.cursor()
    # Reset password
    cur.execute(f"ALTER USER postgres WITH PASSWORD %s", (NEW_PASS,))
    print(f"  ✅ postgres password reset to '{NEW_PASS}'.")
    # Create DB
    cur.execute("SELECT 1 FROM pg_database WHERE datname = %s", (DB_NAME,))
    if cur.fetchone():
        print(f"  ✅ Database '{DB_NAME}' already exists.")
    else:
        cur.execute(f'CREATE DATABASE "{DB_NAME}"')
        print(f"  ✅ Database '{DB_NAME}' created.")
    cur.close()
    conn.close()


def update_env():
    if not ENV_PATH.exists():
        return
    lines = ENV_PATH.read_text(encoding="utf-8").splitlines()
    out = []
    for line in lines:
        if line.startswith("DB_PASSWORD="):
            out.append(f"DB_PASSWORD={NEW_PASS}")
        elif line.startswith("DB_NAME="):
            out.append(f"DB_NAME={DB_NAME}")
        elif line.startswith("DB_USER="):
            out.append(f"DB_USER={DB_USER}")
        elif line.startswith("DB_HOST="):
            out.append(f"DB_HOST={DB_HOST}")
        elif line.startswith("DB_PORT="):
            out.append(f"DB_PORT={DB_PORT}")
        else:
            out.append(line)
    ENV_PATH.write_text("\n".join(out) + "\n", encoding="utf-8")
    print("  ✅ .env updated.")


def run_migrations():
    manage = Path(__file__).parent / "manage.py"
    result = subprocess.run([sys.executable, str(manage), "migrate"],
                            cwd=str(Path(__file__).parent))
    if result.returncode == 0:
        print("\n  ✅ Migrations complete!")
    else:
        print("\n  ❌ Migration failed — check the error above.")


# ── Main ────────────────────────────────────────────────────────────────────
def main():
    print("=" * 55)
    print("  Cafeteria PostgreSQL Full-Auto Setup")
    print("=" * 55)

    # ── 1. Admin check ───────────────────────────────────────────────────────
    print("\n[1/6] Checking admin privileges...")
    if not is_admin():
        print("  ⚠️  Not running as Administrator.")
        relaunch_as_admin()
    print("  ✅ Running as Administrator.")

    # ── 2. Check if pg_hba.conf exists ──────────────────────────────────────
    print(f"\n[2/6] Locating pg_hba.conf...")
    if not PG_HBA.exists():
        print(f"  ❌ Not found at {PG_HBA}")
        print("  Check your PostgreSQL data directory and update PG_DATA in this script.")
        sys.exit(1)
    print(f"  ✅ Found: {PG_HBA}")

    # ── 3. Patch pg_hba.conf & restart ──────────────────────────────────────
    print(f"\n[3/6] Enabling trust auth & restarting PostgreSQL...")
    patch_hba(trust=True)
    service_restart()

    # ── 4. Connect (trustmode = no password) ────────────────────────────────
    print(f"\n[4/6] Connecting, resetting password, creating database...")
    tries = 0
    connected = False
    while tries < 5:
        if connect(password=""):
            connected = True
            break
        time.sleep(1)
        tries += 1

    if not connected:
        print("  ❌ Still cannot connect after trust patch. Restoring pg_hba.conf...")
        patch_hba(trust=False)
        service_restart()
        sys.exit(1)

    create_db_and_reset_password(password="")

    # ── 5. Restore pg_hba.conf & restart ────────────────────────────────────
    print(f"\n[5/6] Restoring pg_hba.conf & restarting PostgreSQL...")
    patch_hba(trust=False)
    service_restart()

    # ── 6. Update .env & migrate ─────────────────────────────────────────────
    print(f"\n[6/6] Updating .env and running migrations...")
    update_env()
    run_migrations()

    print("\n" + "=" * 55)
    print("  ✅ All done! Run:")
    print("     python manage.py runserver")
    print("=" * 55)
    input("\nPress Enter to exit...")


if __name__ == "__main__":
    main()
