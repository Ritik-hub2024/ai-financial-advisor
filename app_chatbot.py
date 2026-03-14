import streamlit as st
import plotly.express as px
import pandas as pd
import numpy as np
from utils import calculate_metrics, calculate_goal_monthly
import math

st.set_page_config(page_title="AI Financial Chatbot", page_icon="🤖", layout="wide")

st.markdown("""
# 🤖 AI Financial Chatbot Assistant
**Your 24/7 personal finance advisor**

Enter your financial data → Chat with AI → Get personalized advice
""", unsafe_allow_html=True)

# Sidebar - Financial Profile
with st.sidebar:
    st.header("📊 Your Profile")
    
    # Initialize defaults
    defaults = {
        'income': 60000.0,
        'expenses': 35000.0,
        'savings': 10000.0,
        'debt': 50000.0,
        'age': 30,
        'risk': 'medium',
        'goal_amount': 500000.0,
        'goal_years': 3.0
    }
    
    for key, default in defaults.items():
        if key not in st.session_state:
            st.session_state[key] = default
    
    st.session_state.income = st.number_input("Monthly Income (₹)", value=st.session_state.income)
    st.session_state.expenses = st.number_input("Monthly Expenses (₹)", value=st.session_state.expenses)
    st.session_state.savings = st.number_input("Current Savings (₹)", value=st.session_state.savings)
    st.session_state.debt = st.number_input("Total Debt (₹)", value=st.session_state.debt)
    st.session_state.age = st.number_input("Age", value=st.session_state.age, min_value=18)
    st.session_state.risk = st.selectbox("Risk Tolerance", ['low', 'medium', 'high'], index=['low', 'medium', 'high'].index(st.session_state.risk))
    st.session_state.goal_amount = st.number_input("Goal Amount (₹)", value=st.session_state.goal_amount)
    st.session_state.goal_years = st.number_input("Goal Timeline (Years)", value=st.session_state.goal_years)

# Main chatbot interface
st.header("💬 Chat with Your Financial AI")

# Display chat messages
for message in st.session_state.get('messages', []):
    with st.chat_message(message["role"]):
        st.markdown(message["content"])

# Chat input
if prompt := st.chat_input("Ask about budgeting, investments, debt, goals..."):
    # Add user message
    st.session_state.messages.append({"role": "user", "content": prompt})
    with st.chat_message("user"):
        st.markdown(prompt)

    # Generate AI response
    with st.chat_message("assistant"):
        # Current financial summary
        surplus = st.session_state.income - st.session_state.expenses
        savings_rate = (surplus / st.session_state.income) * 100 if st.session_state.income > 0 else 0
        dti = (st.session_state.debt / (st.session_state.income * 12)) * 100 if st.session_state.income > 0 else 0
        
        profile = f"""
**Your Profile:**
Income: ₹{st.session_state.income:,.0f}/month
Expenses: ₹{st.session_state.expenses:,.0f}
Surplus: ₹{surplus:,.0f} ({savings_rate:.1f}%)
Savings: ₹{st.session_state.savings:,.0f}
Debt: ₹{st.session_state.debt:,.0f} (DTI: {dti:.1f}%)
Risk: {st.session_state.risk}
Goal: ₹{st.session_state.goal_amount:,.0f} in {st.session_state.goal_years} years
        """
        
        # AI Response based on query
        response = generate_ai_response(prompt.lower(), profile)
        st.markdown(response)

