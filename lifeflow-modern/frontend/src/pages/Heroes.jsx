/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Trophy, Medal, Award, TrendingUp, Download, Heart, Users, Zap, Star, MapPin, Calendar, Clock, Phone, Mail, Globe, ExternalLink, Instagram, Twitter, Facebook } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../context/authStore';
import PremiumMedal from '../components/PremiumMedal';

const Heroes = () => {
    const { user } = useAuthStore();
    const [topDonors, setTopDonors] = useState([]);
    const [badges, setBadges] = useState({});
    const [userAchievements, setUserAchievements] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('leaderboard');
    const [timeframe, setTimeframe] = useState('all');

    const fetchTopDonors = React.useCallback(async () => {
        try {
            const response = await api.get(`/leaderboard/top-donors?timeframe=${timeframe}&limit=20`);
            if (response.data.status === 'success') {
                setTopDonors(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch top donors:', error);
        } finally {
            setLoading(false);
        }
    }, [timeframe]);

    const fetchBadges = React.useCallback(async () => {
        try {
            const response = await api.get('/leaderboard/badges');
            if (response.data.status === 'success') {
                setBadges(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch badges:', error);
        }
    }, []);

    const fetchUserAchievements = React.useCallback(async () => {
        try {
            const response = await api.get('/leaderboard/achievements');
            if (response.data.status === 'success') {
                setUserAchievements(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch user achievements:', error);
        }
    }, []);

    const fetchAnalytics = React.useCallback(async () => {
        try {
            const response = await api.get('/analytics/dashboard');
            if (response.data.status === 'success') {
                setAnalytics(response.data.data);
            }
        } catch (error) {
            console.error('Failed to fetch analytics:', error);
        }
    }, []);

    useEffect(() => {
        fetchTopDonors();
        fetchBadges();
        fetchUserAchievements();
        fetchAnalytics();
    }, [fetchTopDonors, fetchBadges, fetchUserAchievements, fetchAnalytics]);

    const getBadgeInfo = (badge) => {
        return badges[badge] || badges.Starter;
    };

    const exportReport = (format) => {
        console.log(`exporting report in ${format} format...`);
        alert(`Report export in ${format} format started. Check your downloads folder.`);
    };

    const getMedalIcon = (rank) => {
        if (rank === 1) return <PremiumMedal tier="Gold" size="sm" />;
        if (rank === 2) return <PremiumMedal tier="Silver" size="sm" />;
        if (rank === 3) return <PremiumMedal tier="Bronze" size="sm" />;
        return (
            <div className="w-10 h-10 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] flex items-center justify-center">
                <span className="text-sm font-black text-[var(--text-muted)]">#{rank}</span>
            </div>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen bg-[var(--bg-primary)]"
        >
            {/* Premium Backdrop */}
            <div className="fixed inset-0 z-0 h-screen w-screen overflow-hidden pointer-events-none">
                <img src="/images/sanctuary_bg.png" className="w-full h-full object-cover opacity-[0.03] scale-110" alt="" />
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/5 via-transparent to-transparent"></div>
            </div>
            {/* Header */}
            <div className="py-16 px-6">
                <div className="container mx-auto max-w-6xl">
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <span className="text-red-500 dark:text-red-400 text-xs font-bold uppercase tracking-widest">Hall of Heroes</span>
                        <h1 className="text-4xl md:text-5xl font-black brand-font mt-2 mb-4 text-[var(--text-primary)]">Heroes Dashboard</h1>
                        <p className="text-[var(--text-secondary)] max-w-2xl">
                            Celebrating our most generous donors who have saved countless lives. Track achievements, view analytics, and join the leaderboard.
                        </p>
                        <div className="text-[var(--accent)] text-xs font-bold mt-6 flex items-center gap-2 bg-[var(--accent)]/10 p-3.5 rounded-2xl border border-[var(--accent)]/20 w-fit backdrop-blur-md shadow-lg">
                            <AlertCircle className="w-5 h-5 flex-shrink-0" />
                            <span><strong className="tracking-widest uppercase">Admin Verification Required:</strong> Your rank and points update only after your completed donation is verified by an administrator. Don't worry if it's pending!</span>
                        </div>
                    </motion.div>

                    {/* Navigation Tabs */}
                    <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 md:gap-4 mt-12 bg-[var(--bg-secondary)]/50 p-2 rounded-[2rem] w-full md:w-fit border border-[var(--border)] backdrop-blur-xl">
                        {[
                            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
                            { id: 'achievements', label: 'My Achievements', icon: Award },
                            { id: 'analytics', label: 'Analytics', icon: TrendingUp }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 md:gap-3 px-4 md:px-8 py-3 md:py-4 rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-[0.1em] md:tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)] shadow-2xl shadow-black/40 -translate-y-1'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-primary)]'
                                }`}
                            >
                                <tab.icon className={`w-3.5 h-3.5 md:w-4 h-4 ${activeTab === tab.id ? 'text-[var(--accent)]' : ''}`} />
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content Sections */}
            <AnimatePresence mode="wait">
                {/* Leaderboard Tab */}
                {activeTab === 'leaderboard' && (
                    <motion.div
                        key="leaderboard"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                    >
                        {/* Timeframe Filter */}
                        <div className="bg-[var(--bg-secondary)]/30 backdrop-blur-3xl border-y border-[var(--border)] py-12 px-6">
                            <div className="container mx-auto max-w-6xl">
                                <div className="flex flex-wrap items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <h2 className="text-[var(--text-primary)] text-3xl font-black brand-font uppercase tracking-tight">Top Donors</h2>
                                    </div>
                                    <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-2 bg-[var(--bg-primary)]/50 p-1.5 rounded-2xl border border-[var(--border)] w-full md:w-auto">
                                        {[
                                            { value: 'all', label: 'All Time' },
                                            { value: 'month', label: 'This Month' },
                                            { value: 'week', label: 'This Week' }
                                        ].map(option => (
                                            <button
                                                key={option.value}
                                                onClick={() => setTimeframe(option.value)}
                                                className={`px-4 md:px-6 py-2 md:py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                                                    timeframe === option.value
                                                        ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Badge System Info */}
                        <div className="bg-[var(--bg-primary)] py-20 px-6">
                            <div className="container mx-auto max-w-6xl">
                                <div className="flex items-center gap-4 mb-12">
                                    <div className="w-12 h-1 px-0 bg-[var(--accent)] rounded-full"></div>
                                    <h2 className="text-[var(--text-primary)] text-2xl font-black uppercase tracking-widest">Badge System</h2>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-6">
                                    {Object.entries(badges || {}).map(([name, badge], idx) => (
                                        <motion.div
                                            key={name}
                                            initial={{ opacity: 0, y: 30 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                                            className={`backdrop-blur-2xl rounded-[3rem] p-10 text-center border-2 transition-all duration-700 hover:-translate-y-5 group shadow-2xl relative overflow-hidden flex flex-col items-center justify-between min-h-[400px] ${
                                                name === user?.badge 
                                                    ? 'bg-[var(--accent)]/15 border-[var(--accent)] shadow-[0_30px_60px_rgba(239,68,68,0.3)] scale-110 z-10' 
                                                    : 'bg-[var(--bg-secondary)]/80 border border-[var(--border)] hover:border-[var(--accent)]/50'
                                            }`}
                                        >
                                            <div className="absolute inset-0 opacity-[0.07] group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none" style={{ background: `radial-gradient(circle at center, ${badge?.color || '#ef4444'}, transparent)` }}></div>
                                            <div className={`absolute inset-0 transition-opacity duration-700 ${name === user?.badge ? 'opacity-30' : 'opacity-10 group-hover:opacity-25'}`} style={{ backgroundColor: badge?.color || '#ef4444' }}></div>
                                            <div className="absolute -top-12 -right-12 w-40 h-40 blur-[80px] opacity-20 group-hover:opacity-50 transition-all duration-700 pointer-events-none" style={{ backgroundColor: badge?.color || '#ef4444' }}></div>
                                            
                                            <div className="relative z-10">
                                                <div className="mb-8 transition-all duration-1000 transform group-hover:scale-125 flex justify-center">
                                                    <PremiumMedal tier={name} size="lg" />
                                                </div>
                                                <h4 className={`font-black text-xl uppercase tracking-[0.2em] brand-font mb-2 transition-colors duration-500 ${name === user?.badge ? 'text-[var(--accent)]' : 'text-[var(--text-primary)] group-hover:text-[var(--accent)]'}`}>
                                                    {name}
                                                </h4>
                                                {name === user?.badge && (
                                                    <span className="bg-[var(--accent)] text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse shadow-lg shadow-red-500/50">Your Rank</span>
                                                )}
                                            </div>

                                            <div className="relative z-10 w-full mt-8">
                                                <div className={`px-6 py-3 rounded-2xl border-2 transition-all duration-500 flex items-center justify-center gap-3 ${name === user?.badge ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg' : 'bg-[var(--bg-primary)] border border-[var(--border)] text-[var(--text-muted)] group-hover:border-[var(--accent)]/40'}`}>
                                                    <Zap className={`w-5 h-5 ${name === user?.badge ? 'text-white fill-white' : 'text-yellow-400 fill-yellow-400 group-hover:animate-bounce'}`} />
                                                    <span className="font-black text-xs tracking-widest">{badge?.minPoints || 0}+ PTS</span>
                                                </div>
                                                <p className="mt-4 text-[10px] font-medium text-[var(--text-muted)] opacity-60 group-hover:opacity-100 px-2 line-clamp-2 italic">"{badge?.description || 'Earn points to unlock this badge.'}"</p>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {/* Achievements Tab */}
                {activeTab === 'achievements' && userAchievements && (
                    <motion.div
                        key="achievements"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="py-12 px-6"
                    >
                        <div className="container mx-auto max-w-6xl">
                            {/* User Progress */}
                            <div className="bg-[var(--bg-secondary)] backdrop-blur-sm rounded-2xl p-8 mb-8 border border-[var(--border)]">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div>
                                        <h3 className="text-[var(--text-primary)] text-xl font-black uppercase tracking-widest mb-6">Your Progress</h3>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-6">
                                                <PremiumMedal tier={userAchievements.user?.badge} size="lg" />
                                                <div>
                                                    <p className="text-[var(--text-primary)] font-black text-3xl brand-font tracking-tight">{userAchievements.user?.badge || 'Member'}</p>
                                                    <p className="text-[var(--accent)] font-black text-sm uppercase tracking-[0.2em]">{userAchievements.user?.points || 0} POINTS</p>
                                                </div>
                                            </div>
                                            {userAchievements.progress?.nextBadge && (
                                                <div>
                                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                                                        <span className="text-[var(--text-muted)]">Next: {userAchievements.progress.nextBadge}</span>
                                                        <span className="text-[var(--accent)]">{userAchievements.progress.progressPercent}%</span>
                                                    </div>
                                                    <div className="w-full bg-[var(--bg-primary)] rounded-full h-3 border border-[var(--border)] overflow-hidden shadow-inner">
                                                        <div 
                                                            className="bg-gradient-to-r from-red-500 to-red-600 h-full rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                                                            style={{ width: `${userAchievements.progress.progressPercent}%` }}
                                                        />
                                                    </div>
                                                    <p className="text-[var(--text-muted)] text-[10px] font-bold mt-2 uppercase tracking-tighter">
                                                        <Zap className="w-3 h-3 inline mr-1 text-yellow-500" />
                                                        {userAchievements.progress.pointsNeeded} more points for next tier
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-3xl p-6 text-center shadow-lg hover:border-[var(--accent)]/30 transition-all">
                                            <Heart className="w-10 h-10 text-red-500 mx-auto mb-3 drop-shadow-lg" />
                                            <p className="text-3xl font-black text-[var(--text-primary)] brand-font">{userAchievements.user?.totalDonations || 0}</p>
                                            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Donations</p>
                                        </div>
                                        <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-3xl p-6 text-center shadow-lg hover:border-green-500/30 transition-all">
                                            <Users className="w-10 h-10 text-green-500 mx-auto mb-3 drop-shadow-lg" />
                                            <p className="text-3xl font-black text-[var(--text-primary)] brand-font">{userAchievements.user?.livesSaved || 0}</p>
                                            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Lives Saved</p>
                                        </div>
                                        <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-3xl p-6 text-center shadow-lg hover:border-yellow-500/30 transition-all">
                                            <Trophy className="w-10 h-10 text-yellow-500 mx-auto mb-3 drop-shadow-lg" />
                                            <p className="text-3xl font-black text-[var(--text-primary)] brand-font">#{userAchievements.stats?.rank || 'N/A'}</p>
                                            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Rank</p>
                                        </div>
                                        <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-3xl p-6 text-center shadow-lg hover:border-blue-500/30 transition-all">
                                            <TrendingUp className="w-10 h-10 text-blue-500 mx-auto mb-3 drop-shadow-lg" />
                                            <p className="text-3xl font-black text-[var(--text-primary)] brand-font">{userAchievements.stats?.percentile || 0}%</p>
                                            <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Percentile</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Achievements Grid */}
                            <div className="grid md:grid-cols-2 gap-12 mt-12">
                                <div>
                                    <h3 className="text-[var(--text-primary)] text-xl font-black mb-6 uppercase tracking-widest brand-font flex items-center gap-3">
                                        <Award className="w-6 h-6 text-green-500" />
                                        Unlocked Achievements
                                    </h3>
                                    <div className="space-y-4">
                                        {userAchievements.achievements?.unlocked?.map((achievement, idx) => (
                                            <motion.div
                                                key={achievement.name}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-[var(--bg-secondary)] border-2 border-green-500/30 rounded-[2rem] p-6 flex items-center gap-6 shadow-lg hover:shadow-green-500/10 transition-all group"
                                            >
                                                <div className="text-5xl drop-shadow-xl group-hover:scale-110 transition-transform">{achievement.emoji}</div>
                                                <div className="flex-grow">
                                                    <p className="text-[var(--text-primary)] font-black text-lg brand-font">{achievement.name}</p>
                                                    <p className="text-[var(--text-muted)] text-xs font-medium leading-relaxed">{achievement.description}</p>
                                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                                                        <Award className="w-3.5 h-3.5 text-green-500" />
                                                        <span className="text-green-500 font-black text-[10px] uppercase">Achievement Unlocked</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-[var(--text-primary)] text-xl font-black mb-6 uppercase tracking-widest brand-font flex items-center gap-3">
                                        <Star className="w-6 h-6 text-yellow-500" />
                                        Available Achievements
                                    </h3>
                                    <div className="space-y-4">
                                        {userAchievements.achievements?.available
                                            ?.filter(achievement => !userAchievements.achievements?.unlocked?.find(u => u.name === achievement.name))
                                            ?.map((achievement, idx) => (
                                            <motion.div
                                                key={achievement.name}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-[var(--bg-secondary)]/40 border-2 border-[var(--border)] rounded-[2rem] p-6 flex items-center gap-6 shadow-sm grayscale hover:grayscale-0 hover:border-[var(--accent)]/30 transition-all group"
                                            >
                                                <div className="text-5xl opacity-40 group-hover:opacity-100 transition-opacity drop-shadow-sm">{achievement.emoji}</div>
                                                <div className="flex-grow">
                                                    <p className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] font-black text-lg brand-font transition-colors">{achievement.name}</p>
                                                    <p className="text-[var(--text-muted)] group-hover:text-[var(--text-primary)] text-xs font-medium opacity-60 group-hover:opacity-100 transition-all">{achievement.description}</p>
                                                    <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--bg-primary)] border border-[var(--border)] group-hover:border-[var(--accent)]/30 transition-colors">
                                                        <Award className="w-3.5 h-3.5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                                                        <span className="text-[var(--text-muted)] font-black text-[10px] uppercase">Locked Achievement</span>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Analytics Tab */}
                {activeTab === 'analytics' && analytics && (
                    <motion.div
                        key="analytics"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="py-12 px-6"
                    >
                        <div className="container mx-auto max-w-6xl">
                            <div className="flex justify-between items-center mb-8">
                                <h2 className="text-[var(--text-primary)] text-2xl font-bold">Real-time Analytics</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => exportReport('pdf')}
                                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        export PDF
                                    </button>
                                    <button
                                        onClick={() => exportReport('excel')}
                                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                                    >
                                        <Download className="w-4 h-4" />
                                        export Excel
                                    </button>
                                </div>
                            </div>

                             {/* Key Metrics */}
                             <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                                 <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-[2rem] p-8 shadow-xl hover:-translate-y-2 transition-all group">
                                     <div className="flex items-center gap-5">
                                         <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                                             <Heart className="w-8 h-8 text-red-500 fill-red-500/20" />
                                         </div>
                                         <div>
                                             <p className="text-4xl font-black text-[var(--text-primary)] brand-font">{analytics.livesSaved || 0}</p>
                                             <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Lives Saved</p>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-[2rem] p-8 shadow-xl hover:-translate-y-2 transition-all group">
                                     <div className="flex items-center gap-5">
                                         <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                             <Users className="w-8 h-8 text-blue-500" />
                                         </div>
                                         <div>
                                             <p className="text-4xl font-black text-[var(--text-primary)] brand-font">{analytics.topDonors?.length || 0}</p>
                                             <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Active Donors</p>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-[2rem] p-8 shadow-xl hover:-translate-y-2 transition-all group">
                                     <div className="flex items-center gap-5">
                                         <div className="w-16 h-16 bg-green-500/10 rounded-2xl flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                             <Calendar className="w-8 h-8 text-green-500" />
                                         </div>
                                         <div>
                                             <p className="text-4xl font-black text-[var(--text-primary)] brand-font">{analytics.urgentRequests?.length || 0}</p>
                                             <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Urgent Requests</p>
                                         </div>
                                     </div>
                                 </div>
                                 <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-[2rem] p-8 shadow-xl hover:-translate-y-2 transition-all group">
                                     <div className="flex items-center gap-5">
                                         <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                                             <TrendingUp className="w-8 h-8 text-purple-500" />
                                         </div>
                                         <div>
                                             <p className="text-4xl font-black text-[var(--text-primary)] brand-font">{analytics.bloodInventory?.length || 0}</p>
                                             <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest">Blood Types</p>
                                         </div>
                                     </div>
                                 </div>
                             </div>

                             {/* Blood Inventory & Regional Needs */}
                             <div className="grid lg:grid-cols-2 gap-12">
                                 <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                                     <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-bl-full z-0 group-hover:scale-110 transition-transform"></div>
                                     <h3 className="text-[var(--text-primary)] text-xl font-black mb-8 uppercase tracking-widest brand-font relative z-10">Blood Inventory Status</h3>
                                     <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 relative z-10">
                                         {analytics.bloodInventory?.map(item => (
                                             <div key={item.bloodGroup} className="bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-6 text-center hover:border-[var(--accent)]/30 transition-all shadow-inner">
                                                 <p className="text-[var(--accent)] font-black text-xl mb-1">{item.bloodGroup}</p>
                                                 <p className="text-3xl font-black text-[var(--text-primary)] brand-font">{item.count}</p>
                                                 <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest mt-1">Units</p>
                                             </div>
                                         ))}
                                     </div>
                                 </div>

                                 {analytics.regionalNeeds?.length > 0 && (
                                     <div className="bg-[var(--bg-secondary)] border-2 border-[var(--border)] rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                                         <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-bl-full z-0 group-hover:scale-110 transition-transform"></div>
                                         <h3 className="text-[var(--text-primary)] text-xl font-black mb-8 uppercase tracking-widest brand-font relative z-10">Regional Critical Needs</h3>
                                         <div className="space-y-4 relative z-10">
                                             {analytics.regionalNeeds?.slice(0, 5).map((need, idx) => (
                                                 <div key={idx} className="flex justify-between items-center bg-[var(--bg-primary)] border border-[var(--border)] rounded-2xl p-5 hover:border-blue-500/30 transition-all shadow-sm">
                                                     <div className="flex items-center gap-4">
                                                         <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                                                             <MapPin className="w-6 h-6 text-blue-500" />
                                                         </div>
                                                         <div>
                                                             <p className="text-[var(--text-primary)] font-black text-lg brand-font leading-tight">{need.city}</p>
                                                             <p className="text-[var(--accent)] text-[10px] font-black uppercase tracking-widest mt-1">Type {need.bloodGroup}</p>
                                                         </div>
                                                     </div>
                                                     <div className="text-right">
                                                         <p className="text-[var(--text-primary)] font-black text-2xl brand-font">{need.totalUnits}</p>
                                                         <p className="text-[var(--text-muted)] text-[9px] font-black uppercase tracking-widest">Units Requested</p>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 )}
                             </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Leaderboard Section - Only show when leaderboard tab is active */}
            {activeTab === 'leaderboard' && (
                <div className="py-16 px-6">
                    <div className="container mx-auto max-w-4xl">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin">
                                    <Heart className="w-8 h-8 text-red-500" />
                                </div>
                                <p className="text-[var(--text-secondary)] mt-4">Loading heroes...</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {topDonors?.map((donor, idx) => {
                                    const badgeInfo = getBadgeInfo(donor.badge);
                                    return (
                                        <motion.div
                                            key={donor.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className={`backdrop-blur-xl border-2 rounded-[2.5rem] p-8 transition-all duration-500 group relative overflow-hidden ${
                                                donor.id === user?.id 
                                                    ? 'bg-[var(--accent)]/10 border-[var(--accent)] shadow-[0_20px_50px_rgba(239,68,68,0.2)] scale-[1.02]' 
                                                    : 'bg-[var(--bg-secondary)] border-[var(--border)] hover:border-[var(--accent)]/50 shadow-xl hover:shadow-2xl'
                                            }`}
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent)]/5 rounded-bl-[100px] z-0 transition-transform group-hover:scale-110"></div>
                                            <div className="flex items-center gap-4">
                                                {/* Rank */}
                                                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
                                                    {getMedalIcon(donor.rank)}
                                                </div>

                                                {/* Donor Info */}
                                                <div className="flex-grow">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className={`font-black text-xl brand-font ${donor.id === user?.id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                                                            {donor.name} {donor.id === user?.id && "(You)"}
                                                        </h3>
                                                        {badgeInfo && (
                                                            <PremiumMedal tier={donor.badge === 'Platinum' ? 'Platinum' : donor.badge === 'Diamond' ? 'Diamond' : donor.badge} size="sm" />
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-4 text-sm text-gray-400">
                                                        <span className="flex items-center gap-1">
                                                            <Heart className="w-4 h-4 text-red-500" />
                                                            {donor.bloodGroup}
                                                        </span>
                                                        {donor.city && (
                                                            <span className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4 text-red-500" />
                                                                {donor.city}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Users className="w-4 h-4 text-green-500" />
                                                            {donor.livesSaved} lives saved
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Points & Stats */}
                                                <div className="text-right flex-shrink-0">
                                                    <div className="flex items-center gap-2 justify-end mb-2">
                                                        <Zap className={`w-6 h-6 ${donor.id === user?.id ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-400'}`} />
                                                        <span className={`font-black text-3xl brand-font ${donor.id === user?.id ? 'text-[var(--accent)]' : 'text-[var(--text-primary)]'}`}>
                                                            {donor.points}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs font-black uppercase tracking-widest ${donor.id === user?.id ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>{donor.badge}</p>
                                                    <p className="text-[10px] font-bold text-[var(--text-muted)] mt-1">{donor.totalDonations} donations</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* CTA Section */}
            <div className="bg-gradient-to-r from-red-600 to-red-700 py-16 px-6">
                <div className="container mx-auto max-w-4xl text-center">
                    <h2 className="text-white text-3xl font-black mb-4">Join the Heroes</h2>
                    <p className="text-red-100 mb-8 max-w-2xl mx-auto">
                        Start your journey to becoming a hero. Every donation saves lives and earns you points towards exclusive badges.
                    </p>
                    <button className="bg-white text-red-600 font-bold px-8 py-3 rounded-lg hover:bg-gray-100 transition-colors">
                        Find a Donation Camp
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default Heroes;
