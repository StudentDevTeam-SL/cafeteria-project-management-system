"""
tests/test_models.py
====================
Unit tests for all Django models.
"""
from decimal import Decimal
from django.test import TestCase
from django.contrib.auth import get_user_model

from menu.models import Category, MenuItem
from orders.models import Order, OrderItem
from inventory.models import InventoryItem
from employees.models import Employee
from salaries.models import SalaryRecord

User = get_user_model()


class CustomUserModelTests(TestCase):
    def test_create_user_with_role(self):
        user = User.objects.create_user(username='teststaff', password='pwd', role='Staff')
        self.assertEqual(user.role, 'Staff')
        self.assertFalse(user.is_admin)

    def test_admin_user(self):
        admin = User.objects.create_user(username='admin', password='pwd', role='Admin')
        self.assertTrue(admin.is_admin)

    def test_default_role_is_capitalized(self):
        user = User.objects.create_user(username='defaultuser', password='pwd')
        self.assertEqual(user.role, 'Staff')   # default='Staff' (capital S)

    def test_full_name_property(self):
        user = User.objects.create_user(
            username='fu', password='pwd', first_name='John', last_name='Doe'
        )
        self.assertEqual(user.full_name, 'John Doe')


class MenuModelTests(TestCase):
    def test_menu_item_defaults(self):
        cat  = Category.objects.create(name='Drinks')
        item = MenuItem.objects.create(category=cat, name='Cola', price=Decimal('2.50'))
        self.assertEqual(item.status, 'active')

    def test_category_str(self):
        cat = Category.objects.create(name='Snacks')
        self.assertEqual(str(cat), 'Snacks')


class InventoryModelTests(TestCase):
    def test_inventory_item_new_fields(self):
        item = InventoryItem.objects.create(
            item_name='Sugar', quantity=10, unit='kg',
            category='Condiments', cost=Decimal('1.00')
        )
        self.assertEqual(item.min_stock, 10)
        self.assertEqual(item.category, 'Condiments')
        self.assertEqual(item.cost, Decimal('1.00'))

    def test_inventory_str(self):
        item = InventoryItem.objects.create(item_name='Salt', quantity=5, unit='kg')
        self.assertIn('Salt', str(item))


class OrderModelTests(TestCase):
    def test_order_creation_with_new_fields(self):
        order = Order.objects.create(
            employee_name='Ahmed', payment_method='cash',
            total_price=Decimal('10.00')
        )
        cat  = Category.objects.create(name='Drinks')
        item = MenuItem.objects.create(category=cat, name='Cola', price=Decimal('2.50'))
        OrderItem.objects.create(order=order, menu_item=item, quantity=2, subtotal=Decimal('5.00'))
        self.assertEqual(order.items.count(), 1)
        self.assertEqual(order.status, 'pending')
        self.assertEqual(order.payment_method, 'cash')

    def test_order_processing_status(self):
        order = Order.objects.create(
            employee_name='Test', total_price=Decimal('0.00'), status='processing'
        )
        self.assertEqual(order.status, 'processing')


class EmployeeModelTests(TestCase):
    def test_employee_new_fields(self):
        emp = Employee.objects.create(
            full_name='Sahra Ali', job_title='Barista',
            phone='+252631234567', shift='Morning', hours='7 AM - 3 PM',
            salary=Decimal('900.00')
        )
        self.assertEqual(emp.job_title, 'Barista')
        self.assertEqual(emp.shift, 'Morning')
        self.assertEqual(emp.status, 'active')

    def test_employee_str(self):
        emp = Employee.objects.create(full_name='Test Person', salary=Decimal('500'))
        self.assertEqual(str(emp), 'Test Person')


class SalaryModelTests(TestCase):
    def test_salary_net_calculation(self):
        emp = Employee.objects.create(
            full_name='Test Emp', job_title='Staff', salary=Decimal('1000')
        )
        salary = SalaryRecord.objects.create(
            employee=emp,
            base_salary=Decimal('2000.00'),
            bonus=Decimal('500.00'),
            deduction=Decimal('100.00'),
            payment_date='2026-05-01'
        )
        self.assertEqual(salary.net_salary, Decimal('2400.00'))

    def test_salary_default_status(self):
        emp    = Employee.objects.create(full_name='Emp2', salary=Decimal('800'))
        salary = SalaryRecord.objects.create(
            employee=emp, base_salary=Decimal('800'), payment_date='2026-05-01'
        )
        self.assertEqual(salary.status, 'pending')
