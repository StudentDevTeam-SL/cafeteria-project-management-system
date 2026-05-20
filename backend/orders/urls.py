from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import OrderViewSet, TableViewSet

router = DefaultRouter()
router.register(r'tables', TableViewSet, basename='tables')
router.register(r'', OrderViewSet, basename='orders')

urlpatterns = [
    path('', include(router.urls)),
]
