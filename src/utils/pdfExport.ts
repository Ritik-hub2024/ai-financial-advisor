import jsPDF from 'jspdf';
import { FinancialData, FinancialGoal, AIRecommendation } from '../types';
import { analyzeFinances, formatCurrency } from './finance';

interface ExportOptions {
  includeCharts?: boolean;
  includeRecommendations?: boolean;
  includeGoalPlan?: boolean;
}

export const exportToPDF = async (
  data: FinancialData,
  goal: FinancialGoal,
  recommendation: AIRecommendation | null,
  goalPlan: string | null,
  analysis: ReturnType<typeof analyzeFinances>,
  userName: string,
  options: ExportOptions = {}
): Promise<void> => {
  const {
    includeCharts = false,
    includeRecommendations = true,
    includeGoalPlan = true
  } = options;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let yPos = margin;

  // Helper function to check if we need a new page
  const checkNewPage = (height: number) => {
    if (yPos + height > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      yPos = margin;
      return true;
    }
    return false;
  };

  // Helper to add text with word wrap
  const addWrappedText = (text: string, fontSize: number, isBold: boolean = false, lineHeight: number = 7) => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      checkNewPage(lineHeight);
      doc.text(line, margin, yPos);
      yPos += lineHeight;
    });
  };

  // Helper to add a horizontal line
  const addLine = () => {
    checkNewPage(10);
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
  };

  // =====================
  // HEADER
  // =====================
  // Green header bar
  doc.setFillColor(5, 150, 105); // emerald-700
  doc.rect(0, 0, pageWidth, 35, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('AI Financial Advisor Report', margin, 22);
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated on: ${new Date().toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`, margin, 30);

  yPos = 45;

  // =====================
  // USER INFO
  // =====================
  doc.setTextColor(0, 0, 0);
  addWrappedText(`Prepared for: ${userName}`, 11, true);
  addWrappedText(`Profile Type: ${data.profileType} | Risk Profile: ${data.riskProfile}`, 10);
  addLine();

  // =====================
  // FINANCIAL SUMMARY
  // =====================
  addWrappedText('FINANCIAL SUMMARY', 14, true);
  yPos += 5;

  // Key Metrics Grid
  const metrics = [
    { label: 'Monthly Income', value: formatCurrency(data.monthlyIncome, data.currency) },
    { label: 'Monthly Expenses', value: formatCurrency(data.monthlyExpenses, data.currency) },
    { label: 'Monthly Savings', value: formatCurrency(analysis.savings, data.currency) },
    { label: 'Savings Ratio', value: `${(analysis.savingsRatio * 100).toFixed(1)}%` },
    { label: 'Current Savings', value: formatCurrency(data.currentSavings, data.currency) },
    { label: 'Total Debt', value: formatCurrency(data.totalDebt, data.currency) },
    { label: 'Net Worth', value: formatCurrency(analysis.totalNetWorth, data.currency) },
    { label: 'Debt-to-Income Ratio', value: `${(analysis.debtToIncomeRatio * 100).toFixed(1)}%` },
  ];

  // Display metrics in 2 columns
  const colWidth = contentWidth / 2;
  metrics.forEach((metric, index) => {
    const col = index % 2;
    const xPos = margin + col * colWidth;
    const yOffset = yPos + Math.floor(index / 2) * 15;
    
    checkNewPage(15);
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(metric.label.toUpperCase(), xPos, yOffset);
    
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.text(metric.value, xPos, yOffset + 6);
    
    // Reset font
    doc.setFont('helvetica', 'normal');
  });
  
  yPos += Math.ceil(metrics.length / 2) * 15 + 10;

  // =====================
  // EXPENSE BREAKDOWN
  // =====================
  addLine();
  addWrappedText('EXPENSE BREAKDOWN', 14, true);
  yPos += 5;

  const expenses = [
    { label: 'Housing', value: data.expenseBreakdown.housing },
    { label: 'Transportation', value: data.expenseBreakdown.transportation },
    { label: 'Food', value: data.expenseBreakdown.food },
    { label: 'Entertainment', value: data.expenseBreakdown.entertainment },
    { label: 'Other', value: data.expenseBreakdown.other },
  ];

  expenses.forEach((expense) => {
    checkNewPage(10);
    const percentage = data.monthlyExpenses > 0 
      ? ((expense.value / data.monthlyExpenses) * 100).toFixed(1) 
      : '0.0';
    addWrappedText(`${expense.label}: ${data.currency}${expense.value.toLocaleString()} (${percentage}%)`, 10);
  });

  // =====================
  // INVESTMENT ALLOCATION
  // =====================
  addLine();
  addWrappedText('RECOMMENDED INVESTMENT ALLOCATION', 14, true);
  yPos += 5;

  Object.entries(analysis.recommendedInvestmentAllocation).forEach(([key, value]) => {
    checkNewPage(10);
    addWrappedText(`${key}: ${formatCurrency(value, data.currency)}`, 10);
  });

  // =====================
  // AI RECOMMENDATIONS
  // =====================
  if (includeRecommendations && recommendation) {
    addLine();
    addWrappedText('AI RECOMMENDATIONS', 14, true);
    yPos += 5;

    if (recommendation.summary) {
      addWrappedText(recommendation.summary, 10);
      yPos += 3;
    }

    if (recommendation.recommendations && recommendation.recommendations.length > 0) {
      recommendation.recommendations.forEach((rec, index) => {
        checkNewPage(20);
        addWrappedText(`${index + 1}. ${rec.category}`, 11, true, 8);
        addWrappedText(rec.advice, 10, false, 6);
        yPos += 2;
      });
    }
  }

  // =====================
  // GOAL PLANNING
  // =====================
  if (includeGoalPlan && goal.name) {
    addLine();
    addWrappedText('GOAL PLANNING', 14, true);
    yPos += 5;

    addWrappedText(`Goal: ${goal.name}`, 11, true);
    addWrappedText(`Target Amount: ${formatCurrency(goal.targetAmount, data.currency)}`, 10);
    addWrappedText(`Timeline: ${goal.timelineMonths} months`, 10);
    
    const monthlyNeeded = goal.timelineMonths > 0 
      ? (goal.targetAmount - data.currentSavings) / goal.timelineMonths 
      : 0;
    addWrappedText(`Monthly Savings Needed: ${formatCurrency(monthlyNeeded, data.currency)}`, 10);
  }

  // Goal Plan Details
  if (includeGoalPlan && goalPlan) {
    yPos += 5;
    addWrappedText('AI-GENERATED ACTION PLAN', 11, true);
    yPos += 3;
    
    // Add the goal plan content (truncated if too long for PDF)
    const planText = goalPlan.length > 2000 ? goalPlan.substring(0, 2000) + '...' : goalPlan;
    addWrappedText(planText, 9);
  }

  // =====================
  // FOOTER
  // =====================
  addLine();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'This report is generated by AI Financial Advisor and is for informational purposes only.',
    margin,
    yPos + 5
  );
  doc.text(
    'Consult with a qualified financial advisor before making investment decisions.',
    margin,
    yPos + 10
  );

  // Save the PDF
  const fileName = `Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

// Export a simple summary PDF (smaller file size)
export const exportSummaryPDF = async (
  data: FinancialData,
  analysis: ReturnType<typeof analyzeFinances>,
  userName: string
): Promise<void> => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let yPos = margin;

  // Header
  doc.setFillColor(5, 150, 105);
  doc.rect(0, 0, pageWidth, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Financial Summary Report', margin, 20);
  
  yPos = 40;
  doc.setTextColor(0, 0, 0);
  
  // User Info
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Prepared for: ${userName}`, margin, yPos);
  yPos += 10;
  
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, yPos);
  yPos += 15;
  
  // Key Metrics
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Key Financial Metrics', margin, yPos);
  yPos += 10;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const metrics = [
    `Monthly Income: ${formatCurrency(data.monthlyIncome, data.currency)}`,
    `Monthly Expenses: ${formatCurrency(data.monthlyExpenses, data.currency)}`,
    `Monthly Savings: ${formatCurrency(analysis.savings, data.currency)}`,
    `Savings Ratio: ${(analysis.savingsRatio * 100).toFixed(1)}%`,
    `Current Savings: ${formatCurrency(data.currentSavings, data.currency)}`,
    `Total Debt: ${formatCurrency(data.totalDebt, data.currency)}`,
    `Net Worth: ${formatCurrency(analysis.totalNetWorth, data.currency)}`,
  ];
  
  metrics.forEach((metric) => {
    doc.text(`• ${metric}`, margin, yPos);
    yPos += 7;
  });

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    'Generated by AI Financial Advisor',
    margin,
    doc.internal.pageSize.getHeight() - 10
  );

  const fileName = `Financial_Summary_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

