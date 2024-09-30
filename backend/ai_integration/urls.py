from django.urls import path
from .views import submit_assessment, get_assessment_questions

urlpatterns = [
    path('questions/', get_assessment_questions, name='assessment_questions'),  # New endpoint for questions
    path('submit/', submit_assessment, name='submit_assessment'),  # Existing submit assessment endpoint
]
