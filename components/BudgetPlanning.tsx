import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MonthlyBudget, BudgetTemplate, Category } from '../types';
import { FirebaseDataManager } from '../services/firebaseDataManager';
import { BudgetHelpers } from '../utils/budgetHelpers';
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
    return BudgetHelpers.getNextMonthKey();
  });

  // State for different modes and modals
  const [viewingBudget, setViewingBudget] = useState<MonthlyBudget | null>(null);
  const [showTemplateManager, setShowTemplateManager] = useState(false);
  const [budgetTemplates, setBudgetTemplates] = useState<BudgetTemplate[]>([]);
  const [copyFromBudgetId, setCopyFromBudgetId] = useState<string>('');

  // Load budget templates on component mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const templates = await FirebaseDataManager.getBudgetTemplates(userId);
        setBudgetTemplates(templates);
      } catch (error) {
        console.error('Error loading budget templates:', error);
      }
    };

    if (userId) {
      loadTemplates();
    }
  }, [userId]);

  // Generate available months (current month + next 12 months)
  const availableMonths = useMemo(() => {
    return BudgetHelpers.getAvailableMonths(13);
  }, []);

  // Get current budget for selected month
  const currentBudget = useMemo(() => {
    return monthlyBudgets.find(budget => budget.month === selectedMonth);
  }, [monthlyBudgets, selectedMonth]);

  const createBudgetFromCurrent = () => {
    const { year, month } = BudgetHelpers.parseMonthKey(selectedMonth);
    const monthName = BudgetHelpers.getMonthName(year, month);

    const newBudget: MonthlyBudget = {
      id: BudgetHelpers.generateMonthlyBudgetId(),
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
    const { year, month } = BudgetHelpers.parseMonthKey(selectedMonth);
    const monthName = BudgetHelpers.getMonthName(year, month);

    const newBudget: MonthlyBudget = {
      id: BudgetHelpers.generateMonthlyBudgetId(),
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

    const { year, month } = BudgetHelpers.parseMonthKey(selectedMonth);
    const monthName = BudgetHelpers.getMonthName(year, month);

    const newBudget: MonthlyBudget = {
      id: BudgetHelpers.generateMonthlyBudgetId(),
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
    const { year, month } = BudgetHelpers.parseMonthKey(selectedMonth);
    const monthName = BudgetHelpers.getMonthName(year, month);

    const newBudget: MonthlyBudget = {
      id: BudgetHelpers.generateMonthlyBudgetId(),
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

  const handleTemplatesSave = async (templates: BudgetTemplate[]) => {
    try {
      // Update local state immediately
      setBudgetTemplates(templates);

      // Save to Firebase - this will handle both new and updated templates
      // Note: The BudgetTemplateManager component should handle individual template operations
      // This is just for bulk updates if needed
    } catch (error) {
      console.error('Error saving templates:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* Collapsible Budget Overview */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden">
        <button 
          onClick={() => setIsOverviewVisible(!isOverviewVisible)}
          className="w-full flex justify-between items-center p-4 sm:p-5 text-left transition-colors hover:bg-slate-800"
        >
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-sky-400">Budget Setup</h2>
            <p className="text-sm text-slate-400 mt-1">Configure your income and currency for all budgets.</p>
          </div>
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
              className="px-4 sm:px-5 pb-4 sm:pb-5"
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

      {/* Redesigned Budget Planning Section */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700 p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white">Budget Planning</h2>
            <p className="text-slate-400 mt-1">Plan budgets and create reusable templates.</p>
          </div>
          <button 
            onClick={() => setShowTemplateManager(true)}
            className="mt-4 sm:mt-0 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
          >
            <CogIcon className="w-5 h-5"/>
            Manage Templates
          </button>
        </div>

        {/* Month Selector */}
        <div className="mb-8">
            <h3 className="text-lg font-semibold text-sky-400 mb-4">Select Month to Plan</h3>
            <div className="relative">
                <div className="flex space-x-3 overflow-x-auto pb-4 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
                    {availableMonths.map(month => (
                        <motion.button
                            key={month.key}
                            onClick={() => setSelectedMonth(month.key)}
                            className={`relative flex-shrink-0 w-28 h-24 p-3 rounded-xl border-2 transition-all duration-200 flex flex-col justify-center items-center text-center
                                ${selectedMonth === month.key 
                                    ? 'bg-sky-500/20 border-sky-500' 
                                    : 'bg-slate-700/50 border-slate-700 hover:border-sky-600'}`
                                }
                            whileHover={{ y: -4 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <CalendarIcon className={`w-6 h-6 mb-2 ${selectedMonth === month.key ? 'text-sky-400' : 'text-slate-400'}`} />
                            <span className={`font-semibold text-sm ${selectedMonth === month.key ? 'text-white' : 'text-slate-300'}`}>
                                {month.name.split(' ')[0]}
                            </span>
                             <span className={`text-xs ${selectedMonth === month.key ? 'text-sky-200' : 'text-slate-400'}`}>
                                {month.name.split(' ')[1]}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>

        {/* Actions for Selected Month */}
        <AnimatePresence mode="wait">
            <motion.div
                key={selectedMonth}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
            >
                {currentBudget ? (
                    <div className="bg-slate-700/50 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center">
                        <div>
                           <h4 className="font-bold text-white text-lg">Budget for {currentBudget.monthName} exists.</h4>
                           <p className="text-slate-400 text-sm mt-1">You can view, edit, or delete the existing budget.</p>
                        </div>
                        <div className="flex items-center gap-4 mt-4 sm:mt-0">
                            <button
                                onClick={() => setViewingBudget(currentBudget)}
                                className="flex items-center gap-2 bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
                            >
                                <EyeIcon className="w-5 h-5"/>
                                View Budget
                            </button>
                            <button
                                onClick={() => deleteBudget(currentBudget.id)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-full transition-colors"
                                aria-label="Delete budget"
                            >
                                <TrashIcon className="w-5 h-5"/>
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-slate-700/50 p-6 rounded-2xl">
                         <h4 className="font-bold text-white text-lg mb-4">Create a budget for {BudgetHelpers.getMonthName(BudgetHelpers.parseMonthKey(selectedMonth).year, BudgetHelpers.parseMonthKey(selectedMonth).month)}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                           {/* Create New Blank Budget */}
                            <button onClick={createNewBudget} className="group p-4 bg-slate-600/50 hover:bg-sky-500/20 rounded-xl transition-colors text-left">
                               <div className="flex items-center justify-center w-12 h-12 rounded-full bg-sky-500/20 mb-3 group-hover:bg-sky-500/30">
                                   <PlusIcon className="w-6 h-6 text-sky-400"/>
                               </div>
                               <h5 className="font-semibold text-white">Start a Blank Budget</h5>
                               <p className="text-sm text-slate-400 mt-1">Create a fresh budget from scratch.</p>
                           </button>
                           
                           {/* Copy from current allocations */}
                            <button onClick={createBudgetFromCurrent} className="group p-4 bg-slate-600/50 hover:bg-green-500/20 rounded-xl transition-colors text-left">
                               <div className="flex items-center justify-center w-12 h-12 rounded-full bg-green-500/20 mb-3 group-hover:bg-green-500/30">
                                   <DocumentDuplicateIcon className="w-6 h-6 text-green-400"/>
                               </div>
                               <h5 className="font-semibold text-white">Copy Current Setup</h5>
                               <p className="text-sm text-slate-400 mt-1">Use your globally set categories and income.</p>
                           </button>

                            {/* Select a template */}
                            {budgetTemplates.length > 0 && (
                                <div className="md:col-span-2 lg:col-span-1">
                                    <h5 className="font-semibold text-white mb-2">From a Template</h5>
                                    <div className="space-y-2">
                                    {budgetTemplates.map(template => (
                                        <button 
                                            key={template.id}
                                            onClick={() => createBudgetFromTemplate(template)}
                                            className="w-full text-left p-3 bg-slate-600/50 hover:bg-indigo-500/20 rounded-lg transition-colors text-sm text-slate-300 hover:text-white"
                                        >
                                            {template.name}
                                        </button>
                                    ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </motion.div>
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
