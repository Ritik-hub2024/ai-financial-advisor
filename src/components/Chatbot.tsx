import React, { useState, useRef, useEffect } from 'react';
import { FinancialData, AnalysisData } from '../types';
import { createFinancialChat } from '../services/geminiService';
import { Send, User, Bot, Loader2, Sparkles, Lightbulb } from 'lucide-react';
import Markdown from 'react-markdown';

interface Props {
  data: FinancialData;
  analysis: AnalysisData;
}

interface ChatSession {
  sendMessage: (message: { message: string }) => Promise<{ text: string }>;
}

export const Chatbot: React.FC<Props> = ({ data, analysis }) => {
  const [messages, setMessages] = useState<{ role: 'user' | 'bot'; content: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  
  const chatRef = useRef<ChatSession | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // FIXED: Reset or re-initialize chat if data/analysis changes fundamentally
  // This ensures the AI isn't using "stale" financial context.
  useEffect(() => {
    chatRef.current = createFinancialChat(data, analysis);
  }, [data, analysis]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      // Safety check: ensure chat is initialized
      if (!chatRef.current) {
        chatRef.current = createFinancialChat(data, analysis);
      }

      const response = await chatRef.current.sendMessage({ message: userMessage });
      
      if (!response || !response.text) {
        throw new Error("Empty response from AI");
      }

      setMessages(prev => [...prev, { role: 'bot', content: response.text }]);
    } catch (err) {
      console.error("Chat Error:", err);
      setMessages(prev => [...prev, { role: 'bot', content: "I'm having trouble connecting to my financial brain. Please try again in a moment." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 h-[600px]">
      <div className="xl:col-span-2 flex flex-col glass-card overflow-hidden bg-white border border-zinc-200 rounded-2xl">
        {/* Header */}
        <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-800 leading-none">AI Financial Assistant</h3>
              <p className="text-[10px] text-zinc-500 font-medium mt-1">Ask me anything about your finances</p>
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth bg-white"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-zinc-400">
              <Bot className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm">Hello! I'm your AI financial advisor. How can I help you today?</p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-zinc-100 text-zinc-800 rounded-tl-none'
                }`}
              >
                <div className="flex items-center gap-2 mb-1 opacity-70 text-[10px] font-bold uppercase tracking-wider">
                  {msg.role === 'user' ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  {msg.role === 'user' ? 'You' : 'FinAI'}
                </div>
                <div className="prose prose-sm prose-zinc max-w-none dark:prose-invert leading-relaxed">
                  <Markdown>{msg.content}</Markdown>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-zinc-100 p-4 rounded-2xl rounded-tl-none">
                <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-zinc-100 bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question here..."
              className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-200 text-white p-2 rounded-xl transition-all shadow-lg shadow-emerald-100 flex items-center justify-center"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <div className="glass-card p-6 border-l-4 border-amber-400 bg-white shadow-sm rounded-xl">
          <h4 className="font-bold text-zinc-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Chat Tips
          </h4>
          <ul className="space-y-3">
            {["Ask about investments", "Get budgeting advice", "Discuss debt management"].map((tip, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-zinc-600">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-6 bg-emerald-50 border border-emerald-100 rounded-xl">
          <h4 className="font-bold text-emerald-800 text-sm mb-2">Context Aware</h4>
          <p className="text-xs text-emerald-600 leading-relaxed">
            I have access to your current financial profile and analysis to provide highly personalized answers.
          </p>
        </div>
      </div>
    </div>
  );
};