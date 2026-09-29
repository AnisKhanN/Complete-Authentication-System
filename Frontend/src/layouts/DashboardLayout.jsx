import React from 'react';
import { Navbar } from '../components/common/Navbar';

export const DashboardLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col transition-colors duration-200">
      {/* SaaS subtle grid backdrop */}
      <div className="fixed inset-0 bg-grid-pattern opacity-40 dark:opacity-20 pointer-events-none z-0" />

      {/* Main Navbar */}
      <Navbar />

      {/* Page Content Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-slate-200/80 dark:border-slate-800/80 py-6 text-center text-xs text-slate-400 dark:text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>AuthShield Management Portal &bull; Active Device Session</p>
          <p>Connected to Live Express Authentication Backend</p>
        </div>
      </footer>
    </div>
  );
};
