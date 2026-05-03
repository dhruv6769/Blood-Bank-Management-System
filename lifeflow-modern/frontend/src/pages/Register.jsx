/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, ArrowRight, ArrowLeft,
  User, Droplet, CalendarDays, Building2, Phone, MapPin,
  CheckCircle2, Droplets, HeartHandshake, ShieldCheck, Sparkles, Activity, Plus
} from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import AvatarFeedback from '../components/AvatarFeedback';
import ProtocolsModal from '../components/ProtocolsModal';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';
import logoImg from '../assets/logo.png';

/* ─── Step config ─────────────────────────────────────────────── */
const TOTAL_STEPS = 3;

/* ─── Reusable Components ─────────────────────────────────────── */

const ROLES = [
  {
    id: 'DONOR',
    label: 'Blood Donor',
    desc: 'Save lives by donating blood and helping patients in need.',
    icon: HeartHandshake,
    color: '#dc143c',
  },
  {
    id: 'ORGANIZATION',
    label: 'Organization',
    desc: 'Host blood camps and coordinate donation drives.',
    icon: Building2,
    color: '#6366f1',
  },
];

const Register = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [step, setStep] = useState(1);
  const [role, setRole] = useState('DONOR');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '',
    bloodGroup: '', age: '', dob: '',
    orgName: '', orgPhone: '', orgAddress: '',
  });
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [isProtocolsOpen, setIsProtocolsOpen] = useState(false);
  const [protocolRole, setProtocolRole] = useState(null);
  const [slideDir, setSlideDir] = useState(1);

  const handleChange = e => {
    const { name, value } = e.target;
    if (name === 'age') { // This is actually our DOB field now
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setFormData(prev => ({ 
        ...prev, 
        age: value, // Store the date string for the input
        calculatedAge: calculatedAge > 0 ? calculatedAge : '' // Store the number for reference if needed
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const goNext = e => {
    e?.preventDefault();
    setSlideDir(1);
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };
  const goBack = () => {
    setSlideDir(-1);
    setStep(s => Math.max(s - 1, 1));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    // Prepare data: use calculatedAge for the 'age' field expected by backend
    const submissionData = { 
      ...formData, 
      role,
      age: formData.calculatedAge || formData.age 
    };
    const success = await register(submissionData);
    if (success) {
      setFeedbackStatus('success');
      setTimeout(() => {
        navigate(role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard');
      }, 1500);
    } else {
      setFeedbackStatus('error');
    }
  };

  const variants = {
    enter: dir => ({ 
      x: dir * 100, 
      opacity: 0, 
      scale: 0.9,
      rotateY: dir * 10,
      filter: 'blur(10px)'
    }),
    center: { 
      x: 0, 
      opacity: 1, 
      scale: 1,
      rotateY: 0,
      filter: 'blur(0px)',
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30
      }
    },
    exit: dir => ({ 
      x: dir * -100, 
      opacity: 0, 
      scale: 1.1,
      rotateY: dir * -10,
      filter: 'blur(10px)',
      transition: {
        duration: 0.4
      }
    }),
  };

  return (
    <div className="min-h-screen relative flex overflow-hidden font-['Outfit','Inter',sans-serif] noise" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <AvatarFeedback status={feedbackStatus} onDismiss={() => setFeedbackStatus('idle')} />
      
      {/* ── Ultra Premium Mesh Backdrop ── */}
      <div className="mesh-gradient absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ 
            x: [0, 50, -100, 0], 
            y: [0, 100, -50, 0],
            scale: [1, 1.3, 0.9, 1],
            rotate: [0, 120, 240, 0]
          }} 
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute w-[1000px] h-[1000px] -top-[400px] -right-[400px] bg-[#dc143c]/20 rounded-full blur-[180px] mix-blend-screen" 
        />
        <motion.div 
          animate={{ 
            x: [0, -50, 100, 0], 
            y: [0, -100, 50, 0],
            scale: [1, 0.9, 1.3, 1],
            rotate: [0, -120, -240, 0]
          }} 
          transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
          className="absolute w-[800px] h-[800px] -bottom-[300px] -left-[300px] bg-indigo-600/20 rounded-full blur-[160px] mix-blend-screen" 
        />
      </div>

      <ProtocolsModal
        isOpen={isProtocolsOpen}
        onClose={() => setIsProtocolsOpen(false)}
        onAgree={() => { 
          setRole(protocolRole); 
          setIsProtocolsOpen(false); 
          setTimeout(() => {
            setSlideDir(1);
            setStep(2);
          }, 300);
        }}
        role={protocolRole}
      />

      {/* ── Left Side: Brand Visuals ── */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="hidden lg:flex flex-[1] relative flex-col justify-center px-16 xl:px-24 z-10"
      >
        <Link to="/" className="absolute top-12 left-16 flex items-center gap-4 no-underline group">
          <div className="w-12 h-12 bg-gradient-to-br from-[#dc143c] to-[#8b0000] rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/30 group-hover:scale-110 transition-transform duration-500 overflow-hidden">
            <img src={logoImg} alt="LifeFlow Logo" className="w-full h-full object-cover scale-[1.6]" />
          </div>
          <span className="text-2xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>
            Life<span className="text-[#dc143c]">Flow.</span>
          </span>
        </Link>

        <div className="max-w-xl">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#dc143c]/10 border border-[#dc143c]/20 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-[#dc143c] mb-8">
              <Sparkles className="w-3 h-3" /> Get Started
            </span>
            <h1 className="text-6xl xl:text-7xl font-black leading-[1.05] tracking-tighter mb-8" style={{ color: 'var(--text-primary)' }}>
              Be the reason <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff6b6b]">someone lives.</span>
            </h1>
            <p className="text-lg xl:text-xl font-medium leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>
              Join India's most sophisticated blood donation infrastructure. 
              Real-time synchronization between donors and critical nodes.
            </p>
          </motion.div>
          
          <div className="mt-16 backdrop-blur-xl p-8 rounded-[2rem] flex items-center gap-6 group hover:border-[#dc143c]/30 transition-all duration-300" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
            <div className="p-4 bg-[#dc143c]/10 rounded-2xl text-[#dc143c]">
              <Activity size={32} />
            </div>
            <div>
              <p className="text-sm font-bold opacity-60 mb-1" style={{ color: 'var(--text-secondary)' }}>Current Active Nodes</p>
              <h3 className="text-3xl font-black tracking-tight" style={{ color: 'var(--text-primary)' }}>50,000+ <span className="text-xs font-black uppercase tracking-widest text-[#dc143c]">Nationwide</span></h3>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Right Side: Form ── */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 flex items-center justify-center p-6 lg:p-12 z-10"
      >
        <div className="w-full max-w-[540px]">
          <div className="glass-premium p-8 lg:p-12 rounded-[3.5rem] relative overflow-hidden group hover:shadow-[0_40px_80px_rgba(220,20,60,0.12)] transition-all duration-700">
            {/* Border Beam Technology */}
            <div className="border-beam opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="mb-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex gap-2">
                    {[1, 2, 3].map((s) => (
                      <div 
                        key={s} 
                        className={`h-1.5 rounded-full transition-all duration-500 ${step >= s ? 'w-8 bg-[#dc143c]' : 'w-2 bg-gray-200 dark:bg-gray-800'}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>Step {step}/3</span>
                </div>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <h2 className="text-4xl font-black tracking-tight mb-3" style={{ color: 'var(--text-primary)' }}>
                      {step === 1 && 'Role Selection'}
                      {step === 2 && (role === 'ORGANIZATION' ? 'Organization Details' : 'Vital Statistics')}
                      {step === 3 && 'Secure Access'}
                    </h2>
                    <p className="text-sm font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>
                      {step === 1 && 'Select your contribution mode to the network.'}
                      {step === 2 && (role === 'ORGANIZATION' ? 'Register your medical or civic institution.' : 'Provide your biological profile for the registry.')}
                      {step === 3 && 'Initialize your unique cryptographic signature.'}
                    </p>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Form Content */}
              <div className="min-h-[400px]">
                <AnimatePresence mode="wait" custom={slideDir}>
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={slideDir}
                      className="space-y-4"
                    >
                      {ROLES.map((r) => {
                        const isSelected = role === r.id;
                        return (
                          <motion.button
                            type="button"
                            key={r.id}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            className={`w-full flex items-center gap-6 p-7 rounded-[2rem] border-2 transition-all duration-500 text-left holographic-card ${isSelected ? 'border-[#dc143c] bg-[#dc143c]/5 shadow-[0_20px_40px_rgba(220,20,60,0.1)]' : 'border-transparent bg-white/5'}`}
                            onClick={() => { setProtocolRole(r.id); setIsProtocolsOpen(true); }}
                          >
                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-700 ${isSelected ? 'bg-[#dc143c] text-white shadow-[0_0_30px_rgba(220,20,60,0.4)]' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>
                              <r.icon size={32} />
                            </div>
                            <div className="flex-1">
                              <h3 className="text-xl font-black tracking-tight mb-1" style={{ color: 'var(--text-primary)' }}>{r.label}</h3>
                              <p className="text-xs font-bold opacity-60 leading-relaxed uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>{r.desc}</p>
                            </div>
                            {isSelected && (
                              <motion.div 
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="w-10 h-10 rounded-full bg-[#dc143c] flex items-center justify-center shadow-lg shadow-red-500/40"
                              >
                                <CheckCircle2 size={20} color="#fff" />
                              </motion.div>
                            )}
                          </motion.button>
                        );
                      })}
                      
                      <div className="pt-12">
                        <motion.button 
                          whileHover={{ y: -8, scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="button" 
                          className="btn-modern w-full h-24 bg-gradient-to-r from-[#dc143c] to-[#9b0023] text-white rounded-[2.5rem] font-black text-xs uppercase tracking-[0.6em] shadow-[0_30px_60px_rgba(220,20,60,0.3)] hover:shadow-[0_45px_90px_rgba(220,20,60,0.45)] flex items-center justify-center gap-6 group transition-all relative overflow-hidden" 
                          onClick={goNext}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                          Continue to Details <ArrowRight size={22} className="group-hover:translate-x-4 transition-transform duration-500" />
                        </motion.button>
                      </div>
                    </motion.div>
                  )}

                   {step === 2 && (
                    <motion.div
                      key="step2"
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={slideDir}
                    >
                      <form onSubmit={goNext} className="space-y-6 tunnel-vision">
                        {role === 'DONOR' ? (
                          <>
                            <ModernInput icon={User} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="First, Last Name" label="Full Identity" required />
                            <ModernInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="mission@lifeflow.com" label="Email Address" required />
                            <div className="grid grid-cols-2 gap-6">
                              <ModernSelect icon={Droplet} name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} label="Blood Type" required options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} />
                                <div className="relative">
                                  <ModernInput icon={CalendarDays} type="date" name="age" value={formData.age} onChange={handleChange} placeholder="Birth Date" label="Birth Date" required />
                                  {formData.calculatedAge && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-30 px-3 py-1 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-full text-[10px] font-bold text-[var(--accent)] pointer-events-none">
                                      {formData.calculatedAge} Years
                                    </div>
                                  )}
                                </div>
                            </div>
                          </>
                        ) : (
                          <>
                            <ModernInput icon={User} type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Authorized Personnel" label="Contact Name" required />
                            <ModernInput icon={Building2} type="text" name="orgName" value={formData.orgName} onChange={handleChange} placeholder="Clinical / Civic Institution" label="Organization Name" required />
                            <ModernInput icon={Mail} type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ops@institution.org" label="Operational Email" required />
                            <div className="grid grid-cols-2 gap-6">
                              <ModernInput icon={Phone} type="tel" name="orgPhone" value={formData.orgPhone} onChange={handleChange} placeholder="+91..." label="Comm Link" />
                              <ModernInput icon={MapPin} type="text" name="orgAddress" value={formData.orgAddress} onChange={handleChange} placeholder="City, State" label="Location" />
                            </div>
                          </>
                        )}
                        <div className="pt-8 flex gap-4">
                          <button type="button" className="h-16 px-8 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3" style={{ border: '1px solid var(--border)', color: 'var(--text-primary)' }} onClick={goBack}>
                            <ArrowLeft size={18} /> Back
                          </button>
                          <button type="submit" className="flex-1 h-16 bg-gradient-to-r from-[#dc143c] to-[#8b0000] text-white rounded-2xl font-black text-sm uppercase tracking-[0.2em] shadow-[0_12px_24px_rgba(220,20,60,0.3)] flex items-center justify-center gap-4 group transition-all">
                             Continue to Security <ArrowRight size={18} className="group-hover:translate-x-1.5 transition-transform" />
                          </button>
                        </div>
                      </form>
                    </motion.div>
                  )}

                  {step === 3 && (
                    <motion.div
                      key="step3"
                      variants={variants}
                      initial="enter"
                      animate="center"
                      exit="exit"
                      custom={slideDir}
                    >
                      <form onSubmit={handleRegister} className="space-y-8 tunnel-vision">
                        <ModernInput 
                          icon={Lock} 
                          type="password" 
                          name="password" 
                          value={formData.password} 
                          onChange={handleChange} 
                          placeholder="Min. 8 Chars" 
                          label="Password" 
                          required 
                          showPasswordToggle
                        />
                        
                        <div className="p-8 glass-premium rounded-[2.5rem] flex items-start gap-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-[#dc143c]/5 blur-3xl rounded-full" />
                          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#dc143c] to-[#8b0000] flex items-center justify-center text-white shadow-xl shadow-red-500/30 shrink-0">
                            <ShieldCheck size={28} />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dc143c] mb-2">Final Review</p>
                            <h4 className="text-xl font-black tracking-tight mb-2" style={{ color: 'var(--text-primary)' }}>{formData.name || 'Participant'}</h4>
                            <p className="text-sm font-bold opacity-60 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                              Registering as <span className="text-[#dc143c] font-black">{role}</span> on the LifeFlow network.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-6 pt-4">
                          <motion.button 
                            whileHover={{ x: -4 }}
                            whileTap={{ scale: 0.98 }}
                            type="button" 
                            className="h-20 px-10 rounded-[2rem] font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 bg-white/5 border border-white/10 hover:bg-white/10" 
                            style={{ color: 'var(--text-primary)' }} 
                            onClick={goBack}
                          >
                            <ArrowLeft size={20} />
                          </motion.button>
                          <motion.button 
                            whileHover={{ y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit" 
                            disabled={isLoading} 
                            className="btn-modern flex-1 h-20 bg-gradient-to-r from-[#dc143c] to-[#9b0023] text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-[0_20px_40px_rgba(220,20,60,0.3)] flex items-center justify-center gap-4 group transition-all"
                          >
                             {isLoading ? <div className="w-8 h-8 border-[4px] border-white/30 border-t-white rounded-full animate-spin" /> : <>Complete Registration <Plus size={20} /></>}
                          </motion.button>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="mt-10 pt-10 text-center" style={{ borderTop: '1px solid var(--border)' }}>
                <p className="text-sm font-bold opacity-60" style={{ color: 'var(--text-secondary)' }}>
                  Already registered? <Link to="/login" className="text-[#dc143c] hover:text-[#ff3355] ml-2 transition-colors no-underline">Sign In →</Link>
                </p>
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

export default Register;
