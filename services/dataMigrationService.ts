import { FirebaseDataManager } from './firebaseDataManager';
import { UserDataManager } from '../utils/userDataManager';
import { 
  Category, 
  Transaction, 
  BudgetData, 
  MonthlyBudget, 
  BudgetTemplate,
  User 
} from '../types';

export interface MigrationResult {
  success: boolean;
  migratedData: {
    categories: number;
    transactions: number;
    monthlyBudgets: number;
    budgetTemplates: number;
  };
  errors: string[];
}

export interface MigrationProgress {
  step: string;
  progress: number; // 0-100
  message: string;
}

export class DataMigrationService {
  private static readonly MIGRATION_FLAG_KEY = 'firebase_migration_completed';
  
  // Check if user has already been migrated
  static hasMigrationCompleted(userId: string): boolean {
    const migrationFlag = localStorage.getItem(`${this.MIGRATION_FLAG_KEY}_${userId}`);
    return migrationFlag === 'true';
  }

  // Mark migration as completed
  private static markMigrationCompleted(userId: string): void {
    localStorage.setItem(`${this.MIGRATION_FLAG_KEY}_${userId}`, 'true');
  }

  // Check if user has localStorage data to migrate
  static hasLocalStorageData(userId: string): boolean {
    const userKeys = UserDataManager.getUserKeys(userId);
    return userKeys.length > 0;
  }

  // Get migration data size estimate
  static getMigrationDataSize(userId: string): { 
    categories: number; 
    transactions: number; 
    monthlyBudgets: number; 
    budgetTemplates: number; 
  } {
    try {
      const userData = UserDataManager.loadUserData(userId);
      const templates = UserDataManager.loadBudgetTemplates(userId);
      
      return {
        categories: userData.categories.length,
        transactions: userData.transactions.length,
        monthlyBudgets: userData.monthlyBudgets.length,
        budgetTemplates: templates.length
      };
    } catch (error) {
      console.error('Error getting migration data size:', error);
      return { categories: 0, transactions: 0, monthlyBudgets: 0, budgetTemplates: 0 };
    }
  }

  // Export localStorage data as backup
  static exportLocalStorageData(userId: string): string {
    try {
      const userData = UserDataManager.loadUserData(userId);
      const templates = UserDataManager.loadBudgetTemplates(userId);
      const preferences = UserDataManager.loadUserPreferences(userId);
      
      const exportData = {
        userData,
        templates,
        preferences,
        exportDate: new Date().toISOString(),
        userId
      };
      
      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting localStorage data:', error);
      throw new Error('Failed to export localStorage data');
    }
  }

  // Validate data before migration
  private static validateMigrationData(userData: BudgetData, templates: BudgetTemplate[]): string[] {
    const errors: string[] = [];
    
    // Validate budget data
    if (typeof userData.totalIncome !== 'number' || userData.totalIncome < 0) {
      errors.push('Invalid total income value');
    }
    
    if (!userData.selectedCurrency || typeof userData.selectedCurrency !== 'string') {
      errors.push('Invalid selected currency');
    }
    
    // Validate categories
    userData.categories.forEach((category, index) => {
      if (!category.id || !category.name) {
        errors.push(`Category ${index + 1}: Missing ID or name`);
      }
      if (typeof category.allocatedAmount !== 'number' || category.allocatedAmount < 0) {
        errors.push(`Category ${category.name}: Invalid allocated amount`);
      }
      
      // Validate subcategories
      category.subcategories.forEach((subcategory, subIndex) => {
        if (!subcategory.id || !subcategory.name) {
          errors.push(`Category ${category.name}, Subcategory ${subIndex + 1}: Missing ID or name`);
        }
        if (typeof subcategory.allocatedAmount !== 'number' || subcategory.allocatedAmount < 0) {
          errors.push(`Subcategory ${subcategory.name}: Invalid allocated amount`);
        }
      });
    });
    
    // Validate transactions
    userData.transactions.forEach((transaction, index) => {
      if (!transaction.id || !transaction.description) {
        errors.push(`Transaction ${index + 1}: Missing ID or description`);
      }
      if (typeof transaction.amount !== 'number' || transaction.amount <= 0) {
        errors.push(`Transaction ${index + 1}: Invalid amount`);
      }
      if (!transaction.categoryId) {
        errors.push(`Transaction ${index + 1}: Missing category ID`);
      }
      if (!transaction.date || isNaN(new Date(transaction.date).getTime())) {
        errors.push(`Transaction ${index + 1}: Invalid date`);
      }
      if (!['expense', 'income'].includes(transaction.type)) {
        errors.push(`Transaction ${index + 1}: Invalid type`);
      }
    });
    
    // Validate templates
    templates.forEach((template, index) => {
      if (!template.id || !template.name) {
        errors.push(`Template ${index + 1}: Missing ID or name`);
      }
      if (typeof template.totalIncome !== 'number' || template.totalIncome < 0) {
        errors.push(`Template ${template.name}: Invalid total income`);
      }
    });
    
    return errors;
  }

