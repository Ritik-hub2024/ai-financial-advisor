import streamlit as st
import plotly.express as px
import plotly.graph_objects as go
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from io import BytesIO
from utils import calculate_metrics, calculate_goal_monthly
import math

st.set_page_config(page_title="AI Financial Advisor", page_icon="💰", layout="wide")
st.title("💰 AI Financial Advisor (Demo Mode)")
st.markdown("**Full financial analysis, charts & calculators - No API required**")

# Initialize session state
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
    }
    for key, value in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = value

initialize_session_state()

# Sidebar
st.sidebar.header("📊 Financial Profile")
st.session_state.income = st.sidebar.number_input("Income (₹)", value=st.session_state.income, min_value=1.0, step=1000.0)
st.session_state.expenses = st.sidebar.number_input("Expenses (₹)", value=st.session_state.expenses, min_value=0.0, step=1000.0)
st.session_state.savings = st.sidebar.number_input("Savings (₹)", value=st.session_state.savings, min_value=0.0, step=1000.0)
st.session_state.monthly_debt = st.sidebar.number_input("Debt Pmt (₹)", value=st.session_state.monthly_debt, min_value=0.0, step=1000.0)

st.sidebar.header("Expense Breakdown")
st.session_state.expense_food = st.sidebar.number_input("Food", value=st.session_state.expense_food, min_value=0.0, step=100.0)
st.session_state.expense_rent = st.sidebar.number_input("Rent/Housing", value=st.session_state.expense_rent, min_value=0.0, step=100.0)
st.session_state.expense_transport = st.sidebar.number_input("Transport", value=st.session_state.expense_transport, min_value=0.0, step=100.0)
st.session_state.expense_entertainment = st.sidebar.number_input("Entertainment", value=st.session_state.expense_entertainment, min_value=0.0, step=100.0)
st.session_state.expense_other = st.sidebar.number_input("Other", value=st.session_state.expense_other, min_value=0.0, step=100.0)

expense_cats = {
    'Food': st.session_state.expense_food,
    'Rent': st.session_state.expense_rent,
    'Transport': st.session_state.expense_transport,
    'Entertainment': st.session_state.expense_entertainment,
    'Other': st.session_state.expense_other
}

st.sidebar.header("🎯 Goal")
st.session_state.goal_target = st.sidebar.number_input("Target (₹)", value=st.session_state.goal_target, min_value=0.0, step=10000.0)
st.session_state.goal_years = st.sidebar.number_input("Years", value=st.session_state.goal_years, min_value=0.1, step=0.5)
st.session_state.risk_preference = st.sidebar.selectbox("Risk Profile", ["Conservative", "Moderate", "Aggressive"])

# Scenarios
col1, col2, col3 = st.sidebar.columns(3)
if col1.button("👨‍🎓 Student"):
    st.session_state.income = 25000.0
    st.session_state.expenses = 20000.0
    st.session_state.savings = 2000.0
    st.session_state.monthly_debt = 1000.0
    st.session_state.goal_type = "Education Fund"
    st.rerun()
if col2.button("💼 Pro"):
    st.session_state.income = 80000.0
    st.session_state.expenses = 45000.0
    st.session_state.savings = 15000.0
    st.session_state.monthly_debt = 8000.0
    st.session_state.goal_type = "Home Purchase"
    st.rerun()
if col3.button("👴 Retiree"):
    st.session_state.income = 40000.0
    st.session_state.expenses = 30000.0
    st.session_state.savings = 8000.0
    st.session_state.monthly_debt = 0.0
    st.session_state.goal_type = "Retirement"
    st.rerun()

# Data
income = float(st.session_state.income)
expenses = float(st.session_state.expenses)
savings = float(st.session_state.savings)
monthly_debt = float(st.session_state.monthly_debt)
risk_preference = st.session_state.risk_preference
goal_target = float(st.session_state.goal_target)
goal_years = float(st.session_state.goal_years)

if income <= 0:
    st.error("❌ Income must be greater than 0")
    st.stop()

# Calculations
metrics = calculate_metrics(income, expenses, savings, monthly_debt)
monthly_save = calculate_goal_monthly(goal_target, goal_years)

surplus = income - expenses - monthly_debt
savings_rate = (surplus / income) * 100
dti = (monthly_debt / income) * 100
emergency_months = savings / expenses if expenses > 0 else 0

# Tabs
tab1, tab2 = st.tabs(["📊 Dashboard", "🎯 Goal Calculator"])

