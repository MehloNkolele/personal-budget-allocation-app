import React, { useState, useRef } from 'react';
import AmountDetailModal from './AmountDetailModal';
import { InfoIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '../constants';
import { CURRENCIES } from '../constants';

interface BudgetOverviewProps {
  totalIncome: number;
  onTotalIncomeChange: (income: number) => void;
  totalAllocated: number;
  unallocatedAmount: number;
  selectedCurrency: string;
  onCurrencyChange: (currencyCode: string) => void;
  areGlobalAmountsHidden: boolean;
  onToggleGlobalAmountsHidden: () => void;
  formatCurrency: (amount: number) => string;
  isIncomeHidden: boolean;
  onToggleIncomeHidden: () => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  totalIncome,
  onTotalIncomeChange,
  totalAllocated,
  unallocatedAmount,
  selectedCurrency,
  onCurrencyChange,
  areGlobalAmountsHidden,
  onToggleGlobalAmountsHidden,
  formatCurrency,
  isIncomeHidden,
  onToggleIncomeHidden
}) => {
  const [modalState, setModalState] = useState<{isOpen: boolean; title: string; amount: number}>({
    isOpen: false,
    title: '',
    amount: 0
  });

  const allocationExceedsIncome = totalAllocated > totalIncome && totalIncome > 0;
  const allocationMatchesIncome = totalAllocated === totalIncome && totalIncome > 0;
  const [isIncomeInputFocused, setIsIncomeInputFocused] = useState<boolean>(false);
  const incomeInputRef = useRef<HTMLInputElement>(null);

  // Smart currency formatter for responsive display
  const formatSmartCurrency = (amount: number): string => {
    const formatted = formatCurrency(amount);
    // If the formatted currency is too long, use abbreviated format
    if (formatted.length > 12) {
      const absAmount = Math.abs(amount);
      if (absAmount >= 1000000) {
        return `${selectedCurrency === 'USD' ? '$' : 'ZAR'} ${(amount / 1000000).toFixed(1)}M`;
      } else if (absAmount >= 1000) {
        return `${selectedCurrency === 'USD' ? '$' : 'ZAR'} ${(amount / 1000).toFixed(1)}K`;
      }
    }
    return formatted;
  };

  const handleIncomeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onTotalIncomeChange(isNaN(value) || value < 0 ? 0 : value);
  };

  const handleIncomeBlur = () => {
    setIsIncomeInputFocused(false);
    onToggleIncomeHidden();
  };

  const handleIncomeFocus = () => {
    setIsIncomeInputFocused(true);
    if (isIncomeHidden) {
      onToggleIncomeHidden();
    }
  };

  const openAmountModal = (title: string, amount: number) => {
    setModalState({ isOpen: true, title, amount });
  };

  const closeAmountModal = () => {
    setModalState({ isOpen: false, title: '', amount: 0 });
  };

  return (
    <>
      <AmountDetailModal 
        isOpen={modalState.isOpen}
        onClose={closeAmountModal}
        title={modalState.title}
        amount={modalState.amount}
        formatCurrency={formatCurrency}
      />

      {/* Enhanced Header Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Budget Overview</h2>
            <p className="text-slate-400 text-sm sm:text-base">Configure your income and track your allocation progress</p>
          </div>
          <button 
            onClick={onToggleGlobalAmountsHidden}
            className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200"
            aria-label={areGlobalAmountsHidden ? "Show amounts" : "Hide amounts"}
          >
            <span className="text-slate-300 text-xs sm:text-sm font-medium">
              {areGlobalAmountsHidden ? "Show" : "Hide"} Amounts
            </span>
            {areGlobalAmountsHidden ? <EyeIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" /> : <EyeSlashIcon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />}
          </button>
        </div>

        {/* Enhanced Input Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Income Input */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600">
            <label htmlFor="totalIncome" className="block text-sm font-semibold text-slate-300 mb-3">
              Monthly Income
            </label>
            <div className="relative">
              <input
                ref={incomeInputRef}
                type={!isIncomeHidden || isIncomeInputFocused ? "number" : "password"}
                id="totalIncome"
                value={totalIncome === 0 ? '' : totalIncome.toString()}
                onChange={handleIncomeChange}
                onFocus={handleIncomeFocus}
                onBlur={handleIncomeBlur}
                className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 pr-12"
                placeholder="Enter your monthly income"
              />
              <button 
                onClick={onToggleIncomeHidden}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors p-1"
                aria-label={isIncomeHidden ? "Show income" : "Hide income"}
              >
                {isIncomeHidden ? 
                  <EyeIcon className="w-5 h-5" /> : 
                  <EyeSlashIcon className="w-5 h-5" />
                }
              </button>
            </div>
          </div>

          {/* Currency Selection */}
          <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-6 rounded-2xl border border-slate-600">
            <label htmlFor="currencySelector" className="block text-sm font-semibold text-slate-300 mb-3">
              Currency
            </label>
            <select
              id="currencySelector"
              value={selectedCurrency}
              onChange={(e) => onCurrencyChange(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-xl px-4 py-3 text-lg font-semibold focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200"
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.name} ({c.code})</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Enhanced Budget Breakdown */}
      <div className="bg-gradient-to-br from-slate-800 to-slate-700 p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-600">
        <h3 className="text-lg sm:text-xl font-bold text-white mb-4 sm:mb-6">Budget Breakdown</h3>
        
        <div className="space-y-4 sm:space-y-6">
          {/* Income Display */}
          <button
            onClick={() => openAmountModal('Total Income', totalIncome)}
            className="w-full flex justify-between items-center p-3 sm:p-4 bg-slate-700/50 rounded-xl overflow-hidden text-left transition-transform hover:scale-[1.02]"
            disabled={isIncomeHidden}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-slate-300 font-medium text-xs sm:text-sm lg:text-base truncate">Total Income:</span>
            </div>
            <span className="font-bold text-sm sm:text-base lg:text-lg xl:text-xl text-emerald-400 flex-shrink-0 ml-2 text-right">
              {!isIncomeHidden ? formatSmartCurrency(totalIncome) : "•••••"}
            </span>
          </button>

          {/* Allocated Display */}
          <button
            onClick={() => openAmountModal('Total Allocated', totalAllocated)}
            className="w-full flex justify-between items-center p-3 sm:p-4 bg-slate-700/50 rounded-xl overflow-hidden text-left transition-transform hover:scale-[1.02]"
            disabled={areGlobalAmountsHidden}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-sky-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-slate-300 font-medium text-xs sm:text-sm lg:text-base truncate">Total Allocated:</span>
            </div>
            <span className={`font-bold text-sm sm:text-base lg:text-lg xl:text-xl flex-shrink-0 ml-2 text-right ${allocationExceedsIncome && !areGlobalAmountsHidden ? 'text-red-400' : 'text-sky-400'}`}>
              {formatSmartCurrency(totalAllocated)}
            </span>
          </button>

          {/* Progress Bar */}
          {!areGlobalAmountsHidden && totalIncome > 0 && (
            <div className="p-3 sm:p-4 bg-slate-700/50 rounded-xl">
              <div className="flex justify-between items-center mb-3">
                <span className="text-slate-300 font-medium text-xs sm:text-sm lg:text-base">Allocation Progress</span>
                <span className="text-xs sm:text-sm text-slate-400">
                  {((totalAllocated / totalIncome) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-slate-600 rounded-full h-2 sm:h-3">
                <div 
                  className={`h-2 sm:h-3 rounded-full transition-all duration-500 ${allocationExceedsIncome ? 'bg-red-500' : 'bg-sky-500'}`}
                  style={{ width: `${Math.min((totalAllocated / totalIncome) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          )}

          {areGlobalAmountsHidden && totalIncome > 0 && (
            <div className="p-3 sm:p-4 bg-slate-700/50 rounded-xl">
              <div className="w-full bg-slate-600 rounded-full h-2 sm:h-3 flex items-center justify-center">
                <span className="text-xs text-slate-400 font-medium">Progress hidden</span>
              </div>
            </div>
          )}

          {/* Remaining Amount */}
          <button
            onClick={() => openAmountModal('Remaining to Allocate', unallocatedAmount)}
            className="w-full flex justify-between items-center p-3 sm:p-4 bg-slate-700/50 rounded-xl overflow-hidden text-left transition-transform hover:scale-[1.02]"
            disabled={areGlobalAmountsHidden}
          >
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-shrink">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                unallocatedAmount < 0 ? 'bg-red-500/20' : 'bg-amber-500/20'
              }`}>
                <svg className={`w-4 h-4 sm:w-5 sm:h-5 ${unallocatedAmount < 0 ? 'text-red-400' : 'text-amber-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <span className="text-slate-300 font-medium text-xs sm:text-sm lg:text-base truncate">Remaining to Allocate:</span>
            </div>
            <span className={`font-bold text-sm sm:text-base lg:text-lg xl:text-xl flex-shrink-0 ml-2 text-right ${unallocatedAmount < 0 && !areGlobalAmountsHidden ? 'text-red-400' : 'text-amber-400'}`}>
              {formatSmartCurrency(unallocatedAmount)}
            </span>
          </button>
        </div>

        {/* Status Messages */}
        <div className="mt-4 sm:mt-6">
          {!areGlobalAmountsHidden && allocationExceedsIncome && (
            <div className="p-3 sm:p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-300 text-xs sm:text-sm">
              <div className="flex items-start space-x-3">
                <InfoIcon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-red-400" />
                <div>
                  <p className="font-semibold mb-1">Budget Over Limit</p>
                  <p>Your total allocations exceed your income by {formatSmartCurrency(Math.abs(unallocatedAmount))}. Consider adjusting your budget.</p>
                </div>
              </div>
            </div>
          )}
          
          {!areGlobalAmountsHidden && allocationMatchesIncome && totalIncome > 0 && (
            <div className="p-3 sm:p-4 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs sm:text-sm">
              <div className="flex items-start space-x-3">
                <CheckCircleIcon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-emerald-400" />
                <div>
                  <p className="font-semibold mb-1">Perfect Allocation!</p>
                  <p>Your budget is fully allocated. Great job managing your finances!</p>
                </div>
              </div>
            </div>
          )}
          
          {!areGlobalAmountsHidden && unallocatedAmount > 0 && totalIncome > 0 && (
            <div className="p-3 sm:p-4 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-300 text-xs sm:text-sm">
              <div className="flex items-start space-x-3">
                <InfoIcon className="w-4 h-4 sm:w-5 sm:h-5 mt-0.5 flex-shrink-0 text-amber-400" />
                <div>
                  <p className="font-semibold mb-1">Available Budget</p>
                  <p>You have {formatSmartCurrency(unallocatedAmount)} remaining to allocate to categories.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default BudgetOverview;