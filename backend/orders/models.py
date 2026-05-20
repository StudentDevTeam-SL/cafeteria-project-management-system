from django.db import models
from django.conf import settings
from menu.models import MenuItem


class Table(models.Model):
    """
    Model representing a physical dining table in the cafeteria.
    """
    STATUS_CHOICES = (
        ('vacant', 'Vacant'),
        ('occupied', 'Occupied'),
        ('reserved', 'Reserved'),
    )
    table_number = models.CharField(max_length=50, unique=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='vacant')
    seating_capacity = models.PositiveIntegerField(default=4)

    def __str__(self):
        return f"Table {self.table_number} ({self.status})"


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
    ORDER_TYPE_CHOICES = (
        ('dine_in', 'Dine-in'),
        ('takeaway', 'Takeaway'),
        ('delivery', 'Delivery'),
    )
    PAYMENT_STATUS_CHOICES = (
        ('unpaid', 'Unpaid'),
        ('paid', 'Paid'),
        ('refunded', 'Refunded'),
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
        max_length=20, choices=STATUS_CHOICES, default='pending', db_index=True
    )
    created_at      = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # New Fields
    table           = models.ForeignKey(Table, on_delete=models.SET_NULL, null=True, blank=True)
    order_type      = models.CharField(max_length=20, choices=ORDER_TYPE_CHOICES, default='takeaway')
    payment_status  = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='paid')

    def __str__(self):
        return f"Order #{self.id} — {self.employee_name or self.customer_name} — {self.status}"


class OrderItem(models.Model):
    """
    Model representing an individual item within an Order.
    Links a MenuItem to an Order and tracks quantity and subtotal.
    """
    order     = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE)
    quantity  = models.PositiveIntegerField(default=1)
    subtotal  = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.quantity}× {self.menu_item.name} → Order #{self.order.id}"


class OrderItemModifier(models.Model):
    """
    Model representing custom modifiers selected for an ordered item.
    """
    order_item = models.ForeignKey(OrderItem, on_delete=models.CASCADE, related_name='selected_modifiers')
    modifier_option = models.ForeignKey('menu.ModifierOption', on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.modifier_option.name} for {self.order_item.menu_item.name} in Order #{self.order_item.order.id}"

