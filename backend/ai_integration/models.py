# ai_integration/models.py

from django.db import models
from django.contrib.auth.models import User

class AssessmentSubmission(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    answers = models.TextField()  # Store answers as JSON string
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Submission by {self.user.username} on {self.submitted_at}"
