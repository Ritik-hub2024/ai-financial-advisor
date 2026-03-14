export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface FinancialData {
  monthlyIncome: number;
  monthlyExpenses: number;
  expenseBreakdown: {
    housing: number;
    transportation: number;
    food: number;
    entertainment: number;
    other: number;
  };
  currentSavings: number;
  totalDebt: number;
  currency: string;
  riskProfile: 'low' | 'medium' | 'high';
  profileType: 'Student' | 'Professional' | 'Retiree';
  hasPartTimeIncome?: boolean;
  extraIncome?: number;
  goalsText?: string;
  whatIfSavingsRate?: number;
  whatIfReturnRate?: number;
}

export interface AnalysisData {
  savings: number;
  debtToIncomeRatio: number;
  savingsRatio: number;
  expenseRatio: number;
  debtToSavingsRatio: number;
  investmentCapacity: number;
  emergencyFundTarget: number;
  emergencyFundShortfall: number;
  emergencyFundMonthly: number;
  totalNetWorth: number;
  recommendedInvestmentAllocation: Record<string, number>;
  highDebtAlert: boolean;
}

export interface FinancialGoal {
  name: string;
  targetAmount: number;
  timelineMonths: number;
}

export interface AIRecommendation {
  summary: string;
  budgetAnalysis: {
    ratio: string;
    status: 'healthy' | 'warning' | 'critical';
    advice: string;
  };
  recommendations: {
    category: string;
    advice: string;
  }[];
  debtStrategy: string;
  investmentSuggestions: string[];
  goalRoadmap?: string;
}
