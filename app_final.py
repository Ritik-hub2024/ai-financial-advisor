import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np
import streamlit.components.v1 as components
from utils import calculate_metrics, calculate_goal_monthly
import math

# Custom CSS - Glassmorphism & Modern Design
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
    
html, body, [class*="css"]  {
  font-family: 'Inter', sans-serif !important;
}
.main .block-container {
    padding-top: 2rem;
    padding-right: 2rem;
    padding-left: 2rem;
    padding-bottom: 1rem;
}
.stApp {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
.stMetric > label {
    color: rgba(255,255,255,0.8) !important;
    font-size: 1.1rem !important;
}
.stMetric > div > div {
    color: white !important;
    font-size: 2rem !important;
    font-weight: 700 !important;
}
.stButton > button {
    background: linear-gradient(45deg, #667eea, #764ba2) !important;
    color: white !important;
    border-radius: 12px !important;
    border: none !important;
    font-weight: 600 !important;
    padding: 0.75rem 2rem !important;
    box-shadow: 0 8px 32px rgba(102, 126, 234, 0.3) !important;
}
.stButton > button:hover {
    transform: translateY(-2px) !important;
    box-shadow: 0 12px 40px rgba(102, 126, 234, 0.4) !important;
}
.stTextInput > div > div > input {
    border-radius: 12px !important;
    border: 2px solid rgba(255,255,255,0.2) !important;
    padding: 0.75rem 1rem !important;
    background: rgba(255,255,255,0.1) !important;
    backdrop-filter: blur(10px) !important;
    color: white !important;
}
.stTextInput > div > div > input:focus {
    border-color: #fff !important;
    box-shadow: 0 0 0 3px rgba(255,255,255,0.1) !important;
}
.sidebar .sidebar-content {
    background: rgba(255,255,255,0.1) !important;
    backdrop-filter: blur(20px) !important;
    border-right: 1px solid rgba(255,255,255,0.2) !important;
}
.metric-card {
    background: rgba(255,255,255,0.15) !important;
    backdrop-filter: blur(20px) !important;
    border: 1px solid rgba(255,255,255,0.2) !important;
    border-radius: 20px !important;
    padding: 1.5rem !important;
}
</style>
""", unsafe_allow_html=True)

# Header with glass effect
st.markdown("""
<div style='
    background: rgba(255,255,255,0.1);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 2rem;
    margin-bottom: 2rem;
    border: 1px solid rgba(255,255,255,0.2);
    text-align: center;
'>
    <h1 style='color: white; font-size: 3rem; font-weight: 800; margin: 0;'>
        💰 AI Financial Dashboard
    </h1>
    <p style='color: rgba(255,255,255,0.9); font-size: 1.2rem; margin-top: 0.5rem;'>
        Professional financial analysis & planning tools
    </p>
</div>
""", unsafe_allow_html=True)

# Initialize session state properly
if 'messages' not in st.session_state:
    st.session_state.messages = []

if 'income' not in st.session_state:
    st.session_state.income = 60000.0
    st.session_state.expenses = 35000.0
    st.session_state.savings = 10000.0
    st.session_state.debt = 50000.0
    st.session_state.age = 30
    st.session_state.risk = 'medium'
    st.session_state.goal_amount = 500000.0
    st.session_state.goal_years = 3.0
    st.session_state.expense_food = 8000.0
    st.session_state.expense_rent = 12000.0
    st.session_state.expense_transport = 3000.0
    st.session_state.expense_entertainment = 2000.0
    st.session_state.expense_other = 8000.0

# Glass sidebar
with st.sidebar:
    st.markdown("<div class='metric-card'><h3 style='color:white; margin-bottom:1rem;'>📊 Profile</h3>", unsafe_allow_html=True)
    
    st.session_state.income = st.number_input("💼 Monthly Income", value=st.session_state.income, min_value=0.0)
    st.session_state.expenses = st.number_input("🏠 Monthly Expenses", value=st.session_state.expenses, min_value=0.0)
    st.session_state.savings = st.number_input("💳 Current Savings", value=st.session_state.savings, min_value=0.0)
    st.session_state.debt = st.number_input("💸 Total Debt", value=st.session_state.debt, min_value=0.0)
    
    st.markdown("---")
    st.markdown("<div class='metric-card'><h4 style='color:white;'>🎯 Goals</h4>", unsafe_allow_html=True)
    st.session_state.goal_amount = st.number_input("Target Amount", value=st.session_state.goal_amount)
    st.session_state.goal_years = st.number_input("Timeline (Years)", value=st.session_state.goal_years)
    
    st.markdown("---")
    if st.button("🔄 Quick Presets", use_container_width=True):
        presets = {
            "👨‍🎓 Student": {"income": 25000, "expenses": 20000, "savings": 2000, "debt": 50000},
            "💼 Professional": {"income": 80000, "expenses": 45000, "savings": 15000, "debt": 200000},
            "👴 Retiree": {"income": 40000, "expenses": 30000, "savings": 500000, "debt": 0}
        }
        preset = st.selectbox("Choose", list(presets.keys()))
        if preset:
            data = presets[preset]
            st.session_state.income = data["income"]
            st.session_state.expenses = data["expenses"]
            st.session_state.savings = data["savings"]
            st.session_state.debt = data["debt"]
            st.rerun()

# Calculate metrics
income, expenses, savings, debt = map(float, [st.session_state.income, st.session_state.expenses, st.session_state.savings, st.session_state.debt])
surplus = income - expenses
savings_rate = (surplus / income) * 100 if income > 0 else 0
dti = (debt / (income * 12)) * 100 if income > 0 else 0
emergency_months = savings / expenses if expenses > 0 else 0
monthly_goal = calculate_goal_monthly(st.session_state.goal_amount, st.session_state.goal_years)

# Dashboard Cards
st.markdown("""
<div style='display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 1.5rem;'>
""", unsafe_allow_html=True)

cols = st.columns(4)
with cols[0]:
    st.markdown(f"""
    <div class='metric-card'>
        <h3>💰 Surplus</h3>
        <div style='font-size: 2.5rem; font-weight: 800; color: #10b981;'>₹{int(surplus):,}</div>
        <p>{savings_rate:.1f}% rate</p>
    </div>
    """, unsafe_allow_html=True)

with cols[1]:
    st.markdown(f"""
    <div class='metric-card'>
        <h3>⚠️ DTI</h3>
        <div style='font-size: 2.5rem; font-weight: 800; color: #ef4444;'>{dti:.1f}%</div>
        <p>Debt ratio</p>
    </div>
    """, unsafe_allow_html=True)

with cols[2]:
    st.markdown(f"""
    <div class='metric-card'>
        <h3>🛡️ Emergency</h3>
        <div style='font-size: 2.5rem; font-weight: 800; color: #3b82f6;'>{emergency_months:.1f} mo</div>
        <p>Fund coverage</p>
    </div>
    """, unsafe_allow_html=True)

with cols[3]:
    st.markdown(f"""
    <div class='metric-card'>
        <h3>🎯 Goal Monthly</h3>
        <div style='font-size: 2.5rem; font-weight: 800; color: #f59e0b;'>₹{int(monthly_goal):,}</div>
        <p>Required save</p>
    </div>
    """, unsafe_allow_html=True)

st.markdown("</div>", unsafe_allow_html=True)

# Charts Row
col1, col2 = st.columns(2)

with col1:
    # Metrics bar
    df_metrics = pd.DataFrame({
        'Metric': ['Surplus %', 'DTI %', 'Emergency Mo'],
        'Value': [savings_rate, dti, emergency_months]
    })
    fig1 = px.bar(df_metrics, x='Metric', y='Value', 
                  color='Value', color_continuous_scale='viridis')
    fig1.update_layout(height=350, title="Financial Health")
    st.plotly_chart(fig1, use_container_width=True)

with col2:
    # Expense pie
    fig2 = px.pie(values=list(expense_cats.values()), names=list(expense_cats.keys()),
                 color_discrete_sequence=['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'])
    fig2.update_layout(height=350, title="Expense Breakdown")
    st.plotly_chart(fig2, use_container_width=True)

# Goal Projection
months = int(st.session_state.goal_years * 12)
rates = [0.07, 0.12, 0.15]
projections = {}
for rate in rates:
    monthly_rate = rate / 12
    fv = []
    for m in range(months + 1):
        if m == 0:
            fv.append(0)
        else:
            fv.append(fv[-1] * (1 + monthly_rate) + monthly_goal)
    projections[rate] = fv

df_proj = pd.DataFrame(projections, index=range(months + 1))
fig3 = px.line(df_proj, title="Investment Growth Comparison")
fig3.update_xaxes(title="Months")
fig3.update_yaxes(title="Future Value ₹")
fig3.add_hline(y=st.session_state.goal_amount, line_dash="dash", line_color="red", 
               annotation_text="Goal Target")
st.plotly_chart(fig3, use_container_width=True)

# AI Chatbot
st.markdown("---")
st.header("🤖 AI Financial Assistant")

# Chat history
if 'chat_history' not in st.session_state:
    st.session_state.chat_history = []

for chat in st.session_state.chat_history:
    with st.chat_message(chat["role"]):
        st.markdown(chat["content"])

# Chat input
prompt = st.chat_input("Ask about your finances: 'budget plan?' 'investment advice?' 'retirement?' 'debt strategy?'")

if prompt:
    # User message
    st.session_state.chat_history.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)
    
    # AI response
    with st.chat_message("assistant"):
        response = get_ai_response(prompt)
        st.markdown(response)
    
    st.session_state.chat_history.append({"role": "assistant", "content": response})

def get_ai_response(query):
    surplus = income - expenses
    monthly_goal = calculate_goal_monthly(st.session_state.goal_amount, st.session_state.goal_years)
    
    if 'budget' in query.lower():
        return f"""**📊 Personalized Budget Plan**

**Current Status:**
- Income: ₹{int(income):,}
- Surplus: ₹{int(surplus):,} ({(surplus/income*100):.1f}%)
- Goal Monthly: ₹{int(monthly_goal):,}

**50/30/20 Rule:**
• 50% Needs: ₹{int(income*0.5):,} (current expenses OK)
• 30% Wants: Max ₹{int(income*0.3):,}
• 20% Savings: Target ₹{int(income*0.2):,}

**Action Items:**
✅ Track spending 30 days
✅ Cut {int((expenses-income*0.5)/income*100):.0f}% from discretionary
💰 Increase surplus to {monthly_goal/int(surplus):.1f}x current"""
    
    elif 'invest' in query.lower():
        return f"""**💎 Investment Strategy ({st.session_state.risk})**

**Recommended Allocation:**
```
{'Conservative': '60% Debt/FD, 30% Gold, 10% Equity'
 'Moderate': '50% Equity SIP, 30% Debt, 20% Gold'
 'Aggressive': '70% Stocks, 20% Crypto, 10% Gold'}[st.session_state.risk]
```

**SIP Calculator:**
Your surplus ₹{int(surplus):,} @12% → ₹{int(monthly_goal * (1.01**int(st.session_state.goal_years*12) - 1)/0.01):,} 

**Top Picks:**
1. Parag Parikh Flexi Cap
2. HDFC Midcap Opportunities  
3. Axis Gold ETF
4. PPF (tax-free 7.1%)"""
    
    elif 'debt' in query.lower():
        return f"""**⚠️ Debt Reduction Plan**

**Current DTI:** {(debt/(income*12)*100):.1f}%
**Priority:** {'High - pay aggressively' if debt/(income*12)>0.3 else 'Manageable'}

**Snowball Strategy:**
1. List debts by balance (smallest first)
2. Minimum payments on all
3. Extra ₹{int(surplus*0.5):,} to smallest debt
4. Roll over to next

**Timeline:** {int(debt/surplus):,} months at current surplus"""
    
    elif 'retire' in query.lower():
        return f"""**👴 Retirement Roadmap**

**Years to retirement:** {65 - st.session_state.age}
**Target:** ₹2.5Cr corpus

**Monthly SIP needed:** ₹{int(25000000/(65-st.session_state.age)/12):,}
**Your current:** ₹{int(surplus*0.4):,} ({int((surplus*0.4)*12*(65-st.session_state.age)):,} total projected)

**Portfolio:**
• 60% Equity MF/NPS
• 25% Debt FDs  
• 15% Gold/PF

**Tax Benefits:**
• NPS 50k extra deduction
• ELSS 1.5L u/s 80C"""
    
    else:
        return f"""**Quick Health Check:**
```
Surplus: ₹{int(surplus):,} ✓
DTI: {(debt/(income*12)*100):.1f}% {'⚠️ High' if debt/(income*12)>0.3 else '✅ Good'}
Emergency Fund: {savings/expenses:.1f} months
Goal Progress: {min(100,(savings/st.session_state.goal_amount)*100):.1f}%

**Next Steps:**
1. { 'Build emergency fund first' if savings/expenses < 3 else 'Start SIP immediately' }
2. Review expenses (track 30 days)
3. Ask me "budget", "invest", "debt", or "retirement"!
```
🤖 Ready to help!"""

# Footer
st.markdown("""
<div style='
    text-align: center; 
    padding: 2rem; 
    color: rgba(255,255,255,0.7);
    font-size: 0.9rem;
'>
    🚀 AI Financial Dashboard | Fully Responsive | Deploy Ready<br>
    <a href='https://github.com/Ritik-hub2024/ai-financial-advisor' target='_blank' style='color: white; text-decoration: none;'>⭐ GitHub Repo</a>
</div>
""", unsafe_allow_html=True)
