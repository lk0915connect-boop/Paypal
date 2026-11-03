import React, { useState } from 'react';
import { 
  Sparkles, 
  CreditCard, 
  Plus, 
  Sun, 
  Moon, 
  LogOut, 
  User as UserIcon, 
  ShieldCheck, 
  ChevronDown, 
  Menu, 
  X,
  Cpu
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  onOpenQuickPay?: () => void;
  onOpenNewTx?: () => void;
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
  onOpenAuth?: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenQuickPay,
  onOpenNewTx,
  activeTab = 'dashboard',
  setActiveTab,
  onOpenAuth,
}) => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 transition-colors duration-200">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand / Logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab?.(isAuthenticated ? 'dashboard' : 'landing')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-[#003087] via-[#0070BA] to-blue-400 text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform duration-200">
              <span className="font-extrabold text-lg tracking-tighter">P</span>
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-['Plus_Jakarta_Sans']">
                  PaySmart <span className="text-[#0070BA] dark:text-blue-400">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 text-[10px] font-semibold text-[#0070BA] dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                  PayPal AI '26
                </span>
              </div>
              <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 hidden sm:block">
                Smart Payments & Financial Intelligence
              </p>
            </div>
          </button>
        </div>

        {/* Public Desktop Navigation Links (when on landing) */}
        {!isAuthenticated && (
          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveTab?.('landing')}
              className={`text-sm font-medium transition-colors ${
                activeTab === 'landing' ? 'text-[#0070BA] font-semibold' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              Home
            </button>
            <a
              href="#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              How It Works
            </a>
            <a
              href="#paypal-integration"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              PayPal Engine
            </a>
            <button
              onClick={() => setActiveTab?.('hackathon')}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Architecture
            </button>
          </nav>
        )}

        {/* Right Action Bar */}
        <div className="flex items-center gap-3">
          {/* Dark / Light Toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
          </button>

          {isAuthenticated ? (
            <>
              {/* Quick Transaction Action */}
              <button
                onClick={onOpenNewTx}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-xs hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                <Plus className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                Add Record
              </button>

              {/* Pay with PayPal Primary Action Button */}
              <button
                onClick={onOpenQuickPay}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-[#0070BA] to-[#003087] px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:from-[#00609F] hover:to-[#002568] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all transform active:scale-95"
              >
                <span className="font-extrabold italic tracking-tighter text-amber-300 text-sm">P</span>
                <span>Pay with PayPal</span>
              </button>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pl-1 pr-2 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 font-semibold text-xs text-white">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-200 hidden md:block max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>

                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-700">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                        <ShieldCheck className="h-3 w-3" />
                        <span>Currency: {user?.currency || 'USD'}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab?.('settings');
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700 text-left"
                    >
                      <UserIcon className="h-3.5 w-3.5 text-slate-400" />
                      Account Settings
                    </button>

                    <button
                      onClick={() => {
                        setActiveTab?.('hackathon');
                        setUserMenuOpen(false);
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-700 text-left"
                    >
                      <Cpu className="h-3.5 w-3.5 text-[#0070BA]" />
                      Hackathon Architecture
                    </button>

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                        setActiveTab?.('landing');
                      }}
                      className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/30 text-left"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => demoLogin()}
                className="hidden sm:inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50/70 px-3 py-1.5 text-xs font-semibold text-[#0070BA] hover:bg-blue-100 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors"
                title="Log in directly with pre-seeded demo dataset"
              >
                <Sparkles className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
                <span>Instant Demo</span>
              </button>

              <button
                onClick={() => onOpenAuth?.('login')}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors"
              >
                Sign In
              </button>

              <button
                onClick={() => onOpenAuth?.('register')}
                className="rounded-lg bg-[#0070BA] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-[#005ea6] transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900 md:hidden">
          <div className="flex flex-col gap-2">
            {!isAuthenticated ? (
              <>
                <button
                  onClick={() => {
                    setActiveTab?.('landing');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Home
                </button>
                <button
                  onClick={() => {
                    demoLogin();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 py-2 text-sm font-semibold text-[#0070BA] dark:text-blue-400"
                >
                  <Sparkles className="h-4 w-4" />
                  Launch Instant Demo
                </button>
                <button
                  onClick={() => {
                    onOpenAuth?.('login');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth?.('register');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-sm font-medium text-[#0070BA] font-semibold"
                >
                  Create Account
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setActiveTab?.('dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => {
                    setActiveTab?.('transactions');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  Transactions Ledger
                </button>
                <button
                  onClick={() => {
                    setActiveTab?.('ai-advisor');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  AI Financial Advisor
                </button>
                <button
                  onClick={() => {
                    setActiveTab?.('paypal-hub');
                    setMobileMenuOpen(false);
                  }}
                  className="text-left py-2 text-sm font-medium text-slate-700 dark:text-slate-200"
                >
                  PayPal Sandbox Hub
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
