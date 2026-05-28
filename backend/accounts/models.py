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


class LoginActivity(models.Model):
    """
    Audit trail for staff/admin sessions.
    Stores when a user signed in and when the frontend/backend closed the session.
    """
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('closed', 'Closed'),
    )

    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='login_activities')
    username = models.CharField(max_length=150)
    role = models.CharField(max_length=20, blank=True, default='')
    login_at = models.DateTimeField(auto_now_add=True, db_index=True)
    logout_at = models.DateTimeField(blank=True, null=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    close_reason = models.CharField(max_length=80, blank=True, default='')
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    user_agent = models.TextField(blank=True, default='')

    class Meta:
        ordering = ['-login_at']
        indexes = [
            models.Index(fields=['user', 'status']),
            models.Index(fields=['role', 'login_at']),
        ]

    @property
    def duration_seconds(self):
        if not self.logout_at:
            return None
        return max(0, int((self.logout_at - self.login_at).total_seconds()))

    def __str__(self):
        return f"{self.username} - {self.login_at:%Y-%m-%d %H:%M}"
