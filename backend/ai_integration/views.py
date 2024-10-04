# ai_integration/views.py

import openai
import os
import json
import logging
from dotenv import load_dotenv
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import AssessmentSubmission
from django.contrib.auth.models import User


# Load environment variables from .env file
load_dotenv()

# Set up logging
logger = logging.getLogger(__name__)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_assessment_questions(request):
    """
    Fetches assessment questions from a JSON file and returns them as a response.
    """
    json_file_path = os.path.join(settings.BASE_DIR, 'ai_integration', 'data', 'assessment_questions.json')

    try:
        with open(json_file_path, 'r', encoding='utf-8') as file:
            questions_data = json.load(file)
        return Response(questions_data, status=status.HTTP_200_OK)
    except FileNotFoundError:
        logger.error(f"Questions file not found at {json_file_path}")
        return Response({"error": "Questions file not found."}, status=status.HTTP_404_NOT_FOUND)
    except json.JSONDecodeError:
        logger.error(f"Error decoding JSON file at {json_file_path}")
        return Response({"error": "Error decoding JSON."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        return Response({"error": "An unexpected error occurred."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def submit_assessment(request):
    """
    Endpoint to handle the submission of user assessments. Stores answers in the database 
    and analyzes them using OpenAI. Also fetches questions to provide context for the answers.
    """
    user = request.user
    answers = request.data

    # Validate answers format
    if not isinstance(answers, dict) or not answers:
        return Response({"error": "Invalid answers format. Must be a non-empty JSON object."}, status=status.HTTP_400_BAD_REQUEST)

    # Path to the questions JSON file
    json_file_path = os.path.join(settings.BASE_DIR, 'ai_integration', 'data', 'assessment_questions.json')

    try:
        # Load the questions from the JSON file
        with open(json_file_path, 'r', encoding='utf-8') as file:
            questions_data = json.load(file)

        # Store the user's answers to the database
        submission = AssessmentSubmission.objects.create(
            user=user,
            answers=json.dumps(answers)  # Save answers as a JSON string in the database
        )

        # Log after successful submission save
        logger.info(f"Submission saved successfully for user {user.username}. Submission ID: {submission.id}")

        # Call OpenAI to analyze the answers and get tailored recommendations
        recommendations = analyze_with_openai(answers, questions_data)

        return Response({'recommendations': recommendations}, status=status.HTTP_200_OK)

    except FileNotFoundError:
        logger.error(f"Questions file not found at {json_file_path}")
        return Response({"error": "Questions file not found."}, status=status.HTTP_404_NOT_FOUND)
    except json.JSONDecodeError:
        logger.error(f"Error decoding JSON file at {json_file_path}")
        return Response({"error": "Error decoding JSON."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        logger.error(f"Error storing or analyzing submission for user {user.username}: {str(e)}")
        return Response({"error": "An error occurred while processing your submission."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def analyze_with_openai(answers, questions_data):
    """
    Uses OpenAI API to generate cybersecurity recommendations based on the user's answers.
    """
    openai.api_key = os.getenv('OPENAI_API_KEY')

    # Prepare a formatted structure of the questions and answers
    formatted_q_and_a = []
    for section in questions_data:
        section_name = section['section']
        for question in section['questions']:
            question_text = question['text']
            answer = answers.get(question['id'], 'No answer provided')
            formatted_q_and_a.append(f"{section_name} - {question_text}: {answer}")
    
    # Join all question-answer pairs into a single prompt
    prompt = (
        "The following are the security-related answers provided by a small business:\n\n"
        + "\n".join(formatted_q_and_a)
        + "\n\n"
        + "Based on these answers, provide tailored cybersecurity recommendations for the business, "
        + "considering factors such as business size, industry, current measures, and potential risks."
    )

    try:
        # Make the request to OpenAI using the new API format
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}]
        )
        recommendation_text = response['choices'][0]['message']['content']
        return recommendation_text.strip()  # Return the generated recommendation text

    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        return "There was an issue generating recommendations. Please try again later."
