"""Accounts app config."""
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        try:
            from .models import CustomUser
            from django.db import connection
            # Only run if the table exists to avoid errors during initial migration
            if 'accounts_customuser' in connection.introspection.table_names():
                admin_user, created = CustomUser.objects.get_or_create(
                    username='admin',
                    defaults={
                        'email': 'admin@cafeteria.com',
                        'full_name': 'System Admin',
                        'role': 'Admin',
                        'phone_number': '063000000',
                        'is_superuser': True,
                        'is_staff': True,
                    }
                )
                admin_user.set_password('admin')
                admin_user.is_superuser = True
                admin_user.is_staff = True
                admin_user.role = 'Admin'
                admin_user.save()

                employee_user, created_emp = CustomUser.objects.get_or_create(
                    username='employee',
                    defaults={
                        'email': 'employee@cafeteria.com',
                        'full_name': 'Demo Employee',
                        'role': 'Employee',
                        'phone_number': '063111111',
                        'is_superuser': False,
                        'is_staff': False,
                    }
                )
                employee_user.set_password('1234')
                employee_user.is_superuser = False
                employee_user.is_staff = False
                employee_user.role = 'Employee'
                employee_user.save()
        except Exception as e:
            pass

