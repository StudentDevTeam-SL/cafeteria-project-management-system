import json
from collections import OrderedDict

from django.apps import apps
from django.core import serializers
from django.core.cache import cache
from django.db import transaction
from django.db.models import Count, F, Sum
from django.utils import timezone
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from accounts.models import CustomUser, LoginActivity
from accounts.permissions import IsAdminRole, IsManagerOrAdmin
from config.cache import (
    CACHE_KEY_BACKUP_TABLES, CACHE_KEY_DASHBOARD_NOTIFICATIONS,
    CACHE_KEY_DASHBOARD_STATS, CACHE_TTL_MEDIUM, CACHE_TTL_NOTIFICATIONS,
    CACHE_TTL_SHORT, make_cache_key,
)
from .models import SystemNotification


BACKUP_TABLES = OrderedDict([
    ('users', ('accounts', 'CustomUser', 'Users')),
    ('employees', ('employees', 'Employee', 'Employees')),
    ('categories', ('menu', 'Category', 'Menu Categories')),
    ('menu_items', ('menu', 'MenuItem', 'Menu Items')),
    ('contact_messages', ('menu', 'ContactMessage', 'Contact Messages')),
    ('newsletter_subscriptions', ('menu', 'NewsletterSubscription', 'Newsletter Subscriptions')),
    ('job_applications', ('menu', 'JobApplication', 'Job Applications')),
    ('inventory_items', ('inventory', 'InventoryItem', 'Inventory Items')),
    ('tables', ('orders', 'Table', 'Dining Tables')),
    ('orders', ('orders', 'Order', 'Orders')),
    ('order_items', ('orders', 'OrderItem', 'Order Items')),
    ('salaries', ('salaries', 'SalaryRecord', 'Salary Records')),
    ('login_activity', ('accounts', 'LoginActivity', 'Login Activity')),
    ('notifications', ('analytics', 'SystemNotification', 'Notifications')),
])


def get_backup_model(key):
    app_label, model_name, _ = BACKUP_TABLES[key]
    return apps.get_model(app_label, model_name)


def compact_datetime(value):
    if not value:
        return None
    return value.isoformat()


class DashboardStatsView(APIView):
    def get(self, request):
        # Check cache first
        cached = cache.get(CACHE_KEY_DASHBOARD_STATS)
        if cached is not None:
            return Response(cached)

        from employees.models import Employee
        from inventory.models import InventoryItem
        from menu.models import JobApplication
        from orders.models import Order

        revenue = (
            Order.objects
            .filter(status='completed')
            .aggregate(total=Sum('total_price'))['total'] or 0
        )
        orders_count = Order.objects.count()
        staff_count = Employee.objects.filter(status='active').count()

        low_stock_count = InventoryItem.objects.filter(
            quantity__lte=F('min_stock')
        ).count()

        employee_status = [
            {'name': row['status'].title(), 'value': row['value']}
            for row in Employee.objects.values('status').annotate(value=Count('id')).order_by('status')
        ]
        role_breakdown = [
            {'name': row['role'] or 'Unknown', 'value': row['value']}
            for row in CustomUser.objects.values('role').annotate(value=Count('id')).order_by('role')
        ]
        job_pipeline = [
            {'name': row['status'].title(), 'value': row['value']}
            for row in JobApplication.objects.values('status').annotate(value=Count('id')).order_by('status')
        ]
        login_activity = [
            {
                'id': item.id,
                'username': item.username,
                'full_name': item.user.full_name,
                'role': item.role,
                'login_at': compact_datetime(item.login_at),
                'logout_at': compact_datetime(item.logout_at),
                'status': item.status,
                'duration_seconds': item.duration_seconds,
            }
            for item in LoginActivity.objects.select_related('user').order_by('-login_at')[:8]
        ]

        notification_count = (
            JobApplication.objects.filter(status='new').count()
            + InventoryItem.objects.filter(quantity__lte=F('min_stock')).count()
            + Order.objects.filter(status='pending').count()
            + SystemNotification.objects.filter(is_active=True).filter(
                audience__in=['all', getattr(request.user, 'role', '')]
            ).count()
        )

        data = {
            'revenue': float(revenue),
            'orders': orders_count,
            'staff': staff_count,
            'lowStock': low_stock_count,
            'employeeStatus': employee_status,
            'roleBreakdown': role_breakdown,
            'jobPipeline': job_pipeline,
            'loginActivity': login_activity,
            'notificationCount': notification_count,
        }
        cache.set(CACHE_KEY_DASHBOARD_STATS, data, CACHE_TTL_SHORT)
        return Response(data)


