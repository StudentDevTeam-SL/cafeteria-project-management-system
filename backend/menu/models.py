from django.db import models

class Category(models.Model):
    """
    Model representing a menu category (e.g., Main Course, Dessert).
    """
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class MenuItem(models.Model):
    """
    Model representing an individual item on the cafeteria menu.
    Includes pricing, categorization, and active status.
    """
    STATUS_CHOICES = (
        ('active', 'Active'),
        ('inactive', 'Inactive'),
    )
    category = models.ForeignKey(Category, related_name='items', on_delete=models.CASCADE, null=True, blank=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    image = models.ImageField(upload_to='menu_images/', blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return self.name

class ContactMessage(models.Model):
    """
    Model representing a contact form message from the public website.
    """
    name = models.CharField(max_length=200)
    email = models.EmailField()
    subject = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.subject} - {self.name}"


class NewsletterSubscription(models.Model):
    """
    Model representing a public footer newsletter subscription.
    """
    email = models.EmailField(unique=True)
    source = models.CharField(max_length=80, default='footer')
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def save(self, *args, **kwargs):
        self.email = self.email.strip().lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.email


class JobApplication(models.Model):
    """
    Model representing a public job application with an uploaded CV.
    """
    STATUS_CHOICES = (
        ('new', 'New'),
        ('reviewing', 'Reviewing'),
        ('contacted', 'Contacted'),
        ('closed', 'Closed'),
    )

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=40)
    position = models.CharField(max_length=120)
    experience_level = models.CharField(max_length=80)
    availability = models.CharField(max_length=120, blank=True)
    start_date = models.DateField(blank=True, null=True)
    expected_salary = models.CharField(max_length=80, blank=True)
    portfolio_url = models.URLField(blank=True)
    cover_letter = models.TextField()
    cv = models.FileField(upload_to='job_applications/cvs/')
    agreed_to_policy = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.position}"


class Recipe(models.Model):
    """
    Model linking MenuItem to its recipe.
    """
    menu_item = models.OneToOneField(MenuItem, on_delete=models.CASCADE, related_name='recipe')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Recipe for {self.menu_item.name}"


class RecipeIngredient(models.Model):
    """
    Model representing ingredients required for a recipe.
    """
    recipe = models.ForeignKey(Recipe, on_delete=models.CASCADE, related_name='ingredients')
    inventory_item = models.ForeignKey('inventory.InventoryItem', on_delete=models.CASCADE)
    quantity = models.DecimalField(max_digits=10, decimal_places=3)  # quantity required for one unit

    def __str__(self):
        return f"{self.quantity} of {self.inventory_item.item_name} for {self.recipe.menu_item.name}"


class ModifierGroup(models.Model):
    """
    Group of modifications/custom options (e.g. 'Extra toppings', 'Drink size').
    """
    name = models.CharField(max_length=100)
    min_selections = models.IntegerField(default=0)
    max_selections = models.IntegerField(default=1)

    def __str__(self):
        return self.name


class ModifierOption(models.Model):
    """
    Individual choice inside a ModifierGroup (e.g. 'Extra Cheese' with +$1.50 price).
    """
    modifier_group = models.ForeignKey(ModifierGroup, on_delete=models.CASCADE, related_name='options')
    name = models.CharField(max_length=100)
    price_adjustment = models.DecimalField(max_digits=6, decimal_places=2, default=0.00)

    def __str__(self):
        return f"{self.name} (+${self.price_adjustment})"


class MenuItemModifier(models.Model):
    """
    Association between MenuItem and ModifierGroup.
    """
    menu_item = models.ForeignKey(MenuItem, on_delete=models.CASCADE, related_name='modifiers')
    modifier_group = models.ForeignKey(ModifierGroup, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('menu_item', 'modifier_group')

    def __str__(self):
        return f"{self.modifier_group.name} for {self.menu_item.name}"
