/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Clock, CheckCircle, XCircle, Calendar, MapPin, Users, Phone, FileText, Droplet, ChevronDown, Activity } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
    PENDING: 'bg-orange-500/10 text-orange-600 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]',
    APPROVED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    REJECTED: 'bg-red-500/10 text-red-600 border-red-500/20',
};

const STATUS_ICONS = {
    PENDING: <Clock className="w-3.5 h-3.5" />,
    APPROVED: <CheckCircle className="w-3.5 h-3.5" />,
    REJECTED: <XCircle className="w-3.5 h-3.5" />,
};

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

const emptyForm = {
    name: '', description: '', address: '', city: '', state: 'Gujarat',
    date: '', startTime: '', endTime: '', totalSlots: 100,
    bloodGroupsNeeded: [], contactPhone: '', lat: '', lng: ''
};

const OrgDashboard = () => {
    const { user } = useAuthStore();
    const [activeSection, setActiveSection] = useState('overview');
    const [camps, setCamps] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [form, setForm] = useState(emptyForm);

    const fetchMyCamps = async () => {
        try {
            setIsLoading(true);
            const res = await api.get('/org/camps/my');
            if (res.data.status === 'success') setCamps(res.data.camps);
        } catch {
            toast.error('Could not load your camps.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchMyCamps();
    }, []);

    const toggleBloodGroup = (bg) => {
        setForm(f => ({
            ...f,
            bloodGroupsNeeded: f.bloodGroupsNeeded.includes(bg)
                ? f.bloodGroupsNeeded.filter(x => x !== bg)
                : [...f.bloodGroupsNeeded, bg]
        }));
    };

    const submitCamp = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await api.post('/org/camps', {
                ...form,
                bloodGroupsNeeded: form.bloodGroupsNeeded.join(','),
                lat: form.lat ? parseFloat(form.lat) : null,
                lng: form.lng ? parseFloat(form.lng) : null,
            });
            toast.success('Protocol Initiated: Blood drive broadcasted to local nodes.');
            setForm(emptyForm);
            setActiveSection('my-camps');
            fetchMyCamps();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to submit camp protocol.');
        } finally {
            setIsLoading(false);
        }
    };

    const tabVars = {
        hidden:  { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
        exit:    { opacity: 0, x: -20, transition: { duration: 0.25, ease: [0.4, 0, 1, 1] } }
    };

    const approvedCount = camps.filter(c => c.status === 'APPROVED').length;
    const pendingCount = camps.filter(c => c.status === 'PENDING').length;

    return (
        <div className="min-h-screen bg-var(--bg-primary) text-var(--text-primary) flex flex-col lg:flex-row relative selection:bg-[#dc143c]/30" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#dc143c]/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* Floating Navigation Rail */}
            <motion.div 
                initial={{ x: -100, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                className="w-full lg:w-80 backdrop-blur-3xl border-r flex flex-col z-20 h-screen sticky top-0 shadow-2xl"
                style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}
            >
                <div className="p-10">
                    <div className="flex items-center gap-4 mb-10 group cursor-default">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center border group-hover:border-[#dc143c] transition-all duration-500 shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                            <Building2 className="w-6 h-6 text-[#dc143c]" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black brand-font tracking-tight" style={{ color: 'var(--text-primary)' }}>LifeFlow<span className="text-[#dc143c]">.</span></h2>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Clinical Node</p>
                        </div>
                    </div>

                    <div className="p-6 rounded-3xl border mb-12 shadow-inner" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                        <p className="text-[9px] font-black uppercase tracking-widest text-[#dc143c] mb-2 px-1">Authority Info</p>
                        <p className="text-sm font-bold truncate px-1" style={{ color: 'var(--text-secondary)' }}>{user?.orgName || user?.name}</p>
                    </div>

                    <nav className="space-y-3">
                        {[
                            { id: 'overview', icon: Building2, label: 'Control Center' },
                            { id: 'create', icon: Plus, label: 'Initiate Drive' },
                            { id: 'my-camps', icon: Calendar, label: 'Deployment Log' },
                        ].map(item => (
                            <button 
                                key={item.id} 
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] relative overflow-hidden group
                                    ${activeSection === item.id
                                        ? 'text-white shadow-[0_15px_30px_rgba(220,20,60,0.3)]'
                                        : 'hover:bg-[#dc143c]/10'}`}
                                style={activeSection !== item.id ? { color: 'var(--text-muted)' } : {}}
                            >
                                {activeSection === item.id && (
                                    <motion.div
                                        layoutId="orgSidebarActive"
                                        className="absolute inset-0 rounded-2xl bg-[#dc143c]"
                                        style={{ zIndex: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                                    />
                                )}
                                <item.icon className={`w-4 h-4 relative z-10 ${activeSection === item.id ? 'text-white' : 'group-hover:text-[#dc143c] transition-colors'}`} /> 
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
                
                <div className="mt-auto p-10">
                    <button className="w-full py-4 text-[9px] font-black uppercase tracking-widest transition-all border rounded-2xl backdrop-blur-xl"
                            style={{ color: 'var(--text-muted)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-card)' }}>
                        Emergency Comms
                    </button>
                </div>
            </motion.div>

            {/* Main Command Deck */}
            <div className="flex-grow p-8 lg:p-16 z-10 relative overflow-x-hidden">
                <AnimatePresence mode="wait">
                    {/* OVERVIEW */}
                    {activeSection === 'overview' && (
                        <motion.div key="overview" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto">
                            <div className="mb-16">
                                <h1 className="text-5xl font-black brand-font mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                    Operational Deck<span className="text-[#dc143c]">.</span>
                                </h1>
                                <p className="font-bold uppercase tracking-[0.4em] text-[10px]" style={{ color: 'var(--text-muted)' }}>Welcome, Clinical Commander {user?.name}</p>
                            </div>

                            {/* Stat Grids */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                                {[
                                    { label: 'Total Operations', value: camps.length, icon: Calendar, color: 'text-white', glow: 'shadow-[0_0_50px_rgba(255,255,255,0.05)]' },
                                    { label: 'Active Missions', value: approvedCount, icon: CheckCircle, color: 'text-emerald-500', glow: 'shadow-[0_0_50px_rgba(16,185,129,0.1)]' },
                                    { label: 'Pending Clearances', value: pendingCount, icon: Clock, color: 'text-orange-500', glow: 'shadow-[0_0_50px_rgba(249,115,22,0.1)]' },
                                ].map((stat, i) => (
                                    <motion.div 
                                        key={stat.label} 
                                        initial={{ opacity: 0, y: 20 }} 
                                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                                        className={`backdrop-blur-3xl p-10 rounded-[3rem] border transition-all group relative overflow-hidden ${stat.glow}`}
                                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="flex justify-between items-start mb-10">
                                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center border group-hover:border-white/20 transition-all" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                                <stat.icon className={`w-6 h-6 ${stat.color === 'text-white' ? 'text-[#dc143c]' : stat.color}`} />
                                            </div>
                                            <div className="h-6 w-1 rounded-full bg-var(--border)"></div>
                                        </div>
                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.3em] mb-3">{stat.label}</p>
                                        <h2 className={`text-6xl font-black brand-font tracking-tighter ${stat.color === 'text-white' ? 'text-[var(--text-primary)]' : stat.color}`}>{stat.value}</h2>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <motion.button 
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    onClick={() => setActiveSection('create')}
                                    className="group p-12 rounded-[4rem] flex flex-col justify-between items-start transition-all shadow-2xl relative overflow-hidden h-[340px] border"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                    <div className="w-16 h-16 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                        <Plus className="w-8 h-8 text-[#dc143c]" />
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-black brand-font mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Initiate Blood Drive</h3>
                                        <p className="text-xs font-bold uppercase tracking-widest opacity-60 text-[var(--text-muted)]">Broadcast a new donation operation to the nexus network.</p>
                                    </div>
                                </motion.button>

                                <motion.button 
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    onClick={() => setActiveSection('my-camps')}
                                    className="group p-12 backdrop-blur-3xl border rounded-[4rem] flex flex-col justify-between items-start transition-all shadow-2xl relative overflow-hidden h-[340px]"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                    <div className="w-16 h-16 rounded-[2rem] flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                        <FileText className="w-8 h-8 text-[#dc143c]" />
                                    </div>
                                    <div>
                                        <h3 className="text-4xl font-black brand-font mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Mission Control</h3>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'var(--text-muted)' }}>Track approval telemetry & deployment logs</p>
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* CREATE CAMP */}
                    {activeSection === 'create' && (
                        <motion.div key="create" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-3xl mx-auto">
                           <div className="mb-16">
                                <h2 className="text-5xl font-black brand-font mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Initiate Deployment<span className="text-[#dc143c]">.</span></h2>
                                <p className="font-bold uppercase tracking-[0.4em] text-[10px]" style={{ color: 'var(--text-muted)' }}>Configure operational parameters for regional donation nodes</p>
                            </div>

                            <div className="bg-var(--bg-card) backdrop-blur-3xl p-12 lg:p-16 rounded-[4rem] border shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                                <div className="absolute top-0 right-0 w-96 h-96 bg-[#dc143c]/5 rounded-bl-full z-0 blur-[80px]"></div>
                                
                                <form className="space-y-12 relative z-10" onSubmit={submitCamp}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: 'var(--text-muted)' }}>Operation Designation</label>
                                            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                                className="w-full bg-[var(--bg-primary)] border rounded-[2.5rem] px-8 py-5 focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 transition-all font-bold outline-none shadow-inner"
                                                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                                placeholder="e.g. ALPHA-CORE BLOOD DRIVE" />
                                        </div>

                                        <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: 'var(--text-muted)' }}>Mission Briefing</label>
                                            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                                                rows={3}
                                                className="w-full bg-[var(--bg-primary)] border rounded-[2.5rem] px-8 py-6 focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 transition-all outline-none resize-none font-medium shadow-inner"
                                                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                                placeholder="Detailed logistics and core objectives..." />
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: 'var(--text-muted)' }}>Deployment Date</label>
                                            <input required type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                                                className="w-full bg-[var(--bg-primary)] border rounded-[2rem] px-8 py-5 focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 transition-all font-bold outline-none shadow-inner"
                                                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: 'var(--text-muted)' }}>Start T-Minus</label>
                                                <input required type="time" value={form.startTime} onChange={e => setForm({ ...form, startTime: e.target.value })}
                                                    className="w-full bg-[var(--bg-primary)] border rounded-[2rem] px-6 py-5 focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 transition-all font-bold outline-none shadow-inner"
                                                    style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: 'var(--text-muted)' }}>End T-Minus</label>
                                                <input required type="time" value={form.endTime} onChange={e => setForm({ ...form, endTime: e.target.value })}
                                                    className="w-full bg-[var(--bg-primary)] border rounded-[2rem] px-6 py-5 focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 transition-all font-bold outline-none shadow-inner"
                                                    style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                            </div>
                                        </div>

                                        <div className="md:col-span-2 space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: 'var(--text-muted)' }}>Geo-Targeting Protocol</label>
                                            <div className="relative group">
                                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#dc143c]" />
                                                <input required value={form.address} onChange={e => setForm({ ...form, address: e.target.value })}
                                                    className="w-full bg-[var(--bg-primary)] border rounded-[2.5rem] pl-16 pr-8 py-5 focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 transition-all font-bold outline-none shadow-inner"
                                                    style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                                    placeholder="Complete Sector Address..." />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: 'var(--text-muted)' }}>Sector Node (City)</label>
                                            <input required value={form.city} onChange={e => setForm({ ...form, city: e.target.value })}
                                                className="w-full bg-[var(--bg-primary)] border rounded-[2rem] px-8 py-5 focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 transition-all font-bold outline-none shadow-inner"
                                                style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }}
                                                placeholder="e.g. Ahmedabad" list="cities" />
                                            <datalist id="cities">
                                                <option value="Ahmedabad" /> <option value="Surat" /> <option value="Vadodara" /> <option value="Rajkot" />
                                            </datalist>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2" style={{ color: 'var(--text-muted)' }}>Capacity Units</label>
                                            <div className="relative">
                                                <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-500" />
                                                <input type="number" min="10" value={form.totalSlots} onChange={e => setForm({ ...form, totalSlots: e.target.value })}
                                                    className="w-full bg-[var(--bg-primary)] border rounded-[2rem] pl-16 pr-8 py-5 focus:ring-4 focus:ring-[#dc143c]/5 focus:border-[#dc143c]/40 transition-all font-bold outline-none shadow-inner"
                                                    style={{ color: 'var(--text-primary)', borderColor: 'var(--border)' }} />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t" style={{ borderColor: 'var(--border)' }}>
                                        <label className="text-[10px] font-black uppercase tracking-[0.4em] ml-2 mb-6 block" style={{ color: 'var(--text-muted)' }}>Requested Biomarkers (Blood Groups)</label>
                                        <div className="flex flex-wrap gap-3">
                                            {BLOOD_GROUPS.map(bg => (
                                                <button type="button" key={bg} onClick={() => toggleBloodGroup(bg)}
                                                    className={`px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all active:scale-95 shadow-2xl
                                                        ${form.bloodGroupsNeeded.includes(bg)
                                                            ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_10px_20px_rgba(220,20,60,0.3)] scale-105'
                                                            : 'bg-[var(--bg-primary)] border-var(--border) text-var(--text-muted) hover:text-var(--text-primary)'}`}>
                                                    {bg}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button disabled={isLoading}
                                        className="w-full bg-[#dc143c] text-white py-6 rounded-3xl font-black text-sm uppercase tracking-[0.3em] transition-all hover:-translate-y-1 active:scale-95 shadow-[0_20px_40px_rgba(220,20,60,0.2)] flex items-center justify-center gap-4 group"
                                    >
                                        {isLoading ? 'Transmitting...' : (
                                            <>Submit Protocol <Activity className="w-5 h-5 group-hover:animate-pulse" /></>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* MY CAMPS */}
                    {activeSection === 'my-camps' && (
                        <motion.div key="my-camps" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-5xl mx-auto">
                            <div className="mb-16">
                                <h2 className="text-5xl font-black brand-font mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Telemetry Log<span className="text-[#dc143c]">.</span></h2>
                                <p className="font-bold uppercase tracking-[0.4em] text-[10px]" style={{ color: 'var(--text-muted)' }}>Registry of historical and active regional deployments</p>
                            </div>

                            {isLoading && camps.length === 0 ? (
                                <div className="py-40 text-center">
                                    <div className="w-20 h-20 border-b-2 border-[#dc143c] rounded-full animate-spin mx-auto mb-10 shadow-[0_0_50px_rgba(220,20,60,0.2)]"></div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.5em]" style={{ color: 'var(--text-muted)' }}>Syncing Deployment Matrix...</p>
                                </div>
                            ) : camps.length === 0 ? (
                                <div className="p-32 rounded-[5rem] border text-center shadow-2xl relative overflow-hidden" style={{ backgroundColor: 'var(--bg-secondary)', borderColor: 'var(--border)' }}>
                                     <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/5 to-transparent pointer-events-none"></div>
                                    <Calendar className="w-20 h-20 mx-auto mb-10 text-var(--text-muted) opacity-20" />
                                    <h3 className="text-2xl font-black brand-font uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Null Deployments Detected</h3>
                                    <button onClick={() => setActiveSection('create')}
                                        className="mt-12 bg-[#dc143c] text-white px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
                                        Initialize Alpha Node
                                    </button>
                                </div>
                            ) : (
                                <div className="grid gap-10">
                                    {camps.map(camp => (
                                        <motion.div 
                                            key={camp.id} 
                                            whileHover={{ y: -5, backgroundColor: 'var(--bg-hover)' }}
                                            className="backdrop-blur-3xl p-10 lg:p-14 rounded-[4rem] border shadow-2xl group transition-all"
                                            style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                        >
                                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-10 mb-10">
                                                <div>
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <h3 className="text-3xl font-black brand-font tracking-tighter leading-none" style={{ color: 'var(--text-primary)' }}>{camp.name}</h3>
                                                        <span className={`px-5 py-1.5 rounded-2xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-[0_0_20px_rgba(0,0,0,0.5)] ${
                                                            camp.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 
                                                            camp.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_15px_rgba(249,115,22,0.1)]' : 
                                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                            {camp.status}
                                                        </span>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: 'var(--text-muted)' }}>
                                                        <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Calendar className="w-4 h-4 text-emerald-500/50" /> {new Date(camp.date).toLocaleDateString()}</span>
                                                        <span className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Clock className="w-4 h-4 text-emerald-500/50" /> {camp.startTime} — {camp.endTime}</span>
                                                        <span className="flex items-center gap-2 text-indigo-400"><MapPin className="w-4 h-4" /> {camp.city} Node</span>
                                                    </div>
                                                </div>
                                                 <div className="flex items-center gap-10 p-6 rounded-[2.5rem] border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Capacity</p>
                                                        <p className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{camp.totalSlots}</p>
                                                    </div>
                                                    <div className="w-px h-10" style={{ backgroundColor: 'var(--border)' }}></div>
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>Security</p>
                                                        <Droplet className="w-5 h-5 text-[#dc143c] mx-auto mt-1 shadow-[0_0_15px_rgba(220,20,60,0.4)]" />
                                                    </div>
                                                </div>

                                            </div>

                                            {camp.adminNote && (
                                                <div className="mt-8 p-10 rounded-[3rem] border relative overflow-hidden group-hover:border-white/10 transition-colors" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                                    <div className="absolute top-0 left-0 w-1 h-full bg-[#dc143c]/40"></div>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dc143c] mb-4">Command Directive</p>
                                                    <p className="text-sm font-bold leading-relaxed italic" style={{ color: 'var(--text-secondary)' }}>"{camp.adminNote}"</p>
                                                </div>
                                            )}
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            
            {/* Action Fab */}
            <motion.button 
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="fixed bottom-10 right-10 w-20 h-20 bg-[#dc143c] rounded-[2rem] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(220,20,60,0.5)] z-50 group border-4 border-black"
            >
                <div className="relative">
                    <div className="absolute inset-0 bg-white rounded-full blur-xl opacity-0 group-hover:opacity-40 transition-opacity"></div>
                    <Building2 className="w-8 h-8 relative z-10" />
                </div>
            </motion.button>
        </div>
    );
};

export default OrgDashboard;
