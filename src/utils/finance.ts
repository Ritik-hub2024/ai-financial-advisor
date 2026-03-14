import { FinancialData, AnalysisData } from "../types";

export function analyzeFinances(userData: FinancialData): AnalysisData {
  const savings = Math.max(0, userData.monthlyIncome - userData.monthlyExpenses);
  const debtToIncomeRatio = userData.monthlyIncome > 0 ? userData.totalDebt / userData.monthlyIncome : 0;
  const savingsRatio = userData.monthlyIncome > 0 ? savings / userData.monthlyIncome : 0;
  const expenseRatio = userData.monthlyIncome > 0 ? userData.monthlyExpenses / userData.monthlyIncome : 0;
  const debtToSavingsRatio = savings > 0 ? userData.totalDebt / savings : 0;
  const investmentCapacity = savings * 0.5;

  const totalNetWorth = userData.currentSavings + savings - userData.totalDebt;
  const emergencyFundTarget = userData.monthlyExpenses * 6;
  const emergencyFundShortfall = Math.max(0, emergencyFundTarget - userData.currentSavings);
  const emergencyFundMonthly = emergencyFundShortfall / 18;

  let investmentAllocation: Record<string, number> = {};
  const risk = userData.riskProfile;

  if (risk === "low") {
    investmentAllocation = {
      "High-Interest Savings / RD": investmentCapacity * 0.4,
      "Debt Mutual Funds / Bonds": investmentCapacity * 0.4,
      "ETFs / Balanced Funds": investmentCapacity * 0.2,
    };
  } else if (risk === "medium") {
    investmentAllocation = {
      "Stocks / Equity Funds": investmentCapacity * 0.3,
      "ETFs / Balanced Funds": investmentCapacity * 0.4,
      "Debt Mutual Funds / Bonds": investmentCapacity * 0.3,
    };
  } else if (risk === "high") {
    investmentAllocation = {
      "Stocks / Equity Funds": investmentCapacity * 0.5,
      "ETFs / Balanced Funds": investmentCapacity * 0.3,
      "Debt Mutual Funds / Bonds": investmentCapacity * 0.2,
    };
  } else {
    investmentAllocation = {
      "Stocks / Equity Funds": investmentCapacity * 0.3,
      "ETFs / Balanced Funds": investmentCapacity * 0.4,
      "Debt Mutual Funds / Bonds": investmentCapacity * 0.3,
    };
  }

  const highDebtAlert = debtToIncomeRatio > 0.4;

  return {
    savings,
    debtToIncomeRatio,
    savingsRatio,
    expenseRatio,
    debtToSavingsRatio,
    investmentCapacity,
    emergencyFundTarget,
    emergencyFundShortfall,
    emergencyFundMonthly,
    totalNetWorth,
    recommendedInvestmentAllocation: investmentAllocation,
    highDebtAlert,
  };
}

export function projectSavings(currentSavings: number, monthlySavings: number, months: number = 12, annualReturn: number = 0.07) {
  const data = [];
  const monthlyReturn = annualReturn / 12;
  let balance = currentSavings;

  for (let i = 0; i <= months; i++) {
    data.push({
      month: i,
      balance: Math.round(balance),
    });
    balance = (balance + monthlySavings) * (1 + monthlyReturn);
  }
  return data;
}

export function formatCurrency(amount: number, currency: string) {
  return `${currency}${amount.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}
