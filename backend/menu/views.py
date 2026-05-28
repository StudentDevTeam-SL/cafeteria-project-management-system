from rest_framework import viewsets, mixins
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import action
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from .models import (
    Category, MenuItem, Recipe, ModifierGroup, ModifierOption,
    ContactMessage, NewsletterSubscription, JobApplication
)
from .serializers import (
    CategorySerializer, MenuItemSerializer, RecipeSerializer,
    ModifierGroupSerializer, ModifierOptionSerializer, ContactMessageSerializer,
    NewsletterSubscriptionSerializer, JobApplicationSerializer
)
from accounts.permissions import IsAdminRole, IsManagerOrAdmin, IsManagerOrAdminOrReadOnly


class CategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing menu categories.
    Read access is open to all authenticated users; write access is Admin-only.
    """
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]


class MenuItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for viewing and editing menu items.
    Supports multipart/form-data for image uploads (ImageField).
    Provides a custom action to toggle an item's active status.
    """
    queryset           = MenuItem.objects.select_related('category').order_by('id')
    serializer_class   = MenuItemSerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]
    # Accept file uploads (multipart) as well as JSON
    parser_classes     = [MultiPartParser, FormParser, JSONParser]

    def get_serializer_context(self):
        """Pass request to serializer so it can build absolute image URLs."""
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    @action(detail=True, methods=['patch'])
    def toggle(self, request, pk=None):
        """Toggle active/inactive status; return full updated item."""
        item        = self.get_object()
        item.status = 'inactive' if item.status == 'active' else 'active'
        item.save()
        return Response(MenuItemSerializer(item, context={'request': request}).data)

class ContactMessageViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for public contact submissions and admin review.
    """
    queryset = ContactMessage.objects.order_by('-created_at')
    serializer_class = ContactMessageSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        if self.action in ['list', 'retrieve']:
            return [IsAuthenticated()]
        return [IsAdminRole()]


class NewsletterSubscriptionViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for public newsletter subscriptions and system review.
    """
    queryset = NewsletterSubscription.objects.order_by('-created_at')
    serializer_class = NewsletterSubscriptionSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        if self.action in ['list', 'retrieve']:
            return [IsManagerOrAdmin()]
        return [IsAdminRole()]


class JobApplicationViewSet(
    mixins.CreateModelMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.UpdateModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    """
    ViewSet for public job applications and admin review.
    """
    queryset = JobApplication.objects.order_by('-created_at')
    serializer_class = JobApplicationSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        if self.action == 'destroy':
            return [IsAdminRole()]
        return [IsManagerOrAdmin()]

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context


class RecipeViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing recipes.
    """
    queryset = Recipe.objects.all()
    serializer_class = RecipeSerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]


class ModifierGroupViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing modifier groups.
    """
    queryset = ModifierGroup.objects.all()
    serializer_class = ModifierGroupSerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]


class ModifierOptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing modifier options.
    """
    queryset = ModifierOption.objects.all()
    serializer_class = ModifierOptionSerializer
    permission_classes = [IsManagerOrAdminOrReadOnly]
