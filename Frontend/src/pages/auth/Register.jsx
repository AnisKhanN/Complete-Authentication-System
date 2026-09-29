import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthCard } from '../../components/auth/AuthCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { evaluatePasswordStrength } from '../../utils/formatters';

export const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const strength = evaluatePasswordStrength(formData.password);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) {
      errs.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    setErrors({});

    const result = await register(
      formData.name.trim(),
      formData.email.trim(),
      formData.password
    );
    setIsLoading(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <AuthCard
      title="Create an Account"
      subtitle="Join AuthShield to experience seamless, multi-device security"
      icon={UserPlus}
      badge="Free Registration"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <Input
          id="name"
          label="Full Name"
          type="text"
          icon={User}
          placeholder="John Doe"
          value={formData.name}
          onChange={(e) => {
            setFormData({ ...formData, name: e.target.value });
            if (errors.name) setErrors({ ...errors, name: null });
          }}
          error={errors.name}
          required
          autoComplete="name"
          autoFocus
        />

        <Input
          id="email"
          label="Email Address"
          type="email"
          icon={Mail}
          placeholder="name@company.com"
          value={formData.email}
          onChange={(e) => {
            setFormData({ ...formData, email: e.target.value });
            if (errors.email) setErrors({ ...errors, email: null });
          }}
          error={errors.email}
          required
          autoComplete="email"
        />

        <div>
          <Input
            id="password"
            label="Password"
            type="password"
            icon={Lock}
            placeholder="Minimum 8 characters"
            value={formData.password}
            onChange={(e) => {
              setFormData({ ...formData, password: e.target.value });
              if (errors.password) setErrors({ ...errors, password: null });
            }}
            error={errors.password}
            required
            autoComplete="new-password"
          />

          {/* Password Strength Meter */}
          {formData.password && (
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

        <div className="auth-form-item pt-2">
          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isLoading}
            icon={ArrowRight}
          >
            Create Account
          </Button>
        </div>
      </form>

      <div className="auth-form-item mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
        Already have an account?{' '}
        <Link
          to="/login"
          className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 hover:underline transition-colors ml-1"
        >
          Sign in
        </Link>
      </div>
    </AuthCard>
  );
};
