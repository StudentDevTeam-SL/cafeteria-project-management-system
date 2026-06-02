from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Employee
from .serializers import EmployeeSerializer
from accounts.permissions import IsManagerOrAdminOrReadOnly
from config.cache import (
    CACHE_KEY_EMPLOYEES_LIST, CACHE_TTL_LONG, make_cache_key,
    invalidate_employee_caches,
)

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing employee instances.
    Provides a custom action to toggle an employee's active status.
    """
    queryset = Employee.objects.select_related('user').order_by('id')
    serializer_class = EmployeeSerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        cache_key = make_cache_key(CACHE_KEY_EMPLOYEES_LIST, request)
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, CACHE_TTL_LONG)
        return response

    def perform_create(self, serializer):
        super().perform_create(serializer)
        invalidate_employee_caches()

    def perform_update(self, serializer):
        super().perform_update(serializer)
        invalidate_employee_caches()

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        invalidate_employee_caches()

    @action(detail=True, methods=['patch'])
    def toggle(self, request, pk=None):
        """Toggle active/inactive status of an employee."""
        emp = self.get_object()
        emp.status = 'inactive' if emp.status == 'active' else 'active'
        emp.save()
        invalidate_employee_caches()
        return Response({'status': emp.status})
