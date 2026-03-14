import streamlit as st
import google.generativeai as genai
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import os
from dotenv import load_dotenv
from ai_advisor import generate_financial_advice, generate_goal_plan, finance_chatbot_response, get_model
from utils import (
    calculate_metrics, 
    split_advice_sections, 
    split_goal_sections, 
    generate_prompt, 
    calculate_goal_monthly, 
    sip_projection
)
from visualization import plot_expense_pie

load_dotenv()

st.set_page_config(page_title="AI Financial Advisor", page_icon="💰", layout="wide")
st.title("💰 AI Financial Advisor")
st.markdown("**Personalized financial insights powered by Google's Gemini 2.0 Flash**")

# Custom CSS
st.markdown("""
<style>
.main {background-color: #f0f8ff;}
.stMetric > label {font-size: 1.5em;}
</style>
""", unsafe_allow_html=True)

# About
with st.expander("ℹ️ About Tool"):
    st.markdown("""
    **Purpose:** Personalized financial advice using Gemini AI for budgeting, debt, investments, goals.
    **Use Case:** Students, professionals, retirees.
    **Tech:** Streamlit UI, Gemini 2.0 Flash, Plotly/Matplotlib viz, modular Python backend.
    """)

# API key - check secrets first
if os.path.exists('.streamlit/secrets.toml'):
    st.sidebar.success("✅ Using secrets.toml")
    api_key = os.getenv('GEMINI_API_KEY')
else:
    api_key = st.sidebar.text_input("Gemini API Key", type="password", help="https://aistudio.google.com/app/apikey")

if not api_key:
    st.warning("👈 Enter Gemini API Key (sidebar or .streamlit/secrets.toml)")
    st.stop()

# Session state for inputs
if 'income' not in st.session_state:
    st.session_state.income = 60000.0
    st.session_state.expenses = 35000.0
    st.session_state.savings = 10000.0
    st.session_state.monthly_debt = 5000.0
    st.session_state.goal_target = 500000.0
    st.session_state.goal_years = 3.0
    st.session_state.risk_preference = "Medium"
    st.session_state.goal_type = "Emergency Fund"
    st.session_state.expense_food = 8000.0
    st.session_state.expense_rent = 12000.0
    st.session_state.expense_transport = 3000.0
    st.session_state.expense_entertainment = 2000.0
    st.session_state.expense_other = 8000.0

# Sidebar
st.sidebar.header("📊 Financial Profile")
st.session_state.income = st.sidebar.number_input("Income (₹)", value=float(st.session_state.income), min_value=1.0)
st.session_state.expenses = st.sidebar.number_input("Expenses (₹)", value=st.session_state.expenses, min_value=0.0)
st.session_state.savings = st.sidebar.number_input("Savings (₹)", value=st.session_state.savings, min_value=0.0)
st.session_state.monthly_debt = st.sidebar.number_input("Debt Pmt (₹)", value=st.session_state.monthly_debt, min_value=0.0)

st.sidebar.subheader("Expense Breakdown")
st.session_state.expense_food = st.sidebar.number_input("Food", value=float(st.session_state.expense_food))
st.session_state.expense_rent = st.sidebar.number_input("Rent/Housing", value=float(st.session_state.expense_rent))
st.session_state.expense_transport = st.sidebar.number_input("Transport", value=float(st.session_state.expense_transport))
st.session_state.expense_entertainment = st.sidebar.number_input("Entertainment", value=float(st.session_state.expense_entertainment))
st.session_state.expense_other = st.sidebar.number_input("Other", value=float(st.session_state.expense_other))

expense_cats = {
    'Food': st.session_state.expense_food,
    'Rent': st.session_state.expense_rent,
    'Transport': st.session_state.expense_transport,
    'Entertainment': st.session_state.expense_entertainment,
    'Other': st.session_state.expense_other
}
total_exp_cat = sum(expense_cats.values())

st.sidebar.header("🎯 Goal & Risk")
st.session_state.risk_preference = st.sidebar.selectbox("Risk Preference", ["Low", "Medium", "High"], index=["Low", "Medium", "High"].index(st.session_state.risk_preference))
st.session_state.goal_type = st.sidebar.selectbox("Goal Type", ["Emergency Fund", "Home Purchase", "Education", "Retirement"], index=["Emergency Fund", "Home Purchase", "Education", "Retirement"].index(st.session_state.goal_type))
st.session_state.goal_target = st.sidebar.number_input("Target (₹)", value=st.session_state.goal_target)
st.session_state.goal_years = st.sidebar.number_input("Years", value=st.session_state.goal_years, min_value=0.1)

income = st.session_state.income
expenses = st.session_state.expenses
savings = st.session_state.savings
monthly_debt = st.session_state.monthly_debt
risk_preference = st.session_state.risk_preference
goal_type = st.session_state.goal_type
goal_target = st.session_state.goal_target
goal_years = st.session_state.goal_years

# Validation
if total_exp_cat != expenses:
    st.sidebar.warning(f"Expense breakdown (₹{total_exp_cat:,}) != Total Expenses (₹{expenses:,}). Advice uses total.")

# Scenarios
if st.sidebar.button("Student Profile"):
    st.session_state.income = 25000
    st.session_state.expenses = 20000
    st.session_state.savings = 2000
    st.session_state.monthly_debt = 1000
    st.session_state.expense_food = 6000
    st.session_state.expense_rent = 8000
    st.session_state.expense_transport = 2000
    st.session_state.expense_entertainment = 1000
    st.session_state.expense_other = 3000
    st.session_state.goal_type = "Education"
    st.rerun()
