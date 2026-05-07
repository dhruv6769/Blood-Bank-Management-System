import React, { useEffect, useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ShieldCheck, ShieldAlert, Zap, Globe, Cpu } from 'lucide-react';

/** 
 * LifeFlow "LifeBot" High-Fidelity Mascot
 */
const LifeBotLogo = ({ status }) => {
  const isSuccess = status === 'success';
  const isError = status === 'error';

  return (
    <div className="relative w-64 h-64 flex items-center justify-center">
      {/* Dynamic Aura Glow */}
      <Motion.div
        animate={{
          scale: isSuccess ? [1, 1.2, 1.1] : isError ? [1, 1.05, 1] : [1, 1.1, 1],
          opacity: isSuccess ? [0.3, 0.6, 0.4] : 0.2
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`absolute inset-0 rounded-full blur-[80px] ${
          isSuccess ? 'bg-sky-400' : isError ? 'bg-red-500' : 'bg-slate-400'
        }`}
      />

      <svg viewBox="0 0 200 200" className="w-full h-full relative z-10 drop-shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#e2e8f0" />
          </linearGradient>
          <radialGradient id="visorGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#000000" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* FLOATING BODY */}
        <Motion.g
          animate={
            isSuccess ? { 
                y: [0, -15, 0],
                rotateY: [0, 10, -10, 0]
            } : 
            isError ? {
                x: [-2, 2, -2, 2, 0],
                rotate: [-1, 1, -1, 1, 0]
            } :
            { y: [0, -10, 0] }
          }
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          {/* Main Chassis */}
          <circle cx="100" cy="100" r="75" fill="url(#bodyGrad)" stroke="#cbd5e1" strokeWidth="1" />
          <circle cx="100" cy="100" r="70" fill="none" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="4 4" />
          
          {/* VISOR AREA */}
          <rect x="40" y="60" width="120" height="70" rx="35" fill="url(#visorGrad)" stroke={isSuccess ? "#38bdf8" : isError ? "#ef4444" : "#475569"} strokeWidth="2" filter="url(#glow)" />

          {/* DIGITAL EYES */}
          <g transform="translate(100, 95)">
             <AnimatePresence mode="wait">
                {isSuccess ? (
                  <Motion.g key="success" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <path d="M -30 5 L -20 -5 L -10 5" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
                    <path d="M 10 5 L 20 -5 L 30 5" fill="none" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
                  </Motion.g>
                ) : isError ? (
                  <Motion.g key="error" initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                    <path d="M -25 -5 L -10 10 M -25 10 L -10 -5" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
                    <path d="M 10 -5 L 25 10 M 10 10 L 25 -5" fill="none" stroke="#ef4444" strokeWidth="6" strokeLinecap="round" filter="url(#glow)" />
                  </Motion.g>
                ) : (
                  <Motion.g key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <Motion.rect x="-30" y="0" width="20" height="6" rx="3" fill="#38bdf8" animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1] }} />
                    <Motion.rect x="10" y="0" width="20" height="6" rx="3" fill="#38bdf8" animate={{ scaleY: [1, 0.1, 1] }} transition={{ duration: 4, repeat: Infinity, times: [0, 0.05, 0.1], delay: 0.2 }} />
                  </Motion.g>
                )}
             </AnimatePresence>
          </g>

          {/* Core Reactant */}
          <Motion.circle
            cx="100" cy="155" r="8"
            fill={isSuccess ? "#38bdf8" : isError ? "#ef4444" : "#94a3b8"}
            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            filter="url(#glow)"
          />
        </Motion.g>
      </svg>

      {/* Orbiting Particles */}
      {isSuccess && (
        <div className="absolute inset-0">
          {[...Array(3)].map((_, i) => (
            <Motion.div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-sky-400"
              animate={{
                rotate: 360,
                scale: [1, 1.5, 1]
              }}
              transition={{
                rotate: { duration: 3, repeat: Infinity, ease: "linear", delay: i * 1 },
                scale: { duration: 1.5, repeat: Infinity }
              }}
              style={{
                top: '50%',
                left: '50%',
                marginTop: '-4px',
                marginLeft: '-4px',
                transformOrigin: `${120 + i * 20}px 0`
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AvatarFeedback = ({ status = 'idle', onDismiss }) => {
  const [warpActive, setWarpActive] = useState(false);

  useEffect(() => {
    if (status === 'success') {
      const warpTimer = setTimeout(() => setWarpActive(true), 2500);
      const dismissTimer = setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 3500);
      return () => {
        clearTimeout(warpTimer);
        clearTimeout(dismissTimer);
      };
    } else if (status === 'error') {
      const timer = setTimeout(() => {
        if (onDismiss) onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, onDismiss]);

  const show = status !== 'idle';
  const isSuccess = status === 'success';

  return (
    <AnimatePresence>
      {show && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center pointer-events-none"
        >
          {/* Cinematic Background */}
          <Motion.div 
            className="absolute inset-0 z-0"
            animate={{ 
              backgroundColor: warpActive ? '#fff' : 'rgba(2, 6, 23, 0.95)',
              backdropFilter: warpActive ? 'blur(0px)' : 'blur(40px)',
              x: warpActive ? [-2, 2, -2, 2, 0] : 0,
              y: warpActive ? [-2, 2, -2, 2, 0] : 0
            }}
            transition={{ 
              backgroundColor: { duration: 0.8, ease: "circIn" },
              backdropFilter: { duration: 0.8, ease: "circIn" },
              x: { duration: 0.1, repeat: Infinity },
              y: { duration: 0.1, repeat: Infinity }
            }}
          />

          {/* Warp Speed Effect */}
          <AnimatePresence>
            {warpActive && (
              <Motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 z-10 overflow-hidden"
              >
                {[...Array(50)].map((_, i) => (
                  <Motion.div
                    key={i}
                    className="absolute bg-white"
                    initial={{ 
                      top: '50%', 
                      left: '50%', 
                      width: 2, 
                      height: 2, 
                      opacity: 0 
                    }}
                    animate={{ 
                      top: `${Math.random() * 100}%`, 
                      left: `${Math.random() * 100}%`,
                      width: [2, 100],
                      height: [2, 4],
                      opacity: [0, 1, 0],
                      scale: [1, 5]
                    }}
                    transition={{ 
                      duration: 0.6, 
                      delay: Math.random() * 0.5,
                      ease: "circIn"
                    }}
                  />
                ))}
              </Motion.div>
            )}
          </AnimatePresence>

          {/* Digital Grid Backdrop */}
          {!warpActive && (
            <div className="absolute inset-0 pointer-events-none opacity-[0.1]"
              style={{ 
                backgroundImage: 'linear-gradient(rgba(56, 189, 248, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(56, 189, 248, 0.1) 1px, transparent 1px)', 
                backgroundSize: '100px 100px' 
              }}
            />
          )}

          <Motion.div
            initial={{ scale: 0.8, opacity: 0, y: 50 }}
            animate={{ 
              scale: warpActive ? 2 : 1, 
              opacity: warpActive ? 0 : 1, 
              y: 0 
            }}
            exit={{ scale: 1.2, opacity: 0 }}
            transition={{ duration: warpActive ? 0.8 : 0.5, ease: "backOut" }}
            className="flex flex-col items-center gap-8 relative z-20"
          >
            {/* The LifeBot Mascot */}
            <LifeBotLogo status={status} />

            {/* Premium Result Card */}
            <Motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
              className="relative p-1 rounded-[4rem] overflow-hidden group shadow-2xl"
              style={{
                background: isSuccess 
                  ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.5), rgba(99, 102, 241, 0.5))'
                  : 'linear-gradient(135deg, rgba(239, 68, 68, 0.5), rgba(127, 29, 29, 0.5))',
                minWidth: '500px'
              }}
            >
              <div className="bg-[var(--bg-card)] rounded-[3.8rem] p-10 flex flex-col items-center relative overflow-hidden">
                {/* Holographic Scanline */}
                <Motion.div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-400/10 to-transparent pointer-events-none"
                  animate={{ y: ['-100%', '100%'] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                />

                {/* Status Icon */}
                <Motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.6, type: "spring" }}
                  className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 shadow-lg ${
                    isSuccess ? 'bg-sky-400/10 text-sky-400 shadow-sky-500/20' : 'bg-red-500/10 text-red-500 shadow-red-500/20'
                  }`}
                >
                  {isSuccess ? <ShieldCheck size={32} /> : <ShieldAlert size={32} />}
                </Motion.div>

                <div className="text-center space-y-4">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <Zap className={isSuccess ? 'text-sky-400 animate-pulse' : 'text-red-500'} size={14} />
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] opacity-60">
                      {isSuccess ? 'Neural Interface Sync' : 'Access Authorization Failed'}
                    </span>
                  </div>
                  
                  <h2 className="text-4xl font-black tracking-tight brand-font text-[var(--text-primary)]">
                    {isSuccess ? 'Authorized' : 'Restricted'}
                  </h2>
                  
                  <p className="text-lg font-bold opacity-70 max-w-[360px] mx-auto leading-relaxed">
                    {isSuccess 
                      ? 'Establishing secure link to the LifeFlow network. Synchronizing biological data points...' 
                      : 'The provided credentials do not match any authorized nodes in our database.'}
                  </p>
                </div>



                {/* Processing Bar */}
                {isSuccess && (
                  <div className="absolute bottom-0 left-0 right-0 h-2 bg-slate-900">
                    <Motion.div 
                      initial={{ x: '-100%' }}
                      animate={{ x: '0%' }}
                      transition={{ duration: 2.5, ease: "linear" }}
                      className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 shadow-[0_0_20px_rgba(56,189,248,0.5)]"
                    />
                  </div>
                )}
              </div>
            </Motion.div>

            {/* Bottom Slogan */}
            {!warpActive && (
              <Motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.4 }}
                transition={{ delay: 1 }}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-white"
              >
                LifeFlow Global Operations // 2026
              </Motion.p>
            )}
          </Motion.div>
        </Motion.div>
      )}
    </AnimatePresence>
  );
};

export default AvatarFeedback;
