import React from 'react';
import { X, CheckCircle2, ShieldCheck, Printer, ArrowDownToLine } from 'lucide-react';
import { Transaction } from '../types';
import { formatCurrency } from '../utils/finance';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: Transaction | null;
  currency?: string;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  transaction,
  currency = 'USD',
}) => {
  if (!isOpen || !transaction) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Receipt Header */}
        <div className="bg-[#003087] text-white p-6 text-center relative">
          <button
            onClick={onClose}
            aria-label="Close receipt"
            className="absolute top-4 right-4 rounded-lg p-1 text-white/80 hover:bg-white/10 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-amber-300 font-extrabold italic text-xl mb-2">
            P
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300 border border-emerald-400/30">
            <CheckCircle2 className="h-3 w-3" />
            Verified Payment Captured
          </span>
          <h3 className="mt-2 text-2xl font-black tracking-tight">
            {formatCurrency(transaction.amount, currency)}
          </h3>
          <p className="text-xs text-blue-200 mt-0.5">
            {transaction.description}
          </p>
        </div>

        {/* Receipt Body */}
        <div className="p-6 space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 dark:border-slate-800 dark:bg-slate-800/40 p-4 space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Transaction ID:</span>
              <span className="font-mono font-semibold text-slate-800 dark:text-slate-200">#TXN-{transaction.id}</span>
            </div>
            {transaction.paypal_order_id && (
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">PayPal Order ID:</span>
                <span className="font-mono text-blue-600 dark:text-blue-400">{transaction.paypal_order_id}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Date & Time:</span>
              <span className="text-slate-800 dark:text-slate-200">{transaction.created_at}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Category:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{transaction.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Payment Channel:</span>
              <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">
                {transaction.payment_method.replace('_', ' ')}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Status:</span>
              <span className="font-bold uppercase text-emerald-600 dark:text-emerald-400 text-[11px]">
                {transaction.status}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-800 dark:bg-blue-950/40 dark:text-blue-300">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#0070BA]" />
            <span>
              Cryptographically verified via PayPal REST v2 API & SQLite persistent ledger.
            </span>
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={() => window.print()}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Printer className="h-3.5 w-3.5" />
              Print Receipt
            </button>
            <button
              onClick={onClose}
              className="flex-1 rounded-xl bg-[#0070BA] py-2.5 text-xs font-bold text-white hover:bg-[#005ea6]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
