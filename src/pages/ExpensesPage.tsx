import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  Plus, 
  Trash2, 
  Edit2, 
  TrendingUp, 
  CreditCard, 
  Loader2, 
  AlertCircle,
  Tag,
  DollarSign
} from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../services/api';
import { calculateCategoryBreakdown, formatCurrency } from '../utils/finance';
import { useAuth } from '../context/AuthContext';

interface ExpensesPageProps {
  onOpenNewTx: () => void;
  onEditTx: (tx: Transaction) => void;
  onOpenQuickPay: () => void;
}

export const ExpensesPage: React.FC<ExpensesPageProps> = ({
  onOpenNewTx,
  onEditTx,
  onOpenQuickPay,
}) => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCat, setSelectedCat] = useState<string>('All');

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        type: 'expense',
        category: selectedCat === 'All' ? undefined : selectedCat,
        limit: 100,
      });
      setExpenses(res.transactions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [selectedCat]);

  const handleDelete = async (id: number) => {
    if (confirm('Delete this expense?')) {
      await api.deleteTransaction(id);
      fetchExpenses();
    }
  };

  const totalExpense = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const breakdown = calculateCategoryBreakdown(expenses);

  const categories = ['All', 'Bills', 'Shopping', 'Food', 'Transport', 'Education', 'Healthcare', 'Entertainment', 'Other'];

  // Realistic monthly category budget limits for progress tracking
  const categoryBudgets: Record<string, number> = {
    Bills: 1500,
    Food: 600,
    Shopping: 400,
    Transport: 250,
    Education: 300,
    Entertainment: 200,
    Healthcare: 250,
    Other: 200,
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
            Expense Tracker & Budgets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor categorized outflows, recurring bills, and budget pacing.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenNewTx}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 text-blue-600" />
            <span>Add Expense</span>
          </button>

          <button
            onClick={onOpenQuickPay}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0070BA] to-[#003087] px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-[#005ea6] transition-all"
          >
            <span className="font-extrabold italic text-amber-300 text-sm">P</span>
            <span>PayPal Sandbox Pay</span>
          </button>
        </div>
      </div>

      {/* Category Budget Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {breakdown.slice(0, 4).map((b) => {
          const budget = categoryBudgets[b.category] || 500;
          const pct = Math.min(100, Math.round((b.amount / budget) * 100));
          const isOver = b.amount > budget;

          return (
            <div key={b.category} className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.category}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isOver ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300' : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                }`}>
                  {pct}% of limit
                </span>
              </div>
              <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
                ${b.amount.toFixed(2)}
              </p>
              <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                <span>Budget: ${budget}</span>
                <span>{b.count} transactions</span>
              </div>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-rose-500' : 'bg-[#0070BA]'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setSelectedCat(c)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              selectedCat === c
                ? 'bg-[#0070BA] text-white font-bold shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0070BA]" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No expenses found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 pl-4">Description</th>
                  <th className="py-3">Category</th>
                  <th className="py-3">Payment Method</th>
                  <th className="py-3">Date</th>
                  <th className="py-3 text-right">Amount</th>
                  <th className="py-3 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-4 font-medium text-slate-900 dark:text-white">
                      {e.description}
                    </td>
                    <td className="py-3">
                      <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3">
                      {e.payment_method === 'paypal' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[#0070BA] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full text-[10px] border border-blue-200 dark:border-blue-900">
                          PayPal Verified
                        </span>
                      ) : (
                        <span className="capitalize text-slate-500 dark:text-slate-400">
                          {e.payment_method.replace('_', ' ')}
                        </span>
                      )}
                    </td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">
                      {e.created_at.substring(0, 10)}
                    </td>
                    <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                      -${e.amount.toFixed(2)}
                    </td>
                    <td className="py-3 text-right pr-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onEditTx(e)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(e.id)}
                          className="rounded-lg p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
