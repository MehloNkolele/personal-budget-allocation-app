import { Category, Subcategory } from '../types';
import { UserDataManager } from './userDataManager';

// Sample data that matches the screenshot structure but with more variety
export const generateSampleCategories = (): Category[] => {
  const categories: Category[] = [
    {
      id: UserDataManager.generateCategoryId(),
      name: 'Savings',
      allocatedAmount: 10000,
      spentAmount: 0,
      subcategories: [
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Emergency Fund',
          allocatedAmount: 6000,
          spentAmount: 0,
          isComplete: false
        },
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Investment Account',
          allocatedAmount: 4000,
          spentAmount: 0,
          isComplete: true
        }
      ],
      isAmountHidden: false
    },
    {
      id: UserDataManager.generateCategoryId(),
      name: 'Housing',
      allocatedAmount: 8000,
      spentAmount: 0,
      subcategories: [
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Rent/Mortgage',
          allocatedAmount: 6000,
          spentAmount: 0,
          isComplete: false
        },
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Utilities',
          allocatedAmount: 1200,
          spentAmount: 0,
          isComplete: false
        },
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Home Insurance',
          allocatedAmount: 800,
          spentAmount: 0,
          isComplete: true
        }
      ],
      isAmountHidden: false
    },
    {
      id: UserDataManager.generateCategoryId(),
      name: 'Food & Dining',
      allocatedAmount: 3500,
      spentAmount: 0,
      subcategories: [
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Groceries',
          allocatedAmount: 2500,
          spentAmount: 0,
          isComplete: false
        },
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Restaurants',
          allocatedAmount: 1000,
          spentAmount: 0,
          isComplete: false
        }
      ],
      isAmountHidden: false
    },
    {
      id: UserDataManager.generateCategoryId(),
      name: 'Transportation',
      allocatedAmount: 2500,
      spentAmount: 0,
      subcategories: [
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Car Payment',
          allocatedAmount: 1500,
          spentAmount: 0,
          isComplete: false
        },
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Gas & Maintenance',
          allocatedAmount: 1000,
          spentAmount: 0,
          isComplete: false
        }
      ],
      isAmountHidden: false
    },
    {
      id: UserDataManager.generateCategoryId(),
      name: 'Entertainment',
      allocatedAmount: 1500,
      spentAmount: 0,
      subcategories: [
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Streaming Services',
          allocatedAmount: 500,
          spentAmount: 0,
          isComplete: true
        },
        {
          id: UserDataManager.generateSubcategoryId(),
          name: 'Activities & Hobbies',
          allocatedAmount: 1000,
          spentAmount: 0,
          isComplete: false
        }
      ],
      isAmountHidden: false
    }
  ];

  return categories;
};

// Sample income that matches the total allocations
export const getSampleIncome = (): number => {
  return 30000; // ZAR 30,000 which allows for some unallocated amount
};

// Generate some realistic sample data for the dashboard
export const getSampleData = () => {
  const categories = generateSampleCategories();
  const totalIncome = getSampleIncome();
  const totalAllocated = categories.reduce((sum, cat) => sum + cat.allocatedAmount, 0);
  const unallocatedAmount = totalIncome - totalAllocated;
  
  return {
    categories,
    totalIncome,
    totalAllocated,
    unallocatedAmount,
    selectedCurrency: 'ZAR' // South African Rand to match the screenshot
  };
};
