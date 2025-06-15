import { BudgetData, Transaction, Category, MonthlyBudget } from '../types';

export interface AppStatistics {
  // Core Usage Stats
  totalBudgetsCreated: number;
  totalTransactions: number;
  totalCategories: number;
  daysSinceFirstUse: number;
  
  // Financial Insights
  totalMoneyTracked: number;
  averageMonthlySpending: number;
  mostUsedCategory: {
    name: string;
    transactionCount: number;
  } | null;
  biggestExpense: {
    amount: number;
    description: string;
    date: string;
  } | null;
  
  // Behavioral Patterns
  mostActiveMonth: {
    month: string;
    transactionCount: number;
  } | null;
  averageTransactionsPerMonth: number;
  budgetTemplatesCreated: number;
  
  // Additional Insights
  totalIncome: number;
  totalExpenses: number;
  savingsRate: number;
  categoriesWithSubcategories: number;
}

export function calculateAppStatistics(budgetData: BudgetData): AppStatistics {
  const { categories, transactions, monthlyBudgets, totalIncome } = budgetData;
  
  // Core Usage Stats
  const totalBudgetsCreated = monthlyBudgets.length;
  const totalTransactions = transactions.length;
  const totalCategories = categories.length;
  
  // Calculate days since first use
  const allDates = [
    ...transactions.map(t => new Date(t.date)),
    ...monthlyBudgets.map(b => new Date(b.createdAt))
  ].filter(date => !isNaN(date.getTime()));
  
  const firstUseDate = allDates.length > 0 ? new Date(Math.min(...allDates.map(d => d.getTime()))) : new Date();
  const daysSinceFirstUse = Math.floor((Date.now() - firstUseDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Financial Insights
  const expenseTransactions = transactions.filter(t => t.type === 'expense');
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalIncomeFromTransactions = incomeTransactions.reduce((sum, t) => sum + t.amount, 0);
  const totalMoneyTracked = totalExpenses + totalIncomeFromTransactions;
  
  // Calculate average monthly spending
  const monthsWithData = getUniqueMonths(transactions);
  const averageMonthlySpending = monthsWithData.length > 0 ? totalExpenses / monthsWithData.length : 0;
  
  // Find most used category
  const categoryUsage = new Map<string, { name: string; count: number }>();
  transactions.forEach(transaction => {
    const category = categories.find(c => c.id === transaction.categoryId);
    if (category) {
      const current = categoryUsage.get(category.id) || { name: category.name, count: 0 };
      categoryUsage.set(category.id, { ...current, count: current.count + 1 });
    }
  });
  
  const mostUsedCategory = Array.from(categoryUsage.values())
    .sort((a, b) => b.count - a.count)[0] || null;
  
  // Find biggest expense
  const biggestExpenseTransaction = expenseTransactions
    .sort((a, b) => b.amount - a.amount)[0] || null;
  
  const biggestExpense = biggestExpenseTransaction ? {
    amount: biggestExpenseTransaction.amount,
    description: biggestExpenseTransaction.description,
    date: biggestExpenseTransaction.date
  } : null;
  
  // Behavioral Patterns
  const monthlyTransactionCounts = new Map<string, number>();
  transactions.forEach(transaction => {
    const monthKey = new Date(transaction.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long' 
    });
    monthlyTransactionCounts.set(monthKey, (monthlyTransactionCounts.get(monthKey) || 0) + 1);
  });
  
  const mostActiveMonth = Array.from(monthlyTransactionCounts.entries())
    .sort(([,a], [,b]) => b - a)
    .map(([month, count]) => ({ month, transactionCount: count }))[0] || null;
  
  const averageTransactionsPerMonth = monthsWithData.length > 0 ? 
    totalTransactions / monthsWithData.length : 0;
  
  // Count categories with subcategories
  const categoriesWithSubcategories = categories.filter(c => c.subcategories.length > 0).length;
  
  // Calculate savings rate
  const totalIncomeValue = totalIncome || totalIncomeFromTransactions;
  const savingsRate = totalIncomeValue > 0 ? 
    ((totalIncomeValue - totalExpenses) / totalIncomeValue) * 100 : 0;
  
  return {
    totalBudgetsCreated,
    totalTransactions,
    totalCategories,
    daysSinceFirstUse,
    totalMoneyTracked,
    averageMonthlySpending,
    mostUsedCategory: mostUsedCategory ? {
      name: mostUsedCategory.name,
      transactionCount: mostUsedCategory.count
    } : null,
    biggestExpense,
    mostActiveMonth,
    averageTransactionsPerMonth,
    budgetTemplatesCreated: 0, // This would need to be passed from templates data
    totalIncome: totalIncomeValue,
    totalExpenses,
    savingsRate,
    categoriesWithSubcategories
  };
}

function getUniqueMonths(transactions: Transaction[]): string[] {
  const months = new Set<string>();
  transactions.forEach(transaction => {
    const monthKey = new Date(transaction.date).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'numeric' 
    });
    months.add(monthKey);
  });
  return Array.from(months);
}

export function formatStatisticValue(value: number, type: 'currency' | 'number' | 'percentage' | 'days', currency: string = 'USD'): string {
  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(value);
    case 'percentage':
      return `${value.toFixed(1)}%`;
    case 'days':
      if (value === 0) return 'Today';
      if (value === 1) return '1 day';
      if (value < 30) return `${value} days`;
      if (value < 365) return `${Math.floor(value / 30)} months`;
      return `${Math.floor(value / 365)} years`;
    case 'number':
    default:
      return value.toLocaleString();
  }
}
