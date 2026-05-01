from rest_framework import serializers
from .models import Employee
from accounts.models import CustomUser


class EmployeeSerializer(serializers.ModelSerializer):
    # Exposes the linked user's PK as user_id (read + write)
    user_id = serializers.PrimaryKeyRelatedField(
        source='user',
        queryset=CustomUser.objects.all(),
        required=False,
        allow_null=True,
        default=None,
    )

    # Make optional fields explicitly not required so frontend doesn't need to send them
    position = serializers.CharField(required=False, allow_blank=True, default='')
    salary   = serializers.DecimalField(
        max_digits=10, decimal_places=2,
        required=False,
        default=0.00
    )

    class Meta:
        model = Employee
        fields = [
            'id', 'user_id', 'full_name', 'job_title', 'phone',
            'position', 'salary', 'hire_date', 'status', 'shift', 'hours',
        ]
        read_only_fields = ['hire_date']
