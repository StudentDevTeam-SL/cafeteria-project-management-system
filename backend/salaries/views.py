from rest_framework import viewsets
from .models import SalaryRecord
from .serializers import SalaryRecordSerializer

class SalaryRecordViewSet(viewsets.ModelViewSet):
    queryset = SalaryRecord.objects.select_related('employee').order_by('-id')
    serializer_class = SalaryRecordSerializer
