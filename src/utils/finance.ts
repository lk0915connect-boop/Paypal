/**
 * Pure financial utility functions for calculations, analytics, and metrics.
 * Decoupled from UI components for pure testability and deterministic assertions.
 */

export interface TransactionSummaryItem {
  id?: number | string;
  transaction_type: 'income' | 'expense';
  amount: number;
  category: string;
  created_at?: string;
  payment_method?: string;
}

export interface CashflowSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number; // percentage 0 - 100
  totalTransactions: number;
}

export interface CategorySummary {
  category: string;
  amount: number;
  percentage: number;
  count: number;
}

/**
 * Calculates net balance, total income, total expenses, and savings rate.
 */
export function calculateCashflow(transactions: TransactionSummaryItem[]): CashflowSummary {
  let totalIncome = 0;
  let totalExpenses = 0;

  for (const t of transactions) {
    const val = Number(t.amount) || 0;
    if (t.transaction_type === 'income') {
      totalIncome += val;
    } else {
      totalExpenses += val;
    }
  }

  const netSavings = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

  return {
    totalIncome: Math.round(totalIncome * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netSavings: Math.round(netSavings * 100) / 100,
    savingsRate,
    totalTransactions: transactions.length,
  };
}

/**
 * Aggregates expenses by category with amounts and percentages.
 */
export function calculateCategoryBreakdown(transactions: TransactionSummaryItem[]): CategorySummary[] {
  const expenses = transactions.filter((t) => t.transaction_type === 'expense');
  const totalExpense = expenses.reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const categoryMap = new Map<string, { amount: number; count: number }>();

  for (const t of expenses) {
    const cat = t.category || 'Other';
    const current = categoryMap.get(cat) || { amount: 0, count: 0 };
    categoryMap.set(cat, {
      amount: current.amount + (Number(t.amount) || 0),
      count: current.count + 1,
    });
  }

  const results: CategorySummary[] = [];
  for (const [category, data] of categoryMap.entries()) {
    const percentage = totalExpense > 0 ? Math.round((data.amount / totalExpense) * 1000) / 10 : 0;
    results.push({
      category,
      amount: Math.round(data.amount * 100) / 100,
      percentage,
      count: data.count,
    });
  }

  return results.sort((a, b) => b.amount - a.amount);
}

/**
 * Calculates a proprietary Financial Health Score (0 - 100) based on:
 * - Savings rate (40% weight)
 * - Expense-to-income ratio (30% weight)
 * - Category diversification (15% weight)
 * - Activity continuity (15% weight)
 */
export function calculateFinancialHealthScore(
  income: number,
  expenses: number,
  transactionsCount: number,
  categoryCount: number
): { score: number; rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention'; color: string } {
  if (income <= 0 && expenses <= 0) {
    return { score: 50, rating: 'Fair', color: '#F59E0B' };
  }

  // 1. Savings rate component (0 - 40 points)
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  let savingsPoints = 0;
  if (savingsRate >= 0.3) savingsPoints = 40;
  else if (savingsRate >= 0.2) savingsPoints = 35;
  else if (savingsRate >= 0.1) savingsPoints = 25;
  else if (savingsRate > 0) savingsPoints = 15;
  else savingsPoints = 5;

  // 2. Expense coverage ratio (0 - 30 points)
  let ratioPoints = 0;
  const expenseRatio = income > 0 ? expenses / income : 1.5;
  if (expenseRatio <= 0.5) ratioPoints = 30;
  else if (expenseRatio <= 0.7) ratioPoints = 25;
  else if (expenseRatio <= 0.85) ratioPoints = 18;
  else if (expenseRatio <= 1.0) ratioPoints = 10;
  else ratioPoints = 2;

  // 3. Category diversity (0 - 15 points)
  const diversityPoints = Math.min(15, categoryCount * 3);

  // 4. Transaction logging continuity (0 - 15 points)
  const activityPoints = Math.min(15, transactionsCount >= 5 ? 15 : transactionsCount * 3);

  const rawScore = Math.min(100, Math.max(10, savingsPoints + ratioPoints + diversityPoints + activityPoints));

  let rating: 'Excellent' | 'Good' | 'Fair' | 'Needs Attention' = 'Fair';
  let color = '#F59E0B';

  if (rawScore >= 80) {
    rating = 'Excellent';
    color = '#10B981';
  } else if (rawScore >= 65) {
    rating = 'Good';
    color = '#0070BA';
  } else if (rawScore >= 45) {
    rating = 'Fair';
    color = '#F59E0B';
  } else {
    rating = 'Needs Attention';
    color = '#EF4444';
  }

  return { score: rawScore, rating, color };
}

/**
 * Formats monetary amounts with specified currency symbol.
 */
export function formatCurrency(amount: number, currency = 'USD'): string {
  const currencySymbols: Record<string, string> = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'CA$',
    AUD: 'A$',
    JPY: '¥',
  };

  const symbol = currencySymbols[currency] || '$';
  const formatted = Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return `${amount < 0 ? '-' : ''}${symbol}${formatted}`;
}
