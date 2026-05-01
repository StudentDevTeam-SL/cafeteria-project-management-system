from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Category, MenuItem
from .serializers import CategorySerializer, MenuItemSerializer


class CategoryViewSet(viewsets.ModelViewSet):
    queryset         = Category.objects.all()
    serializer_class = CategorySerializer


class MenuItemViewSet(viewsets.ModelViewSet):
    queryset         = MenuItem.objects.all()
    serializer_class = MenuItemSerializer

    @action(detail=True, methods=['patch'])
    def toggle(self, request, pk=None):
        """Toggle active/inactive status; return full updated item."""
        item        = self.get_object()
        item.status = 'inactive' if item.status == 'active' else 'active'
        item.save()
        return Response(MenuItemSerializer(item).data)
