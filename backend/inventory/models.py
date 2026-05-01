from django.db import models


class InventoryItem(models.Model):
    item_name = models.CharField(max_length=200, unique=True)   # Renamed from 'name'
    quantity  = models.IntegerField(default=0)
    unit      = models.CharField(max_length=50)                 # kg, liters, pcs, etc.
    min_stock = models.IntegerField(default=10)
    category  = models.CharField(max_length=100, blank=True, default='')  # Added
    cost      = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)  # Added
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.item_name} ({self.quantity} {self.unit})"
