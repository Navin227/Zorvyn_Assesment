'use client';

import React from 'react';
import { useAppContext } from '@/app/page';
import { BarChart3, TrendingUp, Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage, userRole, setUserRole, darkMode, setDarkMode } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
    { id: 'history', label: 'History', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-white">
      {/* Sidebar */}
      <div className="hidden lg:flex lg:w-72 flex-col shadow-2xl ring-1 ring-gray-200 dark:ring-white/10 antialiased bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-100 border-r border-gray-200 dark:border-white/10">
        <div className="flex flex-col h-full p-6 gap-6" style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased' }}>
          {/* Logo */}
          <div className="flex items-center gap-3 font-bold text-2xl text-current">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg bg-blue-600">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="hidden sm:inline tracking-wide">FinFlow</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ease-in-out ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg ring-1 ring-blue-400'
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                  style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased' }}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm leading-tight tracking-wide">{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-gray-200 dark:border-white/10 pt-4 space-y-4">
            <Button
              onClick={() => setDarkMode(!darkMode)}
              size="sm"
              className="w-full flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs">{darkMode ? 'Light' : 'Dark'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b px-4 lg:px-8 py-4 flex items-center justify-between shadow-sm bg-white border-gray-200 dark:bg-slate-900 dark:border-gray-700">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{navItems.find((item) => item.id === currentPage)?.label}</div>
          <div className="text-sm text-gray-500 dark:text-gray-300">&nbsp;</div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-gray-50 dark:bg-slate-950">          <div className="p-4 lg:p-8">
            {children}
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {sidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 lg:hidden z-30"
            onClick={() => setSidebarOpen(false)}
          />
          <div
            className="fixed left-0 top-0 h-full w-64 z-40 transition-transform duration-300 antialiased bg-white text-gray-900 dark:bg-slate-900 dark:text-gray-100"
            style={{ textRendering: 'optimizeLegibility', WebkitFontSmoothing: 'antialiased' }}
          >
            <div className="flex flex-col h-full p-6 gap-8">
              {/* Logo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-xl text-current">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-600">
                    <BarChart3 className="w-5 h-5 text-white" />
                  </div>
                  <span>FinFlow</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentPage === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id as any);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-colors duration-150 ease-in-out ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-lg ring-1 ring-blue-400'
                          : 'text-gray-700 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-sm leading-tight tracking-wide">{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Section */}
              <div className="border-t border-gray-200 pt-4 space-y-4 dark:border-white/10">
                {/* Role Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as 'admin' | 'viewer')}
                    className="w-full px-3 py-2 rounded-lg text-sm font-medium border border-gray-200 bg-white text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-white/10 dark:bg-slate-800 dark:text-white dark:focus-visible:ring-blue-300"
                  >
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {userRole === 'admin' ? 'Full access to manage' : 'View only access'}
                  </p>
                </div>

                {/* Dark Mode Toggle */}
                <Button
                  onClick={() => setDarkMode(!darkMode)}
                  size="sm"
                  className="w-full flex items-center justify-center gap-2 transition-colors bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  <span className="text-xs">{darkMode ? 'Light' : 'Dark'}</span>
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
