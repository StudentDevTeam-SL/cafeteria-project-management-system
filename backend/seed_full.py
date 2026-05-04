"""
seed_full.py — Big data seed. Safe to run multiple times (uses get_or_create).
Usage:
    python seed_full.py          # adds data only if DB is empty
    python seed_full.py --force  # wipes everything and re-seeds
"""
import os, sys, django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from menu.models import MenuItem, Category
from inventory.models import InventoryItem
from employees.models import Employee
from accounts.models import CustomUser
from orders.models import Order, OrderItem
from salaries.models import SalaryRecord

FORCE = '--force' in sys.argv

has_data = (
    MenuItem.objects.exists() or
    Order.objects.exists() or
    InventoryItem.objects.exists()
)

if has_data and not FORCE:
    print("✅ Database already has data — not overwriting.")
    print(f"   Menu items : {MenuItem.objects.count()}")
    print(f"   Orders     : {Order.objects.count()}")
    print(f"   Inventory  : {InventoryItem.objects.count()}")
    print(f"   Employees  : {Employee.objects.count()}")
    print("\nRun with --force to wipe and re-seed:")
    print("   python seed_full.py --force")
    sys.exit(0)

if FORCE:
    print("Clearing all data...")
    SalaryRecord.objects.all().delete()
    OrderItem.objects.all().delete()
    Order.objects.all().delete()
    MenuItem.objects.all().delete()
    Category.objects.all().delete()
    InventoryItem.objects.all().delete()
    Employee.objects.all().delete()
    CustomUser.objects.filter(username__in=['admin', 'employee']).delete()

print("Seeding database with big data...\n")

# ── USERS ─────────────────────────────────────────────────────────────────────
print("Users...")
admin_user, c = CustomUser.objects.get_or_create(
    username='admin',
    defaults={'email':'admin@cafeteria.com','role':'Admin','is_staff':True,
              'is_superuser':True,'first_name':'Admin','last_name':'User'}
)
if c: admin_user.set_password('admin'); admin_user.save(); print("  Created: admin / admin")
else: print("  Exists:  admin")

emp_user, c = CustomUser.objects.get_or_create(
    username='employee',
    defaults={'email':'employee@cafeteria.com','role':'Staff',
              'first_name':'Staff','last_name':'Member'}
)
if c: emp_user.set_password('1234'); emp_user.save(); print("  Created: employee / 1234")
else: print("  Exists:  employee")

# ── CATEGORIES ────────────────────────────────────────────────────────────────
print("\nCategories...")
cat_names = ['Main Course', 'Beverages', 'Salads', 'Snacks', 'Desserts']
cats = {}
for name in cat_names:
    cat, _ = Category.objects.get_or_create(name=name)
    cats[name] = cat
print(f"  {len(cats)} categories ready")

