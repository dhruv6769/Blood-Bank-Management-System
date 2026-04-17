import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Share2, Send, Newspaper, AlertTriangle, ShieldCheck, HeartPulse, Trash2, X, ArrowRight, Clock } from 'lucide-react';
import { useAuthStore } from '../context/authStore';
import { useThemeStore } from '../context/themeStore';
import api from '../lib/api';
import toast from 'react-hot-toast';

const MOCK_NEWS = [
    {
        title: "WHO: Global Blood Shortage Crisis",
        desc: "The World Health Organization reports a critical 20% drop in blood reserves. Type O is urgently needed.",
        icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50",
        tag: "URGENT",
        tagColor: "bg-red-100 text-red-600",
        readTime: "3 min read",
        body: [
            { heading: "The Scale of the Crisis", text: "The World Health Organization has confirmed a critical 20% decline in global blood reserves over the past year. Hospitals in over 40 countries are now reporting shortfalls that are directly affecting surgical outcomes and emergency care." },
            { heading: "Type O: The Most Needed", text: "Type O negative is the universal donor blood type — it can be transfused to any patient in an emergency without blood type matching. Stocks of O-negative are typically the first to run low and are the most urgently needed. If you have O-negative blood, your donation is especially critical." },
            { heading: "Why Are Reserves Dropping?", text: "Several compounding factors contribute to the shortage: a significant post-pandemic drop in donation camp attendance, increased demand from aging populations, and logistical disruptions in blood transport chains. Seasonal trends also play a role, with summer and winter months typically seeing the steepest drops." },
            { heading: "What You Can Do", text: "You can donate blood every 90 days (3 months). A single donation of approximately 450ml can save up to 3 lives. Reach out to your nearest certified donation camp via the LifeFlow platform and schedule an appointment today. Every unit counts." },
        ]
    },
    {
        title: "Pre-Donation Health Tips",
        desc: "Drink an extra 16 oz. of water and eat a healthy meal before your donation. Avoid fatty foods.",
        icon: HeartPulse, color: "text-green-500", bg: "bg-green-50",
        tag: "HEALTH",
        tagColor: "bg-green-100 text-green-600",
        readTime: "4 min read",
        body: [
            { heading: "Hydrate Well, 24 Hours Before", text: "Blood is about 50% water. Drinking an extra 500ml (16 oz.) of water the day before and the morning of your donation makes the process faster and more comfortable. It makes veins easier to find and reduces the feeling of dizziness afterward." },
            { heading: "Eat a Healthy, Iron-Rich Meal", text: "Eat a nutritious meal 2–3 hours before donating. Avoid fatty foods like french fries, burgers, or pizza — fat can interfere with the infectious disease testing done on donated blood. Great pre-donation foods include whole grains, fruits, lean proteins (chicken, fish), and leafy greens." },
            { heading: "Avoid Alcohol & Aspirin", text: "Alcohol is dehydrating and can cause your blood pressure to fluctuate. Aspirin and ibuprofen thin the blood, which can make platelet donations ineffective. Avoid these for at least 24–48 hours before donating." },
            { heading: "Get Good Sleep", text: "Fatigue can lower your blood pressure and hemoglobin levels slightly. Aim for at least 7-8 hours of sleep the night before your appointment to ensure a smooth and comfortable donation experience." },
            { heading: "After Your Donation", text: "Rest for at least 10-15 minutes at the donation site. Eat snacks provided. Avoid strenuous exercise for the rest of the day. Continue drinking fluids for the next 24 hours. Your body will fully replenish the donated plasma within 24 hours and red blood cells within 4-6 weeks." },
        ]
    },
    {
        title: "Red Cross: Iron Rich Diet",
        desc: "Boost your hemoglobin by consuming spinach, red meat, and beans in the days leading up to your drive.",
        icon: ShieldCheck, color: "text-blue-500", bg: "bg-blue-50",
        tag: "NUTRITION",
        tagColor: "bg-blue-100 text-blue-600",
        readTime: "3 min read",
        body: [
            { heading: "Why Iron Matters for Donors", text: "Iron is a key component of hemoglobin, the protein in red blood cells that carries oxygen throughout your body. Donors with low iron levels may be temporarily deferred from donating until their levels recover. Maintaining a good iron-rich diet ensures you are always ready to give." },
            { heading: "Top Iron-Rich Foods", text: "The American Red Cross recommends the following: Heme iron (from animal sources, most easily absorbed) — red meat (beef, liver), dark poultry meat, canned tuna, oysters. Non-heme iron (from plant sources) — spinach, kale, tofu, lentils, beans, fortified cereals, pumpkin seeds." },
            { heading: "Boost Absorption with Vitamin C", text: "Pair your iron-rich foods with a source of Vitamin C (like orange juice, tomatoes, or bell peppers) to significantly increase your body's ability to absorb non-heme iron. Conversely, avoid drinking coffee or tea with your iron-rich meals as they contain tannins that inhibit absorption." },
            { heading: "Consistency Is Key", text: "Start eating iron-rich foods at least 2-3 weeks before your scheduled donation for maximum effect. This gives your body enough time to build up hemoglobin. A single large meal of spinach the night before won't have a significant impact." },
        ]
    },
    {
        title: "New FDA Guidelines Released",
        desc: "Updated eligibility requirements have expanded the donor pool. Check if you are eligible today.",
        icon: Newspaper, color: "text-purple-500", bg: "bg-purple-50",
        tag: "POLICY",
        tagColor: "bg-purple-100 text-purple-600",
        readTime: "5 min read",
        body: [
            { heading: "What Changed?", text: "The U.S. Food and Drug Administration has released updated blood donation eligibility guidelines that represent the most significant policy shift in decades. The changes move away from categorical deferrals based on group identity and toward individual, behavior-based risk assessments." },
            { heading: "Who is Now Eligible?", text: "The core change allows many previously deferred individuals to now donate. Under the new framework, eligibility is primarily determined by recent behavior and health history rather than broad demographics. Specifically, the revised policies now allow more men who have sex with men (MSM) to donate if they meet the same behavioral criteria applied to all donors." },
            { heading: "Travel Deferral Periods Updated", text: "Deferral periods for travel to countries with endemic malaria have been updated and, in some cases, shortened. If you have previously been deferred due to travel, it is worth checking your status again under the new guidelines." },
            { heading: "Tattoo & Piercing Rules", text: "The waiting period after receiving a tattoo or piercing in a licensed establishment has been reviewed. In many regions, this waiting period has been eliminated entirely if the procedure was done by a licensed professional in a sterile environment." },
            { heading: "Check Your Eligibility", text: "Eligibility rules can vary by country and by specific donation center. The best approach is to visit your nearest certified LifeFlow donation camp or blood bank and speak directly with a medical professional. A quick questionnaire at the time of your visit will confirm your eligibility." },
        ]
    },
];

