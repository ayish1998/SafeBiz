# backend/django_project/settings.py

import os
from pathlib import Path
from dotenv import load_dotenv
from datetime import timedelta

# Load environment variables from .env file
load_dotenv()

# Base directory
BASE_DIR = Path(__file__).resolve().parent.parent

# Security settings (ensure to modify for production)
SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = True  # Set to False in production
ALLOWED_HOSTS = os.getenv('ALLOWED_HOSTS', '').split(',')

# Root URL configuration
ROOT_URLCONF = 'django_project.urls'

# Installed Apps
INSTALLED_APPS = [
    # Default Django apps
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',

    # Third-party apps
    'rest_framework',
    'corsheaders',
    'rest_framework_simplejwt.token_blacklist',  # For JWT handling
    'django.contrib.sites',  # Required for django-allauth

    # Authentication and Registration apps
    'allauth',
    'allauth.account',
    'allauth.socialaccount',  # Optional, if you're using social auth
    'rest_auth',  # Deprecated, use dj-rest-auth

    # Custom apps
    'authentication',  # Your custom app for registration
]

# Middleware
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'allauth.account.middleware.AccountMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # CORS middleware
]


# CORS settings for frontend communication
CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Frontend URL
]

# Templates and Authentication Backend settings
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],  # If you have custom templates
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

# Authentication backends for allauth
AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',  # Django's default authentication backend
    'allauth.account.auth_backends.AuthenticationBackend',  # django-allauth backend
)

# Database Configuration: Using SQLite (replace with PostgreSQL in production)
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}

# Static files (CSS, JavaScript, Images)
STATIC_URL = '/static/'
STATICFILES_DIRS = [BASE_DIR / 'static']

# Media files (user uploads)
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# Password validation for better security
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,  # Password must be at least 8 characters
        }
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

# Internationalization
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# REST framework settings
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',  # Using JWT Authentication
    ),
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.IsAuthenticated',  # Restrict access globally
    ],
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '10/day',  # General anonymous throttle
        'user': '100/day',  # General user throttle
        'login': '5/min',  # Custom throttle for login
        'password_reset': '3/min',  # Custom throttle for password reset
    },
}

# JWT settings for SimpleJWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=5),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=1),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'AUTH_HEADER_TYPES': ('Bearer',),  # Ensure Bearer token is used in header
}

# CORS Allowed Headers (to avoid CORS issues when sending the JWT token)
CORS_ALLOW_HEADERS = [
    'authorization',
    'content-type',
    'accept',
    'origin',
    'x-csrftoken',
    'x-requested-with',
]

# Site ID for allauth
SITE_ID = 1

# Email backend for verification during registration (for allauth)
EMAIL_BACKEND = 'django.core.mail.backends.console.EmailBackend'  # For development purposes

# Static and Media settings
STATICFILES_DIRS = [BASE_DIR / "static"]
MEDIA_ROOT = BASE_DIR / 'media'
MEDIA_URL = '/media/'
