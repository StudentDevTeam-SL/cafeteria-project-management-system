from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsAdminRole(BasePermission):
    """
    Allows access only to Admin users.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'Admin')

class IsAdminRoleOrReadOnly(BasePermission):
    """
    Allows read access to any authenticated user,
    but write/delete access only to users with the 'Admin' role.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return bool(request.user and request.user.is_authenticated)
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') == 'Admin')

class IsManagerOrAdmin(BasePermission):
    """
    Allows access to Managers and Admins.
    """
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and getattr(request.user, 'role', '') in ['Admin', 'Manager'])
class IsAdminOrDeleteDenied(BasePermission):
    """
    Allows full access to Admins, but prevents deletion for others.
    """
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if getattr(request.user, 'role', '') == 'Admin':
            return True
        if request.method == 'DELETE':
            return False
        return True
