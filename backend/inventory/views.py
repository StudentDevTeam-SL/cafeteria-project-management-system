from rest_framework import viewsets
from .models import InventoryItem
from .serializers import InventoryItemSerializer
from accounts.permissions import IsManagerOrAdminOrReadOnly

class InventoryItemViewSet(viewsets.ModelViewSet):
    queryset = InventoryItem.objects.all().order_by('id')
    serializer_class = InventoryItemSerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]