if st.sidebar.button("Professional"):
    st.session_state.income = 80000
    st.session_state.expenses = 45000
    st.session_state.savings = 15000
    st.session_state.monthly_debt = 8000
    st.session_state.expense_food = 10000
    st.session_state.expense_rent = 18000
    st.session_state.expense_transport = 4000
    st.session_state.expense_entertainment = 3000
    st.session_state.expense_other = 5000
    st.session_state.goal_type = "Home Purchase"
    st.rerun()
if st.sidebar.button("Retiree"):
    st.session_state.income = 40000
    st.session_state.expenses = 30000
    st.session_state.savings = 8000
    st.session_state.monthly_debt = 0
    st.session_state.expense_food = 7000
    st.session_state.expense_rent = 12000
    st.session_state.expense_transport = 2000
    st.session_state.expense_entertainment = 2000
    st.session_state.expense_other = 7000
    st.session_state.goal_type = "Retirement"
    st.rerun()

if income <= 0:
    st.error("Income must be > 0")
    st.stop()

# Pre-compute metrics
metrics = calculate_metrics(income, expenses, savings, monthly_debt)
monthly_for_goal = calculate_goal_monthly(goal_target, goal_years)

# Tabs
tab1, tab2 = st.tabs(["📈 Analysis & Advice", "💬 Chatbot"])

with tab1:
    if st.button("🚀 Analyze & Advise", type="primary"):
        try:
            with st.spinner("Generating AI insights..."):
                profile_data = {
                    'income': income,
                    'expenses': expenses,
                    'savings': savings,
                    'monthly_debt': monthly_debt,
                    'risk_preference': risk_preference,
                    'goal_type': goal_type,
                    'expense_breakdown': expense_cats,
                    'metrics': metrics,
                    'goals': f"{goal_type} ₹{goal_target:,} in {goal_years} years (monthly: ₹{monthly_for_goal:,})"
                }
                advice = generate_financial_advice(profile_data, api_key)
                goal_plan = generate_goal_plan(profile_data['goals'], api_key)

            st.success("✅ Analysis complete!")

            # Summary metrics
            st.header("📊 Summary")
            col1, col2, col3 = st.columns(3)
            with col1:
                st.metric("Savings Rate", f"{metrics['savings_rate']}%")
                st.metric("DTI", f"{metrics['dti']}%")
            with col2:
                st.metric("Monthly Surplus", f"₹{metrics['surplus']:,}")
                st.metric("Emergency Fund", f"{metrics['emergency_fund_months']} months")
            with col3:
                st.metric("Goal Monthly", f"₹{monthly_for_goal:,}")
                sip_fv = sip_projection(metrics['surplus'], goal_years)
                st.metric("SIP Projection", f"₹{sip_fv:,}")

            # Goal progress
            progress = min(1.0, savings / goal_target)
            st.progress(progress)
            st.metric("Progress to Goal", f"{progress*100:.1f}%")

            # Charts
            st.header("📈 Visualizations")
            col_chart1, col_chart2 = st.columns(2)
            with col_chart1:
                df_metrics = pd.DataFrame(list(metrics.items()), columns=['Metric', 'Value'])
                fig = px.bar(df_metrics, x='Metric', y='Value', title="Key Metrics")
                st.plotly_chart(fig, use_container_width=True)

            with col_chart2:
                # Dynamic expense pie
                img_pie = plot_expense_pie(expense_cats)
                st.image(img_pie, caption="Expense Breakdown", use_column_width=True)

            # SIP projection chart
            surplus = metrics['surplus']
            years_range = list(range(1, int(goal_years)+2))
            fv_values = [sip_projection(surplus, y) for y in years_range]
            fig_sip = px.line(x=years_range, y=fv_values, title="SIP Growth Projection (12% return)")
            fig_sip.update_xaxes(title="Years")
            fig_sip.update_yaxes(title="Future Value ₹")
            st.plotly_chart(fig_sip, use_container_width=True)

            # Recommendations
            st.header("💡 AI Recommendations")
            sections = split_advice_sections(advice)
            for i, section in enumerate(sections):
                with st.expander(f"📋 Advice {i+1}"):
                    st.write(section)

            # Download advice
            st.download_button(
                "💾 Download Advice",
                advice,
                file_name="financial_advice.txt",
                mime="text/plain"
            )

            st.header("🎯 Goal Action Plan")
            goal_sections = split_goal_sections(goal_plan)
            for i, step in enumerate(goal_sections):
                st.info(f"**Step {i+1}:** {step}")

        except Exception as e:
            st.error(f"❌ Error generating advice: {str(e)}")
            st.info("Check API key and internet connection.")

with tab2:
    if "messages" not in st.session_state:
        st.session_state.messages = []

    for message in st.session_state.messages:
        with st.chat_message(message["role"]):
            st.markdown(message["content"])

    if chat_input := st.chat_input("Ask about your finances..."):
        st.session_state.messages.append({"role": "user", "content": chat_input})
        with st.chat_message("user"):
            st.markdown(chat_input)

        with st.chat_message("assistant"):
            metrics_chat = calculate_metrics(income, expenses, savings, monthly_debt)
            profile_summary = (f"Profile: Income ₹{income:,}/mo, Expenses ₹{expenses:,}, "
                             f"Savings ₹{savings:,}, Debt ₹{monthly_debt:,}, "
                             f"Savings Rate {metrics_chat['savings_rate']}%, Surplus ₹{metrics_chat['surplus']:,}, "
                             f"Risk: {risk_preference}, Goal: {goal_type}")
            with st.spinner("AI thinking..."):
                response = finance_chatbot_response(chat_input, profile_summary, api_key)
            st.markdown(response)
        st.session_state.messages.append({"role": "assistant", "content": response})

st.markdown("---")
st.markdown("*Enhanced AI Financial Advisor - Powered by Gemini & Streamlit*")

