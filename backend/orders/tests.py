from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APITestCase
from rest_framework import status
from menu.models import Category, MenuItem, Recipe, RecipeIngredient, ModifierGroup, ModifierOption, MenuItemModifier
from inventory.models import InventoryItem
from orders.models import Order, OrderItem, Table, OrderItemModifier

User = get_user_model()

class POSAdvancedFeaturesTestCase(APITestCase):
    def setUp(self):
        # Create user
        self.user = User.objects.create_user(username='cashier_test', password='password123', role='Employee')
        self.client.force_authenticate(user=self.user)
        
        # Create Category
        self.category = Category.objects.create(name='Burgers')
        
        # Create MenuItem
        self.burger = MenuItem.objects.create(
            category=self.category,
            name='Cheese Burger',
            price=Decimal('10.00'),
            status='active'
        )
        
        # Create InventoryItems
        self.bun = InventoryItem.objects.create(item_name='Burger Bun', quantity=100, unit='pcs')
        self.patty = InventoryItem.objects.create(item_name='Beef Patty', quantity=50, unit='pcs')
        self.cheese = InventoryItem.objects.create(item_name='Cheese Slice', quantity=200, unit='pcs')
        
        # Create Recipe for Burger
        self.recipe = Recipe.objects.create(menu_item=self.burger)
        self.ing1 = RecipeIngredient.objects.create(recipe=self.recipe, inventory_item=self.bun, quantity=Decimal('1.000'))
        self.ing2 = RecipeIngredient.objects.create(recipe=self.recipe, inventory_item=self.patty, quantity=Decimal('1.000'))
        
        # Create ModifierGroup and Options
        self.mod_group = ModifierGroup.objects.create(name='Extras', min_selections=0, max_selections=2)
        self.extra_cheese = ModifierOption.objects.create(modifier_group=self.mod_group, name='Extra Cheese', price_adjustment=Decimal('1.50'))
        self.extra_patty = ModifierOption.objects.create(modifier_group=self.mod_group, name='Extra Patty', price_adjustment=Decimal('3.00'))
        
        # Associate ModifierGroup with MenuItem
        MenuItemModifier.objects.create(menu_item=self.burger, modifier_group=self.mod_group)
        
        # Create Table
        self.table = Table.objects.create(table_number='T5', seating_capacity=4, status='vacant')

    def test_create_order_with_modifiers_and_table(self):
        # Place order with 2 burgers, one table selected, and extra cheese modifier.
        payload = {
            'customer_name': 'John Doe',
            'employee_name': 'Cashier 1',
            'payment_method': 'cash',
            'notes': 'No lettuce',
            'table': self.table.id,
            'order_type': 'dine_in',
            'payment_status': 'paid',
            'items': [
                {
                    'menu_item_id': self.burger.id,
                    'quantity': 2,
                    'selected_modifiers': [self.extra_cheese.id]
                }
            ]
        }
        
        url = '/api/orders/'
        response = self.client.post(url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Total price check: (burger price 10.00 + modifier 1.50) * 2 = 23.00
        order = Order.objects.get(id=response.data['id'])
        self.assertEqual(order.total_price, Decimal('23.00'))
        self.assertEqual(order.table, self.table)
        self.assertEqual(order.order_type, 'dine_in')
        
        # Check order item modifiers association
        order_item = order.items.first()
        self.assertEqual(order_item.selected_modifiers.count(), 1)
        self.assertEqual(order_item.selected_modifiers.first().modifier_option, self.extra_cheese)

        # Check automated inventory deduction
        # Burger Bun should be: 100 - 2 = 98
        self.bun.refresh_from_db()
        self.assertEqual(self.bun.quantity, 98)
        
        # Beef Patty should be: 50 - 2 = 48
        self.patty.refresh_from_db()
        self.assertEqual(self.patty.quantity, 48)

        # Cheese Slice was not in recipe, so it should remain 200
        self.cheese.refresh_from_db()
        self.assertEqual(self.cheese.quantity, 200)
