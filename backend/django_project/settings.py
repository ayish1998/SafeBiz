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
    'rest_auth',
    
    # Custom apps
    'authentication',  # Your custom app for registration
]


MIDDLEWARE = [
    # Other middlewares
    'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Frontend URL
]
