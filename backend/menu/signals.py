"""
menu/signals.py
───────────────────────────────────────────────────────────────────
Django signals that clean up image files from disk whenever a
MenuItem is deleted or its image field is replaced with a new file.

This prevents orphaned files from accumulating in media/menu_images/.
"""
import os
from django.db.models.signals import post_delete, pre_save
from django.dispatch import receiver
from .models import MenuItem


def _delete_image_file(image_field):
    """Delete the file on disk that an ImageField points to, if it exists."""
    if not image_field:
        return
    path = image_field.path
    if os.path.isfile(path):
        os.remove(path)


@receiver(post_delete, sender=MenuItem)
def delete_image_on_item_delete(sender, instance, **kwargs):
    """
    When a MenuItem is deleted, also delete its image file from disk.
    Triggered after the database row is removed.
    """
    _delete_image_file(instance.image)


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

    # Only delete if the image has actually changed and is a real file path
    if old_image and old_image != new_image:
        _delete_image_file(old_image)
