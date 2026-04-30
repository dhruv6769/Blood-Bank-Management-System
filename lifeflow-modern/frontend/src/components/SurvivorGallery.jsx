import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Quote, Heart, ChevronRight, X, Calendar, MapPin, Activity, ArrowRight } from 'lucide-react';

import api from '../lib/api';

const stories = [
    {
        id: 1,
        name: "Aarav Sharma",
        email: "aarav@lifeflow.com",
        tagline: "The 4 AM Miracle",
        story: "Following a severe road accident in Delhi, Aarav needed a rare O-negative transfusion in the middle of the night. A LifeFlow donor responded within 8 minutes.",
        image: "/assets/survivors/aarav.png",
        stats: "3 Lives Impacted",
        hospital: "AIIMS, New Delhi",
        date: "Oct 24, 2025",
        gratitude: "I'm alive today because a stranger chose to be a hero at 4 AM. Now, I donate every 3 months to pay it forward."
    },
    {
        id: 2,
        name: "Priya Patel",
        email: "priya@lifeflow.com",
        tagline: "The Warrior's Recovery",
        story: "During her 2-year battle with leukemia in Mumbai, Priya received over 50 units of blood. Today, she is in complete remission and an active donor herself.",
        image: "/assets/survivors/priya.png",
        stats: "6 Donors Matched",
        hospital: "Tata Memorial, Mumbai",
        date: "Jan 12, 2026",
        gratitude: "Every unit was a second chance. The LifeFlow community gave me my life back, one drop at a time."
    },
    {
        id: 3,
        name: "Vikram Singh",
        email: "vikram@lifeflow.com",
        tagline: "A New Life Protected",
        story: "Complications during an emergency surgery in Jaipur required an immediate transfusion. Vikram credits the 'silent heroes' of LifeFlow for his recovery.",
        image: "/assets/survivors/vikram.png",
        stats: "15 Lives Impacted",
        hospital: "Fortis Hospital, Jaipur",
        date: "Dec 05, 2025",
        gratitude: "It was a race against time. Knowing there were people ready to help even in a different city was truly humbling."
    },
    {
        id: 4,
        name: "Ananya Iyer",
        email: "ananya@lifeflow.com",
        tagline: "Back on the Field",
        story: "A surprise sports injury in Bengaluru meant Ananya needed rare B-negative blood fast. The coordination between LifeFlow donors got her back to training.",
        image: "/assets/survivors/ananya.png",
        stats: "3 Lives Impacted",
        hospital: "Manipal Hospital, Bengaluru",
        date: "Feb 18, 2026",
        gratitude: "As an athlete, my body is my life. LifeFlow donors ensured that a setback didn't become an end. I'm forever grateful."
    }
];

