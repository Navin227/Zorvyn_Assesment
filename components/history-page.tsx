'use client';

import React, { useMemo, useState } from 'react';
import { useAppContext } from '@/app/page';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, Legend } from 'recharts';

type HistoryRange = '1' | '3' | '6' | 'all';

type Transaction = {
  id: string | number;
  date: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
};

type MonthSummary = { month: string; income: number; expense: number; savings: number };

function parseDate(value: string): Date | null {
  if (!value) return null;
  const iso = value.trim();
  const parsed = new Date(iso);
  if (!Number.isNaN(parsed.getTime())) return parsed;

  const partsDash = iso.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  if (partsDash) {
    const [, d, m, y] = partsDash;
    const d2 = new Date(`${y}-${m}-${d}`);
    return Number.isNaN(d2.getTime()) ? null : d2;
  }

  const partsSlash = iso.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (partsSlash) {
    const [, d, m, y] = partsSlash;
    const d2 = new Date(`${y}-${m}-${d}`);
    return Number.isNaN(d2.getTime()) ? null : d2;
  }

  return null;
}

function monthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(key: string): string {
  const [y, m] = key.split('-');
  const d = new Date(Number(y), Number(m) - 1);
  return d.toLocaleString('default', { month: 'short', year: 'numeric' });
}

function getCurrentMonthKey(): string {
  const today = new Date();
  return monthKey(today);
}

