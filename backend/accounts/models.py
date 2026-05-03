from django.contrib.auth.models import AbstractUser
from django.db import models

class CustomUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser.
    Adds a role-based access field and phone number.
    """
    ROLE_CHOICES = (
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
        ('Staff', 'Staff'),
        ('Employee', 'Employee'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Staff')
    phone_number = models.CharField(max_length=20, blank=True, null=True)

    @property
    def full_name(self):
        """Returns the user's full name, falling back to username if not set."""
        if self.first_name or self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        return self.username

    @property
    def is_admin(self):
        """Returns True if the user has the 'Admin' role."""
        return self.role == 'Admin'

    def __str__(self):
        return f"{self.username} ({self.get_role_display()})"
