"""
config/cache.py
───────────────────────────────────────────────────────────────────
Central cache key constants, TTL values, and invalidation helpers.

Design principles:
  • All cache keys are defined here — no magic strings scattered in views.
  • TTLs are tuned per domain: short for volatile data, longer for stable data.
  • Invalidation helpers clear related keys in one call after writes.
  • Authentication data is NEVER cached (login, JWT, passwords).
"""
import hashlib
import logging

from django.core.cache import cache

logger = logging.getLogger(__name__)

# ─── TTL Constants (seconds) ─────────────────────────────────────────────
CACHE_TTL_SHORT = 60          # Dashboard stats, orders — changes often
CACHE_TTL_NOTIFICATIONS = 45  # Dashboard notifications
CACHE_TTL_MEDIUM = 120        # Inventory, backup tables
CACHE_TTL_LONG = 300          # Menu items, employees, salaries — stable
CACHE_TTL_CATEGORIES = 600    # Categories — very stable

# ─── Key Prefixes ────────────────────────────────────────────────────────
CACHE_KEY_DASHBOARD_STATS = 'dashboard:stats'
CACHE_KEY_DASHBOARD_NOTIFICATIONS = 'dashboard:notifications'  # append :{role}
CACHE_KEY_BACKUP_TABLES = 'backup:tables'
CACHE_KEY_MENU_LIST = 'menu:list'        # append :{hash}
CACHE_KEY_MENU_CATEGORIES = 'menu:categories'
CACHE_KEY_ORDERS_LIST = 'orders:list'    # append :{hash}
CACHE_KEY_INVENTORY_LIST = 'inventory:list'  # append :{hash}
CACHE_KEY_EMPLOYEES_LIST = 'employees:list'  # append :{hash}
CACHE_KEY_SALARIES_LIST = 'salaries:list'    # append :{hash}


def make_cache_key(prefix, request=None, extra=''):
    """
    Build a deterministic cache key from a prefix + request query string.
    Uses an MD5 hash of the full query string to keep keys short and unique.
    """
    parts = [prefix]
    if request is not None:
        qs = request.META.get('QUERY_STRING', '')
        if qs:
            parts.append(hashlib.md5(qs.encode()).hexdigest()[:12])
    if extra:
        parts.append(str(extra))
    return ':'.join(parts)


def invalidate_keys(*keys):
    """Delete one or more cache keys. Logs each deletion for debugging."""
    for key in keys:
        cache.delete(key)
        logger.debug('Cache invalidated: %s', key)


def invalidate_pattern(prefix):
    """
    Invalidate all keys starting with a given prefix.

    Uses django-redis's delete_pattern if available (Upstash/Redis backend),
    otherwise falls back to deleting the exact key (LocMemCache).
    """
    try:
        # django-redis provides delete_pattern on the cache client
        cache.delete_pattern(f'{prefix}:*')
        logger.debug('Cache pattern invalidated: %s:*', prefix)
    except AttributeError:
        # LocMemCache fallback — just delete the exact prefix key
        cache.delete(prefix)
        logger.debug('Cache key invalidated (no pattern support): %s', prefix)


# ─── Domain-specific invalidation functions ──────────────────────────────
# These group related cache keys that must be cleared together after writes.

def invalidate_menu_caches():
    """After menu item create/update/delete."""
    invalidate_pattern(CACHE_KEY_MENU_LIST)
    invalidate_keys(CACHE_KEY_MENU_CATEGORIES)
    invalidate_keys(CACHE_KEY_DASHBOARD_STATS)
    invalidate_pattern(CACHE_KEY_DASHBOARD_NOTIFICATIONS)
    logger.info('Menu caches invalidated')


def invalidate_order_caches():
    """After order create/update/delete/status change."""
    invalidate_pattern(CACHE_KEY_ORDERS_LIST)
    invalidate_keys(CACHE_KEY_DASHBOARD_STATS)
    invalidate_pattern(CACHE_KEY_DASHBOARD_NOTIFICATIONS)
    invalidate_pattern(CACHE_KEY_INVENTORY_LIST)
    logger.info('Order caches invalidated')


def invalidate_inventory_caches():
    """After inventory item create/update/delete."""
    invalidate_pattern(CACHE_KEY_INVENTORY_LIST)
    invalidate_keys(CACHE_KEY_DASHBOARD_STATS)
    invalidate_pattern(CACHE_KEY_DASHBOARD_NOTIFICATIONS)
    logger.info('Inventory caches invalidated')


def invalidate_employee_caches():
    """After employee create/update/delete/toggle."""
    invalidate_pattern(CACHE_KEY_EMPLOYEES_LIST)
    invalidate_keys(CACHE_KEY_DASHBOARD_STATS)
    invalidate_pattern(CACHE_KEY_DASHBOARD_NOTIFICATIONS)
    logger.info('Employee caches invalidated')


def invalidate_salary_caches():
    """After salary record create/update/delete."""
    invalidate_pattern(CACHE_KEY_SALARIES_LIST)
    invalidate_keys(CACHE_KEY_DASHBOARD_STATS)
    invalidate_pattern(CACHE_KEY_DASHBOARD_NOTIFICATIONS)
    logger.info('Salary caches invalidated')
