// Budget utility functions that were previously in UserDataManager
// These are pure utility functions that don't depend on storage

export class BudgetHelpers {
  // Format month key for storage (YYYY-MM format)
  static formatMonthKey(year: number, month: number): string {
    return `${year}-${month.toString().padStart(2, '0')}`;
  }

  // Parse month key back to year and month
  static parseMonthKey(monthKey: string): { year: number; month: number } {
    const [yearStr, monthStr] = monthKey.split('-');
    return {
      year: parseInt(yearStr, 10),
      month: parseInt(monthStr, 10)
    };
  }

  // Get human-readable month name
  static getMonthName(year: number, month: number): string {
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  // Generate unique ID for monthly budget
  static generateMonthlyBudgetId(): string {
    return `budget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Generate unique ID for budget template
  static generateBudgetTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get current month key
  static getCurrentMonthKey(): string {
    const now = new Date();
    return this.formatMonthKey(now.getFullYear(), now.getMonth() + 1);
  }

  // Get next month key
  static getNextMonthKey(): string {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    return this.formatMonthKey(nextMonth.getFullYear(), nextMonth.getMonth() + 1);
  }

  // Generate available months for planning (current + next 12 months)
  static getAvailableMonths(count: number = 13): Array<{ key: string; name: string }> {
    const months = [];
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const monthKey = this.formatMonthKey(date.getFullYear(), date.getMonth() + 1);
      const monthName = this.getMonthName(date.getFullYear(), date.getMonth() + 1);
      months.push({ key: monthKey, name: monthName });
    }
    
    return months;
  }

  // Validate month key format
  static isValidMonthKey(monthKey: string): boolean {
    const regex = /^\d{4}-\d{2}$/;
    if (!regex.test(monthKey)) return false;
    
    const { year, month } = this.parseMonthKey(monthKey);
    return year >= 2020 && year <= 2100 && month >= 1 && month <= 12;
  }

  // Compare month keys for sorting
  static compareMonthKeys(a: string, b: string): number {
    const dateA = new Date(a + '-01');
    const dateB = new Date(b + '-01');
    return dateB.getTime() - dateA.getTime(); // Descending order (newest first)
  }

  // Check if month key is in the past
  static isMonthInPast(monthKey: string): boolean {
    const currentMonthKey = this.getCurrentMonthKey();
    return monthKey < currentMonthKey;
  }

  // Check if month key is current month
  static isCurrentMonth(monthKey: string): boolean {
    return monthKey === this.getCurrentMonthKey();
  }

  // Get month difference between two month keys
  static getMonthDifference(fromMonthKey: string, toMonthKey: string): number {
    const from = this.parseMonthKey(fromMonthKey);
    const to = this.parseMonthKey(toMonthKey);
    
    return (to.year - from.year) * 12 + (to.month - from.month);
  }

  // Get quarter from month key
  static getQuarter(monthKey: string): number {
    const { month } = this.parseMonthKey(monthKey);
    return Math.ceil(month / 3);
  }

  // Get fiscal year (assuming April-March fiscal year)
  static getFiscalYear(monthKey: string): number {
    const { year, month } = this.parseMonthKey(monthKey);
    return month >= 4 ? year : year - 1;
  }
}
