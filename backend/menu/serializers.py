from rest_framework import serializers
from .models import Category, MenuItem, ContactMessage


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for the Category model.
    """
    class Meta:
        model  = Category
        fields = '__all__'


class MenuItemSerializer(serializers.ModelSerializer):
    """
    Serializer for the MenuItem model.
    Handles custom category resolution from string names to support
    frontend compatibility, and image uploads via multipart/form-data.
    """
    # Expose category as name string so frontend string-comparison filter works
    category      = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    is_active     = serializers.SerializerMethodField()

    # image_url: write-only field lets the frontend pass a URL string
    # (used as a fallback when no file is uploaded)
    image_url = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model  = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'price', 'image', 'image_url', 'status', 'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_category(self, obj):
        """Return category name string (not FK int) for frontend filter compatibility."""
        return obj.category.name if obj.category else None

    def get_is_active(self, obj):
        return obj.status == 'active'

    def to_representation(self, instance):
        """Return absolute image URL so the frontend can display uploaded images."""
        rep = super().to_representation(instance)
        request = self.context.get('request')
        if instance.image:
            image_str = str(instance.image)
            if image_str.startswith('http'):
                rep['image'] = image_str
            elif request:
                rep['image'] = request.build_absolute_uri(instance.image.url)
            else:
                rep['image'] = instance.image.url
        return rep

    def _resolve_category(self, raw_data):
        """Look up or create a Category from a name string in request data."""
        cat_name = raw_data.get('category')
        if cat_name:
            cat, _ = Category.objects.get_or_create(name=cat_name)
            return cat
        return None

    def create(self, validated_data):
        validated_data.pop('category_obj', None)
        # image_url is not a model field – only used here to pre-populate
        # the image field when a URL string is sent (no file upload)
        image_url = validated_data.pop('image_url', None)

        raw = self.initial_data
        category = self._resolve_category(raw)
        if category:
            validated_data['category'] = category

        # If no file was uploaded but a URL string was provided, store it
        # NOTE: after migrating to ImageField this stores as a path, not a URL.
        # The recommended flow is file upload; URL-only is kept for backwards compat.
        if image_url and not validated_data.get('image'):
            validated_data['image'] = image_url

        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('category_obj', None)
        image_url = validated_data.pop('image_url', None)

        raw = self.initial_data
        category = self._resolve_category(raw)
        if category:
            validated_data['category'] = category

        if image_url and not validated_data.get('image'):
            instance.image = image_url

        return super().update(instance, validated_data)

class ContactMessageSerializer(serializers.ModelSerializer):
    """
    Serializer for the ContactMessage model.
    """
    class Meta:
        model = ContactMessage
        fields = '__all__'
