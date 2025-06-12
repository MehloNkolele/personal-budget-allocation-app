import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Subcategory } from '../types';
import ProgressBar from './ProgressBar';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  EyeIcon,
  EyeSlashIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  SparklesIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ClockIcon
} from '../constants';

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
  isExpanded: boolean;
  onToggleExpand: () => void;
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
  isExpanded,
  onToggleExpand,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const subcategoriesTotal = category.subcategories.reduce((sum, sub) => sum + sub.allocatedAmount, 0);
  const remainingInCategory = category.allocatedAmount - subcategoriesTotal;
  const isCategoryAmountEffectivelyHidden = areGlobalAmountsHidden || category.isAmountHidden;
  const hasSubcategories = category.subcategories.length > 0;
  const progressPercentage = category.allocatedAmount > 0 ? (subcategoriesTotal / category.allocatedAmount) * 100 : 0;
  const completedSubcategories = category.subcategories.filter(sub => sub.isComplete).length;
  const completionRate = hasSubcategories ? (completedSubcategories / category.subcategories.length) * 100 : 0;

  // Dynamic gradient based on category name
  const getGradientColors = (name: string) => {
    const gradients = [
      { from: 'from-emerald-400', via: 'via-teal-500', to: 'to-cyan-600', border: 'border-emerald-500/30', bg: 'from-emerald-500/10 to-cyan-600/10' },
      { from: 'from-blue-400', via: 'via-indigo-500', to: 'to-purple-600', border: 'border-blue-500/30', bg: 'from-blue-500/10 to-purple-600/10' },
      { from: 'from-pink-400', via: 'via-rose-500', to: 'to-red-600', border: 'border-pink-500/30', bg: 'from-pink-500/10 to-red-600/10' },
      { from: 'from-amber-400', via: 'via-orange-500', to: 'to-red-600', border: 'border-amber-500/30', bg: 'from-amber-500/10 to-red-600/10' },
      { from: 'from-violet-400', via: 'via-purple-500', to: 'to-fuchsia-600', border: 'border-violet-500/30', bg: 'from-violet-500/10 to-fuchsia-600/10' },
    ];
    const hash = name.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    return gradients[hash % gradients.length];
  };

  const colors = getGradientColors(category.name);

  return (
    <motion.div
      className={`relative overflow-hidden bg-gradient-to-br ${colors.bg} backdrop-blur-sm border ${colors.border} rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300`}
      data-category-id={category.id}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -4 }}
      layout
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent"></div>
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
      </div>

      {/* Main Content */}
      <div className="relative p-4 sm:p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3 min-w-0 flex-1">
            {/* Category Icon */}
            <motion.div
              className={`relative w-12 h-12 bg-gradient-to-br ${colors.from} ${colors.via} ${colors.to} rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0`}
              whileHover={{ rotate: 5, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <span className="text-white font-bold text-lg">
                {category.name.charAt(0).toUpperCase()}
              </span>
              {completionRate === 100 && hasSubcategories && (
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                >
                  <SparklesIcon className="w-3 h-3 text-white" />
                </motion.div>
              )}
            </motion.div>

            {/* Category Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-lg sm:text-xl font-bold text-white truncate">
                  {category.name}
                </h3>
                {hasSubcategories && (
                  <motion.button
                    onClick={onToggleExpand}
                    className="p-1 text-slate-400 hover:text-white transition-colors rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={isExpanded ? `Collapse ${category.name}` : `Expand ${category.name}`}
                  >
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDownIcon className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                )}
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                <p className="text-sm text-slate-300">
                  Budget: {formatCurrency(category.allocatedAmount, category.isAmountHidden)}
                </p>
                {hasSubcategories && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <ClockIcon className="w-3 h-3" />
                    <span>{completedSubcategories}/{category.subcategories.length} done</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <motion.button
              onClick={() => setShowActions(!showActions)}
              className="p-2 text-slate-400 hover:text-white transition-colors rounded-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {(showActions || isHovered) && (
                <motion.div
                  className="flex items-center gap-1"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.button
                    onClick={() => onToggleCategoryAmountHidden(category.id)}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={category.isAmountHidden ? `Show amounts for ${category.name}` : `Hide amounts for ${category.name}`}
                  >
                    {category.isAmountHidden ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </motion.button>

                  <motion.button
                    onClick={() => onEditCategory(category)}
                    className="p-2 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Edit category ${category.name}`}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </motion.button>

                  <motion.button
                    onClick={() => onDeleteCategory(category.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={`Delete category ${category.name}`}
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Progress Section */}
        {!isCategoryAmountEffectivelyHidden && category.allocatedAmount > 0 && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {/* Progress Stats */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">Progress</span>
                <div className="flex items-center gap-1">
                  {progressPercentage > 100 ? (
                    <TrendingUpIcon className="w-4 h-4 text-red-400" />
                  ) : progressPercentage > 80 ? (
                    <TrendingUpIcon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <TrendingUpIcon className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className={`text-sm font-bold ${
                    progressPercentage > 100 ? 'text-red-400' :
                    progressPercentage > 80 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="text-right">
                <p className="text-sm font-medium text-white">
                  {formatCurrency(subcategoriesTotal, category.isAmountHidden)}
                </p>
                <p className="text-xs text-slate-400">
                  of {formatCurrency(category.allocatedAmount, category.isAmountHidden)}
                </p>
              </div>
            </div>

            {/* Enhanced Progress Bar */}
            <div className="relative">
              <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    progressPercentage > 100 ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    progressPercentage > 80 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                    `bg-gradient-to-r ${colors.from} ${colors.to}`
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
                {progressPercentage > 100 && (
                  <motion.div
                    className="absolute top-0 left-0 h-full bg-red-500/30 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.5 }}
                  />
                )}
              </div>

              {/* Remaining Amount Indicator */}
              <div className="flex justify-between text-xs mt-2">
                <span className="text-slate-400">
                  Allocated: {formatCurrency(subcategoriesTotal, category.isAmountHidden)}
                </span>
                <span className={`font-medium ${remainingInCategory < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                  {remainingInCategory < 0 ? 'Over by ' : 'Remaining: '}
                  {formatCurrency(Math.abs(remainingInCategory), category.isAmountHidden)}
                </span>
              </div>
            </div>

            {/* Warning for over-allocation */}
            {subcategoriesTotal > category.allocatedAmount && (
              <motion.div
                className="mt-3 p-2 bg-red-500/10 border border-red-500/20 rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <p className="text-xs text-red-400 flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  Subcategories exceed budget allocation!
                </p>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Hidden Progress Indicator */}
        {isCategoryAmountEffectivelyHidden && category.allocatedAmount > 0 && (
          <div className="mb-4 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30">
            <div className="flex items-center justify-center gap-2 text-slate-400">
              <EyeSlashIcon className="w-4 h-4" />
              <span className="text-sm">Progress hidden</span>
            </div>
          </div>
        )}

        {/* Subcategories Summary (when collapsed) */}
        {hasSubcategories && !isExpanded && (
          <motion.div
            className="mb-4 p-3 bg-slate-700/20 rounded-lg border border-slate-600/20"
            whileHover={{ backgroundColor: "rgba(51, 65, 85, 0.3)" }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-300">
                  {category.subcategories.length} subcategories
                </span>
                {completionRate > 0 && (
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full"></div>
                    <span className="text-xs text-emerald-400">{completionRate.toFixed(0)}% complete</span>
                  </div>
                )}
              </div>
              <ChevronDownIcon className="w-4 h-4 text-slate-400" />
            </div>
          </motion.div>
        )}

        {/* Expanded Subcategories */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="overflow-hidden"
            >
              <div className="space-y-3 mb-4">
                {category.subcategories.map((sub, index) => (
                  <motion.div
                    key={sub.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className={`group relative bg-slate-700/30 hover:bg-slate-700/50 border border-slate-600/30 hover:border-slate-500/50 rounded-xl p-3 transition-all duration-200 ${
                      sub.isComplete ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Completion Checkbox */}
                        <motion.button
                          onClick={() => onToggleSubcategoryComplete(category.id, sub.id)}
                          className={`relative w-6 h-6 rounded-lg border-2 transition-all duration-200 flex items-center justify-center ${
                            sub.isComplete
                              ? `bg-gradient-to-br ${colors.from} ${colors.to} border-transparent shadow-lg`
                              : 'border-slate-500 hover:border-slate-400 hover:bg-slate-600/30'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={sub.isComplete ? `Mark ${sub.name} as incomplete` : `Mark ${sub.name} as complete`}
                        >
                          <AnimatePresence>
                            {sub.isComplete && (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                exit={{ scale: 0, rotate: 180 }}
                                transition={{ duration: 0.2 }}
                              >
                                <CheckIcon className="w-4 h-4 text-white" />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.button>

                        {/* Subcategory Info */}
                        <div className="min-w-0 flex-1">
                          <p className={`font-medium text-slate-200 truncate ${sub.isComplete ? 'line-through' : ''}`}>
                            {sub.name}
                          </p>
                          <p className={`text-sm text-slate-400 ${sub.isComplete ? 'line-through' : ''}`}>
                            {formatCurrency(sub.allocatedAmount, category.isAmountHidden)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <motion.button
                          onClick={() => onEditSubcategory(category.id, sub)}
                          className="p-2 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Edit subcategory ${sub.name}`}
                        >
                          <PencilIcon className="w-4 h-4" />
                        </motion.button>

                        <motion.button
                          onClick={() => onDeleteSubcategory(category.id, sub.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          aria-label={`Delete subcategory ${sub.name}`}
                        >
                          <TrashIcon className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </div>

                    {/* Completion Animation */}
                    {sub.isComplete && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-500/10 to-transparent rounded-xl"
                        initial={{ x: "-100%" }}
                        animate={{ x: "100%" }}
                        transition={{ duration: 0.6, ease: "easeInOut" }}
                      />
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Add Subcategory Button */}
              <motion.button
                onClick={() => onAddSubcategory(category.id)}
                className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r ${colors.from} ${colors.to} hover:shadow-lg hover:shadow-emerald-500/25 rounded-xl transition-all duration-200`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <PlusIcon className="w-4 h-4" />
                <span>Add Subcategory</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Show Subcategories Button (when collapsed) */}
        {!isExpanded && hasSubcategories && (
          <motion.button
            onClick={onToggleExpand}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-300 bg-slate-700/30 hover:bg-slate-600/50 border border-slate-600/30 hover:border-slate-500/50 rounded-xl transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            aria-label={`Show subcategories for ${category.name}`}
          >
            <span>Show {category.subcategories.length} Subcategories</span>
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDownIcon className="w-4 h-4" />
            </motion.div>
          </motion.button>
        )}

        {/* Add First Subcategory Button (when no subcategories) */}
        {!hasSubcategories && (
          <motion.button
            onClick={() => onAddSubcategory(category.id)}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-gradient-to-r ${colors.from} ${colors.to} hover:shadow-lg hover:shadow-emerald-500/25 rounded-xl transition-all duration-200 border border-transparent`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <PlusIcon className="w-4 h-4" />
            <span>Add Subcategory</span>
          </motion.button>
        )}
      </div>

      {/* Hover Glow Effect */}
      <motion.div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colors.from} ${colors.to} opacity-0 -z-10`}
        animate={{ opacity: isHovered ? 0.1 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.div>
  );
};

export default CategoryCard;
