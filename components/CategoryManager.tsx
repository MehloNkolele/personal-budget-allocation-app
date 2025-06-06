import React, { useState, useEffect, useRef } from 'react';
import { Category, Subcategory } from '../types';
import CategoryCard from './CategoryCard';
import { PlusIcon } from '../constants';

interface CategoryManagerProps {
  categories: Category[];
  onAddCategory: () => void;
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

const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onAddCategory,
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
  // Track which category is expanded
  const [expandedCategoryId, setExpandedCategoryId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle click outside to collapse the expanded category
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current && 
        expandedCategoryId &&
        !event.composedPath().some(el => 
          el instanceof HTMLElement && 
          el.getAttribute('data-category-id') === expandedCategoryId
        )
      ) {
        setExpandedCategoryId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedCategoryId]);

  // Toggle the expanded state of a category
  const toggleCategoryExpanded = (categoryId: string) => {
    setExpandedCategoryId(prevId => prevId === categoryId ? null : categoryId);
  };

  return (
    <div className="mb-6" ref={containerRef}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-sky-400">Budget Categories</h2>
        <button
          onClick={onAddCategory}
          className="flex items-center space-x-2 bg-sky-600 hover:bg-sky-700 text-white font-medium py-2.5 px-4 rounded-lg transition shadow"
          aria-label="Add new category"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Add Category</span>
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-800 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-300">No categories yet</h3>
          <p className="mt-1 text-sm text-slate-400">Get started by adding your first budget category.</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onAddCategory}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-sky-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add New Category
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEditCategory={onEditCategory}
              onDeleteCategory={onDeleteCategory}
              onAddSubcategory={onAddSubcategory}
              onEditSubcategory={onEditSubcategory}
              onDeleteSubcategory={onDeleteSubcategory}
              onToggleCategoryAmountHidden={onToggleCategoryAmountHidden}
              onToggleSubcategoryComplete={onToggleSubcategoryComplete}
              formatCurrency={formatCurrency}
              areGlobalAmountsHidden={areGlobalAmountsHidden}
              isExpanded={expandedCategoryId === category.id}
              onToggleExpand={() => toggleCategoryExpanded(category.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryManager;
