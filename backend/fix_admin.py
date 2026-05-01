"""
Quick script to ensure the admin superuser exists.
Run: python manage.py shell < fix_admin.py
Or:  python fix_admin.py  (after setting DJANGO_SETTINGS_MODULE)
"""
import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from accounts.models import CustomUser

if CustomUser.objects.filter(username='admin').exists():
    user = CustomUser.objects.get(username='admin')
    user.set_password('admin')
    user.is_superuser = True
    user.is_staff = True
    user.role = 'Admin'
    user.save()
    print("Admin user password reset to 'admin' successfully!")
else:
    user = CustomUser.objects.create_superuser(
        username='admin',
        password='admin',
        email='admin@cafeteria.com',
        full_name='System Admin',
        role='Admin',
        phone_number='063000000'
    )
    print(f"Created admin superuser (id={user.id})")

print(f"Total users in DB: {CustomUser.objects.count()}")
for u in CustomUser.objects.all():
    print(f"  - {u.username} | role={u.role} | staff={u.is_staff} | super={u.is_superuser}")
