
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialData, FinancialGoal, AIRecommendation } from './types';
import { Sidebar } from './components/Sidebar';
import { Visualizer } from './components/Visualizer';
import { AIAdvice } from './components/AIAdvice';
import { Chatbot } from './components/Chatbot';
import { GoalProgress } from './components/GoalProgress';
import { getFinancialAdvice, generateGoalPlan, createFinancialChat } from './services/geminiService';
import { analyzeFinances, formatCurrency } from './utils/finance';
import { Success, Warning, Error as ErrorMsg, Spinner } from './components/feedback';
import { BrainCircuit, Loader2, RefreshCcw, ShieldCheck, TrendingUp, LayoutDashboard, MessageSquare, PieChart, Target, Wallet, CreditCard, PiggyBank, AlertTriangle, Info, Trash2, Menu, X, Sparkles, Github, ExternalLink, LogOut, User as UserIcon, FileDown, ArrowUpRight, ArrowDownRight, DollarSign, Percent, Building, Car, GraduationCap, Home, Plane, Heart, Zap } from 'lucide-react';
import { splitGoalSections } from './utils/parsers';
import { Layout } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { Profile } from './components/Profile';
import { DashboardEnhanced } from './components/DashboardEnhanced';

const GITHUB_URL = "https://github.com/rathore1907/AI-Financial-Advisor";
const DEMO_URL = "https://ai-financial-advisor-demo.vercel.app";

type Tab = 'dashboard' | 'chatbot' | 'goalPlanning' | 'profile';

import { Tooltip } from './components/Tooltip';
import { exportToPDF, exportSummaryPDF } from './utils/pdfExport';

