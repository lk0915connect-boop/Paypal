import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { TransactionsPage } from './pages/TransactionsPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { AiAdvisorPage } from './pages/AiAdvisorPage';
import { PayPalPage } from './pages/PayPalPage';
import { SettingsPage } from './pages/SettingsPage';
import { HackathonDocsPage } from './pages/HackathonDocsPage';
import { QuickPayModal } from './components/QuickPayModal';
import { TransactionModal } from './components/TransactionModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AuthModal } from './components/AuthModal';
import { Transaction } from './types';

function MainLayout() {
  const { isAuthenticated, user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  
  // Modals state
  const [quickPayOpen, setQuickPayOpen] = useState(false);
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleOpenAuth = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  const handleOpenNewTx = () => {
    setTxToEdit(null);
    setTxModalOpen(true);
  };

  const handleEditTx = (tx: Transaction) => {
    setTxToEdit(tx);
    setTxModalOpen(true);
  };

  const handleViewReceipt = (tx: Transaction) => {
    setReceiptTx(tx);
  };

  const handleTransactionSuccess = () => {
    setRefreshKey((k) => k + 1);
  };

  // If user is not authenticated and hasn't selected architecture docs, render Landing Page
  if (!isAuthenticated && activeTab !== 'hackathon') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
        <Navbar
          activeTab="landing"
          setActiveTab={setActiveTab}
          onOpenAuth={handleOpenAuth}
        />
        <LandingPage
          onGetStarted={() => handleOpenAuth('register')}
          onExploreFeatures={() => {
            const el = document.getElementById('features');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onViewArchitecture={() => setActiveTab('hackathon')}
        />
        <AuthModal
          isOpen={authModalOpen}
          initialMode={authMode}
          onClose={() => setAuthModalOpen(false)}
          onSuccess={() => setActiveTab('dashboard')}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col transition-colors">
      <Navbar
        onOpenQuickPay={() => setQuickPayOpen(true)}
        onOpenNewTx={handleOpenNewTx}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
      />

      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenQuickPay={() => setQuickPayOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardPage
              key={refreshKey}
              onOpenQuickPay={() => setQuickPayOpen(true)}
              onOpenNewTx={handleOpenNewTx}
              onNavigateTab={setActiveTab}
              onViewReceipt={handleViewReceipt}
            />
          )}

          {activeTab === 'transactions' && (
            <TransactionsPage
              key={refreshKey}
              onOpenNewTx={handleOpenNewTx}
              onEditTx={handleEditTx}
              onViewReceipt={handleViewReceipt}
              onOpenQuickPay={() => setQuickPayOpen(true)}
            />
          )}

          {activeTab === 'expenses' && (
            <ExpensesPage
              key={refreshKey}
              onOpenNewTx={handleOpenNewTx}
              onEditTx={handleEditTx}
              onOpenQuickPay={() => setQuickPayOpen(true)}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsPage key={refreshKey} />}

          {activeTab === 'ai-advisor' && <AiAdvisorPage key={refreshKey} />}

          {activeTab === 'paypal-hub' && (
            <PayPalPage
              key={refreshKey}
              onOpenQuickPay={() => setQuickPayOpen(true)}
            />
          )}

          {activeTab === 'settings' && <SettingsPage />}

          {activeTab === 'hackathon' && <HackathonDocsPage />}
        </main>
      </div>

      {/* Shared Modals */}
      <QuickPayModal
        isOpen={quickPayOpen}
        onClose={() => setQuickPayOpen(false)}
        onPaymentSuccess={handleTransactionSuccess}
      />

      <TransactionModal
        isOpen={txModalOpen}
        transactionToEdit={txToEdit}
        onClose={() => setTxModalOpen(false)}
        onSuccess={handleTransactionSuccess}
      />

      <ReceiptModal
        isOpen={Boolean(receiptTx)}
        transaction={receiptTx}
        currency={user?.currency || 'USD'}
        onClose={() => setReceiptTx(null)}
      />

      <AuthModal
        isOpen={authModalOpen}
        initialMode={authMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setActiveTab('dashboard')}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </ThemeProvider>
  );
}
