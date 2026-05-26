from rest_framework import serializers
from .models import (
    Category, MenuItem, ContactMessage, NewsletterSubscription, JobApplication, Recipe, RecipeIngredient,
    ModifierGroup, ModifierOption, MenuItemModifier
)


class RecipeIngredientSerializer(serializers.ModelSerializer):
    item_name = serializers.CharField(source='inventory_item.item_name', read_only=True)
    unit = serializers.CharField(source='inventory_item.unit', read_only=True)

    class Meta:
        model = RecipeIngredient
        fields = ['id', 'inventory_item', 'item_name', 'unit', 'quantity']


class RecipeSerializer(serializers.ModelSerializer):
    ingredients = RecipeIngredientSerializer(many=True, read_only=True)

    class Meta:
        model = Recipe
        fields = ['id', 'menu_item', 'ingredients', 'created_at']


class ModifierOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ModifierOption
        fields = ['id', 'modifier_group', 'name', 'price_adjustment']


class ModifierGroupSerializer(serializers.ModelSerializer):
    options = ModifierOptionSerializer(many=True, read_only=True)

    class Meta:
        model = ModifierGroup
        fields = ['id', 'name', 'min_selections', 'max_selections', 'options']


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
    
    modifiers = serializers.SerializerMethodField()
    recipe_details = serializers.SerializerMethodField()

    class Meta:
        model  = MenuItem
        fields = [
            'id', 'category', 'category_name', 'name', 'description',
            'price', 'image', 'image_url', 'status', 'is_active', 'created_at',
            'modifiers', 'recipe_details',
        ]
        read_only_fields = ['created_at']

    def get_modifiers(self, obj):
        menu_item_modifiers = MenuItemModifier.objects.filter(menu_item=obj).select_related('modifier_group')
        groups = [mim.modifier_group for mim in menu_item_modifiers]
        return ModifierGroupSerializer(groups, many=True).data

    def get_recipe_details(self, obj):
        try:
            return RecipeSerializer(obj.recipe).data
        except Recipe.DoesNotExist:
            return None

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


class NewsletterSubscriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for footer newsletter subscriptions.
    """
    class Meta:
        model = NewsletterSubscription
        fields = ['id', 'email', 'source', 'created_at']
        read_only_fields = ['id', 'source', 'created_at']
        extra_kwargs = {
            'email': {'validators': []},
        }

    def create(self, validated_data):
        email = validated_data['email'].strip().lower()
        subscription, _ = NewsletterSubscription.objects.get_or_create(
            email=email,
            defaults={'source': 'footer'},
        )
        return subscription


class JobApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for public job applications with CV uploads.
    """
    cv_url = serializers.SerializerMethodField()

    class Meta:
        model = JobApplication
        fields = [
            'id', 'first_name', 'last_name', 'email', 'phone', 'position',
            'experience_level', 'availability', 'start_date', 'expected_salary',
            'portfolio_url', 'cover_letter', 'cv', 'cv_url', 'agreed_to_policy',
            'status', 'created_at',
        ]
        read_only_fields = ['id', 'cv_url', 'created_at']

    def get_cv_url(self, obj):
        request = self.context.get('request')
        if not obj.cv:
            return None
        if request:
            return request.build_absolute_uri(obj.cv.url)
        return obj.cv.url

    def validate_cv(self, value):
        allowed_extensions = ('.pdf', '.doc', '.docx')
        if not value.name.lower().endswith(allowed_extensions):
            raise serializers.ValidationError('Upload a CV as PDF, DOC, or DOCX.')
        return value

    def validate_agreed_to_policy(self, value):
        if not value:
            raise serializers.ValidationError('You must confirm the application details are correct.')
        return value

    def create(self, validated_data):
        validated_data['status'] = 'new'
        return super().create(validated_data)
