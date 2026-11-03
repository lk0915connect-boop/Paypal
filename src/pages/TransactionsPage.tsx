import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Download, 
  Plus, 
  Trash2, 
  Edit2, 
  CreditCard, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Receipt,
  FileSpreadsheet
} from 'lucide-react';
import { Transaction } from '../types';
import { api } from '../services/api';
import { formatCurrency } from '../utils/finance';
import { useAuth } from '../context/AuthContext';

interface TransactionsPageProps {
  onOpenNewTx: () => void;
  onEditTx: (tx: Transaction) => void;
  onViewReceipt: (tx: Transaction) => void;
  onOpenQuickPay: () => void;
}

export const TransactionsPage: React.FC<TransactionsPageProps> = ({
  onOpenNewTx,
  onEditTx,
  onViewReceipt,
  onOpenQuickPay,
}) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [methodFilter, setMethodFilter] = useState<string>('All');
  const [page, setPage] = useState<number>(1);
  const [pagination, setPagination] = useState<any>({ total: 0, pages: 1 });
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.getTransactions({
        type: typeFilter === 'All' ? undefined : typeFilter.toLowerCase(),
        category: categoryFilter === 'All' ? undefined : categoryFilter,
        method: methodFilter === 'All' ? undefined : methodFilter.toLowerCase(),
        search: search.trim() || undefined,
        page,
        limit: 15,
      });
      setTransactions(res.transactions);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, categoryFilter, methodFilter, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this transaction record?')) {
      try {
        await api.deleteTransaction(id);
        fetchTransactions();
      } catch (err: any) {
        alert(err.message || 'Failed to delete transaction');
      }
    }
  };

  const handleExportCSV = () => {
    if (transactions.length === 0) {
      alert('No transactions to export.');
      return;
    }

    const headers = ['ID', 'Date', 'Type', 'Amount', 'Category', 'Description', 'Method', 'PayPal_Order_ID', 'Status'];
    const rows = transactions.map((t) => [
      t.id,
      t.created_at,
      t.transaction_type,
      t.amount,
      `"${t.category}"`,
      `"${t.description.replace(/"/g, '""')}"`,
      t.payment_method,
      t.paypal_order_id || '',
      t.status,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `PaySmart_Transactions_${new Date().toISOString().substring(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const categories = ['All', 'Bills', 'Shopping', 'Food', 'Transport', 'Education', 'Healthcare', 'Entertainment', 'Salary', 'Freelance', 'Investments', 'Other'];
  const methods = ['All', 'PayPal', 'credit_card', 'bank_transfer', 'cash', 'other'];

  const sortedTransactions = [...transactions].sort((a, b) => {
    if (sortBy === 'amount') {
      return sortOrder === 'desc' ? b.amount - a.amount : a.amount - b.amount;
    }
    return sortOrder === 'desc'
      ? b.created_at.localeCompare(a.created_at)
      : a.created_at.localeCompare(b.created_at);
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
            Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete history of verified PayPal payments and manual financial entries.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs transition-colors"
          >
            <Download className="h-3.5 w-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={onOpenNewTx}
            className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shadow-xs transition-colors"
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

      {/* Filter / Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search description, category, or PayPal order ID..."
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Type selector */}
            <select
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="All">All Types</option>
              <option value="income">Income Only (+)</option>
              <option value="expense">Expense Only (-)</option>
            </select>

            {/* Category selector */}
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c === 'All' ? 'All Categories' : c}</option>
              ))}
            </select>

            {/* Payment method selector */}
            <select
              value={methodFilter}
              onChange={(e) => {
                setMethodFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="All">All Payment Channels</option>
              <option value="paypal">PayPal Verified Only</option>
              <option value="credit_card">Credit Card</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cash">Cash</option>
            </select>

            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 transition-colors"
            >
              Filter
            </button>
          </div>

        </form>

        {/* Sorting options */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100 dark:border-slate-800">
          <span>Found {pagination.total || sortedTransactions.length} records</span>
          <div className="flex items-center gap-3">
            <span>Sort by:</span>
            <button
              onClick={() => {
                if (sortBy === 'date') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                else { setSortBy('date'); setSortOrder('desc'); }
              }}
              className={`font-semibold hover:underline ${sortBy === 'date' ? 'text-[#0070BA] dark:text-blue-400' : ''}`}
            >
              Date {sortBy === 'date' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'amount') setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                else { setSortBy('amount'); setSortOrder('desc'); }
              }}
              className={`font-semibold hover:underline ${sortBy === 'amount' ? 'text-[#0070BA] dark:text-blue-400' : ''}`}
            >
              Amount {sortBy === 'amount' ? (sortOrder === 'desc' ? '↓' : '↑') : ''}
            </button>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0070BA]" />
          </div>
        ) : sortedTransactions.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No transactions match your criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting filters or record a new transaction.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 pl-4">ID</th>
                  <th className="py-3.5">Description</th>
                  <th className="py-3.5">Category</th>
                  <th className="py-3.5">Method</th>
                  <th className="py-3.5">Date</th>
                  <th className="py-3.5 text-right">Amount</th>
                  <th className="py-3.5 text-right pr-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sortedTransactions.map((t) => {
                  const isExpense = t.transaction_type === 'expense';
                  const isPayPal = t.payment_method === 'paypal' || Boolean(t.paypal_order_id);

                  return (
                    <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 pl-4 font-mono text-slate-400">
                        #{t.id}
                      </td>

                      <td className="py-3.5 font-medium text-slate-900 dark:text-white max-w-xs truncate">
                        <div className="flex items-center gap-1.5">
                          <span>{t.description}</span>
                          {t.is_demo === 1 && (
                            <span className="rounded bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 text-[9px] px-1 py-0.2 font-medium">
                              Sample
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5">
                        <span className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-medium text-slate-700 dark:text-slate-300">
                          {t.category}
                        </span>
                      </td>

                      <td className="py-3.5">
                        {isPayPal ? (
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 font-bold text-[#0070BA] dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2 py-0.5 rounded-full text-[10px] border border-blue-200 dark:border-blue-900 w-fit">
                              <span className="italic font-black text-amber-500">P</span>
                              <span>PayPal Sandbox</span>
                            </span>
                            {t.paypal_order_id && (
                              <span className="font-mono text-[9px] text-slate-400 truncate max-w-[120px]">
                                {t.paypal_order_id}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="capitalize text-slate-600 dark:text-slate-400 text-[11px]">
                            {t.payment_method.replace('_', ' ')}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 text-slate-500 dark:text-slate-400">
                        {t.created_at.substring(0, 10)}
                      </td>

                      <td className={`py-3.5 text-right font-bold text-sm ${isExpense ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                        {isExpense ? '-' : '+'}${t.amount.toFixed(2)}
                      </td>

                      <td className="py-3.5 text-right pr-4">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onViewReceipt(t)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 transition-colors"
                            title="View receipt"
                          >
                            <Receipt className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => onEditTx(t)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(t.id)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/30 text-xs">
            <span className="text-slate-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                <span>Prev</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                disabled={page >= pagination.pages}
                className="flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1 text-slate-600 dark:text-slate-300 disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
};
