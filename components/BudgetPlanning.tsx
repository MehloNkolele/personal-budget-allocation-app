import React, { useState, useMemo } from 'react';
import { MonthlyBudget, BudgetTemplate, Category } from '../types';
import { UserDataManager } from '../utils/userDataManager';
import BudgetEditor from './BudgetEditor';
import BudgetTemplateManager from './BudgetTemplateManager';
import {
  CalendarIcon,
  PlusIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  PencilIcon,
  CogIcon
} from '../constants';

interface BudgetPlanningProps {
  monthlyBudgets: MonthlyBudget[];
  onMonthlyBudgetsChange: (budgets: MonthlyBudget[]) => void;
  currentCategories: Category[];
  currentIncome: number;
  formatCurrency: (amount: number) => string;
  selectedCurrency: string;
  userId: string;
}

const BudgetPlanning: React.FC<BudgetPlanningProps> = ({
  monthlyBudgets,
  onMonthlyBudgetsChange,
  currentCategories,
  currentIncome,
  formatCurrency,
  selectedCurrency,
  userId
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return UserDataManager.formatMonthKey(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
  });

  // State for different modes and modals
  const [editingBudget, setEditingBudget] = useState<MonthlyBudget | null>(null);
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
      totalIncome: currentIncome,
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

    setEditingBudget(newBudget);
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
    setEditingBudget(null);
  };

  const handleTemplatesSave = (templates: BudgetTemplate[]) => {
    setBudgetTemplates(templates);
    UserDataManager.saveBudgetTemplates(userId, templates);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-sky-400">Budget Planning</h2>
          <p className="text-slate-400 mt-1">
            Plan your budgets for future months and create reusable templates
          </p>
        </div>
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
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">
          Budget for {availableMonths.find(m => m.key === selectedMonth)?.name}
        </h3>
        
        {currentBudget ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Budget exists for this month</span>
              <div className="flex space-x-2">
                <button
                  onClick={() => setEditingBudget(currentBudget)}
                  className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <PencilIcon className="w-4 h-4" />
                  <span>Edit Budget</span>
                </button>
                <button
                  onClick={() => deleteBudget(currentBudget.id)}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  <span>Delete Budget</span>
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Total Income</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(currentBudget.totalIncome)}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Categories</p>
                <p className="text-xl font-bold text-sky-400">{currentBudget.categories.length}</p>
              </div>
              <div className="bg-slate-700 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Total Allocated</p>
                <p className="text-xl font-bold text-purple-400">
                  {formatCurrency(currentBudget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0))}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <CalendarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-6">No budget created for this month yet</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={createNewBudget}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Create New Budget</span>
              </button>

              <button
                onClick={createBudgetFromCurrent}
                className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                <DocumentDuplicateIcon className="w-4 h-4" />
                <span>Copy Current Budget</span>
              </button>
            </div>

            {/* Copy from existing budget */}
            {monthlyBudgets.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-slate-400 mb-4">Or copy from an existing budget:</p>
                <div className="flex flex-col sm:flex-row gap-2 items-center justify-center">
                  <select
                    value={copyFromBudgetId}
                    onChange={(e) => setCopyFromBudgetId(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">Select a budget to copy</option>
                    {monthlyBudgets
                      .filter(b => b.month !== selectedMonth)
                      .sort((a, b) => a.month.localeCompare(b.month))
                      .map(budget => (
                        <option key={budget.id} value={budget.id}>
                          {budget.monthName}
                        </option>
                      ))}
                  </select>
                  <button
                    onClick={() => copyExistingBudget(copyFromBudgetId)}
                    disabled={!copyFromBudgetId}
                    className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <DocumentDuplicateIcon className="w-4 h-4" />
                    <span>Copy Budget</span>
                  </button>
                </div>
              </div>
            )}

            {/* Create from template */}
            {budgetTemplates.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-slate-400 mb-4">Or create from a template:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {budgetTemplates.map(template => (
                    <button
                      key={template.id}
                      onClick={() => createBudgetFromTemplate(template)}
                      className="p-4 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-left transition-colors"
                    >
                      <h4 className="font-medium text-slate-200 mb-1">{template.name}</h4>
                      <p className="text-sm text-slate-400 mb-2">{template.description}</p>
                      <p className="text-sm text-emerald-400">{formatCurrency(template.totalIncome)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Existing Monthly Budgets */}
      {monthlyBudgets.length > 0 && (
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">Existing Monthly Budgets</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {monthlyBudgets
              .sort((a, b) => a.month.localeCompare(b.month))
              .map(budget => (
                <div key={budget.id} className="bg-slate-700 p-4 rounded-lg border border-slate-600">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-slate-200">{budget.monthName}</h4>
                      <p className="text-sm text-slate-400">Created: {new Date(budget.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => setEditingBudget(budget)}
                        className="text-sky-400 hover:text-sky-300 p-1"
                        title="Edit Budget"
                      >
                        <PencilIcon className="w-4 h-4" />
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
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Income:</span>
                      <span className="text-emerald-400">{formatCurrency(budget.totalIncome)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Categories:</span>
                      <span className="text-sky-400">{budget.categories.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Transactions:</span>
                      <span className="text-purple-400">{budget.transactions.length}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Budget Editor Modal */}
      {editingBudget && (
        <BudgetEditor
          budget={editingBudget}
          onSave={handleBudgetSave}
          onClose={() => setEditingBudget(null)}
          formatCurrency={formatCurrency}
          selectedCurrency={selectedCurrency}
          userId={userId}
        />
      )}

      {/* Template Manager Modal */}
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
