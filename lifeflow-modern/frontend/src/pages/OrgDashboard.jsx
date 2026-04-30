/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Clock, CheckCircle, XCircle, Calendar, MapPin, Users, Phone, FileText, Droplet, ChevronDown, Activity } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import api from '../lib/api';
import toast from 'react-hot-toast';
import NexusInput from '../components/NexusInput';
import NexusSelect from '../components/NexusSelect';

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
        <div className="min-h-screen bg-var(--bg-primary) text-var(--text-primary) flex flex-row relative selection:bg-[#dc143c]/30" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#dc143c]/5 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/5 rounded-full blur-[120px]"></div>
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
            </div>

            {/* Floating Navigation Rail - Nexus Node Pillar */}
            <motion.div 
                initial={{ x: -120, opacity: 0 }} 
                animate={{ x: 0, opacity: 1 }}
                transition={{ type: "spring", damping: 32, stiffness: 120 }}
                className="fixed top-0 left-0 w-[320px] shrink-0 bg-[var(--bg-card)] backdrop-blur-[50px] border-r border-[var(--border)] flex flex-col z-30 h-full pt-[122px] shadow-[20px_0_100px_rgba(0,0,0,0.4)]"
            >
                <div className="p-10 flex flex-col h-full">
                    <div className="flex items-center gap-5 mb-14 group cursor-pointer">
                        <div className="relative">
                            <div className="absolute inset-0 bg-[#dc143c] blur-2xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
                            <div className="w-14 h-14 bg-gradient-to-br from-[#dc143c] to-[#9b0023] rounded-[1.5rem] flex items-center justify-center relative z-10 border border-white/20 shadow-2xl group-hover:rotate-6 transition-transform duration-500">
                                <Building2 className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-[var(--text-primary)] brand-font tracking-tighter uppercase leading-none mb-1">LifeFlow</h2>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#dc143c] animate-pulse"></div>
                                <p className="text-[9px] text-[#dc143c] font-black uppercase tracking-[0.5em]">Clinical Node</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 rounded-[2.5rem] bg-[var(--bg-primary)] border border-[var(--border)] mb-14 relative overflow-hidden group shadow-inner">
                        <div className="absolute -top-4 -right-4 w-20 h-20 bg-[#dc143c]/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] mb-3">Authority Stream</p>
                        <div className="flex items-center gap-4">
                            <div className="w-2 h-10 bg-[#dc143c] rounded-full"></div>
                            <div className="min-w-0">
                                <p className="text-base font-black text-[var(--text-primary)] tracking-tight leading-none mb-1 truncate">{user?.orgName || user?.name}</p>
                                <p className="text-[8px] text-[var(--text-muted)] font-black uppercase tracking-widest">Protocol: Verified</p>
                            </div>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.5em] mb-2 px-4">Mission Control</p>
                        {[
                            { id: 'overview', icon: Activity, label: 'Control Deck' },
                            { id: 'create', icon: Plus, label: 'Initiate Drive' },
                            { id: 'my-camps', icon: Calendar, label: 'Deployment Log' },
                        ].map(item => (
                            <button 
                                key={item.id} 
                                onClick={() => setActiveSection(item.id)}
                                className={`w-full flex items-center gap-5 px-4 py-3 rounded-xl transition-all duration-500 font-black text-[10px] uppercase tracking-[0.25em] relative group
                                    ${activeSection === item.id
                                        ? 'text-white shadow-[0_20px_50px_rgba(220,20,60,0.3)] scale-[1.02]' 
                                        : 'text-[var(--text-secondary)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)] border border-transparent hover:border-[var(--border)]'}`}
                            >
                                {activeSection === item.id && (
                                    <motion.div
                                        layoutId="orgSidebarActive"
                                        className="absolute inset-0 rounded-[1.5rem] bg-gradient-to-r from-[#dc143c] to-[#9b0023]"
                                        style={{ zIndex: 0 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <div className={`p-2 rounded-xl transition-all duration-500 relative z-10 ${activeSection === item.id ? 'bg-white/10' : 'group-hover:bg-[#dc143c]/10'}`}>
                                    <item.icon className={`w-4 h-4 transition-all duration-500 ${activeSection === item.id ? 'scale-110' : 'group-hover:text-[#dc143c] group-hover:scale-110'}`} /> 
                                </div>
                                <span className="relative z-10">{item.label}</span>
                            </button>
                        ))}
                    </nav>

                    <div className="mt-auto">
                        <button className="w-full p-6 rounded-[2rem] bg-[#dc143c]/5 border border-[#dc143c]/20 text-[#dc143c] hover:bg-[#dc143c] hover:text-white transition-all duration-500 text-[10px] font-black uppercase tracking-[0.4em] shadow-xl group">
                            <span className="flex items-center justify-center gap-3">
                                Emergency Comms <Phone className="w-4 h-4 group-hover:animate-bounce" />
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>

            {/* Main Command Deck */}
            <div className="flex-grow ml-[320px] p-6 lg:p-10 z-10 relative overflow-x-hidden">
                <AnimatePresence mode="wait">
                    {/* OVERVIEW */}
                    {activeSection === 'overview' && (
                        <motion.div key="overview" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-7xl mx-auto">
                            <div className="mb-10">
                                 <h1 className="text-4xl lg:text-5xl font-black brand-font mb-2 tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                     Command Deck<span className="text-[#dc143c]">.</span>
                                 </h1>
                                 <p className="font-bold uppercase tracking-[0.4em] text-[9px]" style={{ color: 'var(--text-muted)' }}>Synchronizing Clinical Authority: {user?.name}</p>
                            </div>

                            {/* Stat Grids - Clinical-Grade */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-16">
                                {[
                                    { label: 'Deployment Cycles', value: camps.length, icon: Calendar, color: 'text-[#dc143c]', glow: 'shadow-[0_0_50px_rgba(220,20,60,0.1)]', trend: 'Global' },
                                    { label: 'Active Operations', value: approvedCount, icon: CheckCircle, color: 'text-emerald-500', glow: 'shadow-[0_0_50px_rgba(16,185,129,0.1)]', trend: 'Live' },
                                    { label: 'Clearance Buffer', value: pendingCount, icon: Clock, color: 'text-orange-500', glow: 'shadow-[0_0_50px_rgba(249,115,22,0.1)]', trend: 'Pending' },
                                ].map((stat, i) => (
                                    <motion.div 
                                        key={stat.label} 
                                        initial={{ opacity: 0, y: 30 }} 
                                        animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1, type: "spring", damping: 25 } }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        className={`backdrop-blur-3xl p-6 rounded-3xl border transition-all group relative overflow-hidden shadow-2xl ${stat.glow}`}
                                        style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                    >
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rotate-45 translate-x-16 -translate-y-16 group-hover:translate-x-12 transition-transform duration-700"></div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 rounded-xl flex items-center justify-center border group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                                <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                            </div>
                                            <div className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                                {stat.trend}
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-[0.4em] mb-1 px-1">{stat.label}</p>
                                        <h2 className="text-4xl font-black brand-font tracking-tighter" style={{ color: 'var(--text-primary)' }}>{stat.value}</h2>
                                        <div className="h-1 w-8 bg-[#dc143c] mt-2 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                                    </motion.div>
                                ))}
                            </div>

                            <div className="grid md:grid-cols-2 gap-8">
                                <motion.button 
                                    whileHover={{ scale: 1.02, y: -8 }}
                                    onClick={() => setActiveSection('create')}
                                    className="group p-8 rounded-[2.5rem] flex flex-col justify-between items-start transition-all shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative overflow-hidden h-[300px] border"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#dc143c]/5 rounded-bl-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-12 transition-all shadow-2xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                        <Plus className="w-8 h-8 text-[#dc143c]" />
                                    </div>
                                    <div className="relative z-10 text-left">
                                        <h3 className="text-3xl font-black brand-font mb-3 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Broadcast Drive</h3>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] opacity-60 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Initiate a new regional collection node and notify local life-donors.</p>
                                    </div>
                                </motion.button>

                                <motion.button 
                                    whileHover={{ scale: 1.02, y: -8 }}
                                    onClick={() => setActiveSection('my-camps')}
                                    className="group p-8 backdrop-blur-3xl border rounded-[2.5rem] flex flex-col justify-between items-start transition-all shadow-[0_30px_60px_rgba(0,0,0,0.3)] relative overflow-hidden h-[300px]"
                                    style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}
                                >
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-bl-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:-rotate-12 transition-all shadow-2xl border" style={{ backgroundColor: 'var(--bg-primary)', borderColor: 'var(--border)' }}>
                                        <FileText className="w-8 h-8 text-indigo-500" />
                                    </div>
                                    <div className="relative z-10 text-left">
                                        <h3 className="text-3xl font-black brand-font mb-3 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Telemetry Log</h3>
                                        <p className="text-[11px] font-bold uppercase tracking-[0.1em] opacity-60 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Access historical performance data and active mission clearances.</p>
                                    </div>
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* CREATE CAMP - Mission Initiation */}
                    {activeSection === 'create' && (
                        <motion.div key="create" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto">
                           <div className="mb-10">
                                <h2 className="text-4xl lg:text-5xl font-black brand-font mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                                    Initiate Mission<span className="text-[#dc143c]">.</span>
                                </h2>
                                <p className="font-bold uppercase tracking-[0.4em] text-[9px] ml-2" style={{ color: 'var(--text-muted)' }}>Configuring Regional Bio-Capture Protocol</p>
                            </div>

                            <div className="bg-[var(--bg-card)] backdrop-blur-3xl p-10 lg:p-14 rounded-[2.5rem] border border-[var(--border)] shadow-[0_50px_100px_rgba(0,0,0,0.5)] relative overflow-hidden group transition-all duration-700" style={{ backgroundColor: 'var(--bg-card)' }}>
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#dc143c]/5 rounded-bl-full z-0 blur-[150px] opacity-40 group-hover:opacity-100 transition-opacity duration-1000"></div>
                                
                                <form className="space-y-10 relative z-10" onSubmit={submitCamp}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="md:col-span-2">
                                            <NexusInput
                                                label="Mission Designation"
                                                required
                                                value={form.name}
                                                onChange={e => setForm({ ...form, name: e.target.value })}
                                                placeholder="e.g. OPERATION NEURAL-BLOOD ALPHA"
                                                icon={Activity}
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <NexusInput
                                                label="Geo-Coordinates (Deployment Address)"
                                                required
                                                value={form.address}
                                                onChange={e => setForm({ ...form, address: e.target.value })}
                                                icon={MapPin}
                                                placeholder="Complete Regional Logistics Path..."
                                            />
                                        </div>

                                        <NexusInput
                                            label="Clinical Node (City)"
                                            required
                                            value={form.city}
                                            onChange={e => setForm({ ...form, city: e.target.value })}
                                            placeholder="e.g. Patan Strategic Node"
                                        />

                                        <NexusInput
                                            label="Bio-Throughput Capacity"
                                            type="number"
                                            value={form.totalSlots}
                                            onChange={e => setForm({ ...form, totalSlots: e.target.value })}
                                            icon={Users}
                                        />

                                        <NexusInput
                                            label="Temporal Window (Date)"
                                            type="date"
                                            required
                                            value={form.date}
                                            onChange={e => setForm({ ...form, date: e.target.value })}
                                            icon={Calendar}
                                        />

                                        <div className="grid grid-cols-2 gap-8">
                                            <NexusInput
                                                label="Active Start"
                                                type="time"
                                                required
                                                value={form.startTime}
                                                onChange={e => setForm({ ...form, startTime: e.target.value })}
                                                icon={Clock}
                                            />
                                            <NexusInput
                                                label="Active End"
                                                type="time"
                                                required
                                                value={form.endTime}
                                                onChange={e => setForm({ ...form, endTime: e.target.value })}
                                                icon={Clock}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-8 border-t border-[var(--border)]">
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-2 h-6 bg-[#dc143c] rounded-full"></div>
                                            <label className="text-[9px] font-black uppercase tracking-[0.4em]" style={{ color: 'var(--text-muted)' }}>Target Biomarkers</label>
                                        </div>
                                        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                                            {BLOOD_GROUPS.map(bg => (
                                                <motion.button 
                                                    whileHover={{ y: -3, scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    type="button" 
                                                    key={bg} 
                                                    onClick={() => toggleBloodGroup(bg)}
                                                    className={`aspect-square rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest border transition-all duration-500 shadow-2xl relative overflow-hidden group
                                                        ${form.bloodGroupsNeeded.includes(bg)
                                                            ? 'bg-[#dc143c] text-white border-[#dc143c] shadow-[0_15px_30px_rgba(220,20,60,0.3)]'
                                                            : 'bg-[var(--bg-primary)] border-[var(--border)] text-[var(--text-muted)] hover:border-[#dc143c]/40 hover:text-[var(--text-primary)]'}`}
                                                >
                                                    {form.bloodGroupsNeeded.includes(bg) && (
                                                        <motion.div layoutId="bg-pulse" className="absolute inset-0 bg-white/10 animate-pulse" />
                                                    )}
                                                    <span className="relative z-10">{bg}</span>
                                                </motion.button>
                                            ))}
                                        </div>
                                    </div>

                                    <motion.button 
                                        disabled={isLoading}
                                        whileHover={{ scale: 1.02, y: -4 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="w-full bg-gradient-to-r from-[#dc143c] to-[#9b0023] text-white py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.4em] transition-all shadow-[0_30px_60px_rgba(220,20,60,0.3)] hover:shadow-[0_40px_80px_rgba(220,20,60,0.5)] flex items-center justify-center gap-4 group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <>Authorize Deployment Protocol <Activity className="w-4 h-4 group-hover:animate-pulse" /></>
                                        )}
                                    </motion.button>
                                </form>
                            </div>
                        </motion.div>
                    )}

                    {/* MY CAMPS - Telemetry Registry */}
                    {activeSection === 'my-camps' && (
                        <motion.div key="my-camps" variants={tabVars} initial="hidden" animate="visible" exit="exit" className="max-w-6xl mx-auto">
                            <div className="mb-10">
                                <h2 className="text-4xl lg:text-5xl font-black brand-font mb-4 tracking-tighter" style={{ color: 'var(--text-primary)' }}>Operational Registry<span className="text-[#dc143c]">.</span></h2>
                                <p className="font-bold uppercase tracking-[0.4em] text-[9px] ml-2" style={{ color: 'var(--text-muted)' }}>Registry of Clinical Deployments & Global Telemetry</p>
                            </div>

                            {isLoading && camps.length === 0 ? (
                                <div className="py-40 text-center">
                                    <div className="w-24 h-24 border-4 border-[#dc143c] border-t-transparent rounded-full animate-spin mx-auto mb-12 shadow-[0_0_80px_rgba(220,20,60,0.3)]"></div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.6em] animate-pulse" style={{ color: 'var(--text-muted)' }}>Synchronizing Secure Deployment Matrix...</p>
                                </div>
                            ) : camps.length === 0 ? (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="p-32 rounded-[6rem] border border-[var(--border)] text-center shadow-[0_40px_100px_rgba(0,0,0,0.4)] relative overflow-hidden" 
                                    style={{ backgroundColor: 'var(--bg-card)' }}
                                >
                                     <div className="absolute inset-0 bg-gradient-to-b from-[#dc143c]/5 to-transparent pointer-events-none"></div>
                                    <Calendar className="w-24 h-24 mx-auto mb-10 text-[var(--text-muted)] opacity-10" />
                                    <h3 className="text-3xl font-black brand-font uppercase tracking-tighter mb-12" style={{ color: 'var(--text-muted)' }}>Null Operation Nodes Detected</h3>
                                    <button onClick={() => setActiveSection('create')}
                                        className="bg-gradient-to-r from-[#dc143c] to-[#9b0023] text-white px-14 py-6 rounded-[2.5rem] font-black text-xs uppercase tracking-[0.4em] hover:scale-105 hover:-translate-y-2 transition-all shadow-[0_20px_40px_rgba(220,20,60,0.4)]">
                                        Initialize First Operation
                                    </button>
                                </motion.div>
                            ) : (
                                <div className="grid gap-12">
                                    {camps.map((camp, idx) => (
                                        <motion.div 
                                            key={camp.id} 
                                            initial={{ opacity: 0, y: 30 }}
                                            animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
                                            whileHover={{ y: -6, backgroundColor: 'var(--bg-secondary)' }}
                                            className="bg-[var(--bg-card)] backdrop-blur-[60px] p-8 lg:p-10 rounded-[2.5rem] border border-[var(--border)] shadow-[0_40px_80px_rgba(0,0,0,0.3)] group transition-all duration-500 relative overflow-hidden"
                                        >
                                            <div className="absolute top-0 right-0 w-96 h-96 bg-[#dc143c]/5 rounded-bl-full z-0 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            
                                            <div className="flex flex-col lg:flex-row justify-between lg:items-center gap-10 relative z-10">
                                                <div className="space-y-4">
                                                    <div className="flex items-center gap-4">
                                                        <h3 className="text-3xl font-black brand-font tracking-tighter leading-none group-hover:text-[#dc143c] transition-colors" style={{ color: 'var(--text-primary)' }}>{camp.name}</h3>
                                                        <div className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.3em] border shadow-2xl flex items-center gap-2 ${
                                                            camp.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                                            camp.status === 'PENDING' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20 shadow-[0_0_20px_rgba(249,115,22,0.15)]' : 
                                                            'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}>
                                                            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${camp.status === 'APPROVED' ? 'bg-emerald-500' : camp.status === 'PENDING' ? 'bg-orange-500' : 'bg-red-500'}`}></div>
                                                            {camp.status}
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-x-12 gap-y-6 text-[11px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                                                        <div className="flex items-center gap-4 hover:text-[#dc143c] transition-colors">
                                                            <Calendar className="w-5 h-5 opacity-40" /> 
                                                            {new Date(camp.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </div>
                                                        <div className="flex items-center gap-4 hover:text-[#dc143c] transition-colors">
                                                            <Clock className="w-5 h-5 opacity-40" /> 
                                                            {camp.startTime} — {camp.endTime}
                                                        </div>
                                                        <div className="flex items-center gap-4 text-indigo-400/80">
                                                            <MapPin className="w-5 h-5" /> 
                                                            {camp.city} CLINICAL NODE
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-12 p-8 lg:px-12 rounded-[3.5rem] bg-[var(--bg-primary)] border border-[var(--border)] shadow-inner group-hover:border-[#dc143c]/20 transition-colors">
                                                    <div className="text-center">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: 'var(--text-muted)' }}>Throughput</p>
                                                        <p className="text-4xl font-black tracking-tighter" style={{ color: 'var(--text-primary)' }}>{camp.totalSlots}</p>
                                                    </div>
                                                    <div className="w-px h-16 bg-[var(--border)] opacity-50"></div>
                                                    <div className="text-center group/icon">
                                                        <p className="text-[9px] font-black uppercase tracking-[0.5em] mb-2" style={{ color: 'var(--text-muted)' }}>Bio-Factor</p>
                                                        <Droplet className="w-8 h-8 text-[#dc143c] mx-auto group-hover/icon:scale-125 transition-transform duration-500 drop-shadow-[0_0_15px_rgba(220,20,60,0.5)]" />
                                                    </div>
                                                </div>
                                            </div>

                                            {camp.adminNote && (
                                                <motion.div 
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    className="mt-12 p-12 rounded-[3.5rem] bg-[var(--bg-primary)] border border-[var(--border)] relative overflow-hidden group-hover:border-[#dc143c]/10 transition-colors"
                                                >
                                                    <div className="absolute top-0 left-0 w-2 h-full bg-[#dc143c]/40"></div>
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <Activity className="w-4 h-4 text-[#dc143c]" />
                                                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#dc143c]">Command Center Directive</p>
                                                    </div>
                                                    <p className="text-base font-bold leading-relaxed italic text-[var(--text-secondary)] tracking-tight">"{camp.adminNote}"</p>
                                                </motion.div>
                                            )}
                                            
                                            <div className="mt-12 pt-10 border-t border-[var(--border)] opacity-30 flex justify-between items-center group-hover:opacity-100 transition-opacity">
                                                <p className="text-[9px] font-black uppercase tracking-[0.6em] text-[var(--text-muted)]">Strategic Deployment Log</p>
                                                <div className="flex gap-2">
                                                    {[1,2,3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#dc143c]"></div>)}
                                                </div>
                                            </div>
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
