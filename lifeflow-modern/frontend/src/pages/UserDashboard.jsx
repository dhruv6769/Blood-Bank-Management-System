/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import AnimatedAvatar from '../components/AnimatedAvatar';
import CertificateGenerator from '../components/CertificateGenerator';
import SupportPanel from '../components/SupportPanel';
import { FileText, Hourglass, CheckCircle2, Activity, HandHeart, Clock, UserCheck, Droplet, CalendarDays, AlertCircle, ChevronDown, CheckCircle, Clock3, MapPin, ArrowRightLeft, Heart, LifeBuoy } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { useThemeStore } from '../context/themeStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import PremiumMedal from '../components/PremiumMedal';


const StatCard = ({ title, value, colorClass, Icon, delay }) => (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className={`bg-[var(--bg-secondary)] border border-[var(--border)] p-8 rounded-[2.5rem] shadow-[var(--shadow)] relative overflow-hidden group hover:-translate-y-1 transition-all duration-500`}
    >
        <div className="relative z-10">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-[var(--border)] bg-[var(--bg-primary)] ${colorClass} shadow-inner`}>
                <Icon className="w-7 h-7" />
            </div>
            <p className="text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.2em]">{title}</p>
            <h2 className={`text-4xl font-black mt-2 brand-font truncate text-[var(--text-primary)]`}>{value}</h2>
        </div>
        <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
            <Icon className="w-32 h-32 -mr-8 -mb-8" />
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
            <div className="w-48 h-48 relative">
                <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" stroke="var(--border)" strokeWidth="12" fill="transparent" />
                    <motion.circle 
                        initial={{ strokeDasharray: "553", strokeDashoffset: "553" }}
                        animate={{ strokeDashoffset: 553 - (553 * percentage) / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="96" cy="96" r="88" stroke="var(--accent)" strokeWidth="12" strokeLinecap="round" fill="transparent" 
                    />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isEligible ? (
                        <>
                            <CheckCircle className="w-12 h-12 text-green-500 mb-1" />
                            <span className="text-xs font-black uppercase tracking-tighter text-green-600">Eligible</span>
                        </>
                    ) : (
                        <>
                            <span className="text-4xl font-black brand-font text-[var(--accent)]">{diffDays}</span>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Days Left</span>
                        </>
                    )}
                </div>
            </div>
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

    const [reqForm, setReqForm] = useState({ patientName: '', bloodGroup: '', units: 1, hospitalName: '', city: '', contactPhone: user?.phone || '' });
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
        hidden: { opacity: 0, scale: 0.98, y: 10 },
        visible: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
        exit: { opacity: 0, scale: 0.98, y: -10, transition: { duration: 0.2 } }
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center">
            {/* Immersive Sidebar (Fixed) */}
            <div style={{ overscrollBehavior: 'contain' }} className="fixed left-0 top-0 bottom-0 w-24 md:w-80 bg-[var(--bg-secondary)] border-r border-[var(--border)] hidden lg:flex flex-col z-30 pt-24 pb-12 px-6 overflow-y-auto">
                <div className="mb-12">
                    <h2 className="text-xs font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-8 ml-4">Sanctuary Menu</h2>
                    <nav className="space-y-3">
                        {[
                            { id: 'main', icon: Activity, label: 'Sanctuary Overview' },
                            { id: 'request', icon: MapPin, label: 'Emergency Requests' },
                            { id: 'donate', icon: HandHeart, label: 'Offer Donation' },
                            { id: 'history', icon: Clock, label: 'My Journey' },
                            { id: 'edit-profile', icon: UserCheck, label: 'Edit Profile' },
                        ].map(item => (
                            <button 
                                key={item.id}
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-300 font-bold group
                                    ${activeSection === item.id 
                                        ? 'bg-[var(--accent)] text-white shadow-lg shadow-red-500/20' 
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'}`
                                }
                            >
                                <item.icon className={`w-5 h-5 ${activeSection === item.id ? 'text-white' : 'group-hover:text-[var(--accent)] transition-colors'}`} /> 
                                <span className="text-sm tracking-wide">{item.label}</span>
                            </button>
                        ))}
                        
                        {/* Support Button */}
                        <button 
                            onClick={openSupport}
                            className="w-full flex items-center gap-4 px-6 py-5 rounded-[1.5rem] transition-all duration-300 font-bold group text-[var(--text-secondary)] hover:bg-blue-500/10 hover:text-blue-500 relative"
                        >
                            <div className="relative">
                                <LifeBuoy className="w-5 h-5 group-hover:text-blue-500 transition-colors" /> 
                                {hasSupportReply && (
                                    <>
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                                    </>
                                )}
                            </div>
                            <span className="text-sm tracking-wide">Support Center</span>
                        </button>
                    </nav>
                </div>
                
                <div className="mt-auto bg-gradient-to-br from-[var(--accent)]/10 to-transparent p-6 rounded-[2rem] border border-[var(--accent)]/20">
                    <div className="flex items-center gap-3 mb-4">
                        <Droplet className="w-5 h-5 text-[var(--accent)]" />
                        <span className="text-sm font-black text-[var(--text-primary)]">Ready to help?</span>
                    </div>
                    <p className="text-[10px] text-[var(--text-secondary)] font-medium leading-relaxed">Your blood can save up to 3 lives. Check your eligibility today.</p>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full lg:pl-80 min-h-screen pt-24 px-6 md:px-12 pb-24 max-w-[1600px]">
                <AnimatePresence mode="wait">
                    {/* SECTION: MAIN OVERVIEW */}
                    {activeSection === 'main' && (
                        <motion.div key="main" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="space-y-12">
                            {/* PREMIUM HERO */}
                            <div className="relative rounded-[3rem] overflow-hidden bg-[var(--bg-card)] border border-[var(--border)] shadow-2xl group min-h-[400px]">
                                <img src="/images/sanctuary_bg.png" className="absolute inset-0 w-full h-full object-cover opacity-50 scale-110 group-hover:scale-100 transition-transform duration-[2s] pointer-events-none" alt="" />
                                <div className={`absolute inset-0 bg-gradient-to-t from-[var(--bg-card)] via-[var(--bg-card)]/40 to-transparent ${isDark ? 'opacity-90' : 'opacity-70'}`}></div>
                                
                                <div className="relative z-10 p-12 h-full flex flex-col md:flex-row items-center gap-12">
                                    <div className="flex-grow text-center md:text-left">
                                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                            Donor Sanctuary Active
                                        </div>
                                        <div className="flex items-center gap-6 mb-4">
                                            {user?.avatar ? (
                                                <img src={user.avatar} alt="Profile" className="w-20 h-20 rounded-2xl object-cover shadow-lg border-2 border-[var(--accent)]/50 bg-[var(--bg-primary)]" />
                                            ) : (
                                                <AnimatedAvatar size="lg" user={user} />
                                            )}
                                            <h1 className="text-4xl md:text-6xl font-black brand-font tracking-tight text-[var(--text-primary)]">
                                                Hello, {user?.name?.split(' ')[0]} <span className="text-red-500">.</span>
                                            </h1>
                                        </div>
                                        <p className="text-[var(--text-secondary)] text-lg md:text-xl font-medium max-w-lg mb-8">
                                            Your dedication is incredible. You've personally impacted {dashboardData.livesSaved} lives through your generosity.
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                            <div className="flex items-center gap-4 px-6 py-4 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border)] backdrop-blur-sm hover:bg-[var(--bg-secondary)] transition-colors group">
                                                <PremiumMedal tier={dashboardData.badge} size="sm" />
                                                <div>
                                                    <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1">Impact Level</div>
                                                    <div className="text-xl font-black text-[var(--text-primary)] brand-font tracking-tight">{dashboardData.badge}</div>
                                                </div>
                                            </div>
                                             <div className="px-6 py-3 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] backdrop-blur-sm relative group cursor-help">
                                                <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
                                                    Total Points <AlertCircle className="w-3 h-3 text-red-500" />
                                                </div>
                                                <div className="text-xl font-black text-red-500 brand-font">{dashboardData.points} XP</div>
                                                <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--bg-secondary)] text-xs text-[var(--text-secondary)] p-4 rounded-xl border border-[var(--border)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl backdrop-blur-md">
                                                    Points are generated upon Admin completion of your donation session.
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="shrink-0 p-8 rounded-[3rem] bg-[var(--bg-primary)] border border-[var(--border)] backdrop-blur-xl shadow-2xl">
                                        <EligibilityRing date={dashboardData.nextEligibilityDate} />
                                    </div>
                                </div>
                            </div>

                            {/* CORE STATS */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <StatCard title="Total Actions" value={dashboardData.total} colorClass="text-blue-500" Icon={Activity} delay={0.1} />
                                <div className="group relative">
                                    <StatCard title="Pending Review" value={dashboardData.pending} colorClass="text-yellow-500" Icon={Hourglass} delay={0.2} />
                                    {dashboardData.pending > 0 && (
                                        <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 w-56 bg-[var(--bg-secondary)] text-xs text-yellow-600 p-4 rounded-xl border border-yellow-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 text-center shadow-2xl backdrop-blur-md">
                                            Awaiting administrative verification. Points will be awarded upon approval!
                                        </div>
                                    )}
                                </div>
                                <StatCard title="Lives Impacted" value={dashboardData.livesSaved} colorClass="text-red-500" Icon={Droplet} delay={0.3} />
                                <StatCard title="Health Points" value={dashboardData.points} colorClass="text-emerald-500" Icon={Activity} delay={0.4} />
                            </div>

                            {/* COMPATIBILITY QUICK CHECK */}
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-[var(--bg-secondary)] border border-[var(--border)] p-8 rounded-[3rem] shadow-xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-64 h-full bg-red-600/5 -skew-x-12 translate-x-32"></div>
                                <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-3xl bg-red-600 flex items-center justify-center text-white shadow-lg">
                                            <Heart className="w-8 h-8" />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black brand-font text-[var(--text-primary)]">Your Compatibility</h3>
                                            <p className="text-sm text-[var(--text-secondary)] font-medium">Quick reference for your blood type ({user?.bloodType || 'Not Set'})</p>
                                        </div>
                                    </div>
                                    
                                    <Link to="/compatibility" className="px-8 py-4 bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl text-[var(--text-primary)] font-black brand-font text-xs uppercase tracking-widest hover:bg-[var(--bg-secondary)] transition-all flex items-center gap-2">
                                        View Full Analyzer <ArrowRightLeft className="w-4 h-4" />
                                    </Link>
                                </div>
                            </motion.div>

                            {/* QUICK ACTIONS HUB */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <motion.button 
                                    whileHover={{ y: -5 }}
                                    onClick={() => setActiveSection('request')}
                                    className="group relative h-64 rounded-[3rem] overflow-hidden bg-red-600 shadow-xl"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500 to-red-700 opacity-90 group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative h-full p-10 flex flex-col justify-between items-start text-white text-left">
                                        <Activity className="w-12 h-12 mb-4" />
                                        <div>
                                            <h3 className="text-2xl font-black brand-font mb-2">Request Blood</h3>
                                            <p className="text-red-100 font-medium opacity-80 text-xs">Instantly alert our community for patients in critical need.</p>
                                        </div>
                                    </div>
                                </motion.button>

                                 <motion.button 
                                    whileHover={{ y: -5 }}
                                    onClick={() => setActiveSection('donate')}
                                    className="group relative h-64 rounded-[3rem] overflow-hidden bg-[var(--bg-secondary)] shadow-xl border border-[var(--border)]"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-primary)] to-[var(--bg-card)] group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative h-full p-10 flex flex-col justify-between items-start text-[var(--text-primary)] text-left">
                                        <HandHeart className="w-12 h-12 mb-4 text-[var(--accent)]" />
                                        <div>
                                            <h3 className="text-2xl font-black brand-font mb-2">Offer Donation</h3>
                                            <p className="text-[var(--text-muted)] font-medium opacity-80 text-xs">Become a hero. Schedule your next donation session.</p>
                                        </div>
                                    </div>
                                </motion.button>

                                <Link 
                                    to="/camps"
                                    className="group relative h-64 rounded-[3rem] overflow-hidden bg-indigo-600 shadow-xl border border-white/5 no-underline block"
                                >
                                    <img src="https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&q=80&w=800" className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Camps" />
                                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-transparent group-hover:scale-110 transition-transform duration-700"></div>
                                    <div className="relative h-full p-10 flex flex-col justify-between items-start text-white text-left">
                                        <MapPin className="w-12 h-12 mb-4" />
                                        <div>
                                            <h3 className="text-2xl font-black brand-font mb-2">Active Camps</h3>
                                            <p className="text-indigo-100 font-medium opacity-80 text-xs">Locate mission-critical donation nodes in real-time.</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </motion.div>
                    )}

                    {/* SECTION: HISTORY / JOURNEY */}
                    {activeSection === 'history' && (
                        <motion.div key="history" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-4xl mx-auto py-12">
                            <h2 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">My Journey <span className="text-[var(--accent)]">.</span></h2>
                            <p className="text-[var(--text-muted)] font-medium mb-16">A medical timeline of your life-saving contributions.</p>
                            
                            <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:w-0.5 before:-translate-x-px before:bg-[var(--border)] before:h-full">
                                {history.map((record, index) => (
                                    <motion.div 
                                        key={record.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="relative flex items-center md:items-start md:space-x-12 group"
                                    >
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[var(--bg-secondary)] border-4 border-[var(--border)] group-hover:border-[var(--accent)] transition-colors shrink-0 z-10">
                                            {record.type === 'emergency' ? <Activity className="w-4 h-4 text-red-500" /> : <HandHeart className="w-4 h-4 text-slate-500" />}
                                        </div>
                                        
                                        <div className="flex-grow bg-[var(--bg-secondary)] border border-[var(--border)] p-8 rounded-[2rem] shadow-[var(--shadow)] hover:shadow-lg transition-all">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <div className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-1">{record.type} Event</div>
                                                    <h3 className="text-xl font-bold text-[var(--text-primary)]">{record.type === 'emergency' ? `Request for ${record.patient}` : "Donation Session"}</h3>
                                                </div>
                                                <div className="px-4 py-1.5 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--accent)] text-[10px] font-black tracking-widest uppercase shadow-sm">
                                                    {(() => {
                                                        const dateStr = record.effectiveDate || record.createdAt;
                                                        const d = new Date(dateStr);
                                                        return (dateStr && !isNaN(d.getTime())) ? d.toLocaleDateString() : 'Active';
                                                    })()}
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2">
                                                    <Droplet className="w-4 h-4 text-red-500" />
                                                    <span className="text-sm font-black text-[var(--text-primary)]">{record.group}</span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                 <div className={`w-2 h-2 rounded-full ${
                                                     (record.status === 'APPROVED' || record.status === 'COMPLETED' || record.status === 'FULFILLED') 
                                                        ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' 
                                                        : record.status === 'REJECTED' 
                                                            ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' 
                                                            : 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]'
                                                 }`}></div>
                                                 <span className={`text-[10px] font-black uppercase tracking-widest ${
                                                     (record.status === 'APPROVED' || record.status === 'COMPLETED' || record.status === 'FULFILLED') 
                                                        ? 'text-green-500' 
                                                        : record.status === 'REJECTED' 
                                                            ? 'text-red-500' 
                                                            : 'text-[var(--text-muted)]'
                                                 }`}>{record.status}</span>
                                                </div>
                                            </div>

                                            {record.type === 'donation' && (record.status === 'APPROVED' || record.status === 'COMPLETED' || record.status === 'FULFILLED') && (
                                                <div className="mt-6 pt-6 border-t border-[var(--border)] flex justify-end">
                                                    <CertificateGenerator donorName={user?.name} bloodGroup={record.group} date={record.effectiveDate || record.createdAt} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* FORMS - POLISHED GLASSMOPRHISM */}
                    {(activeSection === 'request' || activeSection === 'donate') && (
                        <motion.div key="forms" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-2xl mx-auto py-12">
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-bl-[100%]"></div>
                                
                                <h2 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">
                                    {activeSection === 'request' ? 'Request Emergency Support' : 'Join a Donation Session'}
                                </h2>
                                <p className="text-[var(--text-muted)] font-medium mb-12">Provide the details below to initiate your mission. Your contribution is vital.</p>

                                <form className="space-y-8 relative z-10" onSubmit={activeSection === 'request' ? submitRequest : submitDonation}>
                                    {activeSection === 'request' && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Patient Name</label>
                                                <input required type="text" value={reqForm.patientName} onChange={e => setReqForm({...reqForm, patientName: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" placeholder="Recipient's Full Name" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Blood Group Needed</label>
                                                    <select required value={reqForm.bloodGroup} onChange={e => setReqForm({...reqForm, bloodGroup: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)] appearance-none">
                                                        <option value="" disabled>Select Group</option>
                                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Units (Bags)</label>
                                                    <input required type="number" min="1" max="10" value={reqForm.units} onChange={e => setReqForm({...reqForm, units: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Hospital Name</label>
                                                    <input required type="text" value={reqForm.hospitalName} onChange={e => setReqForm({...reqForm, hospitalName: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" placeholder="e.g. City General" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">City Location</label>
                                                    <input required type="text" value={reqForm.city} onChange={e => setReqForm({...reqForm, city: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" placeholder="Location" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 flex items-center gap-2">Contact Number</label>
                                                    <input type="tel" value={reqForm.contactPhone} onChange={e => setReqForm({...reqForm, contactPhone: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" placeholder="Your mobile number" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 flex items-center gap-2">Email <span className="text-[8px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">(Locked)</span></label>
                                                    <input type="email" value={user?.email || ''} readOnly className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none transition-all font-bold text-[var(--text-muted)] opacity-50 cursor-not-allowed" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
                                    {activeSection === 'donate' && (
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Select Donation Session / Camp</label>
                                                <select required value={donForm.campId} onChange={e => setDonForm({...donForm, campId: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)] appearance-none">
                                                    <option value="" disabled>Choose an active session</option>
                                                    {availableCamps.map(camp => (
                                                        <option key={camp.id} value={camp.id}>{camp.name} - {camp.city}</option>
                                                    ))}
                                                </select>
                                                {availableCamps.length === 0 && <p className="text-[10px] text-red-500 font-bold ml-2">No active donation sessions currently available.</p>}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Your Blood Group</label>
                                                    <select required value={donForm.bloodGroup} onChange={e => setDonForm({...donForm, bloodGroup: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)] appearance-none">
                                                        <option value="" disabled>Select Group</option>
                                                        {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => <option key={bg} value={bg}>{bg}</option>)}
                                                    </select>
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 flex items-center gap-2">Current Age <span className="text-[8px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">(Locked)</span></label>
                                                    <input type="text" value={user?.age || 'Not Set'} readOnly className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none transition-all font-bold text-[var(--text-muted)] opacity-50 cursor-not-allowed" />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 flex items-center gap-2">Mobile Number <span className="text-[8px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">(Locked)</span></label>
                                                    <input type="text" value={user?.phone || 'Not Set'} readOnly className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none transition-all font-bold text-[var(--text-muted)] opacity-50 cursor-not-allowed" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 flex items-center gap-2">Email <span className="text-[8px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">(Locked)</span></label>
                                                    <input type="email" value={user?.email || 'Not Set'} readOnly className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none transition-all font-bold text-[var(--text-muted)] opacity-50 cursor-not-allowed" />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Health Declaration</label>
                                                <select required value={donForm.condition} onChange={e => setDonForm({...donForm, condition: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)] appearance-none">
                                                    <option value="None">None (Perfectly Healthy)</option>
                                                    <option value="Diabetes">Diabetes</option>
                                                    <option value="Hypertension">Hypertension</option>
                                                    <option value="Other">Other (Admin will review)</option>
                                                </select>
                                            </div>
                                            {donForm.condition !== 'None' && (
                                                <motion.div initial={{opacity: 0, y: -10}} animate={{opacity: 1, y: 0}} className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-600 p-4 rounded-2xl flex items-start gap-3 mt-4 text-sm font-medium">
                                                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                                    <p>Warning: Selecting a health condition requires a medical review before your donation can be approved. Please make sure your condition is under medical supervision.</p>
                                                </motion.div>
                                            )}
                                        </div>
                                    )}

                                    <button disabled={isLoading} className={`w-full py-6 rounded-2xl font-black brand-font tracking-[0.2em] uppercase transition-all shadow-xl hover:-translate-y-1 ${activeSection === 'request' ? 'bg-red-600 shadow-red-500/30' : 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-[var(--shadow)]'} text-white`}>
                                        {isLoading ? 'INITIATING...' : activeSection === 'request' ? 'SUBMIT EMERGENCY REQUEST' : 'CONFIRM DONATION OFFER'}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* SECTION: EDIT PROFILE */}
                    {activeSection === 'edit-profile' && (
                        <motion.div key="edit-profile" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto py-12">
                            
                            <h2 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">My Sanctuary Profile</h2>
                            <p className="text-[var(--text-muted)] font-medium mb-12">Review your current registered details or propose an update to your public donor identity.</p>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                                
                                {/* Current Profile Summary */}
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-10 rounded-[3.5rem] shadow-xl relative overflow-hidden text-center group transition-all hover:border-[var(--accent)]/30">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-bl-[100%] transition-transform group-hover:scale-125 z-0"></div>
                                    
                                    <div className="relative z-10">
                                        <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-[var(--bg-primary)] border border-white/10 shadow-2xl mb-6 overflow-hidden flex items-center justify-center">
                                            {user?.avatar ? (
                                                <img src={user.avatar} className="w-full h-full object-cover" alt="Profile Avatar" />
                                            ) : (
                                                <AnimatedAvatar size="lg" user={user} />
                                            )}
                                        </div>
                                        <h3 className="text-3xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-1">{user?.name}</h3>
                                        <p className="text-[10px] text-green-400 font-black uppercase tracking-[0.2em] mb-10 flex items-center justify-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                                            Verified Account
                                        </p>
                                        
                                        <div className="space-y-6 text-left border-t border-[var(--border)] pt-8">
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Email Address</span>
                                                <span className="text-sm font-bold text-[var(--text-primary)] truncate">{user?.email}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Mobile Contact</span>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">{user?.phone || 'Not provided'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Location Coordinates</span>
                                                <span className="text-sm font-bold text-[var(--text-primary)]">{user?.city || 'City'}, {user?.state || 'State'}</span>
                                            </div>
                                            
                                            <div className="flex justify-between items-center bg-[var(--bg-primary)] p-6 rounded-3xl border border-[var(--border)] mt-8 group-hover:border-red-500/30 transition-colors">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Blood Group</span>
                                                <span className="text-2xl font-black text-red-500 leading-none">{user?.bloodGroup || 'NA'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Form */}
                                <div className="bg-[var(--bg-secondary)] border border-[var(--border)] p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden lg:col-span-2">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-bl-[100%] z-0"></div>
                                    
                                    <h2 className="text-3xl font-black text-[var(--text-primary)] brand-font mb-2 relative z-10">Propose Changes</h2>
                                    <p className="text-[var(--text-muted)] font-medium mb-10 relative z-10">Changes are reviewed by administrators before being pushed to the public ledger.</p>

                                    <form className="space-y-8 relative z-10" onSubmit={submitEditRequest}>
                                        
                                        <div className="flex flex-col md:flex-row items-center gap-8 mb-8 bg-[var(--bg-primary)] p-6 rounded-[2.5rem] border border-[var(--border)]">
                                            <div className="relative group cursor-pointer shrink-0">
                                                {editForm.avatar ? (
                                                    <img src={editForm.avatar} alt="Avatar Preview" className="w-24 h-24 rounded-[1.5rem] object-cover border-2 border-[var(--border)] group-hover:border-[var(--accent)] transition-all shadow-xl bg-[var(--bg-primary)]" />
                                                ) : (
                                                    <div className="w-24 h-24 rounded-[1.5rem] border-2 border-dashed border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center bg-[var(--bg-primary)] transition-all shadow-xl">
                                                        <AnimatedAvatar size="md" user={user} />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/60 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                    <span className="text-white text-[9px] font-black uppercase tracking-widest text-center px-4">New<br/>Photo</span>
                                                </div>
                                                <input type="file" accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleImageChange} />
                                            </div>
                                            <div className="flex-1 space-y-2 w-full">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">New Name</label>
                                                <input required type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" placeholder="Your Name" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2 flex items-center gap-2">Email Address <span className="text-[8px] text-red-500 bg-red-500/10 px-2 py-0.5 rounded font-black tracking-widest uppercase">(Locked)</span></label>
                                                <input type="email" value={user?.email || ''} readOnly className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 outline-none transition-all font-bold text-[var(--text-muted)] opacity-50 cursor-not-allowed" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">Mobile Number</label>
                                                <input type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" placeholder="+1 234 567 8900" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">City</label>
                                                <input type="text" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" placeholder="E.g. Nexus City" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-2">State / Region</label>
                                                <input type="text" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl px-6 py-4 focus:ring-4 focus:ring-[var(--accent)]/10 focus:border-[var(--accent)] outline-none transition-all font-bold text-[var(--text-primary)]" placeholder="E.g. Sector 7" />
                                            </div>
                                        </div>

                                        <button disabled={isLoading} className="w-full py-6 rounded-2xl font-black brand-font tracking-[0.2em] uppercase transition-all shadow-xl hover:-translate-y-1 bg-[var(--accent)] text-white shadow-red-500/30 mt-4">
                                            {isLoading ? 'SUBMITTING TO NEXUS...' : 'SUBMIT PROFILE FOR REVIEW'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Support Modal */}
            <SupportPanel isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} />
        </div>
    );
};

export default UserDashboard;
