import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Legend, CartesianGrid, LineChart, Line } from 'recharts';
import { FinancialData, AnalysisData } from '../types';
import { formatCurrency, projectSavings } from '../utils/finance';
import { TrendingUp, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { Tooltip } from './Tooltip';

interface Props {
  data: FinancialData;
  analysis: AnalysisData;
}

export const Visualizer: React.FC<Props> = ({ data, analysis }) => {
  const investmentAllocation = analysis.recommendedInvestmentAllocation;
  
  const highInterest = investmentAllocation["High-Interest Savings / RD"] || 0;
  const stocks = investmentAllocation["Stocks / Equity Funds"] || 0;
  const etfs = investmentAllocation["ETFs / Balanced Funds"] || 0;
  const riskFree = investmentAllocation["Debt Mutual Funds / Bonds"] || 0;
  
  const totalInvestments = highInterest + stocks + etfs + riskFree;
  const remainingSavings = Math.max(0, analysis.savings - (analysis.emergencyFundMonthly + totalInvestments));

  const pieData = [
    { name: 'Emergency Fund', value: analysis.emergencyFundMonthly },
    { name: 'High-Interest/RD', value: highInterest },
    { name: 'Stocks/Equity', value: stocks },
    { name: 'ETFs/Balanced', value: etfs },
    { name: 'Debt/Bonds', value: riskFree },
    { name: 'Remaining Savings', value: remainingSavings },
  ].filter(item => item.value > 0);

  const barData = [
    { name: 'Income', amount: data.monthlyIncome, fill: '#10b981' },
    { name: 'Expenses', amount: data.monthlyExpenses, fill: '#ef4444' },
    { name: 'Savings', amount: analysis.savings, fill: '#3b82f6' },
    { name: 'Investments', amount: totalInvestments, fill: '#8b5cf6' },
    { name: 'Debt', amount: data.totalDebt, fill: '#f59e0b' },
  ];

  const budgetData = [
    { name: 'Expenses', value: data.monthlyExpenses, fill: '#ef4444' },
    { name: 'Savings', value: analysis.savings, fill: '#10b981' },
  ].filter(item => item.value > 0);

  const expensePieData = [
    { name: 'Housing', value: data.expenseBreakdown.housing, fill: '#f43f5e' },
    { name: 'Transport', value: data.expenseBreakdown.transportation, fill: '#3b82f6' },
    { name: 'Food', value: data.expenseBreakdown.food, fill: '#f59e0b' },
    { name: 'Entertainment', value: data.expenseBreakdown.entertainment, fill: '#8b5cf6' },
    { name: 'Other', value: data.expenseBreakdown.other, fill: '#64748b' },
  ].filter(item => item.value > 0);

  // What-If Projection
  const adjustedMonthlySavings = analysis.savings * (1 + (data.whatIfSavingsRate || 0));
  const projectionData = projectSavings(
    data.currentSavings, 
    adjustedMonthlySavings, 
    24, 
    data.whatIfReturnRate || 0.07
  );

  const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f43f5e', '#f59e0b', '#64748b'];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="h-[350px] card !p-6 flex flex-col !mb-0">
          <Tooltip content="Visual breakdown of your monthly income into expenses and potential savings.">
            <h4 className="text-sm font-bold text-zinc-800 mb-6 uppercase tracking-wider flex items-center gap-2 cursor-help">
              <PieIcon className="w-4 h-4 text-red-500" />
              Budget Allocation
            </h4>
          </Tooltip>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={budgetData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {budgetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value, data.currency)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-[350px] card !p-6 flex flex-col !mb-0">
          <Tooltip content="Breakdown of your monthly expenses by category.">
            <h4 className="text-sm font-bold text-zinc-800 mb-6 uppercase tracking-wider flex items-center gap-2 cursor-help">
              <PieIcon className="w-4 h-4 text-orange-500" />
              Expense Breakdown
            </h4>
          </Tooltip>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {expensePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value, data.currency)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-[350px] card !p-6 flex flex-col !mb-0">
          <Tooltip content="How your monthly savings are distributed across different asset classes.">
            <h4 className="text-sm font-bold text-zinc-800 mb-6 uppercase tracking-wider flex items-center gap-2 cursor-help">
              <PieIcon className="w-4 h-4 text-emerald-500" />
              Investment Distribution
            </h4>
          </Tooltip>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  formatter={(value: number) => formatCurrency(value, data.currency)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="h-[350px] card !p-6 flex flex-col !mb-0">
          <Tooltip content="Comparison of key financial figures to visualize your overall economic standing.">
            <h4 className="text-sm font-bold text-zinc-800 mb-6 uppercase tracking-wider flex items-center gap-2 cursor-help">
              <BarChart3 className="w-4 h-4 text-blue-500" />
              Financial Impact
            </h4>
          </Tooltip>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 10 }}
                  tickFormatter={(value) => `${data.currency}${value > 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
                />
                <RechartsTooltip 
                  cursor={{ fill: '#f8fafc' }}
                  formatter={(value: number) => formatCurrency(value, data.currency)}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="amount" radius={[6, 6, 0, 0]} barSize={30}>
                  {barData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Savings Projection Chart */}
      <div className="h-[400px] card !p-6 flex flex-col !mb-0">
        <div className="flex items-center justify-between mb-6">
          <Tooltip content="Estimated growth of your net worth over the next 2 years based on your current trajectory and what-if adjustments.">
            <h4 className="text-sm font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-2 cursor-help">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              24-Month Wealth Projection
            </h4>
          </Tooltip>
          <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Projected Growth
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="month" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }}
                label={{ value: 'Months', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#94a3b8' }}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fill: '#64748b', fontSize: 11 }}
                tickFormatter={(value) => `${data.currency}${value > 1000 ? (value/1000).toFixed(0) + 'k' : value}`}
              />
              <RechartsTooltip 
                formatter={(value: number) => formatCurrency(value, data.currency)}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
              />
              <Line 
                type="monotone" 
                dataKey="balance" 
                stroke="#10b981" 
                strokeWidth={3} 
                dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-[10px] text-zinc-400 italic mt-4 text-center">
          * Projection based on current savings, adjusted monthly savings, and expected return rate.
        </p>
      </div>
    </div>
  );
};
