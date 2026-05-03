from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryViewSet, MenuItemViewSet, ContactMessageViewSet

router = DefaultRouter()
router.register(r'contact-messages', ContactMessageViewSet, basename='contactmessage')
router.register(r'categories', CategoryViewSet)
router.register(r'', MenuItemViewSet, basename='menuitem')

urlpatterns = [
    path('', include(router.urls)),
]
