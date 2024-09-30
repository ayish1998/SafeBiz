# django_project/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/assessment/', include('ai_integration.urls')),  # Include the AI integration URLs
    path('auth/', include('authentication.urls')),  # Include the authentication URLs
]
