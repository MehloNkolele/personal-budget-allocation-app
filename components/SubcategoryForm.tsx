
import React, { useState, useEffect } from 'react';
import { SubcategoryFormProps } from '../types'; 
import { useToast } from '../hooks/useToast';

const SubcategoryForm: React.FC<SubcategoryFormProps> = ({
  onSubmit,
  onClose,
  existingSubcategory,
  parentCategoryName,
  maxAllocatableAmount,
  selectedCurrency
}) => {
  const [name, setName] = useState('');
  const [allocatedAmount, setAllocatedAmount] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    if (existingSubcategory) {
      setName(existingSubcategory.name);
      setAllocatedAmount(existingSubcategory.allocatedAmount.toString());
    } else {
      setName('');
      setAllocatedAmount('');
    }
  }, [existingSubcategory]);

  const formatAmountForAlert = (amount: number) => {
    try {
      return amount.toLocaleString(undefined, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch(e) {
      return `${selectedCurrency} ${amount.toFixed(2)}`;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(allocatedAmount);
    if (name.trim() && !isNaN(amount) && amount >= 0) {
      if (maxAllocatableAmount !== undefined && amount > maxAllocatableAmount) {
        addToast(
          `The allocation of ${formatAmountForAlert(amount)} exceeds the available funds for this subcategory within '${parentCategoryName}'. ` +
          `The maximum you can allocate is ${formatAmountForAlert(maxAllocatableAmount)}. Please enter a smaller amount or adjust the parent category's allocation.`,
          'error'
        );
        return;
      }
      onSubmit(name.trim(), amount);
    } else {
      addToast("Please enter a valid name and a non-negative amount.", 'error');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
       {parentCategoryName && (
        <p className="text-sm text-slate-400">
          {existingSubcategory ? 'Editing subcategory in:' : 'Adding subcategory to:'} <span className="font-semibold">{parentCategoryName}</span>
        </p>
      )}
      <div>
        <label htmlFor="subcategoryName" className="block text-sm font-medium text-slate-300 mb-1">
          Subcategory Name
        </label>
        <input
          type="text"
          id="subcategoryName"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g., Groceries, Transport"
          required
        />
      </div>
      <div>
        <label htmlFor="subcategoryAmount" className="block text-sm font-medium text-slate-300 mb-1">
          Allocated Amount ({selectedCurrency})
        </label>
        <input
          type="number"
          id="subcategoryAmount"
          value={allocatedAmount}
          onChange={(e) => setAllocatedAmount(e.target.value)}
          className="w-full bg-slate-700 border border-slate-600 text-slate-100 rounded-md p-2.5 focus:ring-sky-500 focus:border-sky-500 transition"
          placeholder="e.g., 150"
          min="0"
          step="any"
          required
        />
        <p className="text-xs text-slate-400 mt-1">
          Available within parent category: {formatAmountForAlert(maxAllocatableAmount)}
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
          className="px-4 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition"
        >
          {existingSubcategory ? 'Save Changes' : 'Add Subcategory'}
        </button>
      </div>
    </form>
  );
};

export default SubcategoryForm;