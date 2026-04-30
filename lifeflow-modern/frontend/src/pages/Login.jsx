/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Droplets, Heart, ShieldCheck, Users, Zap, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import AvatarFeedback from '../components/AvatarFeedback';
import NexusInput from '../components/NexusInput';

const BLOOD_DROPS = [
  { x: '10%', y: '15%', size: 40, delay: 0, duration: 15 },
  { x: '85%', y: '10%', size: 60, delay: 2, duration: 20 },
  { x: '15%', y: '75%', size: 30, delay: 1, duration: 18 },
  { x: '75%', y: '80%', size: 50, delay: 3, duration: 25 },
];

const LEFT_FEATURES = [
  { icon: Heart, text: 'Save lives with every donation', color: '#ff3355' },
  { icon: Users, text: '50,000+ active donors nationwide', color: '#6366f1' },
  { icon: ShieldCheck, text: 'Verified & secure platform', color: '#10b981' },
  { icon: Zap, text: 'Real-time emergency matching', color: '#f59e0b' },
];


const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const { login, isLoading } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      setFeedbackStatus('success');
      setTimeout(() => {
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        if (storedUser?.role === 'ADMIN') navigate('/admin-dashboard');
        else if (storedUser?.role === 'ORGANIZATION') navigate('/org-dashboard');
        else navigate('/dashboard');
      }, 1500);
    } else {
      setFeedbackStatus('error');
    }
  };

  return (
    <div className="min-h-screen relative flex overflow-hidden font-['Outfit','Inter',sans-serif] noise" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AvatarFeedback status={feedbackStatus} onDismiss={() => setFeedbackStatus('idle')} />
      
      {/* ── Ultra Premium Mesh Backdrop ── */}
      <div className="mesh-gradient absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 100, -50, 0], 
            y: [0, -50, 50, 0],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 90, 180, 0]
          }} 
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute w-[1000px] h-[1000px] -top-[400px] -left-[400px] bg-[#dc143c]/20 rounded-full blur-[160px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            x: [0, -100, 50, 0], 
            y: [0, 100, -50, 0],
            scale: [1, 0.8, 1.2, 1],
            rotate: [0, -90, -180, 0]
          }} 
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] -bottom-[200px] -right-[200px] bg-indigo-600/20 rounded-full blur-[140px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.4, 1],
            opacity: [0.1, 0.2, 0.1]
          }} 
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          className="absolute w-[1200px] h-[1200px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-rose-500/10 rounded-full blur-[200px] mix-blend-screen" 
        />
      </div>

      {/* ── Left Side: Brand Visuals ── */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-[1.2] relative flex-col justify-center px-16 xl:px-24 z-10"
      >
        <Link to="/" className="absolute top-12 left-16 flex items-center gap-4 no-underline group z-30">
          <div className="w-12 h-12 bg-gradient-to-br from-[#dc143c] to-[#8b0000] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-500">
            <Droplets size={24} color="#fff" />
          </div>
          <span className="text-2xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
            Life<span className="text-[#dc143c]">Flow.</span>
          </span>
        </Link>

        <div className="max-w-xl relative z-30">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc143c]/10 border border-[#dc143c]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#dc143c] mb-8">
              <Activity className="w-3 h-3" /> Advanced Clinical Network
            </span>
            <h1 className="text-6xl xl:text-7xl font-black leading-[1.05] tracking-tighter mb-8" style={{ color: 'var(--text-primary)' }}>
              Empowering the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b6b]">Future of Giving.</span>
            </h1>
            <p className="text-lg xl:text-xl font-medium leading-relaxed mb-12 opacity-80" style={{ color: 'var(--text-secondary)' }}>
              Join India's most sophisticated blood donation infrastructure. 
              Real-time synchronization between donors and critical care nodes.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 gap-6">
            {LEFT_FEATURES.map((f, i) => (
              <motion.div
                key={i}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
                className="p-6 backdrop-blur-xl rounded-3xl flex flex-col gap-4 group hover:border-[#dc143c]/30 transition-all duration-300 hover:shadow-[0_8px_24px_rgba(220,20,60,0.1)]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center`} style={{ backgroundColor: `${f.color}15`, color: f.color }}>
                  <f.icon size={20} />
                </div>
                <p className="text-xs font-black uppercase tracking-wider leading-relaxed" style={{ color: 'var(--text-primary)' }}>{f.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
 
      {/* ── Right Side: Auth Form ── */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10"
      >
        <div className="w-full max-w-[480px]">
          <div className="glass-premium p-8 lg:p-12 rounded-[3rem] relative overflow-hidden group hover:shadow-[0_40px_80px_rgba(220,20,60,0.12)] transition-all duration-700">
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              <div className="mb-10">
                <div className="lg:hidden flex items-center gap-3 mb-8">
                   <div className="w-12 h-12 bg-gradient-to-br from-[#dc143c] to-[#8b0000] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30">
                    <Droplets size={24} color="#fff" />
                  </div>
                  <span className="text-2xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                    LifeFlow<span className="text-[#dc143c]">.</span>
                  </span>
                </div>
                <h2 className="text-5xl font-black tracking-tight mb-4 text-glow" style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
                <p className="text-base font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>Continue your life-saving mission today.</p>
              </div>
 
              <form onSubmit={handleLogin} className="space-y-10">
                <NexusInput
                  icon={Mail}
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  label="Mission Email"
                  placeholder="name@nexus.com"
                />
                
                <div className="relative">
                  <div className="absolute right-2 -top-7 z-10">
                    <Link to="/forgot-password" size={14} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#dc143c] hover:text-[#ff3355] transition-all">Forgot Key?</Link>
                  </div>
                  <NexusInput
                    icon={Lock}
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    label="Access Key"
                    placeholder="••••••••"
                    showPasswordToggle
                  />
                </div>

                <div className="pt-6">
                  <motion.button
                    whileHover={{ y: -8, scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    type="submit"
                    className="btn-nexus w-full h-24 bg-gradient-to-r from-[#dc143c] to-[#9b0023] text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-[0_30px_60px_rgba(220,20,60,0.3)] hover:shadow-[0_45px_90px_rgba(220,20,60,0.45)] flex items-center justify-center gap-6 group transition-all relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    {isLoading ? (
                      <div className="w-8 h-8 border-[4px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Initiate Access
                        <ArrowRight size={22} className="group-hover:translate-x-3 transition-transform duration-500" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
 
              <div className="mt-12 pt-12 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-xs font-bold opacity-40 mb-8" style={{ color: 'var(--text-secondary)' }}>First time on the life-saving network?</p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-4 px-10 py-5 rounded-[2rem] text-[10px] font-black uppercase tracking-widest hover:border-[#dc143c]/40 hover:-translate-y-2 transition-all no-underline shadow-2xl" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  Register New Node <Plus size={18} className="text-[#dc143c]" />
                </Link>
              </div>
            </div>
          </div>
          
          <div className="mt-8 flex justify-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40" style={{ color: 'var(--text-muted)' }}>
              © 2026 LifeFlow Global Operations
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

// Internal icons needed
const Activity = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);
const Plus = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);

export default Login;
