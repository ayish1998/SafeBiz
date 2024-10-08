# ai_integration/views.py

import os
import json
import logging
import requests
import google.generativeai as genai
import re
from typing import List, Dict, Any
from dotenv import load_dotenv
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from .models import AssessmentSubmission
from django.contrib.auth.models import User
from google.oauth2 import service_account

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
    and analyzes them using Google Gemini AI.
    """
    user = request.user
    answers = request.data

    if not isinstance(answers, dict) or not answers:
        return Response({"error": "Invalid answers format. Must be a non-empty JSON object."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        # Load assessment questions for context
        json_file_path = os.path.join(settings.BASE_DIR, 'ai_integration', 'data', 'assessment_questions.json')
        with open(json_file_path, 'r', encoding='utf-8') as file:
            questions_data = json.load(file)

        submission = AssessmentSubmission.objects.create(user=user, answers=json.dumps(answers))

        # Call the AI function to get recommendations
        recommendations = analyze_with_gemini(answers, questions_data)

        # Save recommendations in a structured JSON format (divided into categories)
        submission.recommendations = recommendations
        submission.save()

        return Response({'recommendations': recommendations}, status=status.HTTP_200_OK)

    except Exception as e:
        logger.error(f"Error storing or analyzing submission for user {user.username}: {str(e)}")
        return Response({"error": "An error occurred while processing your submission."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def analyze_with_gemini(answers, questions_data):
    """
    Uses Google Gemini AI API to generate tailored recommendations categorized by type,
    along with a summary of the cybersecurity posture and security score.
    """
    genai.configure(api_key=os.getenv('GOOGLE_API_KEY'))

    formatted_q_and_a = []
    for section in questions_data:
        section_name = section['section']
        for question in section['questions']:
            question_text = question['text']
            answer = answers.get(question['id'], 'No answer provided')
            formatted_q_and_a.append(f"{section_name} - {question_text}: {answer}")

    prompt = (
        "The following are the security-related answers provided by a small business:\n\n"
        + "\n".join(formatted_q_and_a)
        + "\n\nProvide well-tailored cybersecurity recommendations categorized into "
        + "'Security Vulnerabilities', 'Best Practices', 'Action Steps', and 'Ongoing Monitoring'."
        + " For each recommendation, provide a brief title, a description, AI insights on why it matters, actionable steps to resolve, and a priority level (high, medium, or low)."
        + "\n\nAdditionally, provide an overall security score (0-100) based on the provided answers and a brief summary of the company's cybersecurity posture."
    )

    # Log the generated prompt
    logger.debug(f"Generated prompt for Gemini API: {prompt}")

    try:
        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)

        # Log the raw AI response to check what was returned
        logger.debug(f"Raw AI response: {response}")

        # Process the plain text response
        recommendations = parse_ai_response(response)

        return recommendations

    except Exception as e:
        logger.error(f"Google Gemini AI API error: {str(e)}")
        return {
            "summary": "Unable to generate security score and posture summary.",
            "security_score": "N/A",
            "Security Vulnerabilities": format_recommendations([], "Error"),
            "Best Practices": format_recommendations([], "Error"),
            "Action Steps": format_recommendations([], "Error"),
            "Ongoing Monitoring": format_recommendations([], "Error")
        }



def parse_ai_response(ai_response: str) -> Dict[str, Any]:
    """
    Parse the AI's response to extract structured information.
    
    Args:
        ai_response (str): The raw response from the AI.
        
    Returns:
        Dict[str, Any]: A structured representation of the AI's recommendations.
    """
    # Initialize a dictionary to store parsed data
    parsed_data = {
        'overall_score': None,
        'summary': None,
        'security_vulnerabilities': [],
        'best_practices': [],
        'action_steps': [],
        'ongoing_monitoring': [],
        'conclusion': None
    }

    # Extract Overall Security Score
    score_match = re.search(r'\*\*Overall Security Score:\*\* (\d+/\d+)', ai_response)
    if score_match:
        parsed_data['overall_score'] = score_match.group(1)

    # Extract Summary
    summary_match = re.search(r'\*\*Summary:\*\* (.*?)\n\n', ai_response, re.DOTALL)
    if summary_match:
        parsed_data['summary'] = summary_match.group(1).strip()

    # Extract Security Vulnerabilities
    vulnerabilities_section = re.findall(r'\*\*Security Vulnerabilities:\*\*(.*?)\*\*Best Practices:\*\*', ai_response, re.DOTALL)
    if vulnerabilities_section:
        vulnerabilities_text = vulnerabilities_section[0]
        vulnerabilities = re.split(r'\n\* \*\*', vulnerabilities_text.strip())
        for vulnerability in vulnerabilities:
            if vulnerability.strip():  # Check if the vulnerability text is not empty
                vulnerability_details = extract_section_details(vulnerability)
                parsed_data['security_vulnerabilities'].append(vulnerability_details)

    # Extract Best Practices
    best_practices_section = re.findall(r'\*\*Best Practices:\*\*(.*?)\*\*Action Steps:\*\*', ai_response, re.DOTALL)
    if best_practices_section:
        best_practices_text = best_practices_section[0]
        best_practices = re.split(r'\n\* \*\*', best_practices_text.strip())
        for practice in best_practices:
            if practice.strip():  # Check if the practice text is not empty
                practice_details = extract_section_details(practice)
                parsed_data['best_practices'].append(practice_details)

    # Extract Action Steps
    action_steps_section = re.findall(r'\*\*Action Steps:\*\*(.*?)\*\*Ongoing Monitoring:\*\*', ai_response, re.DOTALL)
    if action_steps_section:
        action_steps_text = action_steps_section[0]
        action_steps = re.split(r'\n\* \*\*', action_steps_text.strip())
        for step in action_steps:
            if step.strip():  # Check if the action step text is not empty
                step_details = extract_section_details(step)
                parsed_data['action_steps'].append(step_details)

    # Extract Ongoing Monitoring
    ongoing_monitoring_section = re.findall(r'\*\*Ongoing Monitoring:\*\*(.*?)\*\*Conclusion:\*\*', ai_response, re.DOTALL)
    if ongoing_monitoring_section:
        ongoing_monitoring_text = ongoing_monitoring_section[0]
        ongoing_monitoring = re.split(r'\n\* \*\*', ongoing_monitoring_text.strip())
        for monitoring in ongoing_monitoring:
            if monitoring.strip():  # Check if the monitoring text is not empty
                monitoring_details = extract_section_details(monitoring)
                parsed_data['ongoing_monitoring'].append(monitoring_details)

    # Extract Conclusion
    conclusion_match = re.search(r'\*\*Conclusion:\*\* (.*)', ai_response, re.DOTALL)
    if conclusion_match:
        parsed_data['conclusion'] = conclusion_match.group(1).strip()

    return parsed_data

def extract_section_details(section: str) -> Dict[str, Any]:
    """
    Extract details from a section of the AI response.
    
    Args:
        section (str): The raw text of the section.
        
    Returns:
        Dict[str, Any]: A structured representation of the section details.
    """
    # Initialize a dictionary to store section details
    section_details = {
        'title': None,
        'description': None,
        'ai_insights': None,
        'action_steps': [],
        'priority': None
    }

    # Extract title
    title_match = re.match(r'^(.*?)\:\s', section.strip())
    if title_match:
        section_details['title'] = title_match.group(1).strip()

    # Extract the rest of the section
    description_match = re.search(r'\*\*Description:\*\* (.*?)\*\*AI Insights:\*\*', section)
    if description_match:
        section_details['description'] = description_match.group(1).strip()

    insights_match = re.search(r'\*\*AI Insights:\*\* (.*?)\*\*Action Steps:\*\*', section)
    if insights_match:
        section_details['ai_insights'] = insights_match.group(1).strip()

    action_steps_match = re.findall(r'\*\*Action Steps:\*\* (.*?)\*\*Priority:\*\*', section)
    if action_steps_match:
        action_steps = re.split(r'\n\* ', action_steps_match[0].strip())
        for action in action_steps:
            if action.strip():  # Check if the action step text is not empty
                section_details['action_steps'].append(action.strip())

    priority_match = re.search(r'\*\*Priority:\*\* (.*)', section)
    if priority_match:
        section_details['priority'] = priority_match.group(1).strip()

    return section_details

def format_recommendations(parsed_data: Dict[str, Any]) -> str:
    """
    Format parsed recommendations for display.
    
    Args:
        parsed_data (Dict[str, Any]): The parsed AI recommendations.
        
    Returns:
        str: A formatted string for display.
    """
    formatted_output = []
    
    if parsed_data['overall_score']:
        formatted_output.append(f"Overall Security Score: {parsed_data['overall_score']}")
    if parsed_data['summary']:
        formatted_output.append(f"Summary: {parsed_data['summary']}")
    
    # Format each section
    for section_name, sections in [('Security Vulnerabilities', parsed_data['security_vulnerabilities']),
                                    ('Best Practices', parsed_data['best_practices']),
                                    ('Action Steps', parsed_data['action_steps']),
                                    ('Ongoing Monitoring', parsed_data['ongoing_monitoring'])]:
        formatted_output.append(f"\n{section_name}:")
        for section in sections:
            formatted_output.append(f"\n* **{section['title']}**")
            if section['description']:
                formatted_output.append(f"    * Description: {section['description']}")
            if section['ai_insights']:
                formatted_output.append(f"    * AI Insights: {section['ai_insights']}")
            if section['action_steps']:
                formatted_output.append("    * Action Steps:")
                for action in section['action_steps']:
                    formatted_output.append(f"        * {action}")
            if section['priority']:
                formatted_output.append(f"    * Priority: {section['priority']}")
    
    if parsed_data['conclusion']:
        formatted_output.append(f"\nConclusion: {parsed_data['conclusion']}")

    return "\n".join(formatted_output)

# Example usage
ai_response = """
**Overall Security Score:** 0/100

