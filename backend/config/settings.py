"""
Django settings for backend project.
"""
import os
from pathlib import Path
from decouple import config
from datetime import timedelta
try:
    import dj_database_url
    _HAS_DJ_DB_URL = True
except ImportError:
    _HAS_DJ_DB_URL = False

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY', default='django-insecure-cafeteria-secret-key-123' if config('DEBUG', default=False, cast=bool) else None)
if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is missing and must be set in production (DEBUG=False).")

DEBUG = config('DEBUG', default=False, cast=bool)

# Default ALLOWED_HOSTS for local development and Vercel hosting
allowed_hosts_str = config('ALLOWED_HOSTS', default='localhost,127.0.0.1,cafeteria-systemchi.vercel.app,.vercel.app')
ALLOWED_HOSTS = [s.strip() for s in allowed_hosts_str.split(',') if s.strip()]

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',

    # Local apps
    'accounts.apps.AccountsConfig',
    'employees.apps.EmployeesConfig',
    'menu.apps.MenuConfig',
    'inventory.apps.InventoryConfig',
    'orders.apps.OrdersConfig',
    'analytics.apps.AnalyticsConfig',
    'salaries.apps.SalariesConfig',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

# Add WhiteNoise for static file serving (production only — optional locally)
try:
    import whitenoise  # noqa: F401
    MIDDLEWARE.insert(2, 'whitenoise.middleware.WhiteNoiseMiddleware')
except ImportError:
    pass

ROOT_URLCONF = 'config.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

_DATABASE_URL = config('DATABASE_URL', default='')

# Production Database Check: Fail loudly if DATABASE_URL is missing in production (DEBUG=False)
if not DEBUG and not _DATABASE_URL:
    raise ValueError(
        "DATABASE_URL environment variable is missing in production (DEBUG=False). "
        "Please set a valid PostgreSQL connection string (DATABASE_URL) in your Vercel project environment variables."
    )

if _DATABASE_URL and _HAS_DJ_DB_URL:
    # Production / Vercel: use the full connection URL
    DATABASES = {'default': dj_database_url.parse(_DATABASE_URL, conn_max_age=600)}
else:
    # Local development: use individual DB_* environment variables
    DATABASES = {
        'default': {
            'ENGINE': 'django.db.backends.postgresql',
            'NAME':     config('DB_NAME',     default='cafeteria_db'),
            'USER':     config('DB_USER',     default='postgres'),
            'PASSWORD': config('DB_PASSWORD', default='postgres'),
            'HOST':     config('DB_HOST',     default='localhost'),
            'PORT':     config('DB_PORT',     default='5432'),
        }
    }

AUTH_USER_MODEL = 'accounts.CustomUser'

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {'min_length': 8},
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

MEDIA_URL = '/media/'
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')

# ─── Cache Configuration ─────────────────────────────────────────────────
# Production: Uses Upstash Redis (or any Redis) via REDIS_URL env variable.
# Local dev:  Falls back to in-memory cache (no Redis install required).
_REDIS_URL = config('REDIS_URL', default='')

if _REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django_redis.cache.RedisCache',
            'LOCATION': _REDIS_URL,
            'OPTIONS': {
                'CLIENT_CLASS': 'django_redis.client.DefaultClient',
            },
            'KEY_PREFIX': 'cafeteria',
            'TIMEOUT': 300,  # Default TTL: 5 minutes (overridden per-key)
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'cafeteria-cache',
            'TIMEOUT': 300,
        }
    }

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'config.pagination.StandardResultsSetPagination',
}

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=8),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=30),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': False,
    'AUTH_HEADER_TYPES': ('Bearer',),
}

cors_str = config('CORS_ALLOWED_ORIGINS', default='http://localhost:3000,http://localhost:5173,http://127.0.0.1:5173,https://cafeteria-systemchi.vercel.app')
CORS_ALLOWED_ORIGINS = [s.strip() for s in cors_str.split(',') if s.strip()]

csrf_str = config(
    'CSRF_TRUSTED_ORIGINS',
    default='https://cafeteria-systemchi.vercel.app',
)
CSRF_TRUSTED_ORIGINS = [s.strip() for s in csrf_str.split(',') if s.strip()]

# Support wildcards for Vercel preview environments
CORS_ALLOWED_ORIGIN_REGEXES = [
    r"^https://.*\.vercel\.app$",
]

if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    X_FRAME_OPTIONS = 'DENY'
