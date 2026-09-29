import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, KeyRound, ArrowRight, ArrowLeft } from "lucide-react";
import api from "../../api/axios";
import { useToast } from "../../hooks/useToast";
import { AuthCard } from "../../components/auth/AuthCard";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";

export const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const validate = () => {
    if (!email.trim()) {
      setError("Email address is required");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address");
      return false;
    }
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await api.post("/send-otp", {
        email: email.trim().toLowerCase(),
      });
      toast.success(
        response.data?.message || "Verification code sent to your email",
      );

      // Navigate to OTP verification page and pass email
      navigate("/verify-otp", {
        state: {
          email: email.trim().toLowerCase(),
        },
      });
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Failed to send OTP. Please check your email.";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your registered account email to receive a 6-digit verification code (valid for 10 minutes)"
      icon={KeyRound}
      badge="Step 1 of 3"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="email"
          label="Account Email"
          type="email"
          icon={Mail}
          placeholder="name@company.com"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(null);
          }}
          error={error}
          required
          autoComplete="email"
          autoFocus
        />

        <div className="auth-form-item pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            icon={ArrowRight}
          >
            Send Verification Code
          </Button>
        </div>
      </form>

      <div className="auth-form-item mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Sign In
        </Link>
      </div>
    </AuthCard>
  );
};