  // Perform the migration
  static async migrateUserData(
    user: User, 
    onProgress?: (progress: MigrationProgress) => void
  ): Promise<MigrationResult> {
    const result: MigrationResult = {
      success: false,
      migratedData: { categories: 0, transactions: 0, monthlyBudgets: 0, budgetTemplates: 0 },
      errors: []
    };

    try {
      // Check if migration already completed
      if (this.hasMigrationCompleted(user.uid)) {
        result.errors.push('Migration already completed for this user');
        return result;
      }

      onProgress?.({ step: 'Loading localStorage data', progress: 10, message: 'Reading data from localStorage...' });

      // Load data from localStorage
      const userData = UserDataManager.loadUserData(user.uid);
      const templates = UserDataManager.loadBudgetTemplates(user.uid);
      const preferences = UserDataManager.loadUserPreferences(user.uid);

      onProgress?.({ step: 'Validating data', progress: 20, message: 'Validating data integrity...' });

      // Validate data
      const validationErrors = this.validateMigrationData(userData, templates);
      if (validationErrors.length > 0) {
        result.errors = validationErrors;
        return result;
      }

      onProgress?.({ step: 'Creating user profile', progress: 30, message: 'Setting up user profile...' });

      // Create user profile in Firestore
      await FirebaseDataManager.createUserProfile(user);
      
      // Update profile with preferences
      await FirebaseDataManager.updateUserProfile(user.uid, {
        preferences,
        displayName: user.displayName || '',
        photoURL: user.photoURL,
        email: user.email || '',
        emailVerified: user.emailVerified
      });

      onProgress?.({ step: 'Migrating budget data', progress: 40, message: 'Transferring budget settings...' });

      // Create budget data
      await FirebaseDataManager.createBudgetData(user.uid, userData);

      onProgress?.({ step: 'Migrating categories', progress: 50, message: 'Transferring categories...' });

      // Migrate categories
      for (const category of userData.categories) {
        await FirebaseDataManager.addCategory(user.uid, {
          name: category.name,
          allocatedAmount: category.allocatedAmount,
          spentAmount: category.spentAmount || 0,
          subcategories: category.subcategories,
          isAmountHidden: category.isAmountHidden || false
        });
        result.migratedData.categories++;
      }

      onProgress?.({ step: 'Migrating transactions', progress: 70, message: 'Transferring transactions...' });

      // Migrate transactions
      for (const transaction of userData.transactions) {
        await FirebaseDataManager.addTransaction(user.uid, {
          amount: transaction.amount,
          description: transaction.description,
          categoryId: transaction.categoryId,
          subcategoryId: transaction.subcategoryId,
          date: transaction.date,
          type: transaction.type,
          tags: transaction.tags || []
        });
        result.migratedData.transactions++;
      }

      onProgress?.({ step: 'Migrating monthly budgets', progress: 80, message: 'Transferring monthly budgets...' });

      // Migrate monthly budgets
      for (const budget of userData.monthlyBudgets) {
        await FirebaseDataManager.addMonthlyBudget(user.uid, {
          month: budget.month,
          year: budget.year,
          monthName: budget.monthName,
          totalIncome: budget.totalIncome,
          categories: budget.categories,
          transactions: budget.transactions,
          isTemplate: budget.isTemplate || false
        });
        result.migratedData.monthlyBudgets++;
      }

      onProgress?.({ step: 'Migrating budget templates', progress: 90, message: 'Transferring budget templates...' });

      // Migrate budget templates
      for (const template of templates) {
        await FirebaseDataManager.addBudgetTemplate(user.uid, {
          name: template.name,
          description: template.description || '',
          totalIncome: template.totalIncome,
          categories: template.categories
        });
        result.migratedData.budgetTemplates++;
      }

      onProgress?.({ step: 'Finalizing migration', progress: 95, message: 'Completing migration...' });

      // Mark migration as completed
      this.markMigrationCompleted(user.uid);

      onProgress?.({ step: 'Migration completed', progress: 100, message: 'Migration completed successfully!' });

      result.success = true;
      return result;

    } catch (error) {
      console.error('Migration error:', error);
      result.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return result;
    }
  }

  // Clean up localStorage after successful migration
  static cleanupLocalStorage(userId: string): void {
    try {
      // Only cleanup if migration was successful
      if (this.hasMigrationCompleted(userId)) {
        UserDataManager.clearUserData(userId);
        console.log('localStorage cleanup completed for user:', userId);
      }
    } catch (error) {
      console.error('Error cleaning up localStorage:', error);
    }
  }

  // Reset migration flag (for testing or re-migration)
  static resetMigrationFlag(userId: string): void {
    localStorage.removeItem(`${this.MIGRATION_FLAG_KEY}_${userId}`);
  }

  // Get migration status
  static getMigrationStatus(userId: string): {
    isCompleted: boolean;
    hasLocalData: boolean;
    dataSize: { categories: number; transactions: number; monthlyBudgets: number; budgetTemplates: number; };
  } {
    return {
      isCompleted: this.hasMigrationCompleted(userId),
      hasLocalData: this.hasLocalStorageData(userId),
      dataSize: this.getMigrationDataSize(userId)
    };
  }
}
