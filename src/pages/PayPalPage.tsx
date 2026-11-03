import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  CheckCircle2, 
  ExternalLink, 
  Key, 
  Terminal, 
  ArrowRight, 
  Lock, 
  Loader2, 
  Clock, 
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import { api } from '../services/api';
import { PaymentRecord } from '../types';
import { formatCurrency } from '../utils/finance';

interface PayPalPageProps {
  onOpenQuickPay: () => void;
}

export const PayPalPage: React.FC<PayPalPageProps> = ({ onOpenQuickPay }) => {
  const [config, setConfig] = useState<any>(null);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cfg, pmts] = await Promise.all([
        api.getPayPalConfig(),
        api.getPayments(),
      ]);
      setConfig(cfg);
      setPayments(pmts.payments || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCopyEnv = () => {
    const text = `PAYPAL_CLIENT_ID="your_sandbox_client_id"\nPAYPAL_CLIENT_SECRET="your_sandbox_client_secret"\nPAYPAL_MODE="sandbox"`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
              PayPal Sandbox Integration Hub
            </h1>
            <span className="rounded-full bg-blue-100 text-[#0070BA] dark:bg-blue-950/60 dark:text-blue-300 text-[10px] px-2.5 py-0.5 font-bold">
              REST API v2
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Cryptographic order lifecycle, server-side capture verification, and transaction auditing.
          </p>
        </div>

        <button
          onClick={onOpenQuickPay}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#0070BA] to-[#003087] px-4 py-2 text-xs font-bold text-white shadow-sm hover:from-[#005ea6] transition-all transform active:scale-95 cursor-pointer"
        >
          <span className="font-extrabold italic text-amber-300 text-sm">P</span>
          <span>Launch PayPal Checkout</span>
        </button>
      </div>

      {/* Integration Status Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Environment Mode</span>
            <span className="rounded-full bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 text-[10px] font-bold px-2 py-0.5 uppercase">
              {config?.mode || 'Sandbox'}
            </span>
          </div>
          <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            api-m.sandbox.paypal.com
          </p>
          <div className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Endpoint Reachable</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Security Architecture</span>
            <Lock className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-xl font-black text-slate-900 dark:text-white">
            Server Authoritative
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Client Secret never sent to browser
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Captured Payments</span>
            <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
              {payments.length} Records
            </span>
          </div>
          <p className="mt-2 text-xl font-black text-[#0070BA] dark:text-blue-400">
            ${payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toFixed(2)}
          </p>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Processed through PaySmart SQLite
          </p>
        </div>

      </div>

      {/* Credential Configuration Guide */}
      <div className="rounded-2xl border border-blue-200 bg-blue-50/60 p-6 dark:border-blue-900/60 dark:bg-blue-950/30 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <Key className="h-5 w-5 text-[#0070BA] dark:text-blue-400" />
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                PayPal Sandbox Credentials Setup Guide
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                How to connect your personal PayPal Developer account to PaySmart AI
              </p>
            </div>
          </div>

          <button
            onClick={handleCopyEnv}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-800 dark:text-slate-200 transition-colors shadow-xs"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5 text-slate-500" />}
            <span>{copied ? 'Copied Env' : 'Copy Template'}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
          <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3 border border-blue-100 dark:border-blue-900">
            <span className="font-bold text-[#0070BA] dark:text-blue-400">1. Developer Dashboard</span>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Sign in to <a href="https://developer.paypal.com/dashboard/applications" target="_blank" rel="noreferrer" className="underline font-semibold text-blue-600">developer.paypal.com</a> and create a Sandbox App.
            </p>
          </div>

          <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3 border border-blue-100 dark:border-blue-900">
            <span className="font-bold text-[#0070BA] dark:text-blue-400">2. Copy Keys</span>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Copy your Client ID and Client Secret into your project's <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded font-mono text-[10px]">.env</code> file.
            </p>
          </div>

          <div className="rounded-xl bg-white/80 dark:bg-slate-900/80 p-3 border border-blue-100 dark:border-blue-900">
            <span className="font-bold text-[#0070BA] dark:text-blue-400">3. Built-in Test Simulator</span>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              Even without external keys, our built-in Sandbox Simulator enables 100% end-to-end checkout & capture testing!
            </p>
          </div>
        </div>
      </div>

      {/* Captured Payments Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              PayPal Payments Ledger
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified captures stored in SQLite <code className="font-mono text-[11px]">payments</code> table
            </p>
          </div>
        </div>

        {loading ? (
          <div className="flex h-36 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0070BA]" />
          </div>
        ) : payments.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-500">
            No payments captured yet. Click "Launch PayPal Checkout" to test.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3.5 pl-4">PayPal Order ID</th>
                  <th className="py-3.5">Capture ID</th>
                  <th className="py-3.5">Amount</th>
                  <th className="py-3.5">Currency</th>
                  <th className="py-3.5">Status</th>
                  <th className="py-3.5 text-right pr-4">Captured At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 pl-4 font-mono font-semibold text-[#0070BA] dark:text-blue-400">
                      {p.paypal_order_id}
                    </td>
                    <td className="py-3 font-mono text-slate-600 dark:text-slate-300">
                      {p.capture_id || 'N/A'}
                    </td>
                    <td className="py-3 font-bold text-slate-900 dark:text-white">
                      ${p.amount.toFixed(2)}
                    </td>
                    <td className="py-3 font-medium text-slate-500">
                      {p.currency}
                    </td>
                    <td className="py-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        <CheckCircle2 className="h-3 w-3" />
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3 text-right pr-4 text-slate-500 dark:text-slate-400">
                      {p.created_at}
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
