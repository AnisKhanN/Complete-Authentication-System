import React, { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  User,
  Key,
  LogOut,
  RefreshCw,
  Clock,
  Laptop,
  CheckCircle2,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { gsap } from 'gsap';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatDate } from '../utils/formatters';

export const Dashboard = () => {
  const { user, refreshSession, logout, logoutAll } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [modalType, setModalType] = useState(null); // 'logout' | 'logout-all' | null
  const [isModalLoading, setIsModalLoading] = useState(false);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(
        '.dash-welcome',
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.6 }
      )
        .fromTo(
          '.dash-metric-card',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          '-=0.3'
        )
        .fromTo(
          ['.dash-user-card', '.dash-session-card'],
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.55, stagger: 0.15 },
          '-=0.3'
        )
        .fromTo(
          '.dash-action-card',
          { opacity: 0, y: 25 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          '-=0.3'
        );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshSession();
    setIsRefreshing(false);
  };

  const handleModalConfirm = async () => {
    setIsModalLoading(true);
    if (modalType === 'logout') {
      await logout();
      navigate('/login');
    } else if (modalType === 'logout-all') {
      await logoutAll();
      navigate('/login');
    }
    setIsModalLoading(false);
    setModalType(null);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div ref={containerRef} className="space-y-8">
      {/* Welcome Banner */}
      <div className="dash-welcome flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-indigo-700 text-white shadow-xl shadow-indigo-500/10">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/15 backdrop-blur-md text-white border border-white/20 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            <span>Secure Active Session</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Member'}!
          </h1>
          <p className="text-sm text-indigo-100 max-w-xl leading-relaxed">
            Your authentication state is verified. Tokens are protected via HTTP-only cookies with automatic rotation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleManualRefresh}
            isLoading={isRefreshing}
            icon={RefreshCw}
            className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md"
          >
            Refresh Token
          </Button>

          <Link to="/profile">
            <Button
              variant="secondary"
              size="sm"
              icon={User}
              className="bg-white text-slate-900 hover:bg-slate-100 shadow-md border-transparent"
            >
              Account Details
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <div className="dash-metric-card p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Authentication Mode
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            JWT + HTTP-Only
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Cookie-based &bull; SameSite Strict
          </p>
        </div>

        <div className="dash-metric-card p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Session Rotation
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            Auto Refresh Active
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            10m Access &bull; 7d Refresh Cycle
          </p>
        </div>

        <div className="dash-metric-card p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Device Sessions
            </span>
            <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 text-cyan-600 dark:text-cyan-400">
              <Laptop className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl font-bold text-slate-900 dark:text-white">
            Multi-Device Active
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Up to 10 concurrent sessions
          </p>
        </div>
      </div>

      {/* Main Grid: User Profile Summary & Session Security */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Card */}
        <Card
          title="User Information"
          subtitle="Real-time profile synchronized with MongoDB"
          icon={User}
          className="dash-user-card"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Full Name</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {user?.name}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">Email Address</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono text-xs sm:text-sm">
                {user?.email}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800/60">
              <span className="text-slate-500 dark:text-slate-400">User ID</span>
              <span className="font-mono text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                {user?._id}
              </span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-slate-500 dark:text-slate-400">Account Created</span>
              <span className="text-slate-700 dark:text-slate-300">
                {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </Card>

        {/* Session Security Details Card */}
        <Card
          title="Authentication & Session Details"
          subtitle="Security posture of your current connection"
          icon={ShieldCheck}
          className="dash-session-card"
        >
          <div className="space-y-3.5 text-sm">
            <div className="flex items-start gap-3 p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-900/50">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm">
                  Protected against XSS Token Theft
                </p>
                <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mt-0.5 leading-relaxed">
                  Tokens are stored exclusively in HTTP-only browser cookies and cannot be accessed via malicious JavaScript scripts.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/60 dark:border-indigo-900/50">
              <CheckCircle2 className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-indigo-900 dark:text-indigo-300 text-xs sm:text-sm">
                  Seamless Background Rotation
                </p>
                <p className="text-xs text-indigo-700/80 dark:text-indigo-400/80 mt-0.5 leading-relaxed">
                  If the 10-minute access token expires, Axios automatically intercepts the 401 response and requests a fresh token using your refresh cookie.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Quick Actions Row */}
      <div className="space-y-4">
        <h2 className="text-base font-semibold text-slate-900 dark:text-white">
          Security Actions
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="dash-action-card p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2 text-slate-900 dark:text-white font-semibold">
                <Key className="w-4 h-4 text-brand-500" />
                <span>Password Recovery</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Test the OTP verification flow or update your account password securely.
              </p>
            </div>
            <Link to="/forgot-password">
              <Button variant="outline" size="sm" className="w-full" icon={ArrowRight}>
                Change Password via OTP
              </Button>
            </Link>
          </div>

          <div className="dash-action-card p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2 text-slate-900 dark:text-white font-semibold">
                <LogOut className="w-4 h-4 text-amber-500" />
                <span>Current Device Logout</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Clears cookies on this browser and removes the session from the backend database.
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              onClick={() => setModalType('logout')}
              icon={LogOut}
            >
              Sign Out Device
            </Button>
          </div>

          <div className="dash-action-card p-5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between gap-4">
            <div>
              <div className="flex items-center gap-2.5 mb-2 text-rose-600 dark:text-rose-400 font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>Logout All Devices</span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Instantly revokes all active refresh tokens across every mobile, desktop, and tablet session.
              </p>
            </div>
            <Button
              variant="danger"
              size="sm"
              className="w-full"
              onClick={() => setModalType('logout-all')}
              icon={ShieldAlert}
            >
              Revoke All Sessions
            </Button>
          </div>
        </div>
      </div>

      {/* Confirmation Modals */}
      <Modal
        isOpen={modalType === 'logout'}
        onClose={() => setModalType(null)}
        onConfirm={handleModalConfirm}
        title="Sign Out Current Device"
        description="Are you sure you want to sign out from this browser session?"
        confirmText="Sign Out"
        cancelText="Cancel"
        isLoading={isModalLoading}
        icon={LogOut}
      />

      <Modal
        isOpen={modalType === 'logout-all'}
        onClose={() => setModalType(null)}
        onConfirm={handleModalConfirm}
        title="Revoke All Active Sessions"
        description="This will instantly disconnect all devices currently signed in with your account. You will need to sign in again everywhere."
        confirmText="Revoke All Sessions"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isModalLoading}
        icon={ShieldAlert}
      />
    </div>
  );
};
