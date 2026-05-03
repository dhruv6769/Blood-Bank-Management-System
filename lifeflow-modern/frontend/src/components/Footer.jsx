/* eslint-disable no-unused-vars */
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Droplet, MapPin, Phone, ShieldCheck, Instagram, Facebook, Twitter } from 'lucide-react';
import { useThemeStore } from '../context/themeStore';
import { useAuthStore } from '../context/authStore';
import AnimatedAvatar from './AnimatedAvatar';
import logoImg from '../assets/logo.png';

const SOCIAL = [
    { label: 'Instagram', href: 'https://www.instagram.com/lifeflowdonation', icon: Instagram, brandColor: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)' },
    { label: 'Facebook', href: 'https://www.facebook.com/profile.php?id=100051987066419', icon: Facebook, brandColor: '#1877F2' },
    { label: 'Twitter', href: 'https://x.com/DRajput31590', icon: Twitter, brandColor: '#000000' },
];

const Footer = () => {
    const location = useLocation();
    const isDashboard = location.pathname.includes('dashboard');
    const { isAuthenticated, user } = useAuthStore();

    return (
        <footer className="bg-[var(--bg-primary)] border-t border-[var(--border)] relative overflow-hidden pt-24 pb-12">
            {/* Nexus Backdrop Pulse */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-[#dc143c]/5 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[var(--accent)]/[0.02] rounded-full blur-[120px]" />
                
                {/* Scanline Effect */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.05)_50%),linear-gradient(90deg,rgba(255,0,0,0.01),rgba(0,255,0,0.005),rgba(0,0,255,0.01))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none opacity-20" />
            </div>

            <div className="container mx-auto px-8 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-20">
                    
                    {/* Brand Section */}
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-50px" }}
                        transition={{ duration: 0.6, ease: [0.16,1,0.3,1] }}
                        className="lg:col-span-4 space-y-10"
                    >
                        <div className="flex items-center gap-5 group cursor-pointer">
                            <div className="w-14 h-14 rounded-2.5xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center shadow-[0_0_30px_rgba(220,20,60,0.1)] group-hover:scale-110 transition-all duration-500 overflow-hidden p-0">
                                <img src={logoImg} alt="LifeFlow Logo" className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h3 className="text-3xl font-black text-[var(--text-primary)] brand-font tracking-tighter uppercase leading-none">LifeFlow</h3>
                                <p className="text-[10px] text-[var(--text-muted)] font-black tracking-[0.4em] uppercase mt-2">Nexus Network</p>
                            </div>
                        </div>

                        <p className="text-lg text-[var(--text-secondary)] leading-relaxed font-medium max-w-sm">
                            The definitive blood donation nexus. Engineered for life-safety, transparency, and clinical excellence.
                        </p>

                        <div className="flex gap-4">
                            {SOCIAL.map((s, i) => (
                                <motion.div key={s.label} whileHover={{ rotateX: 15, rotateY: -15, scale: 1.1 }} style={{ perspective: 1000 }}>
                                    <Link 
                                        to={s.href} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="w-12 h-12 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-white transition-all duration-300 shadow-sm group/icon"
                                        style={{ '--hover-bg': s.brandColor }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = s.brandColor}
                                        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--bg-card)'}
                                    >
                                        <s.icon size={18} className="transition-transform group-hover/icon:scale-110" />
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Navigation Columns */}
                    <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-12">
                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.1, duration: 0.6, ease: [0.16,1,0.3,1] }}
                            className="space-y-8"
                        >
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-[0.4em]">Navigation</h4>
                            <ul className="space-y-4">
                                {[
                                    { label: 'Home Portal', path: '/' },
                                    { label: 'Donation Matrix', path: '/camps' },
                                    { label: 'Hall of Heroes', path: '/heroes' },
                                    { label: 'Compatibility AI', path: '/compatibility' }
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link to={item.path} className="text-sm font-bold text-[var(--text-secondary)] hover:text-[#dc143c] transition-colors flex items-center gap-3 group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#dc143c] scale-0 group-hover:scale-100 transition-transform shadow-[0_0_8px_#dc143c]" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.2, duration: 0.6, ease: [0.16,1,0.3,1] }}
                            className="space-y-8"
                        >
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-[0.4em]">Protocol</h4>
                            <ul className="space-y-4">
                                {[
                                    { label: 'Support Frequency', path: '/protocols/support-frequency' },
                                    { label: 'FAQ Database', path: '/protocols/faq' },
                                    { label: 'Privacy Protocol', path: '/protocols/privacy' },
                                    { label: 'Security Policy', path: '/protocols/security' }
                                ].map((item) => (
                                    <li key={item.label}>
                                        <Link to={item.path} className="text-sm font-bold text-[var(--text-secondary)] hover:text-[#dc143c] transition-colors flex items-center gap-3 group">
                                            <div className="w-1.5 h-1.5 rounded-full bg-[#dc143c] scale-0 group-hover:scale-100 transition-transform shadow-[0_0_8px_#dc143c]" />
                                            {item.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>

                        <motion.div 
                            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ delay: 0.3, duration: 0.6, ease: [0.16,1,0.3,1] }}
                            className="space-y-8 col-span-2 md:col-span-1"
                        >
                            <h4 className="text-[10px] font-black text-[var(--text-muted)] opacity-50 uppercase tracking-[0.4em]">Pulse Point</h4>
                            <div className="p-6 rounded-[2rem] bg-[var(--bg-card)] border border-[var(--border)] space-y-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#dc143c]/10 flex items-center justify-center shrink-0">
                                        <MapPin size={18} className="text-[#dc143c]" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">HQ Sector</p>
                                        <p className="text-xs font-bold text-[var(--text-primary)]">Far from the west there is a land called "VINLAND"</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[#dc143c]/10 flex items-center justify-center shrink-0">
                                        <Phone size={18} className="text-[#dc143c]" />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Uplink</p>
                                        <p className="text-xs font-bold text-[var(--text-primary)]">+91 87801 86981</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Status Bar */}
                <div className="pt-12 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#dc143c]/10 border border-[#dc143c]/20">
                            <div className="w-2 h-2 rounded-full bg-[#dc143c] animate-ping" />
                            <span className="text-[9px] font-black text-[#dc143c] uppercase tracking-[0.2em]">Zero Protocol Active</span>
                        </div>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                            &copy; {new Date().getFullYear()} LifeFlow Nexus
                        </p>
                    </div>

                    <div className="flex items-center gap-8">
                        {['Network Status', 'API Documentation', 'Operator Login'].map((l) => (
                            <a key={l} href="#" className="text-[10px] font-black text-[var(--text-muted)] hover:text-[var(--text-primary)] uppercase tracking-widest transition-colors">{l}</a>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#dc143c]/50 to-transparent opacity-30" />
        </footer>
    );
};

export default Footer;
