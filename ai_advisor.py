import google.generativeai as genai
import os
from dotenv import load_dotenv
from utils import generate_prompt

load_dotenv()

def get_model(api_key=None):
    api_key = api_key or os.getenv('GEMINI_API_KEY')
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-2.0-flash-exp')

def generate_financial_advice(profile_data, api_key=None):
    model = get_model(api_key)
    prompt = generate_prompt(profile_data, profile_data.get('expense_breakdown'))
    response = model.generate_content(prompt)
    return response.text

def generate_goal_plan(goal_data, api_key=None):
    model = get_model(api_key)
    prompt = f"Create step-by-step plan for goal: {goal_data}. Include risks, alternatives."
    response = model.generate_content(prompt)
    return response.text

def finance_chatbot_response(query, profile_data, api_key=None):
    model = get_model(api_key)
    prompt = f"Profile: {profile_data}. Query: {query}. Respond conversationally."
    response = model.generate_content(prompt)
    return response.text


