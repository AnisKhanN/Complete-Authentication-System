import React, { useState, useRef, useEffect } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { gsap } from 'gsap';

export const Input = ({
  label,
  id,
  type = 'text',
  error,
  icon: Icon,
  placeholder,
  value,
  onChange,
  disabled,
  required,
  className = '',
  helperText,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const errorRef = useRef(null);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  useEffect(() => {
    if (error && errorRef.current) {
      gsap.fromTo(
        errorRef.current,
        { opacity: 0, y: -6 },
        { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }
      );
    }
  }, [error]);

  return (
    <div className={`auth-form-item flex flex-col gap-1.5 w-full ${className}`}>
      {label && (
        <div className="flex justify-between items-center text-xs font-semibold tracking-wide text-slate-700 dark:text-slate-300">
          <label htmlFor={id} className="cursor-pointer">
            {label} {required && <span className="text-rose-500">*</span>}
          </label>
        </div>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          id={id}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className={`w-full py-2.5 rounded-xl text-sm transition-all duration-200 bg-white/60 dark:bg-slate-900/60 backdrop-blur-sm border outline-none
            ${Icon ? 'pl-10' : 'pl-3.5'}
            ${isPassword ? 'pr-11' : 'pr-3.5'}
            ${
              error
                ? 'border-rose-500 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 text-rose-900 dark:text-rose-200'
                : 'border-slate-300 dark:border-slate-700/80 focus:border-brand-500 dark:focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-slate-900 dark:text-white'
            }
            disabled:bg-slate-100 dark:disabled:bg-slate-800/60 disabled:cursor-not-allowed placeholder:text-slate-400 dark:placeholder:text-slate-500`}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>

      {helperText && !error && (
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{helperText}</p>
      )}

      {error && (
        <div ref={errorRef} className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 mt-1">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
