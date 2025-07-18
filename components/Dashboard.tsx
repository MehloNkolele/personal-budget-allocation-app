import React from 'react';

interface DashboardProps {
  totalIncome: number;
  totalAllocated: number;
  unallocatedAmount: number;
  formatCurrency: (amount: number) => string;
  categories?: any[];
  onAddCategory?: () => void;
  onNavigateToSection?: (section: 'categories' | 'reports' | 'planning' | 'history' | 'savings') => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  totalIncome,
  totalAllocated,
  unallocatedAmount,
  formatCurrency,
  categories = [],
  onAddCategory,
  onNavigateToSection,
}) => {
  const totalCategories = categories.length;
  const totalSubcategories = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);
  const completedSubcategories = categories.reduce((sum, cat) =>
    sum + cat.subcategories.filter((sub: any) => sub.isComplete).length, 0
  );
  const allocationPercentage = totalIncome > 0 ? (totalAllocated / totalIncome) * 100 : 0;

  const topCategories = [...categories]
    .sort((a, b) => b.allocatedAmount - a.allocatedAmount)
    .slice(0, 3);

  const savingsAmount = Math.max(0, unallocatedAmount);
  const savingsRate = totalIncome > 0 ? (savingsAmount / totalIncome) * 100 : 0;

  // Enhanced display logic with better data
  const hasData = totalIncome > 0 || categories.length > 0;
  const completionRate = totalSubcategories > 0 ? (completedSubcategories / totalSubcategories) * 100 : 0;

  // Smart currency formatting for responsive display
  const formatCurrencyResponsive = (amount: number) => {
    const formatted = formatCurrency(amount);
    // For very large amounts, use abbreviations on smaller screens
    if (Math.abs(amount) >= 1000000) {
      const millions = amount / 1000000;
      return {
        full: formatted,
        abbreviated: `${millions.toFixed(1)}M`,
        shouldAbbreviate: true
      };
    } else if (Math.abs(amount) >= 1000) {
      const thousands = amount / 1000;
      return {
        full: formatted,
        abbreviated: `${thousands.toFixed(1)}K`,
        shouldAbbreviate: true
      };
    }
    return {
      full: formatted,
      abbreviated: formatted,
      shouldAbbreviate: false
    };
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center py-6">
        <h1 className="text-3xl font-bold text-white mb-2">Budget Dashboard</h1>
        <p className="text-slate-400 text-lg">Get a clear overview of your financial health</p>
      </div>

      {/* Enhanced Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Categories Card - Clickable */}
        <button 
          onClick={() => onNavigateToSection?.('categories')}
          className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 hover:border-sky-500 transition-all duration-300 group text-left w-full focus:outline-none focus:ring-2 focus:ring-sky-500/50 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Active Categories</p>
              <p className="text-3xl font-bold text-sky-400 mb-2">{totalCategories}</p>
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 bg-sky-400 rounded-full mr-2"></div>
                {totalSubcategories} subcategories
              </div>
            </div>
            <div className="w-14 h-14 bg-sky-500/20 rounded-xl flex items-center justify-center group-hover:bg-sky-500/30 transition-colors">
              <svg className="w-7 h-7 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </button>

        {/* Reports Card - Clickable */}
        <button
          onClick={() => onNavigateToSection?.('reports')}
          className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 hover:border-emerald-500 transition-all duration-300 group text-left w-full focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Allocation Rate</p>
              <p className="text-3xl font-bold text-emerald-400 mb-2">{allocationPercentage.toFixed(1)}%</p>
              <div className="w-full bg-slate-600 rounded-full h-2">
                <div 
                  className="bg-emerald-400 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
                ></div>
              </div>
            </div>
            <div className="w-14 h-14 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
              <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
          </div>
        </button>

        {/* Planning Card - Clickable */}
        <button
          onClick={() => onNavigateToSection?.('planning')}
          className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 hover:border-purple-500 transition-all duration-300 group text-left w-full focus:outline-none focus:ring-2 focus:ring-purple-500/50 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Task Progress</p>
              <p className="text-3xl font-bold text-purple-400 mb-2">{completedSubcategories}/{totalSubcategories}</p>
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-2"></div>
                {completionRate.toFixed(0)}% complete
              </div>
            </div>
            <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:bg-purple-500/30 transition-colors">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </button>

        {/* Savings Calculator Card - Clickable */}
        <button
          onClick={() => onNavigateToSection?.('savings')}
          className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600 hover:border-amber-500 transition-all duration-300 group text-left w-full focus:outline-none focus:ring-2 focus:ring-amber-500/50 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium mb-1">Savings Potential</p>
              <p className="text-3xl font-bold text-amber-400 mb-2">{savingsRate.toFixed(1)}%</p>
              <div className="flex items-center text-xs text-slate-500">
                <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                {savingsRate > 0 ? 'Funds available' : 'No surplus'}
              </div>
            </div>
            <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:bg-amber-500/30 transition-colors">
              <svg className="w-7 h-7 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </button>
      </div>

      {/* Enhanced Content Section */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
        {/* Top Categories - Redesigned */}
        {topCategories.length > 0 && (
          <div className="xl:col-span-2 bg-gradient-to-br from-slate-800/80 via-slate-800/60 to-slate-700/80 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-3xl border border-slate-600/50 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Top Categories</h3>
                  <p className="text-slate-400 text-xs sm:text-sm">Budget allocation breakdown</p>
                </div>
              </div>
              <button
                onClick={() => onNavigateToSection?.('categories')}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-sky-500/20 to-blue-500/20 hover:from-sky-500/30 hover:to-blue-500/30 text-sky-400 hover:text-sky-300 px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl border border-sky-500/30 hover:border-sky-400/50 transition-all duration-300 group backdrop-blur-sm text-sm"
              >
                <span className="font-medium">View All</span>
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="space-y-3 sm:space-y-4">
              {topCategories.map((cat, index) => {
                const percentage = totalAllocated > 0 ? (cat.allocatedAmount / totalAllocated) * 100 : 0;
                const gradients = [
                  'from-sky-400 to-blue-500',
                  'from-emerald-400 to-green-500',
                  'from-purple-400 to-violet-500'
                ];
                const bgGradients = [
                  'from-sky-500/10 to-blue-500/10',
                  'from-emerald-500/10 to-green-500/10',
                  'from-purple-500/10 to-violet-500/10'
                ];
                const borderColors = [
                  'border-sky-500/20 hover:border-sky-400/40',
                  'border-emerald-500/20 hover:border-emerald-400/40',
                  'border-purple-500/20 hover:border-purple-400/40'
                ];

                return (
                  <button
                    key={cat.id}
                    onClick={() => onNavigateToSection?.('categories')}
                    className={`w-full group relative overflow-hidden bg-gradient-to-r ${bgGradients[index]} backdrop-blur-sm border ${borderColors[index]} rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:scale-[1.01] sm:hover:scale-[1.02] transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-sky-500/50 shadow-lg hover:shadow-xl`}
                  >
                    {/* Mobile Layout */}
                    <div className="block sm:hidden">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                          <div className={`relative w-10 h-10 bg-gradient-to-br ${gradients[index]} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="text-white font-bold text-sm relative z-10">{cat.name.charAt(0)}</span>
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <h4 className="text-white font-bold text-base group-hover:text-sky-100 transition-colors duration-200 truncate">{cat.name}</h4>
                            <p className="text-slate-400 text-xs font-medium">{percentage.toFixed(1)}% of budget</p>
                          </div>
                        </div>
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradients[index]} flex-shrink-0`}></div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="w-16 sm:w-20 bg-slate-600/50 rounded-full h-1.5">
                            <div
                              className={`h-1.5 rounded-full bg-gradient-to-r ${gradients[index]} transition-all duration-500`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-500 whitespace-nowrap">{cat.subcategories?.length || 0} items</span>
                        </div>
                        <div className="text-right flex-shrink-0 ml-2">
                          <p className={`font-bold text-sm bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}>
                            {formatCurrency(cat.allocatedAmount)}
                          </p>
                          <span className="text-xs text-slate-400 font-medium">#{index + 1}</span>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:block">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 min-w-0 flex-1">
                          <div className={`relative w-14 h-14 bg-gradient-to-br ${gradients[index]} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300 flex-shrink-0`}>
                            <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            <span className="text-white font-bold text-lg relative z-10">{cat.name.charAt(0)}</span>
                          </div>
                          <div className="text-left min-w-0 flex-1">
                            <h4 className="text-white font-bold text-lg group-hover:text-sky-100 transition-colors duration-200 truncate">{cat.name}</h4>
                            <p className="text-slate-400 text-sm font-medium">{percentage.toFixed(1)}% of budget</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <div className="w-12 bg-slate-600/50 rounded-full h-1.5">
                                <div
                                  className={`h-1.5 rounded-full bg-gradient-to-r ${gradients[index]} transition-all duration-500`}
                                  style={{ width: `${Math.min(percentage, 100)}%` }}
                                ></div>
                              </div>
                              <span className="text-xs text-slate-500">{cat.subcategories?.length || 0} items</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 ml-4">
                          <p className={`font-bold text-xl bg-gradient-to-r ${gradients[index]} bg-clip-text text-transparent`}>
                            {formatCurrency(cat.allocatedAmount)}
                          </p>
                          <div className="flex items-center justify-end space-x-1 mt-1">
                            <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${gradients[index]}`}></div>
                            <span className="text-xs text-slate-400 font-medium">#{index + 1}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Subtle hover effect overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Quick Insights Summary */}
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-4 sm:p-6 lg:p-8 rounded-xl sm:rounded-2xl border border-slate-600">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-2 sm:space-y-0">
            <h3 className="text-xl sm:text-2xl font-bold text-white">Quick Insights</h3>
            <button
              onClick={() => onNavigateToSection?.('history')}
              className="text-slate-400 hover:text-sky-400 text-sm font-medium transition-colors duration-200 flex items-center space-x-1 group self-start sm:self-auto"
            >
              <span>View History</span>
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
          
          {hasData ? (
            <div className="space-y-4 sm:space-y-6">
              {/* Budget Allocation Progress */}
              <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-slate-400 font-medium text-sm sm:text-base">Budget Progress</span>
                  <span className="text-sky-400 font-bold text-sm">{allocationPercentage.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 sm:h-3">
                  <div
                    className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${
                      allocationPercentage > 100 ? 'bg-red-500' : 'bg-sky-400'
                    }`}
                    style={{ width: `${Math.min(allocationPercentage, 100)}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {allocationPercentage > 100 ? 'Over allocated' :
                   allocationPercentage >= 80 ? 'Well allocated' : 'Room to allocate more'}
                </div>
              </div>

              {/* Category Distribution */}
              <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-slate-400 font-medium text-sm sm:text-base">Categories</span>
                  <span className="text-purple-400 font-bold text-base sm:text-lg">{totalCategories}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 bg-slate-600 rounded-full h-2">
                    <div className="bg-purple-400 h-2 rounded-full w-full"></div>
                  </div>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {totalSubcategories} subcategories total
                </div>
              </div>

              {/* Task Completion */}
              <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <span className="text-slate-400 font-medium text-sm sm:text-base">Task Completion</span>
                  <span className="text-emerald-400 font-bold text-sm">{completionRate.toFixed(0)}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2 sm:h-3">
                  <div
                    className="bg-emerald-400 h-2 sm:h-3 rounded-full transition-all duration-500"
                    style={{ width: `${completionRate}%` }}
                  ></div>
                </div>
                <div className="text-xs text-slate-500 mt-2">
                  {completedSubcategories} of {totalSubcategories} tasks done
                </div>
              </div>

              {/* Budget Health Status */}
              <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg sm:rounded-xl">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                    allocationPercentage <= 100 && allocationPercentage >= 80 ? 'bg-emerald-400' :
                    allocationPercentage > 100 ? 'bg-red-400' : 'bg-amber-400'
                  }`}></div>
                  <span className="text-white font-medium text-sm sm:text-base">
                    {allocationPercentage <= 100 && allocationPercentage >= 80 ? 'Excellent balance!' :
                     allocationPercentage > 100 ? 'Review needed' : 'Good progress'}
                  </span>
                </div>
                <div className="text-xs text-slate-500">
                  {allocationPercentage <= 100 && allocationPercentage >= 80 ? 'Your budget allocation looks great' :
                   allocationPercentage > 100 ? 'Consider adjusting some categories' : 'You can allocate more to categories'}
                </div>
              </div>

              {/* Savings Potential */}
              <div className="p-3 sm:p-4 bg-slate-700/50 rounded-lg sm:rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 font-medium text-sm sm:text-base">Savings Rate</span>
                  <span className="text-amber-400 font-bold text-base sm:text-lg">{savingsRate.toFixed(1)}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-xs text-slate-500">
                    {savingsRate > 20 ? 'Excellent savings!' :
                     savingsRate > 10 ? 'Good savings rate' : 'Consider saving more'}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-slate-400 text-sm">Set up your budget to see insights</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Welcome Message for New Users */}
      {categories.length === 0 && (
        <div className="text-center py-8 sm:py-12 px-4 sm:px-8 bg-gradient-to-br from-sky-900/30 to-purple-900/30 rounded-xl sm:rounded-2xl border border-sky-500/30">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-sky-500/20 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
            <svg className="w-8 h-8 sm:w-10 sm:h-10 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Welcome to Your Budget Dashboard!</h3>
          <p className="text-slate-300 text-base sm:text-lg mb-6 max-w-md mx-auto">
            Take control of your finances by creating your first budget category.
          </p>
          <button
            onClick={onAddCategory}
            className="bg-gradient-to-r from-sky-600 to-purple-600 hover:from-sky-700 hover:to-purple-700 text-white font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg text-sm sm:text-base"
          >
            Create Your First Category
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
