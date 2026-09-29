import React, { useRef } from "react";
import { Loader2 } from "lucide-react";
import { gsap } from "gsap";

export const Button = ({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled = false,
  className = "",
  onClick,
  icon: Icon,
  ...props
}) => {
  const btnRef = useRef(null);

  const baseStyles =
    "relative inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl";

  const variants = {
    primary:
      "bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/25 focus:ring-brand-500 border border-indigo-400/20 active:shadow-md",
    secondary:
      "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-slate-400 border border-slate-200 dark:border-slate-700",
    outline:
      "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 focus:ring-slate-400",
    danger:
      "bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/25 focus:ring-rose-500 border border-rose-400/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2.5 text-sm gap-2",
    lg: "px-6 py-3 text-base gap-2.5",
  };

  const handleMouseDown = () => {
    if (!disabled && !isLoading && btnRef.current) {
      gsap.to(btnRef.current, { scale: 0.97, duration: 0.1 });
    }
  };

  const handleMouseUp = () => {
    if (!disabled && !isLoading && btnRef.current) {
      gsap.to(btnRef.current, { scale: 1, duration: 0.15, ease: "power1.out" });
    }
  };

  return (
    <button
      ref={btnRef}
      type={type}
      disabled={disabled || isLoading}
      onClick={onClick}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};
