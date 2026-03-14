import streamlit as st
import google.generativeai as genai
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
from dotenv import load_dotenv
from ai_advisor import generate_financial_advice, generate_goal_plan, finance_chatbot_response
from utils import (
    calculate_metrics, 
    split_advice_sections, 
    split_goal_sections, 
    generate_prompt, 
    calculate_goal_monthly
)
import matplotlib.pyplot as plt
from io import BytesIO

load_dotenv()

st.set_page_config(page_title="AI Financial Advisor", page_icon="💰", layout="wide")
st.title("💰 AI Financial Advisor")
st.markdown("**Personalized financial insights powered by Google's Gemini 2.0 Flash**")

# Initialize session state with float values
def initialize_session_state():
    defaults = {
        'income': 60000.0,
        'expenses': 35000.0,
        'savings': 10000.0,
        'monthly_debt': 5000.0,
        'goal_target': 500000.0,
        'goal_years': 3.0,
        'risk_preference': 'Medium',
        'goal_type': 'Emergency Fund',
        'expense_food': 8000.0,
        'expense_rent': 12000.0,
        'expense_transport': 3000.0,
        'expense_entertainment': 2000.0,
        'expense_other': 8000.0,
        'messages': []
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

initialize_session_state()

# API key
api_key = st.sidebar.text_input("Gemini API Key", type="password", help="Get from https://aistudio.google.com/app/apikey")
if not api_key:
    st.warning("👈 Enter Gemini API Key")
    st.stop()

st.sidebar.header("📊 Financial Profile")
st.session_state.income = st.sidebar.number_input("Income (₹)", value=st.session_state.income, min_value=1.0, step=1000.0)
st.session_state.expenses = st.sidebar.number_input("Expenses (₹)", value=st.session_state.expenses, min_value=0.0, step=1000.0)
st.session_state.savings = st.sidebar.number_input("Savings (₹)", value=st.session_state.savings, min_value=0.0, step=1000.0)
st.session_state.monthly_debt = st.sidebar.number_input("Debt Pmt (₹)", value=st.session_state.monthly_debt, min_value=0.0, step=1000.0)

st.sidebar.header("Expense Breakdown")
st.session_state.expense_food = st.sidebar.number_input("Food", value=st.session_state.expense_food, min_value=0.0)
st.session_state.expense_rent = st.sidebar.number_input("Rent/Housing", value=st.session_state.expense_rent, min_value=0.0)
st.session_state.expense_transport = st.sidebar.number_input("Transport", value=st.session_state.expense_transport, min_value=0.0)
st.session_state.expense_entertainment = st.sidebar.number_input("Entertainment", value=st.session_state.expense_entertainment, min_value=0.0)
st.session_state.expense_other = st.sidebar.number_input("Other", value=st.session_state.expense_other, min_value=0.0)

expense_cats = {
    'Food': st.session_state.expense_food,
    'Rent': st.session_state.expense_rent,
    'Transport': st.session_state.expense_transport,
    'Entertainment': st.session_state.expense_entertainment,
    'Other': st.session_state.expense_other
}

st.sidebar.header("🎯 Goal & Risk")
st.session_state.risk_preference = st.sidebar.selectbox("Risk Preference", ["Low", "Medium", "High"])
st.session_state.goal_type = st.sidebar.selectbox("Goal Type", ["Emergency Fund", "Home Purchase", "Education", "Retirement"])
st.session_state.goal_target = st.sidebar.number_input("Target (₹)", value=st.session_state.goal_target, min_value=0.0)
st.session_state.goal_years = st.sidebar.number_input("Years", value=st.session_state.goal_years, min_value=0.1)

# Scenarios
if st.sidebar.button("Student Profile"):
    st.session_state.income = 25000.0
    st.session_state.expenses = 20000.0
    st.session_state.savings = 2000.0
    st.session_state.monthly_debt = 1000.0
    st.session_state.goal_type = "Education"
    st.rerun()

if st.sidebar.button("Professional"):
    st.session_state.income = 80000.0
    st.session_state.expenses = 45000.0
    st.session_state.savings = 15000.0
    st.session_state.monthly_debt = 8000.0
    st.session_state.goal_type = "Home Purchase"
    st.rerun()

if st.sidebar.button("Retiree"):
    st.session_state.income = 40000.0
    st.session_state.expenses = 30000.0
    st.session_state.savings = 8000.0
    st.session_state.monthly_debt = 0.0
    st.session_state.goal_type = "Retirement"
    st.rerun()

# Data
income = st.session_state.income
expenses = st.session_state.expenses
savings = st.session_state.savings
monthly_debt = st.session_state.monthly_debt
risk_preference = st.session_state.risk_preference
goal_type = st.session_state.goal_type
goal_target = st.session_state.goal_target
goal_years = st.session_state.goal_years

if income <= 0:
    st.error("Income must be > 0")
    st.stop()

metrics = calculate_metrics(income, expenses, savings, monthly_debt)
monthly_for_goal = calculate_goal_monthly(goal_target, goal_years)

# Tabs
tab1, tab2 = st.tabs(["📈 Analysis", "💬 AI Chat"])

with tab1:
    if st.button("🚀 Get AI Advice", type="primary"):
        with st.spinner('Generating insights...'):
            profile_data = {
                'income': income,
                'expenses': expenses,
                'savings': savings,
                'monthly_debt': monthly_debt,
                'risk_preference': risk_preference,
                'goal_type': goal_type,
                'metrics': metrics,
                'goals': f"{goal_type} ₹{goal_target:,} in {goal_years} years"
            }
            advice = generate_financial_advice(profile_data, api_key)
            st.success("Analysis complete!")

        col1, col2, col3 = st.columns(3)
        with col1:
            st.metric("Savings Rate", f"{metrics['savings_rate']}%")
            st.metric("DTI", f"{metrics['dti']}%")
        with col2:
            st.metric("Monthly Surplus", f"₹{metrics['surplus']:,}")
        with col3:
            st.metric("Goal Monthly", f"₹{monthly_for_goal:,}")

        # Charts
        df_metrics = pd.DataFrame({'Metric': list(metrics.keys()), 'Value': list(metrics.values())})
        fig = px.bar(df_metrics, x='Metric', y='Value')
        st.plotly_chart(fig)

        # Expense pie
        fig_pie = px.pie(values=list(expense_cats.values()), names=list(expense_cats.keys()))
        st.plotly_chart(fig_pie)

        st.markdown("### 💡 AI Advice")
        sections = split_advice_sections(advice)
        for i, section in enumerate(sections):
            with st.expander(f"Recommendation {i+1}"):
                st.write(section)

with tab2:
    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if prompt := st.chat_input("Ask about finances..."):
        st.session_state.messages.append({"role": "user", "content": prompt})
        with st.chat_message("user"):
            st.markdown(prompt)

        with st.chat_message("assistant"):
            profile_summary = f"Income: ₹{income:,}, Expenses: ₹{expenses:,}, Savings Rate: {metrics['savings_rate']}%, Surplus: ₹{metrics['surplus']:,}"
            response = finance_chatbot_response(prompt, profile_summary, api_key)
            st.markdown(response)
        st.session_state.messages.append({"role": "assistant", "content": response})

st.markdown("---")
st.markdown("*AI Financial Advisor v2.0 - Powered by Gemini Flash*")
