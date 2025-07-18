# Firestore Data Structure

This document defines the Firestore database structure for the Personal Budget Allocation App.

## Overview

The database is organized with user-centric collections to ensure data isolation and efficient querying. Each user's data is stored under their unique user ID (UID) from Firebase Authentication.

## Collection Structure

```
/users/{userId}/
├── profile (document)
├── budgetData (document)  
├── categories (collection)
├── transactions (collection)
├── monthlyBudgets (collection)
└── budgetTemplates (collection)
```

## Document Schemas

### 1. User Profile (`/users/{userId}/profile`)
```typescript
{
  displayName: string;
  photoURL: string | null;
  email: string;
  emailVerified: boolean;
  preferences: {
    security: {
      isEnabled: boolean;
      authMethod: 'pin' | 'biometric' | 'both';
      pinHash?: string;
      requireOnAppResume: boolean;
      requireOnSensitiveActions: boolean;
    }
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 2. Budget Data (`/users/{userId}/budgetData`)
```typescript
{
  totalIncome: number;
  selectedCurrency: string;
  areGlobalAmountsHidden: boolean;
  isIncomeHidden: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 3. Categories (`/users/{userId}/categories/{categoryId}`)
```typescript
{
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  subcategories: Subcategory[];
  isAmountHidden: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Subcategory interface (embedded in category)
interface Subcategory {
  id: string;
  name: string;
  allocatedAmount: number;
  spentAmount: number;
  isComplete: boolean;
}
```

### 4. Transactions (`/users/{userId}/transactions/{transactionId}`)
```typescript
{
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  date: Timestamp;
  type: 'expense' | 'income';
  tags: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 5. Monthly Budgets (`/users/{userId}/monthlyBudgets/{budgetId}`)
```typescript
{
  id: string;
  month: string; // Format: "YYYY-MM"
  year: number;
  monthName: string; // e.g., "January 2024"
  totalIncome: number;
  categories: Category[]; // Snapshot of categories for this month
  transactions: Transaction[]; // Snapshot of transactions for this month
  isTemplate: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

### 6. Budget Templates (`/users/{userId}/budgetTemplates/{templateId}`)
```typescript
{
  id: string;
  name: string;
  description: string;
  totalIncome: number;
  categories: Omit<Category, 'spentAmount'>[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

## Indexing Strategy

### Composite Indexes
1. **Transactions by date and category**: `(userId, date desc, categoryId)`
2. **Transactions by type and date**: `(userId, type, date desc)`
3. **Monthly budgets by year and month**: `(userId, year desc, month desc)`

### Single Field Indexes
- All timestamp fields for sorting
- Category and subcategory IDs for filtering
- Transaction types for filtering

## Security Considerations

1. **User Isolation**: All data is scoped to the authenticated user's UID
2. **Authentication Required**: All operations require valid Firebase Authentication
3. **Data Validation**: Server-side validation for all data types and constraints
4. **Rate Limiting**: Firestore's built-in rate limiting protects against abuse

## Migration Strategy

1. **Detection**: Check for existing localStorage data on user login
2. **Migration**: Transfer localStorage data to Firestore collections
3. **Validation**: Verify data integrity after migration
4. **Cleanup**: Clear localStorage only after successful Firestore save
5. **Marking**: Set migration flag to prevent re-migration

## Real-time Updates

- **Categories**: Real-time listener for immediate UI updates
- **Transactions**: Real-time listener with optimistic updates
- **Budget Data**: Real-time listener for income and settings changes
- **Monthly Budgets**: On-demand loading with caching

## Offline Support

- **Firestore Persistence**: Enable offline persistence for all collections
- **Conflict Resolution**: Last-write-wins for most data
- **Sync Indicators**: Show sync status in UI
- **Error Handling**: Graceful degradation when offline
