import React from 'react';
import { Wallet, CreditCard, PiggyBank, TrendingUp, ShieldCheck, Percent, Activity, LayoutDashboard, Sparkles, BarChart3, DollarSign } from 'lucide-react';
import { FinancialData, AnalysisData, FinancialGoal } from '../types';
import { formatCurrency } from '../utils/finance';

interface DashboardEnhancedProps {
  data: FinancialData;
  goal: FinancialGoal;
  analysis: AnalysisData;
  user: { name: string };
  hasRecommendation: boolean;
  onGetAdvice: () => void;
}

export const DashboardEnhanced: React.FC<DashboardEnhancedProps> = ({
  data,
  analysis,
  user,
  hasRecommendation,
  onGetAdvice
}) => {
  const totalIncome = data.monthlyIncome + (data.extraIncome || 0);

  return (
    <div className="space-y-8">
      {/* Hero Welcome Banner */}
      {totalIncome > 0 ? (
        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Welcome back, {user.name}! 👋</h3>
              <p className="text-emerald-100">Your financial overview is ready. Here's what's happening with your money.</p>
            </div>
            <div className="text-center md:text-right bg-white/20 rounded-xl p-4">
              <p className="text-emerald-100 text-sm">Total Monthly Income</p>
              <p className="text-3xl font-black">{formatCurrency(totalIncome, data.currency)}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold mb-2">Welcome to AI Financial Advisor! 🚀</h3>
              <p className="text-amber-100">Start by entering your financial details to get personalized AI-powered insights.</p>
            </div>
            <Sparkles className="w-16 h-16 text-amber-200 opacity-50" />
          </div>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(totalIncome, data.currency)}</p>
          <p className="text-xs text-zinc-500 mt-1">Monthly Income</p>
        </div>
        
        <div className="glass-card rounded-xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/50 rounded-lg flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-red-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(data.monthlyExpenses, data.currency)}</p>
          <p className="text-xs text-zinc-500 mt-1">Monthly Expenses</p>
        </div>
        
        <div className="glass-card rounded-xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex items-center justify-center">
              <PiggyBank className="w-5 h-5 text-blue-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(analysis.savings, data.currency)}</p>
          <p className="text-xs text-zinc-500 mt-1">Monthly Savings</p>
        </div>
        
        <div className="glass-card rounded-xl p-5 shadow-sm border border-zinc-100 dark:border-zinc-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/50 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
          </div>
          <p className="text-2xl font-bold text-zinc-900">{formatCurrency(analysis.totalNetWorth, data.currency)}</p>
          <p className="text-xs text-zinc-500 mt-1">Net Worth</p>
        </div>
      </div>

      {/* Financial Health Score Card */}
      {totalIncome > 0 && (
      <div className="glass-card rounded-2xl p-6 shadow-sm border border-zinc-100 dark:border-zinc-700">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-600 rounded-xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Financial Health Score</h4>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Your financial wellness at a glance</p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Circular Progress */}
            <div className="flex flex-col items-center">
              <div className="relative w-36 h-36">
                <svg className="w-36 h-36 transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" stroke="#e5e7eb" strokeWidth="10" fill="none" />
                  <circle 
                    cx="50" cy="50" r="42" 
                    stroke={analysis.savingsRatio >= 0.2 ? "#10b981" : analysis.savingsRatio >= 0.1 ? "#f59e0b" : "#ef4444"} 
                    strokeWidth="10" 
                    fill="none"
                    strokeDasharray={`${Math.min(analysis.savingsRatio * 264, 264)} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black text-zinc-900">{Math.round(analysis.savingsRatio * 100)}%</span>
                  <span className="text-xs text-zinc-500">Savings</span>
                </div>
              </div>
            </div>
            
            {/* Health Metrics */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Percent className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-medium">Savings Rate</span>
                </div>
                <span className={`font-bold ${analysis.savingsRatio >= 0.2 ? 'text-emerald-600' : analysis.savingsRatio >= 0.1 ? 'text-amber-600' : 'text-red-600'}`}>
                  {analysis.savingsRatio >= 0.2 ? '✓ Excellent' : analysis.savingsRatio >= 0.1 ? '⚠ Needs Work' : '✗ Critical'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <CreditCard className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium">Debt Level</span>
                </div>
                <span className={`font-bold ${analysis.debtToIncomeRatio <= 0.36 ? 'text-emerald-600' : analysis.debtToIncomeRatio <= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                  {analysis.debtToIncomeRatio <= 0.36 ? '✓ Healthy' : analysis.debtToIncomeRatio <= 0.5 ? '⚠ High' : '✗ Critical'}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-zinc-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <PiggyBank className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium">Emergency Fund</span>
                </div>
                <span className="font-bold text-zinc-900">
                  {data.currentSavings > data.monthlyExpenses * 3 ? '✓ Adequate (3+ months)' : `⚠ ${Math.round(data.currentSavings / data.monthlyExpenses)} months only`}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!hasRecommendation && totalIncome > 0 && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 text-white shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Sparkles className="w-10 h-10 text-purple-200" />
              <div>
                <h4 className="text-lg font-bold">Get AI-Powered Advice</h4>
                <p className="text-purple-100 text-sm">Let our AI analyze your finances and provide personalized recommendations</p>
              </div>
            </div>
            <button 
              onClick={onGetAdvice}
              className="bg-white text-purple-600 px-6 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors shadow-lg"
            >
              Analyze Now
            </button>
          </div>
        </div>
      )}

      {/* Visual Analytics Preview */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-100">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-xl flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-zinc-900">Financial Overview</h4>
            <p className="text-sm text-zinc-500">Your financial metrics at a glance</p>
          </div>
        </div>
        
        {totalIncome > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium text-emerald-700">Savings</span>
              </div>
              <p className="text-2xl font-bold text-emerald-700">{formatCurrency(analysis.savings, data.currency)}</p>
              <p className="text-xs text-emerald-600 mt-1">per month</p>
            </div>
            
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Savings Rate</span>
              </div>
              <p className="text-2xl font-bold text-blue-700">{(analysis.savingsRatio * 100).toFixed(1)}%</p>
              <p className="text-xs text-blue-600 mt-1">of income</p>
            </div>
            
            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-red-600" />
                <span className="text-sm font-medium text-red-700">Debt Ratio</span>
              </div>
              <p className="text-2xl font-bold text-red-700">{(analysis.debtToIncomeRatio * 100).toFixed(1)}%</p>
              <p className="text-xs text-red-600 mt-1">of income</p>
            </div>
            
            <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-700">Net Worth</span>
              </div>
              <p className="text-2xl font-bold text-amber-700">{formatCurrency(analysis.totalNetWorth, data.currency)}</p>
              <p className="text-xs text-amber-600 mt-1">total</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <LayoutDashboard className="w-16 h-16 text-zinc-300 mx-auto mb-4" />
            <h5 className="text-lg font-bold text-zinc-700 mb-2">No Data Yet</h5>
            <p className="text-zinc-500">Enter your financial details in the sidebar to see your financial overview</p>
          </div>
        )}
      </div>

      {/* Alerts */}
      {analysis.highDebtAlert && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700">
          <CreditCard className="w-5 h-5" />
          <div>
            <p className="font-bold">High Debt Alert</p>
            <p className="text-sm">Your debt-to-income ratio is above 40%. Consider prioritizing debt repayment.</p>
          </div>
        </div>
      )}

      {totalIncome > 0 && data.currentSavings < data.monthlyExpenses * 3 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700">
          <PiggyBank className="w-5 h-5" />
          <div>
            <p className="font-bold">Emergency Fund Needed</p>
            <p className="text-sm">We recommend building an emergency fund of at least 3 months of expenses.</p>
          </div>
        </div>
      )}
    </div>
  );
};
