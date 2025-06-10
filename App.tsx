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
import Toaster from './components/Toaster';
import { UserDataManager } from './utils/userDataManager';

const AppContent: React.FC = () => {
  const { addToast } = useToast();
  const { user } = useAuth();
  const [totalIncome, setTotalIncome] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [modalState, setModalState] = useState<ModalType>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<string>(CURRENCIES[0].code);
  const [areGlobalAmountsHidden, setAreGlobalAmountsHidden] = useState<boolean>(false);
  const [isIncomeHidden, setIsIncomeHidden] = useState<boolean>(true);
  const [monthlyBudgets, setMonthlyBudgets] = useState<MonthlyBudget[]>([]);
  const [currentSection, setCurrentSection] = useState<'dashboard' | 'categories' | 'reports' | 'planning' | 'history' | 'savings'>('dashboard');
  const [isDataLoaded, setIsDataLoaded] = useState<boolean>(false);

  useEffect(() => {
    const handleAppClose = () => {
      if (user?.uid) {
        const userData = UserDataManager.loadUserData(user.uid);
        UserDataManager.saveUserData(user.uid, { ...userData, isIncomeHidden: true });
      }
    };
    window.addEventListener('beforeunload', handleAppClose);
    return () => window.removeEventListener('beforeunload', handleAppClose);
  }, [user]);

  useEffect(() => {
    if (user) {
      try {
        const migrationSuccessful = UserDataManager.migrateGlobalDataToUser(user.uid);
        if (migrationSuccessful) addToast('Your existing data has been migrated to your personal account!', 'success');
        
        const userData = UserDataManager.loadUserData(user.uid);
        setTotalIncome(userData.totalIncome || 0);
        setCategories(userData.categories || []);
        setTransactions(userData.transactions || []);
        setSelectedCurrency(userData.selectedCurrency || CURRENCIES[0].code);
        setAreGlobalAmountsHidden(userData.areGlobalAmountsHidden || false);
        setIsIncomeHidden(userData.isIncomeHidden === undefined ? true : userData.isIncomeHidden);
        setMonthlyBudgets(userData.monthlyBudgets || []);
        setIsDataLoaded(true);
      } catch (error) {
        console.error("Error loading user data:", error);
        addToast("Error loading your data. Please try refreshing the page.", 'error');
      }
    } else {
      setTotalIncome(0);
      setCategories([]);
      setTransactions([]);
      setSelectedCurrency(CURRENCIES[0].code);
      setAreGlobalAmountsHidden(false);
      setIsIncomeHidden(true);
      setMonthlyBudgets([]);
      setIsDataLoaded(false);
    }
  }, [user, addToast]);
  
  useEffect(() => { 
    if (user && isDataLoaded) {
      UserDataManager.saveUserData(user.uid, { totalIncome, categories, transactions, selectedCurrency, areGlobalAmountsHidden, isIncomeHidden, monthlyBudgets }); 
    }
  }, [user, isDataLoaded, totalIncome, categories, transactions, selectedCurrency, areGlobalAmountsHidden, isIncomeHidden, monthlyBudgets]);

  const handleSectionChange = useCallback((section: 'dashboard' | 'categories' | 'reports' | 'planning' | 'history' | 'savings') => setCurrentSection(section), []);
  const handleTotalIncomeChange = useCallback((income: number) => { setTotalIncome(income); setIsIncomeHidden(true); }, []);
  const toggleIncomeHidden = useCallback(() => setIsIncomeHidden(prev => !prev), []);
  const handleCurrencyChange = useCallback((currencyCode: string) => setSelectedCurrency(currencyCode), []);
  const toggleGlobalAmountsHidden = useCallback(() => setAreGlobalAmountsHidden(prev => !prev), []);
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

  const addCategory = useCallback((name: string, allocatedAmount: number) => {
    const newCategory: Category = { id: Date.now().toString(), name, allocatedAmount, subcategories: [], isAmountHidden: false };
    setCategories(prev => [...prev, newCategory]);
    closeModal();
  }, [closeModal]);

  const editCategory = useCallback((categoryId: string, name: string, allocatedAmount: number) => {
    setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, name, allocatedAmount } : cat));
    closeModal();
  }, [closeModal]);

  const deleteCategory = useCallback((categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    if (category) openModal({ type: 'deleteCategory', category });
  }, [categories, openModal]);

  const confirmDeleteCategory = useCallback((categoryId: string) => {
    const categoryToDelete = categories.find(cat => cat.id === categoryId);
    if (!categoryToDelete) return;

    setTotalIncome(prevIncome => Math.max(0, prevIncome - categoryToDelete.subcategories.filter(sub => sub.isComplete).reduce((sum, sub) => sum + sub.allocatedAmount, 0)));
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
    addToast(`Category "${categoryToDelete.name}" deleted.`, 'success');
    closeModal();
  }, [categories, addToast, closeModal]);

  const toggleCategoryAmountHidden = useCallback((categoryId: string) => setCategories(prev => prev.map(cat => cat.id === categoryId ? { ...cat, isAmountHidden: !cat.isAmountHidden } : cat)), []);

  const addSubcategory = useCallback((parentCategoryId: string, name: string, allocatedAmount: number) => {
    const newSubcategory: Subcategory = { id: Date.now().toString(), name, allocatedAmount, isComplete: false };
    setCategories(prev => prev.map(cat => cat.id === parentCategoryId ? { ...cat, subcategories: [...cat.subcategories, newSubcategory] } : cat));
    closeModal();
  }, [closeModal]);

  const editSubcategory = useCallback((parentCategoryId: string, subcategoryId: string, name: string, allocatedAmount: number) => {
    setCategories(prev => prev.map(cat => cat.id === parentCategoryId ? { ...cat, subcategories: cat.subcategories.map(sub => sub.id === subcategoryId ? { ...sub, name, allocatedAmount } : sub) } : cat));
    closeModal();
  }, [closeModal]);

  const deleteSubcategory = useCallback((parentCategoryId: string, subcategoryId: string) => {
    const parentCategory = categories.find(cat => cat.id === parentCategoryId);
    const subcategory = parentCategory?.subcategories.find(sub => sub.id === subcategoryId);
    if (parentCategory && subcategory) openModal({ type: 'deleteSubcategory', parentCategoryId, subcategory, parentCategoryName: parentCategory.name });
  }, [categories, openModal]);

  const confirmDeleteSubcategory = useCallback((parentCategoryId: string, subcategoryId: string) => {
    const parentCategory = categories.find(cat => cat.id === parentCategoryId);
    const subcategoryToDelete = parentCategory?.subcategories.find(sub => sub.id === subcategoryId);
    if (!parentCategory || !subcategoryToDelete) return;
    
    setCategories(prev => prev.map(cat => cat.id === parentCategoryId ? { ...cat, subcategories: cat.subcategories.filter(sub => sub.id !== subcategoryId) } : cat));
    addToast(`Subcategory "${subcategoryToDelete.name}" from "${parentCategory.name}" deleted.`, 'success');
    closeModal();
  }, [categories, addToast, closeModal]);

  const toggleSubcategoryComplete = useCallback((parentCategoryId: string, subcategoryId: string) => {
    setCategories(prev => prev.map(cat => cat.id === parentCategoryId ? { ...cat, subcategories: cat.subcategories.map(sub => sub.id === subcategoryId ? { ...sub, isComplete: !sub.isComplete } : sub) } : cat));
  }, []);
  
  const saveMonthlyBudget = useCallback((budget: MonthlyBudget) => {
    setMonthlyBudgets(prev => [budget, ...prev.filter(b => b.month !== budget.month)]);
    addToast(`Budget for ${budget.month} has been saved.`, 'success');
  }, [addToast]);
  
  const restoreBudgetFromHistory = useCallback((budget: MonthlyBudget) => {
    setCategories(budget.categories);
    setTotalIncome(budget.totalIncome);
    addToast(`Budget from ${budget.month} has been restored.`, 'success');
  }, [addToast]);

  const totalAllocated = useMemo(() => categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0), [categories]);
  const unallocatedAmount = useMemo(() => totalIncome - totalAllocated, [totalIncome, totalAllocated]);

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
        />;
    }
  };

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
  <AuthProvider>
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  </AuthProvider>
);

export default App;
