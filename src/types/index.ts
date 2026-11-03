export type TransactionType = 'income' | 'expense';
export type PaymentMethod = 'paypal' | 'credit_card' | 'bank_transfer' | 'cash' | 'other';
export type TransactionStatus = 'completed' | 'pending' | 'failed';

export interface User {
  id: number;
  name: string;
  email: string;
  currency: string;
  created_at?: string;
}

export interface Transaction {
  id: number;
  user_id: number;
  transaction_type: TransactionType;
  amount: number;
  category: string;
  description: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  paypal_order_id?: string | null;
  is_demo?: number;
  created_at: string;
}

export interface PaymentRecord {
  id: number;
  user_id: number;
  paypal_order_id: string;
  capture_id?: string;
  amount: number;
  currency: string;
  status: string;
  raw_response?: string;
  created_at: string;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export interface FinancialHealth {
  score: number;
  rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention';
  color: string;
}

export interface DashboardStats {
  cashflow: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    totalTransactions: number;
  };
  categoryBreakdown: CategorySummary[];
  health: FinancialHealth;
  monthlyTrends: MonthlyTrend[];
  recentTransactions: Transaction[];
  paypalCount: number;
}

export interface ChatMessage {
  id?: number;
  user_id?: number;
  message: string;
  response: string;
  created_at?: string;
}

export interface FinancialInsight {
  score?: number;
  rating?: string;
  summary: string;
  recommendations: Array<{
    title: string;
    description?: string;
    impact: 'High' | 'Medium' | 'Low';
    category: string;
  }>;
}
