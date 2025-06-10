import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonthlyBudget, BudgetTemplate, Category } from '../types';
import { UserDataManager } from '../utils/userDataManager';
import MonthlyBudgetView from './MonthlyBudgetView';
import BudgetTemplateManager from './BudgetTemplateManager';
import BudgetOverview from './BudgetOverview';
import {
  CalendarIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  EyeIcon,
  CogIcon,
  ChevronDownIcon
} from '../constants';

interface BudgetPlanningProps {
  monthlyBudgets: MonthlyBudget[];
  onMonthlyBudgetsChange: (budgets: MonthlyBudget[]) => void;
  currentCategories: Category[];
  formatCurrency: (amount: number) => string;
  selectedCurrency: string;
  userId: string;
  totalIncome: number;
  onTotalIncomeChange: (income: number) => void;
  totalAllocated: number;
  unallocatedAmount: number;
  onCurrencyChange: (currencyCode: string) => void;
  areGlobalAmountsHidden: boolean;
  onToggleGlobalAmountsHidden: () => void;
  isIncomeHidden: boolean;
  onToggleIncomeHidden: () => void;
}

const BudgetPlanning: React.FC<BudgetPlanningProps> = ({
  monthlyBudgets,
  onMonthlyBudgetsChange,
  currentCategories,
  formatCurrency,
  selectedCurrency,
  userId,
  totalIncome,
  onTotalIncomeChange,
  totalAllocated,
  unallocatedAmount,
  onCurrencyChange,
  areGlobalAmountsHidden,
  onToggleGlobalAmountsHidden,
  isIncomeHidden,
  onToggleIncomeHidden
}) => {
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);
  const [isPlanningVisible, setIsPlanningVisible] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return UserDataManager.formatMonthKey(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
  });

  // State for different modes and modals
  const [viewingBudget, setViewingBudget] = useState<MonthlyBudget | null>(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [budgetTemplates, setBudgetTemplates] = useState<BudgetTemplate[]>(() =>
    UserDataManager.loadBudgetTemplates(userId)
  );
  const [copyFromBudgetId, setCopyFromBudgetId] = useState<string>('');

  // Generate available months (current month + next 12 months)
  const availableMonths = useMemo(() => {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < 13; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = UserDataManager.formatMonthKey(date.getFullYear(), date.getMonth() + 1);
      const monthName = UserDataManager.getMonthName(date.getFullYear(), date.getMonth() + 1);
      months.push({ key: monthKey, name: monthName });
    }
    
    return months;
  }, []);

  // Get current budget for selected month
  const currentBudget = useMemo(() => {
    return monthlyBudgets.find(budget => budget.month === selectedMonth);
  }, [monthlyBudgets, selectedMonth]);

  const createBudgetFromCurrent = () => {
    const { year, month } = UserDataManager.parseMonthKey(selectedMonth);
    const monthName = UserDataManager.getMonthName(year, month);
    
    const newBudget: MonthlyBudget = {
      id: UserDataManager.generateMonthlyBudgetId(),
      month: selectedMonth,
      year,
      monthName,
      totalIncome: totalIncome,
      categories: currentCategories.map(cat => ({
        ...cat,
        spentAmount: 0,
        subcategories: cat.subcategories.map(sub => ({
          ...sub,
          spentAmount: 0,
          isComplete: false
        }))
      })),
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBudgets = [...monthlyBudgets.filter(b => b.month !== selectedMonth), newBudget];
    onMonthlyBudgetsChange(updatedBudgets);
  };

  const deleteBudget = (budgetId: string) => {
    const updatedBudgets = monthlyBudgets.filter(b => b.id !== budgetId);
    onMonthlyBudgetsChange(updatedBudgets);
  };

  const createNewBudget = () => {
    const { year, month } = UserDataManager.parseMonthKey(selectedMonth);
    const monthName = UserDataManager.getMonthName(year, month);

    const newBudget: MonthlyBudget = {
      id: UserDataManager.generateMonthlyBudgetId(),
      month: selectedMonth,
      year,
      monthName,
      totalIncome: 0,
      categories: [],
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setViewingBudget(newBudget);
  };

  const copyExistingBudget = (sourceBudgetId: string) => {
    const sourceBudget = monthlyBudgets.find(b => b.id === sourceBudgetId);
    if (!sourceBudget) return;

    const { year, month } = UserDataManager.parseMonthKey(selectedMonth);
    const monthName = UserDataManager.getMonthName(year, month);

    const newBudget: MonthlyBudget = {
      id: UserDataManager.generateMonthlyBudgetId(),
      month: selectedMonth,
      year,
      monthName,
      totalIncome: sourceBudget.totalIncome,
      categories: sourceBudget.categories.map(cat => ({
        ...cat,
        spentAmount: 0,
        subcategories: cat.subcategories.map(sub => ({
          ...sub,
          spentAmount: 0,
          isComplete: false
        }))
      })),
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBudgets = [...monthlyBudgets.filter(b => b.month !== selectedMonth), newBudget];
    onMonthlyBudgetsChange(updatedBudgets);
    setCopyFromBudgetId('');
  };

  const createBudgetFromTemplate = (template: BudgetTemplate) => {
    const { year, month } = UserDataManager.parseMonthKey(selectedMonth);
    const monthName = UserDataManager.getMonthName(year, month);

    const newBudget: MonthlyBudget = {
      id: UserDataManager.generateMonthlyBudgetId(),
      month: selectedMonth,
      year,
      monthName,
      totalIncome: template.totalIncome,
      categories: template.categories.map(cat => ({
        ...cat,
        spentAmount: 0,
        subcategories: cat.subcategories?.map(sub => ({
          ...sub,
          spentAmount: 0,
          isComplete: false
        })) || []
      })),
      transactions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedBudgets = [...monthlyBudgets.filter(b => b.month !== selectedMonth), newBudget];
    onMonthlyBudgetsChange(updatedBudgets);
  };

  const handleBudgetSave = (budget: MonthlyBudget) => {
    const updatedBudgets = [...monthlyBudgets.filter(b => b.id !== budget.id), budget];
    onMonthlyBudgetsChange(updatedBudgets);
    setViewingBudget(null);
  };

  const handleTemplatesSave = (templates: BudgetTemplate[]) => {
    setBudgetTemplates(templates);
    UserDataManager.saveBudgetTemplates(userId, templates);
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
        <button 
          onClick={() => setIsOverviewVisible(!isOverviewVisible)}
          className="w-full flex justify-between items-center p-4 text-left"
        >
          <h2 className="text-xl font-semibold text-sky-400">Budget Overview</h2>
          <motion.div
            animate={{ rotate: isOverviewVisible ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-6 h-6 text-slate-400" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isOverviewVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="px-4 pb-4"
            >
              <BudgetOverview
                totalIncome={totalIncome}
                onTotalIncomeChange={onTotalIncomeChange}
                totalAllocated={totalAllocated}
                unallocatedAmount={unallocatedAmount}
                selectedCurrency={selectedCurrency}
                onCurrencyChange={onCurrencyChange}
                areGlobalAmountsHidden={areGlobalAmountsHidden}
                onToggleGlobalAmountsHidden={onToggleGlobalAmountsHidden}
                formatCurrency={formatCurrency}
                isIncomeHidden={isIncomeHidden}
                onToggleIncomeHidden={onToggleIncomeHidden}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Collapsible Budget Planning Section */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
        <button
          onClick={() => setIsPlanningVisible(!isPlanningVisible)}
          className="w-full flex justify-between items-center p-4 text-left"
        >
        <div>
            <h2 className="text-xl font-semibold text-sky-400">Budget Planning</h2>
            <p className="text-slate-400 text-sm mt-1">
              Plan budgets and create reusable templates.
          </p>
        </div>
          <motion.div
            animate={{ rotate: isPlanningVisible ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon className="w-6 h-6 text-slate-400" />
          </motion.div>
        </button>
        <AnimatePresence>
          {isPlanningVisible && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="px-4 pb-4"
            >
              <div className="space-y-6 pt-4">
                <div className="flex justify-end">
        <button
          onClick={() => setShowTemplateManager(true)}
          className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <CogIcon className="w-4 h-4" />
          <span>Manage Templates</span>
        </button>
      </div>

      {/* Month Selection */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Select Month to Plan</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {availableMonths.map(month => (
            <button
              key={month.key}
              onClick={() => setSelectedMonth(month.key)}
              className={`p-4 rounded-lg border transition-all duration-200 ${
                selectedMonth === month.key
                  ? 'bg-sky-600 border-sky-500 text-white'
                  : 'bg-slate-700 border-slate-600 text-slate-300 hover:bg-slate-600'
              }`}
            >
              <CalendarIcon className="w-5 h-5 mx-auto mb-2" />
              <div className="text-sm font-medium">{month.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Current Budget Status */}
      <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-lg">
        <div className="flex justify-between items-start">
            <div>
                <h3 className="text-xl font-bold text-white mb-1">
                    Budget for {availableMonths.find(m => m.key === selectedMonth)?.name}
                </h3>
                <p className="text-sm text-slate-400">
                    {currentBudget ? 'A budget is set for this month.' : 'No budget created for this month yet.'}
                </p>
            </div>
            {currentBudget && (
                <button
                    onClick={() => deleteBudget(currentBudget.id)}
                    className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all"
                    aria-label="Delete budget"
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            )}
        </div>

        {currentBudget ? (
          <div className="mt-6">
            <div className="grid grid-cols-2 gap-4 text-center mb-6">
                <div>
                    <p className="text-sm text-slate-400">Total Income</p>
                    <p className="text-2xl font-bold text-sky-400">{formatCurrency(currentBudget.totalIncome)}</p>
                </div>
                <div>
                    <p className="text-sm text-slate-400">Categories</p>
                    <p className="text-2xl font-bold text-sky-400">{currentBudget.categories.length}</p>
                </div>
            </div>
            <button
                onClick={() => setViewingBudget(currentBudget)}
                className="w-full text-center bg-sky-600/90 hover:bg-sky-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
                <EyeIcon className="w-5 h-5"/>
                <span>View & Edit Budget</span>
            </button>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
              <h4 className="font-semibold text-white mb-2">Create New Budget</h4>
              <p className="text-slate-400 text-sm mb-3">Start with an empty slate for the selected month.</p>
              <button
                onClick={createNewBudget}
                className="w-full flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create Blank Budget</span>
              </button>
            </div>

            <div className="bg-slate-700/50 p-4 rounded-lg border border-slate-600">
              <h4 className="font-semibold text-white mb-2">Copy Existing Budget</h4>
              <p className="text-slate-400 text-sm mb-3">Reuse a budget from a previous month to save time.</p>
              <div className="flex gap-2">
                <select
                  value={copyFromBudgetId}
                  onChange={(e) => setCopyFromBudgetId(e.target.value)}
                  className="w-full bg-slate-600 border border-slate-500 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Select a budget to copy...</option>
                  {monthlyBudgets.map(b => <option key={b.id} value={b.id}>{b.monthName}</option>)}
                </select>
                <button
                  onClick={() => copyExistingBudget(copyFromBudgetId)}
                  disabled={!copyFromBudgetId}
                  className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg transition-colors disabled:bg-slate-500 disabled:cursor-not-allowed"
                >
                  <DocumentDuplicateIcon className="w-4 h-4" />
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Recent Budgets</h3>
        <div className="space-y-3">
          {monthlyBudgets.slice(0, 5).map(budget => (
            <div key={budget.id} className="flex items-center justify-between bg-slate-700 p-3 rounded-lg">
              <div>
                <p className="font-medium text-slate-200">{budget.monthName}</p>
                <p className="text-sm text-slate-400">
                  Income: {formatCurrency(budget.totalIncome)} - {budget.categories.length} categories
                </p>
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => setViewingBudget(budget)}
                  className="text-sky-400 hover:text-sky-300 p-1"
                  title="View Details"
                >
                  <EyeIcon className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteBudget(budget.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                  title="Delete Budget"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* Modals */}
      {viewingBudget && (
        <MonthlyBudgetView
          budget={viewingBudget}
          onSave={handleBudgetSave}
          onClose={() => setViewingBudget(null)}
          formatCurrency={formatCurrency}
          selectedCurrency={selectedCurrency}
          userId={userId}
        />
      )}
      
      {showTemplateManager && (
        <BudgetTemplateManager
          templates={budgetTemplates}
          onSave={handleTemplatesSave}
          onClose={() => setShowTemplateManager(false)}
          formatCurrency={formatCurrency}
          selectedCurrency={selectedCurrency}
          userId={userId}
        />
      )}
    </div>
  );
};

export default BudgetPlanning;
