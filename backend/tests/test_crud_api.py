"""
End-to-end API CRUD regression tests for the database-backed project modules.
"""

from decimal import Decimal
import tempfile
from pathlib import Path

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework import status
from rest_framework.test import APITestCase

from employees.models import Employee
from inventory.models import InventoryItem
from menu.models import (
    Category,
    ContactMessage,
    JobApplication,
    MenuItem,
    ModifierGroup,
    ModifierOption,
    NewsletterSubscription,
    Recipe,
)
from orders.models import Order, Table
from salaries.models import SalaryRecord


User = get_user_model()


def results(response):
    """Return a list for either paginated or non-paginated DRF responses."""
    data = response.data
    if isinstance(data, dict) and "results" in data:
        return data["results"]
    return data


class CRUDAuthMixin:
    def make_user(self, username, role="Employee", password="Pass1234!"):
        return User.objects.create_user(
            username=username,
            password=password,
            role=role,
            email=f"{username}@example.com",
        )

    def auth_as(self, user):
        self.client.force_authenticate(user=user)

    def make_menu_item(self, name="CRUD Plate", price="9.50"):
        category = Category.objects.create(name=f"{name} Category")
        return MenuItem.objects.create(
            category=category,
            name=name,
            price=Decimal(price),
            status="active",
        )


