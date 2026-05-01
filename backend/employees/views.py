from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Employee
from .serializers import EmployeeSerializer

class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer

    @action(detail=True, methods=['patch'])
    def toggle(self, request, pk=None):
        emp = self.get_object()
        emp.status = 'inactive' if emp.status == 'active' else 'active'
        emp.save()
        return Response({'status': emp.status})
