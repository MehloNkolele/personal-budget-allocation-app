import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Category, Subcategory, Transaction, ModalType, CategoryFormPropsNew, CategoryFormPropsEdit, SubcategoryFormPropsNew, SubcategoryFormPropsEdit, MonthlyBudget } from './types';
import Dashboard from './components/Dashboard';
import CategoryManager from './components/CategoryManager';
import Reports from './components/Reports';
import BudgetPlanning from './components/BudgetPlanning';
import BudgetHistory from './components/BudgetHistory';
import Modal from './components/Modal';
import CategoryForm from './components/CategoryForm';
import SubcategoryForm from './components/SubcategoryForm';
import TransactionForm from './components/TransactionForm';
import ConfirmationModal from './components/ConfirmationModal';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { CURRENCIES } from './constants';
import { ToastProvider } from './contexts/ToastContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { useToast } from './hooks/useToast';
import { useNotifications } from './hooks/useNotifications';
import Toaster from './components/Toaster';
import { UserDataManager } from './utils/userDataManager';

const AppContent: React.FC = () => {
  const { addToast, clearAllToasts } = useToast();
  const { generateBudgetNotifications } = useNotifications();
  const { user } = useAuth();
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalState, setModalState] = useState<ModalType>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(CURRENCIES[0].code);
  const [areGlobalAmountsHidden, setAreGlobalAmountsHidden] = useState<boolean>(false);
  const [isIncomeHidden, setIsIncomeHidden] = useState<boolean>(true);
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'categories' | 'reports' | 'planning' | 'history'>('dashboard');
  const [isTransactionFormOpen, setIsTransactionFormOpen] = useState<boolean>(false);
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  // Add event listener for beforeunload to hide income when app is closed
  useEffect(() => {
    const handleAppClose = () => {
      // Hide income when app is about to close
      setIsIncomeHidden(true);
      // Need to save immediately since the app is closing
      if (user?.uid) {
        const userData = UserDataManager.loadUserData(user.uid);
        UserDataManager.saveUserData(user.uid, {
          ...userData,
          isIncomeHidden: true
        });
      }
    };

    // Add event listener for page unload (app closing)
    window.addEventListener('beforeunload', handleAppClose);
    
    // Cleanup the event listener
    return () => {
      window.removeEventListener('beforeunload', handleAppClose);
    };
  }, [user?.uid]);

  // Load user-specific data when user changes
  useEffect(() => {
    if (user?.uid) {
      try {
        // Try to migrate old global data first
        const migrationSuccessful = UserDataManager.migrateGlobalDataToUser(user.uid);
        if (migrationSuccessful) {
          addToast('Your existing data has been migrated to your personal account!', 'success');
        }

        const userData = UserDataManager.loadUserData(user.uid);
        setTotalIncome(userData.totalIncome);
        setCategories(userData.categories);
        setTransactions(userData.transactions);
        setSelectedCurrency(userData.selectedCurrency);
        setAreGlobalAmountsHidden(userData.areGlobalAmountsHidden);
        setIsIncomeHidden(userData.isIncomeHidden);
        setMonthlyBudgets(userData.monthlyBudgets);
        setIsDataLoaded(true);

        // Show welcome message for new users (only if no migration occurred)
        if (!migrationSuccessful && !UserDataManager.hasUserData(user.uid)) {
          addToast(`Welcome ${user.displayName || user.email}! Your data is now isolated and secure.`, 'info');
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        addToast("Error loading your data. Please try refreshing the page.", 'error');
      }
    } else {
      // Reset state when no user is logged in
      setTotalIncome(0);
      setCategories([]);
      setTransactions([]);
      setSelectedCurrency(CURRENCIES[0].code);
      setAreGlobalAmountsHidden(false);
      setIsIncomeHidden(true);
      setMonthlyBudgets([]);
      setIsDataLoaded(false);
    }
  }, [user?.uid, addToast]);

  // Save user-specific data when it changes (only if user is logged in and data is loaded)
  useEffect(() => {
    if (user?.uid && isDataLoaded) {
      UserDataManager.saveTotalIncome(user.uid, totalIncome);
    }
  }, [user?.uid, totalIncome, isDataLoaded]);

  useEffect(() => {
    if (user?.uid && isDataLoaded) {
      UserDataManager.saveCategories(user.uid, categories);
    }
  }, [user?.uid, categories, isDataLoaded]);

  useEffect(() => {
    if (user?.uid && isDataLoaded) {
      UserDataManager.saveTransactions(user.uid, transactions);
    }
  }, [user?.uid, transactions, isDataLoaded]);

  useEffect(() => {
    if (user?.uid && isDataLoaded) {
      UserDataManager.saveSelectedCurrency(user.uid, selectedCurrency);
    }
  }, [user?.uid, selectedCurrency, isDataLoaded]);

  useEffect(() => {
    if (user?.uid && isDataLoaded) {
      UserDataManager.saveGlobalAmountsHidden(user.uid, areGlobalAmountsHidden);
    }
  }, [user?.uid, areGlobalAmountsHidden, isDataLoaded]);

  useEffect(() => {
    if (user?.uid && isDataLoaded) {
      UserDataManager.saveIsIncomeHidden(user.uid, isIncomeHidden);
    }
  }, [user?.uid, isIncomeHidden, isDataLoaded]);

  useEffect(() => {
    if (user?.uid && isDataLoaded) {
      UserDataManager.saveMonthlyBudgets(user.uid, monthlyBudgets);
    }
  }, [user?.uid, monthlyBudgets, isDataLoaded]);

  // Generate notifications when budget data changes
  useEffect(() => {
    if (categories.length > 0 || transactions.length > 0) {
      generateBudgetNotifications(categories, transactions, totalIncome);
    }
  }, [categories, transactions, totalIncome, generateBudgetNotifications]);

  const handleTotalIncomeChange = useCallback((income: number) => { 
    setTotalIncome(income); 
    // Auto-hide income after it's changed
    setIsIncomeHidden(true);
  }, []);
  
  const toggleIncomeHidden = useCallback(() => {
    setIsIncomeHidden(prev => !prev);
  }, []);

  const handleCurrencyChange = useCallback((currencyCode: string) => { setSelectedCurrency(currencyCode); }, []);
  const toggleGlobalAmountsHidden = useCallback(() => { setAreGlobalAmountsHidden(prev => !prev); }, []);

  const addCategory = useCallback((name: string, allocatedAmount: number) => {
    const newCategory: Category = { id: Date.now().toString(), name, allocatedAmount, subcategories: [], isAmountHidden: false };
    setCategories((prev) => [...prev, newCategory]);
    setModalState(null);
  }, []);

  const editCategory = useCallback((categoryId: string, name: string, allocatedAmount: number) => {
    setCategories((prev) => prev.map((cat) => cat.id === categoryId ? { ...cat, name, allocatedAmount } : cat));
    setModalState(null);
  }, []);

  const deleteCategory = useCallback((categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) {
      console.warn("Category to delete not found:", categoryId);
      return;
    }

    setModalState({ type: 'deleteCategory', category: categoryToDelete });
  }, [categories]);

  const confirmDeleteCategory = useCallback((categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) {
      console.warn("Category to delete not found:", categoryId);
      return;
    }

    const amountInCompletedSubcategories = categoryToDelete.subcategories
      .filter(sub => sub.isComplete)
      .reduce((sum, sub) => sum + sub.allocatedAmount, 0);

    // Adjust total income: money from completed subcategories is "spent"
    setTotalIncome(prevIncome => Math.max(0, prevIncome - amountInCompletedSubcategories));

    setCategories(prevCategories => prevCategories.filter(cat => cat.id !== categoryId));

    addToast(`Category "${categoryToDelete.name}" has been deleted successfully.`, 'success');
  }, [categories, addToast]);

  const toggleCategoryAmountHidden = useCallback((categoryId: string) => {
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, isAmountHidden: !cat.isAmountHidden } : cat));
  }, []);

  const addSubcategory = useCallback((parentCategoryId: string, name: string, allocatedAmount: number) => {
    const newSubcategory: Subcategory = { id: Date.now().toString(), name, allocatedAmount, isComplete: false };
    setCategories((prev) => prev.map((cat) => cat.id === parentCategoryId ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] } : cat));
    setModalState(null);
  }, []);

  const editSubcategory = useCallback((parentCategoryId: string, subcategoryId: string, name: string, allocatedAmount: number) => {
    setCategories((prev) => prev.map((cat) => cat.id === parentCategoryId ? { ...cat, subcategories: cat.subcategories.map((sub) => sub.id === subcategoryId ? { ...sub, name, allocatedAmount } : sub) } : cat));
    setModalState(null);
  }, []);

  const deleteSubcategory = useCallback((parentCategoryId: string, subcategoryId: string) => {
    const parentCategory = categories.find(cat => cat.id === parentCategoryId);
    if (!parentCategory) {
      console.warn("Parent category not found for subcategory deletion:", parentCategoryId);
      return;
    }
    const subcategoryToDelete = parentCategory.subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategoryToDelete) {
      console.warn("Subcategory to delete not found:", subcategoryId, "in parent:", parentCategoryId);
      return;
    }

    setModalState({
      type: 'deleteSubcategory',
      parentCategoryId,
      subcategory: subcategoryToDelete,
      parentCategoryName: parentCategory.name
    });
  }, [categories]);

  const confirmDeleteSubcategory = useCallback((parentCategoryId: string, subcategoryId: string) => {
    const parentCategory = categories.find(cat => cat.id === parentCategoryId);
    if (!parentCategory) {
      console.warn("Parent category not found for subcategory deletion:", parentCategoryId);
      return;
    }
    const subcategoryToDelete = parentCategory.subcategories.find(sub => sub.id === subcategoryId);
    if (!subcategoryToDelete) {
      console.warn("Subcategory to delete not found:", subcategoryId, "in parent:", parentCategoryId);
      return;
    }

    setCategories(prevCategories =>
      prevCategories.map(cat => {
        if (cat.id === parentCategoryId) {
          let newParentAllocatedAmount = cat.allocatedAmount;
          // If the subcategory was completed, its amount is "spent" and should be
          // deducted from the parent category's allocated amount.
          if (subcategoryToDelete.isComplete) {
            newParentAllocatedAmount -= subcategoryToDelete.allocatedAmount;
          }
          // If not complete, its amount is simply freed up within the parent (no change to parent's allocatedAmount here).

          const updatedSubcategories = cat.subcategories.filter(sub => sub.id !== subcategoryId);

          return {
            ...cat,
            allocatedAmount: Math.max(0, newParentAllocatedAmount), // Ensure parent allocation doesn't go negative
            subcategories: updatedSubcategories,
          };
        }
        return cat;
      })
    );

    addToast(`Subcategory "${subcategoryToDelete.name}" has been deleted successfully.`, 'success');
  }, [categories, addToast]);


  const toggleSubcategoryComplete = useCallback((parentCategoryId: string, subcategoryId: string) => {
    setCategories(prev => prev.map(cat => cat.id === parentCategoryId ? { ...cat, subcategories: cat.subcategories.map(sub => sub.id === subcategoryId ? { ...sub, isComplete: !sub.isComplete } : sub) } : cat));
  }, []);

  // Transaction Management Functions
  const addTransaction = useCallback((transactionData: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transactionData,
      id: Date.now().toString()
    };

    setTransactions(prev => [...prev, newTransaction]);

    // Update spending amounts for categories and subcategories
    if (transactionData.type === 'expense') {
      setCategories(prev => prev.map(cat => {
        if (cat.id === transactionData.categoryId) {
          const updatedCategory = {
            ...cat,
            spentAmount: (cat.spentAmount || 0) + transactionData.amount
          };

          if (transactionData.subcategoryId) {
            updatedCategory.subcategories = cat.subcategories.map(sub =>
              sub.id === transactionData.subcategoryId
                ? { ...sub, spentAmount: (sub.spentAmount || 0) + transactionData.amount }
                : sub
            );
          }

          return updatedCategory;
        }
        return cat;
      }));
    }

    addToast('Transaction added successfully!', 'success');
    setIsTransactionFormOpen(false);
  }, [addToast]);

  const openTransactionForm = useCallback(() => {
    setIsTransactionFormOpen(true);
  }, []);

  const closeTransactionForm = useCallback(() => {
    setIsTransactionFormOpen(false);
  }, []);

  const openAddCategoryModal = useCallback(() => setModalState({ type: 'addCategory' }), []);
  const openEditCategoryModal = useCallback((category: Category) => setModalState({ type: 'editCategory', category }), []);
  const openAddSubcategoryModal = useCallback((parentCategoryId: string) => setModalState({ type: 'addSubcategory', parentCategoryId }), []);
  const openEditSubcategoryModal = useCallback((parentCategoryId: string, subcategory: Subcategory) => setModalState({ type: 'editSubcategory', parentCategoryId, subcategory }), []);
  const closeModal = useCallback(() => setModalState(null), []);

  const totalAllocatedByCategories = useMemo(() => categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0), [categories]);
  const unallocatedAmountOverall = useMemo(() => totalIncome - totalAllocatedByCategories, [totalIncome, totalAllocatedByCategories]);

  const formatCurrency = useCallback((amount: number, isIndividualItemHidden?: boolean): string => {
    if (areGlobalAmountsHidden || isIndividualItemHidden) return '••••';
    try {
      return amount.toLocaleString(undefined, { style: 'currency', currency: selectedCurrency, minimumFractionDigits: 2, maximumFractionDigits: 2 });
    } catch (error) {
      console.warn(`Currency formatting error for ${selectedCurrency}. Falling back.`, error);
      return `${selectedCurrency} ${amount.toFixed(2)}`;
    }
  }, [selectedCurrency, areGlobalAmountsHidden]);

  const formatCurrencyWithVisibility = useCallback((amount: number, isIndividualItemHidden?: boolean): string => {
    if (isIncomeHidden || isIndividualItemHidden) return '••••';
    return formatCurrency(amount, isIndividualItemHidden);
  }, [formatCurrency, isIncomeHidden]);

  const getParentCategoryNameForModal = () => {
    if(modalState?.type === 'addSubcategory' || modalState?.type === 'editSubcategory'){
      return categories.find(c => c.id === modalState.parentCategoryId)?.name;
    }
    return undefined;
  }

  // Props for forms, including validation limits
  const categoryFormProps = useMemo((): CategoryFormPropsNew | CategoryFormPropsEdit | null => {
    if (modalState?.type === 'addCategory') {
      return {
        onSubmit: addCategory,
        onClose: closeModal,
        maxAllocatableAmount: Math.max(0, unallocatedAmountOverall),
        selectedCurrency,
        existingCategory: null,
      };
    }
    if (modalState?.type === 'editCategory') {
      const { category } = modalState;
      const allocatedToOtherCategories = categories
        .filter(c => c.id !== category.id)
        .reduce((sum, c) => sum + c.allocatedAmount, 0);
      const maxBasedOnIncome = totalIncome - allocatedToOtherCategories;
      const minBasedOnSubcategories = category.subcategories.reduce((sum, s) => sum + s.allocatedAmount, 0);
      return {
        onSubmit: (name, amount) => editCategory(category.id, name, amount),
        onClose: closeModal,
        existingCategory: category,
        maxAllocatableAmount: Math.max(0, maxBasedOnIncome),
        minAllocatableAmountForEdit: minBasedOnSubcategories,
        selectedCurrency,
      };
    }
    return null;
  }, [modalState, addCategory, closeModal, unallocatedAmountOverall, selectedCurrency, categories, totalIncome, editCategory]);

  const subcategoryFormProps = useMemo((): SubcategoryFormPropsNew | SubcategoryFormPropsEdit | null => {
    if (modalState?.type === 'addSubcategory' || modalState?.type === 'editSubcategory') {
      const parentCategory = categories.find(c => c.id === modalState.parentCategoryId);
      if (!parentCategory) return null;
      
      const allocatedToOtherSubcategories = parentCategory.subcategories
        .filter(s => modalState.type === 'editSubcategory' ? s.id !== modalState.subcategory.id : true)
        .reduce((sum, s) => sum + s.allocatedAmount, 0);
      
      const maxAllocatableForSub = parentCategory.allocatedAmount - allocatedToOtherSubcategories;

      if (modalState.type === 'addSubcategory') {
        return {
            onSubmit: (name, amount) => addSubcategory(modalState.parentCategoryId, name, amount),
            onClose: closeModal,
            parentCategoryName: parentCategory.name,
            maxAllocatableAmount: Math.max(0, maxAllocatableForSub),
            selectedCurrency,
            existingSubcategory: null,
        };
      }
      // type === 'editSubcategory'
      return {
         onSubmit: (name, amount) => editSubcategory(modalState.parentCategoryId, modalState.subcategory.id, name, amount),
         onClose: closeModal,
         existingSubcategory: modalState.subcategory,
         parentCategoryName: parentCategory.name,
         maxAllocatableAmount: Math.max(0, maxAllocatableForSub),
         selectedCurrency,
      };
    }
    return null;
  }, [modalState, categories, addSubcategory, editSubcategory, closeModal, selectedCurrency]);


  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'dashboard':
        return (
          <Dashboard
            totalIncome={totalIncome}
            onTotalIncomeChange={handleTotalIncomeChange}
            totalAllocated={totalAllocatedByCategories}
            unallocatedAmount={unallocatedAmountOverall}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={handleCurrencyChange}
            areGlobalAmountsHidden={areGlobalAmountsHidden}
            onToggleGlobalAmountsHidden={toggleGlobalAmountsHidden}
            formatCurrency={formatCurrencyWithVisibility}
            categories={categories}
            onAddCategory={openAddCategoryModal}
            isIncomeHidden={isIncomeHidden}
            onToggleIncomeHidden={toggleIncomeHidden}
          />
        );
      case 'categories':
        return (
          <CategoryManager
            categories={categories}
            onAddCategory={openAddCategoryModal}
            onEditCategory={openEditCategoryModal}
            onDeleteCategory={deleteCategory}
            onAddSubcategory={openAddSubcategoryModal}
            onEditSubcategory={openEditSubcategoryModal}
            onDeleteSubcategory={deleteSubcategory}
            onToggleCategoryAmountHidden={toggleCategoryAmountHidden}
            onToggleSubcategoryComplete={toggleSubcategoryComplete}
            formatCurrency={formatCurrency}
            areGlobalAmountsHidden={areGlobalAmountsHidden}
          />
        );
      case 'planning':
        return (
          <BudgetPlanning
            monthlyBudgets={monthlyBudgets}
            onMonthlyBudgetsChange={setMonthlyBudgets}
            currentCategories={categories}
            currentIncome={totalIncome}
            formatCurrency={formatCurrency}
            selectedCurrency={selectedCurrency}
            userId={user?.uid || ''}
          />
        );
      case 'history':
        return (
          <BudgetHistory
            monthlyBudgets={monthlyBudgets}
            allTransactions={transactions}
            formatCurrency={formatCurrency}
            selectedCurrency={selectedCurrency}
          />
        );
      case 'reports':
        return (
          <Reports
            categories={categories}
            transactions={transactions}
            totalIncome={totalIncome}
            formatCurrency={formatCurrency}
            selectedCurrency={selectedCurrency}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <Toaster />

      {/* Enhanced Navbar */}
      <Navbar
        onAddCategory={openAddCategoryModal}
        onAddTransaction={openTransactionForm}
        currentSection={currentSection}
        onSectionChange={setCurrentSection}
      />

      {/* Main Content */}
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        {renderCurrentSection()}
        
        <Modal
          isOpen={modalState !== null && modalState.type !== 'deleteCategory' && modalState.type !== 'deleteSubcategory'}
          onClose={closeModal}
          title={
            modalState?.type === 'addCategory' ? 'Add New Category' :
            modalState?.type === 'editCategory' ? `Edit Category: ${modalState.category.name}` :
            modalState?.type === 'addSubcategory' ? `Add Subcategory to ${getParentCategoryNameForModal() || 'Category'}` :
            modalState?.type === 'editSubcategory' ? `Edit Subcategory: ${modalState.subcategory.name}` : ''
          }
        >
          {modalState?.type === 'addCategory' && categoryFormProps && <CategoryForm {...categoryFormProps as CategoryFormPropsNew} />}
          {modalState?.type === 'editCategory' && categoryFormProps && <CategoryForm {...categoryFormProps as CategoryFormPropsEdit} />}
          {modalState?.type === 'addSubcategory' && subcategoryFormProps && <SubcategoryForm {...subcategoryFormProps as SubcategoryFormPropsNew} />}
          {modalState?.type === 'editSubcategory' && subcategoryFormProps && <SubcategoryForm {...subcategoryFormProps as SubcategoryFormPropsEdit} />}
        </Modal>

        <ConfirmationModal
          isOpen={modalState?.type === 'deleteCategory'}
          onClose={closeModal}
          onConfirm={() => modalState?.type === 'deleteCategory' && confirmDeleteCategory(modalState.category.id)}
          title="Delete Category"
          message={
            modalState?.type === 'deleteCategory'
              ? `Are you sure you want to delete the category "${modalState.category.name}" and all its subcategories? This action cannot be undone.`
              : ''
          }
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />

        <ConfirmationModal
          isOpen={modalState?.type === 'deleteSubcategory'}
          onClose={closeModal}
          onConfirm={() => modalState?.type === 'deleteSubcategory' && confirmDeleteSubcategory(modalState.parentCategoryId, modalState.subcategory.id)}
          title="Delete Subcategory"
          message={
            modalState?.type === 'deleteSubcategory'
              ? `Are you sure you want to delete the subcategory "${modalState.subcategory.name}" from "${modalState.parentCategoryName}"? This action cannot be undone.`
              : ''
          }
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
        />

        {/* Transaction Form */}
        <TransactionForm
          isOpen={isTransactionFormOpen}
          onClose={closeTransactionForm}
          onSubmit={addTransaction}
          categories={categories}
          selectedCurrency={selectedCurrency}
        />
      </main>


    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationProvider>
          <ProtectedRoute>
            <AppContent />
          </ProtectedRoute>
        </NotificationProvider>
      </ToastProvider>
    </AuthProvider>
  );
};

export default App;
