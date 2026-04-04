'use client';

import React, { useState, createContext, useContext, useEffect } from 'react';
import { DashboardLayout } from '@/components/dashboard-layout';
import { DashboardOverview } from '@/components/dashboard-overview';
import { TransactionsPage } from '@/components/transactions-page';
import { InsightsPage } from '@/components/insights-page';
import { HistoryPage } from '@/components/history-page';

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
  currentPage: 'dashboard' | 'transactions' | 'insights' | 'history';
  setCurrentPage: (page: 'dashboard' | 'transactions' | 'insights' | 'history') => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
  darkMode: boolean;
  setDarkMode: (dark: boolean) => void;
  isLoading: boolean;
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
  // April 2026 (Current Month)
  { id: '1', date: '2026-04-01', amount: 5200, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '2', date: '2026-04-02', amount: 125, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '3', date: '2026-04-03', amount: 65, category: 'Transport', type: 'expense', description: 'Uber ride' },

  // March 2026 (Historical)
  { id: '4', date: '2026-03-01', amount: 5200, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '5', date: '2026-03-02', amount: 110, category: 'Food', type: 'expense', description: 'Breakfast' },
  { id: '6', date: '2026-03-03', amount: 55, category: 'Transport', type: 'expense', description: 'Uber ride' },
  { id: '7', date: '2026-03-05', amount: 1250, category: 'Rent', type: 'expense', description: 'Monthly rent' },
  { id: '8', date: '2026-03-06', amount: 95, category: 'Food', type: 'expense', description: 'Lunch' },
  { id: '9', date: '2026-03-08', amount: 210, category: 'Shopping', type: 'expense', description: 'New shoes' },
  { id: '10', date: '2026-03-09', amount: 3100, category: 'Freelance', type: 'income', description: 'Client project milestone' },
  { id: '11', date: '2026-03-11', amount: 65, category: 'Entertainment', type: 'expense', description: 'Movie night' },
  { id: '12', date: '2026-03-13', amount: 45, category: 'Food', type: 'expense', description: 'Coffee and snacks' },
  { id: '13', date: '2026-03-16', amount: 35, category: 'Transport', type: 'expense', description: 'Bus pass' },

  // February 2026 (Historical)
  { id: '14', date: '2026-02-01', amount: 5200, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '15', date: '2026-02-03', amount: 70, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '16', date: '2026-02-06', amount: 60, category: 'Transport', type: 'expense', description: 'Gas' },
  { id: '17', date: '2026-02-07', amount: 1300, category: 'Rent', type: 'expense', description: 'Monthly rent' },
  { id: '18', date: '2026-02-10', amount: 150, category: 'Food', type: 'expense', description: 'Family dinner' },
  { id: '19', date: '2026-02-12', amount: 290, category: 'Shopping', type: 'expense', description: 'Spring clothes' },
  { id: '20', date: '2026-02-15', amount: 2800, category: 'Freelance', type: 'income', description: 'Project payment' },
  { id: '21', date: '2026-02-18', amount: 45, category: 'Entertainment', type: 'expense', description: 'Concert streaming' },
  { id: '22', date: '2026-02-20', amount: 25, category: 'Transport', type: 'expense', description: 'Metro' },
  { id: '23', date: '2026-02-23', amount: 90, category: 'Food', type: 'expense', description: 'Lunch out' },

  // January 2026 (Historical)
  { id: '24', date: '2026-01-01', amount: 5200, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '25', date: '2026-01-03', amount: 65, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '26', date: '2026-01-04', amount: 55, category: 'Transport', type: 'expense', description: 'Uber' },
  { id: '27', date: '2026-01-06', amount: 1250, category: 'Rent', type: 'expense', description: 'Monthly rent' },
  { id: '28', date: '2026-01-08', amount: 110, category: 'Food', type: 'expense', description: 'Dinner' },
  { id: '29', date: '2026-01-12', amount: 70, category: 'Entertainment', type: 'expense', description: 'Bowling with friends' },
  { id: '30', date: '2026-01-14', amount: 3200, category: 'Freelance', type: 'income', description: 'Consulting payment' },
  { id: '31', date: '2026-01-17', amount: 85, category: 'Food', type: 'expense', description: 'Brunch' },
  { id: '32', date: '2026-01-20', amount: 30, category: 'Transport', type: 'expense', description: 'Taxi' },

  // December 2025 (Historical)
  { id: '33', date: '2025-12-01', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '34', date: '2025-12-03', amount: 90, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '35', date: '2025-12-05', amount: 55, category: 'Transport', type: 'expense', description: 'Fuel' },
  { id: '36', date: '2025-12-07', amount: 1250, category: 'Rent', type: 'expense', description: 'Rent' },
  { id: '37', date: '2025-12-10', amount: 130, category: 'Food', type: 'expense', description: 'Holiday dinner' },
  { id: '38', date: '2025-12-12', amount: 90, category: 'Shopping', type: 'expense', description: 'Gift shopping' },
  { id: '39', date: '2025-12-15', amount: 2600, category: 'Freelance', type: 'income', description: 'Seasonal work' },
  { id: '40', date: '2025-12-18', amount: 65, category: 'Entertainment', type: 'expense', description: 'Concert ticket' },
  { id: '41', date: '2025-12-21', amount: 35, category: 'Transport', type: 'expense', description: 'Taxi' },

  // November 2025 (Historical)
  { id: '42', date: '2025-11-01', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '43', date: '2025-11-03', amount: 80, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '44', date: '2025-11-05', amount: 60, category: 'Transport', type: 'expense', description: 'Uber' },
  { id: '45', date: '2025-11-06', amount: 1250, category: 'Rent', type: 'expense', description: 'Rent' },
  { id: '46', date: '2025-11-08', amount: 140, category: 'Entertainment', type: 'expense', description: 'Theater' },
  { id: '47', date: '2025-11-10', amount: 220, category: 'Shopping', type: 'expense', description: 'Winter supplies' },
  { id: '48', date: '2025-11-13', amount: 2800, category: 'Freelance', type: 'income', description: 'Project payment' },
  { id: '49', date: '2025-11-15', amount: 55, category: 'Food', type: 'expense', description: 'Restaurant' },
  { id: '50', date: '2025-11-18', amount: 30, category: 'Transport', type: 'expense', description: 'Bus pass' },

  // October 2025 (Historical)
  { id: '51', date: '2025-10-01', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '52', date: '2025-10-02', amount: 75, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '53', date: '2025-10-05', amount: 50, category: 'Transport', type: 'expense', description: 'Gas' },
  { id: '54', date: '2025-10-07', amount: 1250, category: 'Rent', type: 'expense', description: 'Rent' },
  { id: '55', date: '2025-10-10', amount: 125, category: 'Food', type: 'expense', description: 'Family dinner' },
  { id: '56', date: '2025-10-12', amount: 180, category: 'Entertainment', type: 'expense', description: 'Concert' },
  { id: '57', date: '2025-10-15', amount: 2700, category: 'Freelance', type: 'income', description: 'Project work' },
  { id: '58', date: '2025-10-18', amount: 95, category: 'Food', type: 'expense', description: 'Lunch' },
  { id: '59', date: '2025-10-20', amount: 40, category: 'Transport', type: 'expense', description: 'Taxi' },
  { id: '60', date: '2025-10-25', amount: 150, category: 'Shopping', type: 'expense', description: 'Books' },

  // September 2025 (Historical)
  { id: '61', date: '2025-09-01', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '62', date: '2025-09-03', amount: 85, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '63', date: '2025-09-05', amount: 55, category: 'Transport', type: 'expense', description: 'Uber' },
  { id: '64', date: '2025-09-07', amount: 1250, category: 'Rent', type: 'expense', description: 'Rent' },
  { id: '65', date: '2025-09-10', amount: 120, category: 'Food', type: 'expense', description: 'Restaurant' },
  { id: '66', date: '2025-09-12', amount: 250, category: 'Shopping', type: 'expense', description: 'Clothes' },
  { id: '67', date: '2025-09-15', amount: 3000, category: 'Freelance', type: 'income', description: 'Client project' },
  { id: '68', date: '2025-09-18', amount: 60, category: 'Entertainment', type: 'expense', description: 'Movie' },
  { id: '69', date: '2025-09-20', amount: 35, category: 'Transport', type: 'expense', description: 'Bus pass' },
  { id: '70', date: '2025-09-25', amount: 100, category: 'Food', type: 'expense', description: 'Brunch' },

  // August 2025 (Historical)
  { id: '71', date: '2025-08-01', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '72', date: '2025-08-02', amount: 70, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '73', date: '2025-08-05', amount: 60, category: 'Transport', type: 'expense', description: 'Fuel' },
  { id: '74', date: '2025-08-07', amount: 1250, category: 'Rent', type: 'expense', description: 'Rent' },
  { id: '75', date: '2025-08-10', amount: 130, category: 'Food', type: 'expense', description: 'Dinner' },
  { id: '76', date: '2025-08-12', amount: 200, category: 'Entertainment', type: 'expense', description: 'Event ticket' },
  { id: '77', date: '2025-08-15', amount: 2900, category: 'Freelance', type: 'income', description: 'Consulting' },
  { id: '78', date: '2025-08-18', amount: 75, category: 'Food', type: 'expense', description: 'Takeout' },
  { id: '79', date: '2025-08-21', amount: 45, category: 'Transport', type: 'expense', description: 'Taxi' },
  { id: '80', date: '2025-08-25', amount: 120, category: 'Shopping', type: 'expense', description: 'Summer items' },

  // July 2025 (Historical)
  { id: '81', date: '2025-07-01', amount: 5000, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '82', date: '2025-07-02', amount: 90, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '83', date: '2025-07-05', amount: 50, category: 'Transport', type: 'expense', description: 'Gas' },
  { id: '84', date: '2025-07-07', amount: 1250, category: 'Rent', type: 'expense', description: 'Rent' },
  { id: '85', date: '2025-07-10', amount: 115, category: 'Food', type: 'expense', description: 'Family dinner' },
  { id: '86', date: '2025-07-12', amount: 300, category: 'Shopping', type: 'expense', description: 'Vacation prep' },
  { id: '87', date: '2025-07-15', amount: 2800, category: 'Freelance', type: 'income', description: 'Project payment' },
  { id: '88', date: '2025-07-18', amount: 70, category: 'Entertainment', type: 'expense', description: 'Concert' },
  { id: '89', date: '2025-07-20', amount: 40, category: 'Transport', type: 'expense', description: 'Taxi' },
  { id: '90', date: '2025-07-25', amount: 110, category: 'Food', type: 'expense', description: 'Brunch' },

  // June 2025 (Historical)
  { id: '91', date: '2025-06-01', amount: 5200, category: 'Salary', type: 'income', description: 'Monthly salary' },
  { id: '92', date: '2025-06-03', amount: 80, category: 'Food', type: 'expense', description: 'Groceries' },
  { id: '93', date: '2025-06-05', amount: 55, category: 'Transport', type: 'expense', description: 'Uber' },
  { id: '94', date: '2025-06-07', amount: 1250, category: 'Rent', type: 'expense', description: 'Rent' },
  { id: '95', date: '2025-06-10', amount: 140, category: 'Food', type: 'expense', description: 'Restaurant' },
  { id: '96', date: '2025-06-12', amount: 180, category: 'Entertainment', type: 'expense', description: 'Theater' },
  { id: '97', date: '2025-06-15', amount: 3100, category: 'Freelance', type: 'income', description: 'Milestone payment' },
  { id: '98', date: '2025-06-18', amount: 65, category: 'Food', type: 'expense', description: 'Lunch' },
  { id: '99', date: '2025-06-20', amount: 30, category: 'Transport', type: 'expense', description: 'Bus' },
  { id: '100', date: '2025-06-25', amount: 95, category: 'Shopping', type: 'expense', description: 'Accessories' },
];