**Summary:** This business has provided no information about its cybersecurity practices, making it impossible to assess its current security posture. This indicates a high level of risk and a critical need for immediate action.

**Security Vulnerabilities:**

* **Lack of Basic Information:** The business has refused to provide even basic information about its operations, including size, industry, and location. This significantly hinders any risk assessment and prevents the development of tailored recommendations.
    * **Description:** This lack of information creates a huge blind spot, making it impossible to understand the business's unique security risks and vulnerabilities.
    * **AI Insights:** Basic information about a business is essential for identifying potential threats and vulnerabilities. Without this, any security recommendations would be generic and potentially ineffective.
    * **Action Steps:** Immediately provide all requested information about the business.      
    * **Priority:** **Critical**

**Best Practices:**

* **Establish a Secure Foundation:** The business should prioritize establishing a robust foundation for its cybersecurity posture.
    * **Description:** A strong foundation involves implementing basic but crucial security practices, including data protection, access control, and regular security updates.
    * **AI Insights:** Building a strong security foundation is essential for mitigating risks and protecting sensitive data. This foundation should be reviewed and updated regularly.       
    * **Action Steps:**
        * Implement strong passwords and two-factor authentication.
        * Ensure all software is up-to-date with security patches.
        * Securely store and manage all sensitive data.
        * Train employees on cybersecurity best practices.
    * **Priority:** **Critical**

