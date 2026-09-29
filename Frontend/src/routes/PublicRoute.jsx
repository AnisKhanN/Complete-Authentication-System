import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthLayout } from '../layouts/AuthLayout';
import { Shield } from 'lucide-react';

export const PublicRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();

  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col items-center justify-center p-4">
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 animate-ping absolute" />
          <div className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/30">
            <Shield className="w-7 h-7 animate-pulse" />
          </div>
        </div>
        <p className="mt-5 text-sm font-medium text-slate-500 dark:text-slate-400">
          Loading secure environment...
        </p>
      </div>
    );
  }

  // Allow password recovery / OTP verification even if user is currently authenticated
  const isPasswordRecoveryFlow =
    location.pathname.startsWith('/forgot-password') ||
    location.pathname.startsWith('/verify-otp') ||
    location.pathname.startsWith('/reset-password');

  if (isAuthenticated && !isPasswordRecoveryFlow) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  );
};
