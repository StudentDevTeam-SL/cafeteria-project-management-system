"""Menu app config."""
from django.apps import AppConfig


class MenuConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'menu'

    def ready(self):
        """Connect image-cleanup signals when the app is fully loaded."""
        import menu.signals  # noqa: F401
