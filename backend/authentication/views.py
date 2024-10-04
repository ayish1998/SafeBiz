# authentication/views.py
from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes  # Include permission_classes here
from .serializers import UserSerializer
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import ValidationError
from django.contrib.auth import authenticate
from rest_framework.permissions import IsAuthenticated, AllowAny  # Ensure AllowAny is imported

@api_view(['POST'])
@permission_classes([AllowAny])  # Allow anyone to register
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



@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        # Retrieve the user based on email and pass it as username for authentication
        user_obj = User.objects.get(email=email)
        user = authenticate(request, username=user_obj.username, password=password)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if user is not None:
        # Generate JWT token using SimpleJWT
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        # Prepare the user's full name (or fallback to just the username if first_name/last_name are empty)
        full_name = f"{user.first_name} {user.last_name}".strip() or user.username

        return Response({
            'message': 'Login successful',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            # Include 'username' or 'first_name' instead of 'name'
            'user': {'email': user.email, 'username': user.username}
        }, status=status.HTTP_200_OK)

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['GET'])
def get_user(request):
    if request.user.is_authenticated:
        user_serializer = UserSerializer(request.user)
        return Response(user_serializer.data)
    return Response({'error': 'Not authenticated'}, status=401)