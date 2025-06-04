import React, { useState, useMemo } from 'react';
import { Category, Transaction, ReportDateRange, CategorySpendingData } from '../types';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon
} from '../constants';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar
} from 'recharts';

interface ReportsProps {
  categories: Category[];
  transactions: Transaction[];
  totalIncome: number;
  formatCurrency: (amount: number) => string;
  selectedCurrency: string;
}

// Chart color palette
const CHART_COLORS = [
  '#0ea5e9', // sky-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#ef4444', // red-500
  '#8b5cf6', // violet-500
  '#06b6d4', // cyan-500
  '#84cc16', // lime-500
  '#f97316', // orange-500
  '#ec4899', // pink-500
  '#6366f1', // indigo-500
  '#14b8a6', // teal-500
  '#eab308'  // yellow-500
];

const Reports: React.FC<ReportsProps> = ({
  categories,
  transactions,
  totalIncome,
  formatCurrency,
  selectedCurrency
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedReportType, setSelectedReportType] = useState<'overview' | 'categories' | 'trends' | 'insights'>('overview');

  // Calculate date range based on selected period
  const dateRange = useMemo((): ReportDateRange => {
    const now = new Date();
    const endDate = now.toISOString().split('T')[0];
    let startDate: string;

    switch (selectedPeriod) {
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
        break;
      case 'month':
        const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        startDate = monthAgo.toISOString().split('T')[0];
        break;
      case 'quarter':
        const quarterAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        startDate = quarterAgo.toISOString().split('T')[0];
        break;
      case 'year':
        const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        startDate = yearAgo.toISOString().split('T')[0];
        break;
      default:
        startDate = endDate;
    }

    return { startDate, endDate };
  }, [selectedPeriod]);

  // Filter transactions by date range
  const filteredTransactions = useMemo(() => {
    return transactions.filter(transaction => {
      const transactionDate = transaction.date;
      return transactionDate >= dateRange.startDate && transactionDate <= dateRange.endDate;
    });
  }, [transactions, dateRange]);

  // Calculate spending data
  const spendingData = useMemo((): CategorySpendingData[] => {
    return categories.map(category => {
      const categoryTransactions = filteredTransactions.filter(t => t.categoryId === category.id && t.type === 'expense');
      const spent = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
      const allocated = category.allocatedAmount;
      const remaining = allocated - spent;
      const percentage = allocated > 0 ? (spent / allocated) * 100 : 0;

      return {
        categoryId: category.id,
        categoryName: category.name,
        allocated,
        spent,
        remaining,
        percentage
      };
    });
  }, [categories, filteredTransactions]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalSpent = spendingData.reduce((sum, cat) => sum + cat.spent, 0);
    const totalAllocated = spendingData.reduce((sum, cat) => sum + cat.allocated, 0);
    const totalRemaining = totalAllocated - totalSpent;
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalSpent) / totalIncome) * 100 : 0;

    return {
      totalSpent,
      totalAllocated,
      totalRemaining,
      savingsRate,
      transactionCount: filteredTransactions.length
    };
  }, [spendingData, totalIncome, filteredTransactions]);

  // Chart data processing
  const pieChartData = useMemo(() => {
    return spendingData
      .filter(cat => cat.spent > 0)
      .map((cat, index) => ({
        name: cat.categoryName,
        value: cat.spent,
        percentage: ((cat.spent / totals.totalSpent) * 100).toFixed(1),
        color: CHART_COLORS[index % CHART_COLORS.length]
      }));
  }, [spendingData, totals.totalSpent]);

  const barChartData = useMemo(() => {
    return spendingData.slice(0, 8).map((cat, index) => ({
      name: cat.categoryName.length > 12 ? cat.categoryName.substring(0, 12) + '...' : cat.categoryName,
      allocated: cat.allocated,
      spent: cat.spent,
      remaining: cat.remaining,
      color: CHART_COLORS[index % CHART_COLORS.length]
    }));
  }, [spendingData]);

  const trendData = useMemo(() => {
    const last6Months = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

      const monthTransactions = filteredTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return transactionDate.getMonth() === date.getMonth() &&
               transactionDate.getFullYear() === date.getFullYear();
      });

      const monthSpent = monthTransactions.reduce((sum, t) => sum + (t.type === 'expense' ? t.amount : 0), 0);
      const monthIncome = monthTransactions.reduce((sum, t) => sum + (t.type === 'income' ? t.amount : 0), 0);

      last6Months.push({
        month: monthName,
        spent: monthSpent,
        income: monthIncome,
        savings: monthIncome - monthSpent
      });
    }

    return last6Months;
  }, [filteredTransactions]);

  const savingsRateData = useMemo(() => {
    return [{
      name: 'Savings Rate',
      value: Math.max(0, Math.min(100, totals.savingsRate)),
      fill: totals.savingsRate > 20 ? '#10b981' : totals.savingsRate > 10 ? '#f59e0b' : '#ef4444'
    }];
  }, [totals.savingsRate]);

  // Export functionality
  const exportToCSV = () => {
    const csvContent = [
      ['Category', 'Allocated', 'Spent', 'Remaining', 'Percentage'].join(','),
      ...spendingData.map(cat => [
        cat.categoryName,
        cat.allocated.toString(),
        cat.spent.toString(),
        cat.remaining.toString(),
        cat.percentage.toFixed(2) + '%'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget-report-${selectedPeriod}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Custom tooltip components
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-slate-200 font-medium">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-800 p-3 rounded-lg border border-slate-600 shadow-lg">
          <p className="text-slate-200 font-medium">{data.name}</p>
          <p className="text-sm text-sky-400">Amount: {formatCurrency(data.value)}</p>
          <p className="text-sm text-emerald-400">Percentage: {data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Enhanced Summary Cards with Mini Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Spent</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totals.totalSpent)}</p>
              <p className="text-xs text-slate-500 mt-1">{totals.transactionCount} transactions</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
              <TrendingDownIcon className="w-6 h-6 text-red-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Total Allocated</p>
              <p className="text-2xl font-bold text-sky-400">{formatCurrency(totals.totalAllocated)}</p>
              <p className="text-xs text-slate-500 mt-1">{categories.length} categories</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-sky-500/20 flex items-center justify-center">
              <CurrencyDollarIcon className="w-6 h-6 text-sky-400" />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Remaining</p>
              <p className={`text-2xl font-bold ${totals.totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(totals.totalRemaining)}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {totals.totalAllocated > 0 ? ((totals.totalRemaining / totals.totalAllocated) * 100).toFixed(1) : '0'}% of budget
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
              totals.totalRemaining >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'
            }`}>
              <TrendingUpIcon className={`w-6 h-6 ${totals.totalRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`} />
            </div>
          </div>
        </div>

        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm">Savings Rate</p>
              <p className={`text-2xl font-bold ${
                totals.savingsRate > 20 ? 'text-emerald-400' :
                totals.savingsRate > 10 ? 'text-amber-400' : 'text-red-400'
              }`}>
                {totals.savingsRate.toFixed(1)}%
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {totals.savingsRate > 20 ? 'Excellent!' : totals.savingsRate > 10 ? 'Good' : 'Needs improvement'}
              </p>
            </div>
            <div className="w-12 h-12">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart data={savingsRateData}>
                  <RadialBar
                    dataKey="value"
                    cornerRadius={10}
                    fill={savingsRateData[0]?.fill}
                    background={{ fill: '#334155' }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending Distribution Pie Chart */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">Spending Distribution</h3>
          {pieChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No spending data available</p>
                <p className="text-sm text-slate-500 mt-2">Add some transactions to see the distribution</p>
              </div>
            </div>
          )}
        </div>

        {/* Budget vs Actual Bar Chart */}
        <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
          <h3 className="text-xl font-semibold text-sky-400 mb-4">Budget vs Actual Spending</h3>
          {barChartData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                  <XAxis
                    dataKey="name"
                    stroke="#94a3b8"
                    fontSize={12}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="allocated" fill="#0ea5e9" name="Allocated" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-80 flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No budget data available</p>
                <p className="text-sm text-slate-500 mt-2">Create categories to see budget comparison</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderCategories = () => (
    <div className="space-y-6">
      {/* Category Performance Chart */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Category Performance</h3>
        {spendingData.length > 0 ? (
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendingData} margin={{ top: 20, right: 30, left: 20, bottom: 80 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis
                  dataKey="categoryName"
                  stroke="#94a3b8"
                  fontSize={11}
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="allocated" fill="#0ea5e9" name="Allocated" radius={[2, 2, 0, 0]} />
                <Bar dataKey="spent" fill="#ef4444" name="Spent" radius={[2, 2, 0, 0]} />
                <Bar dataKey="remaining" fill="#10b981" name="Remaining" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No categories available</p>
              <p className="text-sm text-slate-500 mt-2">Create budget categories to see performance</p>
            </div>
          </div>
        )}
      </div>

      {/* Detailed Category Table */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Detailed Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-700">
                <th className="text-left py-3 px-4 text-slate-300">Category</th>
                <th className="text-right py-3 px-4 text-slate-300">Allocated</th>
                <th className="text-right py-3 px-4 text-slate-300">Spent</th>
                <th className="text-right py-3 px-4 text-slate-300">Remaining</th>
                <th className="text-right py-3 px-4 text-slate-300">Usage %</th>
                <th className="text-center py-3 px-4 text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {spendingData.map((category, index) => (
                <tr key={category.categoryId} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                      />
                      <span className="text-slate-200 font-medium">{category.categoryName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right text-slate-300">{formatCurrency(category.allocated)}</td>
                  <td className="py-3 px-4 text-right text-red-400">{formatCurrency(category.spent)}</td>
                  <td className={`py-3 px-4 text-right ${category.remaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {formatCurrency(category.remaining)}
                  </td>
                  <td className={`py-3 px-4 text-right font-medium ${category.percentage > 100 ? 'text-red-400' : 'text-emerald-400'}`}>
                    {category.percentage.toFixed(1)}%
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      category.percentage > 100 ? 'bg-red-500/20 text-red-400' :
                      category.percentage > 80 ? 'bg-amber-500/20 text-amber-400' :
                      'bg-emerald-500/20 text-emerald-400'
                    }`}>
                      {category.percentage > 100 ? 'Over Budget' :
                       category.percentage > 80 ? 'High Usage' : 'On Track'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderTrends = () => (
    <div className="space-y-6">
      {/* Monthly Spending Trends */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Monthly Spending Trends</h3>
        {trendData.length > 0 && trendData.some(d => d.spent > 0 || d.income > 0) ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="spent"
                  stroke="#ef4444"
                  strokeWidth={3}
                  name="Spent"
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10b981"
                  strokeWidth={3}
                  name="Income"
                  dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#0ea5e9"
                  strokeWidth={3}
                  name="Savings"
                  dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No trend data available</p>
              <p className="text-sm text-slate-500 mt-2">Add transactions over multiple months to see trends</p>
            </div>
          </div>
        )}
      </div>

      {/* Spending Pattern Area Chart */}
      <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
        <h3 className="text-xl font-semibold text-sky-400 mb-4">Spending Pattern</h3>
        {trendData.length > 0 && trendData.some(d => d.spent > 0) ? (
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="spent"
                  stackId="1"
                  stroke="#ef4444"
                  fill="#ef4444"
                  fillOpacity={0.6}
                  name="Spent"
                />
                <Area
                  type="monotone"
                  dataKey="savings"
                  stackId="1"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.6}
                  name="Savings"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center">
            <div className="text-center">
              <ChartBarIcon className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No spending pattern data</p>
              <p className="text-sm text-slate-500 mt-2">Track expenses over time to see patterns</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderInsights = () => {
    const insights = [];

    // Generate insights based on data
    if (totals.savingsRate > 20) {
      insights.push({
        type: 'positive',
        icon: '🎉',
        title: 'Excellent Savings!',
        message: `You're saving ${totals.savingsRate.toFixed(1)}% of your income. Keep up the great work!`
      });
    } else if (totals.savingsRate < 5) {
      insights.push({
        type: 'warning',
        icon: '⚠️',
        title: 'Low Savings Rate',
        message: `Only ${totals.savingsRate.toFixed(1)}% savings rate. Consider reducing expenses or increasing income.`
      });
    } else {
      insights.push({
        type: 'info',
        icon: '💡',
        title: 'Good Progress',
        message: `${totals.savingsRate.toFixed(1)}% savings rate is decent. Try to reach 20% for excellent financial health.`
      });
    }

    const overBudgetCategories = spendingData.filter(cat => cat.percentage > 100);
    if (overBudgetCategories.length > 0) {
      insights.push({
        type: 'warning',
        icon: '🚨',
        title: 'Budget Overruns',
        message: `${overBudgetCategories.length} categories are over budget: ${overBudgetCategories.map(c => c.categoryName).join(', ')}.`
      });
    }

    const topSpendingCategory = spendingData.length > 0 ? spendingData.reduce((max, cat) => cat.spent > max.spent ? cat : max, spendingData[0]) : null;
    if (topSpendingCategory && topSpendingCategory.spent > 0) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Top Spending Category',
        message: `"${topSpendingCategory.categoryName}" is your highest expense at ${formatCurrency(topSpendingCategory.spent)}.`
      });
    }

    const efficientCategories = spendingData.filter(cat => cat.percentage > 0 && cat.percentage <= 80);
    if (efficientCategories.length > 0) {
      insights.push({
        type: 'positive',
        icon: '✅',
        title: 'Well-Managed Categories',
        message: `${efficientCategories.length} categories are well within budget. Great financial discipline!`
      });
    }

    return (
      <div className="space-y-6">
        {/* Insights Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.length > 0 ? insights.map((insight, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border transition-all duration-200 hover:scale-105 ${
                insight.type === 'positive' ? 'bg-emerald-500/10 border-emerald-500 hover:bg-emerald-500/20' :
                insight.type === 'warning' ? 'bg-amber-500/10 border-amber-500 hover:bg-amber-500/20' :
                'bg-sky-500/10 border-sky-500 hover:bg-sky-500/20'
              }`}
            >
              <div className="flex items-start space-x-3">
                <span className="text-2xl">{insight.icon}</span>
                <div>
                  <h4 className={`font-semibold mb-2 ${
                    insight.type === 'positive' ? 'text-emerald-300' :
                    insight.type === 'warning' ? 'text-amber-300' :
                    'text-sky-300'
                  }`}>
                    {insight.title}
                  </h4>
                  <p className={`text-sm ${
                    insight.type === 'positive' ? 'text-emerald-200' :
                    insight.type === 'warning' ? 'text-amber-200' :
                    'text-sky-200'
                  }`}>
                    {insight.message}
                  </p>
                </div>
              </div>
            </div>
          )) : (
            <div className="col-span-2 text-center py-12">
              <div className="text-6xl mb-4">📈</div>
              <p className="text-slate-400 text-lg">No insights available yet</p>
              <p className="text-sm text-slate-500 mt-2">
                Add some transactions to get personalized financial insights
              </p>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        {spendingData.length > 0 && (
          <div className="bg-slate-800 p-6 rounded-lg border border-slate-700">
            <h3 className="text-xl font-semibold text-sky-400 mb-4">Quick Statistics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-400">{spendingData.filter(c => c.percentage <= 80).length}</div>
                <div className="text-sm text-slate-400">On Track</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-400">{spendingData.filter(c => c.percentage > 80 && c.percentage <= 100).length}</div>
                <div className="text-sm text-slate-400">High Usage</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-400">{spendingData.filter(c => c.percentage > 100).length}</div>
                <div className="text-sm text-slate-400">Over Budget</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-sky-400">{totals.transactionCount}</div>
                <div className="text-sm text-slate-400">Transactions</div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-sky-400">Financial Reports</h2>
          <p className="text-slate-400 mt-1">
            Analyze your spending patterns and track your financial progress
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Period Selector */}
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="bg-slate-700 border border-slate-600 text-slate-200 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <DocumentArrowDownIcon className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Type Tabs */}
      <div className="flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'categories', label: 'Categories' },
          { id: 'trends', label: 'Trends' },
          { id: 'insights', label: 'Insights' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedReportType(tab.id as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
              selectedReportType === tab.id
                ? 'bg-sky-600 text-white'
                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Report Content */}
      {selectedReportType === 'overview' && renderOverview()}
      {selectedReportType === 'categories' && renderCategories()}
      {selectedReportType === 'trends' && renderTrends()}
      {selectedReportType === 'insights' && renderInsights()}
    </div>
  );
};

export default Reports;