def generate_ai_response(query, profile):
    """Rule-based AI responses for demo (no API needed)"""
    
    responses = {
        'budget': f"""
**Budget Analysis:**
• Your current surplus: ₹{int(st.session_state.income - st.session_state.expenses):,}
• Recommended: Save 20-30% = ₹{int((st.session_state.income * 0.25)):,} 
• Cut expenses by 10% = Save extra ₹{int(st.session_state.expenses * 0.1):,}/month

**Action Steps:**
1. Track 30 days spending
2. Cancel unused subscriptions  
3. Use 50/30/20 rule (50% needs/30% wants/20% savings)
        """,
        'debt': f"""
**Debt Strategy:**
• DTI: {((st.session_state.debt / (st.session_state.income * 12)) * 100):.1f}%
• Debt Snowball recommended

**Payoff Plan:**
• Monthly payment capacity: ₹{int((st.session_state.income - st.session_state.expenses) * 0.4):,}
• Focus highest interest first
• Current savings can pay {int(st.session_state.savings / (st.session_state.debt * 0.05)):,} months interest
        """,
        'invest': f"""
**Investment Allocation ({st.session_state.risk}):**
```
Conservative (Low risk):
• 50% FD/PPF (7-8%)
• 30% Debt Funds  
• 20% Gold SGB

Moderate:
• 50% Equity MF SIP
• 30% Debt/Hybrid  
• 20% Gold/FD

Aggressive:
• 70% Direct Equity/Index
• 20% Gold  
• 10% Crypto
```
**SIP Calculator:** ₹{int((st.session_state.income - st.session_state.expenses) * 0.3):,}/mo @12% → ₹{sip_projection((st.session_state.income - st.session_state.expenses) * 0.3, st.session_state.goal_years):,}
        """,
        'goal': f"""
**Goal Breakdown:**
Target: ₹{st.session_state.goal_amount:,.0f}
Years: {st.session_state.goal_years}
Monthly needed: ₹{calculate_goal_monthly(st.session_state.goal_amount, st.session_state.goal_years):,.0f}

Your surplus: ₹{int(st.session_state.income - st.session_state.expenses):,}
Ratio: {calculate_goal_monthly(st.session_state.goal_amount, st.session_state.goal_years) / (st.session_state.income - st.session_state.expenses):.1f}x current

**Recommendation:** Increase savings by {int((calculate_goal_monthly(st.session_state.goal_amount, st.session_state.goal_years) / (st.session_state.income - st.session_state.expenses) - 1)*100):,}%
        """,
        'retire': f"""
**Retirement Planning:**
Age: {st.session_state.age}
Target corpus needed: ₹2-3 Cr (rule of thumb)

**Current trajectory:**
Monthly SIP: ₹{int((st.session_state.income - st.session_state.expenses)*0.4):,}
@12% return for {65 - st.session_state.age} years → ₹{(int(sip_projection((st.session_state.income - st.session_state.expenses)*0.4, 65 - st.session_state.age))):,}

**Recommendations:**
• Max NPS Tier 1
• Equity MF SIP 50% corpus
• EPF + PPF for stability
        """,
        'default': f"""
**Quick Summary:**
```
Income: ₹{st.session_state.income:,.0f}
Surplus: ₹{int(st.session_state.income - st.session_state.expenses):,}
Savings Rate: {((st.session_state.income - st.session_state.expenses)/st.session_state.income*100):.1f}%
DTI: {(st.session_state.debt / (st.session_state.income * 12) * 100):.1f}%
```

**3 Key Actions:**
1. { "Save 25% income aggressively" if (st.session_state.income - st.session_state.expenses)/st.session_state.income < 0.25 else "Maintain discipline" }
2. Emergency fund: { "Build to ₹{int(st.session_state.expenses*6):,}" if st.session_state.savings < st.session_state.expenses*3 else "Good - maintain" }
3. Debt: { "Prioritize payoff" if st.session_state.debt / (st.session_state.income * 12) > 0.3 else "Manageable" }
```
Ask me about "budget", "invest", "debt", "goal" or "retirement"! 🤖
        """
    }
    
    for key in ['budget', 'debt', 'invest', 'goal', 'retire', 'retirement']:
        if key in query:
            return responses[key]
    
    return responses['default']

def sip_projection(monthly, years, rate=0.12):
    months = years * 12
    monthly_rate = rate / 12
    return monthly * ((1 + monthly_rate)**months - 1) / monthly_rate

if __name__ == "__main__":
    st.markdown("**Demo AI Chatbot - Rule-based responses**")
    st.balloons()
