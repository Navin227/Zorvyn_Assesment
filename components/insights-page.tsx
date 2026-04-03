'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { useAppContext } from '@/app/page';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const CHART_COLORS = ['#38bdf8', '#34d399', '#f97316', '#f43f5e', '#a855f7'];

type InsightType = 'Spending Breakdown' | 'Trends Over Time' | 'Income vs Expense' | 'Smart Insights';
type TrendPeriod = 'weekly' | 'monthly';

type Transaction = {
  id: string | number;
  date: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
};

type TrendPoint = { label: string; income: number; expense: number; key: string };

type CategorySummary = { category: string; amount: number };

type CategoryAnalysis = {
  totalSpent: number;
  averageTransaction: number;
  transactionCount: number;
  trend: TrendPoint[];
};

function normalizeDate(rawDate: string | Date | null | undefined): Date | null {
  if (!rawDate) return null;

  if (rawDate instanceof Date) {
    return Number.isNaN(rawDate.getTime()) ? null : rawDate;
  }

  const dateString = String(rawDate).trim();
  if (!dateString) return null;

  let date: Date | null = null;

  const isoLike = /^\d{4}-\d{2}-\d{2}$/;
  const domDash = /^(\d{2})-(\d{2})-(\d{4})$/;
  const domSlash = /^(\d{2})\/(\d{2})\/(\d{4})$/;

  if (isoLike.test(dateString)) {
    date = new Date(dateString);
  } else if (domDash.test(dateString)) {
    const [_, d, m, y] = dateString.match(domDash) ?? [];
    date = new Date(`${y}-${m}-${d}`);
  } else if (domSlash.test(dateString)) {
    const [_, d, m, y] = dateString.match(domSlash) ?? [];
    date = new Date(`${y}-${m}-${d}`);
  } else {
    date = new Date(dateString);
  }

  if (date && !Number.isNaN(date.getTime())) {
    return date;
  }

  return null;
}

function categoryKey(category = ''): string {
  return category.trim().toLowerCase();
}

function capitalize(word: string): string {
  if (!word) return '';
  return word[0].toUpperCase() + word.slice(1).toLowerCase();
}

function getCategoryTotals(transactions: Transaction[]): Record<string, number> {
  return transactions.reduce((acc, tx) => {
    if (tx.type !== 'expense') return acc;
    const key = categoryKey(tx.category);
    if (!key) return acc;
    const normalized = normalizeDate(tx.date);
    if (!normalized) return acc;

    acc[key] = (acc[key] || 0) + tx.amount;
    return acc;
  }, {} as Record<string, number>);
}

