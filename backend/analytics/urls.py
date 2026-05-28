from django.urls import path
from .views import (
    BackupExportView, BackupRestoreView, BackupTablesView,
    DashboardNotificationsView, DashboardStatsView
)

urlpatterns = [
    path('stats/', DashboardStatsView.as_view(), name='dashboard_stats'),
    path('notifications/', DashboardNotificationsView.as_view(), name='dashboard_notifications'),
    path('backup/tables/', BackupTablesView.as_view(), name='backup_tables'),
    path('backup/export/', BackupExportView.as_view(), name='backup_export'),
    path('backup/restore/', BackupRestoreView.as_view(), name='backup_restore'),
]
