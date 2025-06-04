
import React from 'react';
import { Category, Subcategory } from '../types';
import ProgressBar from './ProgressBar';
import { PencilIcon, TrashIcon, PlusIcon, EyeIcon, EyeSlashIcon, CheckIcon } from '../constants';

interface CategoryCardProps {
  category: Category;
  onEditCategory: (category: Category) => void;
  onDeleteCategory: (categoryId: string) => void;
  onAddSubcategory: (parentCategoryId: string) => void;
  onEditSubcategory: (parentCategoryId: string, subcategory: Subcategory) => void;
  onDeleteSubcategory: (parentCategoryId: string, subcategoryId: string) => void;
  onToggleCategoryAmountHidden: (categoryId: string) => void;
  onToggleSubcategoryComplete: (parentCategoryId: string, subcategoryId: string) => void;
  formatCurrency: (amount: number, isIndividualItemHidden?: boolean) => string;
  areGlobalAmountsHidden: boolean;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onEditCategory,
  onDeleteCategory,
  onAddSubcategory,
  onEditSubcategory,
  onDeleteSubcategory,
  onToggleCategoryAmountHidden,
  onToggleSubcategoryComplete,
  formatCurrency,
  areGlobalAmountsHidden,
}) => {
  const subcategoriesTotal = category.subcategories.reduce((sum, sub) => sum + sub.allocatedAmount, 0);
  const remainingInCategory = category.allocatedAmount - subcategoriesTotal;
  const isCategoryAmountEffectivelyHidden = areGlobalAmountsHidden || category.isAmountHidden;

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-emerald-400">{category.name}</h3>
          <p className="text-sm text-slate-400">
            Allocated: {formatCurrency(category.allocatedAmount, category.isAmountHidden)}
          </p>
        </div>
        <div className="flex space-x-1 items-center">
           <button
            onClick={() => onToggleCategoryAmountHidden(category.id)}
            className="p-2 text-slate-400 hover:text-sky-400 transition-colors"
            aria-label={category.isAmountHidden ? `Show amounts for ${category.name}` : `Hide amounts for ${category.name}`}
            aria-pressed={category.isAmountHidden}
          >
            {category.isAmountHidden ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
          <button
            onClick={() => onEditCategory(category)}
            className="p-2 text-slate-400 hover:text-sky-400 transition-colors"
            aria-label={`Edit category ${category.name}`}
          >
            <PencilIcon />
          </button>
          <button
            onClick={() => onDeleteCategory(category.id)}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            aria-label={`Delete category ${category.name}`}
          >
            <TrashIcon />
          </button>
        </div>
      </div>

      {!isCategoryAmountEffectivelyHidden && category.allocatedAmount > 0 && (
        <div className="mb-3">
          <ProgressBar 
            value={subcategoriesTotal} 
            max={category.allocatedAmount} 
            colorClass={subcategoriesTotal > category.allocatedAmount ? 'bg-red-500' : 'bg-emerald-500'}
            heightClass="h-2.5"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Spent: {formatCurrency(subcategoriesTotal, category.isAmountHidden)}</span>
            <span className={remainingInCategory < 0 ? 'text-red-400' : ''}>
              Remaining: {formatCurrency(remainingInCategory, category.isAmountHidden)}
            </span>
          </div>
           {subcategoriesTotal > category.allocatedAmount && (
            <p className="text-xs text-red-400 mt-1">Subcategories exceed category allocation!</p>
          )}
        </div>
      )}
      {isCategoryAmountEffectivelyHidden && category.allocatedAmount > 0 && (
         <div className="mb-3 h-2.5 bg-slate-700 rounded-full text-xs flex items-center justify-center text-slate-400">Progress hidden</div>
      )}


      <div className="space-y-2 mb-3">
        {category.subcategories.map((sub) => (
          <div 
            key={sub.id} 
            className={`bg-slate-700/50 p-2.5 rounded-md flex justify-between items-center ${sub.isComplete ? 'opacity-70' : ''}`}
          >
            <div className="flex items-center space-x-2">
                <button 
                    onClick={() => onToggleSubcategoryComplete(category.id, sub.id)}
                    aria-label={sub.isComplete ? `Mark ${sub.name} as incomplete` : `Mark ${sub.name} as complete`}
                    className={`flex-shrink-0 w-5 h-5 rounded border-2 ${sub.isComplete ? 'bg-emerald-500 border-emerald-400' : 'border-slate-500 hover:border-emerald-400'} transition-all flex items-center justify-center`}
                    aria-pressed={sub.isComplete}
                >
                    {sub.isComplete && <CheckIcon className="w-3.5 h-3.5 text-white" />}
                </button>
              <div>
                <p className={`text-slate-200 ${sub.isComplete ? 'line-through' : ''}`}>{sub.name}</p>
                <p className={`text-xs text-slate-400 ${sub.isComplete ? 'line-through' : ''}`}>
                  Allocated: {formatCurrency(sub.allocatedAmount, category.isAmountHidden)}
                </p>
              </div>
            </div>
            <div className="flex space-x-1.5">
              <button
                onClick={() => onEditSubcategory(category.id, sub)}
                className="p-1.5 text-slate-400 hover:text-sky-300 transition-colors"
                aria-label={`Edit subcategory ${sub.name}`}
              >
                <PencilIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteSubcategory(category.id, sub.id)}
                className="p-1.5 text-slate-400 hover:text-red-300 transition-colors"
                aria-label={`Delete subcategory ${sub.name}`}
              >
                <TrashIcon className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onAddSubcategory(category.id)}
        className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 text-sm font-medium text-emerald-300 bg-emerald-600/30 hover:bg-emerald-500/40 rounded-md transition border border-emerald-600/50 hover:border-emerald-500"
      >
        <PlusIcon className="w-4 h-4" />
        <span>Add Subcategory</span>
      </button>
    </div>
  );
};

export default CategoryCard;