class DashboardNotificationsView(APIView):
    permission_classes = [IsManagerOrAdmin]

    def get(self, request):
        user_role = getattr(request.user, 'role', '')
        cache_key = make_cache_key(CACHE_KEY_DASHBOARD_NOTIFICATIONS, extra=user_role)
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)

        from inventory.models import InventoryItem
        from menu.models import ContactMessage, JobApplication, NewsletterSubscription
        from orders.models import Order

        now = timezone.now()
        user_role = getattr(request.user, 'role', '')
        notifications = []

        for item in SystemNotification.objects.filter(
            is_active=True,
            audience__in=['all', user_role],
        ).order_by('-created_at')[:20]:
            notifications.append({
                'id': f'notification-{item.id}',
                'title': item.title,
                'message': item.message,
                'severity': item.severity,
                'source': item.source or 'system',
                'source_id': item.source_id,
                'created_at': compact_datetime(item.created_at),
                'href': None,
            })

        for message in ContactMessage.objects.order_by('-created_at')[:5]:
            notifications.append({
                'id': f'contact-{message.id}',
                'title': f'Contact message: {message.subject}',
                'message': f'{message.name} ({message.email}) wrote: {message.message[:160]}',
                'severity': 'info',
                'source': 'contact_message',
                'source_id': message.id,
                'created_at': compact_datetime(message.created_at),
                'href': '/contact-messages',
            })

        for application in JobApplication.objects.filter(status__in=['new', 'reviewing']).order_by('-created_at')[:5]:
            notifications.append({
                'id': f'job-{application.id}',
                'title': f'Job application: {application.position}',
                'message': f'{application.first_name} {application.last_name} is {application.status}. Phone: {application.phone}',
                'severity': 'warning' if application.status == 'new' else 'info',
                'source': 'job_application',
                'source_id': application.id,
                'created_at': compact_datetime(application.created_at),
                'href': '/admin/jobs',
            })

        for item in InventoryItem.objects.filter(quantity__lte=F('min_stock')).order_by('quantity')[:5]:
            notifications.append({
                'id': f'inventory-{item.id}',
                'title': f'Low stock: {item.item_name}',
                'message': f'{item.quantity} {item.unit} remaining. Minimum stock is {item.min_stock}.',
                'severity': 'danger',
                'source': 'inventory',
                'source_id': item.id,
                'created_at': compact_datetime(item.updated_at),
                'href': '/inventory',
            })

        pending_orders = Order.objects.filter(status='pending').order_by('-created_at')[:5]
        for order in pending_orders:
            notifications.append({
                'id': f'order-{order.id}',
                'title': f'Pending order #{order.id}',
                'message': f'{order.employee_name or order.customer_name or "Customer"} has an unpaid or pending order worth ${order.total_price}.',
                'severity': 'warning',
                'source': 'order',
                'source_id': order.id,
                'created_at': compact_datetime(order.created_at),
                'href': '/orders',
            })

        recent_newsletter = NewsletterSubscription.objects.order_by('-created_at')[:3]
        for subscription in recent_newsletter:
            notifications.append({
                'id': f'newsletter-{subscription.id}',
                'title': 'New newsletter subscription',
                'message': subscription.email,
                'severity': 'success',
                'source': 'newsletter_subscription',
                'source_id': subscription.id,
                'created_at': compact_datetime(subscription.created_at),
                'href': '/system/messages',
            })

        notifications.sort(key=lambda item: item.get('created_at') or now.isoformat(), reverse=True)
        data = {
            'count': len(notifications),
            'notifications': notifications[:30],
        }
        cache.set(cache_key, data, CACHE_TTL_NOTIFICATIONS)
        return Response(data)


class BackupTablesView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request):
        cached = cache.get(CACHE_KEY_BACKUP_TABLES)
        if cached is not None:
            return Response(cached)

        tables = []
        for key, (_, _, label) in BACKUP_TABLES.items():
            model = get_backup_model(key)
            tables.append({
                'key': key,
                'label': label,
                'count': model.objects.count(),
            })
        data = {'tables': tables}
        cache.set(CACHE_KEY_BACKUP_TABLES, data, CACHE_TTL_MEDIUM)
        return Response(data)


class BackupExportView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, request):
        selected = request.data.get('tables') or list(BACKUP_TABLES.keys())
        selected = [key for key in selected if key in BACKUP_TABLES]
        if not selected:
            return Response({'error': 'Select at least one table to export.'}, status=400)

        objects = {}
        counts = {}
        for key in selected:
            queryset = get_backup_model(key).objects.all()
            objects[key] = json.loads(serializers.serialize('json', queryset))
            counts[key] = queryset.count()

        return Response({
            'version': 1,
            'exported_at': compact_datetime(timezone.now()),
            'tables': selected,
            'counts': counts,
            'objects': objects,
        })


class BackupRestoreView(APIView):
    permission_classes = [IsAdminRole]
    parser_classes = [JSONParser, MultiPartParser, FormParser]

    def post(self, request):
        backup = request.data.get('backup')
        if not backup and request.FILES.get('file'):
            backup = json.loads(request.FILES['file'].read().decode('utf-8'))
        if isinstance(backup, str):
            backup = json.loads(backup)
        if not isinstance(backup, dict) or 'objects' not in backup:
            return Response({'error': 'Upload a valid backup JSON file.'}, status=400)

        backup_objects = backup.get('objects') or {}
        selected = request.data.get('tables') or backup.get('tables') or list(backup_objects.keys())
        selected = [key for key in BACKUP_TABLES.keys() if key in selected and key in backup_objects]
        if not selected:
            return Response({'error': 'Select at least one table to restore.'}, status=400)

        restored = {}
        with transaction.atomic():
            for key in selected:
                raw_objects = backup_objects.get(key) or []
                for obj in serializers.deserialize('json', json.dumps(raw_objects), ignorenonexistent=True):
                    obj.save()
                restored[key] = len(raw_objects)

        return Response({
            'message': 'Database data restored successfully.',
            'restored': restored,
        })
