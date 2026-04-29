/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity, Users, FileText, CheckCircle,
    Clock3, MapPin, Building2, Calendar, Trash2, Mail,
    Phone, Droplet, User, HandHeart, UserCheck, MessageSquare, Send
} from 'lucide-react';

import api from '../lib/api';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon, color, glowColor }) => (
    <motion.div 
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-[var(--bg-card)] backdrop-blur-3xl p-8 rounded-[3rem] border border-[var(--border)] shadow-2xl relative overflow-hidden group transition-all duration-500"
    >
        <div className={`absolute top-0 right-0 w-32 h-32 ${glowColor} blur-[60px] opacity-0 group-hover:opacity-20 transition-opacity duration-700`}></div>
        <div className="relative z-10">
            <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center mb-6 shadow-2xl group-hover:rotate-6 transition-transform duration-500`}>
                {Icon && <Icon className="w-7 h-7 text-white" />}
            </div>
            <p className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-[0.4em] mb-1">{label}</p>
            <h2 className="text-5xl font-black text-[var(--text-primary)] brand-font tracking-tight flex items-baseline gap-2">
                {value ?? '–'}
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">{label === 'Blood Stock' ? 'Units' : 'Active'}</span>
            </h2>
        </div>
    </motion.div>
);

const AdminDashboard = () => {
    // const { user } = useAuthStore();
    const [activeSection, setActiveSection] = useState('monitor');
    const [stats, setStats] = useState({});
    const [bloodStock, setBloodStock] = useState({});
    const [requests, setRequests] = useState([]);
    const [pendingDonations, setPendingDonations] = useState([]);
    const [pendingCamps, setPendingCamps] = useState([]);
    const [users, setUsers] = useState([]);
    const [orgs, setOrgs] = useState([]);
    const [profileEdits, setProfileEdits] = useState([]);
    const [supportMessages, setSupportMessages] = useState([]);
    const [replyTexts, setReplyTexts] = useState({});
    const [isLoading, setIsLoading] = useState(false);


    const fetchDashboardData = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/dashboard');
            if (res.data.status === 'success') {
                setStats(res.data.data);
                setBloodStock(res.data.data.stock || {});
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/requests/pending');
            if (res.data.status === 'success') setRequests(res.data.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchPendingDonations = useCallback(async () => {
        const res = await api.get('/admin/donations/pending');
        if (res.data.status === 'success') setPendingDonations(res.data.data);
    }, []);

    const fetchPendingCamps = useCallback(async () => {
        const res = await api.get('/admin/camps/pending');
        if (res.data.status === 'success') setPendingCamps(res.data.camps);
    }, []);

    const fetchUsers = useCallback(async () => {
        try {
            console.log('Fetching users from /admin/users...');
            const res = await api.get('/admin/users');
            console.log('Users response:', res.data);
            if (res.data.status === 'success') {
                setUsers(res.data.users);
                console.log('Users set in state:', res.data.users);
            } else {
                console.error('Failed to fetch users:', res.data.message);
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            console.error('Error response:', error.response?.data);
        }
    }, []);

    const fetchOrgs = useCallback(async () => {
        const res = await api.get('/admin/organizations');
        if (res.data.status === 'success') setOrgs(res.data.orgs);
    }, []);

    const fetchProfileEdits = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/admin/profile-edits');
            if (res.data.status === 'success') setProfileEdits(res.data.data);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchSupportMessages = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await api.get('/support/admin');
            if (res.data.status === 'success') setSupportMessages(res.data.data);
        } finally {
            setIsLoading(false);
        }
    }, []);


    // Global dashboard stats polling (for sidebar badges)
    // Runs on mount and every 30 seconds
    useEffect(() => {
        // Initial fetch inside a timeout to avoid synchronous setState warning
        const timer = setTimeout(() => {
            fetchDashboardData();
        }, 0);
        
        const interval = setInterval(() => {
            fetchDashboardData();
        }, 30000);
        
        return () => {
            clearTimeout(timer);
            clearInterval(interval);
        };
    }, [fetchDashboardData]);

    useEffect(() => {
        const loaders = {
            monitor: fetchDashboardData,
            requests: fetchRequests,
            donations: fetchPendingDonations,
            camps: fetchPendingCamps,
            users: fetchUsers,
            organizations: fetchOrgs,
            'profile-edits': fetchProfileEdits,
            support: fetchSupportMessages,
        };

        const load = loaders[activeSection];
        if (load) {
            load().catch(() => toast.error('Failed to load data'));
        }
    }, [activeSection, fetchDashboardData, fetchRequests, fetchPendingDonations, fetchPendingCamps, fetchUsers, fetchOrgs, fetchProfileEdits, fetchSupportMessages]);

    const handleRequestAction = async (id, status) => {
        try {
            await api.put(`/admin/requests/${id}`, { status });
            toast.success(`Request ${status.toLowerCase()}.`);
            fetchRequests();
            fetchDashboardData(); // Update badges instantly
        } catch { toast.error('Action failed'); }
    };

    const handleDonationAction = async (id, status) => {
        try {
            await api.put(`/admin/donations/${id}`, { status });
            toast.success(`Donation offer ${status.toLowerCase()}.`);
            fetchPendingDonations();
            fetchDashboardData(); // Update badges instantly
        } catch { toast.error('Action failed'); }
    };

    const handleCampAction = async (id, status) => {
        try {
            const note = status === 'REJECTED' ? prompt('Rejection reason (optional):') : null;
            await api.put(`/admin/camps/${id}`, { status, adminNote: note });
            toast.success(`Camp ${status.toLowerCase()}.`);
            fetchPendingCamps();
            fetchDashboardData(); // Update badges instantly
        } catch { toast.error('Action failed'); }
    };

    const handleRemoveUser = async (id, name) => {
        if (!confirm(`Remove "${name}" from LifeFlow? This cannot be undone.`)) return;
        try {
            await api.delete(`/admin/users/${id}`);
            toast.success(`${name} removed.`);
            // Refresh whichever list we're on
            if (activeSection === 'users') fetchUsers();
            else fetchOrgs();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to remove user');
        }
    };

    const handleProfileEditAction = async (id, status) => {
        try {
            await api.put(`/admin/profile-edits/${id}`, { status });
            toast.success(`Profile edit ${status.toLowerCase()}.`);
            fetchProfileEdits();
        } catch { toast.error('Action failed'); }
    };

    const handleSupportReply = async (id) => {
        const reply = replyTexts[id];
        if (!reply) return toast.error('Please enter a reply');
        try {
            setIsLoading(true);
            await api.put(`/support/reply/${id}`, { adminReply: reply });
            toast.success('Reply sent successfully');
            setReplyTexts(prev => ({ ...prev, [id]: '' }));
            fetchSupportMessages();
        } catch (error) {
            toast.error('Failed to send reply');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSupportResolve = async (id) => {
        try {
            setIsLoading(true);
            await api.put(`/support/resolve/${id}`);
            toast.success('Message marked as resolved');
            fetchSupportMessages();
        } catch (error) {
            toast.error('Failed to resolve message');
        } finally {
            setIsLoading(false);
        }
    };


    const tabVars = {
        hidden:  { opacity: 0, y: 16 },
        visible: { opacity: 1, y: 0,  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
        exit:    { opacity: 0, y: -12, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }
    };
    useEffect(() => {
        if (activeSection === 'support') {
            const markRead = async () => {
                try {
                    await api.put('/support/mark-read-admin');
                    // Update local state to hide badges immediately
                    setSupportMessages(prev => prev.map(m => ({ ...m, isReadByAdmin: true })));
                } catch (error) {
                    console.error('Failed to mark admin support as read:', error);
                }
            };
            markRead();
        }
    }, [activeSection]);

    const navItems = [
        { id: 'monitor', icon: Activity, label: 'Live Monitor' },
        { id: 'requests', icon: FileText, label: 'Blood Requests', showBadge: (stats.pendingRequests || 0) > 0 },
        { id: 'donations', icon: HandHeart, label: 'Donation Offers', showBadge: (stats.pendingDonations || 0) > 0 },
        { id: 'camps', icon: MapPin, label: 'Camp Approvals', showBadge: (stats.pendingCamps || 0) > 0 },
        { id: 'profile-edits', icon: UserCheck, label: 'Profile Edits', showBadge: (stats.pendingProfileEdits || 0) > 0 },
        { id: 'support', icon: MessageSquare, label: 'User Support', showBadge: (stats.pendingSupport || 0) > 0 },
        { id: 'users', icon: User, label: 'Users' },
        { id: 'organizations', icon: Building2, label: 'Organizations' },

    ];

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col md:flex-row relative overflow-hidden selection:bg-[#dc143c]/30 selection:text-white">
            {/* Cinematic Background */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,_#dc143c15,_transparent)]"></div>
            </div>

            {/* Sidebar - Floating Nexus Pillar */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 30, stiffness: 100 }}
                className="w-full md:w-80 bg-[var(--bg-card)] backdrop-blur-3xl border-r border-[var(--border)] p-8 flex flex-col z-20 relative overflow-y-auto custom-scrollbar"
            >
                <div className="mb-12 px-2">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#dc143c] to-[#9b0023] rounded-2xl flex items-center justify-center shadow-[0_10px_30px_rgba(220,20,60,0.3)] rotate-3">
                             <Activity className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-[var(--text-primary)] brand-font tracking-tighter uppercase leading-none">Nexus</h2>
                            <p className="text-[8px] text-[#dc143c] font-black uppercase tracking-[0.4em] mt-1">Core Command</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl bg-[var(--bg-primary)] border border-[var(--border)] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-16 h-16 bg-[#dc143c]/10 rounded-bl-full blur-xl"></div>
                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] mb-2">Current System Op</p>
                        <p className="text-sm font-black text-[var(--text-primary)] tracking-tight">Admin Terminal 01</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2">
                    {navItems.map(item => {
                        const isActive = activeSection === item.id;
                        return (
                            <button 
                                key={item.id} 
                                onClick={() => setActiveSection(item.id)}
                                className={`flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group relative
                                    ${isActive 
                                        ? 'text-white shadow-[0_15px_40px_rgba(220,20,60,0.2)] scale-[1.02]' 
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]'}`}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="adminSidebarActive"
                                        className="absolute inset-0 rounded-2xl bg-[#dc143c]"
                                        style={{ zIndex: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                                    />
                                )}
                                <div className="flex items-center gap-4 relative z-10">
                                    <item.icon className={`w-5 h-5 transition-transform duration-500 ${isActive ? 'rotate-0' : 'group-hover:scale-110'}`} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">{item.label}</span>
                                </div>
                                {item.showBadge && (
                                    <div className="relative flex h-2 w-2 z-10">
                                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isActive ? 'bg-white' : 'bg-[#dc143c]'}`}></span>
                                        <span className={`relative inline-flex rounded-full h-2 w-2 ${isActive ? 'bg-white' : 'bg-[#dc143c]'}`}></span>
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </nav>

                <div className="mt-auto pt-8 border-t border-[var(--border)]">
                    <button className="w-full p-5 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/5 transition-all text-[9px] font-black uppercase tracking-[0.3em]">
                        Emergency Override
                    </button>
                </div>
            </motion.div>

            {/* Main Content */}
            <div className="flex-grow p-6 md:p-12 z-10 relative overflow-auto">
                <AnimatePresence mode="wait">

                    {/* MONITOR */}
                    {activeSection === 'monitor' && (
                        <motion.div key="monitor" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-7xl mx-auto py-4">
                            <div className="mb-12">
                                <h1 className="text-5xl md:text-7xl font-black text-[var(--text-primary)] brand-font mb-4 tracking-tighter">Nexus Monitor<span className="text-[#dc143c]">.</span></h1>
                                <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.5em] text-[10px]">Real-time infrastructure overview & global supply nodes</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-20">
                                <StatCard label="Donors" value={stats.totalUsers} icon={Users} color="bg-blue-600" glowColor="bg-blue-500" />
                                <StatCard label="Orgs" value={stats.totalOrgs} icon={Building2} color="bg-indigo-600" glowColor="bg-indigo-500" />
                                <StatCard label="Pending Requests" value={stats.pendingRequests} icon={Clock3} color="bg-amber-600" glowColor="bg-amber-500" />
                                <StatCard label="Pending Camps" value={stats.pendingCamps} icon={MapPin} color="bg-[var(--accent)]" glowColor="bg-[var(--accent)]" />
                                <StatCard label="Approved Camps" value={stats.approvedCamps} icon={CheckCircle} color="bg-emerald-600" glowColor="bg-emerald-500" />
                            </div>
                            
                            <div className="flex items-center gap-6 mb-12">
                                <div className="w-16 h-px bg-[var(--border)]"></div>
                                <h3 className="font-black text-[var(--text-primary)] uppercase tracking-[0.4em] text-xs">Vital Reserve Inventory</h3>
                                <div className="flex-grow h-px bg-[var(--border)]"></div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-6">                                 {Object.entries(bloodStock).map(([bg, qty], idx) => (
                                    <motion.div 
                                        key={bg} 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: idx * 0.05 }}
                                        whileHover={{ y: -8, backgroundColor: 'var(--bg-primary)' }}
                                        className="bg-[var(--bg-card)] backdrop-blur-2xl rounded-[2.5rem] border border-[var(--border)] p-8 text-center shadow-2xl transition-all group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <div className="relative z-10">
                                            <div className="text-[#dc143c] font-black text-3xl brand-font mb-4 drop-shadow-[0_0_10px_rgba(220,20,60,0.5)]">{bg}</div>
                                            <div className="text-5xl font-black text-[var(--text-primary)] tracking-tighter mb-2 group-hover:scale-110 transition-transform duration-500">{qty}</div>
                                            <div className="text-[10px] text-[var(--text-muted)] uppercase font-black tracking-widest">Units</div>
                                        </div>
                                    </motion.div>
                                ))}

                            </div>
                        </motion.div>
                    )}

                    {/* BLOOD REQUESTS */}
                    {activeSection === 'requests' && (
                        <motion.div key="requests" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-5xl mx-auto py-4">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Blood Requests<span className="text-[#dc143c]">.</span></h1>
                            <p className="text-[var(--text-muted)] mb-12 font-bold uppercase tracking-[0.3em] text-[10px]">Approve or reject incoming emergency stock requests</p>
                            
                            <div className="grid gap-6">
                                {isLoading ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Synchronizing Nexus Pulse...</div>
                                ) : requests.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-3xl p-20 rounded-[3rem] border border-[var(--border)] text-center shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/5 to-transparent"></div>
                                        <div className="w-24 h-24 bg-[var(--bg-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border)] shadow-2xl">
                                            <FileText className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.4em] text-xs">Zero Pending Uplinks</p>
                                    </div>
                                ) : (
                                    requests.map(req => (
                                        <motion.div 
                                            key={req.id} 
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            className="bg-[var(--bg-card)] backdrop-blur-3xl p-10 rounded-[3rem] border border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-10 hover:border-[#dc143c]/40 transition-all group shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-48 h-48 bg-[#dc143c]/5 rounded-bl-[100%] z-0 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="flex items-center gap-10 relative z-10 w-full md:w-auto">
                                                <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-[2rem] flex flex-col items-center justify-center border border-[var(--border)] group-hover:border-[#dc143c] shadow-2xl transition-all shrink-0">
                                                    <span className="text-[#dc143c] font-black text-4xl leading-none tracking-tighter drop-shadow-[0_0_8px_rgba(220,20,60,0.4)]">{req.bloodGroup}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-2">Group</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none">{req.hospitalName}</h3>
                                                    <div className="flex flex-wrap gap-6 items-center">
                                                        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                                                            <MapPin className="w-4 h-4 text-[#dc143c]" /> {req.city}
                                                        </span>
                                                        <span className="flex items-center gap-2 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                                                            <Droplet className="w-4 h-4 text-[#dc143c]" /> {req.units} Units
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 w-full md:w-auto relative z-10">
                                                <button onClick={() => handleRequestAction(req.id, 'REJECTED')}
                                                    className="flex-grow md:flex-none px-10 py-5 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all whitespace-nowrap">
                                                    Abort
                                                </button>
                                                <button onClick={() => handleRequestAction(req.id, 'APPROVED')}
                                                    className="flex-grow md:flex-none px-14 py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all whitespace-nowrap">
                                                    Authorize
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* DONATION OFFERS */}
                    {activeSection === 'donations' && (
                        <motion.div key="donations" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-5xl mx-auto py-4">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Donation Pipeline<span className="text-[#dc143c]">.</span></h1>
                            <p className="text-[var(--text-muted)] mb-12 font-bold uppercase tracking-[0.3em] text-[10px]">Verify and intake new community contributions</p>
                            
                            <div className="grid gap-6">
                                {isLoading ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Decoding Bio-Signals...</div>
                                ) : pendingDonations.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-3xl p-20 rounded-[3rem] border border-[var(--border)] text-center shadow-2xl">
                                        <div className="w-24 h-24 bg-[var(--bg-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border)] shadow-2xl">
                                            <HandHeart className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.4em] text-xs">No active intake streams</p>
                                    </div>
                                ) : (
                                    pendingDonations.map(don => (
                                        <motion.div 
                                            key={don.id} 
                                            whileHover={{ scale: 1.01, x: 5 }}
                                            className="bg-[var(--bg-card)] backdrop-blur-3xl p-10 rounded-[3rem] border border-[var(--border)] flex flex-col md:flex-row justify-between items-center gap-10 hover:border-[#dc143c]/40 transition-all group shadow-2xl relative overflow-hidden"
                                        >
                                            <div className="flex items-center gap-10 relative z-10 w-full md:w-auto">
                                                <div className="w-24 h-24 bg-[var(--bg-primary)] rounded-[2rem] flex flex-col items-center justify-center border border-[var(--border)] group-hover:border-[#dc143c] shadow-2xl transition-all shrink-0">
                                                    <span className="text-[#dc143c] font-black text-4xl leading-none tracking-tighter drop-shadow-[0_0_8px_rgba(220,20,60,0.4)]">{don.bloodGroup}</span>
                                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mt-2">Type</span>
                                                </div>
                                                <div className="space-y-3">
                                                    <h3 className="text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none">{don.user?.name || 'Anonymous Donor'}</h3>
                                                    <div className="flex flex-wrap gap-6 items-center">
                                                        <span className="px-4 py-2 bg-[var(--bg-secondary)] rounded-xl text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em]">
                                                            Age: {don.age}
                                                        </span>
                                                        <span className="px-4 py-2 bg-[var(--bg-secondary)] rounded-xl text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em]">
                                                            Cond: {don.condition || 'Verified'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex gap-4 w-full md:w-auto relative z-10">
                                                <button onClick={() => handleDonationAction(don.id, 'REJECTED')}
                                                    className="flex-grow md:flex-none px-10 py-5 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all whitespace-nowrap">
                                                    Decline
                                                </button>
                                                <button onClick={() => handleDonationAction(don.id, 'APPROVED')}
                                                    className="flex-grow md:flex-none px-14 py-5 rounded-2xl bg-[var(--text-primary)] text-[var(--bg-primary)] font-black text-[10px] uppercase tracking-[0.3em] shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:-translate-y-1 transition-all whitespace-nowrap">
                                                    Ingest
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}
                    {/* CAMP OPERATIONS */}
                    {activeSection === 'camps' && (
                        <motion.div key="camps" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto py-4">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Camp Operations<span className="text-[#dc143c]">.</span></h1>
                            <p className="text-[var(--text-muted)] mb-12 font-bold uppercase tracking-[0.3em] text-[10px]">Coordinate and authorize regional donation infrastructure</p>
                            
                            <div className="grid gap-10">
                                {isLoading ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Triangulating Global Nodes...</div>
                                ) : pendingCamps.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 backdrop-blur-3xl p-20 rounded-[3rem] border border-[var(--border)] text-center shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/5 to-transparent"></div>
                                        <div className="w-24 h-24 bg-[var(--bg-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border)] shadow-2xl">
                                            <MapPin className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.4em] text-xs">Zero Pending Deployments</p>
                                    </div>
                                ) : (
                                    pendingCamps.map(camp => (
                                        <motion.div 
                                            key={camp.id} 
                                            whileHover={{ scale: 1.01 }}
                                            className="bg-[var(--bg-card)]/60 backdrop-blur-3xl p-12 rounded-[4rem] border border-[var(--border)] shadow-[0_30px_60px_rgba(0,0,0,0.4)] relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#dc143c]/5 rounded-bl-full z-0 blur-[100px]"></div>
                                            <div className="relative z-10">
                                                <div className="flex justify-between items-start flex-wrap gap-8 mb-12">
                                                    <div>
                                                        <h3 className="text-4xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-3">{camp.name}</h3>
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-3 h-3 rounded-full bg-[#dc143c] animate-pulse shadow-[0_0_12px_#dc143c]"></div>
                                                            <p className="text-[10px] text-[#dc143c] font-black uppercase tracking-[0.3em]">
                                                                Commanded by {camp.organization?.orgName || camp.organization?.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <span className="px-6 py-3 bg-[var(--bg-secondary)] text-[var(--text-muted)] border border-[var(--border)] rounded-2xl text-[10px] font-black uppercase tracking-[0.3em]">
                                                        Strategic Review
                                                    </span>
                                                </div>
                                                
                                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Temporal Window</p>
                                                        <div className="flex items-center gap-3 text-[var(--text-primary)] font-black text-sm">
                                                            <Calendar className="w-5 h-5 text-[#dc143c]" />
                                                            {(() => {
                                                                const d = new Date(camp.date);
                                                                return (camp.date && !isNaN(d.getTime())) ? d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA';
                                                            })()}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Active Shift</p>
                                                        <div className="flex items-center gap-3 text-[var(--text-primary)] font-black text-sm">
                                                            <Clock3 className="w-5 h-5 text-[#dc143c]" />
                                                            {camp.startTime} – {camp.endTime}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Zone</p>
                                                        <div className="flex items-center gap-3 text-[var(--text-primary)] font-black text-sm">
                                                            <MapPin className="w-5 h-5 text-[#dc143c]" />
                                                            {camp.city}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-2">
                                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-widest">Throughput</p>
                                                        <div className="flex items-center gap-3 text-[var(--text-primary)] font-black text-sm">
                                                            <Users className="w-5 h-5 text-[#dc143c]" />
                                                            {camp.totalSlots} Potential Units
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                <div className="bg-[var(--bg-secondary)]/50 border border-[var(--border)] p-8 rounded-[2rem] mb-12">
                                                    <p className="text-xs text-[var(--text-secondary)] leading-relaxed font-bold tracking-tight italic">"{camp.address}"</p>
                                                </div>
 
                                                <div className="flex flex-col md:flex-row gap-6">
                                                    <button onClick={() => handleCampAction(camp.id, 'APPROVED')}
                                                        className="flex-grow bg-[var(--text-primary)] text-[var(--bg-primary)] px-12 py-6 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] shadow-2xl hover:-translate-y-1 transition-all">
                                                        Authorize Deployment
                                                    </button>
                                                    <button onClick={() => handleCampAction(camp.id, 'REJECTED')}
                                                        className="px-12 py-6 rounded-3xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[11px] uppercase tracking-[0.3em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all">
                                                        Deny Access
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* PROFILE EDITS */}
                    {activeSection === 'profile-edits' && (
                        <motion.div key="profile-edits" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto py-4">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Profile Validation<span className="text-[#dc143c]">.</span></h1>
                            <p className="text-[var(--text-muted)] mb-12 font-bold uppercase tracking-[0.3em] text-[10px]">Verify and authorize subject identity modifications</p>
                            
                            <div className="grid gap-8">
                                {isLoading ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Scanning Bio-Profiles...</div>
                                ) : profileEdits.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 p-24 rounded-[4rem] border border-[var(--border)] text-center shadow-2xl">
                                        <UserCheck className="w-20 h-20 mx-auto mb-8 text-[var(--text-muted)]" />
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.4em] text-xs">Identity Buffer Clear</p>
                                    </div>
                                ) : (
                                    profileEdits.map(req => {
                                        let proposed = {};
                                        try {
                                            proposed = typeof req.proposedData === 'string' ? JSON.parse(req.proposedData) : req.proposedData || {};
                                        } catch(e) { console.error('Error parsing JSON for proposedData', e); }
                                        return (
                                        <motion.div 
                                            key={req.id} 
                                            whileHover={{ scale: 1.01 }}
                                            className="bg-[var(--bg-card)]/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-[var(--border)] hover:border-[#dc143c]/30 transition-all group shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-10 items-center justify-between"
                                        >
                                            <div className="flex flex-col md:flex-row gap-10 items-center w-full lg:w-auto">
                                                <div className="flex gap-6 items-center shrink-0">
                                                    <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                                        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-primary)] border border-red-500/20 overflow-hidden mb-3 shadow-2xl">
                                                            {req.user?.avatar ? <img src={req.user.avatar} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-6 text-[var(--text-muted)]"/>}
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-red-500/60">Legacy</span>
                                                    </div>
                                                    <div className="w-12 h-px bg-gradient-to-r from-red-500/20 to-green-500/20"></div>
                                                    <div className="text-center group-hover:scale-105 transition-transform duration-500">
                                                        <div className="w-20 h-20 rounded-3xl bg-[var(--bg-primary)] border border-emerald-500/40 overflow-hidden mb-3 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                                                             {proposed.avatar ? <img src={proposed.avatar} className="w-full h-full object-cover" /> : <User className="w-8 h-8 m-6 text-[var(--text-muted)]"/>}
                                                        </div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500/60">Target</span>
                                                    </div>
                                                </div>

                                                <div className="space-y-4 flex-grow min-w-0">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--border)]">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Subject Name</p>
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-sm font-bold text-[var(--text-muted)] line-through opacity-50">{req.user?.name}</p>
                                                                {proposed.name && proposed.name !== req.user?.name && (
                                                                    <p className="text-sm font-black text-emerald-400 tracking-tight"> {proposed.name}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="bg-[var(--bg-secondary)]/50 p-4 rounded-2xl border border-[var(--border)]">
                                                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-2">Contact Vector</p>
                                                            <div className="flex flex-col gap-1">
                                                                <p className="text-sm font-bold text-[var(--text-muted)] opacity-50">{req.user?.phone || 'NULL'}</p>
                                                                {proposed.phone && proposed.phone !== req.user?.phone && (
                                                                    <p className="text-sm font-black text-emerald-400 tracking-tight"> {proposed.phone}</p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex gap-4 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-[var(--border)] pt-8 lg:pt-0 lg:pl-10">
                                                <button onClick={() => handleProfileEditAction(req.id, 'REJECTED')}
                                                    className="flex-grow lg:flex-none px-10 py-5 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30 transition-all">
                                                    Discard
                                                </button>
                                                <button onClick={() => handleProfileEditAction(req.id, 'APPROVED')}
                                                    className="flex-grow lg:flex-none px-12 py-5 rounded-2xl bg-emerald-600 text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:-translate-y-1 transition-all">
                                                    Commit
                                                </button>
                                            </div>
                                        </motion.div>
                                        );
                                    })
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* USERS */}
                    {activeSection === 'users' && (
                        <motion.div key="users" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-7xl mx-auto py-4">
                            <div className="flex justify-between items-end mb-16">
                                <div>
                                    <h1 className="text-5xl font-black text-[var(--text-primary)] brand-font mb-3">Subject Registry<span className="text-[#dc143c]">.</span></h1>
                                    <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.4em] text-[10px]">Directory of all authenticated life-donors</p>
                                </div>
                                <button onClick={fetchUsers} className="w-16 h-16 rounded-3xl bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] flex items-center justify-center hover:bg-[#dc143c] hover:text-white transition-all group shadow-2xl">
                                    <Activity className={`w-6 h-6 transition-all duration-700 ${isLoading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                                </button>
                            </div>
                            
                            {isLoading ? (
                                <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Accessing Core Databases...</div>
                             ) : users.length === 0 ? (
                                <div className="bg-[var(--bg-secondary)]/50 p-24 rounded-[4rem] border border-[var(--border)] text-center shadow-2xl">
                                    <Users className="w-20 h-20 mx-auto mb-8 text-[var(--text-muted)]" />
                                    <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.4em] text-xs">Registry is Currently Null</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {users.map(u => (
                                        <motion.div 
                                            key={u.id} 
                                            whileHover={{ y: -10, backgroundColor: 'var(--bg-secondary)' }}
                                            className="bg-[var(--bg-card)]/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-[var(--border)] transition-all group relative overflow-hidden shadow-2xl"
                                        >
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="w-16 h-16 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center border border-[var(--border)] group-hover:border-[#dc143c] transition-all duration-500 shadow-2xl">
                                                    <User className="w-7 h-7 text-[var(--text-muted)] group-hover:text-[var(--text-primary)]" />
                                                </div>
                                                <button onClick={() => handleRemoveUser(u.id, u.name)}
                                                    className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-2xl">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <h3 className="text-2xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-6">{u.name}</h3>
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] truncate">
                                                    <Mail className="w-4 h-4 text-[#dc143c]" /> {u.email}
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                                                    <Droplet className="w-4 h-4 text-[#dc143c]" /> Factor: {u.bloodGroup || 'UNK'}
                                                </div>
                                            </div>
                                            <div className="mt-10 pt-8 border-t border-[var(--border)] flex justify-between items-center">
                                                <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Protocol</span>
                                                <span className="px-4 py-1.5 bg-blue-500/10 text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-blue-500/20">Active Donor</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ORGANIZATIONS */}
                    {activeSection === 'organizations' && (
                        <motion.div key="organizations" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-7xl mx-auto py-4">
                           <div className="mb-16">
                                <h1 className="text-5xl font-black text-[var(--text-primary)] brand-font mb-3">Nexus Partners<span className="text-[#dc143c]">.</span></h1>
                                <p className="text-[var(--text-muted)] font-bold uppercase tracking-[0.4em] text-[10px]">Management of collaborating clinical nodes & supply centers</p>
                            </div>
                            
                            {isLoading ? (
                                <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Establishing Secure Uplinks...</div>
                            ) : orgs.length === 0 ? (
                                <div className="bg-[var(--bg-secondary)]/50 p-24 rounded-[4rem] border border-[var(--border)] text-center shadow-2xl relative overflow-hidden">
                                    <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/5 to-transparent"></div>
                                    <div className="w-24 h-24 bg-[var(--bg-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border)] shadow-2xl">
                                        <Building2 className="w-10 h-10 text-[var(--text-muted)]" />
                                    </div>
                                    <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.4em] text-xs">Partner Network Empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                    {orgs.map(org => (
                                        <motion.div 
                                            key={org.id} 
                                            whileHover={{ y: -10, backgroundColor: 'var(--bg-secondary)' }}
                                            className="bg-[var(--bg-card)]/60 backdrop-blur-3xl p-10 rounded-[3rem] border border-[var(--border)] transition-all group relative overflow-hidden shadow-2xl"
                                        >
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="w-16 h-16 bg-[var(--bg-primary)] rounded-2xl flex items-center justify-center border border-[var(--border)] group-hover:border-indigo-500 transition-all duration-500 shadow-2xl">
                                                    <Building2 className="w-7 h-7 text-[var(--text-muted)] group-hover:text-indigo-500" />
                                                </div>
                                                <button onClick={() => handleRemoveUser(org.id, org.orgName || org.name)}
                                                    className="w-12 h-12 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 flex items-center justify-center shadow-2xl">
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                            <h3 className="text-2xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-2 truncate">{org.orgName || org.name}</h3>
                                            <p className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.2em] mb-8">Clinical Authority</p>
                                            
                                            <div className="space-y-5">
                                                <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em] truncate">
                                                    <Mail className="w-4 h-4 text-indigo-500" /> {org.email}
                                                </div>
                                                <div className="flex items-center gap-4 text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                                                    <Phone className="w-4 h-4 text-indigo-500" /> {org.orgPhone || 'N/A'}
                                                </div>
                                                <div className="flex items-start gap-4 text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.1em] leading-relaxed italic">
                                                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" /> {org.orgAddress}
                                                </div>
                                            </div>
                                            <div className="mt-10 pt-8 border-t border-[var(--border)] flex justify-between items-center">
                                                <span className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest">Protocol</span>
                                                <span className="px-4 py-1.5 bg-indigo-500/10 text-indigo-400 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.15)]">Authenticated Node</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* USER SUPPORT */}
                    {activeSection === 'support' && (
                        <motion.div key="support" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto py-4">
                            <h1 className="text-4xl font-black text-[var(--text-primary)] brand-font mb-2">Comms Center<span className="text-[#dc143c]">.</span></h1>
                            <p className="text-[var(--text-muted)] mb-12 font-bold uppercase tracking-[0.3em] text-[10px]">Resolve emergency inquiries & technical anomalies</p>
                            
                            <div className="grid gap-10">
                                {isLoading && supportMessages.length === 0 ? (
                                    <div className="py-20 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.5em] text-[10px] animate-pulse">Filtering Sub-Space Signals...</div>
                                ) : supportMessages.length === 0 ? (
                                    <div className="bg-[var(--bg-secondary)]/50 p-24 rounded-[4rem] border border-[var(--border)] text-center shadow-2xl relative overflow-hidden">
                                        <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/5 to-transparent"></div>
                                        <div className="w-24 h-24 bg-[var(--bg-primary)]/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-[var(--border)] shadow-2xl">
                                            <MessageSquare className="w-10 h-10 text-[var(--text-muted)]" />
                                        </div>
                                        <p className="text-[var(--text-muted)] font-black uppercase tracking-[0.4em] text-xs">Channels Nominal - No Incoming Data</p>
                                    </div>
                                ) : (
                                    supportMessages.map(msg => (
                                        <motion.div 
                                            key={msg.id} 
                                            whileHover={{ scale: 1.01 }}
                                            className="bg-[var(--bg-card)]/60 backdrop-blur-3xl p-10 md:p-14 rounded-[4rem] border border-[var(--border)] hover:border-[#dc143c]/30 transition-all group relative overflow-hidden shadow-[0_40px_80px_rgba(0,0,0,0.5)]"
                                        >
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#dc143c]/5 rounded-bl-full z-0 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                            <div className="flex flex-col lg:flex-row gap-12 justify-between relative z-10">
                                                <div className="space-y-8 flex-1">
                                                    <div className="flex items-center gap-6">
                                                        <div className="w-16 h-16 rounded-[2rem] bg-[var(--bg-primary)] border border-[var(--border)] overflow-hidden flex items-center justify-center shadow-2xl group-hover:border-[#dc143c] transition-all">
                                                            {msg.user?.avatar ? <img src={msg.user.avatar} className="w-full h-full object-cover" /> : <User className="w-7 h-7 text-[var(--text-muted)]" />}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-3xl font-black text-[var(--text-primary)] brand-font tracking-tight mb-1">{msg.user?.name}</h3>
                                                            <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">{msg.user?.email}</p>
                                                        </div>
                                                        <span className={`ml-auto lg:ml-6 px-6 py-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border ${msg.status === 'OPEN' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : msg.status === 'REPLIED' ? 'bg-green-500/10 text-green-500 border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]' : 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}>
                                                            {msg.status}
                                                        </span>
                                                    </div>
 
                                                    <div className="bg-[var(--bg-primary)] p-8 rounded-[2.5rem] border border-[var(--border)] group-hover:border-[var(--text-muted)]/10 transition-colors relative overflow-hidden">
                                                        <div className="absolute top-0 left-0 w-1 h-full bg-[#dc143c]/30"></div>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dc143c] mb-4">Transmission Payload</p>
                                                        <p className="text-[11px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-3 italic">Subject: {msg.subject}</p>
                                                        <p className="text-base font-bold text-[var(--text-secondary)] leading-relaxed italic">"{msg.message}"</p>
                                                    </div>
 
                                                    {msg.adminReply && (
                                                        <motion.div 
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className="bg-[var(--bg-primary)] p-8 rounded-[2.5rem] border border-emerald-500/20 ml-12 relative shadow-2xl"
                                                        >
                                                            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/30"></div>
                                                            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-emerald-500 mb-2">Admin Strategy</p>
                                                            <p className="text-sm font-bold text-[var(--text-primary)] leading-relaxed italic">"{msg.adminReply}"</p>
                                                        </motion.div>
                                                    )}
                                                </div>
 
                                                <div className="lg:w-96 space-y-6 shrink-0 lg:border-l lg:border-[var(--border)] lg:pl-12">
                                                    <div className="space-y-4">
                                                        <div className="flex justify-between items-center px-4">
                                                            <label className="text-[9px] font-black uppercase tracking-widest text-[var(--text-muted)]">Response Buffer</label>
                                                            <Activity className="w-3.5 h-3.5 text-[#dc143c] animate-pulse" />
                                                        </div>
                                                        <textarea 
                                                            rows={6}
                                                            placeholder="Synthesize reply..."
                                                            className="w-full bg-[var(--bg-primary)] border border-[var(--border)] rounded-[2rem] p-6 text-sm font-bold text-[var(--text-primary)] resize-none focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 outline-none transition-all shadow-inner placeholder:text-[var(--text-muted)]"
                                                            value={replyTexts[msg.id] || ''}
                                                            onChange={(e) => setReplyTexts(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                                        />
                                                    </div>
                                                    <div className="flex gap-4">
                                                        <button 
                                                            onClick={() => handleSupportReply(msg.id)}
                                                            className="flex-1 bg-[var(--text-primary)] text-[var(--bg-primary)] py-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:-translate-y-1 transition-all shadow-2xl active:scale-95"
                                                        >
                                                            <Send className="w-4 h-4" /> {msg.adminReply ? 'Revise' : 'Transmit'}
                                                        </button>
                                                        {msg.status !== 'RESOLVED' && (
                                                            <button 
                                                                onClick={() => handleSupportResolve(msg.id)}
                                                                className="px-8 py-5 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] font-black text-[10px] uppercase tracking-widest hover:bg-emerald-500/10 hover:text-emerald-500 hover:border-emerald-500/30 transition-all"
                                                            >
                                                                Close
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default AdminDashboard;
