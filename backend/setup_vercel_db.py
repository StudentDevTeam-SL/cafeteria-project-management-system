import os
import sys
import django
from django.core.management import call_command

# Set up settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.conf import settings
from accounts.models import CustomUser

def main():
    print("=" * 60)
    print("  Vercel Database Setup & Migration Script")
    print("=" * 60)

    # 1. Strict DATABASE_URL check
    db_url = os.environ.get('DATABASE_URL')
    if not db_url:
        print("\n❌ ERROR: DATABASE_URL environment variable is missing.")
        print("Please set DATABASE_URL to a valid PostgreSQL connection string, e.g.:")
        print("  DATABASE_URL=postgresql://user:password@host:port/dbname")
        print("\nFor Vercel production deployment, set it in your project's Environment Variables.")
        sys.exit(1)

    print("DATABASE_URL found. Testing database connection and running migrations...")

    # 2. Run migrations
    try:
        call_command('migrate', interactive=False)
        print("✅ Django migrations applied successfully!")
    except Exception as e:
        print(f"\n❌ ERROR applying migrations: {e}")
        print("Please check your database credentials, host availability, and connection string.")
        sys.exit(1)

    # 3. Seed data if database is empty
    from menu.models import MenuItem
    from inventory.models import InventoryItem
    from employees.models import Employee
    from orders.models import Order

    has_data = (
        MenuItem.objects.exists() or
        Order.objects.exists() or
        InventoryItem.objects.exists() or
        Employee.objects.exists() or
        CustomUser.objects.filter(is_superuser=True).exists()
    )

    if has_data:
        print("\nℹ️ Database already contains data — skipping initial data seeding.")
        print(f"   Users       : {CustomUser.objects.count()}")
        print(f"   Menu items  : {MenuItem.objects.count()}")
        print(f"   Inventory   : {InventoryItem.objects.count()}")
        print(f"   Employees   : {Employee.objects.count()}")
        print(f"   Orders      : {Order.objects.count()}")
    else:
        print("\n🌱 Seeding initial test data (database is currently empty)...")
        try:
            import seed_full
            print("✅ Database successfully seeded with initial test data!")
        except Exception as e:
            print(f"\n❌ ERROR seeding database: {e}")
            sys.exit(1)

    # 4. Guarantee a real superuser exists
    try:
        admin_email = 'admin@cafeteria.com'
        admin_user, created = CustomUser.objects.get_or_create(
            username='admin',
            defaults={
                'email': admin_email,
                'role': 'Admin',
                'is_staff': True,
                'is_superuser': True,
                'first_name': 'System',
                'last_name': 'Admin'
            }
        )
        if created:
            admin_user.set_password('admin')
            admin_user.save()
            print(f"✅ Created new admin superuser: admin / admin")
        else:
            print(f"ℹ️ Admin superuser already exists in the database.")
    except Exception as e:
        print(f"\n❌ ERROR ensuring admin superuser: {e}")
        sys.exit(1)

    print("\n" + "=" * 60)
    print("  🎉 Setup Complete & Real PostgreSQL Database is fully configured!")
    print("=" * 60)

if __name__ == '__main__':
    main()
