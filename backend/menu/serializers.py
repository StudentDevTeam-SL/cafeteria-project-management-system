from rest_framework import serializers
from .models import Category, MenuItem


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model  = Category
        fields = '__all__'


class MenuItemSerializer(serializers.ModelSerializer):
    # Expose category as name string so frontend string-comparison filter works
    category      = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True, default='')
    is_active     = serializers.SerializerMethodField()

    class Meta:
        model  = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'price', 'image', 'status', 'is_active', 'created_at',
        ]
        read_only_fields = ['created_at']

    def get_category(self, obj):
        """Return category name string (not FK int) for frontend filter compatibility."""
        return obj.category.name if obj.category else None

    def get_is_active(self, obj):
        return obj.status == 'active'

    def _resolve_category(self, raw_data):
        """Look up or create a Category from a name string in request data."""
        cat_name = raw_data.get('category')
        if cat_name:
            cat, _ = Category.objects.get_or_create(name=cat_name)
            return cat
        return None

    def create(self, validated_data):
        # Remove computed fields not on the model
        validated_data.pop('category_obj', None)
        raw = self.initial_data
        category = self._resolve_category(raw)
        if category:
            validated_data['category'] = category
        return super().create(validated_data)

    def update(self, instance, validated_data):
        validated_data.pop('category_obj', None)
        raw = self.initial_data
        category = self._resolve_category(raw)
        if category:
            validated_data['category'] = category
        return super().update(instance, validated_data)
