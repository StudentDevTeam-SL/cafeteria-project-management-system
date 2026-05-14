from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.db import connection
from django.db.utils import OperationalError
import signal

def health_check(request):
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
        return JsonResponse({"status": "ok", "db": "connected"})
    except OperationalError:
        return JsonResponse({"status": "error", "db": "unreachable"}, status=503)

urlpatterns = [
    path('health/', health_check),
    path('admin/', admin.site.urls),
    path('api/auth/', include('accounts.urls')),
    path('api/employees/', include('employees.urls')),
    path('api/menu/', include('menu.urls')),
    path('api/inventory/', include('inventory.urls')),
    path('api/orders/', include('orders.urls')),
    path('api/salaries/', include('salaries.urls')),      # Fixed: was missing
    path('api/dashboard/', include('analytics.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
