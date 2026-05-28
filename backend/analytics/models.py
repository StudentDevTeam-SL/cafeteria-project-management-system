from django.conf import settings
from django.db import models


class SystemNotification(models.Model):
    """
    Persistent notification shown alongside live operational dashboard alerts.
    """
    SEVERITY_CHOICES = (
        ('info', 'Info'),
        ('success', 'Success'),
        ('warning', 'Warning'),
        ('danger', 'Danger'),
    )
    AUDIENCE_CHOICES = (
        ('all', 'All'),
        ('Admin', 'Admin'),
        ('Manager', 'Manager'),
    )

    title = models.CharField(max_length=160)
    message = models.TextField()
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='info')
    audience = models.CharField(max_length=20, choices=AUDIENCE_CHOICES, default='all', db_index=True)
    source = models.CharField(max_length=80, blank=True, default='')
    source_id = models.PositiveIntegerField(blank=True, null=True)
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        blank=True,
        null=True,
        related_name='created_notifications',
    )
    is_active = models.BooleanField(default=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.title
