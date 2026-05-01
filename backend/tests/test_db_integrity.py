"""
tests/test_db_integrity.py
===========================
PostgreSQL database-level integrity tests:
  - Unique constraints
  - NOT NULL constraints
  - FK enforcement
  - Decimal precision

Run with:
    python manage.py test tests.test_db_integrity --verbosity=2
"""

import datetime
from decimal import Decimal
from django.test import TestCase
from django.db import IntegrityError, transaction
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from menu.models import MenuItem
from orders.models import Order, OrderItem
from inventory.models import InventoryItem
from employees.models import Salary

User = get_user_model()


def make_user(username='user1', role='employee'):
    return User.objects.create_user(username=username, password='Pass1234!', role=role)


def make_order(employee, order_number=None):
    o = Order(
        employee=employee,
        employee_name=employee.username,
        payment_method='cash',
        total_amount=Decimal('10.00'),
    )
    if order_number:
        o.order_number = order_number
    o.save()
    return o


# ─────────────────────────────────────────────────────────────
# Unique Constraint Tests
# ─────────────────────────────────────────────────────────────

class UniqueConstraintTests(TestCase):

    def test_username_must_be_unique(self):
        """Creating two users with the same username must raise IntegrityError."""
        make_user(username='duplicate')
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                User.objects.create_user(username='duplicate', password='pass')

    def test_order_number_must_be_unique(self):
        """Two orders with the same order_number must raise IntegrityError."""
        emp = make_user(username='emp_u1')
        make_order(emp, order_number='ORD-999')
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Order.objects.create(
                    order_number='ORD-999',
                    employee=emp,
                    employee_name='emp_u1',
                    payment_method='cash',
                    total_amount=Decimal('5.00'),
                )

    def test_salary_unique_per_employee_and_month(self):
        """A single employee cannot have two salary records for the same month."""
        emp = make_user(username='emp_sal')
        Salary.objects.create(
            employee=emp,
            month=datetime.date(2025, 3, 1),
            base_salary=Decimal('1000'),
            bonus=Decimal('0'),
            deductions=Decimal('0'),
            net_salary=Decimal('1000'),
            status='pending',
        )
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Salary.objects.create(
                    employee=emp,
                    month=datetime.date(2025, 3, 1),
                    base_salary=Decimal('1200'),
                    bonus=Decimal('0'),
                    deductions=Decimal('0'),
                    net_salary=Decimal('1200'),
                    status='pending',
                )


# ─────────────────────────────────────────────────────────────
# NOT NULL Constraint Tests
# ─────────────────────────────────────────────────────────────

class NotNullConstraintTests(TestCase):

    def test_order_payment_method_required(self):
        """Order without payment_method should fail validation."""
        emp = make_user(username='emp_nn1')
        order = Order(
            employee=emp,
            employee_name='emp_nn1',
            total_amount=Decimal('10.00'),
        )
        with self.assertRaises((IntegrityError, ValidationError)):
            with transaction.atomic():
                order.full_clean()

    def test_menu_item_name_required(self):
        """MenuItem without name must fail validation."""
        item = MenuItem(price=Decimal('5.00'), category='Snacks')
        with self.assertRaises(ValidationError):
            item.full_clean()

    def test_menu_item_price_required(self):
        """MenuItem without price must fail validation."""
        item = MenuItem(name='Test', category='Snacks')
        with self.assertRaises(ValidationError):
            item.full_clean()

    def test_inventory_name_required(self):
        """InventoryItem without name must fail validation."""
        item = InventoryItem(
            category='Vegetables', quantity=Decimal('10'),
            unit='kg', min_threshold=Decimal('5'), cost_per_unit=Decimal('2')
        )
        with self.assertRaises(ValidationError):
            item.full_clean()

    def test_salary_employee_required(self):
        """Salary without employee FK must fail at DB level."""
        with self.assertRaises((IntegrityError, ValueError)):
            with transaction.atomic():
                Salary.objects.create(
                    employee=None,
                    month=datetime.date(2025, 1, 1),
                    base_salary=Decimal('1000'),
                    bonus=Decimal('0'),
                    deductions=Decimal('0'),
                    net_salary=Decimal('1000'),
                    status='pending',
                )


# ─────────────────────────────────────────────────────────────
# Foreign Key Constraint Tests
# ─────────────────────────────────────────────────────────────

