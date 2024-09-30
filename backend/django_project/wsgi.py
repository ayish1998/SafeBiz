import os
import sys

# Add the project's root directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Set the default settings module for the 'manage' command
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_project.settings")

# Import Django's WSGI application
from django.core.wsgi import get_wsgi_application

# Create the WSGI application
application = get_wsgi_application()
