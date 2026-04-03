'use client';

import React from 'react';
import { useAppContext } from '@/app/page';
import { BarChart3, TrendingUp, Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentPage, setCurrentPage, userRole, setUserRole, darkMode, setDarkMode } = useAppContext();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'transactions', label: 'Transactions', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: TrendingUp },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={`hidden lg:flex lg:w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border shadow-lg`}
      >
        <div className="flex flex-col h-full p-6 gap-8">
          {/* Logo */}
          <div className="flex items-center gap-3 font-bold text-xl">
            <div className="w-8 h-8 rounded-xl bg-sidebar-primary flex items-center justify-center shadow-md">
              <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="hidden sm:inline bg-gradient-to-r from-sidebar-primary to-sidebar-primary/70 bg-clip-text text-transparent">FinFlow</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setCurrentPage(item.id as any);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group ${
                    currentPage === item.id
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="border-t border-sidebar-border pt-4 space-y-4">
            {/* Role Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-sidebar-foreground/60">Role</label>
              <select
                value={userRole}
                onChange={(e) => setUserRole(e.target.value as 'admin' | 'viewer')}
                className="w-full px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium border border-sidebar-border"
              >
                <option value="admin">Admin</option>
                <option value="viewer">Viewer</option>
              </select>
              <p className="text-xs text-sidebar-foreground/50">
                {userRole === 'admin' ? 'Full access to manage' : 'View only access'}
              </p>
            </div>

            {/* Dark Mode Toggle */}
            <Button
              onClick={() => setDarkMode(!darkMode)}
              size="sm"
              className="w-full flex items-center justify-center gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80 transition-all duration-200 rounded-lg"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs font-semibold">{darkMode ? 'Light' : 'Dark'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-card border-b border-border px-4 lg:px-8 py-4 flex items-center justify-between shadow-sm">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden hover:bg-secondary/50 transition-all duration-200"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <div className="text-lg font-bold text-foreground">
            {navItems.find((item) => item.id === currentPage)?.label}
          </div>
          <div className="text-sm font-semibold text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-full">
            {userRole === 'admin' ? '👤 Admin' : '👁️ Viewer'}
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="p-4 lg:p-8">
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
            className="fixed left-0 top-0 h-full w-64 bg-sidebar text-sidebar-foreground z-40 transition-transform duration-300"
          >
            <div className="flex flex-col h-full p-6 gap-8">
              {/* Logo */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 font-bold text-xl">
                  <div className="w-8 h-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
                    <BarChart3 className="w-5 h-5 text-sidebar-primary-foreground" />
                  </div>
                  <span>FinFlow</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-sidebar-foreground"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Navigation */}
              <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentPage(item.id as any);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-semibold text-sm group ${
                        currentPage === item.id
                          ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg'
                          : 'text-sidebar-foreground hover:bg-sidebar-accent/20 hover:text-sidebar-accent-foreground'
                      }`}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0 transition-transform group-hover:scale-110" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              {/* Bottom Section */}
              <div className="border-t border-sidebar-border pt-4 space-y-4">
                {/* Role Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-sidebar-foreground/60">Role</label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as 'admin' | 'viewer')}
                    className="w-full px-3 py-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground text-sm font-medium border border-sidebar-border"
                  >
                    <option value="admin">Admin</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <p className="text-xs text-sidebar-foreground/50">
                    {userRole === 'admin' ? 'Full access to manage' : 'View only access'}
                  </p>
                </div>

            {/* Dark Mode Toggle */}
            <Button
              onClick={() => setDarkMode(!darkMode)}
              size="sm"
              className="w-full flex items-center justify-center gap-2 bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80 transition-all duration-200 rounded-lg"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs font-semibold">{darkMode ? 'Light' : 'Dark'}</span>
            </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
