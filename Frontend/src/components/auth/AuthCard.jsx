import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const AuthCard = ({ children, title, subtitle, icon: Icon, badge }) => {
  const cardRef = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Staggered card entrance timeline
      tl.fromTo(
        cardRef.current,
        { opacity: 0, y: 35, scale: 0.98 },
        { opacity: 1, y: 0, scale: 1, duration: 0.75 }
      )
        .fromTo(
          '.auth-card-badge',
          { opacity: 0, y: -10 },
          { opacity: 1, y: 0, duration: 0.4 },
          '-=0.45'
        )
        .fromTo(
          '.auth-card-icon',
          { scale: 0.5, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.5, ease: 'back.out(1.7)' },
          '-=0.4'
        )
        .fromTo(
          ['.auth-card-title', '.auth-card-subtitle'],
          { opacity: 0, y: 15 },
          { opacity: 1, y: 0, duration: 0.5, stagger: 0.1 },
          '-=0.35'
        )
        .fromTo(
          '.auth-form-item',
          { opacity: 0, y: 18 },
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.07 },
          '-=0.3'
        );
    }, cardRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={cardRef}
      className="relative z-10 w-full max-w-md p-8 sm:p-10 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-indigo-500/5 transition-colors duration-200"
    >
      {/* Header section */}
      <div className="text-center mb-8">
        {badge && (
          <div className="auth-card-badge inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-800/60 mb-4 shadow-sm">
            {badge}
          </div>
        )}

        {Icon && (
          <div className="auth-card-icon inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white shadow-lg shadow-brand-500/25 mb-5 ring-4 ring-indigo-50 dark:ring-indigo-950/50">
            <Icon className="w-7 h-7" />
          </div>
        )}

        {title && (
          <h1 className="auth-card-title text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white mb-2">
            {title}
          </h1>
        )}

        {subtitle && (
          <p className="auth-card-subtitle text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Main body / form */}
      <div>{children}</div>
    </div>
  );
};
