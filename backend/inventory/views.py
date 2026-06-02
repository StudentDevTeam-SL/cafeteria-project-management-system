from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.response import Response
from .models import InventoryItem
from .serializers import InventoryItemSerializer
from accounts.permissions import IsManagerOrAdminOrReadOnly
from config.cache import (
    CACHE_KEY_INVENTORY_LIST, CACHE_TTL_MEDIUM, make_cache_key,
    invalidate_inventory_caches,
)

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('id')
    serializer_class = InventoryItemSerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]

    def list(self, request, *args, **kwargs):
        cache_key = make_cache_key(CACHE_KEY_INVENTORY_LIST, request)
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, CACHE_TTL_MEDIUM)
        return response

    def perform_create(self, serializer):
        super().perform_create(serializer)
        invalidate_inventory_caches()

    def perform_update(self, serializer):
        super().perform_update(serializer)
        invalidate_inventory_caches()

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        invalidate_inventory_caches()
