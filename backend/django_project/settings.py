INSTALLED_APPS = [
    # Other apps
    'corsheaders',
]

MIDDLEWARE = [
    # Other middlewares
    'corsheaders.middleware.CorsMiddleware',
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',  # Frontend URL
]
