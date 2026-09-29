import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  User,
  Mail,
  Calendar,
  Shield,
  KeyRound,
  LogOut,
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Laptop,
  Smartphone,
  Globe,
  Clock,
  RefreshCw,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { formatDate, getInitials } from "../utils/formatters";

export const Profile = () => {
  const { user, logout, logoutAll } = useAuth();
  const navigate = useNavigate();

  const [modalType, setModalType] = useState(null); // 'logout' | 'logout-all'
  const [isLoading, setIsLoading] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isDevicesLoading, setIsDevicesLoading] = useState(true);

  const fetchDevices = useCallback(async () => {
    try {
      setIsDevicesLoading(true);
      const res = await api.get("/get-devices");
      if (res.data?.devices) {
        setDevices(res.data.devices);
      }
    } catch (err) {
      console.warn("Failed to load device sessions:", err);
    } finally {
      setIsDevicesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDevices();
  }, [fetchDevices]);

  const handleModalConfirm = async () => {
    setIsLoading(true);
    if (modalType === "logout") {
      await logout();
      navigate("/login");
    } else if (modalType === "logout-all") {
      await logoutAll();
      navigate("/login");
    }
    setIsLoading(false);
    setModalType(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Top Banner / User Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-brand-500/20 shrink-0">
          {getInitials(user?.name)}
        </div>

        <div className="flex-1 text-center sm:text-left space-y-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {user?.name || "Account User"}
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 w-fit mx-auto sm:mx-0">
              <CheckCircle className="w-3 h-3" />
              Active Account
            </span>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-mono">
            {user?.email}
          </p>
          <p className="text-xs text-slate-400 dark:text-slate-500 pt-1">
            Member since {formatDate(user?.createdAt)}
          </p>
        </div>
      </div>

      {/* Account Details Card */}
      <Card
        title="Personal Profile Information"
        subtitle="Account credentials registered with the authentication system"
        icon={User}
      >
        <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <User className="w-4 h-4 text-slate-400" />
              Display Name
            </span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {user?.name}
            </span>
          </div>

          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" />
              Email Address
            </span>
            <span className="font-mono text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
              {user?.email}
            </span>
          </div>

          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400" />
              Member Since
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {formatDate(user?.createdAt)}
            </span>
          </div>

          <div className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-sm">
            <span className="text-slate-500 dark:text-slate-400 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-400" />
              Authentication State
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Authenticated & Active
            </span>
          </div>
        </div>
      </Card>

      {/* Security & Password Management */}
      <Card
        title="Security & Password"
        subtitle="Manage your authentication credentials and OTP password recovery"
        icon={KeyRound}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
          <div className="space-y-1">
            <p className="font-semibold text-slate-900 dark:text-white text-sm">
              Password Security & Recovery
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Need to change your password? Request a 6-digit verification code
              sent to your registered Gmail inbox.
            </p>
          </div>
          <Link to="/forgot-password">
            <Button variant="outline" size="sm" icon={KeyRound}>
              Change Password via OTP
            </Button>
          </Link>
        </div>
      </Card>

      {/* Device Session Management / Danger Zone */}
      <Card
        title="Device Sessions & Logout Controls"
        subtitle="Manage active refresh tokens across all signed-in browsers (up to 10 concurrent sessions)"
        icon={ShieldAlert}
        className="border-rose-200/50 dark:border-rose-900/30"
      >
        <div className="space-y-5">
          {/* Active Sessions List from Backend */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Connected Devices ({devices.filter((d) => !d.isRevoked).length}{" "}
                active)
              </span>
              <button
                type="button"
                onClick={fetchDevices}
                className="inline-flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                <RefreshCw
                  className={`w-3 h-3 ${isDevicesLoading ? "animate-spin" : ""}`}
                />
                Refresh List
              </button>
            </div>

            {isDevicesLoading ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                Loading active sessions...
              </div>
            ) : devices.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl">
                Current browser session active.
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {devices.slice(0, 5).map((device) => {
                  const isMobile = device.deviceType
                    ?.toLowerCase()
                    .includes("mobile");
                  return (
                    <div
                      key={device._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-brand-600 dark:text-indigo-400">
                          {isMobile ? (
                            <Smartphone className="w-4 h-4" />
                          ) : (
                            <Laptop className="w-4 h-4" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">
                            {device.deviceType || "Desktop"} &bull; IP:{" "}
                            {device.ipAddress}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3" />
                            Logged in: {formatDate(device.loginAt)}
                          </p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          device.isRevoked
                            ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            : "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
                        }`}
                      >
                        {device.isRevoked ? "Revoked" : "Active"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/60 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
              <div className="space-y-1">
                <p className="font-semibold text-slate-900 dark:text-white text-sm">
                  Sign Out Current Device
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Invalidates the session token for this browser and clears your
                  cookies.
                </p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setModalType("logout")}
                icon={LogOut}
              >
                Sign Out
              </Button>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Sign Out of All Devices</span>
                </div>
                <p className="text-xs text-rose-700/80 dark:text-rose-400/80">
                  Immediately revokes all active refresh tokens in MongoDB
                  across all laptops, desktops, and mobile devices.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setModalType("logout-all")}
                icon={ShieldAlert}
              >
                Sign Out All Devices
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Modals */}
      <Modal
        isOpen={modalType === "logout"}
        onClose={() => setModalType(null)}
        onConfirm={handleModalConfirm}
        title="Sign Out Current Device"
        description="Are you sure you want to end your current session on this device?"
        confirmText="Sign Out"
        cancelText="Cancel"
        isLoading={isLoading}
        icon={LogOut}
      />

      <Modal
        isOpen={modalType === "logout-all"}
        onClose={() => setModalType(null)}
        onConfirm={handleModalConfirm}
        title="Revoke All Sessions Everywhere?"
        description="This will instantly invalidate all device refresh tokens. You will be signed out everywhere and will need to log back in."
        confirmText="Yes, Sign Out All Devices"
        cancelText="Cancel"
        isDestructive={true}
        isLoading={isLoading}
        icon={ShieldAlert}
      />
    </div>
  );
};
