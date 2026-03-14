import React from 'react';
import { FinancialGoal, FinancialData } from '../types';
import { Target, TrendingUp, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface GoalProgressProps {
  goal: FinancialGoal;
  data: FinancialData;
}

export const GoalProgress: React.FC<GoalProgressProps> = ({ goal, data }) => {
  if (!goal.name || goal.targetAmount <= 0) {
    return (
      <div className="p-6 rounded-2xl bg-zinc-50 border border-zinc-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-zinc-100 rounded-xl flex items-center justify-center">
            <Target className="w-5 h-5 text-zinc-400" />
          </div>
          <div>
            <h3 className="font-bold text-zinc-700">Goal Progress</h3>
            <p className="text-xs text-zinc-500">Track your financial goals</p>
          </div>
        </div>
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <Target className="w-8 h-8 text-zinc-300" />
          </div>
          <p className="text-sm text-zinc-500">Set a goal to start tracking</p>
          <p className="text-xs text-zinc-400 mt-1">Go to Goal Planning tab</p>
        </div>
      </div>
    );
  }

  const monthlySavings = data.monthlyIncome - data.monthlyExpenses;
  const monthsToGoal = monthlySavings > 0 ? Math.ceil(goal.targetAmount / monthlySavings) : 0;
  const progressPercent = data.currentSavings > 0 
    ? Math.min(100, (data.currentSavings / goal.targetAmount) * 100) 
    : 0;
  const isOnTrack = monthsToGoal <= goal.timelineMonths;

  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
          <Target className="w-5 h-5 text-emerald-600" />
        </div>
        <div>
          <h3 className="font-bold text-emerald-800">{goal.name}</h3>
          <p className="text-xs text-emerald-600">Financial Goal</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-end mb-2">
          <span className="text-sm font-medium text-emerald-700">Progress</span>
          <span className="text-lg font-bold text-emerald-800">{progressPercent.toFixed(1)}%</span>
        </div>
        <div className="h-3 bg-emerald-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-emerald-600">
          <span>₹{data.currentSavings.toLocaleString()}</span>
          <span>₹{goal.targetAmount.toLocaleString()}</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-white/50 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600">Monthly Savings</span>
          </div>
          <p className="font-bold text-emerald-800">₹{monthlySavings.toLocaleString()}</p>
        </div>
        
        <div className="p-3 bg-white/50 rounded-xl">
          <div className="flex items-center gap-2 mb-1">
            <Calendar className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-600">Est. Completion</span>
          </div>
          <p className="font-bold text-emerald-800">
            {monthsToGoal > 0 ? `${monthsToGoal} months` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Timeline Status */}
      <div className={`mt-4 p-3 rounded-xl flex items-center gap-2 ${
        isOnTrack ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
      }`}>
        {isOnTrack ? (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-xs font-medium">On track to meet your goal!</span>
          </>
        ) : (
          <>
            <ChevronRight className="w-4 h-4" />
            <span className="text-xs font-medium">Increase savings to meet goal in time</span>
          </>
        )}
      </div>

      {/* Target Date */}
      {goal.timelineMonths > 0 && (
        <div className="mt-4 pt-4 border-t border-emerald-200">
          <div className="flex justify-between items-center text-sm">
            <span className="text-emerald-600">Target Timeline</span>
            <span className="font-bold text-emerald-800">{goal.timelineMonths} months</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default GoalProgress;

