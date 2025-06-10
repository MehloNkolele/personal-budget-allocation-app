import { Category, MonthlyBudget, Transaction } from '../types';
import { UserDataManager } from './userDataManager';

export class SampleDataLoader {
  static createSampleCategories(): Category[] {
    return [
      {
        id: 'cat-1',
        name: 'Housing',
        allocatedAmount: 12000,
        spentAmount: 0,
        subcategories: [
          {
            id: 'sub-1',
            name: 'Rent/Mortgage',
            allocatedAmount: 8000,
            spentAmount: 0,
            isComplete: false
          },
          {
            id: 'sub-2',
            name: 'Utilities',
            allocatedAmount: 2000,
            spentAmount: 0,
            isComplete: false
          },
          {
            id: 'sub-3',
            name: 'Maintenance',
            allocatedAmount: 2000,
            spentAmount: 0,
            isComplete: true
          }
        ]
      },
      {
        id: 'cat-2',
        name: 'Transportation',
        allocatedAmount: 4000,
        spentAmount: 0,
        subcategories: [
          {
            id: 'sub-4',
            name: 'Fuel',
            allocatedAmount: 2000,
            spentAmount: 0,
            isComplete: false
          },
          {
            id: 'sub-5',
            name: 'Insurance',
            allocatedAmount: 1500,
            spentAmount: 0,
            isComplete: true
          },
          {
            id: 'sub-6',
            name: 'Maintenance',
            allocatedAmount: 500,
            spentAmount: 0,
            isComplete: false
          }
        ]
      },
      {
        id: 'cat-3',
        name: 'Food & Dining',
        allocatedAmount: 6000,
        spentAmount: 0,
        subcategories: [
          {
            id: 'sub-7',
            name: 'Groceries',
            allocatedAmount: 4000,
            spentAmount: 0,
            isComplete: false
          },
          {
            id: 'sub-8',
            name: 'Restaurants',
            allocatedAmount: 2000,
            spentAmount: 0,
            isComplete: false
          }
        ]
      },
      {
        id: 'cat-4',
        name: 'Entertainment',
        allocatedAmount: 2000,
        spentAmount: 0,
        subcategories: [
          {
            id: 'sub-9',
            name: 'Movies & Shows',
            allocatedAmount: 800,
            spentAmount: 0,
            isComplete: true
          },
          {
            id: 'sub-10',
            name: 'Sports & Hobbies',
            allocatedAmount: 1200,
            spentAmount: 0,
            isComplete: false
          }
        ]
      },
      {
        id: 'cat-5',
        name: 'Savings',
        allocatedAmount: 6000,
        spentAmount: 0,
        subcategories: [
          {
            id: 'sub-11',
            name: 'Emergency Fund',
            allocatedAmount: 3000,
            spentAmount: 0,
            isComplete: false
          },
          {
            id: 'sub-12',
            name: 'Investments',
            allocatedAmount: 3000,
            spentAmount: 0,
            isComplete: false
          }
        ]
      }
    ];
  }

  static createSampleTransactions(): Transaction[] {
    return [
      {
        id: 'txn-1',
        amount: 8000,
        description: 'Monthly rent payment',
        categoryId: 'cat-1',
        subcategoryId: 'sub-1',
        date: new Date().toISOString(),
        type: 'expense',
        tags: ['housing', 'fixed']
      },
      {
        id: 'txn-2',
        amount: 1500,
        description: 'Car insurance premium',
        categoryId: 'cat-2',
        subcategoryId: 'sub-5',
        date: new Date().toISOString(),
        type: 'expense',
        tags: ['transport', 'insurance']
      }
    ];
  }

  static loadSampleData(userId: string, overwriteExisting: boolean = false) {
    const existingData = UserDataManager.loadUserData(userId);
    
    // Only load sample data if user has no existing data or explicitly wants to overwrite
    if (!overwriteExisting && (existingData.categories.length > 0 || existingData.totalIncome > 0)) {
      return false; // Data already exists
    }

    const sampleData = {
      totalIncome: 30000, // Sample income in ZAR
      categories: this.createSampleCategories(),
      transactions: this.createSampleTransactions(),
      selectedCurrency: 'ZAR',
      areGlobalAmountsHidden: false,
      isIncomeHidden: true,
      monthlyBudgets: [] as MonthlyBudget[]
    };

    UserDataManager.saveUserData(userId, sampleData);
    return true; // Sample data loaded
  }

  static clearAllData(userId: string) {
    const emptyData = {
      totalIncome: 0,
      categories: [],
      transactions: [],
      selectedCurrency: 'ZAR',
      areGlobalAmountsHidden: false,
      isIncomeHidden: true,
      monthlyBudgets: []
    };

    UserDataManager.saveUserData(userId, emptyData);
  }
}
