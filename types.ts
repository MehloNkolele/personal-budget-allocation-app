export interface Transaction {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  date: string; // ISO date string
  type: 'expense' | 'income';
  tags?: string[];
}

export interface Subcategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount?: number; // Track actual spending
  isComplete?: boolean; // New: for marking subcategory as complete
}

export interface Category {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount?: number; // Track actual spending
  subcategories: Subcategory[];
  isAmountHidden?: boolean; // New: for hiding amounts for this category
}

export interface BudgetData {
  totalIncome: number;
  categories: Category[];
  transactions: Transaction[];
  selectedCurrency: string; // New: to store selected currency
  areGlobalAmountsHidden: boolean; // New: to store global visibility state
  isIncomeHidden: boolean; // New: to store income visibility state
  monthlyBudgets: MonthlyBudget[]; // New: to store monthly budget history
}

// Report Types
export interface ReportDateRange {
  startDate: string;
  endDate: string;
}

export interface CategorySpendingData {
  categoryId: string;
  categoryName: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface MonthlySpendingData {
  month: string;
  totalSpent: number;
  totalAllocated: number;
  categories: CategorySpendingData[];
}

export interface ReportFilters {
  dateRange: ReportDateRange;
  categoryIds?: string[];
  transactionType?: 'expense' | 'income' | 'all';
}

export type ModalType =
  | { type: 'addCategory' }
  | { type: 'editCategory'; category: Category }
  | { type: 'addSubcategory'; parentCategoryId: string }
  | { type: 'editSubcategory'; parentCategoryId: string; subcategory: Subcategory }
  | { type: 'deleteCategory'; category: Category }
  | { type: 'deleteSubcategory'; parentCategoryId: string; subcategory: Subcategory; parentCategoryName: string }
  | null;

// Props for forms might need to be extended for validation if not handled in App.tsx
export interface CategoryFormPropsBase {
  onSubmit: (name: string, allocatedAmount: number) => void;
  onClose: () => void;
  selectedCurrency: string; // For alert messages
}

export interface CategoryFormPropsNew extends CategoryFormPropsBase {
  existingCategory?: null;
  maxAllocatableAmount: number;
}
export interface CategoryFormPropsEdit extends CategoryFormPropsBase {
  existingCategory: Category;
  maxAllocatableAmount: number;
  minAllocatableAmountForEdit: number; // Min amount based on sum of subcategories
}

export type CategoryFormProps = CategoryFormPropsNew | CategoryFormPropsEdit;


export interface SubcategoryFormPropsBase {
  onSubmit: (name: string, allocatedAmount: number) => void;
  onClose: () => void;
  parentCategoryName?: string;
  selectedCurrency: string; // For alert messages
}
export interface SubcategoryFormPropsNew extends SubcategoryFormPropsBase {
  existingSubcategory?: null;
  maxAllocatableAmount: number;
}
export interface SubcategoryFormPropsEdit extends SubcategoryFormPropsBase {
  existingSubcategory: Subcategory;
  maxAllocatableAmount: number;
}

export type SubcategoryFormProps = SubcategoryFormPropsNew | SubcategoryFormPropsEdit;

// Toast Notification Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// Authentication Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

// Monthly Budget Planning Types
export interface MonthlyBudget {
  id: string;
  month: string; // Format: "YYYY-MM"
  year: number;
  monthName: string; // e.g., "January 2024"
  totalIncome: number;
  categories: Category[];
  transactions: Transaction[];
  isTemplate?: boolean; // For budget templates
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface BudgetTemplate {
  id: string;
  name: string;
  description?: string;
  totalIncome: number;
  categories: Omit<Category, 'spentAmount'>[];
  createdAt: string;
  updatedAt: string;
}

// Transaction Filter Types
export interface TransactionFilter {
  dateRange?: {
    startDate: string;
    endDate: string;
  };
  categoryIds?: string[];
  subcategoryIds?: string[];
  transactionType?: 'expense' | 'income' | 'all';
  amountRange?: {
    min: number;
    max: number;
  };
  searchQuery?: string;
  tags?: string[];
}

// Budget Planning Types
export interface BudgetPlanningData {
  selectedMonth: string; // Format: "YYYY-MM"
  availableMonths: string[];
  currentBudget?: MonthlyBudget;
  templates: BudgetTemplate[];
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName: string, photoURL?: string | null) => Promise<void>;
  updateUserPassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearUserData: () => Promise<void>;
}

export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword?: string;
  displayName?: string;
}

// User Settings Types
export interface UserSettings {
  displayName: string;
  profilePicture: string | null; // base64 string
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}