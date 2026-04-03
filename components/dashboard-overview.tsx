'use client';

import React from 'react';
import { useAppContext } from '@/app/page';
import { Card } from '@/components/ui/card';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieLabel } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, DollarSign, CreditCard } from 'lucide-react';

interface BalanceTrend {
  month: string;
  balance: number;
}

interface SpendingByCategory {
  name: string;
  value: number;
}

export function DashboardOverview() {
  const { transactions } = useAppContext();

  // Calculate summary metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalBalance = totalIncome - totalExpenses;

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

  const COLORS = ['#3B82F6', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Balance Card */}
        <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5 border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Total Balance</p>
              <h3 className="text-3xl font-bold text-foreground">
                ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-primary/20 rounded-xl">
              <DollarSign className="w-6 h-6 text-primary" />
            </div>
          </div>
          <p className="text-xs text-accent font-semibold mt-3">↑ 2.5% from last month</p>
        </Card>

        {/* Total Income Card */}
        <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Total Income</p>
              <h3 className="text-3xl font-bold text-accent">
                ${totalIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-accent/20 rounded-xl">
              <TrendingUp className="w-6 h-6 text-accent" />
            </div>
          </div>
          <p className="text-xs text-accent font-semibold mt-3">↑ 5.2% from last month</p>
        </Card>

        {/* Total Expenses Card */}
        <Card className="p-6 bg-gradient-to-br from-destructive/10 to-destructive/5 border-0 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200 rounded-xl">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Total Expenses</p>
              <h3 className="text-3xl font-bold text-destructive">
                ${totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-destructive/20 rounded-xl">
              <CreditCard className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <p className="text-xs text-destructive font-semibold mt-3">↓ 1.3% from last month</p>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Balance Trend Chart */}
        <Card className="lg:col-span-2 p-6 border-0 shadow-md rounded-xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">Balance Trend</h3>
            <p className="text-xs text-muted-foreground mt-1">Last 6 months performance</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={balanceTrendData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <YAxis stroke="var(--muted-foreground)" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
              />
              <Line
                type="monotone"
                dataKey="balance"
                stroke="var(--primary)"
                strokeWidth={3}
                dot={{ fill: 'var(--primary)', r: 5, strokeWidth: 2, stroke: 'var(--card)' }}
                activeDot={{ r: 8, strokeWidth: 2 }}
                animationDuration={800}
              />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        {/* Spending by Category */}
        <Card className="p-6 border-0 shadow-md rounded-xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-foreground">Spending by Category</h3>
            <p className="text-xs text-muted-foreground mt-1">This month breakdown</p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByCategory}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {spendingByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--card)',
                  border: `1px solid var(--border)`,
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                }}
                labelStyle={{ color: 'var(--foreground)', fontWeight: 'bold' }}
                formatter={(value) => `$${value}`}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-6 space-y-3">
            {spendingByCategory.map((category, index) => (
              <div key={category.name} className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-sm"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-muted-foreground font-medium">{category.name}</span>
                </div>
                <span className="font-bold text-foreground">${category.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
