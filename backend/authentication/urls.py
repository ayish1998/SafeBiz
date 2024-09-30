# authentication/urls.py
from django.urls import path
from .views import register
from .views import login_view
from .views import get_user

urlpatterns = [
    path('register/', register, name='register'),
    path('login/', login_view, name='login'),
    path('user/', get_user, name='get_user')
]
