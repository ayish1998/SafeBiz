import openai
import os
import json
from dotenv import load_dotenv
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings

# Load environment variables from .env file
load_dotenv()

@api_view(['GET'])
def get_assessment_questions(request):
    # Construct the file path for the JSON file
    json_file_path = os.path.join(settings.BASE_DIR, 'ai_integration', 'data', 'assessment_questions.json')

    try:
        with open(json_file_path, 'r') as file:
            questions_data = json.load(file)
        return Response(questions_data, status=status.HTTP_200_OK)
    except FileNotFoundError:
        return Response({"error": "Questions file not found."}, status=status.HTTP_404_NOT_FOUND)
    except json.JSONDecodeError:
        return Response({"error": "Error decoding JSON."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
def submit_assessment(request):
    answers = request.data
    recommendations = analyze_with_openai(answers)
    return Response({'recommendations': recommendations}, status=status.HTTP_200_OK)

def analyze_with_openai(answers):
    # Set your OpenAI API key
    openai.api_key = os.getenv('OPENAI_API_KEY')  # Use environment variable for API key

    # Prepare the prompt for OpenAI
    prompt = f"Based on the following security practices: {answers}, provide tailored cybersecurity recommendations for a small business."

    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": prompt}
            ]
        )
        recommendation_text = response.choices[0].message['content']
        return recommendation_text
    except Exception as e:
        print(f"Error calling OpenAI: {e}")
        return "Error generating recommendations."
