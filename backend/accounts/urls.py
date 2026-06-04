from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    CustomTokenObtainPairView, LogoutView, UserViewSet,
    CheckEmailView, GoogleSocialLoginView, LoginActivityViewSet,
    PublicRegisterView
)

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='users')
router.register(r'login-activity', LoginActivityViewSet, basename='login-activity')

urlpatterns = [
    path('', include(router.urls)),
    path('register/', PublicRegisterView.as_view(), name='public_register'),
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('logout/', LogoutView.as_view(), name='auth_logout'),
    path('check-email/', CheckEmailView.as_view(), name='check_email'),
    path('google-social-login/', GoogleSocialLoginView.as_view(), name='google_social_login'),
]
