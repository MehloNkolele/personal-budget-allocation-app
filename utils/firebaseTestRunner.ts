import { FirebaseDataManager } from '../services/firebaseDataManager';
import { DataMigrationService } from '../services/dataMigrationService';
import { BudgetHelpers } from './budgetHelpers';
import { Category, Transaction, BudgetTemplate, MonthlyBudget } from '../types';

export interface TestResult {
  testName: string;
  passed: boolean;
  error?: string;
  duration: number;
}

export interface TestSuite {
  suiteName: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  totalDuration: number;
}

export class FirebaseTestRunner {
  private static testUserId = 'test-user-' + Date.now();
  
  // Run all tests
  static async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting Firebase Integration Tests...');
    
    const suites: TestSuite[] = [];
    
    try {
      // Run test suites
      suites.push(await this.runBudgetDataTests());
      suites.push(await this.runCategoryTests());
      suites.push(await this.runTransactionTests());
      suites.push(await this.runMonthlyBudgetTests());
      suites.push(await this.runBudgetTemplateTests());
      suites.push(await this.runMigrationTests());
      
      // Print summary
      this.printTestSummary(suites);
      
    } catch (error) {
      console.error('❌ Test runner failed:', error);
    } finally {
      // Cleanup test data
      await this.cleanup();
    }
    