class UserCRUDAPITests(CRUDAuthMixin, APITestCase):
    def setUp(self):
        self.admin = self.make_user("crud_admin", role="Admin")
        self.employee = self.make_user("crud_employee", role="Employee")

    def test_admin_can_create_read_update_and_delete_system_users(self):
        self.auth_as(self.admin)

        create = self.client.post(
            "/api/auth/users/",
            {
                "username": "new_manager",
                "password": "Pass1234!",
                "role": "Manager",
                "email": "manager@example.com",
                "phone_number": "252610000001",
            },
            format="json",
        )
        self.assertEqual(create.status_code, status.HTTP_201_CREATED)
        user_id = create.data["id"]
        self.assertNotIn("password", create.data)

        list_response = self.client.get("/api/auth/users/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertIn(user_id, [item["id"] for item in results(list_response)])

        detail = self.client.get(f"/api/auth/users/{user_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["username"], "new_manager")

        update = self.client.patch(
            f"/api/auth/users/{user_id}/",
            {"email": "manager.updated@example.com", "phone_number": "252610000002"},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(update.data["email"], "manager.updated@example.com")

        delete = self.client.delete(f"/api/auth/users/{user_id}/")
        self.assertEqual(delete.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(User.objects.filter(id=user_id).exists())

    def test_employee_can_update_own_profile_but_not_manage_users(self):
        self.auth_as(self.employee)

        list_response = self.client.get("/api/auth/users/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual([item["id"] for item in results(list_response)], [self.employee.id])

        update = self.client.patch(
            f"/api/auth/users/{self.employee.id}/",
            {"first_name": "Updated", "phone_number": "252620000001"},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(update.data["first_name"], "Updated")

        create = self.client.post(
            "/api/auth/users/",
            {"username": "forbidden", "password": "Pass1234!", "role": "Admin"},
            format="json",
        )
        self.assertEqual(create.status_code, status.HTTP_403_FORBIDDEN)

        delete = self.client.delete(f"/api/auth/users/{self.employee.id}/")
        self.assertEqual(delete.status_code, status.HTTP_403_FORBIDDEN)
        self.assertTrue(User.objects.filter(id=self.employee.id).exists())


class MenuCatalogCRUDAPITests(CRUDAuthMixin, APITestCase):
    def setUp(self):
        self.manager = self.make_user("crud_menu_manager", role="Manager")
        self.employee = self.make_user("crud_menu_employee", role="Employee")

    def test_category_menu_recipe_and_modifier_crud(self):
        self.auth_as(self.manager)

        category = self.client.post(
            "/api/menu/categories/",
            {"name": "CRUD Breakfast", "description": "Morning menu"},
            format="json",
        )
        self.assertEqual(category.status_code, status.HTTP_201_CREATED)
        category_id = category.data["id"]

        category_update = self.client.patch(
            f"/api/menu/categories/{category_id}/",
            {"description": "Updated morning menu"},
            format="json",
        )
        self.assertEqual(category_update.status_code, status.HTTP_200_OK)

        item = self.client.post(
            "/api/menu/",
            {
                "category": "CRUD Breakfast",
                "name": "CRUD Omelette",
                "description": "Eggs and vegetables",
                "price": "7.25",
                "status": "active",
            },
            format="json",
        )
        self.assertEqual(item.status_code, status.HTTP_201_CREATED)
        item_id = item.data["id"]
        self.assertEqual(item.data["category"], "CRUD Breakfast")

        detail = self.client.get(f"/api/menu/{item_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["name"], "CRUD Omelette")

        item_update = self.client.patch(
            f"/api/menu/{item_id}/",
            {"price": "8.00", "category": "CRUD Lunch"},
            format="json",
        )
        self.assertEqual(item_update.status_code, status.HTTP_200_OK)
        self.assertEqual(item_update.data["price"], "8.00")
        self.assertEqual(item_update.data["category"], "CRUD Lunch")

        toggle = self.client.patch(f"/api/menu/{item_id}/toggle/")
        self.assertEqual(toggle.status_code, status.HTTP_200_OK)
        self.assertEqual(toggle.data["status"], "inactive")

        recipe = self.client.post("/api/menu/recipes/", {"menu_item": item_id}, format="json")
        self.assertEqual(recipe.status_code, status.HTTP_201_CREATED)
        recipe_id = recipe.data["id"]

        recipe_detail = self.client.get(f"/api/menu/recipes/{recipe_id}/")
        self.assertEqual(recipe_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(recipe_detail.data["menu_item"], item_id)

        group = self.client.post(
            "/api/menu/modifier-groups/",
            {"name": "CRUD Extras", "min_selections": 0, "max_selections": 2},
            format="json",
        )
        self.assertEqual(group.status_code, status.HTTP_201_CREATED)
        group_id = group.data["id"]

        option = self.client.post(
            "/api/menu/modifier-options/",
            {"modifier_group": group_id, "name": "CRUD Cheese", "price_adjustment": "1.50"},
            format="json",
        )
        self.assertEqual(option.status_code, status.HTTP_201_CREATED)
        option_id = option.data["id"]
        self.assertEqual(option.data["modifier_group"], group_id)

        option_update = self.client.patch(
            f"/api/menu/modifier-options/{option_id}/",
            {"price_adjustment": "2.00"},
            format="json",
        )
        self.assertEqual(option_update.status_code, status.HTTP_200_OK)
        self.assertEqual(option_update.data["price_adjustment"], "2.00")

        self.assertEqual(
            self.client.delete(f"/api/menu/modifier-options/{option_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertEqual(
            self.client.delete(f"/api/menu/modifier-groups/{group_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertEqual(
            self.client.delete(f"/api/menu/recipes/{recipe_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertEqual(
            self.client.delete(f"/api/menu/{item_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(MenuItem.objects.filter(id=item_id).exists())

        self.assertEqual(
            self.client.delete(f"/api/menu/categories/{category_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )

    def test_employee_can_read_menu_but_cannot_write_catalog(self):
        self.make_menu_item()
        self.auth_as(self.employee)

        list_response = self.client.get("/api/menu/")
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)

        create = self.client.post(
            "/api/menu/",
            {"category": "Forbidden", "name": "Nope", "price": "1.00"},
            format="json",
        )
        self.assertEqual(create.status_code, status.HTTP_403_FORBIDDEN)


class OperationsCRUDAPITests(CRUDAuthMixin, APITestCase):
    def setUp(self):
        self.manager = self.make_user("crud_ops_manager", role="Manager")
        self.employee_user = self.make_user("crud_ops_employee_user", role="Employee")

    def test_inventory_employee_and_salary_crud(self):
        self.auth_as(self.manager)

        inventory = self.client.post(
            "/api/inventory/",
            {
                "item_name": "CRUD Flour",
                "quantity": 100,
                "unit": "kg",
                "min_stock": 20,
                "category": "Dry goods",
                "cost": "2.50",
            },
            format="json",
        )
        self.assertEqual(inventory.status_code, status.HTTP_201_CREATED)
        inventory_id = inventory.data["id"]

        inventory_update = self.client.patch(
            f"/api/inventory/{inventory_id}/",
            {"quantity": 80, "cost": "2.75"},
            format="json",
        )
        self.assertEqual(inventory_update.status_code, status.HTTP_200_OK)
        self.assertEqual(inventory_update.data["quantity"], 80)

        employee = self.client.post(
            "/api/employees/",
            {
                "user_id": self.employee_user.id,
                "full_name": "CRUD Staff",
                "job_title": "Cashier",
                "phone": "252630000001",
                "position": "Front desk",
                "salary": "500.00",
                "shift": "Morning",
                "hours": "8 AM - 4 PM",
            },
            format="json",
        )
        self.assertEqual(employee.status_code, status.HTTP_201_CREATED)
        employee_id = employee.data["id"]

        employee_update = self.client.patch(
            f"/api/employees/{employee_id}/",
            {"job_title": "Lead Cashier", "salary": "650.00"},
            format="json",
        )
        self.assertEqual(employee_update.status_code, status.HTTP_200_OK)
        self.assertEqual(employee_update.data["job_title"], "Lead Cashier")

        toggle = self.client.patch(f"/api/employees/{employee_id}/toggle/")
        self.assertEqual(toggle.status_code, status.HTTP_200_OK)
        self.assertEqual(toggle.data["status"], "inactive")

        salary = self.client.post(
            "/api/salaries/",
            {
                "employee": employee_id,
                "base_salary": "650.00",
                "bonus": "50.00",
                "deduction": "25.00",
                "payment_date": "2026-05-01",
                "status": "pending",
            },
            format="json",
        )
        self.assertEqual(salary.status_code, status.HTTP_201_CREATED)
        salary_id = salary.data["id"]
        self.assertEqual(salary.data["net_salary"], "675.00")

        salary_update = self.client.patch(
            f"/api/salaries/{salary_id}/",
            {"bonus": "100.00", "status": "paid"},
            format="json",
        )
        self.assertEqual(salary_update.status_code, status.HTTP_200_OK)
        self.assertEqual(salary_update.data["net_salary"], "725.00")
        self.assertEqual(salary_update.data["status"], "paid")

        self.assertEqual(
            self.client.delete(f"/api/salaries/{salary_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(SalaryRecord.objects.filter(id=salary_id).exists())

        self.assertEqual(
            self.client.delete(f"/api/employees/{employee_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(Employee.objects.filter(id=employee_id).exists())

        self.assertEqual(
            self.client.delete(f"/api/inventory/{inventory_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(InventoryItem.objects.filter(id=inventory_id).exists())

    def test_employee_can_read_operations_data_but_not_write_restricted_resources(self):
        self.auth_as(self.employee_user)

        self.assertEqual(self.client.get("/api/inventory/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get("/api/employees/").status_code, status.HTTP_200_OK)
        self.assertEqual(self.client.get("/api/salaries/").status_code, status.HTTP_403_FORBIDDEN)

        inventory_create = self.client.post(
            "/api/inventory/",
            {"item_name": "Forbidden Flour", "quantity": 1, "unit": "kg"},
            format="json",
        )
        self.assertEqual(inventory_create.status_code, status.HTTP_403_FORBIDDEN)

        employee_create = self.client.post(
            "/api/employees/",
            {"full_name": "Forbidden Staff", "salary": "1.00"},
            format="json",
        )
        self.assertEqual(employee_create.status_code, status.HTTP_403_FORBIDDEN)


class OrdersAndTablesCRUDAPITests(CRUDAuthMixin, APITestCase):
    def setUp(self):
        self.admin = self.make_user("crud_orders_admin", role="Admin")
        self.employee = self.make_user("crud_orders_employee", role="Employee")
        self.menu_item = self.make_menu_item(name="CRUD Sandwich", price="5.00")

    def test_table_and_order_crud(self):
        self.auth_as(self.admin)

        table = self.client.post(
            "/api/orders/tables/",
            {"table_number": "CRUD-T1", "seating_capacity": 4, "status": "vacant"},
            format="json",
        )
        self.assertEqual(table.status_code, status.HTTP_201_CREATED)
        table_id = table.data["id"]

        table_update = self.client.patch(
            f"/api/orders/tables/{table_id}/",
            {"status": "reserved", "seating_capacity": 6},
            format="json",
        )
        self.assertEqual(table_update.status_code, status.HTTP_200_OK)
        self.assertEqual(table_update.data["status"], "reserved")

        self.auth_as(self.employee)
        order = self.client.post(
            "/api/orders/",
            {
                "customer_name": "CRUD Customer",
                "employee_name": "CRUD Cashier",
                "payment_method": "cash",
                "table": table_id,
                "order_type": "dine_in",
                "payment_status": "paid",
                "items": [{"menu_item_id": self.menu_item.id, "quantity": 3}],
            },
            format="json",
        )
        self.assertEqual(order.status_code, status.HTTP_201_CREATED)
        order_id = order.data["id"]
        self.assertEqual(order.data["total_price"], "15.00")
        self.assertEqual(len(order.data["items"]), 1)

        detail = self.client.get(f"/api/orders/{order_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["customer_name"], "CRUD Customer")

        status_update = self.client.patch(
            f"/api/orders/{order_id}/status/",
            {"status": "completed"},
            format="json",
        )
        self.assertEqual(status_update.status_code, status.HTTP_200_OK)
        self.assertEqual(status_update.data["status"], "completed")

        denied_delete = self.client.delete(f"/api/orders/{order_id}/")
        self.assertEqual(denied_delete.status_code, status.HTTP_403_FORBIDDEN)

        self.auth_as(self.admin)
        self.assertEqual(
            self.client.delete(f"/api/orders/{order_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(Order.objects.filter(id=order_id).exists())

        self.assertEqual(
            self.client.delete(f"/api/orders/tables/{table_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(Table.objects.filter(id=table_id).exists())


class PublicMessagesCRUDAPITests(CRUDAuthMixin, APITestCase):
    def setUp(self):
        self.admin = self.make_user("crud_messages_admin", role="Admin")
        self.manager = self.make_user("crud_messages_manager", role="Manager")
        self.employee = self.make_user("crud_messages_employee", role="Employee")
        tmp_root = Path("C:/tmp")
        tmp_root.mkdir(parents=True, exist_ok=True)
        self._media_dir = tempfile.TemporaryDirectory(
            dir=tmp_root,
            ignore_cleanup_errors=True,
        )
        self._media_override = override_settings(MEDIA_ROOT=self._media_dir.name)
        self._media_override.enable()

    def tearDown(self):
        self._media_override.disable()
        self._media_dir.cleanup()
        super().tearDown()

    def test_contact_and_newsletter_submission_review_and_delete(self):
        self.client.force_authenticate(user=None)

        contact = self.client.post(
            "/api/menu/contact-messages/",
            {
                "name": "CRUD Visitor",
                "email": "visitor@example.com",
                "subject": "CRUD Question",
                "message": "Can I reserve lunch?",
            },
            format="json",
        )
        self.assertEqual(contact.status_code, status.HTTP_201_CREATED)
        contact_id = contact.data["id"]

        newsletter = self.client.post(
            "/api/menu/newsletter-subscriptions/",
            {"email": "CRUD.NEWS@example.com"},
            format="json",
        )
        self.assertEqual(newsletter.status_code, status.HTTP_201_CREATED)
        newsletter_id = newsletter.data["id"]
        self.assertEqual(newsletter.data["email"], "crud.news@example.com")

        self.assertEqual(
            self.client.get("/api/menu/contact-messages/").status_code,
            status.HTTP_401_UNAUTHORIZED,
        )

        self.auth_as(self.employee)
        contact_list = self.client.get("/api/menu/contact-messages/")
        self.assertEqual(contact_list.status_code, status.HTTP_200_OK)
        self.assertIn(contact_id, [item["id"] for item in results(contact_list)])
        self.assertEqual(
            self.client.delete(f"/api/menu/contact-messages/{contact_id}/").status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.auth_as(self.manager)
        newsletter_list = self.client.get("/api/menu/newsletter-subscriptions/")
        self.assertEqual(newsletter_list.status_code, status.HTTP_200_OK)
        self.assertIn(newsletter_id, [item["id"] for item in results(newsletter_list)])

        self.auth_as(self.admin)
        self.assertEqual(
            self.client.delete(f"/api/menu/contact-messages/{contact_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(ContactMessage.objects.filter(id=contact_id).exists())

        self.assertEqual(
            self.client.delete(f"/api/menu/newsletter-subscriptions/{newsletter_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(NewsletterSubscription.objects.filter(id=newsletter_id).exists())

    def test_job_application_public_create_admin_update_and_delete(self):
        self.client.force_authenticate(user=None)

        cv = SimpleUploadedFile(
            "resume.pdf",
            b"%PDF-1.4 crud test resume",
            content_type="application/pdf",
        )
        application = self.client.post(
            "/api/menu/job-applications/",
            {
                "first_name": "CRUD",
                "last_name": "Applicant",
                "email": "applicant@example.com",
                "phone": "252640000001",
                "position": "Chef",
                "experience_level": "Senior",
                "availability": "Full time",
                "start_date": "2026-06-01",
                "expected_salary": "900",
                "portfolio_url": "https://example.com/portfolio",
                "cover_letter": "I can support cafeteria operations.",
                "agreed_to_policy": True,
                "cv": cv,
            },
            format="multipart",
        )
        self.assertEqual(application.status_code, status.HTTP_201_CREATED)
        application_id = application.data["id"]
        self.assertEqual(application.data["status"], "new")
        self.assertTrue(application.data["cv_url"])

        self.auth_as(self.employee)
        self.assertEqual(
            self.client.get("/api/menu/job-applications/").status_code,
            status.HTTP_403_FORBIDDEN,
        )

        self.auth_as(self.admin)
        detail = self.client.get(f"/api/menu/job-applications/{application_id}/")
        self.assertEqual(detail.status_code, status.HTTP_200_OK)
        self.assertEqual(detail.data["email"], "applicant@example.com")

        update = self.client.patch(
            f"/api/menu/job-applications/{application_id}/",
            {"status": "reviewing"},
            format="json",
        )
        self.assertEqual(update.status_code, status.HTTP_200_OK)
        self.assertEqual(update.data["status"], "reviewing")

        self.assertEqual(
            self.client.delete(f"/api/menu/job-applications/{application_id}/").status_code,
            status.HTTP_204_NO_CONTENT,
        )
        self.assertFalse(JobApplication.objects.filter(id=application_id).exists())
