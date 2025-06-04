import { Category, Transaction, BudgetData, MonthlyBudget, BudgetTemplate } from '../types';
import { CURRENCIES } from '../constants';

export class UserDataManager {
  private static getUserKey(userId: string, dataType: string): string {
    return `budgetApp_${userId}_${dataType}`;
  }

  // Load user-specific data from localStorage
  static loadUserData(userId: string): BudgetData {
    try {
      const defaultData: BudgetData = {
        totalIncome: 0,
        categories: [],
        transactions: [],
        selectedCurrency: CURRENCIES[0].code,
        areGlobalAmountsHidden: false,
        monthlyBudgets: [],
      };

      // Load total income
      const savedIncome = localStorage.getItem(this.getUserKey(userId, 'totalIncome'));
      const totalIncome = savedIncome ? JSON.parse(savedIncome) : defaultData.totalIncome;

      // Load categories
      const savedCategories = localStorage.getItem(this.getUserKey(userId, 'categories'));
      let categories: Category[] = defaultData.categories;
      if (savedCategories) {
        const parsedCategories = JSON.parse(savedCategories);
        if (Array.isArray(parsedCategories)) {
          categories = parsedCategories;
        } else {
          console.warn("Loaded categories from localStorage is not an array, using default.");
          localStorage.removeItem(this.getUserKey(userId, 'categories'));
        }
      }

      // Load transactions
      const savedTransactions = localStorage.getItem(this.getUserKey(userId, 'transactions'));
      let transactions: Transaction[] = defaultData.transactions;
      if (savedTransactions) {
        const parsedTransactions = JSON.parse(savedTransactions);
        if (Array.isArray(parsedTransactions)) {
          transactions = parsedTransactions;
        } else {
          console.warn("Loaded transactions from localStorage is not an array, using default.");
          localStorage.removeItem(this.getUserKey(userId, 'transactions'));
        }
      }

      // Load selected currency
      const savedCurrency = localStorage.getItem(this.getUserKey(userId, 'selectedCurrency'));
      let selectedCurrency = defaultData.selectedCurrency;
      if (savedCurrency) {
        const parsedCurrency = JSON.parse(savedCurrency);
        if (typeof parsedCurrency === 'string' && CURRENCIES.some(c => c.code === parsedCurrency)) {
          selectedCurrency = parsedCurrency;
        } else {
          localStorage.removeItem(this.getUserKey(userId, 'selectedCurrency'));
        }
      }

      // Load global amounts hidden setting
      const savedGlobalHidden = localStorage.getItem(this.getUserKey(userId, 'areGlobalAmountsHidden'));
      let areGlobalAmountsHidden = defaultData.areGlobalAmountsHidden;
      if (savedGlobalHidden) {
        const parsedGlobalHidden = JSON.parse(savedGlobalHidden);
        if (typeof parsedGlobalHidden === 'boolean') {
          areGlobalAmountsHidden = parsedGlobalHidden;
        } else {
          localStorage.removeItem(this.getUserKey(userId, 'areGlobalAmountsHidden'));
        }
      }

      // Load monthly budgets
      const savedMonthlyBudgets = localStorage.getItem(this.getUserKey(userId, 'monthlyBudgets'));
      let monthlyBudgets: MonthlyBudget[] = [];
      if (savedMonthlyBudgets) {
        const parsedMonthlyBudgets = JSON.parse(savedMonthlyBudgets);
        if (Array.isArray(parsedMonthlyBudgets)) {
          monthlyBudgets = parsedMonthlyBudgets;
        } else {
          localStorage.removeItem(this.getUserKey(userId, 'monthlyBudgets'));
        }
      }

      return {
        totalIncome,
        categories,
        transactions,
        selectedCurrency,
        areGlobalAmountsHidden,
        monthlyBudgets,
      };
    } catch (error) {
      console.error("Error loading user data from localStorage:", error);
      // Clear corrupted data and return defaults
      this.clearUserData(userId);
      return {
        totalIncome: 0,
        categories: [],
        transactions: [],
        selectedCurrency: CURRENCIES[0].code,
        areGlobalAmountsHidden: false,
        monthlyBudgets: [],
      };
    }
  }

  // Save individual data pieces
  static saveTotalIncome(userId: string, totalIncome: number): void {
    localStorage.setItem(this.getUserKey(userId, 'totalIncome'), JSON.stringify(totalIncome));
  }

  static saveCategories(userId: string, categories: Category[]): void {
    localStorage.setItem(this.getUserKey(userId, 'categories'), JSON.stringify(categories));
  }

  static saveTransactions(userId: string, transactions: Transaction[]): void {
    localStorage.setItem(this.getUserKey(userId, 'transactions'), JSON.stringify(transactions));
  }

  static saveSelectedCurrency(userId: string, selectedCurrency: string): void {
    localStorage.setItem(this.getUserKey(userId, 'selectedCurrency'), JSON.stringify(selectedCurrency));
  }

  static saveGlobalAmountsHidden(userId: string, areGlobalAmountsHidden: boolean): void {
    localStorage.setItem(this.getUserKey(userId, 'areGlobalAmountsHidden'), JSON.stringify(areGlobalAmountsHidden));
  }

