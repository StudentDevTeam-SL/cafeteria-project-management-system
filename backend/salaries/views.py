from django.core.cache import cache
from rest_framework import viewsets
from rest_framework.response import Response
from .models import SalaryRecord
from .serializers import SalaryRecordSerializer
from accounts.permissions import IsManagerOrAdmin
from config.cache import (
    CACHE_KEY_SALARIES_LIST, CACHE_TTL_LONG, make_cache_key,
    invalidate_salary_caches,
)

class SalaryRecordViewSet(viewsets.ModelViewSet):
    queryset = SalaryRecord.objects.select_related('employee').order_by('-id')
    serializer_class = SalaryRecordSerializer
    permission_classes = [IsManagerOrAdmin]

    def list(self, request, *args, **kwargs):
        cache_key = make_cache_key(CACHE_KEY_SALARIES_LIST, request)
        cached = cache.get(cache_key)
        if cached is not None:
            return Response(cached)
        response = super().list(request, *args, **kwargs)
        cache.set(cache_key, response.data, CACHE_TTL_LONG)
        return response

    def perform_create(self, serializer):
        super().perform_create(serializer)
        invalidate_salary_caches()

    def perform_update(self, serializer):
        super().perform_update(serializer)
        invalidate_salary_caches()

    def perform_destroy(self, instance):
        super().perform_destroy(instance)
        invalidate_salary_caches()