class ForeignKeyConstraintTests(TestCase):

    def test_order_item_requires_valid_order(self):
        """OrderItem must reference an existing Order."""
        with self.assertRaises((IntegrityError, ValueError)):
            with transaction.atomic():
                OrderItem.objects.create(
                    order_id=99999,  # non-existent
                    item_name='Ghost Item',
                    quantity=1,
                    unit_price=Decimal('5.00'),
                    subtotal=Decimal('5.00'),
                )

    def test_order_employee_set_null_on_user_delete(self):
        """When employee is deleted, Order.employee becomes NULL (SET_NULL)."""
        emp = make_user(username='emp_fk1')
        order = make_order(emp)
        emp.delete()
        order.refresh_from_db()
        self.assertIsNone(order.employee)
        # But the order still exists
        self.assertIsNotNone(order.pk)

    def test_order_item_menu_item_set_null_on_delete(self):
        """When MenuItem is deleted, OrderItem.menu_item becomes NULL (SET_NULL)."""
        emp = make_user(username='emp_fk2')
        order = make_order(emp)
        menu_item = MenuItem.objects.create(
            name='Item to Delete', price=Decimal('6.00'), category='Snacks'
        )
        oi = OrderItem.objects.create(
            order=order,
            menu_item=menu_item,
            item_name='Item to Delete',
            quantity=1,
            unit_price=Decimal('6.00'),
            subtotal=Decimal('6.00'),
        )
        menu_item.delete()
        oi.refresh_from_db()
        self.assertIsNone(oi.menu_item)

    def test_salary_cascade_on_employee_delete(self):
        """Deleting an employee must delete all their salary records."""
        emp = make_user(username='emp_fk3')
        Salary.objects.create(
            employee=emp,
            month=datetime.date(2025, 5, 1),
            base_salary=Decimal('800'),
            bonus=Decimal('0'),
            deductions=Decimal('0'),
            net_salary=Decimal('800'),
            status='pending',
        )
        emp_id = emp.id
        emp.delete()
        self.assertEqual(Salary.objects.filter(employee_id=emp_id).count(), 0)

    def test_order_items_cascade_on_order_delete(self):
        """Deleting an Order must cascade-delete all its OrderItems."""
        emp = make_user(username='emp_fk4')
        order = make_order(emp)
        OrderItem.objects.create(
            order=order,
            item_name='Test',
            quantity=2,
            unit_price=Decimal('3.00'),
            subtotal=Decimal('6.00'),
        )
        order_id = order.id
        order.delete()
        self.assertEqual(OrderItem.objects.filter(order_id=order_id).count(), 0)


# ─────────────────────────────────────────────────────────────
# Decimal Precision Tests
# ─────────────────────────────────────────────────────────────

class DecimalPrecisionTests(TestCase):

    def test_menu_item_price_precision(self):
        """MenuItem price stores up to 8 digits with 2 decimal places."""
        item = MenuItem.objects.create(
            name='Precision Test',
            price=Decimal('99999.99'),
            category='Snacks',
        )
        item.refresh_from_db()
        self.assertEqual(item.price, Decimal('99999.99'))

    def test_order_total_amount_precision(self):
        emp = make_user(username='emp_dec1')
        order = make_order(emp)
        order.total_amount = Decimal('12345678.99')
        order.save()
        order.refresh_from_db()
        self.assertEqual(order.total_amount, Decimal('12345678.99'))

    def test_salary_net_salary_precision(self):
        emp = make_user(username='emp_dec2')
        salary = Salary.objects.create(
            employee=emp,
            month=datetime.date(2025, 6, 1),
            base_salary=Decimal('99999999.99'),
            bonus=Decimal('0'),
            deductions=Decimal('0'),
            net_salary=Decimal('0'),
            status='pending',
        )
        salary.refresh_from_db()
        self.assertEqual(salary.net_salary, Decimal('99999999.99'))

    def test_inventory_quantity_decimal(self):
        """Inventory supports fractional quantities (e.g., 2.75 kg)."""
        item = InventoryItem.objects.create(
            name='Rice',
            category='Grains',
            quantity=Decimal('2.75'),
            unit='kg',
            min_threshold=Decimal('1.00'),
            cost_per_unit=Decimal('0.50'),
        )
        item.refresh_from_db()
        self.assertEqual(item.quantity, Decimal('2.75'))
