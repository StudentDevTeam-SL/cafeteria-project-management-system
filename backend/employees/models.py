from django.db import models
from django.conf import settings


class Employee(models.Model):
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )

    user = models.OneToOneField(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='employee_profile',
    )
    full_name   = models.CharField(max_length=200)
    job_title   = models.CharField(max_length=100, blank=True, default='')  # Added
    position    = models.CharField(max_length=100, blank=True, default='')  # Kept for compat
    phone       = models.CharField(max_length=20, blank=True, default='')   # Added
    salary      = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    hire_date   = models.DateField(auto_now_add=True)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    shift       = models.CharField(max_length=50, blank=True, default='')   # Added
    hours       = models.CharField(max_length=50, blank=True, default='')   # Added

    def __str__(self):
        return self.full_name
