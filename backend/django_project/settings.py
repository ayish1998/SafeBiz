INSTALLED_APPS = [
    # Other apps
    'corsheaders',
    'rest_framework',
    'authentication',
]

MIDDLEWARE = [
    # Other middlewares
    'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Frontend URL
]
