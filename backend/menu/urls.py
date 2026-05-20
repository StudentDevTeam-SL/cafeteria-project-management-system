from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoryViewSet, MenuItemViewSet, ContactMessageViewSet,
    RecipeViewSet, ModifierGroupViewSet, ModifierOptionViewSet
)

router = DefaultRouter()
router.register(r'contact-messages', ContactMessageViewSet, basename='contactmessage')
router.register(r'categories', CategoryViewSet)
router.register(r'recipes', RecipeViewSet, basename='recipes')
router.register(r'modifier-groups', ModifierGroupViewSet, basename='modifier-groups')
router.register(r'modifier-options', ModifierOptionViewSet, basename='modifier-options')
router.register(r'', MenuItemViewSet, basename='menuitem')

urlpatterns = [
    path('', include(router.urls)),
]
