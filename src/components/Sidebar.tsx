import React from 'react';
import { Wallet, CreditCard, PiggyBank, Receipt, User, Target, Shield, Loader2, BrainCircuit, RefreshCcw, Calendar, DollarSign, Home, Car, Utensils, Tv, MoreHorizontal } from 'lucide-react';
import { Tooltip } from './Tooltip';
import { FinancialTips } from './FinancialTips';
import { FinancialData, FinancialGoal } from '../types';

interface Props {
  data: FinancialData;
  onChange: (data: FinancialData) => void;
  goal: FinancialGoal;
  onGoalChange: (goal: FinancialGoal) => void;
  onAnalyze: () => void;
  loading: boolean;
  isMobile?: boolean;
}


export const Sidebar: React.FC<Props> = ({ data, onChange, goal, onGoalChange, onAnalyze, loading, isMobile }) => {
const [errors, setErrors] = React.useState<Record<string, string>>({});


  const validateField = (name: string, value: string) => {
    if (value === '') {
setErrors((prev: Record<string, string>) => {
  const newErrors = { ...prev };
  delete newErrors[name];
  return newErrors;
});
      return;
    }

    const numValue = parseFloat(value);
    let error = '';

    if (isNaN(numValue)) {
      error = 'Invalid number';
    } else if (numValue < 0) {
      error = 'Must be positive';
    }

setErrors((prev: Record<string, string>) => ({
  ...prev,
  [name]: error
}));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    if (type === 'number') {
      validateField(name, value);
    }

    onChange({
      ...data,
      [name]: (name === 'currency' || name === 'riskProfile' || name === 'profileType' || name === 'goalsText' || type === 'checkbox') 
        ? val 
        : parseFloat(value) || 0
    });
  };

  const handleExpenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    validateField(name, value);
    
    const numValue = parseFloat(value) || 0;
    const newBreakdown = {
      ...data.expenseBreakdown,
      [name]: numValue
    };
    const totalExpenses = Object.values(newBreakdown).reduce((sum: number, val: number) => sum + val, 0);
    onChange({
      ...data,
      expenseBreakdown: newBreakdown,
      monthlyExpenses: totalExpenses
    });
  };

  const handleGoalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'number') {
      validateField(name, value);
    }

    onGoalChange({
      ...goal,
      [name]: name === 'name' ? value : parseFloat(value) || 0
    });
  };

  const containerClasses = isMobile 
    ? "w-full h-full overflow-y-auto p-6 space-y-8"
    : "w-full lg:w-80 xl:w-96 glass-card border-r border-zinc-200 dark:border-zinc-700 h-screen sticky top-0 overflow-y-auto p-6 space-y-8 hidden lg:block";

  return (
    <aside className={containerClasses}>
      <Tooltip content="Enter your financial details here to generate a personalized analysis.">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-bold text-zinc-900">Data Entry Panel</h2>
        </div>
      </Tooltip>

      <div className="space-y-6">
        {/* Profile Section */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <User className="w-3.5 h-3.5" /> Profile Type
            </label>
            <Tooltip content="Select your current life stage to tailor the financial advice.">
              <select
                name="profileType"
                value={data.profileType}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="Student">Student</option>
                <option value="Professional">Professional</option>
                <option value="Retiree">Retiree</option>
              </select>
            </Tooltip>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5" /> Monthly Income
            </label>
            <Tooltip content="This represents your net take-home pay after all taxes and deductions.">
              <input
                type="number"
                name="monthlyIncome"
                value={data.monthlyIncome || ''}
                onChange={handleChange}
                className={`w-full bg-zinc-50 border ${errors.monthlyIncome ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-2 text-sm outline-none transition-all`}
                placeholder="Enter take-home pay after taxes"
              />
            </Tooltip>
            {errors.monthlyIncome && <p className="text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.monthlyIncome}</p>}
          </div>

          {data.profileType === 'Student' && (
            <div className="space-y-4 pt-2 border-t border-zinc-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="hasPartTimeIncome"
                  checked={data.hasPartTimeIncome}
                  onChange={handleChange}
                  className="rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-sm text-zinc-600">Do you have part-time income?</span>
              </label>
              
              {data.hasPartTimeIncome && (
                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                  <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Extra Income</label>
                  <Tooltip content="Any additional income from side hustles or part-time work (net take-home pay).">
                    <input
                      type="number"
                      name="extraIncome"
                      value={data.extraIncome || ''}
                      onChange={handleChange}
                      className={`w-full bg-zinc-50 border ${errors.extraIncome ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-2 text-sm outline-none transition-all`}
                      placeholder="0.00"
                    />
                  </Tooltip>
                  {errors.extraIncome && <p className="text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.extraIncome}</p>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Financials Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="space-y-3">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Receipt className="w-3.5 h-3.5" /> Monthly Expenses
            </label>
            
            <div className="grid grid-cols-1 gap-3 pl-2 border-l-2 border-zinc-100">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <Home className="w-2.5 h-2.5" /> Housing
                </label>
                <Tooltip content="Monthly cost for rent, mortgage, property taxes, and insurance.">
                  <input
                    type="number"
                    name="housing"
                    value={data.expenseBreakdown.housing || ''}
                    onChange={handleExpenseChange}
                    className={`w-full bg-zinc-50 border ${errors.housing ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-1.5 text-sm outline-none transition-all`}
                    placeholder="0.00"
                  />
                </Tooltip>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <Car className="w-2.5 h-2.5" /> Transportation
                </label>
                <Tooltip content="Monthly expenses for car payments, fuel, maintenance, or public transit.">
                  <input
                    type="number"
                    name="transportation"
                    value={data.expenseBreakdown.transportation || ''}
                    onChange={handleExpenseChange}
                    className={`w-full bg-zinc-50 border ${errors.transportation ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-1.5 text-sm outline-none transition-all`}
                    placeholder="0.00"
                  />
                </Tooltip>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <Utensils className="w-2.5 h-2.5" /> Food
                </label>
                <Tooltip content="Monthly budget for groceries and dining out.">
                  <input
                    type="number"
                    name="food"
                    value={data.expenseBreakdown.food || ''}
                    onChange={handleExpenseChange}
                    className={`w-full bg-zinc-50 border ${errors.food ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-1.5 text-sm outline-none transition-all`}
                    placeholder="0.00"
                  />
                </Tooltip>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <Tv className="w-2.5 h-2.5" /> Entertainment
                </label>
                <Tooltip content="Expenses for movies, hobbies, subscriptions, and leisure activities.">
                  <input
                    type="number"
                    name="entertainment"
                    value={data.expenseBreakdown.entertainment || ''}
                    onChange={handleExpenseChange}
                    className={`w-full bg-zinc-50 border ${errors.entertainment ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-1.5 text-sm outline-none transition-all`}
                    placeholder="0.00"
                  />
                </Tooltip>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <MoreHorizontal className="w-2.5 h-2.5" /> Other
                </label>
                <Tooltip content="Any other recurring monthly expenses not covered in other categories.">
                  <input
                    type="number"
                    name="other"
                    value={data.expenseBreakdown.other || ''}
                    onChange={handleExpenseChange}
                    className={`w-full bg-zinc-50 border ${errors.other ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-1.5 text-sm outline-none transition-all`}
                    placeholder="0.00"
                  />
                </Tooltip>
              </div>
            </div>

            <Tooltip content="The sum of all your monthly expense categories.">
              <div className="pt-2 flex justify-between items-center text-xs font-bold text-zinc-500 border-t border-zinc-100 cursor-help">
                <span>TOTAL EXPENSES</span>
                <span className="text-emerald-600">{data.currency}{data.monthlyExpenses.toLocaleString()}</span>
              </div>
            </Tooltip>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <PiggyBank className="w-3.5 h-3.5" /> Existing Savings
            </label>
            <Tooltip content="Total amount of liquid cash you currently have in savings/checking.">
              <input
                type="number"
                name="currentSavings"
                value={data.currentSavings || ''}
                onChange={handleChange}
                className={`w-full bg-zinc-50 border ${errors.currentSavings ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-2 text-sm outline-none transition-all`}
                placeholder="0.00"
              />
            </Tooltip>
            {errors.currentSavings && <p className="text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.currentSavings}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5" /> Total Debts
            </label>
            <Tooltip content="Sum of all outstanding loans, credit card balances, etc.">
              <input
                type="number"
                name="totalDebt"
                value={data.totalDebt || ''}
                onChange={handleChange}
                className={`w-full bg-zinc-50 border ${errors.totalDebt ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-2 text-sm outline-none transition-all`}
                placeholder="0.00"
              />
            </Tooltip>
            {errors.totalDebt && <p className="text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.totalDebt}</p>}
          </div>
        </div>

        {/* Specific Goal Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
            <Target className="w-3.5 h-3.5" /> Savings Goal Details
          </label>
          
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-400 uppercase">Goal Name</label>
              <Tooltip content="A descriptive name for what you are saving for.">
                <input
                  type="text"
                  name="name"
                  value={goal.name}
                  onChange={handleGoalChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                  placeholder="e.g. New Car"
                />
              </Tooltip>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <DollarSign className="w-2.5 h-2.5" /> Target
                </label>
                <Tooltip content="The total amount of money you need to reach this goal.">
                  <input
                    type="number"
                    name="targetAmount"
                    value={goal.targetAmount || ''}
                    onChange={handleGoalChange}
                    className={`w-full bg-zinc-50 border ${errors.targetAmount ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-2 text-sm outline-none transition-all`}
                    placeholder="0.00"
                  />
                </Tooltip>
                {errors.targetAmount && <p className="text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.targetAmount}</p>}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-400 uppercase flex items-center gap-1">
                  <Calendar className="w-2.5 h-2.5" /> Months
                </label>
                <Tooltip content="How many months you plan to save to reach this goal.">
                  <input
                    type="number"
                    name="timelineMonths"
                    value={goal.timelineMonths || ''}
                    onChange={handleGoalChange}
                    className={`w-full bg-zinc-50 border ${errors.timelineMonths ? 'border-red-300 focus:ring-red-500' : 'border-zinc-200 focus:ring-emerald-500'} rounded-lg px-3 py-2 text-sm outline-none transition-all`}
                    placeholder="12"
                  />
                </Tooltip>
                {errors.timelineMonths && <p className="text-[10px] text-red-500 font-medium animate-in fade-in slide-in-from-top-1">{errors.timelineMonths}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Goals Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Target className="w-3.5 h-3.5" /> Financial Goals
            </label>
            <Tooltip content="List any other specific financial objectives you have.">
              <textarea
                name="goalsText"
                value={data.goalsText}
                onChange={handleChange}
                rows={3}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all resize-none"
                placeholder="e.g. Buy a house, Emergency fund, Retirement"
              />
            </Tooltip>
            <p className="text-[10px] text-zinc-400 italic">Separate goals with commas</p>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Shield className="w-3.5 h-3.5" /> Risk Preference
            </label>
            <Tooltip content="How much market volatility you are comfortable with for your investments.">
              <select
                name="riskProfile"
                value={data.riskProfile}
                onChange={handleChange}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
              >
                <option value="low">Low Risk</option>
                <option value="medium">Medium Risk</option>
                <option value="high">High Risk</option>
              </select>
            </Tooltip>
          </div>
        </div>
        
        {/* What-If Analysis Section */}
        <div className="space-y-4 pt-4 border-t border-zinc-100">
          <Tooltip content="Experiment with different scenarios to see how they affect your financial future.">
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2 cursor-help">
              <RefreshCcw className="w-3.5 h-3.5" /> What-If Analysis
            </label>
          </Tooltip>
          
          <div className="space-y-4 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-emerald-700 uppercase">
                <span>Savings Rate Adj.</span>
                <span>{((data.whatIfSavingsRate || 0) * 100).toFixed(0)}%</span>
              </div>
              <Tooltip content="Simulate how changing your monthly savings will impact your long-term wealth.">
                <input
                  type="range"
                  name="whatIfSavingsRate"
                  min="-0.5"
                  max="0.5"
                  step="0.05"
                  value={data.whatIfSavingsRate || 0}
                  onChange={handleChange}
                  className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </Tooltip>
              <p className="text-[9px] text-emerald-600/70 italic">Adjust your monthly savings target</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-emerald-700 uppercase">
                <span>Expected Return</span>
                <span>{((data.whatIfReturnRate || 0.07) * 100).toFixed(1)}%</span>
              </div>
              <Tooltip content="The estimated annual growth rate of your investments.">
                <input
                  type="range"
                  name="whatIfReturnRate"
                  min="0.01"
                  max="0.25"
                  step="0.005"
                  value={data.whatIfReturnRate || 0.07}
                  onChange={handleChange}
                  className="w-full h-1.5 bg-emerald-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
              </Tooltip>
              <p className="text-[9px] text-emerald-600/70 italic">Simulate different market conditions</p>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-zinc-100">
          <FinancialTips />
        </div>

        <button
          onClick={onAnalyze}
          disabled={loading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-300 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 mt-8"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>Analyze & Advise</>
          )}
        </button>
      </div>
    </aside>
  );
};

