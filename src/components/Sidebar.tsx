import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  Wallet, 
  LineChart, 
  Bot, 
  CreditCard, 
  Settings, 
  Cpu, 
  ShieldCheck, 
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenQuickPay: () => void;
  healthScore?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  onOpenQuickPay,
  healthScore = 84,
}) => {
  const { user } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText, badge: 'All' },
    { id: 'expenses', label: 'Expense Tracker', icon: Wallet },
    { id: 'analytics', label: 'AI Analytics', icon: LineChart },
    { id: 'ai-advisor', label: 'AI Financial Advisor', icon: Bot, isSpecial: true },
    { id: 'paypal-hub', label: 'PayPal Sandbox Hub', icon: CreditCard, isHighlight: true },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'hackathon', label: 'Hackathon Docs', icon: Cpu },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 justify-between transition-colors duration-200">
      <div className="space-y-6">
        
        {/* Navigation list */}
        <nav className="space-y-1">
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Platform Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-50 text-[#0070BA] dark:bg-blue-950/60 dark:text-blue-400 font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4 w-4 transition-colors ${
                      isActive
                        ? 'text-[#0070BA] dark:text-blue-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>

                {item.isSpecial && (
                  <span className="flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-1.5 py-0.5 text-[9px] font-bold text-white shadow-xs">
                    <Sparkles className="h-2.5 w-2.5" />
                    AI
                  </span>
                )}

                {item.isHighlight && (
                  <span className="rounded-full bg-amber-100 px-1.5 py-0.5 text-[9px] font-bold text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                    REST
                  </span>
                )}

                {item.badge && !item.isSpecial && !item.isHighlight && (
                  <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick PayPal Pay CTA Card */}
        <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/80 to-indigo-50/40 p-3.5 dark:border-blue-950/80 dark:from-blue-950/40 dark:to-slate-900">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0070BA] dark:text-blue-400">
              <CreditCard className="h-3.5 w-3.5" />
              PayPal Sandbox
            </span>
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          </div>
          <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">
            Test seamless instant payment capture and verification.
          </p>
          <button
            onClick={onOpenQuickPay}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#0070BA] py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#005ea6] transition-colors"
          >
            <span>Send Money Now</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Financial Health Widget */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-slate-500 dark:text-slate-400">Financial Health</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">{healthScore}/100</span>
        </div>
        <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(10, healthScore))}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-3.5 w-3.5 text-blue-500" />
          <span>SQLite Ledger Secure</span>
        </div>
      </div>
    </aside>
  );
};
