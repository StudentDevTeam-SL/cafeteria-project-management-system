import json
import urllib.request
from django.conf import settings
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import CustomTokenObtainPairSerializer, UserSerializer, UserCreateSerializer
from .models import CustomUser
from .google_auth import google_user_payload, resolve_google_user
from rest_framework import viewsets
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


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


class CheckEmailView(APIView):
    """
    Public endpoint: checks if a given Gmail address maps to a user
    in the system database. Used by the Google OAuth flow.

    POST body: { "email": "someone@gmail.com" }
    Response:
      - found=true  → { found: true, username, full_name, role }
      - found=false → { found: false }
    """
    permission_classes = [AllowAny]

    def post(self, request):
        email = (request.data.get('email') or '').strip().lower()
        if not email:
            return Response({'found': False, 'error': 'email is required'}, status=status.HTTP_400_BAD_REQUEST)

        user, requested_email = resolve_google_user(email)

        if user:
            return Response(google_user_payload(user, requested_email))

        return Response({'found': False})


class GoogleSocialLoginView(APIView):
    """
    After confirming the email exists, the frontend calls this endpoint 
    sending the Google ID Token (credential). The backend securely verifies it
    with Google's OAuth2 API, extracts the email, and generates real JWT tokens.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        credential = (request.data.get('credential') or '').strip()
        if not credential:
            return Response({'error': 'Google token (credential) is required'}, status=status.HTTP_400_BAD_REQUEST)

        email = None

        # Secure Debug Bypass: Allows testing with prefix "mock-google-token-" in development/DEBUG mode
        if settings.DEBUG and credential.startswith('mock-google-token-'):
            email = credential.replace('mock-google-token-', '').strip().lower()
        else:
            # Secure verification using Google Tokeninfo API
            try:
                url = f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}"
                req = urllib.request.Request(url, method="GET")
                with urllib.request.urlopen(req, timeout=5) as response:
                    payload = json.loads(response.read().decode('utf-8'))
                    
                    if 'error_description' in payload:
                        return Response({'error': f"Invalid Google token: {payload['error_description']}"}, status=status.HTTP_400_BAD_REQUEST)
                    
                    email = (payload.get('email') or '').strip().lower()
            except Exception as e:
                return Response({'error': f"Google token verification failed: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)

        if not email:
            return Response({'error': 'Could not extract email from Google token'}, status=status.HTTP_400_BAD_REQUEST)

        user, requested_email = resolve_google_user(email)
        if not user:
            return Response(
                {'error': f"The Google account '{email}' is not registered in the system database. Please contact your system administrator."},
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)
        payload = google_user_payload(user, requested_email)

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id':        user.id,
                'username':  user.username,
                'email':     user.email,
                'first_name': user.first_name,
                'last_name':  user.last_name,
                'full_name': payload['full_name'],
                'role':      payload['role'],
                'phone_number': user.phone_number,
            }
        })
