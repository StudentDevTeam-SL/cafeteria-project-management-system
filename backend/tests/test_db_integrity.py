"""
tests/test_db_integrity.py
===========================
Database-level integrity tests:
  - Unique constraints
  - NOT NULL constraints
  - FK enforcement
  - Decimal precision
  - Cascade deletes

Run with:
    python manage.py test tests.test_db_integrity --verbosity=2
"""

import datetime
from decimal import Decimal
from django.test import TestCase
from django.db import IntegrityError, transaction
from django.core.exceptions import ValidationError
from django.contrib.auth import get_user_model

from menu.models import Category, MenuItem
from orders.models import Order, OrderItem
from inventory.models import InventoryItem
from employees.models import Employee
from salaries.models import SalaryRecord

User = get_user_model()


def make_user(username='user1', role='Employee'):
    return User.objects.create_user(username=username, password='Pass1234!', role=role)


def make_category(name='Main Course'):
    cat, _ = Category.objects.get_or_create(name=name)
    return cat


def make_order(**kwargs):
    defaults = dict(
        employee_name='Test',
        payment_method='cash',
        total_price=Decimal('10.00'),
    )
    defaults.update(kwargs)
    return Order.objects.create(**defaults)


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

    def test_category_name_must_be_unique(self):
        """Creating two categories with the same name must raise IntegrityError."""
        Category.objects.create(name='UniqueTest')
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                Category.objects.create(name='UniqueTest')

    def test_inventory_item_name_must_be_unique(self):
        """Creating two inventory items with the same item_name must raise IntegrityError."""
        InventoryItem.objects.create(item_name='UniqueItem', quantity=10, unit='kg')
        with self.assertRaises(IntegrityError):
            with transaction.atomic():
                InventoryItem.objects.create(item_name='UniqueItem', quantity=5, unit='kg')


# ─────────────────────────────────────────────────────────────
# NOT NULL Constraint Tests
# ─────────────────────────────────────────────────────────────

class NotNullConstraintTests(TestCase):

    def test_menu_item_name_required(self):
        """MenuItem without name must fail validation."""
        cat = make_category()
        item = MenuItem(price=Decimal('5.00'), category=cat)
        with self.assertRaises(ValidationError):
            item.full_clean()

    def test_menu_item_price_required(self):
        """MenuItem without price must fail validation."""
        cat = make_category()
        item = MenuItem(name='Test', category=cat)
        with self.assertRaises(ValidationError):
            item.full_clean()

    def test_employee_full_name_required(self):
        """Employee without full_name must fail validation."""
        emp = Employee(salary=Decimal('500'))
        with self.assertRaises(ValidationError):
            emp.full_clean()

    def test_salary_record_employee_required(self):
        """SalaryRecord without employee FK must fail at DB level."""
        with self.assertRaises((IntegrityError, ValueError)):
            with transaction.atomic():
                SalaryRecord.objects.create(
                    employee=None,
                    payment_date=datetime.date(2025, 1, 1),
                    base_salary=Decimal('1000'),
                    bonus=Decimal('0'),
                    deduction=Decimal('0'),
                    status='pending',
                )


# ─────────────────────────────────────────────────────────────
# Foreign Key Constraint Tests
# ─────────────────────────────────────────────────────────────

class ForeignKeyConstraintTests(TestCase):

    def test_order_user_set_null_on_user_delete(self):
        """When user is deleted, Order.user becomes NULL (SET_NULL)."""
        user = make_user(username='emp_fk1')
        order = make_order(user=user)
        user.delete()
        order.refresh_from_db()
        self.assertIsNone(order.user)
        self.assertIsNotNone(order.pk)

    def test_order_item_cascade_on_order_delete(self):
        """Deleting an Order must cascade-delete all its OrderItems."""
        cat = make_category()
        mi = MenuItem.objects.create(name='Test Item', price=Decimal('5.00'), category=cat)
        order = make_order()
        OrderItem.objects.create(
            order=order, menu_item=mi,
            quantity=2, subtotal=Decimal('10.00'),
        )
        order_id = order.id
        order.delete()
        self.assertEqual(OrderItem.objects.filter(order_id=order_id).count(), 0)

    def test_salary_cascade_on_employee_delete(self):
        """Deleting an employee must delete all their salary records."""
        emp = Employee.objects.create(
            full_name='Del Test', job_title='Staff', salary=Decimal('800')
        )
        SalaryRecord.objects.create(
            employee=emp,
            payment_date=datetime.date(2025, 5, 1),
            base_salary=Decimal('800'),
            bonus=Decimal('0'),
            deduction=Decimal('0'),
            status='pending',
        )
        emp_id = emp.id
        emp.delete()
        self.assertEqual(SalaryRecord.objects.filter(employee_id=emp_id).count(), 0)

    def test_menu_item_cascade_on_category_delete(self):
        """Deleting a Category must cascade-delete all its MenuItems."""
        cat = Category.objects.create(name='ToDelete')
        MenuItem.objects.create(name='CascadeTest', price=Decimal('3.00'), category=cat)
        cat_id = cat.id
        cat.delete()
        self.assertEqual(MenuItem.objects.filter(category_id=cat_id).count(), 0)


# ─────────────────────────────────────────────────────────────
# Decimal Precision Tests
# ─────────────────────────────────────────────────────────────

class DecimalPrecisionTests(TestCase):

    def test_menu_item_price_precision(self):
        """MenuItem price stores up to 10 digits with 2 decimal places."""
        cat = make_category()
        item = MenuItem.objects.create(
            name='Precision Test',
            price=Decimal('99999.99'),
            category=cat,
        )
        item.refresh_from_db()
        self.assertEqual(item.price, Decimal('99999.99'))

    def test_order_total_price_precision(self):
        order = make_order(total_price=Decimal('12345678.99'))
        order.refresh_from_db()
        self.assertEqual(order.total_price, Decimal('12345678.99'))

    def test_salary_net_salary_precision(self):
        emp = Employee.objects.create(
            full_name='Prec Test', job_title='Staff', salary=Decimal('1000')
        )
        salary = SalaryRecord.objects.create(
            employee=emp,
            payment_date=datetime.date(2025, 6, 1),
            base_salary=Decimal('99999999.99'),
            bonus=Decimal('0'),
            deduction=Decimal('0'),
            status='pending',
        )
        salary.refresh_from_db()
        self.assertEqual(salary.net_salary, Decimal('99999999.99'))

    def test_employee_salary_precision(self):
        """Employee salary field stores decimal values correctly."""
        emp = Employee.objects.create(
            full_name='Sal Prec', job_title='Chef',
            salary=Decimal('1234.56'),
        )
        emp.refresh_from_db()
        self.assertEqual(emp.salary, Decimal('1234.56'))