  static saveMonthlyBudgets(userId: string, monthlyBudgets: MonthlyBudget[]): void {
    localStorage.setItem(this.getUserKey(userId, 'monthlyBudgets'), JSON.stringify(monthlyBudgets));
  }

  static saveBudgetTemplates(userId: string, templates: BudgetTemplate[]): void {
    localStorage.setItem(this.getUserKey(userId, 'budgetTemplates'), JSON.stringify(templates));
  }

  // Save all user data at once
  static saveUserData(userId: string, data: BudgetData): void {
    this.saveTotalIncome(userId, data.totalIncome);
    this.saveCategories(userId, data.categories);
    this.saveTransactions(userId, data.transactions);
    this.saveSelectedCurrency(userId, data.selectedCurrency);
    this.saveGlobalAmountsHidden(userId, data.areGlobalAmountsHidden);
    this.saveMonthlyBudgets(userId, data.monthlyBudgets);
  }

  // Clear all user-specific data
  static clearUserData(userId: string): void {
    const keysToRemove = [
      'totalIncome',
      'categories',
      'transactions',
      'selectedCurrency',
      'areGlobalAmountsHidden',
      'monthlyBudgets',
      'budgetTemplates'
    ];

    keysToRemove.forEach(dataType => {
      localStorage.removeItem(this.getUserKey(userId, dataType));
    });

    // Also remove user-specific profile picture
    localStorage.removeItem(`profilePicture_${userId}`);
  }

  // Get all user-specific keys (for debugging or migration purposes)
  static getUserKeys(userId: string): string[] {
    const userPrefix = `budgetApp_${userId}_`;
    const allKeys = Object.keys(localStorage);
    return allKeys.filter(key => key.startsWith(userPrefix));
  }

  // Check if user has any existing data
  static hasUserData(userId: string): boolean {
    return this.getUserKeys(userId).length > 0;
  }

  // Migration utility: Move old global data to user-specific storage
  static migrateGlobalDataToUser(userId: string): boolean {
    try {
      // Check if old global data exists
      const oldKeys = [
        'budgetApp_totalIncome',
        'budgetApp_categories',
        'budgetApp_transactions',
        'budgetApp_selectedCurrency',
        'budgetApp_areGlobalAmountsHidden'
      ];

      const hasOldData = oldKeys.some(key => localStorage.getItem(key) !== null);

      if (!hasOldData) {
        return false; // No old data to migrate
      }

      // Don't migrate if user already has data
      if (this.hasUserData(userId)) {
        return false;
      }

      // Migrate each piece of data
      const oldIncome = localStorage.getItem('budgetApp_totalIncome');
      if (oldIncome) {
        this.saveTotalIncome(userId, JSON.parse(oldIncome));
      }

      const oldCategories = localStorage.getItem('budgetApp_categories');
      if (oldCategories) {
        const parsedCategories = JSON.parse(oldCategories);
        if (Array.isArray(parsedCategories)) {
          this.saveCategories(userId, parsedCategories);
        }
      }

      const oldTransactions = localStorage.getItem('budgetApp_transactions');
      if (oldTransactions) {
        const parsedTransactions = JSON.parse(oldTransactions);
        if (Array.isArray(parsedTransactions)) {
          this.saveTransactions(userId, parsedTransactions);
        }
      }

      const oldCurrency = localStorage.getItem('budgetApp_selectedCurrency');
      if (oldCurrency) {
        const parsedCurrency = JSON.parse(oldCurrency);
        if (typeof parsedCurrency === 'string') {
          this.saveSelectedCurrency(userId, parsedCurrency);
        }
      }

      const oldGlobalHidden = localStorage.getItem('budgetApp_areGlobalAmountsHidden');
      if (oldGlobalHidden) {
        const parsedGlobalHidden = JSON.parse(oldGlobalHidden);
        if (typeof parsedGlobalHidden === 'boolean') {
          this.saveGlobalAmountsHidden(userId, parsedGlobalHidden);
        }
      }

      // Clear old global data after successful migration
      oldKeys.forEach(key => localStorage.removeItem(key));

      return true; // Migration successful
    } catch (error) {
      console.error('Error during data migration:', error);
      return false;
    }
  }

  // Monthly Budget Management Methods
  static loadBudgetTemplates(userId: string): BudgetTemplate[] {
    try {
      const savedTemplates = localStorage.getItem(this.getUserKey(userId, 'budgetTemplates'));
      if (savedTemplates) {
        const parsedTemplates = JSON.parse(savedTemplates);
        if (Array.isArray(parsedTemplates)) {
          return parsedTemplates;
        }
      }
      return [];
    } catch (error) {
      console.error("Error loading budget templates:", error);
      return [];
    }
  }

  static generateMonthlyBudgetId(): string {
    return `monthly_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateCategoryId(): string {
    return `category_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static generateSubcategoryId(): string {
    return `subcategory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static formatMonthKey(year: number, month: number): string {
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  static parseMonthKey(monthKey: string): { year: number; month: number } {
    const [year, month] = monthKey.split('-').map(Number);
    return { year, month };
  }

  static getMonthName(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
}
