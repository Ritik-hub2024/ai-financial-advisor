import React from 'react';
import { AIRecommendation } from '../types';
import { Sparkles, MessageCircle, TrendingUp, Shield, Lightbulb, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface AIAdviceProps {
  recommendation: AIRecommendation;
  onChatNow: () => void;
}

export const AIAdvice: React.FC<AIAdviceProps> = ({ recommendation, onChatNow }) => {
  if (!recommendation) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-600 bg-emerald-50 border-emerald-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-zinc-600 bg-zinc-50 border-zinc-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'warning': 
      case 'critical': return <AlertCircle className="w-5 h-5" />;
      default: return <Shield className="w-5 h-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Summary */}
      {recommendation.summary && (
        <div className="card !p-6 bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-bold text-emerald-800">AI Summary</h4>
              <p className="text-xs text-emerald-600">Your personalized financial overview</p>
            </div>
          </div>
          <p className="text-sm text-emerald-900 leading-relaxed">
            {recommendation.summary}
          </p>
        </div>
      )}

      {/* Budget Analysis */}
      {recommendation.budgetAnalysis && (
        <div className={`card !p-6 border ${getStatusColor(recommendation.budgetAnalysis.status)}`}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              recommendation.budgetAnalysis.status === 'healthy' ? 'bg-emerald-100' : 
              recommendation.budgetAnalysis.status === 'warning' ? 'bg-amber-100' : 'bg-red-100'
            }`}>
              {getStatusIcon(recommendation.budgetAnalysis.status)}
            </div>
            <div>
              <h4 className="font-bold">Budget Analysis</h4>
              <p className="text-xs opacity-75">Ratio: {recommendation.budgetAnalysis.ratio}</p>
            </div>
          </div>
          <p className="text-sm leading-relaxed">
            {recommendation.budgetAnalysis.advice}
          </p>
        </div>
      )}

      {/* Recommendations */}
      {recommendation.recommendations && recommendation.recommendations.length > 0 && (
        <div className="card !p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-bold text-blue-800">Personalized Recommendations</h4>
              <p className="text-xs text-blue-600">Actionable advice based on your profile</p>
            </div>
          </div>
          <div className="space-y-4">
            {recommendation.recommendations.map((rec, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-4 bg-zinc-50 rounded-xl"
              >
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                  {rec.category}
                </span>
                <p className="text-sm text-zinc-700 mt-1">
                  {rec.advice}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Debt Strategy */}
      {recommendation.debtStrategy && (
        <div className="card !p-6 bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h4 className="font-bold text-red-800">Debt Strategy</h4>
              <p className="text-xs text-red-600">Plan to become debt-free</p>
            </div>
          </div>
          <p className="text-sm text-red-900 leading-relaxed">
            {recommendation.debtStrategy}
          </p>
        </div>
      )}

      {/* Investment Suggestions */}
      {recommendation.investmentSuggestions && recommendation.investmentSuggestions.length > 0 && (
        <div className="card !p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h4 className="font-bold text-indigo-800">Investment Suggestions</h4>
              <p className="text-xs text-indigo-600">Growth opportunities for your portfolio</p>
            </div>
          </div>
          <ul className="space-y-3">
            {recommendation.investmentSuggestions.map((suggestion, idx) => (
              <motion.li 
                key={idx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="flex items-start gap-3 text-sm text-indigo-900"
              >
                <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-1.5 shrink-0" />
                <span>{suggestion}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      )}

      {/* Goal Roadmap */}
      {recommendation.goalRoadmap && (
        <div className="card !p-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-bold text-amber-800">Goal Roadmap</h4>
              <p className="text-xs text-amber-600">Your path to financial goals</p>
            </div>
          </div>
          <p className="text-sm text-amber-900 leading-relaxed">
            {recommendation.goalRoadmap}
          </p>
        </div>
      )}

      {/* Chat Now Button */}
      <button
        onClick={onChatNow}
        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2"
      >
        <MessageCircle className="w-5 h-5" />
        Ask AI for More Details
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};

export default AIAdvice;

