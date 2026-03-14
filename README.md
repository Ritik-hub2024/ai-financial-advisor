# 🚀 AI Financial Advisor - Enhanced Edition

## Quick Setup (Windows)
```bash
cd ai_financial_advisor
python -m venv venv
venv\\Scripts\\activate
pip install -r requirements.txt
streamlit run app.py
```

## API Key Setup
**Recommended**: Create `.streamlit/secrets.toml`:
```
GEMINI_API_KEY = "AIzaSy...your_key"
```
**Alternative**: Enter in sidebar (less secure).

Get key: [Google AI Studio](https://aistudio.google.com/app/apikey)

## ✨ New Features
- **Dynamic Expense Breakdown**: Food, Rent, Transport etc. → Pie chart
- **Financial Metrics**: Savings rate, DTI, Surplus, Emergency fund coverage
- **Goal Calculator**: Monthly SIP needed + Progress bar
- **Investment Projection**: SIP growth chart (12% return)
- **AI Advice**: Personalized via Gemini 2.0 Flash, includes expenses/risk
- **Chatbot**: Conversational finance Q&A
- **Downloads**: Advice as TXT
- **Profiles**: Student/Professional/Retiree presets
- **Secrets Support** + Better error handling

## Screenshots
- [App Demo](http://localhost:8501) once running

## Tech Stack
Streamlit | Gemini 2.0 Flash | Plotly/Matplotlib | Pandas

## Test It
1. Run app
2. Try "Professional" profile
3. Enter API key
4. Click "Analyze & Advise"
5. Ask chatbot: "Should I invest in SIP?"

*Built & Optimized by BLACKBOXAI*


