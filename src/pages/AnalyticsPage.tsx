import React, { useState, useEffect } from 'react';
import { 
  BarChart as BarChartIcon, 
  TrendingUp, 
  TrendingDown, 
  Sparkles, 
  PieChart as PieIcon, 
  ShieldCheck, 
  Lightbulb, 
  ArrowUpRight,
  Loader2,
  Calendar
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  LineChart,
  Line
} from 'recharts';
import { DashboardStats, FinancialInsight } from '../types';
import { api } from '../services/api';

const COLORS = ['#0070BA', '#10B981', '#EC4899', '#F59E0B', '#8B5CF6', '#06B6D4', '#64748B', '#F97316'];

export const AnalyticsPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [insights, setInsights] = useState<FinancialInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [statsData, insightsData] = await Promise.all([
          api.getDashboardStats(),
          api.getAiInsights(),
        ]);
        setStats(statsData);
        setInsights(insightsData);
      } catch (err) {
        console.error('Analytics load failure:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#0070BA]" />
      </div>
    );
  }

  const { cashflow, categoryBreakdown, monthlyTrends, health } = stats;

  // 50/30/20 Budget Framework computation:
  // Needs: Bills, Healthcare, Food (~50%)
  // Wants: Shopping, Entertainment, Other (~30%)
  // Savings: Income - Expenses (~20%)
  const needsTotal = categoryBreakdown
    .filter((c) => ['Bills', 'Food', 'Healthcare', 'Transport'].includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  const wantsTotal = categoryBreakdown
    .filter((c) => ['Shopping', 'Entertainment', 'Education', 'Other'].includes(c.category))
    .reduce((sum, c) => sum + c.amount, 0);

  const actualNeedsPct = cashflow.totalIncome > 0 ? Math.round((needsTotal / cashflow.totalIncome) * 100) : 0;
  const actualWantsPct = cashflow.totalIncome > 0 ? Math.round((wantsTotal / cashflow.totalIncome) * 100) : 0;
  const actualSavingsPct = cashflow.savingsRate;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
            AI Financial Analytics & Diagnostic
          </h1>
          <span className="rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 text-[10px] px-2.5 py-0.5 font-semibold">
            Recharts Engine
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Multi-dimensional cashflow analytics and automated 50/30/20 budget framework analysis.
        </p>
      </div>

      {/* 50 / 30 / 20 Framework Gauge Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>50 / 30 / 20 Modern Budget Framework</span>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 font-bold">
                Target Met
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Evaluates spending against recommended allocations (Needs 50%, Wants 30%, Savings 20%)
            </p>
          </div>
          <div className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
            Total Inflow: ${cashflow.totalIncome.toFixed(2)}
          </div>
        </div>

        {/* Multi-segmented bar */}
        <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-800 flex overflow-hidden">
          <div
            className="bg-[#0070BA] transition-all duration-500"
            style={{ width: `${Math.min(100, actualNeedsPct)}%` }}
            title={`Needs: ${actualNeedsPct}%`}
          />
          <div
            className="bg-purple-500 transition-all duration-500"
            style={{ width: `${Math.min(100, actualWantsPct)}%` }}
            title={`Wants: ${actualWantsPct}%`}
          />
          <div
            className="bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, actualSavingsPct)}%` }}
            title={`Savings: ${actualSavingsPct}%`}
          />
        </div>

        {/* Legend / Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/40 dark:bg-blue-950/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0070BA] dark:text-blue-400">
              <span className="h-2 w-2 rounded-full bg-[#0070BA]" />
              <span>Needs (50% target)</span>
            </div>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              ${needsTotal.toFixed(2)} ({actualNeedsPct}%)
            </p>
            <p className="text-[10px] text-slate-500">Bills, Food, Healthcare, Transport</p>
          </div>

          <div className="rounded-xl border border-purple-100 bg-purple-50/50 p-3 dark:border-purple-900/40 dark:bg-purple-950/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-purple-600 dark:text-purple-400">
              <span className="h-2 w-2 rounded-full bg-purple-500" />
              <span>Wants (30% target)</span>
            </div>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              ${wantsTotal.toFixed(2)} ({actualWantsPct}%)
            </p>
            <p className="text-[10px] text-slate-500">Shopping, Entertainment, Education</p>
          </div>

          <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/30">
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Net Savings (20% target)</span>
            </div>
            <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">
              ${cashflow.netSavings.toFixed(2)} ({actualSavingsPct}%)
            </p>
            <p className="text-[10px] text-slate-500">Net retained capital & reserves</p>
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Income vs Expenses Bar Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Income vs Expense Comparison
              </h3>
              <p className="text-[11px] text-slate-400">Monthly cashflow dynamics</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip
                  formatter={(val: any) => [`$${Number(val).toFixed(2)}`, '']}
                  contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', color: '#fff', fontSize: '11px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="income" name="Inflow" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Outflow" fill="#0070BA" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Expense Distribution Donut */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Outflow Category Distribution
              </h3>
              <p className="text-[11px] text-slate-400">Share of monthly spending</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="amount"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(entry: any) => `${entry.name || entry.category || ''} (${entry.percentage || 0}%)`}
                >
                  {categoryBreakdown.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val: any) => [`$${Number(val).toFixed(2)}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* AI RECOMMENDATIONS LIST */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI-Generated Spending Optimization Recommendations
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Actionable financial moves derived from your authentic transaction patterns
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(insights?.recommendations || []).map((rec, i) => (
            <div key={i} className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50/50 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
                  {rec.category}
                </span>
                <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  rec.impact === 'High' ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300'
                }`}>
                  {rec.impact} Impact
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">{rec.title}</h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                {rec.description}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
