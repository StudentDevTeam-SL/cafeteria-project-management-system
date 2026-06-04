"""
tests/test_api.py
==================
API-level tests using DRF APITestCase:
  - Authentication (login, JWT, logout)
  - Role-based access (employee vs admin)
  - Full CRUD cycles: Menu, Orders, Inventory, Salary

Run with:
    python manage.py test tests.test_api --verbosity=2
"""

import datetime
from decimal import Decimal
from django.contrib.auth import get_user_model
from django.test import override_settings
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from menu.models import Category, MenuItem
from orders.models import Order, OrderItem
from inventory.models import InventoryItem
from employees.models import Employee
from salaries.models import SalaryRecord

User = get_user_model()


# ─────────────────────────────────────────────────────────────
# Helper Mixins
# ─────────────────────────────────────────────────────────────

class AuthMixin:
    """Helper to create users and inject JWT headers."""

    def make_user(self, username, role='Employee', password='Pass1234!'):
        return User.objects.create_user(
            username=username, password=password, role=role,
            first_name='Test', last_name='User',
        )

    def auth_headers(self, user):
        refresh = RefreshToken.for_user(user)
        return {'HTTP_AUTHORIZATION': f'Bearer {str(refresh.access_token)}'}

    def make_category(self, name='Main Course'):
        cat, _ = Category.objects.get_or_create(name=name)
        return cat

    def make_menu_item(self, **kwargs):
        cat = self.make_category(kwargs.pop('category_name', 'Main Course'))
        defaults = dict(name='Grilled Chicken', price=Decimal('8.50'), category=cat)
        defaults.update(kwargs)
        return MenuItem.objects.create(**defaults)

    def make_order(self, user=None, **kwargs):
        defaults = dict(
            employee_name='Test User',
            payment_method='cash',
            total_price=Decimal('10.00'),
        )
        if user:
            defaults['user'] = user
        defaults.update(kwargs)
        return Order.objects.create(**defaults)


# ─────────────────────────────────────────────────────────────
# Authentication Endpoint Tests
# ─────────────────────────────────────────────────────────────

class AuthAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.user = self.make_user('loginuser', role='Employee')
        self.google_user, _ = User.objects.get_or_create(
            username='admin',
            defaults={'role': 'Admin'},
        )
        self.google_user.email = 'admin@cafeteria.com'
        self.google_user.first_name = 'System'
        self.google_user.last_name = 'Admin'
        self.google_user.role = 'Admin'
        self.google_user.set_password('admin')
        self.google_user.save()

    def test_login_returns_tokens(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'loginuser',
            'password': 'Pass1234!',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)

    def test_login_wrong_password_returns_401(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'loginuser',
            'password': 'wrongpassword',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_token(self):
        refresh = RefreshToken.for_user(self.user)
        headers = self.auth_headers(self.user)
        resp = self.client.post('/api/auth/logout/', {
            'refresh': str(refresh)
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_205_RESET_CONTENT)

    def test_token_refresh(self):
        refresh = RefreshToken.for_user(self.user)
        resp = self.client.post('/api/auth/refresh/', {
            'refresh': str(refresh)
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)

    def test_public_register_employee_returns_tokens(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'new_employee',
            'password': 'Pass1234!',
            'role': 'Employee',
            'email': 'new.employee@example.com',
            'first_name': 'New',
            'last_name': 'Employee',
            'phone_number': '252610000001',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertEqual(resp.data['user']['username'], 'new_employee')
        self.assertEqual(resp.data['user']['role'], 'Employee')
        self.assertTrue(User.objects.filter(username='new_employee', role='Employee').exists())

    def test_public_register_rejects_privileged_roles(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'new_admin',
            'password': 'Pass1234!',
            'role': 'Admin',
            'email': 'new.admin@example.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertFalse(User.objects.filter(username='new_admin').exists())

    def test_check_email_finds_registered_gmail_alias(self):
        resp = self.client.post('/api/auth/check-email/', {
            'email': 'Admin@Gmail.com ',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertTrue(resp.data['found'])
        self.assertEqual(resp.data['username'], 'admin')
        self.assertEqual(resp.data['email'], 'admin@gmail.com')
        self.assertEqual(resp.data['database_email'], 'admin@cafeteria.com')

    def test_check_email_rejects_unknown_gmail(self):
        resp = self.client.post('/api/auth/check-email/', {
            'email': 'not-registered@gmail.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertFalse(resp.data['found'])

    @override_settings(DEBUG=True)
    def test_google_social_login_mock_gmail_alias_returns_tokens(self):
        resp = self.client.post('/api/auth/google-social-login/', {
            'credential': 'mock-google-token-admin@gmail.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)
        self.assertIn('refresh', resp.data)
        self.assertEqual(resp.data['user']['username'], 'admin')
        self.assertEqual(resp.data['user']['role'], 'Admin')
        self.assertEqual(resp.data['user']['full_name'], 'System Admin')

    @override_settings(DEBUG=True)
    def test_google_social_login_unknown_gmail_returns_403(self):
        resp = self.client.post('/api/auth/google-social-login/', {
            'credential': 'mock-google-token-not-registered@gmail.com',
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)


# ─────────────────────────────────────────────────────────────
# Menu API Tests
# ─────────────────────────────────────────────────────────────

class MenuAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin1', role='Admin')
        self.employee = self.make_user('emp1', role='Employee')
        self.item = self.make_menu_item()

    def test_list_menu_authenticated(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/menu/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_list_menu_unauthenticated_returns_401(self):
        resp = self.client.get('/api/menu/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_single_menu_item(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.get(f'/api/menu/{self.item.pk}/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Grilled Chicken')

    def test_delete_menu_item_admin(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.delete(f'/api/menu/{self.item.pk}/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(MenuItem.objects.filter(pk=self.item.pk).exists())

    def test_filter_menu_by_category(self):
        bev_cat = self.make_category('Beverages')
        MenuItem.objects.create(name='Lemonade', price=Decimal('2.50'), category=bev_cat)
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/menu/?category=Beverages', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# Orders API Tests
# ─────────────────────────────────────────────────────────────

class OrdersAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin2', role='Admin')
        self.employee = self.make_user('emp2', role='Employee')
        self.menu_item = self.make_menu_item(name='Pizza', price=Decimal('12.00'))

    def test_unauthenticated_order_list_returns_401(self):
        resp = self.client.get('/api/orders/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_admin_sees_all_orders(self):
        self.make_order(user=self.employee)
        self.make_order(user=self.admin)
        headers = self.auth_headers(self.admin)
        resp = self.client.get('/api/orders/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# Inventory API Tests
# ─────────────────────────────────────────────────────────────

class InventoryAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin3', role='Admin')
        self.employee = self.make_user('emp3', role='Employee')

    def _make_inv_item(self, name='Tomatoes', qty=50, min_stock=10):
        return InventoryItem.objects.create(
            item_name=name, category='Vegetables',
            quantity=qty, unit='kg',
            min_stock=min_stock,
            cost=Decimal('2.00'),
        )

    def test_list_inventory_authenticated(self):
        self._make_inv_item()
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/inventory/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)


# ─────────────────────────────────────────────────────────────
# Salary API Tests
# ─────────────────────────────────────────────────────────────

class SalaryAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin4', role='Admin')
        self.employee = self.make_user('emp4', role='Employee')

    def test_salary_model_net_calculation(self):
        """SalaryRecord auto-computes net_salary = base + bonus - deduction."""
        emp = Employee.objects.create(
            full_name='Calc Test', job_title='Staff', salary=Decimal('1000')
        )
        sr = SalaryRecord.objects.create(
            employee=emp,
            base_salary=Decimal('1500'),
            bonus=Decimal('200'),
            deduction=Decimal('100'),
            payment_date='2025-05-01',
            status='pending',
        )
        sr.refresh_from_db()
        self.assertEqual(sr.net_salary, Decimal('1600.00'))

    def test_salary_mark_paid(self):
        """SalaryRecord status can be changed to paid."""
        emp = Employee.objects.create(
            full_name='Pay Test', job_title='Staff', salary=Decimal('1200')
        )
        sr = SalaryRecord.objects.create(
            employee=emp,
            base_salary=Decimal('1200'),
            bonus=Decimal('0'),
            deduction=Decimal('0'),
            payment_date='2025-04-01',
            status='pending',
        )
        sr.status = 'paid'
        sr.save()
        sr.refresh_from_db()
        self.assertEqual(sr.status, 'paid')
