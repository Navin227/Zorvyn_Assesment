'use client';

import React, { useMemo } from 'react';
import { useAppContext } from '@/app/page';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';

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
        <Card className="p-6 border-l-4 border-destructive">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Highest Spending Category</p>
              <h3 className="text-2xl font-bold text-foreground">{insights.highestCategory[0]}</h3>
              <p className="text-lg font-semibold text-destructive mt-2">
                ${insights.highestCategory[1].toFixed(2)}
              </p>
            </div>
            <div className="p-3 bg-destructive/10 rounded-lg">
              <TrendingDown className="w-6 h-6 text-destructive" />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">Your top spending category this period</p>
        </Card>

        {/* Monthly Comparison */}
        <Card className="p-6 border-l-4 border-primary">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">Monthly Comparison</p>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                This Month vs Last Month
              </h3>
              <div className="space-y-1">
                <p className="text-sm">
                  This Month: <span className="font-bold text-destructive">${insights.currentMonthSpending.toFixed(2)}</span>
                </p>
                <p className="text-sm">
                  Last Month: <span className="font-bold text-muted-foreground">${insights.lastMonthSpending.toFixed(2)}</span>
                </p>
              </div>
            </div>
            <div className={`p-3 rounded-lg ${insights.spendingChange > 0 ? 'bg-destructive/10' : 'bg-accent/10'}`}>
              {insights.spendingChange > 0 ? (
                <TrendingUp className="w-6 h-6 text-destructive" />
              ) : (
                <TrendingDown className="w-6 h-6 text-accent" />
              )}
            </div>
          </div>
          <p className={`text-xs font-semibold mt-3 ${insights.spendingChange > 0 ? 'text-destructive' : 'text-accent'}`}>
            {insights.spendingChange > 0 ? '📈' : '📉'} {Math.abs(insights.spendingChange).toFixed(1)}% {insights.spendingChange > 0 ? 'increase' : 'decrease'}
          </p>
        </Card>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Average Transaction */}
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Average Transaction</p>
          <h3 className="text-3xl font-bold text-foreground">${insights.avgTransaction.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-3">Across {transactions.length} transactions</p>
        </Card>

        {/* Savings Rate */}
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Savings Rate</p>
          <h3 className="text-3xl font-bold text-accent">{insights.savingsRate.toFixed(1)}%</h3>
          <p className="text-xs text-muted-foreground mt-3">Of your income saved</p>
        </Card>

        {/* Total Income */}
        <Card className="p-6">
          <p className="text-sm font-medium text-muted-foreground mb-2">Total Income</p>
          <h3 className="text-3xl font-bold text-primary">${insights.totalIncome.toFixed(2)}</h3>
          <p className="text-xs text-muted-foreground mt-3">Across all sources</p>
        </Card>
      </div>

      {/* Smart Insights */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">Smart Insights</h3>
        
        <div className="space-y-3">
          {/* Insight 1 */}
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Spending Trend</p>
                <p className="text-xs text-muted-foreground mt-1">
                  You spent {Math.abs(insights.spendingChange).toFixed(1)}% {insights.spendingChange > 0 ? 'more' : 'less'} on expenses this month compared to last month. {insights.spendingChange > 0 ? 'Consider reviewing your spending.' : 'Great job reducing expenses!'}
                </p>
              </div>
            </div>
          </Card>

          {/* Insight 2 */}
          <Card className="p-4 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Healthy Savings</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your savings rate is {insights.savingsRate.toFixed(1)}%. {insights.savingsRate >= 20 ? 'Excellent! You\'re on track with healthy financial habits.' : 'Consider increasing your savings rate to improve financial health.'}
                </p>
              </div>
            </div>
          </Card>

          {/* Insight 3 */}
          <Card className="p-4 bg-gradient-to-r from-chart-3/10 to-chart-3/5 border-chart-3/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-chart-3 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Top Category Alert</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your highest spending category is {insights.highestCategory[0]} at ${insights.highestCategory[1].toFixed(2)}. Review this category to find opportunities to reduce expenses.
                </p>
              </div>
            </div>
          </Card>

          {/* Insight 4 */}
          <Card className="p-4 bg-gradient-to-r from-chart-1/10 to-chart-1/5 border-chart-1/20">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-chart-1 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground">Average Transaction</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Your average transaction is ${insights.avgTransaction.toFixed(2)}. Track your spending habits to identify patterns and optimize your budget.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Categories Breakdown */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-foreground mb-6">Spending by Category</h3>
        <div className="space-y-4">
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
                <div key={category}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">{category}</span>
                    <span className="text-sm font-semibold text-foreground">${amount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{percentage.toFixed(1)}% of expenses</p>
                </div>
              );
            })}
        </div>
      </Card>
    </div>
  );
}
