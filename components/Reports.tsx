import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Transaction, ReportDateRange, CategorySpendingData } from '../types';
import {
  ChartBarIcon,
  DocumentArrowDownIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  LightBulbIcon
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

const reportTypes = [
  { id: 'overview', name: 'Financial Overview', icon: EyeIcon },
  { id: 'categories', name: 'Category Analysis', icon: ChartBarIcon },
  { id: 'trends', name: 'Spending Trends', icon: TrendingUpIcon },
  { id: 'insights', name: 'Financial Insights', icon: LightBulbIcon }
];

const Reports: React.FC<ReportsProps> = ({
  categories,
  transactions,
  totalIncome,
  formatCurrency,
  selectedCurrency
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedReportType, setSelectedReportType] = useState<string>('overview');

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

  const renderNoData = (message: string) => (
    <div className="flex flex-col items-center justify-center h-64 bg-slate-800/50 rounded-2xl">
      <ExclamationTriangleIcon className="w-12 h-12 text-slate-600 mb-4" />
      <h3 className="text-lg font-semibold text-slate-300">No Data Available</h3>
      <p className="text-slate-400">{message}</p>
    </div>
  );

  const ReportCard: React.FC<{title: string, children: React.ReactNode, icon?: React.ElementType}> = ({ title, children, icon: Icon }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="bg-slate-800/50 rounded-2xl border border-slate-700 overflow-hidden"
    >
      <div className="p-5 border-b border-slate-700 flex items-center gap-3">
        {Icon && <Icon className="w-6 h-6 text-sky-400" />}
        <h3 className="text-lg font-bold text-white">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </motion.div>
  );

  const renderOverview = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      <StatCard title="Total Spent" value={formatCurrency(totals.totalSpent)} icon={TrendingDownIcon} color="text-red-400" />
      <StatCard title="Total Allocated" value={formatCurrency(totals.totalAllocated)} icon={CurrencyDollarIcon} color="text-sky-400" />
      <StatCard title="Savings Rate" value={`${totals.savingsRate.toFixed(1)}%`} icon={TrendingUpIcon} color="text-emerald-400" />
      <StatCard title="Transactions" value={totals.transactionCount.toString()} icon={ChartBarIcon} color="text-amber-400" />
      
      <div className="lg:col-span-2 xl:col-span-4">
        <ReportCard title="Spending by Category" icon={ChartBarIcon}>
          {pieChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={120} labelLine={false} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieChartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip content={<PieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          ) : renderNoData("No spending recorded for this period.")}
        </ReportCard>
      </div>
    </div>
  );
  
  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string; icon: React.ElementType; color: string; }) => (
     <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700 flex flex-col justify-between">
        <div>
            <div className="flex items-center justify-between mb-4">
                <p className="text-slate-400">{title}</p>
                <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <p className={`text-3xl font-bold text-white ${color}`}>{value}</p>
        </div>
    </div>
  );


  const renderCategories = () => {
    const sortedSpending = [...spendingData].sort((a, b) => b.spent - a.spent).slice(0, 8);

    return (
      <ReportCard title="Category Spending Analysis" icon={ChartBarIcon}>
        {sortedSpending.length > 0 ? (
          <div className="space-y-6">
            {sortedSpending.map(cat => {
              const percentage = cat.allocated > 0 ? (cat.spent / cat.allocated) * 100 : 0;
              const isOverBudget = percentage > 100;
              let progressBarColor = 'bg-sky-500';
              if (percentage > 100) progressBarColor = 'bg-red-500';
              else if (percentage > 80) progressBarColor = 'bg-amber-500';

              return (
                <motion.div
                  key={cat.categoryId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-slate-200">{cat.categoryName}</span>
                    <span className="text-sm font-medium text-slate-300">
                      {formatCurrency(cat.spent)}
                      <span className="text-slate-500"> / {formatCurrency(cat.allocated)}</span>
                    </span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-2.5 relative">
                    <motion.div
                      className={`h-2.5 rounded-full ${progressBarColor}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(percentage, 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                  </div>
                  {isOverBudget && (
                    <p className="text-xs text-red-400 mt-1 text-right font-medium">
                      Over budget by {formatCurrency(cat.spent - cat.allocated)}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : renderNoData("No category spending to analyze.")}
      </ReportCard>
    );
  };

  const renderTrends = () => (
     <ReportCard title="Income vs. Spending Trend" icon={TrendingUpIcon}>
      {trendData.length > 0 ? (
        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" tickFormatter={formatCurrency}/>
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area type="monotone" dataKey="income" stroke="#10b981" fill="#10b981" fillOpacity={0.2} name="Income" />
            <Area type="monotone" dataKey="spent" stroke="#ef4444" fill="#ef4444" fillOpacity={0.2} name="Spent" />
          </AreaChart>
        </ResponsiveContainer>
      ) : renderNoData("Not enough data to show trends.")}
    </ReportCard>
  );

  const renderInsights = () => {
    const topSpendingCategory = [...spendingData].sort((a, b) => b.spent - a.spent)[0];
    const overspentCategories = spendingData.filter(c => c.spent > c.allocated);

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ReportCard title="Top Spending Category" icon={CurrencyDollarIcon}>
          {topSpendingCategory && topSpendingCategory.spent > 0 ? (
            <div>
              <p className="text-2xl font-bold text-sky-400">{topSpendingCategory.categoryName}</p>
              <p className="text-4xl font-extrabold text-white mt-2">{formatCurrency(topSpendingCategory.spent)}</p>
              <p className="text-slate-400 mt-1">This is your highest spending area this period.</p>
            </div>
          ) : renderNoData("No spending data available.")}
        </ReportCard>
        
        <ReportCard title="Overspent Categories" icon={ExclamationTriangleIcon}>
          {overspentCategories.length > 0 ? (
            <ul className="space-y-3">
              {overspentCategories.map(cat => (
                <li key={cat.categoryId} className="flex justify-between items-center">
                  <span className="text-slate-300">{cat.categoryName}</span>
                  <span className="font-semibold text-red-400">
                    +{formatCurrency(cat.spent - cat.allocated)}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-lg text-emerald-400 font-semibold">Great Job!</p>
              <p className="text-slate-400">No categories are overspent.</p>
            </div>
          )}
        </ReportCard>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (selectedReportType) {
      case 'overview': return renderOverview();
      case 'categories': return renderCategories();
      case 'trends': return renderTrends();
      case 'insights': return renderInsights();
      default: return null;
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-slate-900 min-h-screen text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white">Financial Reports</h1>
          <p className="text-slate-400 mt-2">Analyze your financial activity with detailed reports.</p>
        </div>
        <button 
          onClick={exportToCSV}
          className="mt-4 sm:mt-0 flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
        >
          <DocumentArrowDownIcon className="w-5 h-5"/>
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar: Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-sky-400 mb-3">Report Type</h2>
            <div className="space-y-2">
              {reportTypes.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedReportType(report.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-200 ${
                    selectedReportType === report.id
                      ? 'bg-sky-500/20 text-white font-semibold'
                      : 'bg-slate-800/50 hover:bg-slate-700/70 text-slate-300'
                  }`}
                >
                  <report.icon className={`w-5 h-5 ${selectedReportType === report.id ? 'text-sky-400' : 'text-slate-400'}`} />
                  {report.name}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-sky-400 mb-3">Date Range</h2>
            <div className="flex bg-slate-800/80 rounded-full p-1">
              {(['week', 'month', 'quarter', 'year'] as const).map(period => (
                <button
                  key={period}
                  onClick={() => setSelectedPeriod(period)}
                  className={`w-1/4 py-2 text-sm font-semibold rounded-full capitalize transition-colors ${
                    selectedPeriod === period ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Content: Reports */}
        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedReportType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Reports;
