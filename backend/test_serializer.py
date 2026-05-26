import os
import django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from employees.serializers import EmployeeSerializer

def main():
    data = {
        'full_name': 'Test',
        'job_title': 'Chef',
        'status': 'active',
        'user_id': None,
    }

    serializer = EmployeeSerializer(data=data)
    if not serializer.is_valid():
        print("ERRORS:", serializer.errors)
    else:
        print("VALID:", serializer.validated_data)


if __name__ == "__main__":
    main()
