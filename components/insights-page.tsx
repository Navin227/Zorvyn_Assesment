'use client';

import React, { useMemo } from 'react';
import { useAppContext } from '@/app/page';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle, Flame, Target, BarChart3 } from 'lucide-react';

export function InsightsPage() {
  const { transactions } = useAppContext();

  const insights = useMemo(() => {
    // Calculate spending by category
    const spendingByCategory: Record<string, number> = {};
    transactions.forEach((t) => {
      if (t.type === 'expense') {
        spendingByCategory[t.category] = (spendingByCategory[t.category] || 0) + t.amount;
      }
    });

    // Find highest spending category
    const highestCategory = Object.entries(spendingByCategory).reduce((a, b) =>
      a[1] > b[1] ? a : b,
      ['', 0]
    );

    // Current month spending (simulated)
    const currentMonthSpending = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith('2024-03'))
      .reduce((sum, t) => sum + t.amount, 0);

    const lastMonthSpending = transactions
      .filter((t) => t.type === 'expense' && t.date.startsWith('2024-02'))
      .reduce((sum, t) => sum + t.amount, 0);

    const spendingChange = lastMonthSpending ? ((currentMonthSpending - lastMonthSpending) / lastMonthSpending) * 100 : 0;

    // Average transaction amount
    const avgTransaction =
      transactions.length > 0 ? transactions.reduce((sum, t) => sum + t.amount, 0) / transactions.length : 0;

    // Calculate income to expense ratio
    const totalIncome = transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    return {
      highestCategory,
      currentMonthSpending,
      lastMonthSpending,
      spendingChange,
      avgTransaction,
      totalIncome,
      totalExpenses,
      savingsRate,
    };
  }, [transactions]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground">Insights & Analysis</h2>
        <p className="text-sm text-muted-foreground">Deep dive into your spending patterns</p>
      </div>

      {/* Main Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Highest Spending Category */}
        <Card className="p-6 border-0 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 border-l-4 border-l-destructive bg-gradient-to-br from-destructive/5 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Highest Spending Category</p>
              <h3 className="text-2xl font-bold text-foreground">{insights.highestCategory[0]}</h3>
              <p className="text-lg font-bold text-destructive mt-3">
                ${insights.highestCategory[1].toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-xl">
              <Flame className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Your top spending category this period</p>
        </Card>

        {/* Monthly Comparison */}
        <Card className="p-6 border-0 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary bg-gradient-to-br from-primary/5 to-transparent">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Monthly Comparison</p>
              <h3 className="text-lg font-bold text-foreground mb-3">
                This Month vs Last Month
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  This Month: <span className="font-bold text-destructive">${insights.currentMonthSpending.toFixed(2)}</span>
                </p>
                <p className="text-sm">
                  Last Month: <span className="font-bold text-muted-foreground">${insights.lastMonthSpending.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className={`p-3 rounded-xl ${insights.spendingChange > 0 ? 'bg-destructive/10' : 'bg-accent/10'}`}>
              {insights.spendingChange > 0 ? (
                <TrendingUp className="w-6 h-6 text-destructive" />
              ) : (
                <TrendingDown className="w-6 h-6 text-accent" />
              )}
            </div>
          </div>
          <p className={`text-xs font-bold mt-3 ${insights.spendingChange > 0 ? 'text-destructive' : 'text-accent'}`}>
            {insights.spendingChange > 0 ? '📈 ' : '📉 '} {Math.abs(insights.spendingChange).toFixed(1)}% {insights.spendingChange > 0 ? 'increase' : 'decrease'}
          </p>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Transaction */}
        <Card className="p-6 border-0 shadow-md rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Average Transaction</p>
            <BarChart3 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold text-foreground">${insights.avgTransaction.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-3">Across {transactions.length} transactions</p>
        </Card>

        {/* Savings Rate */}
        <Card className="p-6 border-0 shadow-md rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-br from-accent/10 to-accent/5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Savings Rate</p>
            <Target className="w-5 h-5 text-accent" />
          </div>
          <h3 className="text-3xl font-bold text-accent">{insights.savingsRate.toFixed(1)}%</h3>
          <p className="text-xs text-muted-foreground mt-3">Of your income saved</p>
        </Card>

        {/* Total Income */}
        <Card className="p-6 border-0 shadow-md rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-200 bg-gradient-to-br from-primary/10 to-primary/5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">Total Income</p>
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-3xl font-bold text-primary">${insights.totalIncome.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-3">Across all sources</p>
        </Card>
      </div>

      {/* Smart Insights */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold text-foreground">Smart Insights</h3>
        
        <div className="space-y-3">
          {/* Insight 1 */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Spending Trend</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You spent {Math.abs(insights.spendingChange).toFixed(1)}% {insights.spendingChange > 0 ? 'more' : 'less'} on expenses this month compared to last month. {insights.spendingChange > 0 ? 'Consider reviewing your spending.' : 'Great job reducing expenses!'}
                </p>
              </div>
            </div>
          </Card>

          {/* Insight 2 */}
          <Card className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-200 border-l-4 border-l-accent">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-accent/20 rounded-lg flex-shrink-0">
                <Target className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Healthy Savings</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your savings rate is {insights.savingsRate.toFixed(1)}%. {insights.savingsRate >= 20 ? 'Excellent! You&apos;re on track with healthy financial habits.' : 'Consider increasing your savings rate to improve financial health.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Insight 3 */}
          <Card className="p-4 bg-gradient-to-r from-destructive/10 to-destructive/5 border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-200 border-l-4 border-l-destructive">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-destructive/20 rounded-lg flex-shrink-0">
                <Flame className="w-5 h-5 text-destructive" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Top Category Alert</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your highest spending category is {insights.highestCategory[0]} at ${insights.highestCategory[1].toFixed(2)}. Review this category to find opportunities to reduce expenses.
                </p>
              </div>
            </div>
          </Card>

          {/* Insight 4 */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-0 shadow-sm rounded-xl hover:shadow-md transition-all duration-200 border-l-4 border-l-primary">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/20 rounded-lg flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">Average Transaction</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your average transaction is ${insights.avgTransaction.toFixed(2)}. Track your spending habits to identify patterns and optimize your budget.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Categories Breakdown */}
      <Card className="p-6 border-0 shadow-md rounded-xl">
        <h3 className="text-xl font-bold text-foreground mb-6">Spending by Category</h3>
        <div className="space-y-5">
          {Object.entries(
            transactions.reduce(
              (acc, t) => {
                if (t.type === 'expense') {
                  acc[t.category] = (acc[t.category] || 0) + t.amount;
                }
                return acc;
              },
              {} as Record<string, number>
            )
          )
            .sort((a, b) => b[1] - a[1])
            .map(([category, amount]) => {
              const totalExpenses = transactions
                .filter((t) => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
              const percentage = (amount / totalExpenses) * 100;

              return (
                <div key={category} className="p-4 rounded-lg hover:bg-secondary/50 transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-foreground">{category}</span>
                    <span className="text-sm font-bold text-foreground">${amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2 shadow-sm">
                    <div
                      className="bg-gradient-to-r from-primary to-primary/70 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2 font-semibold">{percentage.toFixed(1)}% of expenses</p>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
