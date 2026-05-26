from rest_framework import serializers
from .models import Employee
from accounts.models import CustomUser


class OptionalUserPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    """Treat a blank optional user id from the UI as no linked user."""

    def to_internal_value(self, data):
        if data in ('', '0', 0):
            return None
        return super().to_internal_value(data)


class EmployeeSerializer(serializers.ModelSerializer):
    """
    Serializer for the Employee model.
    Handles serialization of employee details and links to user accounts.
    """
    # Exposes the linked user's PK as user_id (read + write).
    # required=False + allow_null=True + default=None means:
    #   - field can be omitted from the request entirely → no error
    #   - field can be sent as null                      → clears the link
    #   - field sent as a valid PK                       → links the user
    user_id = OptionalUserPrimaryKeyRelatedField(
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

    def to_representation(self, instance):
        """Mask sensitive data for non-admin users."""
        data = super().to_representation(instance)
        request = self.context.get('request')
        
        # If user is not an Admin and not viewing their own profile, mask sensitive fields
        if request and hasattr(request.user, 'role'):
            can_manage = request.user.role in ['Admin', 'Manager']
            is_self = instance.user == request.user
            
            if not can_manage and not is_self:
                data['salary'] = "********"
                data['phone']  = "********"
        
        return data
