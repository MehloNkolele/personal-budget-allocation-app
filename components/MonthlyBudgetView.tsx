import React, { useState, useEffect } from 'react';
import { MonthlyBudget, Category, Subcategory } from '../types';
import { UserDataManager } from '../utils/userDataManager';
import {
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  EyeIcon
} from '../constants';

interface MonthlyBudgetViewProps {
  budget: MonthlyBudget;
  onSave: (budget: MonthlyBudget) => void;
  onClose: () => void;
  formatCurrency: (amount: number) => string;
  selectedCurrency: string;
  userId: string;
}

const MonthlyBudgetView: React.FC<MonthlyBudgetViewProps> = ({
  budget,
  onSave,
  onClose,
  formatCurrency,
}) => {
  const [editedBudget, setEditedBudget] = useState<MonthlyBudget>({ ...budget });
  const [isEditing, setIsEditing] = useState(false);
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
    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <div>
            <h3 className="text-xl font-semibold text-sky-400">
              {isEditing ? `Edit Budget - ${editedBudget.monthName}`: `Budget Details - ${editedBudget.monthName}`}
            </h3>
            <p className="text-slate-400 text-sm mt-1">
              {isEditing ? 'Modify income, categories, and allocations' : 'View budget details for the selected month'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-slate-400 hover:text-white transition-colors duration-200 p-2 rounded-full bg-slate-700"
              >
                <PencilIcon className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white transition-colors duration-200 p-2 rounded-full bg-slate-700"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Income Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Total Income
            </label>
            {isEditing ? (
              <input
                type="number"
                value={editedBudget.totalIncome}
                onChange={(e) => handleIncomeChange(e.target.value)}
                className="w-full bg-slate-700 border border-slate-600 text-slate-200 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter total income"
              />
            ) : (
              <p className="text-lg font-semibold text-slate-200">{formatCurrency(editedBudget.totalIncome)}</p>
            )}
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
              {isEditing && (
                <button
                  onClick={() => setShowAddCategory(true)}
                  className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              )}
            </div>

            {/* Add Category Form */}
            {isEditing && showAddCategory && (
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
                    className="text-slate-300 hover:text-white px-3 py-2 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Category List */}
            <div className="space-y-4">
              {editedBudget.categories.map(cat => (
                <CategoryEditor
                  key={cat.id}
                  category={cat}
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
                  isEditing={isEditing}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        {isEditing && (
          <div className="flex items-center justify-end p-6 border-t border-slate-700 bg-slate-800">
            <button
              onClick={onClose}
              className="text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors mr-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="bg-sky-600 hover:bg-sky-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
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
  isEditing: boolean;
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
  formatCurrency,
  isEditing
}) => {
  const [editedName, setEditedName] = useState(category.name);
  const [editedAmount, setEditedAmount] = useState(category.allocatedAmount.toString());
  const [showAddSubcategory, setShowAddSubcategory] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState('');
  const [newSubcategoryAmount, setNewSubcategoryAmount] = useState('');

  const isCurrentlyEditing = editingCategory === category.id;

  const handleSaveCategory = () => {
    onUpdateCategory(category.id, editedName, parseFloat(editedAmount) || 0);
  };

  const handleAddSubcategory = () => {
    if (newSubcategoryName.trim() && newSubcategoryAmount) {
      onAddSubcategory(category.id, newSubcategoryName.trim(), parseFloat(newSubcategoryAmount) || 0);
      setNewSubcategoryName('');
      setNewSubcategoryAmount('');
      setShowAddSubcategory(false);
    }
  };

  return (
    <div className="bg-slate-700/50 rounded-lg p-4 border border-slate-600">
      {isCurrentlyEditing && isEditing ? (
        // Edit View
        <div>
           {/* ... form fields for editing category ... */}
        </div>
      ) : (
        // Display View
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <p className="text-lg font-semibold text-white">{category.name}</p>
              <p className="text-sm text-sky-400">{formatCurrency(category.allocatedAmount)} Allocated</p>
            </div>
          </div>
          {isEditing && (
             <div className="flex items-center space-x-2">
                <button onClick={() => onEditCategory(category.id)} className="p-2 text-slate-400 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                <button onClick={() => onDeleteCategory(category.id)} className="p-2 text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
            </div>
          )}
        </div>
      )}

      {/* Subcategories */}
      {category.subcategories.length > 0 && (
        <div className="mt-4 pl-6 border-l-2 border-slate-600 space-y-3">
          {category.subcategories.map(sub => (
            <SubcategoryEditor
              key={sub.id}
              subcategory={sub}
              categoryId={category.id}
              editingSubcategory={editingSubcategory}
              onEditSubcategory={onEditSubcategory}
              onUpdateSubcategory={onUpdateSubcategory}
              onDeleteSubcategory={onDeleteSubcategory}
              formatCurrency={formatCurrency}
              isEditing={isEditing}
            />
          ))}
        </div>
      )}

      {isEditing && (
        <div className="mt-4 pl-6">
            {/* ... button and form to add subcategory ... */}
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
  isEditing: boolean;
}

const SubcategoryEditor: React.FC<SubcategoryEditorProps> = ({
  subcategory,
  categoryId,
  editingSubcategory,
  onEditSubcategory,
  onUpdateSubcategory,
  onDeleteSubcategory,
  formatCurrency,
  isEditing
}) => {
  const [editedName, setEditedName] = useState(subcategory.name);
  const [editedAmount, setEditedAmount] = useState(subcategory.allocatedAmount.toString());

  const isCurrentlyEditing = editingSubcategory === subcategory.id;

  const handleSave = () => {
    onUpdateSubcategory(categoryId, subcategory.id, editedName, parseFloat(editedAmount) || 0);
  };

  return (
    <div>
        {isCurrentlyEditing && isEditing ? (
            // Edit view for subcategory
            <div>
                 {/* ... form fields for editing subcategory ... */}
            </div>
        ) : (
            // Display view for subcategory
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-slate-200">{subcategory.name}</p>
                    <p className="text-sm text-slate-400">{formatCurrency(subcategory.allocatedAmount)}</p>
                </div>
                {isEditing && (
                    <div className="flex items-center space-x-2">
                        <button onClick={() => onEditSubcategory(subcategory.id)} className="p-1 text-slate-400 hover:text-white"><PencilIcon className="w-4 h-4" /></button>
                        <button onClick={() => onDeleteSubcategory(categoryId, subcategory.id)} className="p-1 text-red-400 hover:text-red-300"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default MonthlyBudgetView;
