"""
Clean up uploaded files when menu images or job CVs are deleted/replaced.
"""
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import JobApplication, MenuItem


def _delete_uploaded_file(file_field):
    """Delete the file through its configured Django storage backend."""
    if not file_field:
        return
    name = getattr(file_field, "name", "")
    if not name or name.startswith(("http://", "https://")):
        return
    file_field.storage.delete(name)


@receiver(post_delete, sender=MenuItem)
def delete_image_on_item_delete(sender, instance, **kwargs):
    """
    When a MenuItem is deleted, also delete its image file from disk.
    Triggered after the database row is removed.
    """
    _delete_uploaded_file(instance.image)


@receiver(pre_save, sender=MenuItem)
def delete_old_image_on_update(sender, instance, **kwargs):
    """
    When a MenuItem's image is replaced with a new file, delete the old file.
    Triggered before the updated row is saved to the database.
    """
    if not instance.pk:
        # New instance — no old file to clean up
        return

    try:
        old_instance = MenuItem.objects.get(pk=instance.pk)
    except MenuItem.DoesNotExist:
        return

    old_image = old_instance.image
    new_image = instance.image

    # Only delete if the image has actually changed.
    if old_image and old_image != new_image:
        _delete_uploaded_file(old_image)


@receiver(post_delete, sender=JobApplication)
def delete_cv_on_application_delete(sender, instance, **kwargs):
    """
    When a JobApplication is deleted, also delete its CV file from disk.
    """
    _delete_uploaded_file(instance.cv)


@receiver(pre_save, sender=JobApplication)
def delete_old_cv_on_update(sender, instance, **kwargs):
    """
    When a JobApplication CV is replaced, delete the previous CV file.
    """
    if not instance.pk:
        return

    try:
        old_instance = JobApplication.objects.get(pk=instance.pk)
    except JobApplication.DoesNotExist:
        return

    old_cv = old_instance.cv
    new_cv = instance.cv

    if old_cv and old_cv != new_cv:
        _delete_uploaded_file(old_cv)
