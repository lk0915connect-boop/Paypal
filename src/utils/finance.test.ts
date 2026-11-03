import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCashflow,
  calculateCategoryBreakdown,
  calculateFinancialHealthScore,
  formatCurrency,
  TransactionSummaryItem,
} from './finance';

test('calculateCashflow correctly computes income, expense, and savings rate', () => {
  const sampleTransactions: TransactionSummaryItem[] = [
    { transaction_type: 'income', amount: 5000, category: 'Salary' },
    { transaction_type: 'income', amount: 1000, category: 'Freelance' },
    { transaction_type: 'expense', amount: 1500, category: 'Bills' },
    { transaction_type: 'expense', amount: 500, category: 'Food' },
  ];

  const cashflow = calculateCashflow(sampleTransactions);

  assert.equal(cashflow.totalIncome, 6000);
  assert.equal(cashflow.totalExpenses, 2000);
  assert.equal(cashflow.netSavings, 4000);
  assert.equal(cashflow.savingsRate, 67); // (4000 / 6000) * 100 ~ 66.6% -> 67%
  assert.equal(cashflow.totalTransactions, 4);
});

test('calculateCashflow handles zero income gracefully', () => {
  const expensesOnly: TransactionSummaryItem[] = [
    { transaction_type: 'expense', amount: 300, category: 'Food' },
  ];

  const cashflow = calculateCashflow(expensesOnly);
  assert.equal(cashflow.totalIncome, 0);
  assert.equal(cashflow.totalExpenses, 300);
  assert.equal(cashflow.netSavings, -300);
  assert.equal(cashflow.savingsRate, 0);
});

test('calculateCategoryBreakdown groups by category and orders descending', () => {
  const transactions: TransactionSummaryItem[] = [
    { transaction_type: 'expense', amount: 200, category: 'Food' },
    { transaction_type: 'expense', amount: 800, category: 'Bills' },
    { transaction_type: 'expense', amount: 100, category: 'Food' },
    { transaction_type: 'income', amount: 5000, category: 'Salary' },
  ];

  const breakdown = calculateCategoryBreakdown(transactions);
  assert.equal(breakdown.length, 2);
  assert.equal(breakdown[0].category, 'Bills');
  assert.equal(breakdown[0].amount, 800);
  assert.equal(breakdown[0].percentage, 72.7);
  assert.equal(breakdown[1].category, 'Food');
  assert.equal(breakdown[1].amount, 300);
  assert.equal(breakdown[1].percentage, 27.3);
});

test('calculateFinancialHealthScore returns high score for strong savings', () => {
  const result = calculateFinancialHealthScore(7000, 2500, 10, 5);
  assert.ok(result.score >= 80, `Expected score >= 80, got ${result.score}`);
  assert.equal(result.rating, 'Excellent');
});

test('formatCurrency formats multiple currencies properly', () => {
  assert.equal(formatCurrency(1250.5, 'USD'), '$1,250.50');
  assert.equal(formatCurrency(500, 'EUR'), '€500.00');
  assert.equal(formatCurrency(320, 'GBP'), '£320.00');
  assert.equal(formatCurrency(-75, 'USD'), '-$75.00');
});
