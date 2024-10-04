# django_project/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Define a welcome view
def welcome(request):
    return HttpResponse("<h1>Welcome to the SentriBiz Project!</h1>")

urlpatterns = [
    path('', welcome),  # Add the welcome view to the root URL
    path('api/assessment/', include('ai_integration.urls')),  # Include the AI integration URLs
    path('auth/', include('authentication.urls')),  # Include the authentication URLs
    path('admin/', admin.site.urls),  # Ensure the admin URL is also included
]
