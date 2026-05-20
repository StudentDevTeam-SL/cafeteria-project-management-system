"""Accounts app config."""
from django.apps import AppConfig

class AccountsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'accounts'

    def ready(self):
        """Create default users after migrations complete.

        Using the `post_migrate` signal avoids accessing the database during
        application import which triggers a runtime warning and can fail
        during initial migrations.
        """
        from django.db.models.signals import post_migrate
        from django.dispatch import receiver
        from django.contrib.auth import get_user_model

        @receiver(post_migrate)
        def create_default_users(sender, **kwargs):
            CustomUser = get_user_model()
            try:
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
                if created:
                    admin_user.set_password('admin')
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
                if created_emp:
                    employee_user.set_password('1234')
                    employee_user.save()
            except Exception:
                # Silently ignore failures during test/migrate workflows
                pass

