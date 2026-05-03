from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, UserCreateSerializer
from .models import CustomUser
from rest_framework import viewsets

class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing user instances.
    """
    queryset = CustomUser.objects.all()
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer

    def get_queryset(self):
        # Optional: restrict non-admins from seeing others
        if getattr(self.request.user, 'role', '') == 'Admin':
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=self.request.user.id)

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    View for authenticating and obtaining custom JWT tokens.
    """
    serializer_class = CustomTokenObtainPairSerializer

class LogoutView(APIView):
    """
    View to handle user logout functionality on the backend.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            return Response({"message": "Successfully logged out."}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)
