'use client';

import React, { useState, createContext, useContext } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DashboardOverview } from '@/components/dashboard-overview';
import { TransactionsPage } from '@/components/transactions-page';
import { InsightsPage } from '@/components/insights-page';

type UserRole = 'admin' | 'viewer';

interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  description: string;
}

interface AppContextType {
  currentPage: 'dashboard' | 'transactions' | 'insights';
  setCurrentPage: (page: 'dashboard' | 'transactions' | 'insights') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: '1', date: '2024-03-15', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '2', date: '2024-03-14', amount: 120, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '3', date: '2024-03-13', amount: 80, category: 'Transportation', type: 'expense', description: 'Gas' },
  { id: '4', date: '2024-03-12', amount: 1200, category: 'Rent', type: 'expense', description: 'Monthly rent' },
  { id: '5', date: '2024-03-11', amount: 50, category: 'Entertainment', type: 'expense', description: 'Movie tickets' },
  { id: '6', date: '2024-03-10', amount: 200, category: 'Food', type: 'expense', description: 'Restaurant' },
  { id: '7', date: '2024-03-09', amount: 150, category: 'Utilities', type: 'expense', description: 'Electric bill' },
  { id: '8', date: '2024-03-08', amount: 300, category: 'Food', type: 'expense', description: 'Meal delivery' },
  { id: '9', date: '2024-03-07', amount: 2500, category: 'Freelance', type: 'income', description: 'Project payment' },
  { id: '10', date: '2024-03-06', amount: 45, category: 'Entertainment', type: 'expense', description: 'Streaming service' },
  { id: '11', date: '2024-02-28', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '12', date: '2024-02-27', amount: 90, category: 'Food', type: 'expense', description: 'Groceries' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'transactions' | 'insights'>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Apply dark mode to document element
  React.useEffect(() => {
    setMounted(true);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const contextValue: AppContextType = {
    currentPage,
    setCurrentPage,
    userRole,
    setUserRole,
    transactions,
    setTransactions,
    darkMode,
    setDarkMode,
  };

  if (!mounted) {
    return null;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <DashboardLayout>
        {currentPage === 'dashboard' && <DashboardOverview />}
        {currentPage === 'transactions' && <TransactionsPage />}
        {currentPage === 'insights' && <InsightsPage />}
      </DashboardLayout>
    </AppContext.Provider>
  );
}
