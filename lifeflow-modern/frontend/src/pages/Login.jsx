/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { HeartPulse, ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import AvatarFeedback from '../components/AvatarFeedback';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('idle');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();

  const handleLogin = async (e) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
        setFeedbackStatus('success');
        setTimeout(() => {
            const storedUser = JSON.parse(sessionStorage.getItem('user'));
            if (storedUser?.role === 'ADMIN') {
                navigate('/admin-dashboard');
            } else if (storedUser?.role === 'ORGANIZATION') {
                navigate('/org-dashboard');
            } else {
                navigate('/dashboard');
            }
        }, 2200);
    } else {
        setFeedbackStatus('error');
    }
  };

  return (
    <div className="flex-grow flex items-center justify-center min-h-[calc(100vh-80px)] relative overflow-hidden bg-black font-sans">
      <AvatarFeedback status={feedbackStatus} onDismiss={() => setFeedbackStatus('idle')} />
      
      {/* Cinematic Continuous Background */}
      <div className="absolute inset-0 z-0 h-full w-full overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90 z-10"></div>
        <Motion.img 
          initial={{ scale: 1 }}
          animate={{ scale: 1.15, rotate: 1 }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
          src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=2560" 
          alt="Medical abstract"
          className="w-full h-full object-cover origin-center opacity-70"
        />
      </div>

       <div className="container mx-auto px-6 relative z-10 flex justify-center py-20 w-full">
          <Motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-lg"
          >
              <div className="bg-white/10 backdrop-blur-2xl p-10 md:p-12 rounded-[2.5rem] shadow-2xl border border-white/20 relative overflow-hidden group">
                  {/* Subtle orb inside the glass */}
                  <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/20 rounded-full blur-[80px] pointer-events-none z-0 group-hover:bg-red-500/30 transition-colors duration-700"></div>
                  <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none z-0 group-hover:bg-blue-500/30 transition-colors duration-700"></div>
                  
                  <div className="relative z-10 text-center mb-12">
                      <Motion.div 
                        whileHover={{ scale: 1.05 }}
                        className="w-20 h-20 bg-white/5 backdrop-blur-md rounded-[2rem] flex items-center justify-center mx-auto mb-8 shadow-inner border border-white/10"
                      >
                          <HeartPulse className="text-red-400 w-10 h-10" />
                      </Motion.div>
                      <h2 className="text-4xl font-black text-white brand-font mb-3 tracking-tight">Welcome Back</h2>
                      <p className="text-white/60 text-sm font-medium">Login to continue saving lives.</p>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                      <div className="space-y-2 group/input">
                          <label className="block text-xs font-bold text-white/50 uppercase tracking-wider mb-1 ml-2">Email Address</label>
                          <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input 
                                type="email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" 
                                placeholder="hero@lifeflow.com" 
                            />
                          </div>
                      </div>

                      <div className="space-y-2 group/input">
                           <div className="flex justify-between items-center ml-2 mb-1">
                                <label className="block text-xs font-bold text-white/50 uppercase tracking-wider">Password</label>
                                <a href="#" className="text-xs text-red-500 hover:text-red-400 transition-colors text-right font-bold">Forgot Password?</a>
                           </div>
                           <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-red-400 transition-colors">
                                <Lock className="w-5 h-5" />
                            </div>
                            <input 
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-white/5 border border-white/10 text-white placeholder-white/20 rounded-2xl pl-12 pr-12 py-4 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 transition-all font-medium backdrop-blur-sm shadow-inner" 
                                placeholder="••••••••" 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors p-1.5 z-10"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                          </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-red-600 hover:bg-red-500 text-white font-bold py-4 rounded-2xl transition-all shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_30px_rgba(220,38,38,0.5)] hover:-translate-y-1 active:translate-y-0 flex items-center justify-center gap-3 group/btn disabled:opacity-70 disabled:cursor-not-allowed mt-8 text-base"
                      >
                          {isLoading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          ) : (
                              <>
                                Sign In <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                              </>
                          )}
                      </button>
                  </form>
                  
                  <div className="mt-8 text-center relative z-10 pt-6 border-t border-white/10">
                      <p className="text-white/60 text-sm font-medium">
                          Don't have an account? <Link to="/register" className="text-red-400 font-bold hover:text-white transition-colors ml-1">Register now</Link>
                      </p>
                  </div>
              </div>
          </Motion.div>
       </div>
    </div>
  );
};

export default Login;
