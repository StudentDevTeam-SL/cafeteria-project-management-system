from rest_framework import serializers
from .models import CustomUser, LoginActivity
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the CustomUser model for reading basic user information.
    """
    full_name = serializers.ReadOnlyField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'role', 'phone_number']
        read_only_fields = ['id', 'username', 'role']

class UserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer used for creating new CustomUser instances.
    Handles secure password hashing.
    """
    password = serializers.CharField(write_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'role', 'email', 'phone_number']

    def create(self, validated_data):
        from django.db import IntegrityError
        try:
            user = CustomUser.objects.create_user(
                username=validated_data['username'],
                password=validated_data['password'],
                role=validated_data.get('role', 'Employee'),
                email=validated_data.get('email', ''),
                phone_number=validated_data.get('phone_number', '')
            )
            return user
        except IntegrityError:
            raise serializers.ValidationError({"username": ["A user with that username already exists."]})


class PublicRegisterSerializer(serializers.ModelSerializer):
    """
    Public registration for non-privileged cafeteria users.
    Allows only Staff and Employee roles.
    """
    full_name = serializers.ReadOnlyField()
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    role = serializers.ChoiceField(choices=(('Staff', 'Staff'), ('Employee', 'Employee')), default='Employee')
    email = serializers.EmailField(required=True)

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'password', 'role', 'email', 'first_name',
            'last_name', 'full_name', 'phone_number',
        ]
        read_only_fields = ['id', 'full_name']

    def validate_username(self, value):
        username = value.strip()
        if not username:
            raise serializers.ValidationError('Username is required.')
        if CustomUser.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError('A user with that username already exists.')
        return username

    def validate_email(self, value):
        email = value.strip().lower()
        if CustomUser.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('A user with that email already exists.')
        return email

    def validate_password(self, value):
        try:
            validate_password(value)
        except DjangoValidationError as exc:
            raise serializers.ValidationError(list(exc.messages))
        return value

    def create(self, validated_data):
        user = CustomUser.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            role=validated_data.get('role', 'Employee'),
            email=validated_data['email'],
            first_name=validated_data.get('first_name', '').strip(),
            last_name=validated_data.get('last_name', '').strip(),
            phone_number=validated_data.get('phone_number', ''),
        )
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom JWT token serializer that includes additional claims
    like user role and username.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims
        token['role'] = user.role
        token['username'] = user.username
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = UserSerializer(self.user).data
        return data


class LoginActivitySerializer(serializers.ModelSerializer):
    """
    Read serializer for manager/admin login activity audit records.
    """
    full_name = serializers.CharField(source='user.full_name', read_only=True)
    duration_seconds = serializers.IntegerField(read_only=True)

    class Meta:
        model = LoginActivity
        fields = [
            'id', 'user', 'username', 'full_name', 'role', 'login_at',
            'logout_at', 'status', 'close_reason', 'ip_address',
            'user_agent', 'duration_seconds',
        ]
        read_only_fields = fields
