import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from employees.serializers import EmployeeSerializer

data = {
    'full_name': 'Test',
    'job_title': 'Chef',
    'status': 'active',
    'user_id': None
}

s = EmployeeSerializer(data=data)
if not s.is_valid():
    print("ERRORS:", s.errors)
else:
    print("VALID:", s.validated_data)
