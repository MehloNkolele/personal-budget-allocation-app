import { Category, MonthlyBudget, Transaction } from '../types';
import { FirebaseDataManager } from '../services/firebaseDataManager';

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

  static async loadSampleData(userId: string, overwriteExisting: boolean = false) {
    try {
      const existingData = await FirebaseDataManager.getBudgetData(userId);
      const existingCategories = await FirebaseDataManager.getCategories(userId);

      // Only load sample data if user has no existing data or explicitly wants to overwrite
      if (!overwriteExisting && (existingCategories.length > 0 || existingData.totalIncome > 0)) {
        return false; // Data already exists
      }

      // Create budget data
      await FirebaseDataManager.createBudgetData(userId, {
        totalIncome: 30000, // Sample income in ZAR
        selectedCurrency: 'ZAR',
        areGlobalAmountsHidden: false,
        isIncomeHidden: true,
        categories: [],
        transactions: [],
        monthlyBudgets: []
      });

      // Add sample categories
      const sampleCategories = this.createSampleCategories();
      for (const category of sampleCategories) {
        await FirebaseDataManager.addCategory(userId, {
          name: category.name,
          allocatedAmount: category.allocatedAmount,
          spentAmount: category.spentAmount || 0,
          subcategories: category.subcategories,
          isAmountHidden: category.isAmountHidden || false
        });
      }

      // Add sample transactions
      const sampleTransactions = this.createSampleTransactions();
      for (const transaction of sampleTransactions) {
        await FirebaseDataManager.addTransaction(userId, {
          amount: transaction.amount,
          description: transaction.description,
          categoryId: transaction.categoryId,
          subcategoryId: transaction.subcategoryId,
          date: transaction.date,
          type: transaction.type,
          tags: transaction.tags || []
        });
      }

      return true; // Sample data loaded
    } catch (error) {
      console.error('Error loading sample data:', error);
      return false;
    }
  }

  static async clearAllData(userId: string) {
    try {
      await FirebaseDataManager.clearUserData(userId);

      // Recreate empty budget data
      await FirebaseDataManager.createBudgetData(userId, {
        totalIncome: 0,
        selectedCurrency: 'ZAR',
        areGlobalAmountsHidden: false,
        isIncomeHidden: true,
        categories: [],
        transactions: [],
        monthlyBudgets: []
      });
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }
}
