import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Lock, CheckCircle2, ArrowRight } from 'lucide-react';
import { gsap } from 'gsap';
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import { AuthCard } from '../../components/auth/AuthCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { evaluatePasswordStrength } from '../../utils/formatters';

export const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();

  const email = location.state?.email || '';
  const otp = location.state?.otp || '';

  const [formData, setFormData] = useState({ newPassword: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const successRef = useRef(null);
  const strength = evaluatePasswordStrength(formData.newPassword);

  useEffect(() => {
    if (!email || !otp) {
      toast.warning('Session invalid. Please start the password reset flow again.');
      navigate('/forgot-password', { replace: true });
    }
  }, [email, otp, navigate, toast]);

  useEffect(() => {
    if (isSuccess && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' }
      );
    }
  }, [isSuccess]);

  const validate = () => {
    const errs = {};
    if (!formData.newPassword) {
      errs.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your new password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await api.post('/reset-password', {
        email,
        otp,
        newPassword: formData.newPassword,
      });

      toast.success(response.data?.message || 'Password reset successfully!');
      setIsSuccess(true);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setErrors({ newPassword: msg });
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div
        ref={successRef}
        className="w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl text-center z-10"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 border border-emerald-200 dark:border-emerald-800 mb-5 shadow-lg shadow-emerald-500/10">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Password Updated!
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">
          Your password has been changed successfully. All active sessions have been safely terminated for your security.
        </p>

        <Button
          variant="primary"
          className="w-full"
          onClick={() => navigate('/login', { replace: true })}
          icon={ArrowRight}
        >
          Sign In with New Password
        </Button>
      </div>
    );
  }

  return (
    <AuthCard
      title="Create New Password"
      subtitle="Choose a strong, unique password for your account (minimum 8 characters)"
      icon={Lock}
      badge="Step 3 of 3"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <Input
            id="newPassword"
            label="New Password"
            type="password"
            icon={Lock}
            placeholder="Minimum 8 characters"
            value={formData.newPassword}
            onChange={(e) => {
              setFormData({ ...formData, newPassword: e.target.value });
              if (errors.newPassword) setErrors({ ...errors, newPassword: null });
            }}
            error={errors.newPassword}
            required
            autoComplete="new-password"
            autoFocus
          />

          {formData.newPassword && (
            <div className="mt-2 space-y-1">
              <div className="flex justify-between items-center text-[11px] text-slate-500 dark:text-slate-400">
                <span>Strength:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {strength.label}
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex gap-1">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-full flex-1 transition-colors duration-300 ${
                      step <= strength.score ? strength.color : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Input
          id="confirmPassword"
          label="Confirm New Password"
          type="password"
          icon={Lock}
          placeholder="Repeat your new password"
          value={formData.confirmPassword}
          onChange={(e) => {
            setFormData({ ...formData, confirmPassword: e.target.value });
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: null });
          }}
          error={errors.confirmPassword}
          required
          autoComplete="new-password"
        />

        <div className="auth-form-item pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            icon={ArrowRight}
          >
            Reset Password
          </Button>
        </div>
      </form>

      <div className="auth-form-item mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs">
        <Link
          to="/login"
          className="font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
        >
          Cancel & Return to Login
        </Link>
      </div>
    </AuthCard>
  );
};
