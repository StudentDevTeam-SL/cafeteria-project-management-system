from rest_framework.permissions import BasePermission


class IsAdmin(BasePermission):
    """Allows access only to Admin-role users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role == 'Admin'  # Fixed: was 'admin' (lowercase)
        )


class IsEmployee(BasePermission):
    """Allows access only to Employee-role users."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in ('Employee', 'Staff')  # Fixed: was 'employee'
        )


class IsAdminOrReadOnly(BasePermission):
    """Read access for all authenticated users; write access for Admin only."""
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if request.method in ('GET', 'HEAD', 'OPTIONS'):
            return True
        return request.user.role == 'Admin'


class IsOwnerOrAdmin(BasePermission):
    """Object-level: owner or Admin can access."""
    def has_object_permission(self, request, view, obj):
        if request.user.role == 'Admin':
            return True
        return getattr(obj, 'user', None) == request.user