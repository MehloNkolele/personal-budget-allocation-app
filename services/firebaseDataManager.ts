import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  onSnapshot,
  writeBatch,
  serverTimestamp,
  enableNetwork,
  disableNetwork,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '../firebase.config';
import { 
  Category, 
  Transaction, 
  BudgetData, 
  MonthlyBudget, 
  BudgetTemplate, 
  SecuritySettings,
  User
} from '../types';
import { CURRENCIES } from '../constants';

// User preferences interface
export interface UserPreferences {
  security: SecuritySettings;
}

// Firestore document interfaces
interface FirestoreUserProfile {
  displayName: string;
  photoURL: string | null;
  profilePictureBase64: string | null; // Store profile picture as base64
  email: string;
  emailVerified: boolean;
  preferences: UserPreferences;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FirestoreBudgetData {
  totalIncome: number;
  selectedCurrency: string;
  areGlobalAmountsHidden: boolean;
  isIncomeHidden: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FirestoreCategory extends Omit<Category, 'id'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FirestoreTransaction extends Omit<Transaction, 'id' | 'date'> {
  date: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FirestoreMonthlyBudget extends Omit<MonthlyBudget, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface FirestoreBudgetTemplate extends Omit<BudgetTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export class FirebaseDataManager {
  private static listeners: Map<string, Unsubscribe> = new Map();

  // Helper methods
  private static getUserDocRef(userId: string, collectionName: string, docId?: string) {
    if (docId) {
      return doc(db, 'users', userId, collectionName, docId);
    }
    // For single documents like profile and budgetData, use a fixed document ID
    return doc(db, 'users', userId, collectionName, 'data');
  }

  private static getUserCollectionRef(userId: string, collectionName: string) {
    return collection(db, 'users', userId, collectionName);
  }

  // Convert Firestore timestamps to ISO strings
  private static timestampToISOString(timestamp: Timestamp): string {
    return timestamp.toDate().toISOString();
  }

  // Convert ISO strings to Firestore timestamps
  private static isoStringToTimestamp(isoString: string): Timestamp {
    return Timestamp.fromDate(new Date(isoString));
  }

  // User Profile Management
  static async createUserProfile(user: User, profilePictureBase64?: string): Promise<void> {
    try {
      const profileRef = this.getUserDocRef(user.uid, 'profile');
      const profileData: FirestoreUserProfile = {
        displayName: user.displayName || '',
        photoURL: user.photoURL,
        profilePictureBase64: profilePictureBase64 || null,
        email: user.email || '',
        emailVerified: user.emailVerified,
        preferences: {
          security: {
            isEnabled: false,
            authMethod: 'pin',
            requireOnAppResume: true,
            requireOnSensitiveActions: false
          }
        },
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      await setDoc(profileRef, profileData);
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw new Error('Failed to create user profile');
    }
  }

  static async getUserProfile(userId: string): Promise<FirestoreUserProfile | null> {
    try {
      const profileRef = this.getUserDocRef(userId, 'profile');
      const profileSnap = await getDoc(profileRef);
      
      if (profileSnap.exists()) {
        return profileSnap.data() as FirestoreUserProfile;
      }
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw new Error('Failed to get user profile');
    }
  }

  static async updateUserProfile(userId: string, updates: Partial<FirestoreUserProfile>): Promise<void> {
    try {
      const profileRef = this.getUserDocRef(userId, 'profile');
      await updateDoc(profileRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update user profile');
    }
  }

  static async updateProfilePicture(userId: string, profilePictureBase64: string): Promise<void> {
    try {
      const profileRef = this.getUserDocRef(userId, 'profile');
      await updateDoc(profileRef, {
        profilePictureBase64,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating profile picture:', error);
      throw new Error('Failed to update profile picture');
    }
  }

  // Budget Data Management
  static async createBudgetData(userId: string, budgetData: Partial<BudgetData>): Promise<void> {
    try {
      const budgetRef = this.getUserDocRef(userId, 'budgetData');
      const data: FirestoreBudgetData = {
        totalIncome: budgetData.totalIncome || 0,
        selectedCurrency: budgetData.selectedCurrency || CURRENCIES[0].code,
        areGlobalAmountsHidden: budgetData.areGlobalAmountsHidden || false,
        isIncomeHidden: budgetData.isIncomeHidden || true,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      await setDoc(budgetRef, data);
    } catch (error) {
      console.error('Error creating budget data:', error);
      throw new Error('Failed to create budget data');
    }
  }

  static async getBudgetData(userId: string): Promise<BudgetData> {
    try {
      const budgetRef = this.getUserDocRef(userId, 'budgetData');
      const budgetSnap = await getDoc(budgetRef);
      
      if (budgetSnap.exists()) {
        const data = budgetSnap.data() as FirestoreBudgetData;
        return {
          totalIncome: data.totalIncome,
          selectedCurrency: data.selectedCurrency,
          areGlobalAmountsHidden: data.areGlobalAmountsHidden,
          isIncomeHidden: data.isIncomeHidden,
          categories: [], // Will be loaded separately
          transactions: [], // Will be loaded separately
          monthlyBudgets: [] // Will be loaded separately
        };
      }
      
      // Return default data if not found
      const defaultData: BudgetData = {
        totalIncome: 0,
        categories: [],
        transactions: [],
        selectedCurrency: CURRENCIES[0].code,
        areGlobalAmountsHidden: false,
        isIncomeHidden: true,
        monthlyBudgets: []
      };
      
      // Create default budget data
      await this.createBudgetData(userId, defaultData);
      return defaultData;
    } catch (error) {
      console.error('Error getting budget data:', error);
      throw new Error('Failed to get budget data');
    }
  }

  static async updateBudgetData(userId: string, updates: Partial<BudgetData>): Promise<void> {
    try {
      const budgetRef = this.getUserDocRef(userId, 'budgetData');
      const updateData: Partial<FirestoreBudgetData> = {
        updatedAt: serverTimestamp() as Timestamp
      };
      
      if (updates.totalIncome !== undefined) updateData.totalIncome = updates.totalIncome;
      if (updates.selectedCurrency !== undefined) updateData.selectedCurrency = updates.selectedCurrency;
      if (updates.areGlobalAmountsHidden !== undefined) updateData.areGlobalAmountsHidden = updates.areGlobalAmountsHidden;
      if (updates.isIncomeHidden !== undefined) updateData.isIncomeHidden = updates.isIncomeHidden;
      
      await updateDoc(budgetRef, updateData);
    } catch (error) {
      console.error('Error updating budget data:', error);
      throw new Error('Failed to update budget data');
    }
  }

  // Categories Management
  static async getCategories(userId: string): Promise<Category[]> {
    try {
      const categoriesRef = this.getUserCollectionRef(userId, 'categories');
      const categoriesSnap = await getDocs(categoriesRef);
      
      const categories: Category[] = [];
      categoriesSnap.forEach((doc) => {
        const data = doc.data() as FirestoreCategory;
        categories.push({
          id: doc.id,
          name: data.name,
          allocatedAmount: data.allocatedAmount,
          spentAmount: data.spentAmount || 0,
          subcategories: data.subcategories || [],
          isAmountHidden: data.isAmountHidden || false
        });
      });
      
      return categories;
    } catch (error) {
      console.error('Error getting categories:', error);
      throw new Error('Failed to get categories');
    }
  }

  static async addCategory(userId: string, category: Omit<Category, 'id'>): Promise<string> {
    try {
      const categoriesRef = this.getUserCollectionRef(userId, 'categories');
      const categoryData: FirestoreCategory = {
        ...category,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      const docRef = await addDoc(categoriesRef, categoryData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding category:', error);
      throw new Error('Failed to add category');
    }
  }

  static async updateCategory(userId: string, categoryId: string, updates: Partial<Category>): Promise<void> {
    try {
      const categoryRef = this.getUserDocRef(userId, 'categories', categoryId);
      const updateData: Partial<FirestoreCategory> = {
        ...updates,
        updatedAt: serverTimestamp() as Timestamp
      };
      
      await updateDoc(categoryRef, updateData);
    } catch (error) {
      console.error('Error updating category:', error);
      throw new Error('Failed to update category');
    }
  }

  static async deleteCategory(userId: string, categoryId: string): Promise<void> {
    try {
      const categoryRef = this.getUserDocRef(userId, 'categories', categoryId);
      await deleteDoc(categoryRef);
    } catch (error) {
      console.error('Error deleting category:', error);
      throw new Error('Failed to delete category');
    }
  }

  // Transactions Management
  static async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      const transactionsRef = this.getUserCollectionRef(userId, 'transactions');
      const q = query(transactionsRef, orderBy('date', 'desc'));
      const transactionsSnap = await getDocs(q);

      const transactions: Transaction[] = [];
      transactionsSnap.forEach((doc) => {
        const data = doc.data() as FirestoreTransaction;
        transactions.push({
          id: doc.id,
          amount: data.amount,
          description: data.description,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          date: this.timestampToISOString(data.date),
          type: data.type,
          tags: data.tags || []
        });
      });

      return transactions;
    } catch (error) {
      console.error('Error getting transactions:', error);
      throw new Error('Failed to get transactions');
    }
  }

  static async addTransaction(userId: string, transaction: Omit<Transaction, 'id'>): Promise<string> {
    try {
      const transactionsRef = this.getUserCollectionRef(userId, 'transactions');
      const transactionData: FirestoreTransaction = {
        amount: transaction.amount,
        description: transaction.description,
        categoryId: transaction.categoryId,
        subcategoryId: transaction.subcategoryId,
        date: this.isoStringToTimestamp(transaction.date),
        type: transaction.type,
        tags: transaction.tags || [],
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      const docRef = await addDoc(transactionsRef, transactionData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw new Error('Failed to add transaction');
    }
  }

  static async updateTransaction(userId: string, transactionId: string, updates: Partial<Transaction>): Promise<void> {
    try {
      const transactionRef = this.getUserDocRef(userId, 'transactions', transactionId);
      const updateData: Partial<FirestoreTransaction> = {
        updatedAt: serverTimestamp() as Timestamp
      };

      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.categoryId !== undefined) updateData.categoryId = updates.categoryId;
      if (updates.subcategoryId !== undefined) updateData.subcategoryId = updates.subcategoryId;
      if (updates.date !== undefined) updateData.date = this.isoStringToTimestamp(updates.date);
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.tags !== undefined) updateData.tags = updates.tags;

      await updateDoc(transactionRef, updateData);
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw new Error('Failed to update transaction');
    }
  }

  static async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    try {
      const transactionRef = this.getUserDocRef(userId, 'transactions', transactionId);
      await deleteDoc(transactionRef);
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw new Error('Failed to delete transaction');
    }
  }

  // Monthly Budgets Management
  static async getMonthlyBudgets(userId: string): Promise<MonthlyBudget[]> {
    try {
      const budgetsRef = this.getUserCollectionRef(userId, 'monthlyBudgets');
      // Remove complex ordering to avoid index requirement for now
      const budgetsSnap = await getDocs(budgetsRef);

      const budgets: MonthlyBudget[] = [];
      budgetsSnap.forEach((doc) => {
        const data = doc.data() as FirestoreMonthlyBudget;
        budgets.push({
          id: doc.id,
          month: data.month,
          year: data.year,
          monthName: data.monthName,
          totalIncome: data.totalIncome,
          categories: data.categories,
          transactions: data.transactions,
          isTemplate: data.isTemplate || false,
          createdAt: this.timestampToISOString(data.createdAt),
          updatedAt: this.timestampToISOString(data.updatedAt)
        });
      });

      // Sort by year and month in JavaScript
      budgets.sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year; // Descending year
        return b.month.localeCompare(a.month); // Descending month
      });

      return budgets;
    } catch (error) {
      console.error('Error getting monthly budgets:', error);
      throw new Error('Failed to get monthly budgets');
    }
  }

  static async addMonthlyBudget(userId: string, budget: Omit<MonthlyBudget, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const budgetsRef = this.getUserCollectionRef(userId, 'monthlyBudgets');
      const budgetData: FirestoreMonthlyBudget = {
        ...budget,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      const docRef = await addDoc(budgetsRef, budgetData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding monthly budget:', error);
      throw new Error('Failed to add monthly budget');
    }
  }

  static async updateMonthlyBudget(userId: string, budgetId: string, updates: Partial<MonthlyBudget>): Promise<void> {
    try {
      const budgetRef = this.getUserDocRef(userId, 'monthlyBudgets', budgetId);
      const updateData: Partial<FirestoreMonthlyBudget> = {
        ...updates,
        updatedAt: serverTimestamp() as Timestamp
      };

      await updateDoc(budgetRef, updateData);
    } catch (error) {
      console.error('Error updating monthly budget:', error);
      throw new Error('Failed to update monthly budget');
    }
  }

  static async deleteMonthlyBudget(userId: string, budgetId: string): Promise<void> {
    try {
      const budgetRef = this.getUserDocRef(userId, 'monthlyBudgets', budgetId);
      await deleteDoc(budgetRef);
    } catch (error) {
      console.error('Error deleting monthly budget:', error);
      throw new Error('Failed to delete monthly budget');
    }
  }

  // Budget Templates Management
  static async getBudgetTemplates(userId: string): Promise<BudgetTemplate[]> {
    try {
      const templatesRef = this.getUserCollectionRef(userId, 'budgetTemplates');
      const templatesSnap = await getDocs(templatesRef);

      const templates: BudgetTemplate[] = [];
      templatesSnap.forEach((doc) => {
        const data = doc.data() as FirestoreBudgetTemplate;
        templates.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          totalIncome: data.totalIncome,
          categories: data.categories,
          createdAt: this.timestampToISOString(data.createdAt),
          updatedAt: this.timestampToISOString(data.updatedAt)
        });
      });

      return templates;
    } catch (error) {
      console.error('Error getting budget templates:', error);
      throw new Error('Failed to get budget templates');
    }
  }

  static async addBudgetTemplate(userId: string, template: Omit<BudgetTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const templatesRef = this.getUserCollectionRef(userId, 'budgetTemplates');
      const templateData: FirestoreBudgetTemplate = {
        ...template,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp
      };

      const docRef = await addDoc(templatesRef, templateData);
      return docRef.id;
    } catch (error) {
      console.error('Error adding budget template:', error);
      throw new Error('Failed to add budget template');
    }
  }

  static async updateBudgetTemplate(userId: string, templateId: string, updates: Partial<BudgetTemplate>): Promise<void> {
    try {
      const templateRef = this.getUserDocRef(userId, 'budgetTemplates', templateId);
      const updateData: Partial<FirestoreBudgetTemplate> = {
        ...updates,
        updatedAt: serverTimestamp() as Timestamp
      };

      await updateDoc(templateRef, updateData);
    } catch (error) {
      console.error('Error updating budget template:', error);
      throw new Error('Failed to update budget template');
    }
  }

  static async deleteBudgetTemplate(userId: string, templateId: string): Promise<void> {
    try {
      const templateRef = this.getUserDocRef(userId, 'budgetTemplates', templateId);
      await deleteDoc(templateRef);
    } catch (error) {
      console.error('Error deleting budget template:', error);
      throw new Error('Failed to delete budget template');
    }
  }

  // Real-time Listeners
  static subscribeToCategories(userId: string, callback: (categories: Category[]) => void): Unsubscribe {
    const categoriesRef = this.getUserCollectionRef(userId, 'categories');
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const categories: Category[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreCategory;
        categories.push({
          id: doc.id,
          name: data.name,
          allocatedAmount: data.allocatedAmount,
          spentAmount: data.spentAmount || 0,
          subcategories: data.subcategories || [],
          isAmountHidden: data.isAmountHidden || false
        });
      });
      callback(categories);
    });

    this.listeners.set(`categories_${userId}`, unsubscribe);
    return unsubscribe;
  }