export default function App() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [financialData, setFinancialData] = useState<FinancialData>(() => {
    const defaultData: FinancialData = {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      expenseBreakdown: { housing: 0, transportation: 0, food: 0, entertainment: 0, other: 0 },
      currentSavings: 0,
      totalDebt: 0,
      currency: '₹',
      riskProfile: 'medium',
      profileType: 'Professional',
      hasPartTimeIncome: false,
      extraIncome: 0,
      goalsText: '',
      whatIfSavingsRate: 0,
      whatIfReturnRate: 0.07,
    };
    try {
      const saved = localStorage.getItem('finai_data');
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...defaultData, ...parsed, expenseBreakdown: { ...defaultData.expenseBreakdown, ...(parsed.expenseBreakdown || {}) } };
      }
      return defaultData;
    } catch (e) { return defaultData; }
  });

  const [advancedInstructions, setAdvancedInstructions] = useState('');

  const [goal, setGoal] = useState<FinancialGoal>(() => {
    try {
      const saved = localStorage.getItem('finai_goal');
      return saved ? JSON.parse(saved) : { name: '', targetAmount: 0, timelineMonths: 0 };
    } catch (e) { return { name: '', targetAmount: 0, timelineMonths: 0 }; }
  });

  useEffect(() => {
    const timer = setTimeout(() => { localStorage.setItem('finai_data', JSON.stringify(financialData)); }, 500);
    return () => clearTimeout(timer);
  }, [financialData]);

  useEffect(() => {
    const timer = setTimeout(() => { localStorage.setItem('finai_goal', JSON.stringify(goal)); }, 500);
    return () => clearTimeout(timer);
  }, [goal]);

  const [recommendation, setRecommendation] = useState<AIRecommendation | null>(null);
  const [goalPlan, setGoalPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAbout, setShowAbout] = useState(false);

  const analysis = useMemo(() => {
    const totalIncome = financialData.monthlyIncome + (financialData.hasPartTimeIncome ? (financialData.extraIncome || 0) : 0);
    return analyzeFinances({ ...financialData, monthlyIncome: totalIncome });
  }, [financialData]);

  const handleAnalyze = async () => {
    if (financialData.monthlyIncome <= 0) { setError("Please enter a valid monthly income."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const result = await getFinancialAdvice(financialData, analysis, goal.name ? goal : undefined);
      setRecommendation(result as AIRecommendation);
      setSuccess("Financial analysis generated successfully!");
      setActiveTab('dashboard');
    } catch (err) { setError("Failed to get AI advice. Please check your connection and try again."); } 
    finally { setLoading(false); }
  };

  const handleGenerateGoalPlan = async () => {
    if (!goal.name && !financialData.goalsText) { setError("Please set a goal first."); return; }
    setLoading(true); setError(null); setSuccess(null);
    try {
      const activeGoal = goal.name ? goal : { name: financialData.goalsText?.split(',')[0].trim() || 'My Goal', targetAmount: 0, timelineMonths: 12 };
      const plan = await generateGoalPlan(financialData, analysis, activeGoal, advancedInstructions);
      setGoalPlan(plan || "No plan generated.");
      setSuccess("Advanced goal plan generated successfully!");
      setActiveTab('goalPlanning');
    } catch (err) { setError("Failed to generate goal plan."); } 
    finally { setLoading(false); }
  };

  const reset = () => {
    if (window.confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      localStorage.removeItem('finai_data'); localStorage.removeItem('finai_goal');
      setRecommendation(null); setGoalPlan(null); setError(null); setSuccess(null);
      setFinancialData({ monthlyIncome: 0, monthlyExpenses: 0, expenseBreakdown: { housing: 0, transportation: 0, food: 0, entertainment: 0, other: 0 }, currentSavings: 0, totalDebt: 0, currency: '₹', riskProfile: 'medium', profileType: 'Professional', hasPartTimeIncome: false, extraIncome: 0, goalsText: '', whatIfSavingsRate: 0, whatIfReturnRate: 0.07 });
      setGoal({ name: '', targetAmount: 0, timelineMonths: 0 });
      setSuccess("All data has been reset.");
    }
  };

  const handleExportPDF = async () => {
    if (!isAuthenticated) { setError("Please login to export PDF reports."); return; }
    if (!user) { setError("User information not available."); return; }
    if (financialData.monthlyIncome <= 0) { setError("Please enter your financial data before exporting."); return; }
    setLoading(true);
    try {
      await exportToPDF(financialData, goal, recommendation, goalPlan, analysis, user.name);
      setSuccess("PDF report downloaded successfully!");
    } catch (err) { setError("Failed to generate PDF. Please try again."); } 
    finally { setLoading(false); }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white shadow-2xl mx-auto mb-4 animate-pulse">
            <BrainCircuit className="w-10 h-10" />
          </div>
          <p className="text-zinc-500 font-medium">Loading your Financial Advisor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authView === 'login' ? <Login onSwitchToRegister={() => setAuthView('register')} /> : <Register onSwitchToLogin={() => setAuthView('login')} />}
      </>
    );
  }

  // Calculate financial health score
  const healthScore = Math.min(100, Math.max(0, Math.round(
    (analysis.savingsRatio >= 0.2 ? 30 : analysis.savingsRatio * 150) +
    (analysis.debtToIncomeRatio <= 0.2 ? 25 : analysis.debtToIncomeRatio <= 0.36 ? 20 : 5) +
    (financialData.currentSavings >= financialData.monthlyExpenses * 6 ? 25 : financialData.currentSavings >= financialData.monthlyExpenses * 3 ? 15 : 5) +
    (financialData.monthlyIncome > 0 ? 20 : 0)
  )));

  const getHealthColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-600', label: 'Excellent' };
    if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-600', label: 'Good' };
    if (score >= 40) return { bg: 'bg-amber-500', text: 'text-amber-600', label: 'Fair' };
    return { bg: 'bg-red-500', text: 'text-red-600', label: 'Needs Work' };
  };

  const health = getHealthColor(healthScore);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-emerald-50/30 to-teal-50/20 flex flex-col lg:flex-row">
      <Sidebar data={financialData} onChange={setFinancialData} goal={goal} onGoalChange={setGoal} onAnalyze={() => { handleAnalyze(); setIsMobileMenuOpen(false); }} loading={loading} />

      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />
            <motion.div initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 left-0 w-80 bg-white z-50 lg:hidden shadow-2xl">
              <Sidebar data={financialData} onChange={setFinancialData} goal={goal} onGoalChange={setGoal} onAnalyze={() => { handleAnalyze(); setIsMobileMenuOpen(false); }} loading={loading} isMobile />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="bg-white/80 backdrop-blur-md border-b border-zinc-200/50 sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="lg:hidden p-2 -ml-2 text-zinc-500 hover:text-zinc-700">{isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}</button>
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">AI Financial Advisor</h1>
                <p className="text-xs text-zinc-500 font-medium">Your Personal Wealth Assistant</p>
              </div>
            </div>
            
            <nav className="hidden md:flex items-center bg-gradient-to-r from-zinc-100 to-zinc-50 p-1 rounded-2xl">
              {[
                { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
                { id: 'chatbot', icon: MessageSquare, label: 'AI Chat' },
                { id: 'goalPlanning', icon: Target, label: 'Goals' },
                { id: 'profile', icon: UserIcon, label: 'Profile' }
              ].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id as Tab)} className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${activeTab === item.id ? 'bg-white text-emerald-600 shadow-md' : 'text-zinc-500 hover:text-zinc-700'}`}>
                  <item.icon className="w-4 h-4" /> {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              {user && <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-lg border border-emerald-100"><UserIcon className="w-4 h-4 text-emerald-500" /><span className="text-sm font-semibold text-zinc-700">{user.name}</span></div>}
              <button onClick={logout} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors" title="Logout"><LogOut className="w-5 h-5" /></button>
              <button onClick={() => setShowAbout(!showAbout)} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors" title="About"><Info className="w-5 h-5" /></button>
              <button onClick={reset} className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-lg transition-colors" title="Reset"><Trash2 className="w-5 h-5" /></button>
              <Tooltip content="Export PDF Report">
                <button onClick={handleExportPDF} disabled={loading} className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 rounded-lg transition-all shadow-lg shadow-emerald-200 disabled:opacity-50">
                  <FileDown className="w-5 h-5" />
                </button>
              </Tooltip>
              <div className="hidden sm:flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full"><ShieldCheck className="w-3 h-3" /> Secured</div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        {activeTab !== 'profile' && (
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 py-8 px-4 sm:px-6 lg:px-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse"></div>
          </div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto relative z-10 text-center">
            <h2 className="text-3xl md:text-4xl font-black mb-3">Master Your Financial Future 🤖💰</h2>
            <p className="text-lg text-emerald-100/90 max-w-2xl mx-auto">AI-powered financial planning, investment strategies, and goal tracking powered by Google Gemini.</p>
          </motion.div>
        </div>
        )}

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
          <div className="max-w-4xl mx-auto">{loading && <Spinner message="AI is analyzing your finances..." />}{error && <ErrorMsg message={error} />}{success && <Success message={success} />}</div>

          <div className="w-full">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' ? (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-12"
                >
                  {/* Section 1: Summary */}
                  <section id="summary-section" className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                      <div>
                        <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                          <LayoutDashboard className="w-6 h-6 text-emerald-600" /> Financial Summary
                        </h3>
                        <p className="text-sm text-zinc-500">A high-level overview of your current financial standing.</p>
                      </div>
                    </div>

                    {/* Metrics Overview */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Tooltip content="Calculated as Income minus Expenses. This is your monthly wealth-building capacity.">
                        <div className="card !p-6 flex items-center gap-4 !mb-0 h-full hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                            <Wallet className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Monthly Savings</p>
                            <p className="text-xl font-black text-zinc-900">{formatCurrency(analysis.savings, financialData.currency)}</p>
                          </div>
                        </div>
                      </Tooltip>
                      <Tooltip content="The percentage of your income you are saving. 20% or more is generally recommended.">
                        <div className="card !p-6 flex items-center gap-4 !mb-0 h-full hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                            <PieChart className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Savings Ratio</p>
                            <p className="text-xl font-black text-zinc-900">{(analysis.savingsRatio * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </Tooltip>
                      <Tooltip content="Your total debt relative to your monthly income. Keeping this below 36-40% is ideal.">
                        <div className="card !p-6 flex items-center gap-4 !mb-0 h-full hover:shadow-md transition-shadow">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${analysis.highDebtAlert ? 'bg-red-50 text-red-600' : 'bg-zinc-50 text-zinc-600'}`}>
                            <CreditCard className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Debt Ratio</p>
                            <p className={`text-xl font-black ${analysis.highDebtAlert ? 'text-red-600' : 'text-zinc-900'}`}>{(analysis.debtToIncomeRatio * 100).toFixed(1)}%</p>
                          </div>
                        </div>
                      </Tooltip>
                      <Tooltip content="Total Savings minus Total Debt. Your overall financial value.">
                        <div className="card !p-6 flex items-center gap-4 !mb-0 h-full hover:shadow-md transition-shadow">
                          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                            <PiggyBank className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Net Worth</p>
                            <p className="text-xl font-black text-zinc-900">{formatCurrency(analysis.totalNetWorth, financialData.currency)}</p>
                          </div>
                        </div>
                      </Tooltip>
                    </div>

                    {analysis.highDebtAlert && (
                      <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
                        <AlertTriangle className="w-5 h-5 shrink-0" />
                        <p className="text-sm font-medium">High Debt Alert: Your debt-to-income ratio is above 40%. Consider prioritizing debt repayment.</p>
                      </div>
                    )}
                  </section>

                  {/* Section 2: Recommendations */}
                  {recommendation && (
                    <section id="recommendations-section" className="space-y-6">
                      <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                        <div>
                          <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-emerald-600" /> AI Recommendations
                          </h3>
                          <p className="text-sm text-zinc-500">Personalized strategies and insights generated by Gemini AI.</p>
                        </div>
                      </div>
                      <AIAdvice 
                        recommendation={recommendation} 
                        onChatNow={() => setActiveTab('chatbot')}
                      />
                    </section>
                  )}

                  {/* Section 3: Charts & Visual Analytics */}
                  <section id="charts-section" className="space-y-6">
                    <div className="flex items-center justify-between border-b border-zinc-200 pb-4">
                      <div>
                        <h3 className="text-2xl font-black text-zinc-900 flex items-center gap-2">
                          <PieChart className="w-6 h-6 text-emerald-600" /> Visual Analytics
                        </h3>
                        <p className="text-sm text-zinc-500">Detailed breakdown of your budget, investments, and wealth projections.</p>
                      </div>
                    </div>

                    {financialData.monthlyIncome <= 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center p-12 card border-dashed border-2">
                        <div className="w-20 h-20 bg-zinc-100 rounded-full flex items-center justify-center mb-6">
                          <TrendingUp className="w-10 h-10 text-zinc-400" />
                        </div>
                        <h3 className="text-xl font-bold text-zinc-800 mb-2">Ready to optimize your wealth?</h3>
                        <p className="text-zinc-500 max-w-md">
                          Enter your financial details in the sidebar to see your budget visualizations, 
                          and click "Analyze & Advise" for personalized AI insights.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                        <div className="xl:col-span-2">
                          <Visualizer data={financialData} analysis={analysis} />
                        </div>
                        <div className="space-y-6">
                          <GoalProgress goal={goal} data={financialData} />
                          <div className="p-6 rounded-2xl bg-emerald-900 text-emerald-50 shadow-xl">
                            <Tooltip content="Recommended breakdown of your monthly savings into different investment vehicles based on your risk profile.">
                              <h3 className="font-bold text-lg mb-2 flex items-center gap-2 cursor-help">
                                <Target className="w-5 h-5" /> Investment Allocation
                              </h3>
                            </Tooltip>
                            <div className="space-y-3 mt-4">
                              {Object.entries(analysis.recommendedInvestmentAllocation).map(([key, value]) => (
                                <Tooltip key={key} content={`Recommended monthly investment in ${key}.`}>
                                  <div className="flex justify-between items-center text-sm">
                                    <span className="text-emerald-100/80">{key}</span>
                                    <span className="font-bold">{formatCurrency(value, financialData.currency)}</span>
                                  </div>
                                </Tooltip>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </section>
                </motion.div>
              ) : activeTab === 'chatbot' ? (
                <motion.div
                  key="chatbot"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Chatbot data={financialData} analysis={analysis} />
                </motion.div>
              ) : activeTab === 'profile' ? (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <Profile />
                </motion.div>
              ) : (
                <motion.div
                  key="goalPlanning"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="card !p-8 mb-8">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                        <Target className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-zinc-900">Goal Planning</h3>
                        <p className="text-sm text-zinc-500">Define your financial objectives and let AI create a roadmap for you.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                          Goal Name
                        </label>
                        <input
                          type="text"
                          value={goal.name}
                          onChange={(e) => setGoal({ ...goal, name: e.target.value })}
                          placeholder="e.g. Dream House"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                          Target Amount ({financialData.currency})
                        </label>
                        <input
                          type="number"
                          value={goal.targetAmount || ''}
                          onChange={(e) => setGoal({ ...goal, targetAmount: parseFloat(e.target.value) || 0 })}
                          placeholder="0.00"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                          Timeline (Months)
                        </label>
                        <input
                          type="number"
                          value={goal.timelineMonths || ''}
                          onChange={(e) => setGoal({ ...goal, timelineMonths: parseInt(e.target.value) || 0 })}
                          placeholder="12"
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                        />
                      </div>
                    </div>

                    <h3 className="text-lg font-bold text-zinc-800 mb-4 flex items-center gap-2">
                      <BrainCircuit className="w-5 h-5 text-emerald-600" /> Advanced Planning Instructions
                    </h3>
                    <div className="space-y-4">
                      <Tooltip content="Provide specific instructions to the AI for a more customized financial plan.">
                        <textarea
                          value={advancedInstructions}
                          onChange={(e) => setAdvancedInstructions(e.target.value)}
                          placeholder="e.g., I want to save 30% of income directly, Pay debt as fast as possible, Reach goal in 2 years, Invest only in stocks, etc."
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all h-24 resize-none"
                        />
                      </Tooltip>
                      <button
                        onClick={handleGenerateGoalPlan}
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <RefreshCcw className="w-5 h-5" />
                            Generate AI Action Plan
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {goalPlan && (
                    <>
                      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-8 rounded-2xl text-white shadow-xl mb-8 text-center">
                        <h2 className="text-3xl font-bold flex items-center justify-center gap-3">
                          <Target className="w-8 h-8" /> Goal-Oriented Planning
                        </h2>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {splitGoalSections(goalPlan).map((section, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="card !p-6 border-l-4 border-emerald-600 hover:shadow-lg transition-shadow"
                          >
                            <h4 className="font-bold text-emerald-700 mb-3 flex items-center gap-2">
                              <Layout className="w-4 h-4" />
                              {section.title}
                            </h4>
                            <div className="text-sm text-zinc-600 prose prose-zinc max-w-none">
                              <Markdown>{section.content}</Markdown>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* About Tool Section */}
            {showAbout && (
              <motion.section 
                id="about-section" 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="pt-12 mt-12 border-t border-zinc-200"
              >
                <div className="card !p-8 bg-zinc-50 border-zinc-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                      <Info className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-zinc-900">About FinAI Advisor</h3>
                      <p className="text-sm text-zinc-500">Understanding the purpose and technology behind your advisor.</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-3">
                      <h4 className="font-bold text-emerald-700 uppercase tracking-widest text-xs">Purpose</h4>
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        FinAI Advisor is designed to democratize professional financial planning. By combining traditional financial metrics with advanced AI, we provide personalized, actionable advice that was previously only available through expensive human consultants.
                      </p>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-emerald-700 uppercase tracking-widest text-xs">Use Cases</h4>
                      <ul className="text-sm text-zinc-600 space-y-2">
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> Debt Repayment Optimization</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> Long-term Wealth Building</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> Specific Goal Planning (House, Car, Retirement)</li>
                        <li className="flex items-center gap-2"><div className="w-1 h-1 bg-emerald-500 rounded-full" /> Risk-adjusted Investment Allocation</li>
                      </ul>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-bold text-emerald-700 uppercase tracking-widest text-xs">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {['React 18', 'TypeScript', 'Google Gemini 3.1 Pro', 'Tailwind CSS', 'Framer Motion', 'Recharts'].map(tech => (
                          <span key={tech} className="px-3 py-1 bg-white border border-zinc-200 rounded-full text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* GitHub and Demo Links */}
                  <div className="mt-8 pt-6 border-t border-zinc-200">
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                      <a
                        href={GITHUB_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <Github className="w-4 h-4" />
                        View on GitHub
                      </a>
                      <a
                        href={DEMO_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors text-sm font-medium"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Live Demo
                      </a>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </div>
        </main>

        {/* Footer Info */}
        <footer className="max-w-7xl mx-auto px-4 text-center py-8 text-zinc-400 text-xs mt-auto">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-4">
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
            <span className="hidden sm:inline">•</span>
            <a
              href={DEMO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-emerald-600 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Live Demo
            </a>
          </div>
          <p>© 2026 FinAI Advisor. Powered by Google Gemini. For educational purposes only.</p>
        </footer>
      </div>
    </div>
  );
}
