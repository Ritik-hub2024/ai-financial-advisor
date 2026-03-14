import math

def calculate_metrics(income, expenses, savings, monthly_debt):
    """
    Calculate key financial metrics including emergency fund.
    """
    savings_rate = (savings / income) * 100 if income > 0 else 0
    debt_to_income = (monthly_debt / income) * 100 if income > 0 else 0
    surplus = income - expenses - monthly_debt
    budget_ratio = (surplus / income) * 100 if income > 0 else 0
    emergency_fund_months = (savings / monthly_debt) if monthly_debt > 0 else float('inf')
    return {
        'savings_rate': round(savings_rate, 2),
        'dti': round(debt_to_income, 2),
        'surplus': round(surplus, 2),
        'budget_ratio': round(budget_ratio, 2),
        'emergency_fund_months': round(emergency_fund_months, 1)
    }

def calculate_emergency_fund(surplus, months_needed=6):
    """
    Required savings for 6 months expenses.
    """
    return surplus * months_needed

def calculate_goal_monthly(target, years, expected_return=0.07):
    """
    Calculate required monthly savings for goal using FV formula.
    """
    months = years * 12
    if expected_return == 0:
        return target / months
    monthly_rate = expected_return / 12
    monthly_save = target * monthly_rate / ((1 + monthly_rate)**months - 1)
    return round(monthly_save, 2)

def sip_projection(monthly_investment, years, expected_return=0.12):
    """
    SIP future value projection.
    """
    months = years * 12
    monthly_rate = expected_return / 12
    fv = monthly_investment * ((1 + monthly_rate)**months - 1) / monthly_rate
    return round(fv, 2)

def generate_prompt(profile_data, expense_breakdown=None):
    """
    Generate enhanced prompt for Gemini.
    """
    metrics = profile_data['metrics']
    goals = profile_data['goals']
    expenses_str = f"Breakdown: {dict(expense_breakdown)}" if expense_breakdown else ""
    prompt = f"""
    You are an expert financial advisor for Indian users. Analyze:

    Income: ₹{profile_data['income']:,}/month
    Expenses: ₹{profile_data['expenses']:,} {expenses_str}
    Savings: ₹{profile_data['savings']:,}
    Debt Pmt: ₹{profile_data['monthly_debt']:,}
    Risk: {profile_data['risk_preference']}
    Goal: {goals}

    Metrics:
    - Savings Rate: {metrics['savings_rate']}%
    - DTI: {metrics['dti']}%
    - Surplus: ₹{metrics['surplus']:,}
    - Emergency Months: {metrics.get('emergency_fund_months', 'N/A')}

    Provide structured advice:
    1. Issues & Insights
    2. Budget optimization
    3. Debt strategy
    4. Investments (SIP/MF/FD/PPF for India)
    5. Goal roadmap

    Bullet points, actionable, realistic.
    """
    return prompt

def split_advice_sections(advice_text):
    """Split advice into sections."""
    sections = advice_text.split('\n\n')
    return [s.strip() for s in sections if s.strip()]

def split_goal_sections(goal_text):
    """Split goal plan into steps."""
    steps = goal_text.split('.')
    return [s.strip() for s in steps if s.strip() and len(s) > 10]

def categorize_expenses(total_expenses, categories):
    """
    Categorize expenses based on user inputs.
    categories: dict like {'Food': 10000, 'Rent': 15000}
    """
    total_cat = sum(categories.values())
    if abs(total_cat - total_expenses) > 1000:  # tolerance
        return None
    return categories

