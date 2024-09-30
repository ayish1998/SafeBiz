from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import authenticate
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.throttling import UserRateThrottle, AnonRateThrottle
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.validators import ValidationError
from django.urls import reverse
from django.conf import settings
from .serializers import UserSerializer

# Custom Throttles
class LoginRateThrottle(UserRateThrottle):
    rate = '5/min'

class PasswordResetRateThrottle(AnonRateThrottle):
    rate = '3/min'

@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([LoginRateThrottle])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    try:
        user_obj = User.objects.get(email=email)
        user = authenticate(request, username=user_obj.username, password=password)
    except User.DoesNotExist:
        return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

    if user is not None:
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        full_name = f"{user.first_name} {user.last_name}".strip() or user.username

        return Response({
            'message': 'Login successful',
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {'email': user.email, 'username': user.username}
        }, status=status.HTTP_200_OK)

    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)


# Password Reset Request
@api_view(['POST'])
@permission_classes([AllowAny])
@throttle_classes([PasswordResetRateThrottle])
def password_reset_request(request):
    email = request.data.get('email')

    if not User.objects.filter(email=email).exists():
        return Response({'error': 'Email not found'}, status=status.HTTP_404_NOT_FOUND)

    user = User.objects.get(email=email)
    token = default_token_generator.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))

    reset_url = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"
    send_mail(
        'Password Reset Request',
        f"Click the link to reset your password: {reset_url}",
        settings.DEFAULT_FROM_EMAIL,
        [user.email],
    )

    return Response({'message': 'Password reset email sent'}, status=status.HTTP_200_OK)


# Password Reset Confirm (for actual password change)
@api_view(['POST'])
@permission_classes([AllowAny])
def password_reset_confirm(request, uidb64, token):
    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except (TypeError, ValueError, OverflowError, User.DoesNotExist):
        return Response({'error': 'Invalid token or user ID'}, status=status.HTTP_400_BAD_REQUEST)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Invalid or expired token'}, status=status.HTTP_400_BAD_REQUEST)

    new_password = request.data.get('new_password')
    repeat_password = request.data.get('repeat_password')

    if new_password != repeat_password:
        return Response({'error': "Passwords don't match"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(new_password)
    except ValidationError as e:
        return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

    user.set_password(new_password)
    user.save()

    return Response({'message': 'Password reset successful'}, status=status.HTTP_200_OK)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user_serializer = UserSerializer(request.user)
    return Response(user_serializer.data)


# Register view remains unchanged
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    data = request.data
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    repeat_password = data.get('repeat_password')

    if password != repeat_password:
        return Response({'error': "Passwords don't match"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        validate_password(password)
    except ValidationError as e:
        return Response({'error': e.messages}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email=email).exists():
        return Response({'error': 'Email is already registered'}, status=status.HTTP_400_BAD_REQUEST)

    user = User.objects.create_user(username=name, email=email, password=password)
    return Response({'message': 'User registered successfully'}, status=status.HTTP_201_CREATED)
