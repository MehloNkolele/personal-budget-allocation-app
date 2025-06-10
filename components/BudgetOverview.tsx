import React, { useState, useRef } from 'react';
import ProgressBar from './ProgressBar';
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
  const allocationExceedsIncome = totalAllocated > totalIncome && totalIncome > 0;
  const allocationMatchesIncome = totalAllocated === totalIncome && totalIncome > 0;
  const [isIncomeInputFocused, setIsIncomeInputFocused] = useState<boolean>(false);
  const incomeInputRef = useRef<HTMLInputElement>(null);

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

  return (
    <>
      <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-4">
        <h3 className="text-lg font-semibold text-slate-300">Income & Currency</h3>
        <button
            onClick={onToggleGlobalAmountsHidden}
            className="p-2 text-slate-400 hover:text-sky-400 transition-colors"
            aria-label={areGlobalAmountsHidden ? "Show amounts" : "Hide amounts"}
            aria-pressed={areGlobalAmountsHidden}
        >
            {areGlobalAmountsHidden ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="relative">
          <label htmlFor="totalIncome" className="block text-sm font-medium text-slate-300 mb-1">
            Total Monthly Income
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
              className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-3 text-lg focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="Enter your total income"
            />
            <button 
              onClick={onToggleIncomeHidden}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-sky-400 transition-colors"
              aria-label={isIncomeHidden ? "Show income" : "Hide income"}
            >
              {isIncomeHidden ? 
                <EyeIcon className="w-5 h-5" /> : 
                <EyeSlashIcon className="w-5 h-5" />
              }
            </button>
          </div>
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
          <span className="font-semibold text-lg text-emerald-400">
            {!isIncomeHidden ? formatCurrency(totalIncome) : "•••••"}
          </span>
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
        {!areGlobalAmountsHidden && allocationMatchesIncome && totalIncome > 0 && (
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
    </>
  );
};

export default BudgetOverview; 