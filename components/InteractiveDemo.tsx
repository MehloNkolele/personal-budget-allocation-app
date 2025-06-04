import React, { useState, useEffect } from 'react';
import {
  CurrencyDollarIcon,
  TagIcon,
  ChartBarIcon,
  CalendarIcon,
  CheckIcon
} from '../constants';

interface InteractiveDemoProps {
  type: 'budget' | 'category' | 'transaction' | 'chart' | 'planning';
  onInteraction?: () => void;
  formatCurrency?: (amount: number) => string;
  selectedCurrency?: string;
}

const InteractiveDemo: React.FC<InteractiveDemoProps> = ({
  type,
  onInteraction,
  formatCurrency = (amount: number) => `R${amount.toLocaleString()}`
}) => {
  const [isActive, setIsActive] = useState(false);
  const [animationStep, setAnimationStep] = useState(0);

  useEffect(() => {
    if (isActive) {
      const timer = setTimeout(() => {
        setAnimationStep(prev => (prev + 1) % 3);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, animationStep]);

  const handleInteraction = () => {
    setIsActive(true);
    onInteraction?.();
  };

  const renderBudgetDemo = () => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <CalendarIcon className="w-6 h-6 text-emerald-400" />
        <h3 className="text-lg font-semibold text-white">Monthly Budget</h3>
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-300">Total Income</span>
          <span className="text-emerald-400 font-bold">{formatCurrency(25000)}</span>
        </div>
        
        <div className="space-y-2">
          {['Housing', 'Food', 'Transportation'].map((category, index) => (
            <div key={category} className="flex justify-between items-center">
              <span className="text-slate-400">{category}</span>
              <div className="flex items-center gap-2">
                <div className={`w-16 h-2 bg-slate-700 rounded-full overflow-hidden transition-all duration-1000 ${
                  isActive && animationStep >= index ? 'opacity-100' : 'opacity-50'
                }`}>
                  <div 
                    className={`h-full bg-gradient-to-r from-sky-500 to-purple-500 transition-all duration-1000 ${
                      isActive && animationStep >= index ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
                <span className="text-slate-300 text-sm">
                  {formatCurrency([8500, 1500, 1200][index])}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {!isActive && (
        <button
          onClick={handleInteraction}
          className="mt-4 w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
        >
          Try Budget Planning
        </button>
      )}
    </div>
  );

  const renderCategoryDemo = () => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <TagIcon className="w-6 h-6 text-orange-400" />
        <h3 className="text-lg font-semibold text-white">Categories</h3>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        {[
          { name: 'Groceries', color: 'bg-green-500', amount: 1500 },
          { name: 'Entertainment', color: 'bg-purple-500', amount: 800 },
          { name: 'Utilities', color: 'bg-blue-500', amount: 1200 },
          { name: 'Shopping', color: 'bg-pink-500', amount: 600 }
        ].map((category, index) => (
          <div
            key={category.name}
            className={`p-3 rounded-lg border border-slate-600 transition-all duration-500 ${
              isActive && animationStep >= index 
                ? 'transform scale-105 border-sky-400 bg-slate-700' 
                : 'bg-slate-800'
            }`}
          >
            <div className={`w-4 h-4 rounded-full ${category.color} mb-2`} />
            <div className="text-sm text-white font-medium">{category.name}</div>
            <div className="text-xs text-slate-400">{formatCurrency(category.amount)}</div>
          </div>
        ))}
      </div>
      
      {!isActive && (
        <button
          onClick={handleInteraction}
          className="mt-4 w-full py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
        >
          Organize Categories
        </button>
      )}
    </div>
  );

  const renderTransactionDemo = () => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <CurrencyDollarIcon className="w-6 h-6 text-green-400" />
        <h3 className="text-lg font-semibold text-white">Recent Transactions</h3>
      </div>
      
      <div className="space-y-3">
        {[
          { desc: 'Grocery Store', amount: -350, type: 'expense' },
          { desc: 'Salary Deposit', amount: 25000, type: 'income' },
          { desc: 'Coffee Shop', amount: -45, type: 'expense' }
        ].map((transaction, index) => (
          <div
            key={index}
            className={`flex justify-between items-center p-3 rounded-lg transition-all duration-500 ${
              isActive && animationStep >= index
                ? 'bg-slate-700 border border-sky-400 transform translate-x-0'
                : 'bg-slate-800 border border-slate-600 transform translate-x-4 opacity-50'
            }`}
          >
            <div>
              <div className="text-white font-medium">{transaction.desc}</div>
              <div className="text-xs text-slate-400">Today</div>
            </div>
            <div className={`font-bold ${
              transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
            }`}>
              {transaction.amount >= 0 ? '+' : '-'}{formatCurrency(Math.abs(transaction.amount))}
            </div>
          </div>
        ))}
      </div>
      
      {!isActive && (
        <button
          onClick={handleInteraction}
          className="mt-4 w-full py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
        >
          Track Transactions
        </button>
      )}
    </div>
  );

  const renderChartDemo = () => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <ChartBarIcon className="w-6 h-6 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Spending Analysis</h3>
      </div>
      
      <div className="space-y-4">
        {/* Pie Chart Simulation */}
        <div className="flex justify-center">
          <div className="relative w-24 h-24">
            <div className={`absolute inset-0 rounded-full transition-all duration-1000 ${
              isActive ? 'bg-gradient-conic from-green-500 via-blue-500 via-purple-500 to-pink-500' : 'bg-slate-700'
            }`} />
            <div className="absolute inset-2 bg-slate-800 rounded-full flex items-center justify-center">
              <span className="text-xs text-white font-bold">100%</span>
            </div>
          </div>
        </div>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            { label: 'Housing', color: 'bg-green-500', percent: '40%' },
            { label: 'Food', color: 'bg-blue-500', percent: '25%' },
            { label: 'Transport', color: 'bg-purple-500', percent: '20%' },
            { label: 'Other', color: 'bg-pink-500', percent: '15%' }
          ].map((item, index) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${item.color} ${
                isActive && animationStep >= index ? 'opacity-100' : 'opacity-50'
              }`} />
              <span className="text-slate-300">{item.label}</span>
              <span className="text-slate-400">{item.percent}</span>
            </div>
          ))}
        </div>
      </div>
      
      {!isActive && (
        <button
          onClick={handleInteraction}
          className="mt-4 w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
        >
          View Analytics
        </button>
      )}
    </div>
  );

  const renderPlanningDemo = () => (
    <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <CalendarIcon className="w-6 h-6 text-blue-400" />
        <h3 className="text-lg font-semibold text-white">Future Planning</h3>
      </div>
      
      <div className="space-y-3">
        {['January 2024', 'February 2024', 'March 2024'].map((month, index) => (
          <div
            key={month}
            className={`flex justify-between items-center p-3 rounded-lg transition-all duration-500 ${
              isActive && animationStep >= index
                ? 'bg-slate-700 border border-blue-400'
                : 'bg-slate-800 border border-slate-600'
            }`}
          >
            <span className="text-white">{month}</span>
            <div className="flex items-center gap-2">
              {isActive && animationStep >= index && (
                <CheckIcon className="w-4 h-4 text-green-400" />
              )}
              <span className="text-slate-400 text-sm">Budget Ready</span>
            </div>
          </div>
        ))}
      </div>
      
      {!isActive && (
        <button
          onClick={handleInteraction}
          className="mt-4 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
        >
          Plan Ahead
        </button>
      )}
    </div>
  );

  switch (type) {
    case 'budget':
      return renderBudgetDemo();
    case 'category':
      return renderCategoryDemo();
    case 'transaction':
      return renderTransactionDemo();
    case 'chart':
      return renderChartDemo();
    case 'planning':
      return renderPlanningDemo();
    default:
      return null;
  }
};

export default InteractiveDemo;
