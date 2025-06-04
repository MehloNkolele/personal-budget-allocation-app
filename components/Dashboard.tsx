
import React from 'react';
import ProgressBar from './ProgressBar';
import { InfoIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '../constants';
import { CURRENCIES } from '../constants'; // Import CURRENCIES

interface DashboardProps {
  totalIncome: number;
  onTotalIncomeChange: (income: number) => void;
  totalAllocated: number;
  unallocatedAmount: number;
  selectedCurrency: string;
  onCurrencyChange: (currencyCode: string) => void;
  areGlobalAmountsHidden: boolean;
  onToggleGlobalAmountsHidden: () => void;
  formatCurrency: (amount: number) => string; // Now expects a function that already knows about currency and visibility
  categories?: any[]; // Add categories prop
  onAddCategory?: () => void; // Add callback for adding categories
}

const Dashboard: React.FC<DashboardProps> = ({
  totalIncome,
  onTotalIncomeChange,
  totalAllocated,
  unallocatedAmount,
  selectedCurrency,
  onCurrencyChange,
  areGlobalAmountsHidden,
  onToggleGlobalAmountsHidden,
  formatCurrency,
  categories = [],
  onAddCategory,
}) => {
  const allocationExceedsIncome = totalAllocated > totalIncome && totalIncome > 0;
  const allocationMatchesIncome = totalAllocated === totalIncome && totalIncome > 0;

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onTotalIncomeChange(isNaN(value) || value < 0 ? 0 : value);
  };

  // Calculate dashboard statistics
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
  const completedSubcategories = categories.reduce((sum, cat) =>
    sum + cat.subcategories.filter(sub => sub.isComplete).length, 0
  );
  const allocationPercentage = totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0;

  // Get top categories by allocation
  const topCategories = [...categories]
    .sort((a, b) => b.allocatedAmount - a.allocatedAmount)
    .slice(0, 3);

  // Calculate savings rate
  const savingsAmount = Math.max(0, unallocatedAmount);
  const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  return (
    <div className="space-y-6">{/* Main container with spacing */}
      {/* Budget Overview Section */}
      <div className="bg-slate-800 p-4 sm:p-6 rounded-lg shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-sky-400">Budget Overview</h2>
          <button
              onClick={onToggleGlobalAmountsHidden}
              className="p-2 text-slate-400 hover:text-sky-400 transition-colors"
              aria-label={areGlobalAmountsHidden ? "Show amounts" : "Hide amounts"}
              aria-pressed={areGlobalAmountsHidden}
          >
              {areGlobalAmountsHidden ? <EyeSlashIcon className="w-6 h-6" /> : <EyeIcon className="w-6 h-6" />}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label htmlFor="totalIncome" className="block text-sm font-medium text-slate-300 mb-1">
              Total Monthly Income
            </label>
            <input
              type="number"
              id="totalIncome"
              value={totalIncome === 0 ? '' : totalIncome.toString()}
              onChange={handleIncomeChange}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 text-lg focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="Enter your total income"
            />
          </div>
          <div>
            <label htmlFor="currencySelector" className="block text-sm font-medium text-slate-300 mb-1">
              Currency
            </label>
            <select
              id="currencySelector"
              value={selectedCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 text-lg focus:ring-sky-500 focus:border-sky-500 transition"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Income:</span>
            <span className="font-semibold text-lg text-emerald-400">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-300">Total Allocated:</span>
            <span className={`font-semibold text-lg ${allocationExceedsIncome && !areGlobalAmountsHidden ? 'text-red-400' : 'text-sky-400'}`}>
              {formatCurrency(totalAllocated)}
            </span>
          </div>

          {!areGlobalAmountsHidden && totalIncome > 0 && (
              <ProgressBar value={totalAllocated} max={totalIncome} colorClass={allocationExceedsIncome ? 'bg-red-500' : 'bg-sky-500'} heightClass="h-3"/>
          )}
          {areGlobalAmountsHidden && totalIncome > 0 && (
               <div className="w-full bg-slate-700 rounded-full h-3 text-xs flex items-center justify-center text-slate-400">Progress hidden</div>
          )}

          <div className="flex justify-between items-center pt-1">
            <span className="text-slate-300">Remaining to Allocate:</span>
            <span className={`font-semibold text-lg ${unallocatedAmount < 0 && !areGlobalAmountsHidden ? 'text-red-400' : 'text-emerald-400'}`}>
              {formatCurrency(unallocatedAmount)}
            </span>
          </div>

          {!areGlobalAmountsHidden && allocationExceedsIncome && (
            <div className="mt-3 p-3 bg-red-500/20 border border-red-500 rounded-md text-red-300 text-sm flex items-start space-x-2">
              <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-red-400" />
              <span>Warning: Your total allocations exceed your income by {formatCurrency(Math.abs(unallocatedAmount))}.</span>
            </div>
          )}
          {!areGlobalAmountsHidden && allocationMatchesIncome && totalAllocated > 0 && (
             <div className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500 rounded-md text-emerald-300 text-sm flex items-start space-x-2">
              <CheckCircleIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-emerald-400" />
              <span>Great! Your budget is fully allocated.</span>
            </div>
          )}
           {!areGlobalAmountsHidden && unallocatedAmount > 0 && totalIncome > 0 && (
             <div className="mt-3 p-3 bg-sky-500/20 border border-sky-500 rounded-md text-sky-300 text-sm flex items-start space-x-2">
              <InfoIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-sky-400" />
              <span>You have {formatCurrency(unallocatedAmount)} remaining to allocate.</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Categories</p>
              <p className="text-2xl font-bold text-sky-400">{totalCategories}</p>
            </div>
            <div className="w-12 h-12 bg-sky-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Allocation Rate</p>
              <p className="text-2xl font-bold text-emerald-400">{allocationPercentage.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Tasks</p>
              <p className="text-2xl font-bold text-purple-400">{completedSubcategories}/{totalSubcategories}</p>
            </div>
            <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Savings Rate</p>
              <p className="text-2xl font-bold text-amber-400">{savingsRate.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Top Categories Section */}
      {topCategories.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">Top Categories by Allocation</h3>
          <div className="space-y-4">
            {topCategories.map((category, index) => {
              const percentage = totalIncome > 0 ? (category.allocatedAmount / totalIncome) * 100 : 0;
              return (
                <div key={category.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm ${
                      index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-slate-200 font-medium">{category.name}</p>
                      <p className="text-slate-400 text-sm">{percentage.toFixed(1)}% of income</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-200 font-semibold">{formatCurrency(category.allocatedAmount)}</p>
                    <div className="w-24 mt-1">
                      <ProgressBar
                        value={category.allocatedAmount}
                        max={totalIncome}
                        colorClass={index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-amber-600'}
                        heightClass="h-2"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick Actions Section */}
      <div className="bg-slate-800 p-6 rounded-lg">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {onAddCategory && (
            <button
              onClick={onAddCategory}
              className="flex items-center space-x-3 p-4 bg-sky-600/20 hover:bg-sky-600/30 border border-sky-600/50 rounded-lg transition-colors group"
            >
              <div className="w-10 h-10 bg-sky-600 rounded-lg flex items-center justify-center group-hover:bg-sky-500 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div>
                <p className="text-slate-200 font-medium">Add Category</p>
                <p className="text-slate-400 text-sm">Create a new budget category</p>
              </div>
            </button>
          )}

          <div className="flex items-center space-x-3 p-4 bg-emerald-600/20 border border-emerald-600/50 rounded-lg">
            <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <p className="text-slate-200 font-medium">Budget Health</p>
              <p className="text-slate-400 text-sm">
                {allocationPercentage > 100 ? 'Over-allocated' :
                 allocationPercentage > 90 ? 'Well-allocated' :
                 allocationPercentage > 50 ? 'Partially allocated' : 'Under-allocated'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-4 bg-purple-600/20 border border-purple-600/50 rounded-lg">
            <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div>
              <p className="text-slate-200 font-medium">Progress Tracking</p>
              <p className="text-slate-400 text-sm">
                {totalSubcategories > 0 ?
                  `${Math.round((completedSubcategories / totalSubcategories) * 100)}% tasks completed` :
                  'No tasks yet'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Insights */}
      {totalIncome > 0 && (
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">Financial Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-slate-200 font-medium mb-3">Budget Breakdown</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Allocated</span>
                  <span className="text-sky-400">{allocationPercentage.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Available</span>
                  <span className="text-emerald-400">{(100 - allocationPercentage).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                  <div
                    className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-slate-200 font-medium mb-3">Recommendations</h4>
              <div className="space-y-2 text-sm">
                {allocationPercentage < 50 && (
                  <p className="text-amber-400">💡 Consider allocating more of your income to reach your financial goals</p>
                )}
                {allocationPercentage > 100 && (
                  <p className="text-red-400">⚠️ You're over-allocated. Review your categories to stay within budget</p>
                )}
                {savingsRate > 20 && (
                  <p className="text-emerald-400">🎉 Great savings rate! You're building a strong financial foundation</p>
                )}
                {totalCategories === 0 && (
                  <p className="text-sky-400">🚀 Start by creating your first budget category</p>
                )}
                {totalCategories > 0 && totalSubcategories === 0 && (
                  <p className="text-purple-400">📝 Add subcategories to track specific goals within your budget</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
