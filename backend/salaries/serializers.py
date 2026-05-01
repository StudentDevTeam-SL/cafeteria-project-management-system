from rest_framework import serializers
from .models import SalaryRecord
from employees.models import Employee


class SalaryRecordSerializer(serializers.ModelSerializer):
    # Read-only display fields sourced from linked employee
    employee_name     = serializers.CharField(source='employee.full_name', read_only=True)
    employee_position = serializers.CharField(source='employee.job_title', read_only=True)

    class Meta:
        model  = SalaryRecord
        fields = [
            'id', 'employee', 'employee_name', 'employee_position',
            'base_salary', 'bonus', 'deduction', 'net_salary',
            'payment_date', 'status',
        ]
        read_only_fields = ['net_salary', 'employee_name', 'employee_position']