function fillMonthKeys(referenceDate = new Date(), length = 6): string[] {
  const months: string[] = [];
  for (let i = length - 1; i >= 0; i -= 1) {
    const d = new Date(referenceDate.getFullYear(), referenceDate.getMonth() - i, 1);
    months.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return months;
}

function fillWeekKeys(referenceDate = new Date(), length = 6): string[] {
  const weeks: string[] = [];
  const ref = new Date(referenceDate);
  const day = ref.getDay();
  const monday = new Date(ref);
  monday.setDate(ref.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);

  for (let i = length - 1; i >= 0; i -= 1) {
    const weekStart = new Date(monday);
    weekStart.setDate(monday.getDate() - i * 7);
    const key = `${weekStart.getFullYear()}-${String(weekStart.getMonth() + 1).padStart(2, '0')}-${String(weekStart.getDate()).padStart(2, '0')}`;
    weeks.push(key);
  }
  return weeks;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleString('default', { month: 'short' });
}

function weekLabel(key: string): string {
  const [year, month, day] = key.split('-');
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  const w = Math.ceil(((d.getTime() - new Date(d.getFullYear(), 0, 1).getTime()) / (1000 * 60 * 60 * 24) + new Date(d.getFullYear(), 0, 1).getDay() + 1) / 7);
  return `W${w}`;
}

function getTrendData(transactions: Transaction[], period: TrendPeriod): TrendPoint[] {
  const validTx = transactions
    .map((tx) => ({ ...tx, date: normalizeDate(tx.date) }))
    .filter((tx) => tx.date != null)
    .map((tx) => ({ ...tx, date: tx.date as Date }));

  const keys = period === 'monthly' ? fillMonthKeys() : fillWeekKeys();

  const group: Record<string, { income: number; expense: number }> = keys.reduce((acc, key) => {
    acc[key] = { income: 0, expense: 0 };
    return acc;
  }, {} as Record<string, { income: number; expense: number }> );

  validTx.forEach((tx) => {
    const date = tx.date as Date;
    let key = '';

    if (period === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((day + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    }

    if (!group[key]) return;

    if (tx.type === 'income') {
      group[key].income += tx.amount;
    }
    if (tx.type === 'expense') {
      group[key].expense += tx.amount;
    }
  });

  return keys.map((key) => ({
    key,
    label: period === 'monthly' ? monthLabel(key) : weekLabel(key),
    income: group[key]?.income ?? 0,
    expense: group[key]?.expense ?? 0,
  }));
}

function getCategoryAnalysis(transactions: Transaction[], selectedCategory: string, trendPeriod: TrendPeriod): CategoryAnalysis {
  const normCategory = categoryKey(selectedCategory);
  const filtered = transactions.filter((tx) => tx.type === 'expense' && categoryKey(tx.category) === normCategory && normalizeDate(tx.date));

  const totalSpent = filtered.reduce((sum, tx) => sum + tx.amount, 0);
  const transactionCount = filtered.length;
  const averageTransaction = transactionCount > 0 ? totalSpent / transactionCount : 0;

  const allCategoryTx = filtered.map((tx) => ({ ...tx, date: normalizeDate(tx.date) as Date }));
  const trend = allCategoryTx.length > 0
    ? getTrendData(allCategoryTx, trendPeriod)
    : [];

  return { totalSpent, averageTransaction, transactionCount, trend };
}

function getSavingsRate(transactions: Transaction[]): number {
  const income = transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const expenses = transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);
  if (income <= 0) return 0;
  return ((income - expenses) / income) * 100;
}

function getTrendInsights(trendData: TrendPoint[]): string {
  const values = trendData.slice(-2);
  if (values.length < 2) return 'Not enough trend data yet';

  const last = values[values.length - 1];
  const prev = values[values.length - 2];
  const diff = last.expense - prev.expense;
  const pct = prev.expense ? (diff / prev.expense) * 100 : 0;
  return `Expenses ${diff >= 0 ? 'increased' : 'decreased'} ${Math.abs(pct).toFixed(1)}% compared to previous period`;
}

function getMultiCategoryTrendData(
  transactions: Transaction[],
  selectedCategories: string[],
  period: TrendPeriod
): Array<TrendPoint & Record<string, number>> {
  const validTx = transactions
    .map((tx) => ({ ...tx, date: normalizeDate(tx.date) }))
    .filter((tx) => tx.date != null)
    .map((tx) => ({ ...tx, date: tx.date as Date }));

  const keys = period === 'monthly' ? fillMonthKeys() : fillWeekKeys();

  const group: Record<string, Record<string, number>> = keys.reduce((acc, key) => {
    acc[key] = { income: 0, expense: 0 };
    selectedCategories.forEach((cat) => {
      acc[key][categoryKey(cat)] = 0;
    });
    return acc;
  }, {} as Record<string, Record<string, number>>);

  validTx.forEach((tx) => {
    const date = tx.date as Date;
    let key = '';

    if (period === 'monthly') {
      key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else {
      const day = date.getDay();
      const monday = new Date(date);
      monday.setDate(date.getDate() - ((day + 6) % 7));
      monday.setHours(0, 0, 0, 0);
      key = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, '0')}-${String(monday.getDate()).padStart(2, '0')}`;
    }

    if (!group[key]) return;

    if (tx.type === 'income') {
      group[key].income += tx.amount;
    }

    if (tx.type === 'expense') {
      const cat = categoryKey(tx.category);
      group[key][cat] = (group[key][cat] || 0) + tx.amount;
    }
  });

  return keys.map((key) => ({
    key,
    label: period === 'monthly' ? monthLabel(key) : weekLabel(key),
    income: group[key]?.income ?? 0,
    expense: group[key]?.expense ?? 0,
    ...selectedCategories.reduce((acc, cat) => {
      acc[categoryKey(cat)] = group[key]?.[categoryKey(cat)] ?? 0;
      return acc;
    }, {} as Record<string, number>),
  }));
}

export function InsightsPage() {
  const { transactions } = useAppContext();
  const [selectedInsight, setSelectedInsight] = useState<InsightType>('Spending Breakdown');
  const [trendCategoryFilter, setTrendCategoryFilter] = useState<string[]>([]); // Multi-select: empty = all categories
  const [trendPeriod, setTrendPeriod] = useState<TrendPeriod>('weekly');
  const [selectedCategory, setSelectedCategory] = useState<string>('Food');

  const categoryTotals = useMemo(() => getCategoryTotals(transactions), [transactions]);

  const topCategories = useMemo(() => {
    return Object.entries(categoryTotals)
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [categoryTotals]);

  useEffect(() => {
    if (topCategories.length > 0) {
      const normalizedSelected = categoryKey(selectedCategory);
      if (!categoryTotals[normalizedSelected]) {
        setSelectedCategory(capitalize(topCategories[0].category));
      }
    }
  }, [topCategories, categoryTotals, selectedCategory]);

  const trendDataMonthly = useMemo(() => getTrendData(transactions, 'monthly'), [transactions]);
  const trendDataWeekly = useMemo(() => getTrendData(transactions, 'weekly'), [transactions]);

  const categoryOptions = useMemo(() => Object.keys(categoryTotals).map((cat) => capitalize(cat)), [categoryTotals]);

  const analysis = useMemo(() => getCategoryAnalysis(transactions, selectedCategory, trendPeriod), [transactions, selectedCategory, trendPeriod]);
  const savingsRate = useMemo(() => getSavingsRate(transactions), [transactions]);
  const totalExpenses = useMemo(() => transactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0), [transactions]);

  const dynamicInsights = useMemo(() => {
    if (topCategories.length === 0) {
      return [{ icon: 'ℹ️', text: 'No spending categories available yet.' }];
    }

    const topCat = topCategories[0];
    const ratio = totalExpenses > 0 ? (topCat.amount / totalExpenses) * 100 : 0;
    const count = transactions.filter((t) => categoryKey(t.category) === topCat.category && t.type === 'expense').length;

    return [
      { icon: '🔥', text: `${capitalize(topCat.category)} is your highest spending category at ${ratio.toFixed(1)}%` },
      { icon: '💸', text: `You spent $${topCat.amount.toFixed(2)} on ${capitalize(topCat.category)} across ${count} transactions` },
      { icon: '💰', text: `Savings rate is ${savingsRate.toFixed(1)}% of your income` },
      { icon: '📈', text: getTrendInsights(trendPeriod === 'weekly' ? trendDataWeekly : trendDataMonthly) },
    ];
  }, [topCategories, savingsRate, totalExpenses, trendPeriod, trendDataWeekly, trendDataMonthly, transactions]);

  const categoryLegend = useMemo(
    () => topCategories.map((c, i) => ({ category: capitalize(c.category), amount: c.amount, color: CHART_COLORS[i % CHART_COLORS.length] })),
    [topCategories]
  );

  const activeTrendData = trendPeriod === 'weekly' ? trendDataWeekly : trendDataMonthly;

  const noTransaction = transactions.length === 0;

  const renderInsightContent = () => {
    if (noTransaction) {
      return (
        <Card className="p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
          <p className="text-center text-gray-500 dark:text-gray-400">No data available</p>
        </Card>
      );
    }

    switch (selectedInsight) {
      case 'Spending Breakdown':
        if (categoryLegend.length === 0) {
          return (
            <Card className="p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
              <p className="text-center text-gray-500 dark:text-gray-400">No category data available</p>
            </Card>
          );
        }

        return (
          <Card className="p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Spending Breakdown</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Category share with real aggregated values</p>
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={categoryLegend} dataKey="amount" nameKey="category" innerRadius={60} outerRadius={100} paddingAngle={3}>
                    {categoryLegend.map((entry) => (
                      <Cell key={entry.category} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => `$${value.toFixed(2)}`} contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {categoryLegend.map((item) => {
                  const percent = totalExpenses ? (item.amount / totalExpenses) * 100 : 0;
                  return (
                    <div key={item.category} className="p-3 rounded-lg border border-gray-100 dark:border-white/10 bg-white dark:bg-slate-800">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.category}</span>
                        <span className="text-sm font-bold text-gray-900 dark:text-white">{percent.toFixed(1)}%</span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">${item.amount.toFixed(2)} spent</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>
        );

      case 'Trends Over Time':
        const multiCategoryTrendData = trendCategoryFilter.length > 0 ? getMultiCategoryTrendData(transactions, trendCategoryFilter, trendPeriod) : activeTrendData;
        const shouldShowAllTrends = trendCategoryFilter.length === 0;
        
        return (
          <div className="space-y-6">
            {!activeTrendData.some((point) => point.income !== 0 || point.expense !== 0) ? (
              <Card className="p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
                <p className="text-center text-gray-500 dark:text-gray-400">No trend data available</p>
              </Card>
            ) : (
              <Card className="p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
                <div className="flex flex-col gap-4 mb-5">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Trends Over Time</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{shouldShowAllTrends ? 'Income and expense trends' : `Trends for: ${trendCategoryFilter.join(', ')}`}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setTrendPeriod('weekly')} className={`px-3 py-2 rounded-md font-medium text-sm ${trendPeriod === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200'}`}>
                        Weekly
                      </button>
                      <button onClick={() => setTrendPeriod('monthly')} className={`px-3 py-2 rounded-md font-medium text-sm ${trendPeriod === 'monthly' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-200'}`}>
                        Monthly
                      </button>
                    </div>
                  </div>

                  {/* Multiselect Category Checkboxes */}
                  <div className="border-t border-gray-200 dark:border-white/10 pt-4">
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-3">Select Categories to Compare:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {categoryOptions.map((cat) => (
                        <label key={cat} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={trendCategoryFilter.includes(cat)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setTrendCategoryFilter([...trendCategoryFilter, cat]);
                              } else {
                                setTrendCategoryFilter(trendCategoryFilter.filter((c) => c !== cat));
                              }
                            }}
                            className="w-4 h-4 rounded border-gray-300 dark:border-white/20"
                          />
                          <span className="text-sm text-gray-700 dark:text-gray-300">{cat}</span>
                        </label>
                      ))}
                    </div>
                    {trendCategoryFilter.length > 0 && (
                      <button
                        onClick={() => setTrendCategoryFilter([])}
                        className="mt-3 text-xs font-medium text-blue-600 dark:text-blue-300 hover:underline"
                      >
                        Clear selection
                      </button>
                    )}
                  </div>
                </div>

                {shouldShowAllTrends ? (
                  // All categories - show income vs expense
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={activeTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 500 }} />
                      <YAxis stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 500 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      <Legend wrapperStyle={{ color: '#9ca3af' }} />
                      <Line type="monotone" dataKey="income" stroke="#14b8a6" strokeWidth={2} />
                      <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  // Selected categories trends
                  <ResponsiveContainer width="100%" height={320}>
                    <LineChart data={multiCategoryTrendData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 500 }} />
                      <YAxis stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 500 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                      <Legend wrapperStyle={{ color: '#9ca3af' }} />
                      {trendCategoryFilter.map((cat, idx) => (
                        <Line key={cat} type="monotone" dataKey={categoryKey(cat)} stroke={CHART_COLORS[idx % CHART_COLORS.length]} strokeWidth={2} name={cat} />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card>
            )}
          </div>
        );

      case 'Income vs Expense':
        if (!trendDataMonthly.some((point) => point.income !== 0 || point.expense !== 0)) {
          return (
            <Card className="p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
              <p className="text-center text-gray-500 dark:text-gray-400">No income/expense data available</p>
            </Card>
          );
        }

        return (
          <Card className="p-6 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Income vs Expense</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Compare income vs expense over months</p>
            </div>
            <ResponsiveContainer width="100%" height={340}>
              <BarChart data={trendDataMonthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="label" stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 500 }} />
                <YAxis stroke="#9ca3af" tick={{ fill: '#e5e7eb', fontSize: 12, fontWeight: 500 }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#f1f5f9' }} />
                <Legend wrapperStyle={{ color: '#9ca3af' }} />
                <Bar dataKey="income" fill="#22c55e" />
                <Bar dataKey="expense" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        );

      case 'Smart Insights':
        return (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dynamicInsights.map((item) => (
              <Card key={item.text} className="p-5 rounded-xl border border-gray-200 dark:border-white/10 shadow-md">
                <div className="text-xl mb-2">{item.icon}</div>
                <p className="font-semibold text-gray-900 dark:text-white">{item.text}</p>
              </Card>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">Insights & Analytics</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Explore your financial data through interactive insights.</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-sm text-gray-600 dark:text-gray-400">Insight Type</label>
            <select value={selectedInsight} onChange={(e) => setSelectedInsight(e.target.value as InsightType)} className="px-3 py-2 rounded-lg border border-gray-200 bg-white text-gray-900 dark:border-white/10 dark:bg-slate-800 dark:text-white">
              <option value="Spending Breakdown">Spending Breakdown</option>
              <option value="Trends Over Time">Trends Over Time</option>
              <option value="Income vs Expense">Income vs Expense</option>
              <option value="Smart Insights">Smart Insights</option>
            </select>
          </div>
        </div>
      </div>

      {renderInsightContent()}
    </div>
  );
}
