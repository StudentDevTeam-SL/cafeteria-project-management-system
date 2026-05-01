from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem
from menu.models import MenuItem


class OrderItemSerializer(serializers.ModelSerializer):
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    price          = serializers.DecimalField(
        source='menu_item.price', read_only=True, max_digits=10, decimal_places=2
    )

    class Meta:
        model  = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'price', 'quantity', 'subtotal']
        read_only_fields = ['subtotal', 'menu_item_name', 'price']


class OrderSerializer(serializers.ModelSerializer):
    # items is read-only; creation handled manually in create()
    items        = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(
        source='total_price', read_only=True, max_digits=10, decimal_places=2
    )

    class Meta:
        model  = Order
        fields = [
            'id', 'user', 'customer_name', 'employee_name', 'payment_method',
            'notes', 'total_price', 'total_amount', 'status', 'created_at', 'items',
        ]
        read_only_fields = ['total_price', 'total_amount', 'user', 'created_at']

    def create(self, validated_data):
        """
        Accepts frontend payload:
          { employee_name, payment_method, notes,
            items: [{menu_item_id, quantity, unit_price}, ...] }
        """
        request    = self.context.get('request')
        items_data = []
        if request:
            items_data = request.data.get('items', [])

        order = Order.objects.create(
            user=request.user if request and request.user.is_authenticated else None,
            **validated_data,
        )

        total = Decimal('0.00')
        for item_data in items_data:
            menu_item_id = item_data.get('menu_item_id') or item_data.get('menu_item')
            quantity     = int(item_data.get('quantity', 1))
            try:
                menu_item = MenuItem.objects.get(id=menu_item_id)
                subtotal  = menu_item.price * quantity
                total    += subtotal
                OrderItem.objects.create(
                    order=order, menu_item=menu_item, quantity=quantity, subtotal=subtotal
                )
            except MenuItem.DoesNotExist:
                continue

        order.total_price = total
        order.save()
        return order
