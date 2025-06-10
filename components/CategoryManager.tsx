import React, { useState, useEffect, useRef } from 'react';
import { Category, Subcategory } from '../types';
import CategoryCard from './CategoryCard';
import { PlusIcon } from '../constants';
import FloatingActionButton from './FloatingActionButton';

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
      <div className="mb-6 text-center sm:text-left">
        <h2 className="text-3xl font-bold text-white">Budget Categories</h2>
        <p className="text-slate-400 mt-1">
            Organize your spending into logical groups.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="text-center py-10 px-4 bg-slate-800 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-slate-300">No categories yet</h3>
          <p className="mt-1 text-sm text-slate-400">Get started by using the '+' button to add a category.</p>
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
      <FloatingActionButton onClick={() => onAddCategory()} tooltipText="Add Category" />
    </div>
  );
};

export default CategoryManager;
