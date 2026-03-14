import React from 'react';
import { CheckCircle, AlertTriangle, Loader2, XCircle } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuccessProps {
  message: string;
}

export const Success: React.FC<SuccessProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-700"
    >
      <CheckCircle className="w-5 h-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

interface WarningProps {
  message: string;
}

export const Warning: React.FC<WarningProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-700"
    >
      <AlertTriangle className="w-5 h-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

interface ErrorProps {
  message: string;
}

export const Error: React.FC<ErrorProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
    >
      <XCircle className="w-5 h-5 shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};

interface SpinnerProps {
  message?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({ message = "Loading..." }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex items-center justify-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-700"
    >
      <Loader2 className="w-5 h-5 animate-spin" />
      <p className="text-sm font-medium">{message}</p>
    </motion.div>
  );
};
