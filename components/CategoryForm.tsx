
import React, { useState, useEffect } from 'react';
import { CategoryFormProps, CategoryFormPropsEdit } from '../types';
import { useToast } from '../hooks/useToast';

const CategoryForm: React.FC<CategoryFormProps> = (props) => {
  const {
    onSubmit,
    onClose,
    existingCategory,
    maxAllocatableAmount,
    selectedCurrency
  } = props;

  const { addToast } = useToast();

  const minAllocatableAmountForEdit = existingCategory
    ? (props as CategoryFormPropsEdit).minAllocatableAmountForEdit
    : undefined;

  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');

  useEffect(() => {
    if (existingCategory) {
      setName(existingCategory.name);
      setAllocatedAmount(existingCategory.allocatedAmount.toString());
    } else {
      setName('');
      setAllocatedAmount('');
    }
  }, [existingCategory]);

  const formatAmountForAlert = (amount: number) => {
    try {
      return amount.toLocaleString(undefined, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (e) {
      return `${selectedCurrency} ${amount.toFixed(2)}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(allocatedAmount);
    if (name.trim() && !isNaN(amount) && amount >= 0) {
      if (existingCategory && minAllocatableAmountForEdit !== undefined && amount < minAllocatableAmountForEdit) {
        addToast(
          `The new allocation of ${formatAmountForAlert(amount)} is less than the total amount already allocated to its subcategories (${formatAmountForAlert(minAllocatableAmountForEdit)}). ` +
          `Please adjust subcategories first or increase this category's allocation.`,
          'error'
        );
        return;
      }

      if (maxAllocatableAmount !== undefined && amount > maxAllocatableAmount) {
         let message = `The allocation of ${formatAmountForAlert(amount)} exceeds the available funds. `;
        if (existingCategory) {
            message += `The maximum you can allocate to this category (based on total income and other categories) is ${formatAmountForAlert(maxAllocatableAmount)}.`;
        } else {
            message += `The maximum you can allocate for a new category (based on total income and existing categories) is ${formatAmountForAlert(maxAllocatableAmount)}.`;
        }
        message += " Please enter a smaller amount.";
        addToast(message, 'error');
        return;
      }
      
      onSubmit(name.trim(), amount);
    } else {
      addToast("Please enter a valid name and a non-negative amount.", 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="categoryName" className="block text-sm font-medium text-slate-300 mb-1">
          Category Name
        </label>
        <input
          type="text"
          id="categoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g., Savings, Expenses"
          required
        />
      </div>
      <div>
        <label htmlFor="categoryAmount" className="block text-sm font-medium text-slate-300 mb-1">
          Allocated Amount ({selectedCurrency})
        </label>
        <input
          type="number"
          id="categoryAmount"
          value={allocatedAmount}
          onChange={(e) => setAllocatedAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g., 500"
          min="0"
          step="any"
          required
        />
         <p className="text-xs text-slate-400 mt-1">
          {existingCategory && minAllocatableAmountForEdit !== undefined
            ? `Max based on income: ${formatAmountForAlert(maxAllocatableAmount)}. Min for subcategories: ${formatAmountForAlert(minAllocatableAmountForEdit ?? 0)}`
            : `Available for new category: ${formatAmountForAlert(maxAllocatableAmount)}`}
        </p>
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-600 hover:bg-slate-500 rounded-md transition"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2.5 text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 rounded-md transition"
        >
          {existingCategory ? 'Save Changes' : 'Add Category'}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;