with tab1:
    # Metrics
    col1, col2, col3, col4 = st.columns(4)
    col1.metric("💰 Monthly Surplus", f"₹{int(surplus):,}", delta=f"{savings_rate:.1f}%")
    col2.metric("📈 Savings Rate", f"{savings_rate:.1f}%")
    col3.metric("⚠️ Debt-to-Income", f"{dti:.1f}%")
    col4.metric("🛡️ Emergency Fund", f"{emergency_months:.1f} months")

    # Charts
    col_chart1, col_chart2 = st.columns(2)
    with col_chart1:
        df_metrics = pd.DataFrame({
            'Metric': ['Savings Rate', 'DTI', 'Budget Ratio'],
            'Value': [savings_rate, dti, 100 - savings_rate - dti]
        })
        fig = px.bar(df_metrics, x='Metric', y='Value', color='Metric', 
                     color_discrete_sequence=['green', 'red', 'blue'])
        fig.update_layout(height=300)
        st.plotly_chart(fig, use_container_width=True)

    with col_chart2:
        fig_pie = px.pie(values=list(expense_cats.values()), names=list(expense_cats.keys()),
                        title="Expense Breakdown")
        fig_pie.update_layout(height=300)
        st.plotly_chart(fig_pie, use_container_width=True)

    # Goal projection
    months = int(goal_years * 12)
    monthly_rate = 0.012  # 1.2% monthly ~14% annual
    fv_list = []
    for m in range(months + 1):
        if m == 0:
            fv_list.append(0)
        else:
            fv = fv_list[-1] * (1 + monthly_rate) + monthly_save
            fv_list.append(fv)
    
    fig_goal = px.line(x=list(range(months + 1)), y=fv_list, 
                      title=f"Goal Progress (₹{monthly_save:,.0f}/mo @ 14% return)")
    fig_goal.update_xaxes(title="Months")
    fig_goal.update_yaxes(title="Future Value ₹")
    st.plotly_chart(fig_goal, use_container_width=True)

    st.info(f"""
    **Recommendations (Demo Mode):**
    - **Budget:** Surplus ₹{int(surplus):,} allows {monthly_save/int(surplus):.1f}x your goal monthly save
    - **Risk {risk_preference}:** {'Conservative: Focus FD/SGB (8-9%)' if risk_preference == 'Conservative' else 'Aggressive: Equity SIP (12-15%)'}
    - **Emergency Fund:** Target 6 months (₹{int(expenses*6):,}) - Current {emergency_months:.1f}mo
    """)

with tab2:
    st.header("🎯 Goal Tracker")
    
    col_g1, col_g2 = st.columns(2)
    with col_g1:
        st.metric("Required Monthly", f"₹{int(monthly_save):,}")
        st.metric("Time to Goal", f"{goal_years:.1f} years")
    
    progress_pct = min(100, (savings / goal_target) * 100)
    st.progress(progress_pct / 100)
    st.metric("Current Progress", f"{progress_pct:.1f}%")

# Investment options table
months = int(goal_years * 12)
monthly_rate_7 = 0.07 / 12
fv_fd = monthly_save * ((1 + monthly_rate_7)**months - 1) / monthly_rate_7
monthly_rate_12 = 0.12 / 12
fv_sip12 = monthly_save * ((1 + monthly_rate_12)**months - 1) / monthly_rate_12
monthly_rate_15 = 0.15 / 12
fv_sip15 = monthly_save * ((1 + monthly_rate_15)**months - 1) / monthly_rate_15

investments = pd.DataFrame({
    'Option': ['FD (7%)', 'SIP Equity (12%)', 'Stocks (15%)'],
    'Monthly': [f'₹{int(monthly_save):,}', f'₹{int(monthly_save):,}', f'₹{int(monthly_save):,}'],
    'FV': [f'₹{int(fv_fd):,}', f'₹{int(fv_sip12):,}', f'₹{int(fv_sip15):,}']
})
st.dataframe(investments)

st.markdown("---")
st.markdown("""
**🚀 Deploy to GitHub Pages/Streamlit Cloud:**
1. Push to GitHub: `git add . && git commit -m "Complete" && git push`
2. Streamlit Cloud: Connect repo → Add requirements.txt → Live URL!

**GitHub:** https://github.com/Ritik-hub2024/ai-financial-advisor
**Features:** Charts, calculators, projections - 100% functional!
""")