# ── MENU ITEMS (25) ───────────────────────────────────────────────────────────
print("\nMenu Items (25)...")
menu_data = [
    # ── Main Course (8) ──────────────────────────────────────────────────────
    {'name':'Grilled Chicken Sandwich', 'price':12.50,'cat':'Main Course','description':'Juicy grilled chicken, fresh lettuce & tomato on toasted brioche', 'image': 'https://images.unsplash.com/photo-1521390188846-e2a3a97453a0?auto=format&fit=crop&w=800&q=80'},
    {'name':'Classic Beef Burger',      'price':15.00,'cat':'Main Course','description':'Premium beef patty, cheddar, caramelised onions & house sauce', 'image': 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'},
    {'name':'Pasta Carbonara',          'price':11.25,'cat':'Main Course','description':'Al dente penne, crispy bacon, egg yolk & pecorino romano', 'image': 'https://images.unsplash.com/photo-1612874687561-1e96a40ce80b?auto=format&fit=crop&w=800&q=80'},
    {'name':'Eggs Benedict',            'price':13.00,'cat':'Main Course','description':'Poached eggs, Canadian bacon, hollandaise on English muffin', 'image': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80'},
    {'name':'Fried Rice Bowl',          'price': 9.50,'cat':'Main Course','description':'Jasmine rice, seasonal vegetables, soy & sesame', 'image': 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'},
    {'name':'Lamb Kebab Plate',         'price':18.00,'cat':'Main Course','description':'Marinated lamb skewers, saffron rice & grilled vegetables', 'image': 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80'},
    {'name':'Fish & Chips',            'price':14.50,'cat':'Main Course','description':'Beer-battered cod fillet, chunky chips & tartare sauce', 'image': 'https://images.unsplash.com/photo-1599084949512-5eb1b0028fc7?auto=format&fit=crop&w=800&q=80'},
    {'name':'Veggie Wrap',             'price':10.00,'cat':'Main Course','description':'Grilled peppers, hummus, avocado & mixed greens in a whole-wheat wrap', 'image': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80'},
    # ── Salads (4) ───────────────────────────────────────────────────────────
    {'name':'Caesar Salad',            'price': 9.00,'cat':'Salads','description':'Crispy romaine, parmesan, croutons & classic Caesar dressing', 'image': 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=800&q=80'},
    {'name':'Greek Salad',             'price': 8.50,'cat':'Salads','description':'Tomato, cucumber, olives, feta & extra virgin olive oil', 'image': 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80'},
    {'name':'Veggie Buddha Bowl',      'price':10.50,'cat':'Salads','description':'Roasted veggies, quinoa, avocado, tahini & mixed greens', 'image': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80'},
    {'name':'Tuna Nicoise Salad',      'price':11.00,'cat':'Salads','description':'Seared tuna, green beans, olives, egg & Dijon vinaigrette', 'image': 'https://images.unsplash.com/photo-1623428187969-5da2dcea5ebf?auto=format&fit=crop&w=800&q=80'},
    # ── Beverages (6) ────────────────────────────────────────────────────────
    {'name':'Double Espresso',         'price': 3.50,'cat':'Beverages','description':'Rich double-shot Arabica espresso', 'image': 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?auto=format&fit=crop&w=800&q=80'},
    {'name':'Iced Caramel Latte',      'price': 5.50,'cat':'Beverages','description':'Cold brew espresso, steamed milk & house caramel drizzle', 'image': 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80'},
    {'name':'Fresh Orange Juice',      'price': 4.50,'cat':'Beverages','description':'Freshly squeezed Valencia oranges','status':'inactive', 'image': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80'},
    {'name':'Mango Smoothie',          'price': 5.00,'cat':'Beverages','description':'Fresh mango, banana, yoghurt & honey', 'image': 'https://images.unsplash.com/photo-1553530666-ba11a7dd0dc0?auto=format&fit=crop&w=800&q=80'},
    {'name':'Mint Lemonade',           'price': 4.00,'cat':'Beverages','description':'Fresh mint, lemon, sparkling water & agave syrup', 'image': 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80'},
    {'name':'Hot Chocolate',           'price': 4.50,'cat':'Beverages','description':'Rich Belgian chocolate, steamed milk & whipped cream', 'image': 'https://images.unsplash.com/photo-1544787219-7f47ccb7fae6?auto=format&fit=crop&w=800&q=80'},
    # ── Snacks (4) ───────────────────────────────────────────────────────────
    {'name':'Chocolate Muffin',        'price': 3.00,'cat':'Snacks','description':'Freshly baked double-chocolate chunk muffin', 'image': 'https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?auto=format&fit=crop&w=800&q=80'},
    {'name':'Margherita Pizza Slice',  'price': 6.00,'cat':'Snacks','description':'San Marzano tomato, fresh mozzarella & basil', 'image': 'https://images.unsplash.com/photo-1573821663912-569905455b1c?auto=format&fit=crop&w=800&q=80'},
    {'name':'Garlic Bread',            'price': 2.50,'cat':'Snacks','description':'Toasted sourdough, herb butter & roasted garlic', 'image': 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=800&q=80'},
    {'name':'Chicken Wings (6pc)',     'price': 9.00,'cat':'Snacks','description':'Crispy baked wings, buffalo sauce & blue cheese dip', 'image': 'https://images.unsplash.com/photo-1569691899455-88464f6d3ab1?auto=format&fit=crop&w=800&q=80'},
    # ── Desserts (3) ─────────────────────────────────────────────────────────
    {'name':'Acai Berry Bowl',         'price': 8.00,'cat':'Desserts','description':'Blended acai, granola, fresh berries & honey drizzle', 'image': 'https://images.unsplash.com/photo-1590301157890-4810ed35a4d7?auto=format&fit=crop&w=800&q=80'},
    {'name':'Chocolate Lava Cake',     'price': 7.50,'cat':'Desserts','description':'Warm chocolate cake with molten centre & vanilla ice cream', 'image': 'https://images.unsplash.com/photo-1624353365286-3f8d62daad51?auto=format&fit=crop&w=800&q=80'},
    {'name':'Tiramisu',                'price': 7.00,'cat':'Desserts','description':'Classic Italian mascarpone dessert with espresso & cocoa', 'image': 'https://images.unsplash.com/photo-1571115177098-24ec42ed204d?auto=format&fit=crop&w=800&q=80'},
]
menu_items = {}
for d in menu_data:
    mi, created = MenuItem.objects.get_or_create(
        name=d['name'],
        defaults={
            'category': cats[d['cat']],
            'description': d.get('description',''),
            'price': Decimal(str(d['price'])),
            'status': d.get('status','active'),
            'image': d.get('image', ''),
        }
    )
    menu_items[mi.name] = mi
print(f"  {MenuItem.objects.count()} menu items ready")

# ── INVENTORY (20 items) ──────────────────────────────────────────────────────
print("\nInventory (20 items)...")
inv_data = [
    {'item_name':'Chicken Breast',  'quantity':50, 'unit':'kg',    'min_stock':10,'category':'Protein',   'cost':8.50},
    {'item_name':'Beef Patties',    'quantity':40, 'unit':'pcs',   'min_stock':15,'category':'Protein',   'cost':3.00},
    {'item_name':'Lamb Shoulder',   'quantity':20, 'unit':'kg',    'min_stock': 5,'category':'Protein',   'cost':14.00},
    {'item_name':'Fresh Cod Fillet','quantity':15, 'unit':'kg',    'min_stock': 5,'category':'Protein',   'cost':11.00},
    {'item_name':'Eggs',            'quantity':120,'unit':'pcs',   'min_stock':30,'category':'Protein',   'cost':0.25},
    {'item_name':'Coffee Beans',    'quantity':25, 'unit':'kg',    'min_stock': 5,'category':'Beverages', 'cost':12.00},
    {'item_name':'Mango Pulp',      'quantity':10, 'unit':'liters','min_stock': 5,'category':'Beverages', 'cost':4.50},
    {'item_name':'Oranges',         'quantity':30, 'unit':'kg',    'min_stock':10,'category':'Beverages', 'cost':2.00},
    {'item_name':'Milk',            'quantity': 8, 'unit':'liters','min_stock':20,'category':'Dairy',     'cost':1.20},
    {'item_name':'Cheese Slices',   'quantity':200,'unit':'pcs',   'min_stock':50,'category':'Dairy',     'cost':0.50},
    {'item_name':'Butter',          'quantity': 4, 'unit':'kg',    'min_stock':10,'category':'Dairy',     'cost':6.00},
    {'item_name':'Mozzarella',      'quantity':12, 'unit':'kg',    'min_stock': 5,'category':'Dairy',     'cost':9.50},
    {'item_name':'Lettuce',         'quantity':15, 'unit':'kg',    'min_stock': 5,'category':'Vegetables','cost':2.50},
    {'item_name':'Tomatoes',        'quantity':20, 'unit':'kg',    'min_stock': 8,'category':'Vegetables','cost':1.80},
    {'item_name':'Potatoes',        'quantity': 5, 'unit':'kg',    'min_stock':25,'category':'Vegetables','cost':0.80},
    {'item_name':'Bell Peppers',    'quantity':12, 'unit':'kg',    'min_stock': 4,'category':'Vegetables','cost':3.20},
    {'item_name':'Flour',           'quantity': 3, 'unit':'kg',    'min_stock':15,'category':'Grains',    'cost':1.20},
    {'item_name':'Rice',            'quantity':60, 'unit':'kg',    'min_stock':10,'category':'Grains',    'cost':0.90},
    {'item_name':'Cooking Oil',     'quantity':30, 'unit':'liters','min_stock':10,'category':'Condiments','cost':3.50},
    {'item_name':'Sugar',           'quantity':40, 'unit':'kg',    'min_stock':10,'category':'Condiments','cost':1.00},
]
for d in inv_data:
    InventoryItem.objects.get_or_create(item_name=d['item_name'], defaults=d)
print(f"  {InventoryItem.objects.count()} inventory items ready")

# ── EMPLOYEES (10) ────────────────────────────────────────────────────────────
print("\nEmployees (10)...")
emp_data = [
    {'full_name':'Ahmed Hassan',   'job_title':'Head Chef',        'salary':1800,'shift':'Morning',  'hours':'06:00 - 14:00','status':'active',  'phone':'+252 63 100 0001'},
    {'full_name':'Sahra Ali',      'job_title':'Senior Barista',   'salary':1100,'shift':'Morning',  'hours':'07:00 - 15:00','status':'active',  'phone':'+252 63 100 0002'},
    {'full_name':'Mohamed Farah',  'job_title':'Waiter',           'salary': 750,'shift':'Evening',  'hours':'14:00 - 22:00','status':'active',  'phone':'+252 63 100 0003'},
    {'full_name':'Hodan Duale',    'job_title':'Cashier',          'salary': 850,'shift':'Full Time','hours':'08:00 - 17:00','status':'active',  'phone':'+252 63 100 0004','user':emp_user},
    {'full_name':'Khalid Warsame', 'job_title':'Line Cook',        'salary': 800,'shift':'Morning',  'hours':'06:00 - 14:00','status':'active',  'phone':'+252 63 100 0005'},
    {'full_name':'Amina Mohamud',  'job_title':'Kitchen Helper',   'salary': 600,'shift':'Evening',  'hours':'14:00 - 22:00','status':'inactive','phone':'+252 63 100 0006'},
    {'full_name':'Hassan Abdi',    'job_title':'Sous Chef',        'salary':1400,'shift':'Morning',  'hours':'06:00 - 14:00','status':'active',  'phone':'+252 63 100 0007'},
    {'full_name':'Faadumo Omar',   'job_title':'Waitress',         'salary': 700,'shift':'Evening',  'hours':'14:00 - 22:00','status':'active',  'phone':'+252 63 100 0008'},
    {'full_name':'Abdi Jama',      'job_title':'Dishwasher',       'salary': 500,'shift':'Night',    'hours':'22:00 - 06:00','status':'active',  'phone':'+252 63 100 0009'},
    {'full_name':'Nasteho Muuse',  'job_title':'Pastry Chef',      'salary':1200,'shift':'Morning',  'hours':'05:00 - 13:00','status':'active',  'phone':'+252 63 100 0010'},
]
employees = []
for d in emp_data:
    emp, c = Employee.objects.get_or_create(
        full_name=d['full_name'],
        defaults={
            'job_title':d['job_title'], 'position':d['job_title'],
            'salary':Decimal(str(d['salary'])), 'shift':d.get('shift',''),
            'hours':d.get('hours',''), 'status':d.get('status','active'),
            'phone':d.get('phone',''), 'user':d.get('user'),
        }
    )
    employees.append(emp)
print(f"  {Employee.objects.count()} employees ready")

# ── SALARY RECORDS ────────────────────────────────────────────────────────────
print("\nSalary Records...")
months = [
    ('2026-03-31', 'paid'),
    ('2026-04-30', 'paid'),
    ('2026-05-01', 'pending'),
]
for emp in employees:
    for pay_date, status in months:
        SalaryRecord.objects.get_or_create(
            employee=emp, payment_date=pay_date,
            defaults={
                'base_salary': emp.salary,
                'bonus':       Decimal('150.00'),
                'deduction':   Decimal('50.00'),
                'status':      status,
            }
        )
print(f"  {SalaryRecord.objects.count()} salary records ready")

# ── ORDERS (25) ───────────────────────────────────────────────────────────────
print("\nOrders (25)...")
if not Order.objects.exists():
    mi = menu_items
    orders_raw = [
        {'emp':'Ahmed Hassan',   'method':'cash',       'status':'completed',  'items':[('Classic Beef Burger',1),('Double Espresso',2)]},
        {'emp':'Sahra Ali',      'method':'zaad',       'status':'completed',  'items':[('Caesar Salad',1),('Iced Caramel Latte',1)]},
        {'emp':'Mohamed Farah',  'method':'mastercard', 'status':'completed',  'items':[('Pasta Carbonara',1),('Double Espresso',1),('Chocolate Muffin',2)]},
        {'emp':'Hodan Duale',    'method':'paypal',     'status':'completed',  'items':[('Grilled Chicken Sandwich',2),('Iced Caramel Latte',1)]},
        {'emp':'Khalid Warsame', 'method':'cash',       'status':'completed',  'items':[('Fried Rice Bowl',1),('Double Espresso',1)]},
        {'emp':'Ahmed Hassan',   'method':'cash',       'status':'processing', 'items':[('Classic Beef Burger',2),('Caesar Salad',1)]},
        {'emp':'Sahra Ali',      'method':'zaad',       'status':'pending',    'items':[('Iced Caramel Latte',2),('Chocolate Muffin',1)]},
        {'emp':'Mohamed Farah',  'method':'cash',       'status':'completed',  'items':[('Margherita Pizza Slice',3),('Double Espresso',1)]},
        {'emp':'Hodan Duale',    'method':'mastercard', 'status':'completed',  'items':[('Pasta Carbonara',1),('Chocolate Lava Cake',1)]},
        {'emp':'Khalid Warsame', 'method':'paypal',     'status':'cancelled',  'items':[('Grilled Chicken Sandwich',1),('Caesar Salad',1)]},
        {'emp':'Ahmed Hassan',   'method':'cash',       'status':'completed',  'items':[('Classic Beef Burger',1),('Iced Caramel Latte',1),('Chocolate Lava Cake',1)]},
        {'emp':'Sahra Ali',      'method':'zaad',       'status':'completed',  'items':[('Fried Rice Bowl',2),('Double Espresso',2)]},
        {'emp':'Hassan Abdi',    'method':'cash',       'status':'completed',  'items':[('Lamb Kebab Plate',1),('Mint Lemonade',2)]},
        {'emp':'Faadumo Omar',   'method':'mastercard', 'status':'completed',  'items':[('Fish & Chips',1),('Hot Chocolate',1)]},
        {'emp':'Nasteho Muuse',  'method':'zaad',       'status':'completed',  'items':[('Tiramisu',2),('Double Espresso',2)]},
        {'emp':'Abdi Jama',      'method':'cash',       'status':'completed',  'items':[('Veggie Wrap',1),('Mango Smoothie',1)]},
        {'emp':'Hassan Abdi',    'method':'paypal',     'status':'completed',  'items':[('Tuna Nicoise Salad',1),('Mint Lemonade',1)]},
        {'emp':'Faadumo Omar',   'method':'cash',       'status':'processing', 'items':[('Chicken Wings (6pc)',2),('Hot Chocolate',1)]},
        {'emp':'Mohamed Farah',  'method':'mastercard', 'status':'completed',  'items':[('Garlic Bread',2),('Greek Salad',1),('Double Espresso',1)]},
        {'emp':'Khalid Warsame', 'method':'cash',       'status':'completed',  'items':[('Eggs Benedict',1),('Iced Caramel Latte',1)]},
        {'emp':'Ahmed Hassan',   'method':'zaad',       'status':'completed',  'items':[('Classic Beef Burger',3),('Chocolate Muffin',2)]},
        {'emp':'Sahra Ali',      'method':'paypal',     'status':'pending',    'items':[('Acai Berry Bowl',1),('Hot Chocolate',2)]},
        {'emp':'Nasteho Muuse',  'method':'cash',       'status':'completed',  'items':[('Tiramisu',1),('Chocolate Lava Cake',1),('Double Espresso',1)]},
        {'emp':'Hodan Duale',    'method':'mastercard', 'status':'cancelled',  'items':[('Fish & Chips',1),('Greek Salad',1)]},
        {'emp':'Hassan Abdi',    'method':'cash',       'status':'completed',  'items':[('Lamb Kebab Plate',2),('Mint Lemonade',2),('Tiramisu',1)]},
    ]
    for od in orders_raw:
        items_objs = [(mi[name], qty) for name, qty in od['items'] if name in mi]
        if not items_objs:
            continue
        total = sum(Decimal(str(item.price)) * qty for item, qty in items_objs)
        order = Order.objects.create(
            employee_name=od['emp'],
            payment_method=od['method'],
            status=od['status'],
            total_price=total,
        )
        for item, qty in items_objs:
            OrderItem.objects.create(
                order=order, menu_item=item,
                quantity=qty, subtotal=Decimal(str(item.price)) * qty,
            )
else:
    print(f"  Skipped — orders already exist ({Order.objects.count()})")

# ── FINAL SUMMARY ─────────────────────────────────────────────────────────────
print("\n" + "="*52)
print("  DATABASE READY")
print("="*52)
print(f"  Menu items  : {MenuItem.objects.count()}")
print(f"  Inventory   : {InventoryItem.objects.count()}")
print(f"  Employees   : {Employee.objects.count()}")
print(f"  Orders      : {Order.objects.count()}")
print(f"  Salaries    : {SalaryRecord.objects.count()}")
revenue = sum(float(o.total_price) for o in Order.objects.filter(status='completed'))
print(f"  Revenue     : ${revenue:,.2f}  (completed orders)")
print("="*52)
print("  Login: admin / admin   |   employee / 1234")
print("="*52)
