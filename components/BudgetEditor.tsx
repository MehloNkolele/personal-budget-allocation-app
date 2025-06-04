import React, { useState, useEffect } from 'react';
import { MonthlyBudget, Category, Subcategory } from '../types';
import { UserDataManager } from '../utils/userDataManager';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon
} from '../constants';

interface BudgetEditorProps {
  budget: MonthlyBudget;
  onSave: (budget: MonthlyBudget) => void;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  selectedCurrency: string;
  userId: string;
}

const BudgetEditor: React.FC<BudgetEditorProps> = ({
  budget,
  onSave,
  onClose,
  formatCurrency,
  selectedCurrency,
  userId
}) => {
  const [editedBudget, setEditedBudget] = useState<MonthlyBudget>({ ...budget });
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');
  const [showAddCategory, setShowAddCategory] = useState(false);

  const handleIncomeChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedBudget(prev => ({
      ...prev,
      totalIncome: numValue,
      updatedAt: new Date().toISOString()
    }));
  };

  const addCategory = () => {
    if (!newCategoryName.trim() || !newCategoryAmount) return;

    const newCategory: Category = {
      id: UserDataManager.generateCategoryId(),
      name: newCategoryName.trim(),
      allocatedAmount: parseFloat(newCategoryAmount) || 0,
      spentAmount: 0,
      subcategories: []
    };

    setEditedBudget(prev => ({
      ...prev,
      categories: [...prev.categories, newCategory],
      updatedAt: new Date().toISOString()
    }));

    setNewCategoryName('');
    setNewCategoryAmount('');
    setShowAddCategory(false);
  };

  const updateCategory = (categoryId: string, name: string, amount: number) => {
    setEditedBudget(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? { ...cat, name, allocatedAmount: amount }
          : cat
      ),
      updatedAt: new Date().toISOString()
    }));
    setEditingCategory(null);
  };

  const deleteCategory = (categoryId: string) => {
    setEditedBudget(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat.id !== categoryId),
      updatedAt: new Date().toISOString()
    }));
  };

  const addSubcategory = (categoryId: string, name: string, amount: number) => {
    setEditedBudget(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: [
                ...cat.subcategories,
                {
                  id: UserDataManager.generateSubcategoryId(),
                  name,
                  allocatedAmount: amount,
                  spentAmount: 0,
                  isComplete: false
                }
              ]
            }
          : cat
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const updateSubcategory = (categoryId: string, subcategoryId: string, name: string, amount: number) => {
    setEditedBudget(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.map(sub =>
                sub.id === subcategoryId
                  ? { ...sub, name, allocatedAmount: amount }
                  : sub
              )
            }
          : cat
      ),
      updatedAt: new Date().toISOString()
    }));
    setEditingSubcategory(null);
  };

  const deleteSubcategory = (categoryId: string, subcategoryId: string) => {
    setEditedBudget(prev => ({
      ...prev,
      categories: prev.categories.map(cat =>
        cat.id === categoryId
          ? {
              ...cat,
              subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId)
            }
          : cat
      ),
      updatedAt: new Date().toISOString()
    }));
  };

  const totalAllocated = editedBudget.categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const remaining = editedBudget.totalIncome - totalAllocated;

  const handleSave = () => {
    onSave(editedBudget);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-semibold text-sky-400">
              Edit Budget - {editedBudget.monthName}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              Modify income, categories, and allocations
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Income Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Total Income
            </label>
            <input
              type="number"
              value={editedBudget.totalIncome}
              onChange={(e) => handleIncomeChange(e.target.value)}
              className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
              placeholder="Enter total income"
            />
          </div>

          {/* Budget Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Total Income</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(editedBudget.totalIncome)}</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Total Allocated</p>
              <p className="text-xl font-bold text-purple-400">{formatCurrency(totalAllocated)}</p>
            </div>
            <div className="bg-slate-700 p-4 rounded-lg">
              <p className="text-slate-400 text-sm">Remaining</p>
              <p className={`text-xl font-bold ${remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>

          {/* Categories Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-semibold text-sky-400">Categories</h4>
              <button
                onClick={() => setShowAddCategory(true)}
                className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors"
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Category</span>
              </button>
            </div>

            {/* Add Category Form */}
            {showAddCategory && (
              <div className="bg-slate-700 p-4 rounded-lg mb-4 border border-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Category name"
                    className="bg-slate-600 border border-slate-500 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <input
                    type="number"
                    value={newCategoryAmount}
                    onChange={(e) => setNewCategoryAmount(e.target.value)}
                    placeholder="Allocated amount"
                    className="bg-slate-600 border border-slate-500 text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div className="flex space-x-2 mt-3">
                  <button
                    onClick={addCategory}
                    className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    <CheckIcon className="w-4 h-4" />
                    <span>Add</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowAddCategory(false);
                      setNewCategoryName('');
                      setNewCategoryAmount('');
                    }}
                    className="bg-slate-600 hover:bg-slate-500 text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Categories List */}
            <div className="space-y-4">
              {editedBudget.categories.map(category => (
                <CategoryEditor
                  key={category.id}
                  category={category}
                  editingCategory={editingCategory}
                  editingSubcategory={editingSubcategory}
                  onEditCategory={setEditingCategory}
                  onEditSubcategory={setEditingSubcategory}
                  onUpdateCategory={updateCategory}
                  onDeleteCategory={deleteCategory}
                  onAddSubcategory={addSubcategory}
                  onUpdateSubcategory={updateSubcategory}
                  onDeleteSubcategory={deleteSubcategory}
                  formatCurrency={formatCurrency}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end space-x-3 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="bg-slate-600 hover:bg-slate-500 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Save Budget
          </button>
        </div>
      </div>
    </div>
  );
};

// Category Editor Component
interface CategoryEditorProps {
  category: Category;
  editingCategory: string | null;
  editingSubcategory: string | null;
  onEditCategory: (id: string | null) => void;
  onEditSubcategory: (id: string | null) => void;
  onUpdateCategory: (id: string, name: string, amount: number) => void;
  onDeleteCategory: (id: string) => void;
  onAddSubcategory: (categoryId: string, name: string, amount: number) => void;
  onUpdateSubcategory: (categoryId: string, subcategoryId: string, name: string, amount: number) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  formatCurrency: (amount: number) => string;
}

const CategoryEditor: React.FC<CategoryEditorProps> = ({
  category,
  editingCategory,
  editingSubcategory,
  onEditCategory,
  onEditSubcategory,
  onUpdateCategory,
  onDeleteCategory,
  onAddSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
  formatCurrency
}) => {
  const [editName, setEditName] = useState(category.name);
  const [editAmount, setEditAmount] = useState(category.allocatedAmount.toString());
  const [showAddSub, setShowAddSub] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [newSubAmount, setNewSubAmount] = useState('');

  const isEditing = editingCategory === category.id;

  const handleSaveCategory = () => {
    onUpdateCategory(category.id, editName, parseFloat(editAmount) || 0);
  };

  const handleAddSubcategory = () => {
    if (!newSubName.trim() || !newSubAmount) return;
    onAddSubcategory(category.id, newSubName.trim(), parseFloat(newSubAmount) || 0);
    setNewSubName('');
    setNewSubAmount('');
    setShowAddSub(false);
  };

  return (
    <div className="bg-slate-700 p-4 rounded-lg border border-slate-600">
      {/* Category Header */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 mr-4">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-slate-600 border border-slate-500 text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="bg-slate-600 border border-slate-500 text-slate-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        ) : (
          <div className="flex-1">
            <h5 className="font-medium text-slate-200">{category.name}</h5>
            <p className="text-sm text-slate-400">Allocated: {formatCurrency(category.allocatedAmount)}</p>
          </div>
        )}
        
        <div className="flex space-x-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSaveCategory}
                className="text-emerald-400 hover:text-emerald-300 p-1"
              >
                <CheckIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onEditCategory(null)}
                className="text-slate-400 hover:text-slate-300 p-1"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEditCategory(category.id)}
                className="text-sky-400 hover:text-sky-300 p-1"
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteCategory(category.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Add Subcategory Button */}
      {!isEditing && (
        <button
          onClick={() => setShowAddSub(true)}
          className="text-sm text-sky-400 hover:text-sky-300 mb-2"
        >
          + Add Subcategory
        </button>
      )}

      {/* Add Subcategory Form */}
      {showAddSub && (
        <div className="bg-slate-600 p-3 rounded mb-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
            <input
              type="text"
              value={newSubName}
              onChange={(e) => setNewSubName(e.target.value)}
              placeholder="Subcategory name"
              className="bg-slate-500 border border-slate-400 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="number"
              value={newSubAmount}
              onChange={(e) => setNewSubAmount(e.target.value)}
              placeholder="Amount"
              className="bg-slate-500 border border-slate-400 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleAddSubcategory}
              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded"
            >
              Add
            </button>
            <button
              onClick={() => {
                setShowAddSub(false);
                setNewSubName('');
                setNewSubAmount('');
              }}
              className="text-xs bg-slate-500 hover:bg-slate-400 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Subcategories */}
      {category.subcategories.length > 0 && (
        <div className="space-y-2">
          {category.subcategories.map(subcategory => (
            <SubcategoryEditor
              key={subcategory.id}
              subcategory={subcategory}
              categoryId={category.id}
              editingSubcategory={editingSubcategory}
              onEditSubcategory={onEditSubcategory}
              onUpdateSubcategory={onUpdateSubcategory}
              onDeleteSubcategory={onDeleteSubcategory}
              formatCurrency={formatCurrency}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Subcategory Editor Component
interface SubcategoryEditorProps {
  subcategory: Subcategory;
  categoryId: string;
  editingSubcategory: string | null;
  onEditSubcategory: (id: string | null) => void;
  onUpdateSubcategory: (categoryId: string, subcategoryId: string, name: string, amount: number) => void;
  onDeleteSubcategory: (categoryId: string, subcategoryId: string) => void;
  formatCurrency: (amount: number) => string;
}

const SubcategoryEditor: React.FC<SubcategoryEditorProps> = ({
  subcategory,
  categoryId,
  editingSubcategory,
  onEditSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
  formatCurrency
}) => {
  const [editName, setEditName] = useState(subcategory.name);
  const [editAmount, setEditAmount] = useState(subcategory.allocatedAmount.toString());

  const isEditing = editingSubcategory === subcategory.id;

  const handleSave = () => {
    onUpdateSubcategory(categoryId, subcategory.id, editName, parseFloat(editAmount) || 0);
  };

  return (
    <div className="bg-slate-600 p-3 rounded border border-slate-500">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 mr-2">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="bg-slate-500 border border-slate-400 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <input
              type="number"
              value={editAmount}
              onChange={(e) => setEditAmount(e.target.value)}
              className="bg-slate-500 border border-slate-400 text-slate-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
        ) : (
          <div className="flex-1">
            <p className="text-sm text-slate-200">{subcategory.name}</p>
            <p className="text-xs text-slate-400">{formatCurrency(subcategory.allocatedAmount)}</p>
          </div>
        )}
        
        <div className="flex space-x-1">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-emerald-400 hover:text-emerald-300 p-1"
              >
                <CheckIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => onEditSubcategory(null)}
                className="text-slate-400 hover:text-slate-300 p-1"
              >
                <XMarkIcon className="w-3 h-3" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onEditSubcategory(subcategory.id)}
                className="text-sky-400 hover:text-sky-300 p-1"
              >
                <PencilIcon className="w-3 h-3" />
              </button>
              <button
                onClick={() => onDeleteSubcategory(categoryId, subcategory.id)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <TrashIcon className="w-3 h-3" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default BudgetEditor;
