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
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import RefreshToken

from menu.models import MenuItem
from orders.models import Order, OrderItem
from inventory.models import InventoryItem
from employees.models import Salary

User = get_user_model()


# ─────────────────────────────────────────────────────────────
# Helper Mixins
# ─────────────────────────────────────────────────────────────

class AuthMixin:
    """Helper to create users and inject JWT headers."""

    def make_user(self, username, role='employee', password='Pass1234!'):
        return User.objects.create_user(
            username=username, password=password, role=role,
            first_name='Test', last_name='User',
        )

    def auth_headers(self, user):
        refresh = RefreshToken.for_user(user)
        return {'HTTP_AUTHORIZATION': f'Bearer {str(refresh.access_token)}'}

    def make_menu_item(self, **kwargs):
        defaults = dict(name='Grilled Chicken', price=Decimal('8.50'), category='Main Course')
        defaults.update(kwargs)
        return MenuItem.objects.create(**defaults)

    def make_order(self, employee, **kwargs):
        o = Order(
            employee=employee,
            employee_name=employee.username,
            payment_method='cash',
            total_amount=Decimal('10.00'),
        )
        for k, v in kwargs.items():
            setattr(o, k, v)
        o.save()
        return o


# ─────────────────────────────────────────────────────────────
# Authentication Endpoint Tests
# ─────────────────────────────────────────────────────────────

class AuthAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.user = self.make_user('loginuser', role='employee')

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

    def test_me_endpoint_returns_current_user(self):
        headers = self.auth_headers(self.user)
        resp = self.client.get('/api/auth/me/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['username'], 'loginuser')

    def test_me_unauthenticated_returns_401(self):
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_blacklists_token(self):
        refresh = RefreshToken.for_user(self.user)
        headers = self.auth_headers(self.user)
        resp = self.client.post('/api/auth/logout/', {
            'refresh': str(refresh)
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_token_refresh(self):
        refresh = RefreshToken.for_user(self.user)
        resp = self.client.post('/api/auth/token/refresh/', {
            'refresh': str(refresh)
        }, format='json')
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertIn('access', resp.data)


# ─────────────────────────────────────────────────────────────
# Menu API Tests
# ─────────────────────────────────────────────────────────────

class MenuAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin1', role='admin')
        self.employee = self.make_user('emp1', role='employee')
        self.item = self.make_menu_item()

    def test_list_menu_authenticated(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/menu/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_list_menu_unauthenticated_returns_401(self):
        resp = self.client.get('/api/menu/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_menu_item_admin(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.post('/api/menu/', {
            'name': 'New Burger',
            'price': '9.99',
            'category': 'Main Course',
            'is_available': True,
            'rating': '4.5',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['name'], 'New Burger')

    def test_create_menu_item_employee_returns_403(self):
        """Employees must not be able to create menu items."""
        headers = self.auth_headers(self.employee)
        resp = self.client.post('/api/menu/', {
            'name': 'Sneaky Item',
            'price': '5.00',
            'category': 'Snacks',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_single_menu_item(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.get(f'/api/menu/{self.item.pk}/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Grilled Chicken')

    def test_update_menu_item_admin(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.put(f'/api/menu/{self.item.pk}/', {
            'name': 'Updated Chicken',
            'price': '9.00',
            'category': 'Main Course',
            'is_available': True,
            'rating': '4.7',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Updated Chicken')

    def test_delete_menu_item_admin(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.delete(f'/api/menu/{self.item.pk}/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(MenuItem.objects.filter(pk=self.item.pk).exists())

    def test_delete_menu_item_employee_returns_403(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.delete(f'/api/menu/{self.item.pk}/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_toggle_availability_admin(self):
        original = self.item.is_available
        headers = self.auth_headers(self.admin)
        resp = self.client.patch(f'/api/menu/{self.item.pk}/toggle/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.item.refresh_from_db()
        self.assertNotEqual(self.item.is_available, original)

    def test_filter_menu_by_category(self):
        MenuItem.objects.create(name='Lemonade', price=Decimal('2.50'), category='Beverages')
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/menu/?category=Beverages', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data.get('results', resp.data)
        for item in results:
            self.assertEqual(item['category'], 'Beverages')

    def test_create_menu_item_negative_price_returns_400(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.post('/api/menu/', {
            'name': 'Bad Item',
            'price': '-5.00',
            'category': 'Snacks',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)


# ─────────────────────────────────────────────────────────────
# Orders API Tests
# ─────────────────────────────────────────────────────────────

class OrdersAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin2', role='admin')
        self.employee = self.make_user('emp2', role='employee')
        self.menu_item = self.make_menu_item(name='Pizza', price=Decimal('12.00'))

    def _order_payload(self):
        return {
            'payment_method': 'cash',
            'total_amount': '12.00',
            'employee_name': 'emp2',
            'notes': 'No onions please',
            'items': [
                {
                    'menu_item': self.menu_item.pk,
                    'item_name': 'Pizza',
                    'quantity': 1,
                    'unit_price': '12.00',
                }
            ],
        }

    def test_employee_can_place_order(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.post('/api/orders/', self._order_payload(),
                                format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertIn('order_number', resp.data)
        self.assertTrue(resp.data['order_number'].startswith('ORD-'))

    def test_order_items_created_with_order(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.post('/api/orders/', self._order_payload(),
                                format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(len(resp.data['items']), 1)

    def test_employee_sees_only_own_orders(self):
        """Employee list endpoint must return only that employee's orders."""
        other_emp = self.make_user('otheremp')
        self.make_order(other_emp)
        self.make_order(self.employee)
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/orders/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data.get('results', resp.data)
        for order in results:
            self.assertEqual(order['employee'], self.employee.pk)

    def test_admin_sees_all_orders(self):
        other_emp = self.make_user('otheremp2')
        self.make_order(other_emp)
        self.make_order(self.employee)
        headers = self.auth_headers(self.admin)
        resp = self.client.get('/api/orders/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        results = resp.data.get('results', resp.data)
        self.assertGreaterEqual(len(results), 2)

    def test_update_order_status_admin(self):
        order = self.make_order(self.employee)
        headers = self.auth_headers(self.admin)
        resp = self.client.patch(
            f'/api/orders/{order.pk}/status/',
            {'status': 'completed'},
            format='json', **headers
        )
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, 'completed')

    def test_update_order_status_employee_returns_403(self):
        order = self.make_order(self.employee)
        headers = self.auth_headers(self.employee)
        resp = self.client.patch(
            f'/api/orders/{order.pk}/status/',
            {'status': 'completed'},
            format='json', **headers
        )
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_unauthenticated_order_list_returns_401(self):
        resp = self.client.get('/api/orders/')
        self.assertEqual(resp.status_code, status.HTTP_401_UNAUTHORIZED)


# ─────────────────────────────────────────────────────────────
# Inventory API Tests
# ─────────────────────────────────────────────────────────────

class InventoryAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin3', role='admin')
        self.employee = self.make_user('emp3', role='employee')

    def _make_inv_item(self, name='Tomatoes', qty=50, threshold=10):
        return InventoryItem.objects.create(
            name=name, category='Vegetables',
            quantity=Decimal(str(qty)), unit='kg',
            min_threshold=Decimal(str(threshold)),
            cost_per_unit=Decimal('2.00'),
        )

    def test_list_inventory_authenticated(self):
        self._make_inv_item()
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/inventory/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_inventory_item_admin(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.post('/api/inventory/', {
            'name': 'Onions',
            'category': 'Vegetables',
            'quantity': '20.00',
            'unit': 'kg',
            'min_threshold': '5.00',
            'cost_per_unit': '1.50',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertEqual(resp.data['name'], 'Onions')

    def test_create_inventory_item_employee_returns_403(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.post('/api/inventory/', {
            'name': 'Sneaky Stock',
            'category': 'Misc',
            'quantity': '10.00',
            'unit': 'pcs',
            'min_threshold': '2.00',
            'cost_per_unit': '1.00',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_low_stock_endpoint_returns_low_items_only(self):
        self._make_inv_item(name='LowItem', qty=3, threshold=10)   # low stock
        self._make_inv_item(name='HighItem', qty=50, threshold=10)  # not low
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/inventory/low-stock/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        names = [i['name'] for i in resp.data]
        self.assertIn('LowItem', names)
        self.assertNotIn('HighItem', names)

    def test_update_inventory_item_admin(self):
        item = self._make_inv_item()
        headers = self.auth_headers(self.admin)
        resp = self.client.put(f'/api/inventory/{item.pk}/', {
            'name': 'Updated Tomatoes',
            'category': 'Vegetables',
            'quantity': '100.00',
            'unit': 'kg',
            'min_threshold': '10.00',
            'cost_per_unit': '2.00',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['name'], 'Updated Tomatoes')

    def test_delete_inventory_item_admin(self):
        item = self._make_inv_item()
        headers = self.auth_headers(self.admin)
        resp = self.client.delete(f'/api/inventory/{item.pk}/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)


# ─────────────────────────────────────────────────────────────
# Salary API Tests
# ─────────────────────────────────────────────────────────────

class SalaryAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin4', role='admin')
        self.employee = self.make_user('emp4', role='employee')

    def test_list_salaries_admin(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.get('/api/salaries/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_list_salaries_employee_returns_403(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/salaries/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_salary_admin(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.post('/api/salaries/', {
            'employee': self.employee.pk,
            'month': '2025-03-01',
            'base_salary': '1500.00',
            'bonus': '200.00',
            'deductions': '100.00',
            'status': 'pending',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        # net_salary should be auto-computed: 1500 + 200 - 100 = 1600
        self.assertEqual(Decimal(resp.data['net_salary']), Decimal('1600.00'))

    def test_mark_salary_paid(self):
        salary = Salary.objects.create(
            employee=self.employee,
            month=datetime.date(2025, 4, 1),
            base_salary=Decimal('1200'),
            bonus=Decimal('0'),
            deductions=Decimal('0'),
            net_salary=Decimal('1200'),
            status='pending',
        )
        headers = self.auth_headers(self.admin)
        resp = self.client.patch(f'/api/salaries/{salary.pk}/pay/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        salary.refresh_from_db()
        self.assertEqual(salary.status, 'paid')
        self.assertIsNotNone(salary.paid_at)

    def test_salary_deduction_exceeds_total_returns_400(self):
        """Deductions > base + bonus should be rejected by serializer."""
        headers = self.auth_headers(self.admin)
        resp = self.client.post('/api/salaries/', {
            'employee': self.employee.pk,
            'month': '2025-05-01',
            'base_salary': '500.00',
            'bonus': '0.00',
            'deductions': '1000.00',  # exceeds base!
            'status': 'pending',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_400_BAD_REQUEST)

    def test_duplicate_salary_month_returns_400(self):
        """Same employee + month should not create a duplicate."""
        Salary.objects.create(
            employee=self.employee,
            month=datetime.date(2025, 6, 1),
            base_salary=Decimal('1000'),
            bonus=Decimal('0'),
            deductions=Decimal('0'),
            net_salary=Decimal('1000'),
            status='pending',
        )
        headers = self.auth_headers(self.admin)
        resp = self.client.post('/api/salaries/', {
            'employee': self.employee.pk,
            'month': '2025-06-01',
            'base_salary': '1200.00',
            'bonus': '0.00',
            'deductions': '0.00',
            'status': 'pending',
        }, format='json', **headers)
        # Must be rejected (400 due to unique_together)
        self.assertIn(resp.status_code, [
            status.HTTP_400_BAD_REQUEST,
            status.HTTP_409_CONFLICT,
        ])


# ─────────────────────────────────────────────────────────────
# Employee Management API Tests
# ─────────────────────────────────────────────────────────────

class EmployeeManagementAPITests(AuthMixin, APITestCase):

    def setUp(self):
        self.admin = self.make_user('admin5', role='admin')
        self.employee = self.make_user('emp5', role='employee')

    def test_list_employees_authenticated(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.get('/api/auth/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)

    def test_create_employee_admin(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.post('/api/auth/', {
            'username': 'newstaff',
            'password': 'SecurePass99!',
            'password2': 'SecurePass99!',
            'email': 'staff@cafe.so',
            'first_name': 'Ahmed',
            'last_name': 'Ali',
            'role': 'employee',
            'phone': '0634567890',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='newstaff').exists())

    def test_create_employee_by_employee_returns_403(self):
        headers = self.auth_headers(self.employee)
        resp = self.client.post('/api/auth/', {
            'username': 'hacked',
            'password': 'hacked123!',
            'password2': 'hacked123!',
            'role': 'admin',
        }, format='json', **headers)
        self.assertEqual(resp.status_code, status.HTTP_403_FORBIDDEN)

    def test_get_employee_detail(self):
        headers = self.auth_headers(self.admin)
        resp = self.client.get(f'/api/auth/{self.employee.pk}/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_200_OK)
        self.assertEqual(resp.data['username'], 'emp5')

    def test_delete_employee_admin(self):
        target = self.make_user('tobedeleted')
        headers = self.auth_headers(self.admin)
        resp = self.client.delete(f'/api/auth/{target.pk}/', **headers)
        self.assertEqual(resp.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(username='tobedeleted').exists())
