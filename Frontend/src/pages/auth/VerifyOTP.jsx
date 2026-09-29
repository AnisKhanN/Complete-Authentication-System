import React, { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
} from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import { AuthCard } from "../../components/auth/AuthCard";
import { Button } from "../../components/ui/Button";

export const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputRefs = useRef([]);

  // Redirect if no email state is provided
  useEffect(() => {
    if (!email) {
      toast.warning("Please enter your email to receive a verification code");
      navigate("/forgot-password", { replace: true });
    }
  }, [email, navigate, toast]);

  // Countdown timer for Resend OTP
  useEffect(() => {
    if (resendTimer > 0) {
      const interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(true);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    // Only accept numeric digit
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const updated = [...otp];
      updated[index] = "";
      setOtp(updated);
      return;
    }

    const digit = cleaned.slice(-1);
    const updated = [...otp];
    updated[index] = digit;
    setOtp(updated);
    setError(null);

    // Auto-focus next input
    if (index < 5 && digit) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim().replace(/\D/g, "");
    if (pasteData) {
      const digits = pasteData.slice(0, 6).split("");
      const updated = [...otp];
      digits.forEach((d, idx) => {
        if (idx < 6) updated[idx] = d;
      });
      setOtp(updated);
      setError(null);
      const nextIndex = Math.min(digits.length, 5);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const handleResend = async () => {
    if (!canResend || isResending) return;
    setIsResending(true);
    setError(null);

    try {
      const response = await api.post("/send-otp", { email });
      toast.success(response.data?.message || "New verification code sent");
      setResendTimer(60);
      setCanResend(false);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Failed to resend verification code";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      setError("Please enter all 6 digits of your verification code");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/verify-otp", { email, otp: fullOtp });
      toast.success(response.data?.message || "Code verified successfully!");

      // Navigate to Reset Password page with email and verified OTP
      navigate("/reset-password", {
        state: { email, otp: fullOtp },
      });
    } catch (err) {
      const message = err.response?.data?.message || "Invalid or expired OTP";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Enter Verification Code"
      subtitle={`We sent a 6-digit code to ${email || "your email"} (valid for 10 minutes)`}
      icon={ShieldCheck}
      badge="Step 2 of 3"
    >

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 6-box OTP Input */}
        <div className="auth-form-item">
          <div
            className="flex justify-between gap-2 sm:gap-3"
            onPaste={handlePaste}
          >
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                autoFocus={idx === 0}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                className={`w-11 h-13 sm:w-12 sm:h-14 text-center font-mono text-xl sm:text-2xl font-bold rounded-xl border bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm outline-none transition-all duration-200
                  ${
                    error
                      ? "border-rose-500 text-rose-500 focus:ring-2 focus:ring-rose-500/20"
                      : digit
                        ? "border-brand-500 ring-2 ring-brand-500/15 text-slate-900 dark:text-white"
                        : "border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                  }`}
              />
            ))}
          </div>

          {error && (
            <p className="text-center text-xs text-rose-600 dark:text-rose-400 font-medium mt-3">
              {error}
            </p>
          )}
        </div>

        {/* Resend timer */}
        <div className="auth-form-item text-center text-xs text-slate-500 dark:text-slate-400">
          {canResend ? (
            <button
              type="button"
              onClick={handleResend}
              disabled={isResending}
              className="inline-flex items-center gap-1.5 font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 hover:underline transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`}
              />
              Resend verification code
            </button>
          ) : (
            <p>
              Didn't receive code? Resend in{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                {resendTimer}s
              </span>
            </p>
          )}
        </div>

        <div className="auth-form-item">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            icon={ArrowRight}
          >
            Verify & Continue
          </Button>
        </div>
      </form>

      <div className="auth-form-item mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
        <Link
          to="/forgot-password"
          className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Change email address
        </Link>
      </div>
    </AuthCard>
  );
};
