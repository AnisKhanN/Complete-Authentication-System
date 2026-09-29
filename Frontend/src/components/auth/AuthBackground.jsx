import React, { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export const AuthBackground = () => {
  const containerRef = useRef(null);
  const orb1Ref = useRef(null);
  const orb2Ref = useRef(null);
  const orb3Ref = useRef(null);

  useEffect(() => {
    // Isolate GSAP animations within context for clean React lifecycle cleanup
    const ctx = gsap.context(() => {
      // Gentle floating animation for primary gradient orb
      gsap.to(orb1Ref.current, {
        x: '+=40',
        y: '-=35',
        rotation: 30,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Secondary cyan ambient orb
      gsap.to(orb2Ref.current, {
        x: '-=50',
        y: '+=40',
        rotation: -25,
        duration: 11,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 0.8,
      });

      // Third subtle accent orb
      gsap.to(orb3Ref.current, {
        x: '+=35',
        y: '+=30',
        scale: 1.15,
        duration: 13,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: 1.5,
      });
    }, containerRef);

    return () => ctx.revert(); // Prevent memory leaks
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none overflow-hidden select-none z-0"
      aria-hidden="true"
    >
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-60 dark:opacity-40" />

      {/* Radial fade to soften grid at borders */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-50/50 to-slate-100/90 dark:via-[#0B0F19]/60 dark:to-[#0B0F19]" />

      {/* Floating Gradient Orbs */}
      <div
        ref={orb1Ref}
        className="absolute -top-24 left-1/4 w-[480px] h-[480px] rounded-full bg-gradient-to-tr from-indigo-500/20 via-purple-500/15 to-transparent blur-3xl dark:from-indigo-600/25 dark:via-purple-600/15"
      />

      <div
        ref={orb2Ref}
        className="absolute top-1/3 -right-20 w-[520px] h-[520px] rounded-full bg-gradient-to-bl from-cyan-400/20 via-blue-500/15 to-transparent blur-3xl dark:from-cyan-500/20 dark:via-blue-600/15"
      />

      <div
        ref={orb3Ref}
        className="absolute -bottom-24 left-1/3 w-[550px] h-[550px] rounded-full bg-gradient-to-tr from-brand-600/15 via-teal-500/10 to-transparent blur-3xl dark:from-indigo-700/20 dark:via-teal-600/10"
      />
    </div>
  );
};