export function HistoryPage() {
  const [range, setRange] = useState<HistoryRange>('all');
  const [selectedMonthKey, setSelectedMonthKey] = useState<string | null>(null);
  const { transactions } = useAppContext();

  const filteredTransactions = useMemo(() => {
    const parsedTransactions = transactions
      .map((tx) => ({ ...tx, dateObject: parseDate(tx.date) }))
      .filter((tx) => tx.dateObject) as Array<Transaction & { dateObject: Date }>;

    if (range === 'all') {
      return parsedTransactions;
    }

    const months = Number(range);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - months);

    const inRange = parsedTransactions.filter((tx) => tx.dateObject >= cutoff);

    if (inRange.length > 0) {
      return inRange;
    }

    // If the selected range is too recent, but historical mock data exists, fall back to all data.
    return parsedTransactions;
  }, [transactions, range]);

  const monthsMap = useMemo(() => {
    const map: Record<string, Array<Transaction & { dateObject: Date }>> = {};
    filteredTransactions.forEach((tx) => {
      const key = monthKey(tx.dateObject);
      if (!map[key]) map[key] = [];
      map[key].push(tx);
    });
    return map;
  }, [filteredTransactions]);

  const monthEntries = useMemo(() => {
    const currentMonth = getCurrentMonthKey();
    return Object.keys(monthsMap)
      .sort()
      .filter((key) => key !== currentMonth) // Exclude current month from history
      .map((key) => ({ key, label: monthLabel(key), transactions: monthsMap[key] }));
  }, [monthsMap]);

  const selectedMonthTransactions = useMemo(() => {
    if (!selectedMonthKey) return [];
    return monthsMap[selectedMonthKey] || [];
  }, [monthsMap, selectedMonthKey]);

  const selectedMonthSummary = useMemo<MonthSummary | null>(() => {
    if (!selectedMonthTransactions.length) return null;
    const income = selectedMonthTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = selectedMonthTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    return { month: monthLabel(selectedMonthKey!), income, expense, savings: income - expense };
  }, [selectedMonthTransactions, selectedMonthKey]);

  const summary = useMemo(() => {
    const income = filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expense = filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const net = income - expense;
    const savingsRate = income > 0 ? (net / income) * 100 : 0;
    return { income, expense, net, savingsRate };
  }, [filteredTransactions]);

  const monthlyData = useMemo(() => {
    const monthMap: Record<string, { income: number; expense: number }> = {};
    filteredTransactions.forEach((tx) => {
      const key = monthKey(tx.dateObject);
      if (!monthMap[key]) monthMap[key] = { income: 0, expense: 0 };
      monthMap[key][tx.type] += tx.amount;
    });

    const sortedKeys = Object.keys(monthMap).sort();
    return sortedKeys.map((key) => ({
      month: monthLabel(key),
      income: monthMap[key].income,
      expense: monthMap[key].expense,
      savings: monthMap[key].income - monthMap[key].expense,
    }));
  }, [filteredTransactions]);

  const categorySpending = useMemo(() => {
    const categoryMap: Record<string, number> = {};
    filteredTransactions.forEach((tx) => {
      if (tx.type !== 'expense') return;
      const cat = tx.category.trim();
      if (!cat) return;
      categoryMap[cat] = (categoryMap[cat] || 0) + tx.amount;
    });
    return Object.entries(categoryMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const insightText = useMemo(() => {
    if (filteredTransactions.length === 0) return 'No historical data available.';

    const checks: string[] = [];
    const expensesTrend = monthlyData.map((m) => m.expense);
    if (expensesTrend.length >= 2) {
      const last = expensesTrend[expensesTrend.length - 1];
      const prev = expensesTrend[expensesTrend.length - 2];
      checks.push(`Expenses ${last > prev ? 'increased' : 'decreased'} over the last ${range} month(s)`);
    }

    const topCategories = monthlyData.length > 1 ? categorySpending.slice(0, 1).map((c) => c.category) : [];
    if (topCategories.length > 0) {
      checks.push(`${topCategories[0]} is consistently the highest spending category`);
    }

    const savingsTrend = monthlyData.map((m) => m.savings);
    if (savingsTrend.length >= 2) {
      const trend = savingsTrend[savingsTrend.length - 1] - savingsTrend[0];
      checks.push(`Savings trend is ${trend >= 0 ? 'improving' : 'declining'}`);
    }

    return checks.join(' • ');
  }, [filteredTransactions, monthlyData, categorySpending, range]);

  const selectedMonthInsightText = useMemo(() => {
    if (!selectedMonthSummary) return 'No month selected yet.';
    if (!selectedMonthTransactions.length) return 'No transactions in this month.';

    const checks: string[] = [];
    const { income, expense, savings } = selectedMonthSummary;

    checks.push(`This month had ${selectedMonthTransactions.length} transactions.`);
    checks.push(`Income ${income > 0 ? `is $${income.toFixed(2)}` : 'not recorded'}.`);
    checks.push(`Expenses are $${expense.toFixed(2)}.`);
    checks.push(savings >= 0 ? 'Net positive savings.' : 'Net loss for the month.');

    const monthCategory = selectedMonthTransactions
      .filter((tx) => tx.type === 'expense')
      .reduce((acc: Record<string, number>, tx) => {
        const cat = tx.category.trim() || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + tx.amount;
        return acc;
      }, {});

    const top = Object.entries(monthCategory).sort((a, b) => b[1] - a[1])[0];
    if (top) {
      checks.push(`Top expense category is ${top[0]} with $${top[1].toFixed(2)}.`);
    }

    return checks.join(' ');
  }, [selectedMonthSummary, selectedMonthTransactions]);

  if (filteredTransactions.length === 0) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">History & Trends</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Analyze your financial data over time</p>
        <Card className="p-6">
          <p className="text-center text-gray-500 dark:text-gray-400">No historical data available</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">History & Trends</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">Analyze your financial data over time</p>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Time range:</label>
        {(['1', '3', '6', 'all'] as HistoryRange[]).map((opt) => (
          <button
            key={opt}
            onClick={() => {
              setRange(opt);
              setSelectedMonthKey(null);
            }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium ${range === opt ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 dark:bg-slate-800 dark:text-gray-200 dark:border-white/10'}`}
          >
            {opt === 'all' ? 'All time' : `Last ${opt} Month${opt !== '1' ? 's' : ''}`}
          </button>
        ))}
      </div>

      {!selectedMonthKey && (
        <Card className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Select a Month to Drill Down</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {monthEntries.map((entry) => (
              <button
                key={entry.key}
                onClick={() => setSelectedMonthKey(entry.key)}
                className="border border-gray-200 dark:border-white/10 rounded-lg p-4 text-left hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{entry.label}</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">{entry.transactions.length} transactions</p>
                <div className="mt-2 text-xs text-blue-600 dark:text-blue-300">View details →</div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {selectedMonthKey && selectedMonthSummary ? (
        <>
          <button
            onClick={() => setSelectedMonthKey(null)}
            className="inline-flex items-center gap-2 px-3 py-2 text-xs font-medium text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-lg"
          >
            ← Back to History
          </button>

          <Card className="p-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{selectedMonthSummary.month} Details</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">{selectedMonthTransactions.length} transactions this month</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
              <Card className="p-4 bg-teal-50 dark:bg-teal-950/50">
                <p className="text-xs text-gray-600 dark:text-gray-300">Monthly Income</p>
                <p className="text-2xl font-bold text-green-600 dark:text-green-300">${selectedMonthSummary.income.toFixed(2)}</p>
              </Card>
              <Card className="p-4 bg-rose-50 dark:bg-rose-950/50">
                <p className="text-xs text-gray-600 dark:text-gray-300">Monthly Expense</p>
                <p className="text-2xl font-bold text-red-600 dark:text-red-300">${selectedMonthSummary.expense.toFixed(2)}</p>
              </Card>
              <Card className="p-4 bg-indigo-50 dark:bg-indigo-950/50">
                <p className="text-xs text-gray-600 dark:text-gray-300">Net Savings</p>
                <p className="text-2xl font-bold text-indigo-700 dark:text-indigo-200">${selectedMonthSummary.savings.toFixed(2)}</p>
              </Card>
            </div>

            <Card className="p-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Month Insights</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{selectedMonthInsightText}</p>
            </Card>

            <Card className="p-4 mt-4">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Transactions</h4>
              <div className="overflow-auto mt-3">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-xs uppercase text-gray-500 dark:text-gray-400">
                      <th className="px-3 py-2">Date</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedMonthTransactions.map((tx) => (
                      <tr key={tx.id} className="border-t border-gray-200 dark:border-white/10">
                        <td className="px-3 py-2">{tx.date}</td>
                        <td className="px-3 py-2">{tx.category}</td>
                        <td className="px-3 py-2 capitalize">{tx.type}</td>
                        <td className={`px-3 py-2 ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                          ${tx.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </Card>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Income</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-300">${summary.income.toFixed(2)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-300">${summary.expense.toFixed(2)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Net Savings</p>
              <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-300">${summary.net.toFixed(2)}</p>
            </Card>
            <Card className="p-5">
              <p className="text-xs text-gray-500 dark:text-gray-400">Savings Rate</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-300">{summary.savingsRate.toFixed(1)}%</p>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Income vs Expense</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="income" stroke="#22c55e" />
                  <Line type="monotone" dataKey="expense" stroke="#ef4444" />
                </LineChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Category-wise Spending</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categorySpending}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" hide />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="amount" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">Monthly Breakdown</h3>
            <div className="overflow-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase text-gray-500 dark:text-gray-400">
                    <th className="px-3 py-2">Month</th>
                    <th className="px-3 py-2">Income</th>
                    <th className="px-3 py-2">Expense</th>
                    <th className="px-3 py-2">Savings</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyData.map((row) => (
                    <tr key={row.month} className="border-t border-gray-200 dark:border-white/10">
                      <td className="px-3 py-2">{row.month}</td>
                      <td className="px-3 py-2">${row.income.toFixed(2)}</td>
                      <td className="px-3 py-2">${row.expense.toFixed(2)}</td>
                      <td className="px-3 py-2">${row.savings.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">Historical Insights</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{insightText}</p>
          </Card>
        </>
      )}
    </div>
  );
}
