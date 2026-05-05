from rest_framework import serializers
from .models import CustomUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for the CustomUser model for reading basic user information.
    """
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'phone_number']
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
