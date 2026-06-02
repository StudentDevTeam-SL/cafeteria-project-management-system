from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order, Table
from .serializers import OrderSerializer, TableSerializer
from accounts.permissions import IsAdminOrDeleteDenied
from config.cache import (
    CACHE_KEY_ORDERS_LIST, CACHE_TTL_SHORT, make_cache_key,
    invalidate_order_caches,
)

class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing order instances.
    Provides a custom action to update an order's status.
    """
    queryset = Order.objects.select_related('user').prefetch_related('items__menu_item').order_by('-id')
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrDeleteDenied]

    def list(self, request, *args, **kwargs):
        cache_key = make_cache_key(CACHE_KEY_ORDERS_LIST, request)
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, CACHE_TTL_SHORT)
        return response

    def perform_create(self, serializer):
        super().perform_create(serializer)
        invalidate_order_caches()

    def perform_update(self, serializer):
        super().perform_update(serializer)
        invalidate_order_caches()

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        invalidate_order_caches()

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        """Update the status of an existing order."""
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            invalidate_order_caches()
            return Response({'status': order.status})
        return Response({'error': 'Invalid status'}, status=400)


class TableViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing table instances.
    """
    queryset = Table.objects.all().order_by('table_number')
    serializer_class = TableSerializer
    permission_classes = [IsAdminOrDeleteDenied]
