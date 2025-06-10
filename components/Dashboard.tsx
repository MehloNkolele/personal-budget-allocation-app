import React from 'react';
import ProgressBar from './ProgressBar';

interface DashboardProps {
  totalIncome: number;
  totalAllocated: number;
  unallocatedAmount: number;
  formatCurrency: (amount: number) => string;
  categories?: any[];
  onAddCategory?: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  totalIncome,
  totalAllocated,
  unallocatedAmount,
  formatCurrency,
  categories = [],
  onAddCategory,
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

  return (
    <div className="space-y-6">
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

      {topCategories.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-sky-400">Top Categories</h3>
          <ul className="space-y-4">
            {topCategories.map(cat => (
              <li key={cat.id} className="flex justify-between items-center">
                <span className="text-slate-300">{cat.name}</span>
                <span className="font-semibold text-sky-400">{formatCurrency(cat.allocatedAmount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {categories.length === 0 && (
          <div className="text-center py-10 px-6 bg-slate-800 rounded-lg">
              <h3 className="text-xl font-semibold text-white">Welcome to Your Budget Dashboard!</h3>
              <p className="text-slate-400 mt-2 mb-4">Get started by adding a category to your budget.</p>
              <button
                onClick={onAddCategory}
                className="bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
              >
                Add First Category
              </button>
          </div>
      )}
    </div>
  );
};

export default Dashboard;
