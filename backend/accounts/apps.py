"""Accounts app config."""
import os

from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        """Optionally create demo users after migrations complete."""
        create_demo_users = os.environ.get('CREATE_DEMO_USERS', '').strip().lower()
        if create_demo_users not in {'1', 'true', 'yes'}:
            return

        from django.db.models.signals import post_migrate
        from django.contrib.auth import get_user_model

        def create_default_users(sender, **kwargs):
            CustomUser = get_user_model()
            try:
                admin_user, created = CustomUser.objects.get_or_create(
                    username='admin',
                    defaults={
                        'email': 'admin@cafeteria.com',
                        'first_name': 'System',
                        'last_name': 'Admin',
                        'role': 'Admin',
                        'phone_number': '063000000',
                        'is_superuser': True,
                        'is_staff': True,
                    }
                )
                if created:
                    admin_user.set_password('admin')
                    admin_user.save()

                employee_user, created_emp = CustomUser.objects.get_or_create(
                    username='employee',
                    defaults={
                        'email': 'employee@cafeteria.com',
                        'first_name': 'Demo',
                        'last_name': 'Employee',
                        'role': 'Employee',
                        'phone_number': '063111111',
                        'is_superuser': False,
                        'is_staff': False,
                    }
                )
                if created_emp:
                    employee_user.set_password('1234')
                    employee_user.save()

                manager_user, created_mgr = CustomUser.objects.get_or_create(
                    username='manager',
                    defaults={
                        'email': 'manager@cafeteria.com',
                        'first_name': 'Operations',
                        'last_name': 'Manager',
                        'role': 'Manager',
                        'phone_number': '063222222',
                        'is_superuser': False,
                        'is_staff': True,
                    }
                )
                if created_mgr:
                    manager_user.set_password('manager')
                    manager_user.save()
            except Exception:
                # Silently ignore failures during test/migrate workflows
                pass

        post_migrate.connect(
            create_default_users,
            dispatch_uid='accounts.create_demo_users',
        )
