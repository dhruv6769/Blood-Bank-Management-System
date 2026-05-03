import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import AnimatedAvatar from '../components/AnimatedAvatar';
import CertificateGenerator from '../components/CertificateGenerator';
import SupportPanel from '../components/SupportPanel';
import Footer from '../components/Footer';
import { FileText, Hourglass, CheckCircle2, Activity, HandHeart, Clock, UserCheck, Droplet, CalendarDays, AlertCircle, ChevronDown, CheckCircle, Clock3, MapPin, ArrowRightLeft, Heart, LifeBuoy, Building2, Sparkles, LogOut } from 'lucide-react';

import { useAuthStore } from '../context/authStore';
import { useThemeStore } from '../context/themeStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import PremiumMedal from '../components/PremiumMedal';
import ModernInput from '../components/ModernInput';
import ModernSelect from '../components/ModernSelect';


const StatCard = ({ title, value, colorClass, Icon, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`bg-[var(--bg-secondary)] border border-[var(--border)] p-6 rounded-[1.8rem] shadow-[var(--shadow)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-500`}
    >
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-[var(--border)] bg-[var(--bg-primary)] ${colorClass} shadow-inner`}>
                <Icon className="w-6 h-6" />
            </div>
            <p className="text-[var(--text-muted)] font-black text-[9px] uppercase tracking-[0.2em]">{title}</p>
            <h2 className={`text-2xl font-black mt-1 brand-font truncate text-[var(--text-primary)]`}>{value}</h2>
        </div>
        <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Icon className="w-24 h-24 -mr-6 -mb-6" />
        </div>
    </motion.div>
);

const EligibilityRing = ({ date }) => {
    const today = new Date();
    const target = date ? new Date(date) : null;
    
    // If date is missing or invalid, default to 0 days/eligible
    if (!target || isNaN(target.getTime())) {
        return (
            <div className="flex flex-col items-center justify-center relative">
                <div className="w-48 h-48 relative">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="var(--border)" strokeWidth="12" fill="transparent" />
                        <circle cx="96" cy="96" r="88" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round" fill="transparent" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <CheckCircle className="w-12 h-12 text-green-500 mb-1" />
                        <span className="text-xs font-black uppercase tracking-tighter text-green-600">Eligible</span>
                    </div>
                </div>
            </div>
        );
    }

    const diffTime = target - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Percentage based on a 90-day cycle
    const percentage = Math.max(0, Math.min(100, (1 - (diffDays / 90)) * 100));
    const isEligible = diffDays <= 0;

    return (
        <div className="flex flex-col items-center justify-center relative">
            <div className="w-36 h-36 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="var(--border)" strokeWidth="8" fill="transparent" />
                    <motion.circle 
                        initial={{ strokeDasharray: "283", strokeDashoffset: "283" }}
                        animate={{ strokeDashoffset: 283 - (283 * percentage) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="50" cy="50" r="45" stroke="var(--accent)" strokeWidth="8" strokeLinecap="round" fill="transparent" 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isEligible ? (
                        <>
                            <CheckCircle className="w-10 h-10 text-green-500 mb-1" />
                            <span className="text-[10px] font-black uppercase tracking-tighter text-green-600">Eligible</span>
                        </>
                    ) : (
                        <>
                            <span className="text-2xl font-black brand-font text-[var(--accent)]">{diffDays}</span>
                            <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Days Left</span>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

const DonationJourney = ({ points }) => {
    const tiers = [
        { name: 'Starter', min: 0, max: 100, icon: '🥉' },
        { name: 'Bronze', min: 100, max: 250, icon: '🥈' },
        { name: 'Silver', min: 250, max: 500, icon: '🥇' },
        { name: 'Gold', min: 500, max: 1000, icon: '🏆' },
        { name: 'Hero', min: 1000, max: 5000, icon: '🦸' }
    ];

    const currentTier = tiers.find(t => points >= t.min && points < t.max) || tiers[tiers.length - 1];
    const nextTier = tiers[tiers.indexOf(currentTier) + 1] || null;
    
    const progress = nextTier 
        ? ((points - currentTier.min) / (nextTier.min - currentTier.min)) * 100 
        : 100;

    return (
        <div className="glass-premium p-8 rounded-[2rem] border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="relative z-10">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] mb-1">Donation Journey</p>
                        <h3 className="text-2xl font-black brand-font text-[var(--text-primary)]">Road to {nextTier ? nextTier.name : 'Max Tier'}</h3>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-[#dc143c] brand-font">{points}</span>
                        <span className="text-[9px] text-[var(--text-muted)] font-black uppercase ml-2">Total Points</span>
                    </div>
                </div>

                <div className="relative h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 mb-6">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-[#dc143c] via-[#ff3b5c] to-[#9b0023] relative"
                    >
                        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                        <motion.div 
                            animate={{ x: ['0%', '100%'] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-1/2"
                        />
                    </motion.div>
                </div>

                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">{currentTier.icon}</span>
                        {currentTier.name}
                    </div>
                    {nextTier && (
                        <div className="flex items-center gap-2">
                            {points < nextTier.min ? `${nextTier.min - points} Points needed` : 'Threshold reached'}
                            <span className="text-xl opacity-40">{nextTier.icon}</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="absolute -right-10 -bottom-10 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
                <Sparkles className="w-64 h-64 rotate-12" />
            </div>
        </div>
    );
};

const HealthInsights = ({ bloodGroup }) => {
    const insights = {
        'O-': [
            { title: 'Universal Hero', text: 'You are a universal donor. Your blood can be given to anyone in emergencies.', icon: Heart },
            { title: 'Hydration Protocol', text: 'Maintain high fluid intake 24h before donation to optimize plasma volume.', icon: Activity }
        ],
        'O+': [
            { title: 'Crucial Supply', text: 'O+ is the most common blood type. Your contribution is vital for daily surgeries.', icon: CheckCircle2 },
            { title: 'Iron Focus', text: 'Incorporate leafy greens into your diet to maintain healthy hemoglobin levels.', icon: Droplet }
        ],
        'default': [
            { title: 'Heroic Impact', text: 'Every donation can save up to three lives. Your contribution is essential.', icon: Heart },
            { title: 'Recovery Phase', text: 'Avoid heavy exercise for 12 hours post-donation to allow bio-equilibration.', icon: Activity }
        ]
    };

    const data = insights[bloodGroup] || insights['default'];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {data.map((item, idx) => (
                <motion.div 
                    key={idx}
                    whileHover={{ y: -5 }}
                    className="glass-premium p-7 rounded-[1.8rem] border-white/5 relative overflow-hidden group shadow-2xl"
                >
                    <div className="relative z-10 flex items-start gap-6">
                        <div className="w-12 h-12 rounded-xl bg-[#dc143c]/10 flex items-center justify-center shrink-0 border border-[#dc143c]/20 group-hover:bg-[#dc143c] group-hover:text-white transition-all duration-500">
                            <item.icon className="w-6 h-6" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black brand-font text-[var(--text-primary)] mb-1 tracking-tight">{item.title}</h4>
                            <p className="text-xs font-bold text-[var(--text-secondary)] leading-relaxed opacity-70">{item.text}</p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
};

const UserDashboard = () => {

    const { user, refreshUser } = useAuthStore();
    const { isDark } = useThemeStore();

    useEffect(() => {
        if (refreshUser) refreshUser();
    }, [refreshUser]);
    const [searchParams, setSearchParams] = useSearchParams();
    const [activeSection, setActiveSection] = useState('main');
    const [isSupportOpen, setIsSupportOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Handle section parameter from URL
    useEffect(() => {
        const section = searchParams.get('section');
        if (section && ['main', 'request', 'donate', 'history', 'edit-profile'].includes(section)) {
            setActiveSection(section);
        }
        
        const preselectCampId = searchParams.get('campId');
        if (preselectCampId) {
            setDonForm(prev => ({ ...prev, campId: preselectCampId }));
        }
    }, [searchParams]);

    const [dashboardData, setDashboardData] = useState({ 
        total: 0, 
        pending: 0, 
        approved: 0, 
        livesSaved: 0, 
        nextEligibilityDate: null 
    });
    const [history, setHistory] = useState([]);
    const [availableCamps, setAvailableCamps] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [hasSupportReply, setHasSupportReply] = useState(false);
    
    // NEW: Edit Profile State
    const [editForm, setEditForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        city: user?.city || '',
        state: user?.state || '',
        avatar: user?.avatar || ''
    });

    const checkSupportReplies = async () => {
        try {
            const res = await api.get('/support/user');
            if (res.data.status === 'success') {
                const hasUnread = res.data.data.some(m => !m.isReadByUser);
                setHasSupportReply(hasUnread);
            }
        } catch (error) {
            console.error('Failed to check support replies:', error);
        }
    };

    const openSupport = async () => {
        setIsSupportOpen(true);
        setHasSupportReply(false);
        try {
            await api.put('/support/mark-read-user');
        } catch (error) {
            console.error('Failed to mark support as read:', error);
        }
    };

    // Reset edit form when user updates
    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                phone: user.phone || '',
                city: user.city || '',
                state: user.state || '',
                avatar: user.avatar || ''
            });
        }
        checkSupportReplies();
    }, [user]);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const MAX_SIZE = 400;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_SIZE) {
                            height *= MAX_SIZE / width;
                            width = MAX_SIZE;
                        }
                    } else {
                        if (height > MAX_SIZE) {
                            width *= MAX_SIZE / height;
                            height = MAX_SIZE;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    ctx.drawImage(img, 0, 0, width, height);
                    const compressedBase64 = canvas.toDataURL('image/jpeg', 0.8);
                    
                    setEditForm(prev => ({ ...prev, avatar: compressedBase64 }));
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        }
    };

    const submitEditRequest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/profile/request-edit', { proposedData: editForm });
            toast.success('Edit request submitted to Admin successfully!');
            setEditForm({ name: '', phone: '', city: '', state: '', avatar: '' });
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit edit request');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDashboardInfo = async () => {
        try {
            const res = await api.get('/user/dashboard');
            if (res.data.status === 'success') {
                const { requests, donations, livesSaved, nextEligibilityDate, points, badge } = res.data.data;
                
                setDashboardData({
                    total: requests.length + donations.length,
                    pending: requests.filter(r => r.status === 'PENDING').length + donations.filter(d => d.status === 'PENDING').length,
                    approved: requests.filter(r => r.status === 'APPROVED').length + donations.filter(d => d.status === 'APPROVED').length,
                    rejected: requests.filter(r => r.status === 'REJECTED').length + donations.filter(d => d.status === 'REJECTED').length,
                    livesSaved,
                    nextEligibilityDate,
                    points,
                    badge
                });

                 const combined = [
                    ...requests.map(r => ({ ...r, type: 'emergency', patient: r.patientName, hospital: r.hospitalName, group: r.bloodGroup, effectiveDate: r.createdAt })),
                    ...donations.map(d => ({ ...d, type: 'donation', group: d.bloodGroup, effectiveDate: d.appointmentDate || d.createdAt }))
                ].sort((a, b) => {
                    const dateA = new Date(a.effectiveDate);
                    const dateB = new Date(b.effectiveDate);
                    const timeA = isNaN(dateA.getTime()) ? 0 : dateA.getTime();
                    const timeB = isNaN(dateB.getTime()) ? 0 : dateB.getTime();
                    return timeB - timeA;
                });
                
                setHistory(combined);
            }
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Could not load dashboard data';
            toast.error(msg);
            console.error('Dashboard Load Error:', err);
        }
    };

    const fetchCamps = async () => {
        try {
            const res = await api.get('/public/camps');
            if (res.data.status === 'success') {
                setAvailableCamps(res.data.camps);
            }
        } catch (error) {
            console.error('Failed to fetch camps:', error);
        }
    };

    useEffect(() => {
        fetchDashboardInfo();
        fetchCamps();
    }, [activeSection]);

    const submitRequest = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/user/requests', reqForm);
            toast.success('Emergency blood request submitted');
            setActiveSection('main');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit request');
        } finally {
            setIsLoading(false);
        }
    };

    const [reqForm, setReqForm] = useState({ patientName: '', bloodGroup: '', units: 1, hospitalName: '', city: '', contactPhone: user?.phone || '', briefing: '' });
    const [donForm, setDonForm] = useState({ bloodGroup: user?.bloodGroup || '', condition: 'None', campId: '' });

    const submitDonation = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const payload = { ...donForm, age: user?.age || null };
            await api.post('/user/donations', payload);
            toast.success('Donation request submitted for admin approval');
            setActiveSection('main');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit donation request');
        } finally {
            setIsLoading(false);
        }
    };

    const tabVars = {
        hidden:  { opacity: 0, scale: 0.97, y: 16 },
        visible: { opacity: 1, scale: 1,    y: 0,  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
        exit:    { opacity: 0, scale: 0.97, y: -12, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }
    };

    return (
        <div className="h-[calc(100vh-122px)] bg-[var(--bg-primary)] flex flex-col lg:flex-row selection:bg-[#dc143c]/30 relative overflow-hidden">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#dc143c]/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* Mobile Menu Button */}
            <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden fixed bottom-10 right-10 z-50 w-20 h-20 bg-[#dc143c] text-white rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(220,20,60,0.4)]"
            >
                <div className="relative w-8 h-8">
                    <motion.span 
                        animate={{ rotate: isSidebarOpen ? 45 : 0, y: isSidebarOpen ? 0 : -8 }}
                        className="absolute inset-0 m-auto w-full h-1 bg-white rounded-full"
                    />
                    <motion.span 
                        animate={{ opacity: isSidebarOpen ? 0 : 1 }}
                        className="absolute inset-0 m-auto w-full h-1 bg-white rounded-full"
                    />
                    <motion.span 
                        animate={{ rotate: isSidebarOpen ? -45 : 0, y: isSidebarOpen ? 0 : 8 }}
                        className="absolute inset-0 m-auto w-full h-1 bg-white rounded-full"
                    />
                </div>
            </motion.button>

            {/* Sidebar Navigation */}
            <motion.div 
                    initial={{ x: -120, opacity: 0 }} 
                    animate={{ x: isSidebarOpen ? 0 : (window.innerWidth < 1024 ? -400 : 0), opacity: 1 }}
                    transition={{ type: "spring", damping: 32, stiffness: 120 }}
                    className={`fixed lg:sticky top-0 left-0 w-[320px] bg-[var(--bg-card)] backdrop-blur-[60px] border-r border-[var(--border)] flex flex-col z-[60] h-full shadow-[30px_0_100px_rgba(0,0,0,0.5)] transition-transform duration-500 shrink-0 pt-32 lg:pt-10 p-8 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
                >
                    <div className="flex flex-col h-full justify-between">
                        <div>
                            {/* Subject Identity Card (High-End) */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-10 p-6 rounded-[2.5rem] bg-gradient-to-br from-[#dc143c]/10 to-indigo-600/10 border border-white/10 relative overflow-hidden group shadow-2xl"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#dc143c]/20 blur-[50px] rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000"></div>
                                <div className="relative z-10 flex items-center gap-5">
                                    <div className="relative">
                                        {user?.avatar ? (
                                            <img src={user.avatar} className="w-14 h-14 rounded-2xl object-cover border border-white/20 shadow-xl" alt="" />
                                        ) : (
                                            <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-white/20 flex items-center justify-center font-black text-sm text-[#dc143c]">
                                                {user?.name?.charAt(0)}
                                            </div>
                                        )}
                                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-[var(--bg-card)] shadow-lg"></div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-black text-[var(--text-primary)] truncate uppercase tracking-tighter leading-none mb-1.5">{user?.name}</p>
                                        <p className="text-[9px] font-black text-[#dc143c] uppercase tracking-[0.2em] opacity-80">Protocol: Active</p>
                                    </div>
                                </div>
                            </motion.div>

                            <nav className="space-y-3 overflow-y-auto custom-scrollbar pr-2">
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.5em] mb-6 px-2">Navigation Matrix</p>
                                {[
                                    { id: 'main', icon: Activity, label: 'Main Dashboard' },
                                    { id: 'blood-request', icon: Droplet, label: 'Blood Request' },
                                    { id: 'donation-request', icon: HandHeart, label: 'Donation Request' },
                                    { id: 'history', icon: Clock, label: 'Bio-History' },
                                    { id: 'edit-profile', icon: UserCheck, label: 'User Profile' },
                                ].map(item => (
                                    <button 
                                        key={item.id} 
                                        onClick={() => {
                                            setActiveSection(item.id);
                                            if(window.innerWidth < 1024) setIsSidebarOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-5 px-6 py-4 rounded-[1.5rem] transition-all duration-500 font-black text-[10px] uppercase tracking-[0.25em] relative group
                                            ${activeSection === item.id
                                                ? 'text-white shadow-[0_20px_50px_rgba(220,20,60,0.3)] scale-[1.03]' 
                                                : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border)]'}`}
                                    >
                                        {activeSection === item.id && (
                                            <motion.div layoutId="userSidebarActive" className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-[#dc143c] to-[#9b0023]" style={{ zIndex: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 30 }} />
                                        )}
                                        <div className={`p-2.5 rounded-xl transition-all duration-500 relative z-10 ${activeSection === item.id ? 'bg-white/10' : 'group-hover:bg-[#dc143c]/10'}`}>
                                            <item.icon className={`w-4 h-4 transition-all duration-500 ${activeSection === item.id ? 'scale-110' : 'group-hover:text-[#dc143c] group-hover:scale-110'}`} /> 
                                        </div>
                                        <span className="relative z-10">{item.label}</span>
                                    </button>
                                ))}
                                
                                <button 
                                    onClick={openSupport}
                                    className="w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-500 font-black text-[10px] uppercase tracking-[0.25em] relative group text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border)]"
                                >
                                    <div className="p-2 rounded-xl transition-all duration-500 relative z-10 group-hover:bg-blue-500/10">
                                        <LifeBuoy className={`w-4 h-4 transition-all duration-500 group-hover:text-blue-500 group-hover:scale-110`} /> 
                                        {hasSupportReply && (
                                            <>
                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                                            </>
                                        )}
                                    </div>
                                    <span className="relative z-10">Support Center</span>
                                </button>
                            </nav>
                        </div>

                        <div className="space-y-6 pt-6 mt-6 border-t border-[var(--border)]">
                            <Link to="/camps" className="w-full p-6 rounded-[2rem] bg-[#dc143c]/5 border border-[#dc143c]/20 text-[#dc143c] hover:bg-[#dc143c] hover:text-white transition-all duration-500 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl group flex items-center justify-center gap-3">
                                Nearby Ops <Building2 className="w-4 h-4 group-hover:animate-bounce" />
                            </Link>
                            
                            <div className="bg-white/5 rounded-[2rem] p-6 border border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[8px] font-black uppercase tracking-widest text-[var(--text-muted)]">Nexus Status</span>
                                    <span className="flex items-center gap-1.5 text-[8px] font-black text-green-400 uppercase tracking-widest">
                                        <span className="w-1 h-1 bg-green-400 rounded-full animate-pulse"></span> Optimal
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                    <motion.div initial={{ width: 0 }} animate={{ width: '94%' }} className="h-full bg-green-500/50" />
                                </div>
                            </div>

                            <button onClick={() => useAuthStore.getState().logout()} className="w-full flex items-center justify-center gap-3 px-6 py-5 rounded-[1.5rem] text-[var(--text-muted)] hover:text-[#dc143c] hover:bg-[#dc143c]/5 transition-all duration-300 font-black text-[10px] uppercase tracking-[0.4em] border border-transparent hover:border-[#dc143c]/20">
                                <LogOut className="w-4 h-4" /> Terminate Session
                            </button>
                        </div>
                    </div>
                </motion.div>

            {/* Main Content Area - Independent Scroll */}
            <div className="flex-1 px-6 md:px-16 pt-10 pb-32 z-10 w-full overflow-y-auto custom-scrollbar relative h-full">
                <AnimatePresence mode="wait">
                    {/* SECTION: MAIN OVERVIEW */}
                    {activeSection === 'main' && (
                        <motion.div key="main" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="space-y-10">
                            {/* PREMIUM HERO */}
                            <div className="relative rounded-[4rem] overflow-hidden glass-premium border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.4)] group min-h-[420px] flex items-center">
                                <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
                                    <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#dc143c] blur-[150px] rounded-full" />
                                    <div className="absolute bottom-[-10%] left-[-20%] w-[500px] h-[500px] bg-indigo-600 blur-[150px] rounded-full" />
                                </div>
                                <div className="absolute inset-0 z-0">
                                    <img src="https://images.unsplash.com/photo-1579154341098-e4e158cc7f55?auto=format&fit=crop&q=80&w=2000" className="w-full h-full object-cover opacity-20 scale-110 group-hover:scale-100 transition-transform duration-[6s]" alt="" />
                                    <div className="absolute inset-0 bg-gradient-to-tr from-[var(--bg-primary)] via-[var(--bg-primary)]/60 to-transparent" />
                                </div>
                                
                                <div className="relative z-10 p-16 w-full flex flex-col lg:flex-row items-center justify-between gap-12">
                                    <div className="flex-grow text-center lg:text-left max-w-2xl">
                                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                                            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 backdrop-blur-2xl border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-2xl">
                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-ping"></span>
                                            Main Dashboard
                                        </motion.div>
                                        
                                        <div className="flex items-center gap-6 mb-8 justify-center lg:justify-start">
                                            {user?.avatar ? (
                                                <div className="relative group/avatar">
                                                    <div className="absolute -inset-1.5 bg-gradient-to-tr from-[#dc143c] to-indigo-600 rounded-2xl blur-md opacity-0 group-hover/avatar:opacity-50 transition-opacity duration-500" />
                                                    <img src={user.avatar} alt="Profile" className="relative w-20 h-20 rounded-[1.5rem] object-cover shadow-2xl border border-white/20 bg-[var(--bg-primary)] transform group-hover/avatar:scale-105 transition-transform duration-500" />
                                                </div>
                                            ) : (
                                                <AnimatedAvatar size="lg" user={user} />
                                            )}
                                            <div className="text-left">
                                                <h1 className="text-4xl lg:text-5xl font-black brand-font tracking-tighter text-[var(--text-primary)] leading-[0.8]">
                                                    Hello, {user?.name?.split(' ')[0]}<span className="text-[#dc143c]">.</span>
                                                </h1>
                                                <p className="text-[9px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] mt-4">User ID: {user?._id?.slice(-8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                        
                                        <p className="text-[var(--text-secondary)] text-xl lg:text-2xl font-bold leading-relaxed max-w-xl mb-12 tracking-tight">
                                            Your impact has resonated across <span className="text-[var(--text-primary)] font-black">{dashboardData.livesSaved} lives</span>. Your contribution remains essential.
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-6 justify-center lg:justify-start">
                                            <motion.div whileHover={{ y: -4 }} className="flex items-center gap-5 px-8 py-5 rounded-[2rem] glass-premium border-white/10 hover:border-[#dc143c]/30 transition-all group shadow-2xl">
                                                <PremiumMedal tier={dashboardData.badge} size="sm" />
                                                <div className="text-left">
                                                    <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] mb-1">Donor Rank</div>
                                                    <div className="text-2xl font-black text-[var(--text-primary)] brand-font tracking-tight group-hover:text-[#dc143c] transition-colors">{dashboardData.badge}</div>
                                                </div>
                                            </motion.div>
                                            
                                            <motion.div whileHover={{ y: -4 }} className="px-8 py-5 rounded-[2rem] glass-premium border-white/10 hover:border-red-500/30 relative group cursor-help transition-all shadow-2xl">
                                                <div className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] mb-1 flex items-center gap-2">
                                                    Donor Points <AlertCircle className="w-3 h-3 text-[#dc143c]" />
                                                </div>
                                                <div className="text-2xl font-black text-[#dc143c] brand-font tracking-tight">{dashboardData.points} Points</div>
                                                <div className="absolute top-full left-0 mt-6 w-80 glass-premium text-[12px] text-[var(--text-secondary)] p-8 rounded-[2rem] border-white/10 opacity-0 group-hover:opacity-100 transition-all pointer-events-none z-50 shadow-[0_50px_100px_rgba(0,0,0,0.6)] translate-y-2 group-hover:translate-y-0">
                                                    Points are calculated upon successful intake and admin verification. High Points unlocks higher Hero Tiers and exclusive rewards.
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>
                                    
                                    <div className="shrink-0 p-12 rounded-[4rem] glass-premium border-white/10 shadow-[0_50px_100px_rgba(0,0,0,0.4)] transform hover:scale-105 transition-transform duration-1000">
                                        <EligibilityRing date={dashboardData.nextEligibilityDate} />
                                    </div>
                                </div>
                            </div>

                            {/* CORE STATS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                                {[
                                    { title: "Total Requests", value: dashboardData.total, icon: Activity, delay: 0.1, color: "blue" },
                                    { title: "Pending", value: dashboardData.pending, icon: Hourglass, delay: 0.2, color: "yellow" },
                                    { title: "Lives Saved", value: dashboardData.livesSaved, icon: Droplet, delay: 0.3, color: "red" },
                                    { title: "Points", value: dashboardData.points, icon: Activity, delay: 0.4, color: "emerald" }
                                ].map((stat, idx) => (
                                    <motion.div key={stat.title} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: stat.delay, type: 'spring', damping: 20 }}
                                        className="glass-premium p-12 rounded-[3.5rem] border-white/5 hover:border-[#dc143c]/40 group transition-all cursor-pointer relative overflow-hidden shadow-2xl">
                                        <div className="relative z-10">
                                            <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-10 bg-white/5 border border-white/10 group-hover:scale-110 group-hover:bg-[#dc143c] group-hover:text-white transition-all duration-700`}>
                                                <stat.icon className="w-8 h-8" />
                                            </div>
                                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] mb-3">{stat.title}</p>
                                            <h2 className="text-6xl font-black brand-font tracking-tight text-[var(--text-primary)]">{stat.value}</h2>
                                        </div>
                                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] group-hover:opacity-[0.1] group-hover:scale-125 transition-all duration-1000 transform rotate-12">
                                            <stat.icon className="w-56 h-56" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* DONATION JOURNEY & HEALTH INSIGHTS */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2">
                                    <HealthInsights bloodGroup={user?.bloodGroup} />
                                </div>
                                <div className="lg:col-span-1">
                                    <DonationJourney points={dashboardData.points} />
                                </div>
                            </div>

                            {/* COMPATIBILITY QUICK CHECK */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                className="glass-premium p-14 rounded-[4rem] border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.3)] relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-[500px] h-full bg-red-600/5 -skew-x-12 translate-x-64 group-hover:translate-x-48 transition-transform duration-[3s]"></div>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-16 relative z-10">
                                    <div className="flex items-center gap-10">
                                        <div className="w-24 h-24 rounded-[2rem] bg-[#dc143c] flex items-center justify-center text-white shadow-[0_30px_60px_rgba(220,20,60,0.4)] group-hover:rotate-12 transition-all duration-700">
                                            <Heart className="w-12 h-12" />
                                        </div>
                                        <div>
                                            <h3 className="text-4xl font-black brand-font text-[var(--text-primary)] tracking-tight">Bio-Compatibility Matrix</h3>
                                            <p className="text-xl text-[var(--text-secondary)] font-medium mt-2">Real-time analysis for blood type <span className="text-[#dc143c] font-black">{user?.bloodGroup || 'Not Registered'}</span></p>
                                        </div>
                                    </div>
                                    <Link to="/compatibility" className="px-12 py-6 bg-white/5 border border-white/10 rounded-[2rem] text-[var(--text-primary)] font-black brand-font text-xs uppercase tracking-[0.4em] hover:bg-[#dc143c] hover:text-white transition-all flex items-center gap-4 shadow-2xl">
                                        Open Analyzer <ArrowRightLeft className="w-5 h-5" />
                                    </Link>
                                </div>
                            </motion.div>

                            {/* QUICK ACTIONS HUB */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                                {[
                                    { id: 'blood-request', label: 'Blood Request', desc: 'Initiate a medical requirement for immediate support.', icon: Activity, color: 'bg-[#dc143c]', hover: 'hover:bg-red-700' },
                                    { id: 'donation-request', label: 'Donation Request', desc: 'Schedule a session and contribute to the pool.', icon: HandHeart, color: 'glass-premium', hover: 'hover:border-[#dc143c]/40' },
                                    { id: 'camps', label: 'Nearby Camps', desc: 'Locate regional donation nodes in real-time.', icon: MapPin, color: 'bg-indigo-600', hover: 'hover:bg-indigo-700', isLink: true, path: '/camps' }
                                ].map((action) => (
                                    <motion.button key={action.id} whileHover={{ y: -15 }} onClick={() => action.isLink ? null : setActiveSection(action.id)}
                                        className={`group relative h-[360px] rounded-[4rem] overflow-hidden ${action.color === 'glass-premium' ? 'glass-premium border-white/5 shadow-2xl' : action.color + ' shadow-[0_30px_60px_rgba(0,0,0,0.4)]'} border border-white/5 transition-all duration-700 ${action.hover}`}>
                                        {action.isLink && <Link to={action.path} className="absolute inset-0 z-20" />}
                                        <div className="absolute inset-0 bg-gradient-to-br from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative h-full p-14 flex flex-col justify-between items-start text-left z-10">
                                            <div className={`w-20 h-20 rounded-[2rem] ${action.color === 'glass-premium' ? 'bg-[#dc143c]/10 text-[#dc143c]' : 'bg-white/10 text-white'} flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-700`}>
                                                <action.icon className="w-10 h-10" />
                                            </div>
                                            <div>
                                                <h3 className={`text-4xl font-black brand-font mb-4 tracking-tight ${action.color === 'glass-premium' ? 'text-[var(--text-primary)]' : 'text-white'}`}>{action.label}</h3>
                                                <p className={`text-sm font-bold opacity-70 leading-relaxed ${action.color === 'glass-premium' ? 'text-[var(--text-secondary)]' : 'text-white'}`}>{action.desc}</p>
                                            </div>
                                        </div>
                                        {action.id === 'camps' && (
                                            <img src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:grayscale-0 group-hover:scale-110 transition-all duration-[2s]" alt="" />
                                        )}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* SECTION: BLOOD REQUEST */}
                    {activeSection === 'blood-request' && (
                        <motion.div key="blood-request" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-3xl mx-auto py-12">
                            <div className="mb-12 text-center">
                                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] brand-font mb-4 tracking-tighter">Blood Request<span className="text-[#dc143c]">.</span></h2>
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em]">Broadcast a medical requirement to the global donor network</p>
                            </div>
                            
                            <div className="glass-premium p-10 lg:p-12 rounded-[2.5rem] border-white/5 shadow-[0_80px_150px_rgba(0,0,0,0.5)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#dc143c]/5 rounded-bl-full z-0 blur-[100px]" />
                                <form onSubmit={submitRequest} className="space-y-8 relative z-10">
                                    <ModernInput label="Patient Name" required value={reqForm.patientName} onChange={e => setReqForm({...reqForm, patientName: e.target.value})} placeholder="Full Medical Name" />
                                    <div className="grid grid-cols-2 gap-6">
                                        <ModernSelect label="Blood Group" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} value={reqForm.bloodGroup} onChange={val => setReqForm({...reqForm, bloodGroup: val})} />
                                        <ModernInput label="Units Needed" type="number" value={reqForm.units} onChange={e => setReqForm({...reqForm, units: e.target.value})} />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <ModernSelect 
                                            label="Deployment Sector" 
                                            options={[...new Set(availableCamps.map(c => c.name))]} 
                                            value={reqForm.hospitalName} 
                                            onChange={val => setReqForm({...reqForm, hospitalName: val})} 
                                        />
                                        <ModernSelect 
                                            label="City Node" 
                                            options={[...new Set(availableCamps.map(c => c.city))]} 
                                            value={reqForm.city} 
                                            onChange={val => setReqForm({...reqForm, city: val})} 
                                        />
                                    </div>
                                    <ModernInput label="Message" value={reqForm.briefing} onChange={e => setReqForm({...reqForm, briefing: e.target.value})} rows={3} placeholder="Describe the medical situation..." />
                                    <button disabled={isLoading} className="w-full py-5 bg-[#dc143c] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_30px_60px_rgba(220,20,60,0.4)]">
                                        {isLoading ? 'Transmitting...' : 'Initiate Broadcast'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* SECTION: DONATION REQUEST */}
                    {activeSection === 'donation-request' && (
                        <motion.div key="donation-request" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-3xl mx-auto py-12">
                            <div className="mb-12 text-center">
                                <h2 className="text-4xl lg:text-5xl font-black text-[var(--text-primary)] brand-font mb-4 tracking-tighter">Donation Request<span className="text-[#dc143c]">.</span></h2>
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em]">Pledge a bio-donation and secure regional life-lines</p>
                            </div>
                            
                            <div className="glass-premium p-10 lg:p-12 rounded-[2.5rem] border-white/5 shadow-[0_80px_150px_rgba(0,0,0,0.5)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-600/5 rounded-bl-full z-0 blur-[100px]" />
                                <form onSubmit={submitDonation} className="space-y-8 relative z-10">
                                    <ModernSelect label="Select Camp" options={availableCamps.map(c => ({ value: c.id, label: `${c.name} (${c.city})` }))} value={donForm.campId} onChange={val => setDonForm({...donForm, campId: val})} />
                                    <div className="grid grid-cols-2 gap-6">
                                        <ModernSelect label="Your Blood Group" options={['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-']} value={donForm.bloodGroup} onChange={val => setDonForm({...donForm, bloodGroup: val})} />
                                        <ModernSelect label="Health Condition" options={['None', 'Diabetes', 'Hypertension', 'Other']} value={donForm.condition} onChange={val => setDonForm({...donForm, condition: val})} />
                                    </div>
                                    <button disabled={isLoading} className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_30px_60px_rgba(79,70,229,0.4)]">
                                        {isLoading ? 'Processing...' : 'Register Deployment'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* SECTION: HISTORY */}
                    {activeSection === 'history' && (
                        <motion.div key="history" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-5xl mx-auto py-12">
                            <div className="text-center mb-10">
                                <h2 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] brand-font mb-3 tracking-tighter">Bio-History Timeline<span className="text-[#dc143c]">.</span></h2>
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em]">A chronological ledger of your life-saving operations</p>
                            </div>
                            
                            <div className="space-y-12 relative before:absolute before:inset-0 before:left-1/2 before:-translate-x-1/2 before:w-px before:bg-gradient-to-b before:from-[#dc143c] before:via-[var(--border)] before:to-transparent before:h-full hidden md:block">
                                {history.map((record, index) => (
                                    <motion.div key={record._id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1, type: 'spring' }}
                                        className={`relative flex items-center gap-12 group ${index % 2 === 0 ? 'flex-row' : 'flex-row-reverse'}`}>
                                        <div className={`flex-1 ${index % 2 === 0 ? 'text-right' : 'text-left'}`}>
                                            <div className="glass-premium p-10 rounded-[3rem] border-white/5 hover:border-[#dc143c]/40 transition-all group-hover:-translate-y-3 shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-[#dc143c]/5 rounded-bl-full z-0 blur-3xl" />
                                                <div className="relative z-10">
                                                    <div className={`flex items-center gap-5 mb-5 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                                        <span className="px-5 py-2 rounded-full bg-white/5 border border-white/10 text-[#dc143c] text-[9px] font-black tracking-[0.4em] uppercase">{record.type}</span>
                                                        <span className="text-[11px] font-black text-[var(--text-muted)] uppercase tracking-widest">{new Date(record.effectiveDate).toLocaleDateString()}</span>
                                                    </div>
                                                    <h3 className="text-2xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-5">{record.type === 'emergency' ? `Blood Request: ${record.patient}` : "Donation Session"}</h3>
                                                    <div className={`flex items-center gap-7 ${index % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
                                                        <div className="flex items-center gap-2.5"><Droplet className="w-5 h-5 text-[#dc143c]" /><span className="text-lg font-black text-[var(--text-primary)]">{record.group}</span></div>
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-2.5 h-2.5 rounded-full ${record.status === 'APPROVED' ? 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : record.status === 'REJECTED' ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)]' : 'bg-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.6)] animate-pulse'}`} />
                                                            <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">{record.status}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 rounded-[1.5rem] glass-premium border-white/20 flex items-center justify-center shrink-0 z-10 shadow-2xl group-hover:scale-115 group-hover:bg-[#dc143c] group-hover:text-white transition-all duration-700">
                                            {record.type === 'emergency' ? <Activity size={22} /> : <HandHeart size={22} />}
                                        </div>
                                        <div className="flex-1" />
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* SECTION: EDIT PROFILE */}
                    {activeSection === 'edit-profile' && (
                        <motion.div key="edit-profile" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-5xl mx-auto py-10">
                            <div className="mb-10 text-center">
                                <h2 className="text-3xl lg:text-4xl font-black text-[var(--text-primary)] brand-font mb-3 tracking-tighter">Edit Profile<span className="text-[#dc143c]">.</span></h2>
                                <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em]">Propose modifications to your global User Profile profile</p>
                            </div>
                            
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                                <div className="glass-premium p-10 rounded-[3rem] border-white/5 shadow-2xl text-center group transition-all hover:border-[#dc143c]/30 h-fit">
                                    <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-[var(--bg-primary)] border border-white/10 shadow-2xl mb-8 overflow-hidden flex items-center justify-center relative">
                                        {user?.avatar ? <img src={user.avatar} className="w-full h-full object-cover" alt="" /> : <AnimatedAvatar size="xl" user={user} />}
                                    </div>
                                    <h3 className="text-3xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-2">{user?.name}</h3>
                                    <p className="text-[10px] text-green-400 font-black uppercase tracking-[0.3em] mb-10 flex items-center justify-center gap-2">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>Verified Bio-Signature
                                    </p>
                                    <div className="space-y-8 text-left border-t border-white/5 pt-8">
                                        <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Comms Link</span><span className="text-sm font-bold text-[var(--text-primary)]">{user?.email}</span></div>
                                        <div className="flex flex-col"><span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Sector Location</span><span className="text-sm font-bold text-[var(--text-primary)]">{user?.city || 'Not Set'}, {user?.state || 'Not Set'}</span></div>
                                        <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/5 group-hover:border-[#dc143c]/30 transition-all">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Bio-Marker</span>
                                            <span className="text-2xl font-black text-[#dc143c] leading-none">{user?.bloodGroup || 'NA'}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="lg:col-span-2 glass-premium p-8 rounded-[2rem] border-white/5 shadow-[0_50px_100px_rgba(0,0,0,0.4)] relative overflow-hidden h-fit">
                                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#dc143c]/5 rounded-bl-full z-0 blur-[100px]" />
                                    <form onSubmit={submitEditRequest} className="space-y-8 relative z-10">
                                        <div className="flex flex-col md:flex-row items-center gap-6 p-6 rounded-[1.5rem] bg-white/5 border border-white/5">
                                            <div className="relative group cursor-pointer shrink-0">
                                                {editForm.avatar ? <img src={editForm.avatar} className="w-20 h-20 rounded-xl object-cover border-2 border-white/10 group-hover:border-[#dc143c] transition-all shadow-2xl" alt="" /> : <div className="w-20 h-20 rounded-xl border-2 border-dashed border-white/10 group-hover:border-[#dc143c] flex items-center justify-center bg-white/5 transition-all"><AnimatedAvatar size="md" user={user} /></div>}
                                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
                                            </div>
                                            <div className="flex-1 w-full"><ModernInput label="Full Name" required value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} /></div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <ModernInput label="Mobile Number" type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />
                                            <ModernInput label="City" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} />
                                        </div>
                                        <ModernInput label="State" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} />
                                        <button disabled={isLoading} className="w-full py-4 bg-[#dc143c] text-white rounded-xl font-black text-[10px] uppercase tracking-[0.4em] transition-all hover:scale-[1.02] active:scale-95 shadow-[0_25px_50px_rgba(220,20,60,0.35)]">
                                            {isLoading ? 'Transmitting Data...' : 'Propose Identity Update'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Localized Footer */}
                <div className="-mx-6 md:-mx-16 mt-20">
                    <Footer />
                </div>
            </div>

            {/* Support Modal */}
            <SupportPanel isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        </div>
    );
};

export default UserDashboard;