    return suites;
  }
  
  // Budget Data Tests
  static async runBudgetDataTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Budget Data Management',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0
    };
    
    // Test 1: Create budget data
    suite.results.push(await this.runTest('Create Budget Data', async () => {
      await FirebaseDataManager.createBudgetData(this.testUserId, {
        totalIncome: 5000,
        selectedCurrency: 'USD',
        areGlobalAmountsHidden: false,
        isIncomeHidden: true,
        categories: [],
        transactions: [],
        monthlyBudgets: []
      });
    }));
    
    // Test 2: Get budget data
    suite.results.push(await this.runTest('Get Budget Data', async () => {
      const data = await FirebaseDataManager.getBudgetData(this.testUserId);
      if (data.totalIncome !== 5000) throw new Error('Income mismatch');
      if (data.selectedCurrency !== 'USD') throw new Error('Currency mismatch');
    }));
    
    // Test 3: Update budget data
    suite.results.push(await this.runTest('Update Budget Data', async () => {
      await FirebaseDataManager.updateBudgetData(this.testUserId, {
        totalIncome: 6000,
        selectedCurrency: 'EUR'
      });
      
      const data = await FirebaseDataManager.getBudgetData(this.testUserId);
      if (data.totalIncome !== 6000) throw new Error('Income update failed');
      if (data.selectedCurrency !== 'EUR') throw new Error('Currency update failed');
    }));
    
    this.calculateSuiteStats(suite);
    return suite;
  }
  
  // Category Tests
  static async runCategoryTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Category Management',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0
    };
    
    let categoryId: string;
    
    // Test 1: Add category
    suite.results.push(await this.runTest('Add Category', async () => {
      categoryId = await FirebaseDataManager.addCategory(this.testUserId, {
        name: 'Test Category',
        allocatedAmount: 1000,
        subcategories: [],
        isAmountHidden: false
      });
      if (!categoryId) throw new Error('Category ID not returned');
    }));
    
    // Test 2: Get categories
    suite.results.push(await this.runTest('Get Categories', async () => {
      const categories = await FirebaseDataManager.getCategories(this.testUserId);
      if (categories.length !== 1) throw new Error('Category count mismatch');
      if (categories[0].name !== 'Test Category') throw new Error('Category name mismatch');
    }));
    
    // Test 3: Update category
    suite.results.push(await this.runTest('Update Category', async () => {
      await FirebaseDataManager.updateCategory(this.testUserId, categoryId, {
        name: 'Updated Category',
        allocatedAmount: 1500
      });
      
      const categories = await FirebaseDataManager.getCategories(this.testUserId);
      if (categories[0].name !== 'Updated Category') throw new Error('Name update failed');
      if (categories[0].allocatedAmount !== 1500) throw new Error('Amount update failed');
    }));
    
    // Test 4: Delete category
    suite.results.push(await this.runTest('Delete Category', async () => {
      await FirebaseDataManager.deleteCategory(this.testUserId, categoryId);
      
      const categories = await FirebaseDataManager.getCategories(this.testUserId);
      if (categories.length !== 0) throw new Error('Category not deleted');
    }));
    
    this.calculateSuiteStats(suite);
    return suite;
  }
  
  // Transaction Tests
  static async runTransactionTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Transaction Management',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0
    };
    
    let transactionId: string;
    
    // Test 1: Add transaction
    suite.results.push(await this.runTest('Add Transaction', async () => {
      transactionId = await FirebaseDataManager.addTransaction(this.testUserId, {
        amount: 100,
        description: 'Test Transaction',
        categoryId: 'test-category',
        date: new Date().toISOString(),
        type: 'expense',
        tags: ['test']
      });
      if (!transactionId) throw new Error('Transaction ID not returned');
    }));
    
    // Test 2: Get transactions
    suite.results.push(await this.runTest('Get Transactions', async () => {
      const transactions = await FirebaseDataManager.getTransactions(this.testUserId);
      if (transactions.length !== 1) throw new Error('Transaction count mismatch');
      if (transactions[0].description !== 'Test Transaction') throw new Error('Description mismatch');
    }));
    
    // Test 3: Update transaction
    suite.results.push(await this.runTest('Update Transaction', async () => {
      await FirebaseDataManager.updateTransaction(this.testUserId, transactionId, {
        amount: 150,
        description: 'Updated Transaction'
      });
      
      const transactions = await FirebaseDataManager.getTransactions(this.testUserId);
      if (transactions[0].amount !== 150) throw new Error('Amount update failed');
      if (transactions[0].description !== 'Updated Transaction') throw new Error('Description update failed');
    }));
    
    // Test 4: Delete transaction
    suite.results.push(await this.runTest('Delete Transaction', async () => {
      await FirebaseDataManager.deleteTransaction(this.testUserId, transactionId);
      
      const transactions = await FirebaseDataManager.getTransactions(this.testUserId);
      if (transactions.length !== 0) throw new Error('Transaction not deleted');
    }));
    
    this.calculateSuiteStats(suite);
    return suite;
  }
  
  // Monthly Budget Tests
  static async runMonthlyBudgetTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Monthly Budget Management',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0
    };
    
    let budgetId: string;
    const monthKey = BudgetHelpers.getCurrentMonthKey();
    
    // Test 1: Add monthly budget
    suite.results.push(await this.runTest('Add Monthly Budget', async () => {
      const { year, month } = BudgetHelpers.parseMonthKey(monthKey);
      budgetId = await FirebaseDataManager.addMonthlyBudget(this.testUserId, {
        month: monthKey,
        year,
        monthName: BudgetHelpers.getMonthName(year, month),
        totalIncome: 5000,
        categories: [],
        transactions: []
      });
      if (!budgetId) throw new Error('Budget ID not returned');
    }));
    
    // Test 2: Get monthly budgets
    suite.results.push(await this.runTest('Get Monthly Budgets', async () => {
      const budgets = await FirebaseDataManager.getMonthlyBudgets(this.testUserId);
      if (budgets.length !== 1) throw new Error('Budget count mismatch');
      if (budgets[0].month !== monthKey) throw new Error('Month mismatch');
    }));
    
    // Test 3: Delete monthly budget
    suite.results.push(await this.runTest('Delete Monthly Budget', async () => {
      await FirebaseDataManager.deleteMonthlyBudget(this.testUserId, budgetId);
      
      const budgets = await FirebaseDataManager.getMonthlyBudgets(this.testUserId);
      if (budgets.length !== 0) throw new Error('Budget not deleted');
    }));
    
    this.calculateSuiteStats(suite);
    return suite;
  }
  
  // Budget Template Tests
  static async runBudgetTemplateTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Budget Template Management',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0
    };
    
    let templateId: string;
    
    // Test 1: Add budget template
    suite.results.push(await this.runTest('Add Budget Template', async () => {
      templateId = await FirebaseDataManager.addBudgetTemplate(this.testUserId, {
        name: 'Test Template',
        description: 'Test Description',
        totalIncome: 5000,
        categories: []
      });
      if (!templateId) throw new Error('Template ID not returned');
    }));
    
    // Test 2: Get budget templates
    suite.results.push(await this.runTest('Get Budget Templates', async () => {
      const templates = await FirebaseDataManager.getBudgetTemplates(this.testUserId);
      if (templates.length !== 1) throw new Error('Template count mismatch');
      if (templates[0].name !== 'Test Template') throw new Error('Name mismatch');
    }));
    
    // Test 3: Delete budget template
    suite.results.push(await this.runTest('Delete Budget Template', async () => {
      await FirebaseDataManager.deleteBudgetTemplate(this.testUserId, templateId);
      
      const templates = await FirebaseDataManager.getBudgetTemplates(this.testUserId);
      if (templates.length !== 0) throw new Error('Template not deleted');
    }));
    
    this.calculateSuiteStats(suite);
    return suite;
  }
  
  // Migration Tests
  static async runMigrationTests(): Promise<TestSuite> {
    const suite: TestSuite = {
      suiteName: 'Data Migration',
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      totalDuration: 0
    };
    
    // Test 1: Migration status check
    suite.results.push(await this.runTest('Migration Status Check', async () => {
      const status = DataMigrationService.getMigrationStatus(this.testUserId);
      if (typeof status.isCompleted !== 'boolean') throw new Error('Invalid status format');
    }));
    
    // Test 2: Export data functionality
    suite.results.push(await this.runTest('Export Data', async () => {
      const exportData = DataMigrationService.exportLocalStorageData(this.testUserId);
      if (!exportData || typeof exportData !== 'string') throw new Error('Export failed');
      
      const parsed = JSON.parse(exportData);
      if (!parsed.exportDate) throw new Error('Export date missing');
    }));
    
    this.calculateSuiteStats(suite);
    return suite;
  }
  
  // Helper method to run individual test
  private static async runTest(testName: string, testFn: () => Promise<void>): Promise<TestResult> {
    const startTime = Date.now();
    
    try {
      await testFn();
      const duration = Date.now() - startTime;
      console.log(`✅ ${testName} (${duration}ms)`);
      return { testName, passed: true, duration };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ ${testName} (${duration}ms): ${errorMessage}`);
      return { testName, passed: false, error: errorMessage, duration };
    }
  }
  
  // Calculate suite statistics
  private static calculateSuiteStats(suite: TestSuite): void {
    suite.totalTests = suite.results.length;
    suite.passedTests = suite.results.filter(r => r.passed).length;
    suite.failedTests = suite.totalTests - suite.passedTests;
    suite.totalDuration = suite.results.reduce((sum, r) => sum + r.duration, 0);
  }
  
  // Print test summary
  private static printTestSummary(suites: TestSuite[]): void {
    console.log('\n📊 Test Summary:');
    console.log('================');
    
    let totalTests = 0;
    let totalPassed = 0;
    let totalDuration = 0;
    
    suites.forEach(suite => {
      totalTests += suite.totalTests;
      totalPassed += suite.passedTests;
      totalDuration += suite.totalDuration;
      
      const passRate = ((suite.passedTests / suite.totalTests) * 100).toFixed(1);
      console.log(`${suite.suiteName}: ${suite.passedTests}/${suite.totalTests} (${passRate}%) - ${suite.totalDuration}ms`);
    });
    
    const overallPassRate = ((totalPassed / totalTests) * 100).toFixed(1);
    console.log(`\nOverall: ${totalPassed}/${totalTests} (${overallPassRate}%) - ${totalDuration}ms`);
    
    if (totalPassed === totalTests) {
      console.log('🎉 All tests passed!');
    } else {
      console.log(`⚠️  ${totalTests - totalPassed} test(s) failed`);
    }
  }
  
  // Cleanup test data
  private static async cleanup(): Promise<void> {
    try {
      await FirebaseDataManager.clearUserData(this.testUserId);
      console.log('🧹 Test cleanup completed');
    } catch (error) {
      console.warn('⚠️  Test cleanup failed:', error);
    }
  }
}
