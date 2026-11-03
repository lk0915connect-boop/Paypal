import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Trash2, 
  Loader2, 
  User, 
  DollarSign, 
  AlertCircle, 
  ShieldCheck, 
  Lightbulb,
  ArrowRight,
  TrendingDown,
  PieChart
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface ChatMessageItem {
  id?: number;
  message: string;
  response: string;
  created_at?: string;
}

export const AiAdvisorPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [initialLoading, setInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'How much did I spend this month?',
    'Where can I reduce my expenses?',
    'Create a monthly saving plan for me.',
    'Analyze my spending habits by category.',
    'Audit my PayPal transactions and subscriptions.',
    'What is my 50/30/20 budget recommendation?',
  ];

  const fetchHistory = async () => {
    setInitialLoading(true);
    try {
      const res = await api.getChatHistory();
      setMessages(res.history || []);
    } catch (err: any) {
      console.warn('Chat history failed:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = (messageText || input).trim();
    if (!textToSend || loading) return;

    setError('');
    setInput('');
    setLoading(true);

    // Optimistic pending state
    const tempId = Date.now();
    const optimisticMessage: ChatMessageItem = {
      id: tempId,
      message: textToSend,
      response: '',
      created_at: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const res = await api.sendChatMessage(textToSend);
      setMessages((prev) =>
        prev.map((m) => (m.id === tempId ? { ...m, response: res.reply } : m))
      );
    } catch (err: any) {
      setError(err.message || 'Failed to get financial advice from AI service.');
      setMessages((prev) =>
        prev.map((m) =>
          m.id === tempId
            ? {
                ...m,
                response:
                  '⚠️ **Error Communicating with AI:** ' +
                  (err.message || 'Unable to connect to financial advisory engine. Please check API key.'),
              }
            : m
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (confirm('Clear all conversation history with PaySmart AI?')) {
      try {
        await api.clearChatHistory();
        setMessages([]);
      } catch (err: any) {
        alert(err.message || 'Failed to clear history');
      }
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] max-w-5xl mx-auto space-y-4">
      
      {/* Advisor Header */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#003087] via-[#0070BA] to-purple-600 text-white shadow-md shadow-blue-500/20">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                PaySmart AI Financial Assistant
              </h1>
              <span className="rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[10px] px-2 py-0.5 font-semibold">
                Gemini 3.8 Flash
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Grounded in your authenticated SQLite ledger & verified PayPal transaction data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClearHistory}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs text-slate-600 hover:text-rose-600 dark:text-slate-300 dark:hover:text-rose-400 transition-colors"
              title="Clear chat history"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear Chat</span>
            </button>
          )}
        </div>
      </div>

      {/* Chat Area Container */}
      <div className="flex-1 overflow-y-auto rounded-2xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 p-4 sm:p-6 space-y-6">
        
        {/* Welcome Empty State */}
        {messages.length === 0 && !initialLoading && (
          <div className="flex flex-col items-center justify-center py-10 text-center max-w-lg mx-auto">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-[#0070BA] dark:text-blue-400 mb-4 shadow-sm">
              <Sparkles className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Hello, {user?.name || 'there'}! I'm your PaySmart AI Advisor.
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              I can analyze your monthly cashflow, audit recurring subscriptions, uncover spending trends across PayPal and other channels, and build tailored budgets.
            </p>

            <div className="mt-6 w-full text-left">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block mb-2 text-center">
                Recommended Questions
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(q)}
                    className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-2.5 text-xs text-slate-700 dark:text-slate-200 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-950/40 text-left transition-all"
                  >
                    <span>{q}</span>
                    <ArrowRight className="h-3 w-3 text-slate-400 shrink-0 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Message Thread */}
        {messages.map((item, idx) => (
          <div key={idx} className="space-y-4">
            
            {/* User message */}
            <div className="flex items-start justify-end gap-2.5">
              <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl bg-[#0070BA] px-4 py-3 text-xs text-white shadow-xs">
                <p className="leading-relaxed whitespace-pre-wrap">{item.message}</p>
              </div>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-[#0070BA] dark:text-blue-300 font-bold text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
            </div>

            {/* AI Response */}
            <div className="flex items-start gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#003087] to-purple-600 text-white">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="max-w-[90%] sm:max-w-[85%] rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 text-xs text-slate-800 dark:border-slate-700/80 dark:bg-slate-800/60 dark:text-slate-200 shadow-xs">
                {item.response ? (
                  <div className="prose prose-xs dark:prose-invert max-w-none space-y-2 leading-relaxed">
                    {item.response.split('\n\n').map((paragraph, pIdx) => (
                      <p key={pIdx} className="whitespace-pre-wrap">{paragraph}</p>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-slate-400 py-1">
                    <Loader2 className="h-4 w-4 animate-spin text-[#0070BA]" />
                    <span>Analyzing your verified financial transactions...</span>
                  </div>
                )}
              </div>
            </div>

          </div>
        ))}

        <div ref={chatBottomRef} />
      </div>

      {/* Suggested Quick Pills (when conversation is active) */}
      {messages.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
            Suggested:
          </span>
          {suggestedQuestions.slice(0, 4).map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              disabled={loading}
              className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1 text-slate-600 dark:text-slate-300 hover:border-[#0070BA] dark:hover:border-blue-400 whitespace-nowrap text-[11px] transition-colors"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="relative flex items-center"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about your spending, PayPal transactions, or budget..."
          disabled={loading}
          className="w-full rounded-2xl border border-slate-300 bg-white py-3 pl-4 pr-12 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-r from-[#0070BA] to-[#003087] text-white hover:opacity-90 disabled:opacity-40 transition-opacity"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
        </button>
      </form>

    </div>
  );
};
