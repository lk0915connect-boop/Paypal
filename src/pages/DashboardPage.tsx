import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard, 
  ReceiptText, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownRight, 
  ShieldCheck, 
  Plus, 
  Clock, 
  ChevronRight, 
  Loader2,
  PieChart as PieIcon,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { DashboardStats, Transaction } from '../types';
import { api } from '../services/api';
import { formatCurrency } from '../utils/finance';
import { useAuth } from '../context/AuthContext';

interface DashboardPageProps {
  onOpenQuickPay: () => void;
  onOpenNewTx: () => void;
  onNavigateTab: (tab: string) => void;
  onViewReceipt: (tx: Transaction) => void;
}

const CATEGORY_COLORS: Record<string, string> = {
  Bills: '#0070BA',
  Shopping: '#8B5CF6',
  Food: '#EC4899',
  Transport: '#F59E0B',
  Education: '#10B981',
  Healthcare: '#06B6D4',
  Entertainment: '#6366F1',
  Other: '#64748B',
  Salary: '#10B981',
  Freelance: '#3B82F6',
  Investments: '#14B8A6',
};

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenQuickPay,
  onOpenNewTx,
  onNavigateTab,
  onViewReceipt,
}) => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [aiInsight, setAiInsight] = useState<any>(null);
  const [loadingInsight, setLoadingInsight] = useState<boolean>(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const fetchAiInsight = async () => {
    setLoadingInsight(true);
    try {
      const data = await api.getAiInsights();
      setAiInsight(data);
    } catch (err) {
      console.warn('Failed to load quick AI insight:', err);
    } finally {
      setLoadingInsight(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchAiInsight();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#0070BA]" />
          <p className="text-xs text-slate-500">Loading your PaySmart AI ledger...</p>
        </div>
      </div>
    );
  }

  const currency = user?.currency || 'USD';
  const cashflow = stats?.cashflow || {
    totalIncome: 0,
    totalExpenses: 0,
    netSavings: 0,
    savingsRate: 0,
    totalTransactions: 0,
  };

  const hasDemo = stats?.recentTransactions.some((t) => t.is_demo === 1);

  return (
    <div className="space-y-6">
      
      {/* Top Banner / Welcome Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              Financial Overview
            </h1>
            {hasDemo && (
              <span className="rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                Sample Demo Data Active
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time balance, automated PayPal reconciliation & Google Gemini spending diagnostics.
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewTx}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span>Add Record</span>
          </button>

          <button
            onClick={onOpenQuickPay}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0070BA] to-[#003087] px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-[#005ea6] hover:to-[#00266e] transition-all transform active:scale-95 cursor-pointer"
          >
            <span className="font-extrabold italic text-amber-300 text-sm">P</span>
            <span>Pay with PayPal</span>
          </button>
        </div>
      </div>

      {/* METRIC KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Net Balance / Savings */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Net Balance</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-[#0070BA] dark:bg-blue-950/60 dark:text-blue-300">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(cashflow.netSavings, currency)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs">
            <span className={`inline-flex items-center font-bold ${cashflow.netSavings >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {cashflow.netSavings >= 0 ? <TrendingUp className="h-3.5 w-3.5 mr-0.5" /> : <TrendingDown className="h-3.5 w-3.5 mr-0.5" />}
              {cashflow.savingsRate}% Savings Rate
            </span>
          </div>
        </div>

        {/* Total Income */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Inflow (Income)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <ArrowDownRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-emerald-600 dark:text-emerald-400">
            {formatCurrency(cashflow.totalIncome, currency)}
          </p>
          <p className="mt-2 text-xs text-slate-400">Salary, Freelance, Dividends</p>
        </div>

        {/* Total Expenses */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Outflow (Expenses)</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
            {formatCurrency(cashflow.totalExpenses, currency)}
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
            <span>{stats?.paypalCount || 0} PayPal payments verified</span>
          </div>
        </div>

        {/* Financial Health Score */}
        <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-br from-white to-blue-50/50 p-5 shadow-xs dark:border-slate-800 dark:from-slate-900 dark:to-blue-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Financial Health Score</span>
            <span 
              className="rounded-full px-2 py-0.5 text-[10px] font-bold"
              style={{ backgroundColor: `${stats?.health.color}20`, color: stats?.health.color }}
            >
              {stats?.health.rating || 'Good'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {stats?.health.score || 84}
            </span>
            <span className="text-xs text-slate-400">/ 100</span>
          </div>
          <div className="mt-2.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${stats?.health.score || 84}%`,
                backgroundColor: stats?.health.color || '#10B981',
              }}
            />
          </div>
        </div>

      </div>

      {/* AI FINANCIAL ASSISTANT HIGHLIGHT BANNER */}
      <div className="rounded-2xl border border-purple-200 bg-gradient-to-r from-purple-50 via-indigo-50/70 to-blue-50/60 p-5 dark:border-purple-900/60 dark:from-purple-950/40 dark:via-indigo-950/30 dark:to-slate-900 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-600 text-white shadow-md shadow-purple-500/20">
              <Sparkles className="h-5 w-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  PaySmart AI Intelligence Briefing
                </h3>
                <span className="rounded-md bg-purple-200/70 dark:bg-purple-900/60 text-purple-800 dark:text-purple-300 text-[10px] font-semibold px-2 py-0.5">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 max-w-2xl">
                {aiInsight?.summary || "Analyzing your income vs expense velocity. Ask the AI assistant to audit subscriptions or generate a 50/30/20 budget plan."}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('ai-advisor')}
            className="flex items-center gap-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs px-4 py-2.5 shadow-sm transition-all transform active:scale-95 shrink-0"
          >
            <span>Open AI Advisor</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Monthly Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Monthly Spending & Cashflow Trend
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Income vs Expenses over time (USD)
              </p>
            </div>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              Recharts Engine
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats?.monthlyTrends || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0070BA" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0070BA" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderRadius: '10px',
                    color: '#fff',
                    border: 'none',
                    fontSize: '11px',
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Area type="monotone" dataKey="income" name="Income" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#incomeGrad)" />
                <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#0070BA" strokeWidth={2} fillOpacity={1} fill="url(#expenseGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut Chart (1 Col) */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Expense Breakdown
              </h3>
              <span className="text-[11px] text-slate-400">By Category</span>
            </div>

            <div className="h-48 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.categoryBreakdown || []}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                  >
                    {(stats?.categoryBreakdown || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.category] || '#64748B'} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Amount']}
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-slate-400 font-medium">Expenses</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  ${cashflow.totalExpenses.toFixed(0)}
                </span>
              </div>
            </div>
          </div>

          {/* Top 3 categories list */}
          <div className="mt-3 space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            {(stats?.categoryBreakdown || []).slice(0, 3).map((item) => (
              <div key={item.category} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[item.category] || '#64748B' }}
                  />
                  <span className="text-slate-700 dark:text-slate-300 font-medium">{item.category}</span>
                </div>
                <div className="flex items-center gap-2 font-mono">
                  <span className="font-semibold text-slate-900 dark:text-white">${item.amount.toFixed(2)}</span>
                  <span className="text-[10px] text-slate-400">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* RECENT TRANSACTIONS TABLE */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Transactions
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Verified SQLite records with PayPal authentication status
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('transactions')}
            className="text-xs font-semibold text-[#0070BA] hover:underline flex items-center gap-1 dark:text-blue-400"
          >
            <span>View All ({cashflow.totalTransactions})</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-semibold text-slate-400">
                <th className="pb-3 pl-2">Description / Recipient</th>
                <th className="pb-3">Category</th>
                <th className="pb-3">Method</th>
                <th className="pb-3">Date</th>
                <th className="pb-3 text-right">Amount</th>
                <th className="pb-3 text-right pr-2">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {(stats?.recentTransactions || []).map((t) => {
                const isExpense = t.transaction_type === 'expense';
                const isPayPal = t.payment_method === 'paypal' || Boolean(t.paypal_order_id);

                return (
                  <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-2 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <span>{t.description}</span>
                        {t.is_demo === 1 && (
                          <span className="rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] px-1 py-0.2 font-medium">
                            Demo
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3">
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {t.category}
                      </span>
                    </td>

                    <td className="py-3">
                      {isPayPal ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#0070BA] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full text-[10px] border border-blue-200 dark:border-blue-900">
                          <span className="italic font-black text-amber-500">P</span>
                          <span>PayPal Verified</span>
                        </span>
                      ) : (
                        <span className="capitalize text-slate-500 dark:text-slate-400 text-[11px]">
                          {t.payment_method.replace('_', ' ')}
                        </span>
                      )}
                    </td>

                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {t.created_at.substring(0, 10)}
                    </td>

                    <td className={`py-3 text-right font-bold ${isExpense ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {isExpense ? '-' : '+'}${t.amount.toFixed(2)}
                    </td>

                    <td className="py-3 text-right pr-2">
                      <button
                        onClick={() => onViewReceipt(t)}
                        className="rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
                      >
                        Receipt
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
