import json
import urllib.request
from django.conf import settings
from django.utils import timezone
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.exceptions import PermissionDenied
from .serializers import (
    CustomTokenObtainPairSerializer, UserSerializer, UserCreateSerializer,
    LoginActivitySerializer, PublicRegisterSerializer
)
from .models import CustomUser, LoginActivity
from .google_auth import google_user_payload, resolve_google_user
from rest_framework import viewsets
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from accounts.permissions import IsManagerOrAdmin


def get_client_ip(request):
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        return forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR')


def create_login_activity(request, user):
    return LoginActivity.objects.create(
        user=user,
        username=user.username,
        role=getattr(user, 'role', ''),
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')[:1000],
    )


def close_login_activity(user, activity_id=None, reason='logout'):
    activities = LoginActivity.objects.filter(
        user=user,
        status='active',
        logout_at__isnull=True,
    )
    if activity_id:
        activities = activities.filter(id=activity_id)

    activity = activities.order_by('-login_at').first()
    if not activity:
        return None

    activity.logout_at = timezone.now()
    activity.status = 'closed'
    activity.close_reason = reason[:80]
    activity.save(update_fields=['logout_at', 'status', 'close_reason'])
    return activity


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
        queryset = CustomUser.objects.all().order_by('id')
        if getattr(self.request.user, 'role', '') == 'Admin':
            return queryset
        return queryset.filter(id=self.request.user.id)

    def create(self, request, *args, **kwargs):
        if getattr(request.user, 'role', '') != 'Admin':
            raise PermissionDenied('Only admins can create system users.')
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        if getattr(request.user, 'role', '') != 'Admin':
            raise PermissionDenied('Only admins can delete system users.')
        return super().destroy(request, *args, **kwargs)


class LoginActivityViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Manager/admin endpoint for seeing who logged in and when sessions closed.
    """
    queryset = LoginActivity.objects.select_related('user').order_by('-login_at')
    serializer_class = LoginActivitySerializer
    permission_classes = [IsManagerOrAdmin]


class PublicRegisterView(APIView):
    """
    Public self-registration for Staff and Employee users.
    """
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PublicRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        activity = create_login_activity(request, user)

        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'login_activity_id': activity.id,
            'user': UserSerializer(user).data,
        }, status=status.HTTP_201_CREATED)


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    View for authenticating and obtaining custom JWT tokens.
    """
    serializer_class = CustomTokenObtainPairSerializer

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == status.HTTP_200_OK:
            username = (request.data.get('username') or '').strip()
            user = CustomUser.objects.filter(username__iexact=username).first()
            if user:
                activity = create_login_activity(request, user)
                response.data['login_activity_id'] = activity.id
        return response


class LogoutView(APIView):
    """
    View to handle user logout functionality on the backend.
    """
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        try:
            close_login_activity(
                request.user,
                activity_id=request.data.get('login_activity_id'),
                reason=request.data.get('reason') or 'logout',
            )
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
        activity = create_login_activity(request, user)

        return Response({
            'access':  str(refresh.access_token),
            'refresh': str(refresh),
            'login_activity_id': activity.id,
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
