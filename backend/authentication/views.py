# authentication/views.py
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .serializers import UserSerializer
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import ValidationError

@api_view(['POST'])
def register(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    repeat_password = data.get('repeat_password')

    # Check if passwords match
    if password != repeat_password:
        return Response({'error': "Passwords don't match"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Validate password strength
    try:
        validate_password(password)
    except ValidationError as e:
        return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

    # Check if email is already in use
    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email is already registered'}, status=status.HTTP_400_BAD_REQUEST)
    
    # Create user
    user = User.objects.create_user(username=name, email=email, password=password)
    
    return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