const Community = () => {
    const { user, isAuthenticated } = useAuthStore();
    const { isDark } = useThemeStore();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [commentText, setCommentText] = useState("");
    const [selectedNews, setSelectedNews] = useState(null);

    const fetchPosts = async () => {
        try {
            const res = await api.get('community/posts');
            if (res.data.status === 'success') {
                setPosts(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch posts:", error);
            toast.error("Could not load community feed.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!isAuthenticated) return toast.error("Please login to share a story.");
        if (!newPost.trim()) return;

        try {
            const res = await api.post('community/posts', { content: newPost });
            if (res.data.status === 'success') {
                setPosts([res.data.data, ...posts]);
                setNewPost("");
                toast.success("Story posted successfully!");
            }
        } catch {
            toast.error("Failed to post story.");
        }
    };

    const handleToggleLike = async (postId) => {
        if (!isAuthenticated) return toast.error("Please login to like posts.");
        try {
            const res = await api.post(`community/posts/${postId}/like`);
            if (res.data.status === 'success') {
                setPosts(posts.map(p => {
                    if (p.id === postId) return { ...p, likes: res.data.data.likes };
                    return p;
                }));
            }
        } catch {
            toast.error("Failed to like post.");
        }
    };

    const handleAddComment = async (e, postId) => {
        e.preventDefault();
        if (!isAuthenticated) return toast.error("Please login to comment.");
        if (!commentText.trim()) return;

        try {
            const res = await api.post(`community/posts/${postId}/comment`, { text: commentText });
            if (res.data.status === 'success') {
                setPosts(posts.map(p => {
                    if (p.id === postId) return { ...p, comments: res.data.data };
                    return p;
                }));
                setCommentText("");
            }
        } catch {
            toast.error("Failed to add comment.");
        }
    };

    const handleDeleteComment = async (commentId, postId) => {
        try {
            const res = await api.delete(`community/comments/${commentId}`);
            if (res.data.status === 'success') {
                setPosts(posts.map(p => {
                    if (p.id === postId) return { ...p, comments: res.data.data };
                    return p;
                }));
                toast.success("Comment deleted");
            }
        } catch {
            toast.error("Failed to delete comment.");
        }
    };

    const handleDeletePost = async (postId) => {
        try {
            const res = await api.delete(`community/posts/${postId}`);
            if (res.data.status === 'success') {
                setPosts(posts.filter(p => p.id !== postId));
                toast.success("Story deleted");
            }
        } catch (error) {
            console.error("Delete Post Error:", error.response?.data || error.message);
            toast.error(error.response?.data?.message || "Failed to delete story.");
        }
    };

    const hasUserLiked = (likes) => {
        if (!user) return false;
        return likes.some(like => like.userId === user.id);
    };

    return (
        <div className={`min-h-screen ${isDark ? 'bg-[#050510]' : 'bg-gray-50'} flex flex-col font-sans selection:bg-red-500/30 transition-colors duration-500`}>
            {/* News Detail Overlay */}
            <AnimatePresence>
                {selectedNews && (
                    <Motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 z-50 ${isDark ? 'bg-[#050510]/80' : 'bg-black/20'} backdrop-blur-xl flex items-center justify-end p-4 md:p-0`}
                        onClick={() => setSelectedNews(null)}
                    >
                        <Motion.div
                            initial={{ x: '100%', opacity: 0.5 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: '100%', opacity: 0.5 }}
                            transition={{ type: 'spring', damping: 30, stiffness: 200 }}
                            className={`w-full max-w-xl h-full ${isDark ? 'bg-[#0a0a1a] border-white/10' : 'bg-white border-gray-100'} border-l shadow-[0_0_100px_rgba(0,0,0,0.3)] overflow-y-auto relative`}
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Panel Background Elements */}
                            <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-red-600/10 to-transparent pointer-events-none"></div>

                            <div className="p-10 pb-8 relative z-10">
                                <div className="flex items-start justify-between mb-8">
                                    <span className={`text-[10px] font-black uppercase tracking-[0.3em] px-4 py-2 rounded-lg border ${selectedNews.tagColor.replace('bg-', 'bg-').replace('-100', '-500/10').replace('text-', 'text-')} ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
                                        {selectedNews.tag}
                                    </span>
                                    <button onClick={() => setSelectedNews(null)} className={`${isDark ? 'text-white/20 hover:text-white hover:bg-white/5 border-white/10' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100 border-gray-100'} transition-all p-2 rounded-xl border`}>
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-8 border ${isDark ? 'border-white/10' : 'border-gray-100'} shadow-2xl ${selectedNews.bg.replace('bg-', 'bg-').replace('-50', '-500/10')} ${selectedNews.color}`}>
                                    <selectedNews.icon className="w-8 h-8" />
                                </div>
                                <h2 className={`text-4xl font-black ${isDark ? 'text-white' : 'text-gray-900'} leading-[1.1] mb-6 brand-font tracking-tighter`}>{selectedNews.title}</h2>
                                <div className={`flex items-center gap-3 ${isDark ? 'text-white/30' : 'text-gray-400'}`}>
                                    <Clock className="w-4 h-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{selectedNews.readTime}</span>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'} mx-10`} />

                            {/* Article Body */}
                            <div className="p-10 space-y-10 relative z-10">
                                {selectedNews.body.map((section, idx) => (
                                    <Motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.2 + idx * 0.1 }}
                                    >
                                        <h3 className={`text-xs font-black ${isDark ? 'text-white/50' : 'text-gray-400'} uppercase tracking-[0.2em] mb-4 flex items-center gap-4`}>
                                            <span className="w-8 h-px bg-red-500/50"></span>
                                            {section.heading}
                                        </h3>
                                        <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} leading-relaxed font-medium text-[15px]`}>{section.text}</p>
                                    </Motion.div>
                                ))}
                            </div>

                            {/* CTA Footer */}
                            <div className="px-10 pb-12 relative z-10">
                                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} rounded-[2rem] p-8 border backdrop-blur-3xl shadow-2xl overflow-hidden relative group`}>
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 rounded-full blur-[50px] pointer-events-none"></div>
                                    <p className={`text-[10px] font-black ${isDark ? 'text-white/30' : 'text-gray-400'} uppercase tracking-[0.3em] mb-6`}>Join the movement</p>
                                    <a href="/dashboard?section=donate" className="flex items-center justify-between w-full bg-red-600 text-white px-8 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-500 transition-all shadow-2xl shadow-red-600/40 hover:-translate-y-1">
                                        <span>Schedule Donation</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </a>
                                </div>
                            </div>
                        </Motion.div>
                    </Motion.div>
                )}
            </AnimatePresence>
            {/* Minimal Parallax Header */}
            <div className={`relative h-80 overflow-hidden ${isDark ? 'bg-black' : 'bg-gray-900'} border-b ${isDark ? 'border-white/5' : 'border-gray-200'}`}>
                <div className={`absolute inset-0 ${isDark ? 'bg-gradient-to-br from-red-600/40 via-black/90 to-blue-900/40' : 'bg-gradient-to-br from-red-600/20 via-white/40 to-blue-900/20'} z-10 backdrop-blur-[2px]`}></div>
                <img 
                    src="https://images.unsplash.com/photo-1516574187841-cb9cc2ca948b?auto=format&fit=crop&q=80&w=2560" 
                    alt="Community backdrop"
                    className="w-full h-full object-cover opacity-30 parallax-bg"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                    <Motion.div 
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-white/20 border-white/30 text-white'} border text-[10px] font-black tracking-[0.3em] uppercase mb-6 backdrop-blur-3xl shadow-2xl`}>
                            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]"></span>
                            Urgent Community Pulse
                        </div>
                        <h1 className="text-6xl md:text-8xl font-black text-white brand-font tracking-tighter mb-4">
                            The <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-300">Hub.</span>
                        </h1>
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-200'} font-bold tracking-widest uppercase text-[10px]`}>Connecting Silent Heroes Worldwide</p>
                    </Motion.div>
                </div>
                
                {/* Bottom Mesh Gradient */}
                <div className={`absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t ${isDark ? 'from-[#050510]' : 'from-gray-50'} to-transparent z-15`}></div>
            </div>

            <div className="container mx-auto px-4 lg:px-6 py-12 flex-grow flex flex-col lg:flex-row gap-8 lg:gap-12 relative z-20">
                
                {/* Left Sidebar: News & Awareness (Sticky) */}
                <div className="lg:w-1/3">
                    <div className="sticky top-28 space-y-6">
                        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} rounded-3xl p-7 border backdrop-blur-3xl shadow-2xl relative overflow-hidden group`}>
                            {/* Ambient glow */}
                            <div className={`absolute -top-20 -right-20 w-40 h-40 ${isDark ? 'bg-red-500/10' : 'bg-red-500/5'} rounded-full blur-3xl pointer-events-none group-hover:bg-red-500/20 transition-all duration-700`}></div>
                            
                            <h2 className={`text-[10px] font-black ${isDark ? 'text-white/40' : 'text-gray-400'} uppercase tracking-[0.3em] mb-8 flex items-center gap-3`}>
                                <span className="w-4 h-px bg-red-500/50"></span>
                                News Pulse
                            </h2>
                            
                            <div className="space-y-6">
                                {MOCK_NEWS.map((news, i) => (
                                    <Motion.div 
                                        key={i} 
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.1 }}
                                        onClick={() => setSelectedNews(news)}
                                        className={`group/item relative rounded-2xl p-4 transition-all ${isDark ? 'hover:bg-white/5 border-transparent hover:border-white/10' : 'hover:bg-gray-50 border-transparent hover:border-gray-200'} border cursor-pointer`}
                                    >
                                        <div className="flex gap-5">
                                            <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${isDark ? 'border-white/10' : 'border-gray-100'} ${news.bg.replace('bg-', 'bg-').replace('-50', '-500/10')} ${news.color}`}>
                                                <news.icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-widest ${news.tagColor.replace('bg-', 'bg-').replace('-100', '-500/20').replace('text-', 'text-')}`}>{news.tag}</span>
                                                    <span className={`text-[9px] ${isDark ? 'text-white/30' : 'text-gray-400'} font-bold tracking-widest`}>{news.readTime}</span>
                                                </div>
                                                <h3 className={`text-sm font-black ${isDark ? 'text-white' : 'text-gray-900'} group-hover/item:text-red-400 transition-colors leading-tight mb-2 brand-font tracking-tight`}>{news.title}</h3>
                                                <p className={`text-[11px] ${isDark ? 'text-white/50' : 'text-gray-500'} leading-relaxed font-medium line-clamp-2`}>{news.desc}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Hover Indicator */}
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-all group-hover/item:right-4">
                                            <ArrowRight className="w-4 h-4 text-red-500" />
                                        </div>
                                    </Motion.div>
                                ))}
                            </div>
                        </div>
                        
                        <Motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-gradient-to-br from-red-600 to-red-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-red-950/50 overflow-hidden relative group cursor-pointer hover:scale-[1.02] transition-all duration-500"
                        >
                            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-[60px] z-0 group-hover:scale-150 transition-transform duration-1000"></div>
                            <div className="relative z-10">
                                <h3 className="text-3xl font-black brand-font mb-4 text-white leading-tight">Be the<br/>Inspiration.</h3>
                                <p className="text-red-100/70 text-sm mb-8 font-medium leading-relaxed">Your story could be the final nudge someone needs to become a life-saving hero today.</p>
                                <div className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.2em] bg-white/10 px-5 py-3 rounded-xl border border-white/20 group-hover:bg-red-500 transition-colors">
                                    Tell Your Story <ArrowRight className="w-4 h-4" />
                                </div>
                            </div>
                            <Heart className="w-32 h-32 text-white/5 absolute -bottom-8 -right-8 z-0 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        </Motion.div>
                    </div>
                </div>

                {/* Right Area: The Donor Feed */}
                <div className="lg:w-2/3 max-w-3xl lg:max-w-none mx-auto w-full space-y-6">
                    
                    {/* Create Post Box */}
                    {isAuthenticated && (
                        <Motion.div 
                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                            className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} rounded-[2.5rem] p-6 md:p-10 border backdrop-blur-3xl shadow-2xl relative overflow-hidden group`}
                        >
                            <div className="absolute -top-20 -right-20 w-64 h-64 bg-red-500/5 rounded-full blur-[100px] pointer-events-none group-hover:bg-red-500/10 transition-all duration-1000"></div>
                            
                            <form onSubmit={handleCreatePost} className="relative z-10">
                                <div className="flex gap-6 mb-8">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-500/20 to-red-500/5 border border-white/10 shadow-inner flex items-center justify-center shrink-0">
                                        <span className="font-black text-red-500 text-xl brand-font">{user?.name?.charAt(0)}</span>
                                    </div>
                                    <div className="flex-1 relative">
                                        <textarea 
                                            value={newPost}
                                            onChange={(e) => setNewPost(e.target.value)}
                                            placeholder="Share your heroic journey..."
                                            className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/20' : 'bg-gray-50 border-gray-100 text-gray-900 placeholder-gray-400'} border rounded-2xl px-6 py-5 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/40 transition-all resize-none font-medium h-32 shadow-2xl`}
                                        />
                                        <div className={`absolute bottom-4 right-4 text-[10px] font-black ${isDark ? 'text-white/20' : 'text-gray-300'} uppercase tracking-widest`}>Inspiration Flow</div>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pl-20">
                                    <div className="flex gap-4 text-white/40">
                                        {/* Symbolic placeholders for media upload or other future features */}
                                        <div className="p-2 hover:text-white transition-colors cursor-pointer"><Share2 className="w-4 h-4" /></div>
                                        <div className="p-2 hover:text-white transition-colors cursor-pointer"><Heart className="w-4 h-4" /></div>
                                    </div>
                                    <button 
                                        type="submit" 
                                        disabled={!newPost.trim()}
                                        className="bg-red-600 text-white px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-red-500 transition-all flex items-center gap-3 shadow-2xl shadow-red-600/40 disabled:opacity-30 hover:-translate-y-1 active:translate-y-0"
                                    >
                                        Share Story <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </form>
                        </Motion.div>
                    )}

                    {/* Feed Loading & Empty States */}
                    {isLoading ? (
                        <div className="flex justify-center items-center py-20">
                            <div className="w-10 h-10 border-4 border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} rounded-[2rem] p-16 text-center shadow-lg border`}>
                            <div className="w-20 h-20 bg-gray-50/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageCircle className={`w-10 h-10 ${isDark ? 'text-white/10' : 'text-gray-200'}`} />
                            </div>
                            <h3 className={`text-xl font-black ${isDark ? 'text-white' : 'text-gray-900'} mb-2 brand-font`}>No stories yet</h3>
                            <p className={`${isDark ? 'text-white/40' : 'text-gray-500'} font-medium`}>Be the first to share your hero's journey.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <AnimatePresence>
                                {posts.map((post) => (
                                    <Motion.div 
                                        key={post.id}
                                        initial={{ opacity: 0, scale: 0.95 }} 
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100'} rounded-[2.5rem] p-8 border backdrop-blur-3xl shadow-2xl transition-all hover:bg-white/10 hover:-translate-y-1 group relative overflow-hidden`}
                                    >
                                        {/* Ambient Glow */}
                                        <div className={`absolute -bottom-20 -left-20 w-40 h-40 ${isDark ? 'bg-white/5' : 'bg-gray-50'} rounded-full blur-[80px] pointer-events-none group-hover:bg-white/10 transition-all duration-700`}></div>

                                        {/* Post Header */}
                                        <div className="flex items-center justify-between mb-8 relative z-10">
                                            <div className="flex items-center gap-5">
                                                <div className={`w-14 h-14 rounded-2xl ${isDark ? 'bg-gradient-to-br from-white/10 to-transparent border-white/20' : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-200'} border shadow-2xl flex items-center justify-center shrink-0`}>
                                                    <span className={`font-black ${isDark ? 'text-white' : 'text-gray-900'} text-xl brand-font`}>{post.user?.name?.charAt(0)}</span>
                                                </div>
                                                <div>
                                                    <h4 className={`font-black ${isDark ? 'text-white' : 'text-gray-900'} flex items-center gap-2 brand-font tracking-tight text-lg`}>
                                                        {post.user?.name}
                                                        {post.user?.role === 'ORGANIZATION' && <ShieldCheck className="w-4 h-4 text-blue-400" title="Verified Organization" />}
                                                    </h4>
                                                    <p className={`text-[10px] ${isDark ? 'text-white/40' : 'text-gray-400'} font-bold flex items-center gap-3 uppercase tracking-widest`}>
                                                        {new Date(post.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        <span className={`w-1 h-1 ${isDark ? 'bg-white/20' : 'bg-gray-300'} rounded-full`}></span>
                                                        <span className="text-red-500 font-black tracking-[0.2em]">{post.user?.bloodGroup || 'Donor'}</span>
                                                    </p>
                                                </div>
                                            </div>
                                            {(user?.id === post.userId || user?.role === 'ADMIN') && (
                                                <button 
                                                    onClick={() => handleDeletePost(post.id)}
                                                    className="text-white/20 hover:text-red-500 transition-all p-3 rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                                                    title="Delete Story"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>

                                        {/* Post Content */}
                                        <p className={`${isDark ? 'text-white/80' : 'text-gray-700'} leading-relaxed font-medium text-[16px] mb-8 whitespace-pre-wrap relative z-10`}>{post.content}</p>

                                        {/* Post Actions */}
                                        <div className={`flex items-center gap-8 pt-6 border-t ${isDark ? 'border-white/5' : 'border-gray-100'} relative z-10`}>
                                            <button 
                                                onClick={() => handleToggleLike(post.id)}
                                                className={`flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all group/btn ${hasUserLiked(post.likes) ? 'text-red-500' : `${isDark ? 'text-white/40 hover:text-red-500' : 'text-gray-400 hover:text-red-500'}`}`}
                                            >
                                                <div className={`p-2 rounded-xl transition-all ${hasUserLiked(post.likes) ? 'bg-red-500/20' : `${isDark ? 'bg-white/5 group-hover/btn:bg-red-500/10' : 'bg-gray-50 group-hover/btn:bg-red-50'}`}`}>
                                                    <Heart className={`w-5 h-5 ${hasUserLiked(post.likes) ? 'fill-current' : ''} transition-all active:scale-75`} />
                                                </div>
                                                <span>{post.likes.length > 0 ? post.likes.length : ''} Like</span>
                                            </button>
                                            
                                            <button 
                                                onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                                                className={`flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.15em] transition-all group/btn ${activeCommentPostId === post.id ? 'text-blue-400' : `${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'}`}`}
                                            >
                                                <div className={`p-2 rounded-xl transition-all ${activeCommentPostId === post.id ? 'bg-blue-400/20' : `${isDark ? 'bg-white/5 group-hover/btn:bg-white/10' : 'bg-gray-50 group-hover/btn:bg-gray-100'}`}`}>
                                                    <MessageCircle className="w-5 h-5 transition-transform active:scale-75" />
                                                </div>
                                                <span>{post.comments.length > 0 ? post.comments.length : ''} Comment</span>
                                            </button>
                                            
                                            <button className={`flex items-center gap-2.5 text-xs font-black uppercase tracking-[0.15em] ${isDark ? 'text-white/40 hover:text-white' : 'text-gray-400 hover:text-gray-900'} transition-all ml-auto group/btn`}>
                                                <div className={`p-2 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'} group-hover/btn:${isDark ? 'bg-white/10' : 'bg-gray-100'} transition-all`}>
                                                    <Share2 className="w-4 h-4" />
                                                </div>
                                                <span>Share</span>
                                            </button>
                                        </div>

                                        {/* Comments Section */}
                                        <AnimatePresence>
                                            {activeCommentPostId === post.id && (
                                                <Motion.div 
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                                                    className="overflow-hidden"
                                                >
                                                    <div className="mt-8 pt-8 border-t border-white/5 space-y-6">
                                                        {post.comments.map(comment => (
                                                            <Motion.div 
                                                                key={comment.id} 
                                                                initial={{ opacity: 0, x: -10 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                className="flex gap-4"
                                                            >
                                                                <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-100'} border ${isDark ? 'border-white/10' : 'border-gray-200'} flex items-center justify-center shrink-0 mt-1`}>
                                                                    <span className={`font-black ${isDark ? 'text-white/40' : 'text-gray-400'} text-xs brand-font`}>{comment.user?.name?.charAt(0)}</span>
                                                                </div>
                                                                <div className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} border rounded-2xl rounded-tl-none p-4 px-5 w-full backdrop-blur-md relative group/comment`}>
                                                                    <div className="flex items-center justify-between mb-2">
                                                                       <div className="flex items-center gap-3">
                                                                           <span className={`font-black ${isDark ? 'text-white' : 'text-gray-900'} text-sm brand-font tracking-tight`}>{comment.user?.name}</span>
                                                                           <span className={`text-[10px] font-bold ${isDark ? 'text-white/20' : 'text-gray-400'} uppercase tracking-widest`}>
                                                                               {new Date(comment.createdAt).toLocaleDateString()}
                                                                           </span>
                                                                       </div>
                                                                       {(user?.id === comment.userId || user?.role === 'ADMIN') && (
                                                                           <button 
                                                                               onClick={() => handleDeleteComment(comment.id, post.id)}
                                                                               className="opacity-0 group-hover/comment:opacity-100 text-white/20 hover:text-red-500 transition-all p-1.5 rounded-lg hover:bg-red-500/10"
                                                                               title="Delete Comment"
                                                                           >
                                                                               <Trash2 className="w-3.5 h-3.5" />
                                                                           </button>
                                                                       )}
                                                                    </div>
                                                                    <p className={`${isDark ? 'text-white/70' : 'text-gray-600'} text-[14px] font-medium leading-relaxed`}>{comment.text}</p>
                                                                </div>
                                                            </Motion.div>
                                                        ))}
                                                        
                                                        {isAuthenticated && (
                                                            <form onSubmit={(e) => handleAddComment(e, post.id)} className="flex gap-4 mt-8 relative">
                                                                <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
                                                                    <span className="font-black text-red-500 text-xs brand-font">{user?.name?.charAt(0)}</span>
                                                                </div>
                                                                <div className="flex-1 relative">
                                                                    <input 
                                                                        type="text"
                                                                        value={(activeCommentPostId === post.id) ? commentText : ""}
                                                                        onChange={(e) => setCommentText(e.target.value)}
                                                                        placeholder="Add to the story..."
                                                                        className={`w-full ${isDark ? 'bg-white/5 border-white/10 text-white placeholder-white/20' : 'bg-gray-100 border-gray-200 text-gray-900 placeholder-gray-400'} border rounded-xl px-6 py-3 focus:outline-none focus:ring-4 focus:ring-red-500/10 focus:border-red-500/40 transition-all font-medium text-sm shadow-2xl`}
                                                                    />
                                                                    <button 
                                                                        type="submit"
                                                                        disabled={!commentText.trim()}
                                                                        className="absolute right-2 top-1.5 bg-red-600 text-white w-8 h-8 rounded-lg flex items-center justify-center hover:bg-red-500 transition-all shrink-0 disabled:opacity-20 shadow-lg"
                                                                    >
                                                                        <Send className="w-3.5 h-3.5" />
                                                                    </button>
                                                                </div>
                                                            </form>
                                                        )}
                                                    </div>
                                                </Motion.div>
                                            )}
                                        </AnimatePresence>

                                    </Motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Community;
