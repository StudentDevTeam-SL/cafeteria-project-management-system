from decimal import Decimal
from rest_framework import serializers
from .models import Order, OrderItem, Table, OrderItemModifier
from menu.models import MenuItem


class TableSerializer(serializers.ModelSerializer):
    """
    Serializer for the Table model.
    """
    class Meta:
        model = Table
        fields = '__all__'


class OrderItemModifierSerializer(serializers.ModelSerializer):
    """
    Serializer for the OrderItemModifier model.
    """
    name = serializers.CharField(source='modifier_option.name', read_only=True)
    price_adjustment = serializers.DecimalField(
        source='modifier_option.price_adjustment', read_only=True, max_digits=6, decimal_places=2
    )

    class Meta:
        model = OrderItemModifier
        fields = ['id', 'modifier_option', 'name', 'price_adjustment']


class OrderItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the OrderItem model.
    Read-only serializer nested within OrderSerializer.
    """
    menu_item_name = serializers.CharField(source='menu_item.name', read_only=True)
    price          = serializers.SerializerMethodField()
    selected_modifiers = OrderItemModifierSerializer(many=True, read_only=True)

    class Meta:
        model  = OrderItem
        fields = ['id', 'menu_item', 'menu_item_name', 'price', 'quantity', 'subtotal', 'selected_modifiers']
        read_only_fields = ['subtotal', 'menu_item_name', 'price']

    def get_price(self, obj):
        if obj.quantity > 0:
            return obj.subtotal / obj.quantity
        return obj.menu_item.price


class OrderSerializer(serializers.ModelSerializer):
    """
    Serializer for the Order model.
    Handles the creation of Order and nested OrderItem instances.
    """
    items        = OrderItemSerializer(many=True, read_only=True)
    total_amount = serializers.DecimalField(
        source='total_price', read_only=True, max_digits=10, decimal_places=2
    )
    table_details = TableSerializer(source='table', read_only=True)

    class Meta:
        model  = Order
        fields = [
            'id', 'user', 'customer_name', 'employee_name', 'payment_method',
            'notes', 'total_price', 'total_amount', 'status', 'created_at',
            'table', 'table_details', 'order_type', 'payment_status', 'items',
        ]
        read_only_fields = ['total_price', 'total_amount', 'user', 'created_at', 'table_details']

    def create(self, validated_data):
        """
        Accepts frontend payload:
          { employee_name, payment_method, notes, table, order_type, payment_status,
            items: [{menu_item_id, quantity, unit_price, selected_modifiers: [id, ...]}, ...] }
        """
        request    = self.context.get('request')
        items_data = []
        if request:
            items_data = request.data.get('items', [])
            
            # Support resolving table from number or ID if passed in request data
            table_val = request.data.get('table')
            if table_val:
                try:
                    if str(table_val).isdigit():
                        table_obj = Table.objects.get(id=int(table_val))
                    else:
                        table_obj = Table.objects.get(table_number=table_val)
                    validated_data['table'] = table_obj
                except Table.DoesNotExist:
                    pass

            order_type = request.data.get('order_type')
            if order_type:
                validated_data['order_type'] = order_type
            
            payment_status = request.data.get('payment_status')
            if payment_status:
                validated_data['payment_status'] = payment_status

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
                item_price = menu_item.price
                
                # Resolve selected modifiers and their price adjustments
                selected_modifier_ids = item_data.get('selected_modifiers', [])
                resolved_options = []
                from menu.models import ModifierOption
                for opt_id in selected_modifier_ids:
                    try:
                        # Sometimes opt_id is dict e.g. {id: X} or plain int
                        actual_opt_id = opt_id.get('id') if isinstance(opt_id, dict) else opt_id
                        opt = ModifierOption.objects.get(id=actual_opt_id)
                        item_price += opt.price_adjustment
                        resolved_options.append(opt)
                    except (ModifierOption.DoesNotExist, AttributeError, ValueError):
                        continue
                
                subtotal  = item_price * quantity
                total    += subtotal
                
                order_item = OrderItem.objects.create(
                    order=order, menu_item=menu_item, quantity=quantity, subtotal=subtotal
                )
                
                # Associate modifiers with order item
                for opt in resolved_options:
                    OrderItemModifier.objects.create(
                        order_item=order_item, modifier_option=opt
                    )

                # Automated Inventory Deduction
                if hasattr(menu_item, 'recipe'):
                    for ingredient in menu_item.recipe.ingredients.all():
                        inv_item = ingredient.inventory_item
                        required_qty = ingredient.quantity * quantity
                        inv_item.quantity = max(0, inv_item.quantity - int(required_qty))
                        inv_item.save()

            except MenuItem.DoesNotExist:
                continue

        order.total_price = total
        order.save()
        return order

