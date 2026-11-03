import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck, 
  ArrowRight, 
  Receipt, 
  Lock, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

interface QuickPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export const QuickPayModal: React.FC<QuickPayModalProps> = ({
  isOpen,
  onClose,
  onPaymentSuccess,
}) => {
  const [step, setStep] = useState<'form' | 'approving' | 'success' | 'error'>('form');
  const [amount, setAmount] = useState<string>('45.00');
  const [description, setDescription] = useState<string>('Cloud Infrastructure & Storage');
  const [category, setCategory] = useState<string>('Bills');
  const [recipient, setRecipient] = useState<string>('merchant@cloudservices.io');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createdOrder, setCreatedOrder] = useState<any>(null);
  const [capturedPayment, setCapturedPayment] = useState<any>(null);

  if (!isOpen) return null;

  const categories = ['Bills', 'Shopping', 'Education', 'Entertainment', 'Food', 'Transport', 'Healthcare', 'Other'];

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMessage('Please enter a valid positive amount.');
      return;
    }

    setLoading(true);
    try {
      const order = await api.createPayPalOrder({
        amount: numAmount,
        currency: 'USD',
        description: description.trim() || 'PayPal Checkout Payment',
        category,
      });

      setCreatedOrder(order);
      setStep('approving');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initiate PayPal order.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleCapturePayment = async () => {
    if (!createdOrder?.orderId) return;
    setLoading(true);
    setErrorMessage('');

    try {
      const res = await api.capturePayPalOrder({
        orderId: createdOrder.orderId,
        amount: parseFloat(amount),
        category,
        description: `${description} (${recipient})`,
      });

      setCapturedPayment(res.payment);
      setStep('success');
      onPaymentSuccess?.();
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment capture failed. Transaction was not recorded.');
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep('form');
    setErrorMessage('');
    setCreatedOrder(null);
    setCapturedPayment(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 px-6 py-4 bg-slate-50/70 dark:bg-slate-800/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#003087] text-white">
              <span className="font-extrabold italic text-amber-300 text-sm">P</span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                PayPal Sandbox Checkout
                <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[10px] px-2 py-0.5 font-semibold">
                  REST v2
                </span>
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Encrypted server-side order creation & capture
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body content based on step */}
        <div className="p-6">
          
          {/* STEP 1: FORM */}
          {step === 'form' && (
            <form onSubmit={handleCreateOrder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-base font-bold text-slate-400">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.50"
                    required
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-8 pr-4 text-lg font-bold text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Merchant / Recipient
                </label>
                <input
                  type="text"
                  required
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="e.g. merchant@company.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Expense Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Method
                  </label>
                  <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    <span className="font-bold text-[#003087] dark:text-blue-400 italic">PayPal</span>
                    <span>Sandbox Balance</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description / Note
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What is this payment for?"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-[#0070BA] focus:outline-none focus:ring-2 focus:ring-blue-100 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-[11px] text-slate-600 dark:border-blue-900/40 dark:bg-blue-950/30 dark:text-slate-300 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-[#0070BA] dark:text-blue-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Server-Authoritative Order Security</span>
                </div>
                <p>
                  Order creation and capture are processed exclusively through the server. Frontend keys are never exposed.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0070BA] to-[#003087] px-5 py-2.5 text-xs font-bold text-white shadow-md hover:from-[#005fa0] hover:to-[#00266e] disabled:opacity-50 transition-all cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creating Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate PayPal Order</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* STEP 2: APPROVAL / CHECKOUT BUTTON */}
          {step === 'approving' && createdOrder && (
            <div className="space-y-5 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#0070BA] dark:text-blue-400">
                <ShieldCheck className="h-8 w-8" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Authorize Sandbox Payment
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Order generated on PayPal REST v2 API
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 p-4 text-left space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">PayPal Order ID:</span>
                  <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{createdOrder.orderId}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Total Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-sm">${parseFloat(amount).toFixed(2)} USD</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Recipient / Item:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[200px]">{recipient}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400">Order Status:</span>
                  <span className="font-semibold text-amber-600 dark:text-amber-400 uppercase text-[11px]">{createdOrder.status}</span>
                </div>
              </div>

              {/* PayPal Official Styled Checkout Button */}
              <div className="pt-2">
                <button
                  onClick={handleCapturePayment}
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FFC439] hover:bg-[#F2BA36] text-[#003087] font-extrabold text-sm py-3 px-6 shadow-sm transition-transform active:scale-[0.98] cursor-pointer"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-[#003087]" />
                      <span>Verifying & Capturing with PayPal...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-base italic font-black">PayPal</span>
                      <span>Checkout & Authorize</span>
                    </>
                  )}
                </button>
                <p className="mt-2 text-[11px] text-slate-400 dark:text-slate-500">
                  Direct server-side verification ensures no fraud or client-side tampering.
                </p>
              </div>
            </div>
          )}

          {/* STEP 3: SUCCESS & RECEIPT */}
          {step === 'success' && capturedPayment && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400 mb-2">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Payment Captured Successfully!
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recorded to SQLite and available in your AI analytics
                </p>
              </div>

              {/* Receipt Details Card */}
              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/30 text-xs space-y-2">
                <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2 dark:border-emerald-800/60">
                  <span className="font-semibold text-emerald-800 dark:text-emerald-300">Transaction Status</span>
                  <span className="font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    {capturedPayment.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Captured Amount:</span>
                  <span className="font-bold text-slate-900 dark:text-white">${parseFloat(capturedPayment.amount || amount).toFixed(2)} {capturedPayment.currency || 'USD'}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-600 dark:text-slate-400">PayPal Order ID:</span>
                  <span className="text-slate-800 dark:text-slate-200">{capturedPayment.orderId}</span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-slate-600 dark:text-slate-400">PayPal Capture ID:</span>
                  <span className="text-slate-800 dark:text-slate-200">{capturedPayment.captureId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Category Assigned:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{category}</span>
                </div>
              </div>

              {/* AI Auto-Categorization Badge */}
              <div className="flex items-center gap-2 rounded-xl border border-purple-200 bg-purple-50/70 p-3 text-xs text-purple-800 dark:border-purple-900/50 dark:bg-purple-950/30 dark:text-purple-300">
                <Sparkles className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400" />
                <span>
                  <strong>PaySmart AI Engine:</strong> Payment automatically synced to monthly cashflow budget and category breakdown.
                </span>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-xl border border-slate-300 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Make Another Payment
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 rounded-xl bg-[#0070BA] py-2.5 text-xs font-bold text-white hover:bg-[#005ea6]"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: ERROR */}
          {step === 'error' && (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">Payment Failed</h4>
                <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{errorMessage}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No funds were deducted. Check your PayPal credentials or try again.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={handleReset}
                  className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:text-slate-300"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
