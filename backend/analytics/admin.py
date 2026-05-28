from django.contrib import admin
from .models import SystemNotification


@admin.register(SystemNotification)
class SystemNotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'severity', 'audience', 'is_active', 'created_at')
    list_filter = ('severity', 'audience', 'is_active')
    search_fields = ('title', 'message', 'source')
