import React, { useState, useEffect } from 'react';
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const TIPS = [
  {
    title: "The 50/30/20 Rule",
    content: "Allocate 50% of income to needs, 30% to wants, and 20% to savings and debt repayment.",
    category: "Budgeting"
  },
  {
    title: "Emergency Fund First",
    content: "Aim to save 3-6 months of essential expenses before aggressive investing.",
    category: "Saving"
  },
  {
    title: "Start Investing Early",
    content: "Compound interest is your best friend. Even small amounts invested early grow significantly over time.",
    category: "Investing"
  },
  {
    title: "Pay Yourself First",
    content: "Automate your savings so that a portion of your paycheck goes to savings before you can spend it.",
    category: "Saving"
  },
  {
    title: "Diversify Your Portfolio",
    content: "Don't put all your eggs in one basket. Spread investments across different asset classes.",
    category: "Investing"
  },
  {
    title: "Track Every Penny",
    content: "Use an app or spreadsheet to log all expenses. Awareness is the first step to control.",
    category: "Budgeting"
  },
  {
    title: "Avoid Lifestyle Creep",
    content: "When your income increases, try to maintain your current spending and save the difference.",
    category: "Saving"
  },
  {
    title: "Understand High-Interest Debt",
    content: "Prioritize paying off high-interest debt like credit cards before focusing on low-return investments.",
    category: "Debt"
  }
];

export const FinancialTips: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TIPS.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const nextTip = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % TIPS.length);
  };

  const prevTip = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + TIPS.length) % TIPS.length);
  };

  const currentTip = TIPS[currentIndex];

  return (
    <div className="bg-zinc-900 rounded-2xl p-5 text-white relative overflow-hidden group">
      {/* Background Accent */}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-emerald-500/20 rounded-lg text-emerald-400">
              <Lightbulb className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
              Financial Tip
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button 
              onClick={prevTip}
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              onClick={nextTip}
              className="p-1 hover:bg-white/10 rounded-md transition-colors text-zinc-400 hover:text-white"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="min-h-[100px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h4 className="text-sm font-bold mb-1.5 text-zinc-100">{currentTip.title}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {currentTip.content}
              </p>
              <div className="mt-3 inline-block px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-medium text-zinc-500 uppercase tracking-wider">
                {currentTip.category}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress Dots */}
        <div className="flex gap-1 mt-4">
          {TIPS.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${
                idx === currentIndex ? 'w-4 bg-emerald-500' : 'w-1 bg-zinc-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
