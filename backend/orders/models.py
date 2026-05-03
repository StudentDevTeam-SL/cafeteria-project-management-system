from django.db import models
from django.conf import settings
from menu.models import MenuItem


class Order(models.Model):
    """
    Model representing a customer order.
    Tracks status, payment method, and total price.
    """
    STATUS_CHOICES = (
        ('pending',   'Pending'),
        ('processing','Processing'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    )
    PAYMENT_CHOICES = (
        ('cash',       'Cash'),
        ('mastercard', 'Mastercard'),
        ('paypal',     'PayPal'),
        ('zaad',       'Zaad'),
    )

    user            = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True
    )
    customer_name   = models.CharField(max_length=200, blank=True, default='')
    employee_name   = models.CharField(max_length=200, blank=True, default='')  # Added
    payment_method  = models.CharField(
        max_length=20, choices=PAYMENT_CHOICES, default='cash'
    )  # Added
    notes           = models.TextField(blank=True, default='')  # Added
    total_price     = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    status          = models.CharField(
        max_length=20, choices=STATUS_CHOICES, default='pending'
    )
    created_at      = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Order #{self.id} — {self.employee_name or self.customer_name} — {self.status}"


class OrderItem(models.Model):
    """
    Model representing an individual item within an Order.
    Links a MenuItem to an Order and tracks quantity and subtotal.
    """
    order     = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.PROTECT)
    quantity  = models.PositiveIntegerField(default=1)
    subtotal  = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.quantity}× {self.menu_item.name} → Order #{self.order.id}"
