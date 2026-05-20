from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Employee
from .serializers import EmployeeSerializer
from accounts.permissions import IsAdminRoleOrReadOnly

class EmployeeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing employee instances.
    Provides a custom action to toggle an employee's active status.
    """
    queryset = Employee.objects.select_related('user').order_by('id')
    serializer_class = EmployeeSerializer
    permission_classes = [IsAdminRoleOrReadOnly]

    @action(detail=True, methods=['patch'])
    def toggle(self, request, pk=None):
        """Toggle active/inactive status of an employee."""
        emp = self.get_object()
        emp.status = 'inactive' if emp.status == 'active' else 'active'
        emp.save()
        return Response({'status': emp.status})
