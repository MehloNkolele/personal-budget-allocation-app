import React, { useState, useMemo } from 'react';
import { MonthlyBudget, Transaction, TransactionFilter } from '../types';
import {
  CalendarIcon,
  ChartBarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '../constants';

interface BudgetHistoryProps {
  monthlyBudgets: MonthlyBudget[];
  allTransactions: Transaction[];
  formatCurrency: (amount: number) => string;
  selectedCurrency: string;
}

const BudgetHistory: React.FC<BudgetHistoryProps> = ({
  monthlyBudgets,
  allTransactions,
  formatCurrency,
  selectedCurrency
}) => {
  const [selectedBudget, setSelectedBudget] = useState<MonthlyBudget | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [transactionFilter, setTransactionFilter] = useState<TransactionFilter>({
    transactionType: 'all'
  });

  // Sort budgets by month (newest first)
  const sortedBudgets = useMemo(() => {
    return [...monthlyBudgets].sort((a, b) => b.month.localeCompare(a.month));
  }, [monthlyBudgets]);

  // Filter transactions based on search and filters
  const filteredTransactions = useMemo(() => {
    if (!selectedBudget) return [];

    let transactions = selectedBudget.transactions;

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      transactions = transactions.filter(t => 
        t.description.toLowerCase().includes(query) ||
        t.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Apply transaction type filter
    if (transactionFilter.transactionType !== 'all') {
      transactions = transactions.filter(t => t.type === transactionFilter.transactionType);
    }

    return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [selectedBudget, searchQuery, transactionFilter]);

  // Calculate budget statistics
  const budgetStats = useMemo(() => {
    if (!selectedBudget) return null;

    const totalAllocated = selectedBudget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
    const totalSpent = selectedBudget.categories.reduce((sum, cat) => sum + (cat.spentAmount || 0), 0);
    const totalIncome = selectedBudget.totalIncome;
    const remaining = totalAllocated - totalSpent;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    return {
      totalAllocated,
      totalSpent,
      totalIncome,
      remaining,
      savingsRate,
      transactionCount: selectedBudget.transactions.length
    };
  }, [selectedBudget]);

  const getCategoryName = (categoryId: string) => {
    if (!selectedBudget) return 'Unknown';
    const category = selectedBudget.categories.find(cat => cat.id === categoryId);
    return category?.name || 'Unknown Category';
  };

  const getSubcategoryName = (categoryId: string, subcategoryId?: string) => {
    if (!selectedBudget || !subcategoryId) return null;
    const category = selectedBudget.categories.find(cat => cat.id === categoryId);
    const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
    return subcategory?.name || null;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-sky-400">Budget History</h2>
          <p className="text-slate-400 mt-1">
            View your monthly budget history and transaction details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Budget List */}
        <div className="lg:col-span-1">
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Monthly Budgets</h3>
            
            {sortedBudgets.length > 0 ? (
              <div className="space-y-3">
                {sortedBudgets.map(budget => {
                  const totalSpent = budget.categories.reduce((sum, cat) => sum + (cat.spentAmount || 0), 0);
                  const isSelected = selectedBudget?.id === budget.id;
                  
                  return (
                    <button
                      key={budget.id}
                      onClick={() => setSelectedBudget(budget)}
                      className={`w-full p-4 rounded-lg border transition-all duration-200 text-left ${
                        isSelected
                          ? 'bg-sky-600 border-sky-500 text-white'
                          : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{budget.monthName}</h4>
                        <CalendarIcon className="w-4 h-4" />
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className={isSelected ? 'text-sky-100' : 'text-slate-400'}>Income:</span>
                          <span className={isSelected ? 'text-emerald-200' : 'text-emerald-400'}>
                            {formatCurrency(budget.totalIncome)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isSelected ? 'text-sky-100' : 'text-slate-400'}>Spent:</span>
                          <span className={isSelected ? 'text-red-200' : 'text-red-400'}>
                            {formatCurrency(totalSpent)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className={isSelected ? 'text-sky-100' : 'text-slate-400'}>Transactions:</span>
                          <span className={isSelected ? 'text-purple-200' : 'text-purple-400'}>
                            {budget.transactions.length}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No budget history available</p>
                <p className="text-sm text-slate-500 mt-2">Create monthly budgets to see history here</p>
              </div>
            )}
          </div>
        </div>

        {/* Budget Details */}
        <div className="lg:col-span-2">
          {selectedBudget ? (
            <div className="space-y-6">
              {/* Budget Overview */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold text-sky-400 mb-4">
                  {selectedBudget.monthName} Overview
                </h3>
                
                {budgetStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <CurrencyDollarIcon className="w-5 h-5 text-emerald-400" />
                        <span className="text-slate-400 text-sm">Income</span>
                      </div>
                      <p className="text-xl font-bold text-emerald-400">
                        {formatCurrency(budgetStats.totalIncome)}
                      </p>
                    </div>
                    
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ArrowTrendingDownIcon className="w-5 h-5 text-red-400" />
                        <span className="text-slate-400 text-sm">Spent</span>
                      </div>
                      <p className="text-xl font-bold text-red-400">
                        {formatCurrency(budgetStats.totalSpent)}
                      </p>
                    </div>
                    
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ArrowTrendingUpIcon className="w-5 h-5 text-sky-400" />
                        <span className="text-slate-400 text-sm">Remaining</span>
                      </div>
                      <p className={`text-xl font-bold ${budgetStats.remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(budgetStats.remaining)}
                      </p>
                    </div>
                    
                    <div className="bg-slate-700 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <ChartBarIcon className="w-5 h-5 text-purple-400" />
                        <span className="text-slate-400 text-sm">Savings Rate</span>
                      </div>
                      <p className={`text-xl font-bold ${
                        budgetStats.savingsRate > 20 ? 'text-emerald-400' :
                        budgetStats.savingsRate > 10 ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        {budgetStats.savingsRate.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Category Breakdown */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <h3 className="text-xl font-semibold text-sky-400 mb-4">Category Breakdown</h3>
                <div className="space-y-3">
                  {selectedBudget.categories.map(category => {
                    const spentAmount = category.spentAmount || 0;
                    const percentage = category.allocatedAmount > 0 ? (spentAmount / category.allocatedAmount) * 100 : 0;
                    
                    return (
                      <div key={category.id} className="bg-slate-700 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="font-medium text-slate-200">{category.name}</h4>
                          <span className={`text-sm px-2 py-1 rounded ${
                            percentage > 100 ? 'bg-red-500/20 text-red-400' :
                            percentage > 80 ? 'bg-amber-500/20 text-amber-400' :
                            'bg-emerald-500/20 text-emerald-400'
                          }`}>
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-slate-400">Allocated:</span>
                            <p className="text-sky-400 font-medium">{formatCurrency(category.allocatedAmount)}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Spent:</span>
                            <p className="text-red-400 font-medium">{formatCurrency(spentAmount)}</p>
                          </div>
                          <div>
                            <span className="text-slate-400">Remaining:</span>
                            <p className={`font-medium ${category.allocatedAmount - spentAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {formatCurrency(category.allocatedAmount - spentAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Transaction History */}
              <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                  <h3 className="text-xl font-semibold text-sky-400">Transaction History</h3>
                  
                  <div className="flex flex-col sm:flex-row gap-2">
                    {/* Search */}
                    <div className="relative">
                      <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search transactions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                      />
                    </div>
                    
                    {/* Filter */}
                    <select
                      value={transactionFilter.transactionType}
                      onChange={(e) => setTransactionFilter(prev => ({ ...prev, transactionType: e.target.value as any }))}
                      className="bg-slate-700 border border-slate-600 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
                    >
                      <option value="all">All Types</option>
                      <option value="expense">Expenses</option>
                      <option value="income">Income</option>
                    </select>
                  </div>
                </div>

                {filteredTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {filteredTransactions.map(transaction => {
                      const subcategoryName = getSubcategoryName(transaction.categoryId, transaction.subcategoryId);
                      
                      return (
                        <div key={transaction.id} className="bg-slate-700 p-4 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  transaction.type === 'expense' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
                                }`}>
                                  {transaction.type === 'expense' ? 'Expense' : 'Income'}
                                </span>
                                <span className="text-slate-400 text-sm">
                                  {new Date(transaction.date).toLocaleDateString()}
                                </span>
                              </div>
                              <h4 className="font-medium text-slate-200 mb-1">{transaction.description}</h4>
                              <p className="text-sm text-slate-400">
                                {getCategoryName(transaction.categoryId)}
                                {subcategoryName && ` → ${subcategoryName}`}
                              </p>
                              {transaction.tags && transaction.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {transaction.tags.map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-slate-600 text-slate-300 text-xs rounded">
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="text-right">
                              <p className={`text-lg font-bold ${
                                transaction.type === 'expense' ? 'text-red-400' : 'text-emerald-400'
                              }`}>
                                {transaction.type === 'expense' ? '-' : '+'}{formatCurrency(transaction.amount)}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <DocumentTextIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No transactions found</p>
                    <p className="text-sm text-slate-500 mt-2">
                      {searchQuery ? 'Try adjusting your search or filters' : 'No transactions recorded for this month'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
              <div className="text-center py-12">
                <ChartBarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Select a monthly budget to view details</p>
                <p className="text-sm text-slate-500 mt-2">
                  Choose a month from the list to see budget breakdown and transaction history
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetHistory;