const StoryCard = ({ story, idx, onOpen }) => {
    return (
        <Motion.div
            initial={{ opacity: 0, y: 50, rotateX: 15 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: idx * 0.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="group relative h-[650px] w-full rounded-[4rem] overflow-hidden cursor-pointer glass-premium"
            onClick={onOpen}
        >
            {/* Background Image */}
            <Motion.img 
                src={story.image}
                alt={story.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110"
            />
            
            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700"></div>
            <div className="absolute inset-0 bg-[#dc143c]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            {/* Floating Stats Badge */}
            <Motion.div 
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="absolute top-10 right-10 px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl z-20"
            >
                {story.dynamicStats ? `${story.dynamicStats.livesImpacted} Lives Saved` : story.stats}
            </Motion.div>

            {/* Content Area */}
            <div className="absolute inset-x-0 bottom-0 p-12 space-y-6 z-10">
                <Motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-3 text-[#dc143c]"
                >
                    <Heart size={20} className="fill-current" />
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/80">{story.tagline}</span>
                </Motion.div>

                <h3 className="text-5xl font-black text-white tracking-tighter mb-4 group-hover:translate-x-4 transition-transform duration-700 leading-[0.9]">
                    {story.name}
                </h3>
                
                <p className="text-white/70 text-base leading-relaxed max-w-sm transform translate-y-6 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 font-bold tracking-tight">
                    {story.story}
                </p>

                <div className="pt-10 flex justify-between items-center transform translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-1000">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40 mb-1">Grid Location</span>
                      <span className="text-sm font-black text-white/80">{story.hospital}</span>
                    </div>
                    <button className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-[#dc143c] hover:border-[#dc143c] transition-all duration-500">
                        <ArrowRight size={24} />
                    </button>
                </div>
            </div>

            {/* Quote Icon Overlay */}
            <div className="absolute top-12 left-12 w-16 h-16 rounded-2xl bg-[#dc143c] flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-700 shadow-2xl shadow-red-600/50 -rotate-12 group-hover:rotate-0 scale-0 group-hover:scale-100">
                <Quote size={28} />
            </div>
        </Motion.div>
    );
};


const DetailsModal = ({ story, onClose }) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = ''; };
    }, []);

    if (!story) return null;
    
    return (
        <Motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center p-6 bg-black/80 backdrop-blur-3xl"
            onClick={onClose}
        >
            <Motion.div 
                initial={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                animate={{ scale: 1, opacity: 1, rotateX: 0 }}
                exit={{ scale: 0.9, opacity: 0, rotateX: 10 }}
                className="relative w-full max-w-5xl bg-[var(--bg-primary)] border border-white/10 rounded-[4rem] overflow-hidden shadow-2xl glass-premium"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex flex-col lg:flex-row h-full min-h-[600px]">
                    {/* Left: Image Side */}
                    <div className="w-full lg:w-1/2 relative overflow-hidden">
                        <img src={story.image} className="absolute inset-0 w-full h-full object-cover" alt="" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[var(--bg-primary)] hidden lg:block"></div>
                        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] to-transparent block lg:hidden"></div>
                        
                        {/* Status Label */}
                        <div className="absolute top-12 left-12 px-6 py-3 bg-[#dc143c] text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] shadow-2xl">
                           Active Remission
                        </div>
                    </div>
                    
                    {/* Right: Content Side */}
                    <div className="w-full lg:w-1/2 p-16 lg:p-24 flex flex-col justify-center relative">
                        <button onClick={onClose} className="absolute top-12 right-12 text-white/40 hover:text-[#dc143c] bg-white/5 p-4 rounded-3xl border border-white/10 transition-all hover:scale-110">
                            <X size={28} />
                        </button>
                        
                        <div className="space-y-12">
                            <div>
                                <div className="flex items-center gap-4 text-[#dc143c] mb-6">
                                    <Activity size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-[0.5em]">{story.tagline}</span>
                                </div>
                                <h2 className="text-6xl md:text-7xl font-black tracking-tighter leading-[0.9] mb-4">{story.name}</h2>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#dc143c] bg-[#dc143c]/10 px-5 py-2 rounded-full inline-block">
                                    {story.dynamicStats ? `${story.dynamicStats.livesImpacted} Clinical Synchronizations` : story.stats}
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-10 py-10 border-y border-white/5">
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <MapPin size={12} /> Registry Node
                                    </p>
                                    <p className="text-lg font-bold tracking-tight">{story.hospital}</p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Calendar size={12} /> Sync Date
                                    </p>
                                    <p className="text-lg font-bold tracking-tight">{story.date}</p>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                <p className="text-2xl font-bold leading-relaxed italic opacity-90 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">"{story.gratitude}"</p>
                                <p className="text-base font-bold leading-relaxed opacity-60 max-w-lg">{story.story}</p>
                            </div>
                            
                            <button className="btn-nexus w-full py-6 bg-gradient-to-r from-[#dc143c] to-[#9b0023] text-white rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_50px_rgba(220,20,60,0.3)]">
                                Initiate Connection with {story.name.split(' ')[0]}
                            </button>
                        </div>
                    </div>
                </div>
            </Motion.div>
        </Motion.div>
    );
}

const SurvivorGallery = () => {
    const [selectedStory, setSelectedStory] = useState(null);
    const [survivorStats, setSurvivorStats] = useState({});

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/community/survivor-stats');
                if (response.data.status === 'success') {
                    const statsMap = {};
                    response.data.data.forEach(s => {
                        statsMap[s.email] = s;
                    });
                    setSurvivorStats(statsMap);
                }
            } catch (error) {
                console.error('Failed to fetch survivor stats:', error);
            }
        };
        fetchStats();
    }, []);

    // Enhance stories with dynamic data
    const enhancedStories = stories.map(s => ({
        ...s,
        dynamicStats: survivorStats[s.email]
    }));

    return (
        <section className="py-40 relative">
            <div className="container mx-auto px-6">
                <div className="flex flex-col lg:flex-row items-end justify-between mb-32 gap-12">
                    <div className="max-w-3xl space-y-8">
                        <Motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-premium text-[10px] font-black uppercase tracking-[0.4em] text-[#dc143c]"
                        >
                            <Heart size={16} className="fill-current" />
                            Impact Chronicles
                        </Motion.div>
                        <h2 className="text-7xl md:text-9xl font-black tracking-tighter leading-[0.85]">
                            Echos of <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff8080]">Redemption.</span>
                        </h2>
                    </div>
                    <p className="text-2xl text-[var(--text-secondary)] font-bold max-w-md leading-relaxed tracking-tight mb-4 opacity-80">
                        Behind every synchronization is a heartbeat preserved. Explore the elite legacies of LifeFlow.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                    {enhancedStories.map((story, i) => (
                        <StoryCard 
                            key={story.id} 
                            story={story} 
                            idx={i} 
                            onOpen={() => setSelectedStory(story)}
                        />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {selectedStory && (
                        <DetailsModal 
                            story={selectedStory} 
                            onClose={() => setSelectedStory(null)} 
                        />
                    )}
                </AnimatePresence>

                {/* Call to Action Footer — Ultra Premium */}
                <Motion.div 
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="mt-40 p-16 md:p-24 rounded-[4rem] glass-premium flex flex-col lg:flex-row items-center justify-between gap-12 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#dc143c]/10 blur-[120px] rounded-full" />
                    <div className="relative z-10 flex items-center gap-10">
                        <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-[#dc143c] to-[#8b0000] flex items-center justify-center text-white shadow-2xl shadow-red-600/40 shrink-0">
                            <Heart size={48} className="fill-current" />
                        </div>
                        <div>
                            <h4 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">Write your own legacy.</h4>
                            <p className="text-xl font-bold opacity-60 tracking-tight leading-relaxed">Join the global neural grid of life-savers. <br/>It takes 15 minutes to change history.</p>
                        </div>
                    </div>
                    <button className="btn-nexus relative z-10 px-16 py-8 bg-white text-black rounded-[2.5rem] font-black uppercase tracking-[0.3em] text-sm shadow-2xl hover:scale-105 active:scale-95 transition-all">
                        Initiate Hero Protocol
                    </button>
                </Motion.div>
            </div>
        </section>
    );
};

export default SurvivorGallery;
