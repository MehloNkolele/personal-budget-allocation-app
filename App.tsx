import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Category, Subcategory, Transaction, ModalType, CategoryFormProps, SubcategoryFormProps, MonthlyBudget } from './types';
import Dashboard from './components/Dashboard';
import CategoryManager from './components/CategoryManager';
import Reports from './components/Reports';
import BudgetPlanning from './components/BudgetPlanning';
import BudgetHistory from './components/BudgetHistory';
import SavingsCalculator from './components/SavingsCalculator';
import Modal from './components/Modal';
import CategoryForm from './components/CategoryForm';
import SubcategoryForm from './components/SubcategoryForm';
import ConfirmationModal from './components/ConfirmationModal';
import Navbar from './components/Navbar';
import { CURRENCIES } from './constants';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useToast } from './hooks/useToast';
import { useNavigation } from './hooks/useNavigation';
import Toaster from './components/Toaster';
import MedianBridge from './components/MedianBridge';
import { FirebaseDataManager } from './services/firebaseDataManager';
import { DataMigrationService, MigrationProgress } from './services/dataMigrationService';
import { UserDataManager } from './utils/userDataManager';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const { currentSection, navigateToSection } = useNavigation();
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalState, setModalState] = useState<ModalType>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(CURRENCIES[0].code);
  const [areGlobalAmountsHidden, setAreGlobalAmountsHidden] = useState<boolean>(false);
  const [isIncomeHidden, setIsIncomeHidden] = useState<boolean>(true);
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isMigrating, setIsMigrating] = useState<boolean>(false);
  const [migrationProgress, setMigrationProgress] = useState<MigrationProgress | null>(null);

  // Handle app close - save income hidden state
  useEffect(() => {
    const handleAppClose = async () => {
      if (user?.uid) {
        try {
          await FirebaseDataManager.updateBudgetData(user.uid, { isIncomeHidden: true });
        } catch (error) {
          console.error('Error saving income hidden state on app close:', error);
        }
      }
    };
    window.addEventListener('beforeunload', handleAppClose);
    return () => window.removeEventListener('beforeunload', handleAppClose);
  }, [user]);

  // Data migration and loading effect
  useEffect(() => {
    if (!user) {
      // Clear state when user logs out
      setTotalIncome(0);
      setCategories([]);
      setTransactions([]);
      setSelectedCurrency(CURRENCIES[0].code);
      setAreGlobalAmountsHidden(false);
      setIsIncomeHidden(true);
      setMonthlyBudgets([]);
      setIsDataLoaded(false);
      return;
    }

    let unsubscribeFunctions: (() => void)[] = [];

    const loadUserData = async () => {
      try {
        setIsLoading(true);

        // Check if migration is needed
        const migrationStatus = DataMigrationService.getMigrationStatus(user.uid);

        if (migrationStatus.hasLocalData && !migrationStatus.isCompleted) {
          // Perform migration
          setIsMigrating(true);
          addToast('Migrating your data to Firebase...', 'info');

          const migrationResult = await DataMigrationService.migrateUserData(
            user,
            (progress) => setMigrationProgress(progress)
          );

          if (migrationResult.success) {
            addToast('Data migration completed successfully!', 'success');
            // Clean up localStorage after successful migration
            DataMigrationService.cleanupLocalStorage(user.uid);
          } else {
            addToast(`Migration failed: ${migrationResult.errors.join(', ')}`, 'error');
            console.error('Migration errors:', migrationResult.errors);
          }

          setIsMigrating(false);
          setMigrationProgress(null);
        }

        // Set up real-time listeners for data synchronization
        const unsubscribeBudgetData = FirebaseDataManager.subscribeToBudgetData(user.uid, (budgetData) => {
          setTotalIncome(budgetData.totalIncome);
          setSelectedCurrency(budgetData.selectedCurrency);
          setAreGlobalAmountsHidden(budgetData.areGlobalAmountsHidden);
          setIsIncomeHidden(budgetData.isIncomeHidden);
        });

        const unsubscribeCategories = FirebaseDataManager.subscribeToCategories(user.uid, (categories) => {
          setCategories(categories);
        });

        const unsubscribeTransactions = FirebaseDataManager.subscribeToTransactions(user.uid, (transactions) => {
          setTransactions(transactions);
        });

        // Store unsubscribe functions for cleanup
        unsubscribeFunctions = [unsubscribeBudgetData, unsubscribeCategories, unsubscribeTransactions];

        // Load monthly budgets once (they don't need real-time updates)
        const monthlyBudgets = await FirebaseDataManager.getMonthlyBudgets(user.uid);
        setMonthlyBudgets(monthlyBudgets);

        setIsDataLoaded(true);

      } catch (error) {
        console.error("Error loading user data:", error);
        addToast("Error loading your data. Please try refreshing the page.", 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();

    // Cleanup function
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
      FirebaseDataManager.unsubscribeAll(user.uid);
    };
  }, [user, addToast]);

  const handleSectionChange = useCallback((section: 'dashboard' | 'categories' | 'reports' | 'planning' | 'history' | 'savings') => navigateToSection(section), [navigateToSection]);
  const openModal = useCallback((modalType: ModalType) => setModalState(modalType), []);
  const closeModal = useCallback(() => setModalState(null), []);

  const formatCurrency = useCallback((amount: number, isIndividualItemHidden?: boolean): string => {
    if (areGlobalAmountsHidden || isIndividualItemHidden) return '••••';
    try {
      return new Intl.NumberFormat(undefined, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
    } catch (error) {
      console.warn(`Currency formatting error for ${selectedCurrency}. Falling back.`, error);
      return `${selectedCurrency} ${amount.toFixed(2)}`;
    }
  }, [selectedCurrency, areGlobalAmountsHidden]);

  const formatCurrencyWithVisibility = useCallback((amount: number, isIndividualItemHidden?: boolean): string => {
    if (isIncomeHidden || isIndividualItemHidden) return '••••';
    return formatCurrency(amount, isIndividualItemHidden);
  }, [formatCurrency, isIncomeHidden]);

  const addCategory = useCallback(async (name: string, allocatedAmount: number) => {
    if (!user?.uid) return;

    try {
      await FirebaseDataManager.addCategory(user.uid, {
        name,
        allocatedAmount,
        subcategories: [],
        isAmountHidden: false
      });

      // Real-time listener will update the state automatically
      closeModal();
      addToast(`Category "${name}" added successfully.`, 'success');
    } catch (error) {
      console.error('Error adding category:', error);
      addToast('Failed to add category. Please try again.', 'error');
    }
  }, [user, closeModal, addToast]);

  const editCategory = useCallback(async (categoryId: string, name: string, allocatedAmount: number) => {
    if (!user?.uid) return;

    try {
      await FirebaseDataManager.updateCategory(user.uid, categoryId, {
        name,
        allocatedAmount
      });

      // Real-time listener will update the state automatically
      closeModal();
      addToast(`Category "${name}" updated successfully.`, 'success');
    } catch (error) {
      console.error('Error updating category:', error);
      addToast('Failed to update category. Please try again.', 'error');
    }
  }, [user, closeModal, addToast]);

  const deleteCategory = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) openModal({ type: 'deleteCategory', category });
  }, [categories, openModal]);

  const confirmDeleteCategory = useCallback(async (categoryId: string) => {
    if (!user?.uid) return;

    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) return;

    try {
      await FirebaseDataManager.deleteCategory(user.uid, categoryId);

      // Update total income if needed
      const completedSubcategoriesAmount = categoryToDelete.subcategories
        .filter(sub => sub.isComplete)
        .reduce((sum, sub) => sum + sub.allocatedAmount, 0);

      if (completedSubcategoriesAmount > 0) {
        const newTotalIncome = Math.max(0, totalIncome - completedSubcategoriesAmount);
        setTotalIncome(newTotalIncome);
        await FirebaseDataManager.updateBudgetData(user.uid, { totalIncome: newTotalIncome });
      }

      // Real-time listener will update the state automatically
      addToast(`Category "${categoryToDelete.name}" deleted.`, 'success');
      closeModal();
    } catch (error) {
      console.error('Error deleting category:', error);
      addToast('Failed to delete category. Please try again.', 'error');
    }
  }, [user, categories, totalIncome, addToast, closeModal]);

  const toggleCategoryAmountHidden = useCallback(async (categoryId: string) => {
    if (!user?.uid) return;

    const category = categories.find(cat => cat.id === categoryId);
    if (!category) return;

    try {
      const newHiddenState = !category.isAmountHidden;
      await FirebaseDataManager.updateCategory(user.uid, categoryId, {
        isAmountHidden: newHiddenState
      });

      // Real-time listener will update the state automatically
    } catch (error) {
      console.error('Error toggling category amount visibility:', error);
      addToast('Failed to update category visibility. Please try again.', 'error');
    }
  }, [user, categories, addToast]);

  const addSubcategory = useCallback(async (parentCategoryId: string, name: string, allocatedAmount: number) => {
    if (!user?.uid) return;

    try {
      const parentCategory = categories.find(cat => cat.id === parentCategoryId);
      if (!parentCategory) return;

      const newSubcategory: Subcategory = {
        id: Date.now().toString(),
        name,
        allocatedAmount,
        isComplete: false
      };

      const updatedSubcategories = [...parentCategory.subcategories, newSubcategory];

      await FirebaseDataManager.updateCategory(user.uid, parentCategoryId, {
        subcategories: updatedSubcategories
      });

      // Real-time listener will update the state automatically
      closeModal();
      addToast(`Subcategory "${name}" added successfully.`, 'success');
    } catch (error) {
      console.error('Error adding subcategory:', error);
      addToast('Failed to add subcategory. Please try again.', 'error');
    }
  }, [user, categories, closeModal, addToast]);

  const editSubcategory = useCallback(async (parentCategoryId: string, subcategoryId: string, name: string, allocatedAmount: number) => {
    if (!user?.uid) return;

    try {
      const parentCategory = categories.find(cat => cat.id === parentCategoryId);
      if (!parentCategory) return;

      const updatedSubcategories = parentCategory.subcategories.map(sub =>
        sub.id === subcategoryId ? { ...sub, name, allocatedAmount } : sub
      );

      await FirebaseDataManager.updateCategory(user.uid, parentCategoryId, {
        subcategories: updatedSubcategories
      });

      // Real-time listener will update the state automatically
      closeModal();
      addToast(`Subcategory "${name}" updated successfully.`, 'success');
    } catch (error) {
      console.error('Error updating subcategory:', error);
      addToast('Failed to update subcategory. Please try again.', 'error');
    }
  }, [user, categories, closeModal, addToast]);

  const deleteSubcategory = useCallback((parentCategoryId: string, subcategoryId: string) => {
    const parentCategory = categories.find(cat => cat.id === parentCategoryId);
    const subcategory = parentCategory?.subcategories.find(sub => sub.id === subcategoryId);
    if (parentCategory && subcategory) {
      openModal({ type: 'deleteSubcategory', parentCategoryId, subcategory, parentCategoryName: parentCategory.name });
    }
  }, [categories, openModal]);

  const confirmDeleteSubcategory = useCallback(async (parentCategoryId: string, subcategoryId: string) => {
    if (!user?.uid) return;

    const parentCategory = categories.find(cat => cat.id === parentCategoryId);
    const subcategoryToDelete = parentCategory?.subcategories.find(sub => sub.id === subcategoryId);
    if (!parentCategory || !subcategoryToDelete) return;

    try {
      const updatedSubcategories = parentCategory.subcategories.filter(sub => sub.id !== subcategoryId);

      await FirebaseDataManager.updateCategory(user.uid, parentCategoryId, {
        subcategories: updatedSubcategories
      });

      // Real-time listener will update the state automatically
      addToast(`Subcategory "${subcategoryToDelete.name}" from "${parentCategory.name}" deleted.`, 'success');
      closeModal();
    } catch (error) {
      console.error('Error deleting subcategory:', error);
      addToast('Failed to delete subcategory. Please try again.', 'error');
    }
  }, [user, categories, addToast, closeModal]);

  const toggleSubcategoryComplete = useCallback(async (parentCategoryId: string, subcategoryId: string) => {
    if (!user?.uid) return;

    try {
      const parentCategory = categories.find(cat => cat.id === parentCategoryId);
      if (!parentCategory) return;

      const updatedSubcategories = parentCategory.subcategories.map(sub =>
        sub.id === subcategoryId ? { ...sub, isComplete: !sub.isComplete } : sub
      );

      await FirebaseDataManager.updateCategory(user.uid, parentCategoryId, {
        subcategories: updatedSubcategories
      });

      // Real-time listener will update the state automatically
    } catch (error) {
      console.error('Error toggling subcategory completion:', error);
      addToast('Failed to update subcategory. Please try again.', 'error');
    }
  }, [user, categories, addToast]);
  
  // Budget data update handlers
  const handleTotalIncomeChange = useCallback(async (income: number) => {
    if (!user?.uid) return;

    try {
      await FirebaseDataManager.updateBudgetData(user.uid, { totalIncome: income });
      setTotalIncome(income);
      setIsIncomeHidden(true);
    } catch (error) {
      console.error('Error updating total income:', error);
      addToast('Failed to update income. Please try again.', 'error');
    }
  }, [user, addToast]);

  const toggleIncomeHidden = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const newHiddenState = !isIncomeHidden;
      await FirebaseDataManager.updateBudgetData(user.uid, { isIncomeHidden: newHiddenState });
      setIsIncomeHidden(newHiddenState);
    } catch (error) {
      console.error('Error toggling income visibility:', error);
      addToast('Failed to update income visibility. Please try again.', 'error');
    }
  }, [user, isIncomeHidden, addToast]);

  const handleCurrencyChange = useCallback(async (currencyCode: string) => {
    if (!user?.uid) return;

    try {
      await FirebaseDataManager.updateBudgetData(user.uid, { selectedCurrency: currencyCode });
      setSelectedCurrency(currencyCode);
    } catch (error) {
      console.error('Error updating currency:', error);
      addToast('Failed to update currency. Please try again.', 'error');
    }
  }, [user, addToast]);

  const toggleGlobalAmountsHidden = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const newHiddenState = !areGlobalAmountsHidden;
      await FirebaseDataManager.updateBudgetData(user.uid, { areGlobalAmountsHidden: newHiddenState });
      setAreGlobalAmountsHidden(newHiddenState);
    } catch (error) {
      console.error('Error toggling global amounts visibility:', error);
      addToast('Failed to update visibility settings. Please try again.', 'error');
    }
  }, [user, areGlobalAmountsHidden, addToast]);

  const saveMonthlyBudget = useCallback(async (budget: MonthlyBudget) => {
    if (!user?.uid) return;

    try {
      // Check if budget already exists
      const existingBudget = monthlyBudgets.find(b => b.month === budget.month);

      if (existingBudget) {
        await FirebaseDataManager.updateMonthlyBudget(user.uid, existingBudget.id, budget);
      } else {
        await FirebaseDataManager.addMonthlyBudget(user.uid, budget);
      }

      // Optimistically update local state
      setMonthlyBudgets(prev => [budget, ...prev.filter(b => b.month !== budget.month)]);
      addToast(`Budget for ${budget.month} has been saved.`, 'success');
    } catch (error) {
      console.error('Error saving monthly budget:', error);
      addToast('Failed to save monthly budget. Please try again.', 'error');
    }
  }, [user, monthlyBudgets, addToast]);

  const restoreBudgetFromHistory = useCallback(async (budget: MonthlyBudget) => {
    if (!user?.uid) return;

    try {
      // Update budget data
      await FirebaseDataManager.updateBudgetData(user.uid, { totalIncome: budget.totalIncome });

      // Clear existing categories and add new ones
      const existingCategories = await FirebaseDataManager.getCategories(user.uid);
      for (const category of existingCategories) {
        await FirebaseDataManager.deleteCategory(user.uid, category.id);
      }

      // Add categories from budget
      for (const category of budget.categories) {
        await FirebaseDataManager.addCategory(user.uid, {
          name: category.name,
          allocatedAmount: category.allocatedAmount,
          spentAmount: category.spentAmount || 0,
          subcategories: category.subcategories,
          isAmountHidden: category.isAmountHidden || false
        });
      }

      // Update local state
      setCategories(budget.categories);
      setTotalIncome(budget.totalIncome);
      addToast(`Budget from ${budget.month} has been restored.`, 'success');
    } catch (error) {
      console.error('Error restoring budget from history:', error);
      addToast('Failed to restore budget. Please try again.', 'error');
    }
  }, [user, addToast]);

  const totalAllocated = useMemo(() => categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0), [categories]);
  const unallocatedAmount = useMemo(() => totalIncome - totalAllocated, [totalIncome, totalAllocated]);

  const categoryFormProps = useMemo((): CategoryFormProps | null => {
    if (modalState?.type === 'addCategory') return { onSubmit: (name: string, amount: number) => addCategory(name, amount), onClose: closeModal, maxAllocatableAmount: unallocatedAmount, selectedCurrency };
    if (modalState?.type === 'editCategory') {
      const { category } = modalState;
      const allocatedToOther = totalAllocated - category.allocatedAmount;
      return { onSubmit: (name: string, amount: number) => editCategory(category.id, name, amount), onClose: closeModal, existingCategory: category, maxAllocatableAmount: totalIncome - allocatedToOther, minAllocatableAmountForEdit: category.subcategories.reduce((s,c) => s + c.allocatedAmount, 0), selectedCurrency };
    }
    return null;
  }, [modalState, addCategory, closeModal, unallocatedAmount, selectedCurrency, totalAllocated, totalIncome, editCategory]);

  const subcategoryFormProps = useMemo((): SubcategoryFormProps | null => {
    if (modalState?.type === 'addSubcategory' || modalState?.type === 'editSubcategory') {
      const parent = categories.find(c => c.id === modalState.parentCategoryId);
      if (!parent) return null;
      const allocatedToOtherSubs = parent.subcategories.filter(s => modalState.type !== 'editSubcategory' || s.id !== modalState.subcategory.id).reduce((sum, s) => sum + s.allocatedAmount, 0);
      const maxAllocatable = parent.allocatedAmount - allocatedToOtherSubs;
      if (modalState.type === 'addSubcategory') return { onSubmit: (name: string, amount: number) => addSubcategory(parent.id, name, amount), onClose: closeModal, parentCategoryName: parent.name, maxAllocatableAmount: maxAllocatable, selectedCurrency };
      return { onSubmit: (name: string, amount: number) => editSubcategory(parent.id, modalState.subcategory.id, name, amount), onClose: closeModal, existingSubcategory: modalState.subcategory, parentCategoryName: parent.name, maxAllocatableAmount: maxAllocatable, selectedCurrency };
    }
    return null;
  }, [modalState, categories, addSubcategory, editSubcategory, closeModal, selectedCurrency]);

  // Show loading spinner during initial load, migration, or auth loading
  if (authLoading || isLoading || isMigrating) {
    return (
      <div className="h-screen bg-slate-900 text-white flex flex-col items-center justify-center">
        <LoadingSpinner />
        <div className="mt-4 text-center">
          {isMigrating ? (
            <>
              <h2 className="text-xl font-semibold mb-2">Migrating Your Data</h2>
              {migrationProgress && (
                <div className="max-w-md">
                  <p className="text-sm text-gray-300 mb-2">{migrationProgress.message}</p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${migrationProgress.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{migrationProgress.progress}% complete</p>
                </div>
              )}
            </>
          ) : (
            <h2 className="text-xl font-semibold">Loading Your Budget Data...</h2>
          )}
        </div>
      </div>
    );
  }

  const getModalTitle = (): string => {
    if (!modalState) return '';
    switch (modalState.type) {
      case 'addCategory': return 'Add New Category';
      case 'editCategory': return `Edit ${modalState.category.name}`;
      case 'addSubcategory':
        const parentAdd = categories.find(c => c.id === modalState.parentCategoryId);
        return `Add to ${parentAdd?.name || 'Category'}`;
      case 'editSubcategory':
        const parentEdit = categories.find(c => c.id === modalState.parentCategoryId);
        return `Edit ${modalState.subcategory.name} in ${parentEdit?.name || 'Category'}`;
      default: return '';
    }
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'categories':
        return <CategoryManager
          categories={categories}
          onAddCategory={() => openModal({ type: 'addCategory' })}
          onEditCategory={(cat) => openModal({ type: 'editCategory', category: cat })}
          onDeleteCategory={deleteCategory}
          onAddSubcategory={(parentId) => openModal({ type: 'addSubcategory', parentCategoryId: parentId })}
          onEditSubcategory={(parentCategoryId, sub) => openModal({ type: 'editSubcategory', parentCategoryId, subcategory: sub })}
          onDeleteSubcategory={deleteSubcategory}
          onToggleSubcategoryComplete={toggleSubcategoryComplete}
          onToggleCategoryAmountHidden={toggleCategoryAmountHidden}
          formatCurrency={formatCurrency}
          areGlobalAmountsHidden={areGlobalAmountsHidden}
          totalIncome={totalIncome}
          unallocatedAmount={unallocatedAmount}
        />;
      case 'reports': return <Reports categories={categories} transactions={transactions} totalIncome={totalIncome} formatCurrency={formatCurrency} selectedCurrency={selectedCurrency} />;
      case 'planning': return <BudgetPlanning 
          monthlyBudgets={monthlyBudgets} 
          onMonthlyBudgetsChange={setMonthlyBudgets} 
          currentCategories={categories} 
          userId={user?.uid ?? ''}
          totalIncome={totalIncome}
          onTotalIncomeChange={handleTotalIncomeChange}
          totalAllocated={totalAllocated}
          unallocatedAmount={unallocatedAmount}
          selectedCurrency={selectedCurrency}
          onCurrencyChange={handleCurrencyChange}
          areGlobalAmountsHidden={areGlobalAmountsHidden}
          onToggleGlobalAmountsHidden={toggleGlobalAmountsHidden}
          formatCurrency={formatCurrency}
          isIncomeHidden={isIncomeHidden}
          onToggleIncomeHidden={toggleIncomeHidden}
        />;
      case 'history': return <BudgetHistory monthlyBudgets={monthlyBudgets} allTransactions={transactions} formatCurrency={formatCurrency} selectedCurrency={selectedCurrency} />;
      case 'savings': return <SavingsCalculator />;
      default: return <Dashboard 
          totalIncome={totalIncome}
          totalAllocated={totalAllocated}
          unallocatedAmount={unallocatedAmount}
          formatCurrency={formatCurrency} 
          categories={categories} 
          onAddCategory={() => openModal({ type: 'addCategory' })}
          onNavigateToSection={handleSectionChange}
        />;
    }
  };


  
  return (
    <div className="h-screen bg-slate-900 text-white flex flex-col">
      <Navbar currentSection={currentSection} onSectionChange={handleSectionChange} onNewCategory={() => openModal({ type: 'addCategory' })} />
      <main className={`flex-grow ${currentSection === 'savings' ? 'flex' : 'overflow-y-auto p-4 md:p-6 lg:p-8 pt-20'}`}>
        {renderCurrentSection()}
      </main>
      <Toaster />

      <Modal isOpen={!!modalState && (modalState.type === 'addCategory' || modalState.type === 'editCategory' || modalState.type === 'addSubcategory' || modalState.type === 'editSubcategory')} onClose={closeModal} title={getModalTitle()}>
        {(modalState?.type === 'addCategory' || modalState?.type === 'editCategory') && categoryFormProps && <CategoryForm {...categoryFormProps} />}
        {(modalState?.type === 'addSubcategory' || modalState?.type === 'editSubcategory') && subcategoryFormProps && <SubcategoryForm {...subcategoryFormProps} />}
      </Modal>

      {modalState?.type === 'deleteCategory' && (
        <ConfirmationModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={() => confirmDeleteCategory(modalState.category.id)}
          title={`Delete ${modalState.category.name}?`}
          message={`Are you sure you want to delete the category "${modalState.category.name}"? This action cannot be undone.`}
        />
      )}

      {modalState?.type === 'deleteSubcategory' && (
        <ConfirmationModal
          isOpen={true}
          onClose={closeModal}
          onConfirm={() => confirmDeleteSubcategory(modalState.parentCategoryId, modalState.subcategory.id)}
          title={`Delete ${modalState.subcategory.name}?`}
          message={`Are you sure you want to delete the subcategory "${modalState.subcategory.name}" from "${modalState.parentCategoryName}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

const App: React.FC = () => (
  <MedianBridge>
    <AuthProvider>
      <ToastProvider>
        <ErrorBoundary>
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        </ErrorBoundary>
      </ToastProvider>
    </AuthProvider>
  </MedianBridge>
);

export default App;
