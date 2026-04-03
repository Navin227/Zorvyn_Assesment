'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/app/page';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowUpDown } from 'lucide-react';

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'income' | 'expense';

export function TransactionsPage() {
  const { transactions, setTransactions, userRole } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    category: 'Food',
    type: 'expense' as 'income' | 'expense',
    description: '',
  });

  // Filter and sort transactions
  const filteredTransactions = useMemo(() => {
    let filtered = transactions.filter((t) => {
      const matchesSearch =
        t.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    });

    // Sort
    filtered.sort((a, b) => {
      let compareValue = 0;
      if (sortField === 'date') {
        compareValue = new Date(a.date).getTime() - new Date(b.date).getTime();
      } else if (sortField === 'amount') {
        compareValue = a.amount - b.amount;
      }
      return sortOrder === 'asc' ? compareValue : -compareValue;
    });

    return filtered;
  }, [transactions, searchTerm, filterType, sortField, sortOrder]);

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.description) return;

    const newTransaction = {
      id: Date.now().toString(),
      date: formData.date,
      amount: parseFloat(formData.amount),
      category: formData.category,
      type: formData.type,
      description: formData.description,
    };

    setTransactions([newTransaction, ...transactions]);
    setFormData({
      date: new Date().toISOString().split('T')[0],
      amount: '',
      category: 'Food',
      type: 'expense',
      description: '',
    });
    setOpenDialog(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
          <p className="text-sm text-muted-foreground">Manage and track all your transactions</p>
        </div>
        {userRole === 'admin' && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md border-0 shadow-xl rounded-xl">
              <DialogHeader className="pb-4 border-b border-border">
                <DialogTitle className="text-2xl font-bold text-foreground">Add New Transaction</DialogTitle>
              </DialogHeader>
              <DialogDescription className="sr-only">Fill in the details to add a new transaction to your account.</DialogDescription>
              <div className="space-y-4 py-4">
                {/* Date and Type Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="bg-secondary rounded-lg border-0"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Type</label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger className="bg-secondary rounded-lg border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="income">
                          <span className="text-accent font-medium">+ Income</span>
                        </SelectItem>
                        <SelectItem value="expense">
                          <span className="text-destructive font-medium">- Expense</span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Amount and Category Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Amount</label>
                    <div className="flex items-center border border-border rounded-lg bg-secondary overflow-hidden">
                      <span className="px-3 py-2 text-sm font-medium text-muted-foreground">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="border-0 bg-transparent focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-foreground">Category</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="bg-secondary rounded-lg border-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Food">Food</SelectItem>
                        <SelectItem value="Transportation">Transportation</SelectItem>
                        <SelectItem value="Rent">Rent</SelectItem>
                        <SelectItem value="Entertainment">Entertainment</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Salary">Salary</SelectItem>
                        <SelectItem value="Freelance">Freelance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Description</label>
                  <Input
                    placeholder="e.g. Monthly groceries, Gas refill, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-secondary rounded-lg border-0"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleAddTransaction}
                  className="w-full h-10 mt-6 bg-primary text-primary-foreground hover:bg-primary/90 font-semibold rounded-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Transaction
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Input
          placeholder="Search by category or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-lg border-0 shadow-sm"
        />
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-full sm:w-40 rounded-lg border-0 shadow-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card className="overflow-hidden border-0 shadow-md rounded-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary/50 border-b border-border">
              <tr>
                <th className="px-4 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('date')}
                    className="flex items-center gap-2 hover:text-primary transition-colors"
                  >
                    Date
                    {sortField === 'date' && <ArrowUpDown className="w-4 h-4" />}
                  </button>
                </th>
                <th className="px-4 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">Category</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">Description</th>
                <th className="px-4 py-4 text-left text-xs font-bold text-foreground uppercase tracking-wider">Type</th>
                <th className="px-4 py-4 text-right text-xs font-bold text-foreground uppercase tracking-wider">
                  <button
                    onClick={() => toggleSort('amount')}
                    className="flex items-center justify-end gap-2 hover:text-primary transition-colors ml-auto"
                  >
                    Amount
                    {sortField === 'amount' && <ArrowUpDown className="w-4 h-4" />}
                  </button>
                </th>
                {userRole === 'admin' && <th className="px-4 py-4 text-center text-xs font-bold text-foreground uppercase tracking-wider">Action</th>}
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={userRole === 'admin' ? 6 : 5} className="px-4 py-8 text-center text-muted-foreground">
                    No transactions found
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-border hover:bg-secondary/30 transition-all duration-200">
                    <td className="px-4 py-4 text-sm text-foreground font-medium">{transaction.date}</td>
                    <td className="px-4 py-4 text-sm text-foreground font-semibold">{transaction.category}</td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">{transaction.description}</td>
                    <td className="px-4 py-4 text-sm">
                      <span
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                          transaction.type === 'income'
                            ? 'bg-accent/20 text-accent'
                            : 'bg-destructive/20 text-destructive'
                        }`}
                      >
                        {transaction.type === 'income' ? '✓ Income' : '✕ Expense'}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-4 text-sm text-right font-bold ${
                        transaction.type === 'income' ? 'text-accent' : 'text-destructive'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                          className="hover:bg-destructive/10 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 text-destructive hover:text-destructive/80" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Summary Footer */}
      <Card className="p-6 bg-gradient-to-r from-primary/5 to-primary/0 border-0 shadow-md rounded-xl">
        <div className="grid grid-cols-3 gap-6">
          <div className="p-4 rounded-lg bg-background/50">
            <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Total Transactions</p>
            <p className="text-3xl font-bold text-foreground">{filteredTransactions.length}</p>
          </div>
          <div className="p-4 rounded-lg bg-accent/5">
            <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Total Income</p>
            <p className="text-3xl font-bold text-accent">
              ${filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </p>
          </div>
          <div className="p-4 rounded-lg bg-destructive/5">
            <p className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">Total Expenses</p>
            <p className="text-3xl font-bold text-destructive">
              ${filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
