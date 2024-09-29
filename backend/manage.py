#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    # Set the default settings module for the 'manage' command
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "django_project.settings")

    # Import Django's command-line utility and run it
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    execute_from_command_line(sys.argv)
