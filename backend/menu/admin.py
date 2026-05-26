from django.contrib import admin
from .models import Category, MenuItem, ContactMessage, NewsletterSubscription, JobApplication

@admin.register(ContactMessage)
class ContactMessageAdmin(admin.ModelAdmin):
    list_display = ('name', 'email', 'subject', 'created_at')
    search_fields = ('name', 'email', 'subject')
    list_filter = ('created_at',)


@admin.register(NewsletterSubscription)
class NewsletterSubscriptionAdmin(admin.ModelAdmin):
    list_display = ('email', 'source', 'created_at')
    search_fields = ('email',)
    list_filter = ('source', 'created_at')


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    list_display = ('first_name', 'last_name', 'email', 'phone', 'position', 'status', 'created_at')
    search_fields = ('first_name', 'last_name', 'email', 'phone', 'position')
    list_filter = ('position', 'experience_level', 'status', 'created_at')


admin.site.register(Category)
admin.site.register(MenuItem)