  static subscribeToTransactions(userId: string, callback: (transactions: Transaction[]) => void): Unsubscribe {
    const transactionsRef = this.getUserCollectionRef(userId, 'transactions');
    const q = query(transactionsRef, orderBy('date', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const transactions: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as FirestoreTransaction;
        transactions.push({
          id: doc.id,
          amount: data.amount,
          description: data.description,
          categoryId: data.categoryId,
          subcategoryId: data.subcategoryId,
          date: this.timestampToISOString(data.date),
          type: data.type,
          tags: data.tags || []
        });
      });
      callback(transactions);
    });

    this.listeners.set(`transactions_${userId}`, unsubscribe);
    return unsubscribe;
  }

  static subscribeToBudgetData(userId: string, callback: (budgetData: BudgetData) => void): Unsubscribe {
    const budgetRef = this.getUserDocRef(userId, 'budgetData');

    const unsubscribe = onSnapshot(budgetRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as FirestoreBudgetData;
        const budgetData: BudgetData = {
          totalIncome: data.totalIncome,
          selectedCurrency: data.selectedCurrency,
          areGlobalAmountsHidden: data.areGlobalAmountsHidden,
          isIncomeHidden: data.isIncomeHidden,
          categories: [], // Will be loaded separately
          transactions: [], // Will be loaded separately
          monthlyBudgets: [] // Will be loaded separately
        };
        callback(budgetData);
      }
    });

    this.listeners.set(`budgetData_${userId}`, unsubscribe);
    return unsubscribe;
  }

  // Cleanup listeners
  static unsubscribeAll(userId: string): void {
    const userListeners = Array.from(this.listeners.entries())
      .filter(([key]) => key.includes(userId));

    userListeners.forEach(([key, unsubscribe]) => {
      unsubscribe();
      this.listeners.delete(key);
    });
  }

  // Batch operations
  static async saveAllUserData(userId: string, data: BudgetData): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Update budget data
      const budgetRef = this.getUserDocRef(userId, 'budgetData');
      batch.set(budgetRef, {
        totalIncome: data.totalIncome,
        selectedCurrency: data.selectedCurrency,
        areGlobalAmountsHidden: data.areGlobalAmountsHidden,
        isIncomeHidden: data.isIncomeHidden,
        updatedAt: serverTimestamp()
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving user data:', error);
      throw new Error('Failed to save user data');
    }
  }

  // Clear all user data
  static async clearUserData(userId: string): Promise<void> {
    try {
      const batch = writeBatch(db);

      // Get all collections for the user
      const collections = ['categories', 'transactions', 'monthlyBudgets', 'budgetTemplates'];

      for (const collectionName of collections) {
        const collectionRef = this.getUserCollectionRef(userId, collectionName);
        const snapshot = await getDocs(collectionRef);

        snapshot.forEach((doc) => {
          batch.delete(doc.ref);
        });
      }

      // Clear budget data and profile
      const budgetRef = this.getUserDocRef(userId, 'budgetData');
      const profileRef = this.getUserDocRef(userId, 'profile');

      batch.delete(budgetRef);
      batch.delete(profileRef);

      await batch.commit();

      // Unsubscribe from all listeners
      this.unsubscribeAll(userId);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw new Error('Failed to clear user data');
    }
  }

  // Network status management
  static async enableOfflineSupport(): Promise<void> {
    try {
      await enableNetwork(db);
    } catch (error) {
      console.error('Error enabling network:', error);
    }
  }

  static async disableOfflineSupport(): Promise<void> {
    try {
      await disableNetwork(db);
    } catch (error) {
      console.error('Error disabling network:', error);
    }
  }
}
