# django_project/urls.py

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    # Add your app URLs here, for example:
    # path('app_name/', include('app_name.urls')),
]