const STORAGE_KEY = 'finflow-transactions';
const DARK_MODE_KEY = 'finflow-dark-mode';

export default function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'transactions' | 'insights' | 'history'>('dashboard');
  const [userRole, setUserRole] = useState<UserRole>('admin');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Check if stored data is 2026/2025 (current dataset) or older stale data
          const hasRecentData = parsed.some((tx: any) => {
            const year = new Date(tx.date).getFullYear();
            return year >= 2026 || year >= 2025;
          });

          if (hasRecentData) {
            setTransactions(parsed);
          } else {
            // Stale data detected, use fresh mock data
            setTransactions(MOCK_TRANSACTIONS);
            localStorage.removeItem(STORAGE_KEY); // Clear old data
          }
        } else {
          setTransactions(MOCK_TRANSACTIONS);
        }
      } else {
        setTransactions(MOCK_TRANSACTIONS);
      }

      // Load dark mode preference
      const darkModeStored = localStorage.getItem(DARK_MODE_KEY);
      if (darkModeStored !== null) {
        setDarkMode(JSON.parse(darkModeStored));
      }
    } catch (error) {
      console.error('Error loading data from localStorage:', error);
      setTransactions(MOCK_TRANSACTIONS);
      localStorage.removeItem(STORAGE_KEY); // Clear corrupted data
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever transactions change
  useEffect(() => {
    if (mounted && !isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
      } catch (error) {
        console.error('Error saving transactions to localStorage:', error);
      }
    }
  }, [transactions, mounted, isLoading]);

  // Apply dark mode to document element
  React.useEffect(() => {
    setMounted(true);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Save dark mode preference
    try {
      localStorage.setItem(DARK_MODE_KEY, JSON.stringify(darkMode));
    } catch (error) {
      console.error('Error saving dark mode preference:', error);
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
    isLoading,
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
        {currentPage === 'history' && <HistoryPage />}
      </DashboardLayout>
    </AppContext.Provider>
  );
}
