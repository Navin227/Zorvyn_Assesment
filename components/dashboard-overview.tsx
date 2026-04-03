'use client';

import React from 'react';
import { useAppContext } from '@/app/page';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';

interface BalanceTrend {
  month: string;
  balance: number;
}

interface SpendingByCategory {
  name: string;
  value: number;
}

export function DashboardOverview() {
  const { transactions, isLoading } = useAppContext();

  // Get current and previous month
  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Current month metrics
  const currentMonthIncome = transactions
    .filter((t) => t.type === 'income' && new Date(t.date).getMonth() + 1 === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && new Date(t.date).getMonth() + 1 === currentMonth && new Date(t.date).getFullYear() === currentYear)
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

  // Previous month metrics
  const prevMonthIncome = transactions
    .filter((t) => t.type === 'income' && new Date(t.date).getMonth() + 1 === prevMonth && new Date(t.date).getFullYear() === prevYear)
    .reduce((sum, t) => sum + t.amount, 0);

  const prevMonthExpenses = transactions
    .filter((t) => t.type === 'expense' && new Date(t.date).getMonth() + 1 === prevMonth && new Date(t.date).getFullYear() === prevYear)
    .reduce((sum, t) => sum + t.amount, 0);

  const incomeChange = prevMonthIncome ? ((currentMonthIncome - prevMonthIncome) / prevMonthIncome) * 100 : 0;
  const expenseChange = prevMonthExpenses ? ((currentMonthExpenses - prevMonthExpenses) / prevMonthExpenses) * 100 : 0;

  // Generate balance trend data
  const balanceTrendData: BalanceTrend[] = [
    { month: 'Jan', balance: 5000 },
    { month: 'Feb', balance: 7200 },
    { month: 'Mar', balance: 6800 },
    { month: 'Apr', balance: 8500 },
    { month: 'May', balance: 9200 },
    { month: 'Jun', balance: 11000 },
  ];

  // Generate spending by category
  const spendingByCategory: SpendingByCategory[] = [
    { name: 'Food', value: 410 },
    { name: 'Transportation', value: 80 },
    { name: 'Rent', value: 1200 },
    { name: 'Entertainment', value: 95 },
    { name: 'Utilities', value: 150 },
  ];

  const totalSpending = spendingByCategory.reduce((sum, category) => sum + category.value, 0);

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6 rounded-xl shadow-lg">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>
              <Skeleton className="h-3 w-20 mt-3" />
            </Card>
          ))}
        </div>

        {/* Loading Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 p-6 rounded-xl shadow-lg">
            <Skeleton className="h-6 w-32 mb-6" />
            <Skeleton className="h-80 w-full" />
          </Card>
          <Card className="p-6 rounded-xl shadow-lg">
            <Skeleton className="h-6 w-40 mb-6" />
            <Skeleton className="h-80 w-full" />
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <Card className="p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">This Month's Balance</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                ${currentMonthBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-800">
              <Wallet className="w-6 h-6 text-blue-700 dark:text-blue-300" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">Current month income minus expenses</p>
        </Card>

        {/* Total Income Card */}
        <Card className="p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">This Month's Income</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                ${currentMonthIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {incomeChange > 0 ? (
                  <ArrowUpIcon className="w-4 h-4 text-green-600" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-red-600" />
                )}
                <span className={`text-xs font-semibold ${incomeChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {Math.abs(incomeChange).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
              <TrendingUp className="w-6 h-6 text-green-700 dark:text-green-200" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">vs last month</p>
        </Card>

        {/* Total Expenses Card */}
        <Card className="p-6 shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-500 dark:text-gray-400 mb-1">This Month's Expenses</p>
              <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white">
                ${currentMonthExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
              <div className="flex items-center gap-1 mt-2">
                {expenseChange > 0 ? (
                  <ArrowUpIcon className="w-4 h-4 text-red-600" />
                ) : (
                  <ArrowDownIcon className="w-4 h-4 text-green-600" />
                )}
                <span className={`text-xs font-semibold ${expenseChange > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {Math.abs(expenseChange).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="p-3 rounded-full bg-red-100 dark:bg-red-900">
              <TrendingDown className="w-6 h-6 text-red-700 dark:text-red-200" />
            </div>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">vs last month</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Trend Chart */}
        <Card className="lg:col-span-2 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Balance Trend</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">Last 6 months</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceTrendData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="month" stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 600 }} label={{ value: 'Month', position: 'insideBottom', dy: 16, fill: '#e5e7eb', fontSize: 13, fontWeight: 700 }} />
              <YAxis stroke="#9ca3af" axisLine={false} tickLine={false} tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 600 }} label={{ value: 'Balance ($)', angle: -90, position: 'insideLeft', dx: -10, fill: '#e5e7eb', fontSize: 13, fontWeight: 700 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: `1px solid #334155`,
                  borderRadius: '8px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.12)',
                }}
                labelStyle={{ color: '#f1f5f9', fontWeight: 700 }}
                itemStyle={{ color: '#f1f5f9', fontWeight: 600 }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="#38bdf8"
                strokeWidth={3}
                dot={{ fill: '#60a5fa', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Spending by Category */}
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending by Category</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">This month</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByCategory}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                label={({ name, value }) => `${name} ${(value / totalSpending * 100).toFixed(1)}%`}
                labelLine={false}
              >
                {spendingByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: `1px solid #334155`,
                  borderRadius: '8px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                }}
                labelStyle={{ color: '#f1f5f9' }}
              />
              <Legend
                verticalAlign="bottom"
                height={40}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px', color: '#9ca3af', marginTop: 10 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-2">
            {spendingByCategory.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-gray-600 dark:text-gray-400">{category.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">${category.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
