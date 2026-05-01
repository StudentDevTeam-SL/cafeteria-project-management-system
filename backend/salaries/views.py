from rest_framework import viewsets
from .models import SalaryRecord
from .serializers import SalaryRecordSerializer

class SalaryRecordViewSet(viewsets.ModelViewSet):
    queryset = SalaryRecord.objects.all()
    serializer_class = SalaryRecordSerializer
