import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6 text-center">
      <div className="relative mb-6">
        <div className="w-24 h-24 rounded-3xl bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-brand-600 dark:text-indigo-400 shadow-xl">
          <ShieldAlert className="w-12 h-12" />
        </div>
      </div>

      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/60 mb-3">
        404 &bull; Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-2">
        Lost in Cyberspace?
      </h1>

      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-8 leading-relaxed">
        The requested endpoint or view does not exist in the AuthShield routing table. Verify your URL or return to safety.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="primary" icon={Home}>
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/login">
          <Button variant="secondary" icon={ArrowLeft}>
            Sign In
          </Button>
        </Link>
      </div>
    </div>
  );
};
