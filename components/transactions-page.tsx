'use client';

import React, { useState, useMemo } from 'react';
import { useAppContext } from '@/app/page';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, ArrowUpDown, FileText } from 'lucide-react';
import { toast } from 'sonner';

type SortField = 'date' | 'amount';
type SortOrder = 'asc' | 'desc';
type FilterType = 'all' | 'income' | 'expense';

export function TransactionsPage() {
  const { transactions, setTransactions, userRole, isLoading } = useAppContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
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
      
      // Month filter
      let matchesMonth = true;
      if (selectedMonths.length > 0) {
        const transactionMonth = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
        matchesMonth = selectedMonths.includes(transactionMonth);
      }
      
      return matchesSearch && matchesType && matchesMonth;
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
  }, [transactions, searchTerm, filterType, sortField, sortOrder, selectedMonths]);

  const handleAddTransaction = () => {
    if (!formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      date: formData.date,
      amount: amount,
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
    toast.success('Transaction added successfully!');
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
    toast.success('Transaction deleted successfully!');
  };

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Get all available months from transactions
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      const month = new Date(t.date).toLocaleString('default', { month: 'long', year: 'numeric' });
      months.add(month);
    });
    return Array.from(months).sort((a, b) => new Date(b) - new Date(a));
  }, [transactions]);

  const toggleMonth = (month: string) => {
    setSelectedMonths((prev) =>
      prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage and track all your transactions</p>
        </div>
        {userRole === 'admin' && (
          <Dialog open={openDialog} onOpenChange={setOpenDialog}>
            <DialogTrigger asChild>
              <Button className="gap-2 bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400">
                <Plus className="w-4 h-4" />
                Add Transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md w-full rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-white/10 dark:bg-slate-900">
              <DialogHeader className="pb-4 border-b border-gray-200 dark:border-white/10">
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white">Add New Transaction</DialogTitle>
              </DialogHeader>
              <DialogDescription className="sr-only">Fill in the details to add a new transaction to your account.</DialogDescription>
              <div className="space-y-4 py-5">
                {/* Date and Type Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
                    <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                      <SelectTrigger className="w-full" >
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
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</label>
                    <div className="flex items-center border border-gray-200 rounded-xl bg-white dark:bg-slate-800 dark:border-white/10 overflow-hidden">
                      <span className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-200">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        className="w-full border-0 bg-transparent focus-visible:ring-0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="w-full">
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
                  <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                  <Input
                    placeholder="e.g. Monthly groceries, Gas refill, etc."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full"
                  />
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleAddTransaction}
                  className="w-full h-11 mt-6 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl transition-all duration-200"
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
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <Input
          placeholder="Search by category or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 rounded-xl border border-gray-200 bg-white text-gray-800 shadow-sm transition-all focus:border-blue-500 dark:border-white/10 dark:bg-slate-800 dark:text-gray-200"
        />
        <Select value={filterType} onValueChange={(v: any) => setFilterType(v)}>
          <SelectTrigger className="w-full sm:w-48 rounded-xl" >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Month Filter */}
      {availableMonths.length > 0 && (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Filter by Month:</label>
          <div className="flex flex-wrap gap-2">
            {availableMonths.map((month) => (
              <button
                key={month}
                onClick={() => toggleMonth(month)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                  selectedMonths.includes(month)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 dark:bg-slate-800 dark:text-gray-200 dark:border-white/10 hover:border-blue-400'
                }`}
              >
                {month}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <Card className="overflow-hidden rounded-xl shadow-lg border border-white/10 dark:border-white/10">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-8" />
                </div>
              ))}
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-200 mb-2">No transactions found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterType !== 'all'
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by adding your first transaction.'}
              </p>
              {userRole === 'admin' && !searchTerm && filterType === 'all' && (
                <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                  <DialogTrigger asChild>
                    <Button className="gap-2">
                      <Plus className="w-4 h-4" />
                      Add your first transaction
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md w-full rounded-xl border border-border bg-white/90 dark:bg-slate-900/90 shadow-2xl backdrop-blur-sm">
                    <DialogHeader className="pb-4 border-b border-border">
                      <DialogTitle className="text-2xl font-bold text-foreground">Add New Transaction</DialogTitle>
                    </DialogHeader>
                    <DialogDescription className="sr-only">Fill in the details to add a new transaction to your account.</DialogDescription>
                    <div className="space-y-4 py-5">
                      {/* Date and Type Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Date</label>
                          <Input
                            type="date"
                            value={formData.date}
                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Type</label>
                          <Select value={formData.type} onValueChange={(v: any) => setFormData({ ...formData, type: v })}>
                            <SelectTrigger className="w-full" >
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
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Amount</label>
                          <div className="flex items-center border border-border rounded-xl bg-gray-50 dark:bg-slate-800 overflow-hidden">
                            <span className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300">$</span>
                            <Input
                              type="number"
                              placeholder="0.00"
                              value={formData.amount}
                              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                              className="w-full border-0 bg-transparent focus-visible:ring-0"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Category</label>
                          <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                            <SelectTrigger className="w-full">
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
                        <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Description</label>
                        <Input
                          placeholder="e.g. Monthly groceries, Gas refill, etc."
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full"
                        />
                      </div>

                      {/* Submit Button */}
                      <Button
                        onClick={handleAddTransaction}
                        className="w-full h-11 mt-6 bg-blue-600 text-white hover:bg-blue-700 font-bold rounded-xl transition-all duration-200"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Transaction
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-white border-b border-gray-200 dark:bg-slate-900 dark:border-white/10">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <button
                      onClick={() => toggleSort('date')}
                      className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                    >
                      Date
                      {sortField === 'date' && <ArrowUpDown className="w-4 h-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">Category</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">Description</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-800 dark:text-gray-200">Type</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-gray-800 dark:text-gray-200">
                    <button
                      onClick={() => toggleSort('amount')}
                      className="flex items-center justify-end gap-2 hover:text-primary transition-colors ml-auto"
                    >
                      Amount
                      {sortField === 'amount' && <ArrowUpDown className="w-4 h-4" />}
                    </button>
                  </th>
                  {userRole === 'admin' && <th className="px-4 py-3 text-center text-sm font-semibold text-foreground">Action</th>}
                </tr>
              </thead>
              <tbody>
                {filteredTransactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-white/5 transition-all duration-200">
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200">{transaction.date}</td>
                    <td className="px-4 py-3 text-sm text-gray-800 dark:text-gray-200 font-medium">{transaction.category}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{transaction.description}</td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          transaction.type === 'income'
                            ? 'bg-green-900/70 text-green-300 dark:bg-green-800/70 dark:text-green-200'
                            : 'bg-red-900/70 text-red-300 dark:bg-red-800/70 dark:text-red-200'
                        }`}
                      >
                        {transaction.type === 'income' ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td
                      className={`px-4 py-3 text-sm text-right font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </td>
                    {userRole === 'admin' && (
                      <td className="px-4 py-3 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/40"
                          onClick={() => handleDeleteTransaction(transaction.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* Summary Footer */}
      <Card className="p-6">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Transactions</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredTransactions.length}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Income</p>
            <p className="text-2xl font-bold text-green-600 dark:text-green-300">
              ${filteredTransactions.filter((t) => t.type === 'income').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-red-600 dark:text-red-300">
              ${filteredTransactions.filter((t) => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0).toFixed(2)}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
