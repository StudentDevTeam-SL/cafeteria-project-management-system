from django.contrib import admin
from .models import InventoryItem

@admin.register(InventoryItem)
class InventoryItemAdmin(admin.ModelAdmin):
    list_display  = ('item_name', 'quantity', 'unit', 'category', 'cost', 'min_stock', 'updated_at')
    list_filter   = ('category', 'unit')
    search_fields = ('item_name',)
