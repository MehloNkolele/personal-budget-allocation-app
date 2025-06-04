import React, { useState } from 'react';
import { Category, Transaction } from '../types';
import { XMarkIcon, CurrencyDollarIcon, TagIcon } from '../constants';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (transaction: Omit<Transaction, 'id'>) => void;
  categories: Category[];
  selectedCurrency: string;
  existingTransaction?: Transaction;
}

const TransactionForm: React.FC<TransactionFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  selectedCurrency,
  existingTransaction
}) => {
  const [formData, setFormData] = useState({
    amount: existingTransaction?.amount || 0,
    description: existingTransaction?.description || '',
    categoryId: existingTransaction?.categoryId || '',
    subcategoryId: existingTransaction?.subcategoryId || '',
    date: existingTransaction?.date || new Date().toISOString().split('T')[0],
    type: existingTransaction?.type || 'expense' as 'expense' | 'income',
    tags: existingTransaction?.tags?.join(', ') || ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedCategory = categories.find(cat => cat.id === formData.categoryId);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.categoryId) {
      newErrors.categoryId = 'Category is required';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const transaction: Omit<Transaction, 'id'> = {
      amount: formData.amount,
      description: formData.description.trim(),
      categoryId: formData.categoryId,
      subcategoryId: formData.subcategoryId || undefined,
      date: formData.date,
      type: formData.type,
      tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : undefined
    };

    onSubmit(transaction);
    onClose();
    
    // Reset form if not editing
    if (!existingTransaction) {
      setFormData({
        amount: 0,
        description: '',
        categoryId: '',
        subcategoryId: '',
        date: new Date().toISOString().split('T')[0],
        type: 'expense',
        tags: ''
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Reset subcategory when category changes
    if (field === 'categoryId') {
      setFormData(prev => ({ ...prev, subcategoryId: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h3 className="text-xl font-semibold text-sky-400">
            {existingTransaction ? 'Edit Transaction' : 'Add Transaction'}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors duration-200"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Transaction Type */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Transaction Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="expense"
                  checked={formData.type === 'expense'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-slate-300">Expense</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="income"
                  checked={formData.type === 'income'}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className="mr-2 text-sky-500 focus:ring-sky-500"
                />
                <span className="text-slate-300">Income</span>
              </label>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Amount ({selectedCurrency})
            </label>
            <div className="relative">
              <CurrencyDollarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount || ''}
                onChange={(e) => handleInputChange('amount', parseFloat(e.target.value) || 0)}
                className={`w-full pl-10 pr-4 py-2 bg-slate-700 border rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                  errors.amount ? 'border-red-500' : 'border-slate-600'
                }`}
                placeholder="0.00"
              />
            </div>
            {errors.amount && <p className="text-red-400 text-sm mt-1">{errors.amount}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.description ? 'border-red-500' : 'border-slate-600'
              }`}
              placeholder="Enter transaction description"
            />
            {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Category
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => handleInputChange('categoryId', e.target.value)}
              className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.categoryId ? 'border-red-500' : 'border-slate-600'
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            {errors.categoryId && <p className="text-red-400 text-sm mt-1">{errors.categoryId}</p>}
          </div>

          {/* Subcategory */}
          {selectedCategory && selectedCategory.subcategories.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Subcategory (Optional)
              </label>
              <select
                value={formData.subcategoryId}
                onChange={(e) => handleInputChange('subcategoryId', e.target.value)}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Select a subcategory</option>
                {selectedCategory.subcategories.map(subcategory => (
                  <option key={subcategory.id} value={subcategory.id}>
                    {subcategory.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className={`w-full px-4 py-2 bg-slate-700 border rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                errors.date ? 'border-red-500' : 'border-slate-600'
              }`}
            />
            {errors.date && <p className="text-red-400 text-sm mt-1">{errors.date}</p>}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tags (Optional)
            </label>
            <div className="relative">
              <TagIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => handleInputChange('tags', e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Enter tags separated by commas"
              />
            </div>
            <p className="text-slate-500 text-xs mt-1">
              Separate multiple tags with commas (e.g., groceries, food, weekly)
            </p>
          </div>

          {/* Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-slate-200 rounded-lg transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg transition-colors duration-200"
            >
              {existingTransaction ? 'Update' : 'Add'} Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
