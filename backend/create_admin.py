import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import CustomUser

def create_users():
    # Admin User
    admin_u, admin_p = 'admin', '1234'
    CustomUser.objects.filter(username=admin_u).delete()
    CustomUser.objects.create_superuser(username=admin_u, email='admin@cafeteria.com', password=admin_p, role='Admin')
    print(f"Successfully created admin user: {admin_u} with password: {admin_p}")

    # Employee User
    emp_u, emp_p = 'user', '1234'
    CustomUser.objects.filter(username=emp_u).delete()
    CustomUser.objects.create_user(username=emp_u, email='user@cafeteria.com', password=emp_p, role='Employee')
    print(f"Successfully created employee user: {emp_u} with password: {emp_p}")

if __name__ == '__main__':
    create_users()
