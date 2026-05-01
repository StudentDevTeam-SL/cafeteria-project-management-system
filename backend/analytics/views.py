from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, F


class DashboardStatsView(APIView):
    def get(self, request):
        from orders.models import Order
        from employees.models import Employee
        from inventory.models import InventoryItem

        revenue = (
            Order.objects
            .filter(status='completed')
            .aggregate(total=Sum('total_price'))['total'] or 0
        )
        orders_count  = Order.objects.count()
        staff_count   = Employee.objects.filter(status='active').count()

        # Efficient DB-level low-stock check instead of Python loop
        low_stock_count = InventoryItem.objects.filter(
            quantity__lte=F('min_stock')
        ).count()

        return Response({
            'revenue':  float(revenue),
            'orders':   orders_count,
            'staff':    staff_count,
            'lowStock': low_stock_count,
        })
