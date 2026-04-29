/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Droplets, Heart, ShieldCheck, Users, Zap, CheckCircle2 } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import AvatarFeedback from '../components/AvatarFeedback';

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

const InputField = ({ icon: Icon, type, value, onChange, placeholder, label, extra }) => {
  const [focused, setFocused] = useState(false);
  const isPassword = type === 'password' || type === 'text-password';
  const [showPw, setShowPw] = useState(false);
  const inputType = isPassword ? (showPw ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className="flex items-center justify-between px-1">
          <label className="text-[10px] font-black uppercase tracking-[0.2em] text-var(--text-muted)">{label}</label>
          {extra}
        </div>
      )}
      <div className={`relative flex items-center rounded-2xl border-[1.5px] transition-all duration-300 group ${focused ? 'border-[#dc143c] shadow-[0_0_0_4px_rgba(220,20,60,0.1)]' : ''}`} style={{ background: focused ? 'var(--bg-primary)' : 'var(--bg-card)', borderColor: focused ? '#dc143c' : 'var(--border)' }}>
        <div className={`flex w-14 items-center justify-center transition-colors duration-300 ${focused ? 'text-[#dc143c]' : ''}`} style={{ color: focused ? '#dc143c' : 'var(--text-muted)' }}>
          <Icon size={18} strokeWidth={focused ? 2.5 : 2} />
        </div>
        <input
          className="flex-1 bg-transparent py-4 text-sm font-bold outline-none" style={{ color: 'var(--text-primary)' }}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />
        {isPassword && (
          <button
            type="button"
            className="flex w-14 items-center justify-center hover:text-[#dc143c] transition-colors" style={{ color: 'var(--text-muted)' }}
            onClick={() => setShowPw(p => !p)}
            tabIndex={-1}
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

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
      }, 2000);
    } else {
      setFeedbackStatus('error');
    }
  };

  return (
    <div className="min-h-screen relative flex overflow-hidden font-['Inter','Outfit',sans-serif]" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AvatarFeedback status={feedbackStatus} onDismiss={() => setFeedbackStatus('idle')} />
      
      {/* ── Background Effects ── */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#dc143c]/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]"></div>
        {BLOOD_DROPS.map((drop, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[80px]"
            style={{
              left: drop.x,
              top: drop.y,
              width: drop.size,
              height: drop.size,
              backgroundColor: i % 2 === 0 ? 'rgba(220, 20, 60, 0.15)' : 'rgba(99, 102, 241, 0.1)',
            }}
            animate={{
              y: [0, -30, 0],
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: drop.duration,
              repeat: Infinity,
              delay: drop.delay,
              ease: "easeInOut"
            }}
          />
        ))}
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
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10"
      >
        <div className="w-full max-w-[480px]">
          <div className="backdrop-blur-[32px] p-8 lg:p-12 rounded-[2.5rem] shadow-2xl relative overflow-hidden group hover:shadow-[0_30px_60px_rgba(220,20,60,0.08)] transition-shadow duration-700" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            {/* Subtle gloss effect */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#dc143c]/5 blur-[60px] rounded-full group-hover:bg-[#dc143c]/10 transition-colors duration-700"></div>
            
            <div className="relative z-10">
              <div className="mb-10">
                <div className="lg:hidden flex items-center gap-3 mb-8">
                   <div className="w-10 h-10 bg-gradient-to-br from-[#dc143c] to-[#8b0000] rounded-xl flex items-center justify-center shadow-lg shadow-red-500/30">
                    <Droplets size={20} color="#fff" />
                  </div>
                  <span className="text-xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                    LifeFlow<span className="text-[#dc143c]">.</span>
                  </span>
                </div>
                <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>Welcome Back</h2>
                <p className="text-sm font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>Continue your life-saving mission today.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <InputField
                  icon={Mail}
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  label="Mission Email"
                  placeholder="name@nexus.com"
                />
                
                <InputField
                  icon={Lock}
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  label="Access Key"
                  placeholder="••••••••"
                  extra={<Link to="/forgot-password" size={14} className="text-[10px] font-black uppercase tracking-widest text-[#dc143c] hover:text-[#ff3355] transition-colors">Forgot?</Link>}
                />

                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={isLoading}
                    type="submit"
                    className="w-full h-16 bg-gradient-to-r from-[#dc143c] to-[#9b0023] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_12px_24px_rgba(220,20,60,0.3)] flex items-center justify-center gap-4 group transition-all"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-[3px] border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>
                        Initiate Access
                        <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                      </>
                    )}
                  </motion.button>
                </div>
              </form>

              <div className="mt-10 pt-10 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-sm font-bold opacity-60 mb-6" style={{ color: 'var(--text-secondary)' }}>First time on the network?</p>
                <Link 
                  to="/register" 
                  className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-[#dc143c]/40 transition-all no-underline" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                >
                  Create New Profile <Plus size={16} className="text-[#dc143c]" />
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
