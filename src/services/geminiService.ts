import { GoogleGenerativeAI } from "@google/generative-ai";
import { FinancialData, FinancialGoal, AnalysisData, AIRecommendation } from "../types";

interface ChatSession {
  sendMessage: (message: { message: string }) => Promise<{ text: string }>;
}

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || "");

export async function getFinancialAdvice(userData: FinancialData, analysisData: AnalysisData, goal?: FinancialGoal): Promise<AIRecommendation> {
  const profilePrompt = userData.profileType === "Student" ? "Tailor advice for a student focusing on education costs and early savings." : 
                       userData.profileType === "Professional" ? "Tailor advice for a working professional focusing on wealth building and tax optimization." :
                       "Tailor advice for a retiree focusing on wealth preservation and steady income.";

  const prompt = `
    You are a Certified Financial Planner (CFP). Generate a structured personal finance plan in JSON format.

    ${profilePrompt}

    User Data:
    - Profile Type: ${userData.profileType}
    - Monthly Income: ${userData.currency}${userData.monthlyIncome}
    - Monthly Expenses: ${userData.currency}${userData.monthlyExpenses}
    - Total Debts: ${userData.currency}${userData.totalDebt}
    - Existing Savings & Investments: ${userData.currency}${userData.currentSavings}
    - Estimated Monthly Savings: ${userData.currency}${analysisData.savings}
    - Total Net Worth: ${userData.currency}${analysisData.totalNetWorth}
    - Debt-to-Income Ratio: ${(analysisData.debtToIncomeRatio * 100).toFixed(1)}%
    - Savings Ratio: ${(analysisData.savingsRatio * 100).toFixed(2)}%
    - Financial Goals: ${goal ? goal.name : "None"}
    - Risk Tolerance: ${userData.riskProfile}
    - Recommended Investment Allocation: ${JSON.stringify(analysisData.recommendedInvestmentAllocation)}

    Instructions:
    - Provide a high-level executive summary (2-3 sentences).
    - Provide detailed actionable recommendations across different categories.
    - Include a specific debt strategy.
    - Provide investment suggestions based on the recommended allocation.
    - If a goal is provided, include a roadmap.
    - Keep tone professional and easy to follow.
    
    Return JSON with these exact fields: summary, budgetAnalysis (with ratio, status, advice), recommendations (array with category and advice), debtStrategy, investmentSuggestions (array), goalRoadmap.
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const response = result.response.text();
    
    // Try to parse as JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as AIRecommendation;
    }
    
    // If not JSON, return fallback
    return {
      summary: response.substring(0, 200),
      budgetAnalysis: {
        ratio: `${(analysisData.savingsRatio * 100).toFixed(1)}% Savings Rate`,
        status: analysisData.savingsRatio > 0.2 ? 'healthy' : analysisData.savingsRatio > 0.1 ? 'warning' : 'critical',
        advice: `Your expense ratio is ${(analysisData.expenseRatio * 100).toFixed(1)}%.`
      },
      recommendations: [
        { category: "Budgeting", advice: "Review your monthly expenses to identify potential savings." },
        { category: "Savings", advice: "Aim to save at least 20% of your monthly income." }
      ],
      debtStrategy: "Focus on paying off high-interest debt first.",
      investmentSuggestions: Object.entries(analysisData.recommendedInvestmentAllocation).map(([k, v]) => `${k}: ${userData.currency}${v}`),
    };
  } catch (e) {
    console.error("Failed to get AI advice", e);
    return {
      summary: "Unable to generate advice at this time. Please check your API key.",
      budgetAnalysis: {
        ratio: `${(analysisData.savingsRatio * 100).toFixed(1)}%`,
        status: 'warning',
        advice: "Please configure your Gemini API key."
      },
      recommendations: [
        { category: "Setup", advice: "Add your VITE_GEMINI_API_KEY to .env file" }
      ],
      debtStrategy: "N/A",
      investmentSuggestions: [],
    };
  }
}

export async function generateGoalPlan(userData: FinancialData, analysisData: AnalysisData, goal: FinancialGoal, userInstructions: string = "") {
  const prompt = `
    You are a Certified Financial Planner (CFP). Generate a detailed goal-oriented financial plan.
    
    USER'S SPECIFIC INSTRUCTIONS: ${userInstructions}
    
    User Goal: ${goal.name} (Target: ${userData.currency}${goal.targetAmount} in ${goal.timelineMonths} months)
    Profile Type: ${userData.profileType}
    Monthly Income: ${userData.currency}${userData.monthlyIncome}
    Monthly Expenses: ${userData.currency}${userData.monthlyExpenses}
    Monthly Savings: ${userData.currency}${analysisData.savings}
    Existing Savings: ${userData.currency}${userData.currentSavings}
    
    Create a detailed plan with these sections:
    1. Monthly Action Plan - specific steps to reach the goal
    2. Budget Adjustments - where to cut costs
    3. Timeline - month by month breakdown
    4. Risk Assessment - potential issues and solutions
  `;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (e) {
    console.error("Failed to generate goal plan", e);
    return "Unable to generate plan. Please check your API key configuration.";
  }
}

export function createFinancialChat(userData: FinancialData, analysisData: AnalysisData): ChatSession {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemPrompt = `You are a Certified Financial Planner (CFP). 
  User Profile: Income ${userData.currency}${userData.monthlyIncome}, Expenses ${userData.currency}${userData.monthlyExpenses}, 
  Savings ${userData.currency}${analysisData.savings}, Net Worth ${userData.currency}${analysisData.totalNetWorth}.
  Provide brief, actionable financial advice in bullet points.`;

  const chat = model.startChat({
    history: [{ role: "user", parts: [{ text: systemPrompt }] }]
  });

  return {
    sendMessage: async ({ message }: { message: string }) => {
      const result = await chat.sendMessage(message);
      return { text: result.response.text() };
    }
  };
}

