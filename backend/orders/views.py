from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer
from accounts.permissions import IsAdminOrDeleteDenied

class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing order instances.
    Provides a custom action to update an order's status.
    """
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [IsAdminOrDeleteDenied]

    @action(detail=True, methods=['patch'])
    def status(self, request, pk=None):
        """Update the status of an existing order."""
        order = self.get_object()
        new_status = request.data.get('status')
        if new_status in dict(Order.STATUS_CHOICES):
            order.status = new_status
            order.save()
            return Response({'status': order.status})
        return Response({'error': 'Invalid status'}, status=400)
