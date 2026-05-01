from rest_framework import serializers
from .models import InventoryItem


class InventoryItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = InventoryItem
        fields = ['id', 'item_name', 'quantity', 'unit', 'min_stock', 'category', 'cost', 'updated_at']
        read_only_fields = ['updated_at']
