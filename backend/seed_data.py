"""
seed_data.py — Seeds the database with demo data.
Run from the backend directory:
    python seed_data.py
"""
import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from menu.models import MenuItem, Category
from inventory.models import InventoryItem
from employees.models import Employee
from accounts.models import CustomUser
from orders.models import Order, OrderItem
from salaries.models import SalaryRecord


def seed_data():
    print("=== Clearing old data ===")
    SalaryRecord.objects.all().delete()
    OrderItem.objects.all().delete()
    Order.objects.all().delete()
    MenuItem.objects.all().delete()
    Category.objects.all().delete()
    InventoryItem.objects.all().delete()
    Employee.objects.all().delete()

    # ── Users ────────────────────────────────────────────────────────────────
    print("Creating users...")
    admin_user, _ = CustomUser.objects.get_or_create(
        username='admin',
        defaults={'role': 'Admin', 'email': 'admin@cafeteria.com', 'is_staff': True, 'is_superuser': True},
    )
    if _:
        admin_user.set_password('admin1234')
        admin_user.save()
        print("  Created admin / admin1234")

    staff_user, _ = CustomUser.objects.get_or_create(
        username='staff',
        defaults={'role': 'Staff', 'email': 'staff@cafeteria.com'},
    )
    if _:
        staff_user.set_password('staff1234')
        staff_user.save()
        print("  Created staff / staff1234")

    # ── Categories ───────────────────────────────────────────────────────────
    print("Seeding categories...")
    cat_names = ['Main Course', 'Beverages', 'Salads', 'Snacks', 'Desserts']
    cats = {n: Category.objects.create(name=n) for n in cat_names}

    # ── Menu Items ───────────────────────────────────────────────────────────
    print("Seeding menu items...")
    menu_data = [
        {'name': 'Grilled Chicken Sandwich', 'price': 12.50, 'cat': 'Main Course', 'description': 'Juicy grilled chicken, fresh lettuce & tomato on toasted brioche'},
        {'name': 'Classic Beef Burger',       'price': 15.00, 'cat': 'Main Course', 'description': 'Premium beef patty, cheddar, caramelised onions & house sauce'},
        {'name': 'Pasta Carbonara',           'price': 11.25, 'cat': 'Main Course', 'description': 'Al dente penne, crispy bacon, egg yolk & pecorino romano'},
        {'name': 'Eggs Benedict',             'price': 13.00, 'cat': 'Main Course', 'description': 'Poached eggs, Canadian bacon, hollandaise on English muffin'},
        {'name': 'Fried Rice Bowl',           'price':  9.50, 'cat': 'Main Course', 'description': 'Jasmine rice, seasonal vegetables, soy & sesame'},
        {'name': 'Caesar Salad',              'price':  9.00, 'cat': 'Salads',      'description': 'Crispy romaine, parmesan, croutons & classic Caesar dressing'},
        {'name': 'Greek Salad',               'price':  8.50, 'cat': 'Salads',      'description': 'Tomato, cucumber, olives, feta & extra virgin olive oil'},
        {'name': 'Veggie Buddha Bowl',        'price': 10.50, 'cat': 'Salads',      'description': 'Roasted veggies, quinoa, avocado, tahini & mixed greens'},
        {'name': 'Double Espresso',           'price':  3.50, 'cat': 'Beverages',   'description': 'Rich double-shot Arabica espresso, perfectly extracted'},
        {'name': 'Iced Caramel Latte',        'price':  5.50, 'cat': 'Beverages',   'description': 'Cold brew espresso, steamed milk & house caramel drizzle'},
        {'name': 'Fresh Orange Juice',        'price':  4.50, 'cat': 'Beverages',   'description': 'Freshly squeezed Valencia oranges, no added sugar', 'status': 'inactive'},
        {'name': 'Chocolate Muffin',          'price':  3.00, 'cat': 'Snacks',      'description': 'Freshly baked double-chocolate chunk muffin'},
        {'name': 'Margherita Pizza Slice',    'price':  6.00, 'cat': 'Snacks',      'description': 'San Marzano tomato, fresh mozzarella & basil'},
        {'name': 'Acai Berry Bowl',           'price':  8.00, 'cat': 'Desserts',    'description': 'Blended acai, granola, fresh berries & honey drizzle'},
    ]
    menu_items = {}
    for d in menu_data:
        mi = MenuItem.objects.create(
            category=cats[d['cat']],
            name=d['name'],
            description=d.get('description', ''),
            price=Decimal(str(d['price'])),
            status=d.get('status', 'active'),
        )
        menu_items[mi.name] = mi

    # ── Inventory ────────────────────────────────────────────────────────────
    print("Seeding inventory...")
    inventory_data = [
        {'item_name': 'Chicken Breast', 'quantity': 50, 'unit': 'kg',     'min_stock': 10, 'category': 'Protein',    'cost': 8.50},
        {'item_name': 'Beef Patties',   'quantity': 40, 'unit': 'pcs',    'min_stock': 15, 'category': 'Protein',    'cost': 3.00},
        {'item_name': 'Coffee Beans',   'quantity': 25, 'unit': 'kg',     'min_stock':  5, 'category': 'Beverages',  'cost': 12.00},
        {'item_name': 'Milk',           'quantity':  8, 'unit': 'liters', 'min_stock': 20, 'category': 'Dairy',      'cost': 1.20},
        {'item_name': 'Lettuce',        'quantity': 15, 'unit': 'kg',     'min_stock':  5, 'category': 'Vegetables', 'cost': 2.50},
        {'item_name': 'Tomatoes',       'quantity': 20, 'unit': 'kg',     'min_stock':  8, 'category': 'Vegetables', 'cost': 1.80},
        {'item_name': 'Cheese Slices',  'quantity': 200,'unit': 'pcs',    'min_stock': 50, 'category': 'Dairy',      'cost': 0.50},
        {'item_name': 'Potatoes',       'quantity':  5, 'unit': 'kg',     'min_stock': 25, 'category': 'Vegetables', 'cost': 0.80},
        {'item_name': 'Cooking Oil',    'quantity': 30, 'unit': 'liters', 'min_stock': 10, 'category': 'Condiments', 'cost': 3.50},
        {'item_name': 'Sugar',          'quantity': 40, 'unit': 'kg',     'min_stock': 10, 'category': 'Condiments', 'cost': 1.00},
    ]
    for d in inventory_data:
        InventoryItem.objects.create(**d)

    # ── Employees ────────────────────────────────────────────────────────────
    print("Seeding employees...")
    emp_data = [
        {'full_name': 'Ahmed Hassan',  'job_title': 'Head Chef',     'position': 'Head Chef',     'salary': 1500, 'shift': 'Morning',  'hours': '6 AM - 2 PM'},
        {'full_name': 'Sahra Ali',     'job_title': 'Senior Barista','position': 'Senior Barista','salary':  900, 'shift': 'Morning',  'hours': '7 AM - 3 PM'},
        {'full_name': 'Mohamed Farah', 'job_title': 'Waiter',        'position': 'Waiter',        'salary':  600, 'shift': 'Evening',  'hours': '2 PM - 10 PM'},
        {'full_name': 'Hodan Duale',   'job_title': 'Cashier',       'position': 'Cashier',       'salary':  700, 'shift': 'Full Time','hours': '8 AM - 5 PM', 'user': staff_user},
    ]
    employees = []
    for d in emp_data:
        emp = Employee.objects.create(
            full_name=d['full_name'], job_title=d['job_title'],
            position=d['position'],  salary=Decimal(str(d['salary'])),
            shift=d.get('shift',''), hours=d.get('hours',''),
            user=d.get('user'),
        )
        employees.append(emp)

    # ── Salary Records ───────────────────────────────────────────────────────
    print("Seeding salary records...")
    for emp in employees:
        SalaryRecord.objects.create(
            employee=emp,
            base_salary=emp.salary,
            bonus=Decimal('100.00'),
            deduction=Decimal('50.00'),
            payment_date='2026-05-01',
            status='paid',
        )

    # ── Sample Orders ────────────────────────────────────────────────────────
    print("Seeding sample orders...")
    burger = menu_items['Classic Beef Burger']
    coffee = menu_items['Double Espresso']
    salad  = menu_items['Caesar Salad']

    o1 = Order.objects.create(
        employee_name='Ahmed Hassan', payment_method='cash',
        total_price=Decimal('18.50'), status='completed',
    )
    OrderItem.objects.create(order=o1, menu_item=burger, quantity=1, subtotal=Decimal('15.00'))
    OrderItem.objects.create(order=o1, menu_item=coffee, quantity=1, subtotal=Decimal('3.50'))

    o2 = Order.objects.create(
        employee_name='Sahra Ali', payment_method='zaad',
        total_price=Decimal('9.00'), status='pending',
    )
    OrderItem.objects.create(order=o2, menu_item=salad, quantity=1, subtotal=Decimal('9.00'))

    o3 = Order.objects.create(
        employee_name='Mohamed Farah', payment_method='mastercard',
        total_price=Decimal('25.00'), status='completed',
    )
    OrderItem.objects.create(order=o3, menu_item=burger, quantity=1, subtotal=Decimal('15.00'))
    OrderItem.objects.create(order=o3, menu_item=salad,  quantity=1, subtotal=Decimal('9.00'))
    OrderItem.objects.create(order=o3, menu_item=coffee, quantity=1, subtotal=Decimal('3.50'))

    print("\n✅ Database seeding completed!")
    print("   Admin credentials: admin / admin1234")
    print("   Staff credentials: staff / staff1234")


if __name__ == '__main__':
    seed_data()
