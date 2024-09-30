# django_project/urls.py

from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse

# Define a simple view function for the welcome message
def home_view(request):
    return HttpResponse(
        "<h1>Welcome to the SentriBiz API</h1>"
        "<p>This is the home page of the SentriBiz application.</p>"       
    )

urlpatterns = [
    path('', home_view, name='home'),  # Root URL that displays the welcome message
    path('api/assessment/', include('ai_integration.urls')),  # Include the AI integration URLs
    path('auth/', include('authentication.urls')),  # Include the authentication URLs
    path('admin/', admin.site.urls),  # Include the admin URLs
]
