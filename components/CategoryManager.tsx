import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Subcategory } from '../types';
import CategoryCard from './CategoryCard';
import { PlusIcon, FolderIcon, SparklesIcon } from '../constants';
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<'name' | 'amount' | 'progress'>('name');
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter and sort categories
  const filteredAndSortedCategories = categories
    .filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount':
          return b.allocatedAmount - a.allocatedAmount;
        case 'progress':
          const aProgress = a.allocatedAmount > 0 ?
            (a.subcategories.reduce((sum, sub) => sum + sub.allocatedAmount, 0) / a.allocatedAmount) * 100 : 0;
          const bProgress = b.allocatedAmount > 0 ?
            (b.subcategories.reduce((sum, sub) => sum + sub.allocatedAmount, 0) / b.allocatedAmount) * 100 : 0;
          return bProgress - aProgress;
        default:
          return a.name.localeCompare(b.name);
      }
    });

  // Calculate total statistics
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const totalSpent = categories.reduce((sum, cat) =>
    sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.allocatedAmount, 0), 0
  );
  const completedTasks = categories.reduce((sum, cat) =>
    sum + cat.subcategories.filter(sub => sub.isComplete).length, 0
  );
  const totalTasks = categories.reduce((sum, cat) => sum + cat.subcategories.length, 0);

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
    <motion.div
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 sm:p-6 lg:p-8"
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header Section */}
      <motion.div
        className="mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.6 }}
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FolderIcon className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  Budget Categories
                </h1>
                <p className="text-slate-400 text-sm sm:text-base mt-1">
                  Organize your spending into logical groups
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          {categories.length > 0 && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-4">
              <motion.div
                className="bg-gradient-to-br from-emerald-500/10 to-teal-600/10 backdrop-blur-sm border border-emerald-500/20 rounded-xl p-3 lg:p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-center">
                  <p className="text-emerald-400 font-bold text-lg lg:text-xl">
                    {formatCurrency(totalAllocated)}
                  </p>
                  <p className="text-slate-400 text-xs lg:text-sm">Total Budget</p>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-blue-500/10 to-cyan-600/10 backdrop-blur-sm border border-blue-500/20 rounded-xl p-3 lg:p-4"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-center">
                  <p className="text-blue-400 font-bold text-lg lg:text-xl">
                    {formatCurrency(totalSpent)}
                  </p>
                  <p className="text-slate-400 text-xs lg:text-sm">Allocated</p>
                </div>
              </motion.div>

              <motion.div
                className="bg-gradient-to-br from-purple-500/10 to-pink-600/10 backdrop-blur-sm border border-purple-500/20 rounded-xl p-3 lg:p-4 col-span-2 lg:col-span-1"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="text-center">
                  <p className="text-purple-400 font-bold text-lg lg:text-xl">
                    {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                  </p>
                  <p className="text-slate-400 text-xs lg:text-sm">Completed</p>
                </div>
              </motion.div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Search and Filter Section */}
      {categories.length > 0 && (
        <motion.div
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'amount' | 'progress')}
                className="appearance-none bg-slate-800/50 border border-slate-600/50 rounded-xl px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all cursor-pointer"
              >
                <option value="name">Sort by Name</option>
                <option value="amount">Sort by Amount</option>
                <option value="progress">Sort by Progress</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Categories Grid or Empty State */}
      <AnimatePresence mode="wait">
        {filteredAndSortedCategories.length === 0 ? (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.5 }}
            className="text-center py-16 px-4"
          >
            <div className="max-w-md mx-auto">
              <motion.div
                className="relative mb-8"
                animate={{
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.05, 1]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <FolderIcon className="w-12 h-12 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <SparklesIcon className="w-4 h-4 text-white" />
                </div>
              </motion.div>

              <h3 className="text-2xl font-bold text-white mb-4">
                {categories.length === 0 ? "Ready to Start Budgeting?" : "No matches found"}
              </h3>

              <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                {categories.length === 0
                  ? "Create your first budget category and take control of your finances with style!"
                  : `No categories match "${searchTerm}". Try adjusting your search or create a new category.`
                }
              </p>

              <motion.button
                onClick={onAddCategory}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <PlusIcon className="w-5 h-5" />
                <span>Create Your First Category</span>
              </motion.button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="categories-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6"
          >
            {filteredAndSortedCategories.map((category, index) => (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: index * 0.1,
                  duration: 0.5,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <CategoryCard
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
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <FloatingActionButton onClick={onAddCategory} tooltipText="Add Category" />
    </motion.div>
  );
};

export default CategoryManager;