**Action Steps:**

* **Develop a Cybersecurity Policy:** This should outline the business's security goals, responsibilities, and procedures.
    * **Description:** A comprehensive policy ensures that all employees understand their roles in cybersecurity and how to mitigate risks.
    * **AI Insights:** A clear cybersecurity policy provides a framework for security measures and fosters a culture of cybersecurity within the organization.       
    * **Action Steps:**
        * Draft the policy and involve key stakeholders for input.
        * Regularly review and update the policy to reflect evolving risks.
    * **Priority:** **High**

**Ongoing Monitoring:**

* **Regularly Audit Security Practices:** Continuous monitoring and auditing can help identify gaps in security and address them promptly.
    * **Description:** This should include both automated and manual audits of security practices to ensure compliance with established policies.
    * **AI Insights:** Regular audits allow organizations to stay ahead of potential threats and ensure their security practices are effective.     
    * **Action Steps:**
        * Schedule quarterly security audits.
        * Use security tools to automate monitoring where possible.
    * **Priority:** **Medium**

**Conclusion:** Taking immediate action to address the lack of information and implement basic security practices is crucial for reducing the business's risk profile.
"""

parsed_data = parse_ai_response(ai_response)
formatted_recommendations = format_recommendations(parsed_data)

print(formatted_recommendations)



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_recommendations(request):
    user = request.user
    try:
        submission = AssessmentSubmission.objects.filter(user=user).latest('submitted_at')
        recommendations = submission.recommendations
        return Response({'recommendations': recommendations}, status=status.HTTP_200_OK)
    except AssessmentSubmission.DoesNotExist:
        return Response({"error": "No assessment submission found for this user."}, status=status.HTTP_404_NOT_FOUND)
