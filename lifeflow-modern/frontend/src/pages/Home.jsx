import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Heart, Activity, Users, ShieldCheck, ArrowRightLeft, ArrowRight, Navigation, Play, ChevronRight, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import api from '../lib/api';
import LifePulseMap from '../components/LifePulseMap';
import SurvivorGallery from '../components/SurvivorGallery';
import LifePath from '../components/LifePath';
import AboutCreator from '../components/AboutCreator';

const Counter = ({ end, duration = 2.5, suffix = "", inView = true }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let startTime = null;
    let frameId;
    
    const animate = (time) => {
      if (!startTime) startTime = time;
      const progress = Math.min((time - startTime) / (duration * 1000), 1);
      const easing = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easing * end));
      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };
    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [end, duration, inView]);

  return <span>{count}{suffix}</span>;
};



const LiquidHero = () => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <div className="mesh-gradient">
                <Motion.div 
                    animate={{ 
                        x: [0, 100, -50, 0], 
                        y: [0, -50, 50, 0],
                        scale: [1, 1.2, 0.8, 1],
                        rotate: [0, 90, -90, 0]
                    }} 
                    transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                    className="mesh-blob w-[1000px] h-[1000px] -top-[400px] -left-[400px] bg-[#dc143c]" 
                />
                <Motion.div 
                    animate={{ 
                        x: [0, -100, 50, 0], 
                        y: [0, 100, -50, 0],
                        scale: [1, 0.8, 1.2, 1],
                        rotate: [0, -90, 90, 0]
                    }} 
                    transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                    className="mesh-blob w-[800px] h-[800px] -bottom-[200px] -right-[200px] bg-indigo-600" 
                />
            </div>
            
            {/* Orbiting Blood Cells (3D Effect) */}
            {[1, 2, 3, 4, 5].map((i) => (
                <Motion.div
                    key={i}
                    animate={{ 
                        rotate: 360,
                        x: [0, 20, -20, 0],
                        y: [0, -20, 20, 0]
                    }}
                    transition={{ 
                        rotate: { duration: 20 + i * 5, repeat: Infinity, ease: "linear" },
                        x: { duration: 5 + i, repeat: Infinity, ease: "easeInOut" },
                        y: { duration: 6 + i, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute top-1/2 left-1/2"
                    style={{ width: 100 + i * 40, height: 100 + i * 40, marginLeft: -(50 + i * 20), marginTop: -(50 + i * 20) }}
                >
                    <div 
                        className="w-4 h-4 bg-red-500 rounded-full blur-[2px] shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                        style={{ transform: `translateX(${50 + i * 20}px)` }}
                    />
                </Motion.div>
            ))}
        </div>
    );
};

const EmergencyTicker = () => {
    return (
        <div className="w-full bg-[#dc143c] py-4 overflow-hidden relative z-30 shadow-[0_10px_30px_rgba(220,20,60,0.3)]">
            <Motion.div 
                animate={{ x: [0, -2000] }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="flex whitespace-nowrap items-center gap-12"
            >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="flex items-center gap-8 text-white font-black uppercase tracking-[0.3em] text-[10px]">
                        <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-white animate-pulse" /> EMERGENCY UPLINK ACTIVE</span>
                        <span className="opacity-50">O- NEGATIVE REQUIRED IN SECTOR 7</span>
                        <span className="flex items-center gap-2"><Activity size={14} /> LIVE BLOOD MATRIX SYNCING...</span>
                        <span className="opacity-50">NEW DONOR VERIFIED IN REGIONAL NODE 4</span>
                    </div>
                ))}
            </Motion.div>
        </div>
    );
};

const Home = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    livesSaved: 15420,
    activeDonors: 8750,
    successfulUnits: 21000,
    verifiedCenters: 450
  });
  
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const opacityText = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const scaleHero = useTransform(scrollYProgress, [0, 0.7], [1, 1.1]);
  const blurHero = useTransform(scrollYProgress, [0, 0.7], [0, 10]);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('public-stats');
        if (response.data.status === 'success') {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div 
      className="w-full overflow-hidden font-sans noise" 
      style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}
    >

      {/* Cinematic Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
         {/* Background Image with Overlay */}
         <div className="absolute inset-0 z-0">
            <img 
               src="/images/hero_bg.png" 
               className="w-full h-full object-cover" 
               alt="LifeFlow Hero"
            />
            <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
         </div>

         <div className="container mx-auto px-6 relative z-10">
             <Motion.div 
               style={{ opacity: opacityText, scale: scaleHero, filter: `blur(${blurHero}px)` }}
               className="text-center"
             >
                <Motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-red-500 text-white text-[10px] font-black tracking-[0.4em] uppercase mb-12 shadow-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  SAVE LIVES TODAY
                </Motion.div>
                
                <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-black mb-12 tracking-tighter leading-[0.9] text-white">
                   <Motion.span 
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="block"
                   >
                     Donate Blood.
                   </Motion.span>
                   <Motion.span 
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    className="block text-[#ff3b5c]"
                   >
                     Inspire Humanity.
                   </Motion.span>
                </h1>
                
                <Motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.9 }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="text-xl md:text-2xl text-white font-bold max-w-4xl mx-auto mb-16 leading-relaxed tracking-tight"
                >
                   Join an elite network of heroes. Every drop you give fuels the future, saving up to three lives with a single heroic act.
                </Motion.p>
                
                <Motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.7 }}
                  className="flex flex-col sm:flex-row items-center justify-center gap-8"
                >
                   <Link to={user ? (user.role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard') : '/register'} 
                         className="group px-12 py-6 bg-[#dc143c] rounded-[2.5rem] font-black text-white w-full sm:w-auto text-center shadow-[0_20px_50px_rgba(220,20,60,0.4)] hover:scale-105 transition-all">
                      <span className="flex items-center justify-center gap-3 text-lg uppercase tracking-widest">
                         {user ? 'Enter Dashboard' : 'Become a Hero'} <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform"/>
                      </span>
                   </Link>
                   
                   <Link to="/camps" 
                         className="group px-12 py-6 bg-black/40 backdrop-blur-xl border border-white/20 rounded-[2.5rem] font-black text-white w-full sm:w-auto text-center flex items-center justify-center gap-3 text-lg uppercase tracking-widest hover:bg-black/60 transition-all">
                      Find Active Camps <Navigation size={24} className="text-[#dc143c] group-hover:-translate-y-1 transition-transform"/>
                   </Link>
                </Motion.div>
             </Motion.div>
         </div>

         {/* Info Cards Overlay */}
         <div className="absolute bottom-32 left-12 z-20 hidden lg:block">
            <Motion.div 
               initial={{ opacity: 0, x: -50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 1 }}
               className="glass-premium p-6 rounded-[2rem] border-white/10 flex items-center gap-6 bg-black/20"
            >
               <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500">
                  <Activity size={28} />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">LIVE STATUS</p>
                  <p className="text-xl font-black text-white">Emergency Active</p>
               </div>
            </Motion.div>
         </div>

         <div className="absolute top-40 right-12 z-20 hidden lg:block">
            <Motion.div 
               initial={{ opacity: 0, x: 50 }}
               animate={{ opacity: 1, x: 0 }}
               transition={{ delay: 1.2 }}
               className="glass-premium p-6 rounded-[2rem] border-white/10 flex items-center gap-6 bg-black/20"
            >
               <div className="w-14 h-14 rounded-2xl bg-[#dc143c]/20 flex items-center justify-center text-[#dc143c]">
                  <Heart size={28} fill="currentColor" />
               </div>
               <div>
                  <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">TRUSTED NETWORK</p>
                  <p className="text-xl font-black text-white">50+ Verified Hospitals</p>
               </div>
            </Motion.div>
         </div>

         {/* Cinematic Scroll Indicator */}
         <Motion.div 
           animate={{ y: [0, 10, 0] }}
           transition={{ duration: 2, repeat: Infinity }}
           className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 opacity-30"
         >
           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Sync Scroll</span>
           <div className="w-px h-12 bg-gradient-to-b from-[#dc143c] to-transparent" />
         </Motion.div>
      </section>

      <EmergencyTicker />

      {/* Stats Section — Ultra Premium Glassmorphism */}
      <section className="relative z-20 py-32 px-6">
         <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                {[
                  { icon: Heart, label: "Neural Lives Saved", value: stats.livesSaved, suffix: "+", color: "#ff3b5c", glowColor: "rgba(255,59,92,0.3)" },
                  { icon: Users, label: "Active Network Nodes", value: stats.activeDonors, suffix: "+", color: "#6366f1", glowColor: "rgba(99,102,241,0.3)" },
                  { icon: Activity, label: "Clinical Success Units", value: stats.successfulUnits, suffix: "", color: "#10b981", glowColor: "rgba(16,185,129,0.3)" },
                  { icon: ShieldCheck, label: "Verified Care Centers", value: stats.verifiedCenters, suffix: "", color: "#8b5cf6", glowColor: "rgba(139,92,246,0.3)" },
                ].map((stat, idx) => (
                  <Motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    whileHover={{ y: -12, scale: 1.05 }}
                    className="glass-premium p-10 rounded-[2.5rem] relative overflow-hidden cursor-pointer group"
                  >
                    <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-[60px] opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ background: stat.glowColor }} />
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6" style={{ backgroundColor: `${stat.color}15`, color: stat.color, border: `1px solid ${stat.color}30` }}>
                       <stat.icon size={28} />
                    </div>
                    <h3 className="text-5xl lg:text-6xl font-black mb-2 tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                       <Counter end={stat.value} suffix={stat.suffix} inView={true} />
                    </h3>
                    <p className="font-black uppercase tracking-[0.2em] text-[10px] opacity-60" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                    
                    {/* Progress Bar Micro-animation */}
                    <div className="mt-8 h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <Motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        transition={{ duration: 2, delay: 0.5 }}
                        className="h-full"
                        style={{ background: `linear-gradient(90deg, transparent, ${stat.color})` }}
                      />
                    </div>
                  </Motion.div>
                ))}
            </div>
         </div>
      </section>

      <LifePulseMap />

      <SurvivorGallery />

      <LifePath />
      {/* Editorial 'How it Works' Cards */}
      <section className="py-40 relative">
         <div className="container mx-auto px-6">
            <Motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once:true }}
              className="text-center max-w-4xl mx-auto mb-32"
            >
               <h2 className="text-[10px] font-black tracking-[0.5em] uppercase mb-6 inline-block px-6 py-2 rounded-full text-[#dc143c] bg-[#dc143c]/10 border border-[#dc143c]/20">The Protocol</h2>
               <h3 className="text-6xl md:text-8xl font-black tracking-tighter mt-4 text-glow" style={{ color: 'var(--text-primary)' }}>
                 Nexus <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff8080]">Synchronization.</span>
               </h3>
            </Motion.div>
 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800", title: "Sterile Node Prep", desc: "Equipped with state-of-the-art sterile tools, the synchronization takes merely 10 minutes in a high-fidelity clinical environment.", num: "01" },
                  { img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", title: "Neural Vitals Scan", desc: "Every participant receives a complimentary advanced clinical diagnostic, tracking vital metrics and hemoglobin levels.", num: "02" },
                  { img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800", title: "Triple Impact", desc: "A single unit is separated into plasma, platelets, and red cells — amplifying your contribution to save three lives.", num: "03" }
                ].map((card, i) => (
                  <Motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 50, rotateX: 10 }}
                    whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.2, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                    className="group relative rounded-[3rem] overflow-hidden glass-premium h-[600px] cursor-pointer"
                  >
                     <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-110 blur-[2px] group-hover:blur-0" />
                     <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/40 to-transparent opacity-90 group-hover:opacity-70 transition-opacity duration-700"></div>
                     
                     <div className="absolute inset-0 p-10 flex flex-col justify-end text-left">
                        <span className="text-[var(--text-primary)] opacity-10 font-black text-9xl absolute -top-10 -right-5 transform group-hover:translate-x-10 transition-transform duration-1000">{card.num}</span>
                        <div className="relative z-10 transform group-hover:-translate-y-4 transition-transform duration-700">
                          <h4 className="text-4xl font-black text-[var(--text-primary)] mb-4 leading-[1.1]">{card.title}</h4>
                          <p className="text-[var(--text-secondary)] text-base font-bold leading-relaxed opacity-0 group-hover:opacity-100 transition-all duration-700 delay-100 max-w-[90%]">
                            {card.desc}
                          </p>
                        </div>
                        <div className="mt-8 w-12 h-12 rounded-full border border-[#dc143c]/30 flex items-center justify-center text-[#dc143c] group-hover:bg-[#dc143c] group-hover:text-white transition-all duration-500">
                          <ArrowRight size={20} />
                        </div>
                     </div>
                  </Motion.div>
                ))}
            </div>
         </div>
      </section>
      {/* THE LEGACY OF KARL LANDSTEINER */}
      <section className="py-40 relative overflow-hidden">
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-24">
               {/* Image Side */}
               <Motion.div 
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                 className="flex-1 relative"
               >
                  <div className="relative group perspective-1000">
                     <div className="absolute -inset-10 rounded-[5rem] blur-3xl opacity-20" style={{ background: '#dc143c' }}></div>
                     <div className="relative rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Karl_Landsteiner_nobel.jpg" 
                          alt="Karl Landsteiner" 
                          className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s] scale-105 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-12 left-12 text-white">
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-[#dc143c]">Nobel Laureate</p>
                           <h4 className="text-4xl font-black tracking-tighter">Karl Landsteiner <span className="text-[#dc143c]">.</span></h4>
                        </div>
                     </div>
                     
                     {/* Floating Badge */}
                     <Motion.div 
                       animate={{ y: [0, -20, 0] }}
                       transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -top-12 -right-12 w-40 h-40 rounded-full flex flex-col items-center justify-center p-8 text-center z-10 glass-premium"
                     >
                        <span className="text-4xl font-black mb-1 text-[#dc143c]">1930</span>
                        <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Nobel Prize</span>
                     </Motion.div>
                  </div>
               </Motion.div>
 
               {/* Content Side */}
               <div className="flex-1 space-y-12">
                  <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                     <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full mb-10 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#dc143c]">
                        <Activity className="w-4 h-4" />
                        Father of Transfusion Medicine
                     </div>
                     <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10">
                        The ABO <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff8080]">Blood Matrix.</span>
                     </h2>
                     <p className="text-2xl font-bold leading-relaxed mb-12 opacity-80 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
                        In 1900, Austrian-American biologist Karl Landsteiner decoded the biological cipher of life, identifying the A, B, and O blood groups.
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                        <div className="space-y-6">
                           <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl bg-[#dc143c]/10 border border-[#dc143c]/20 text-[#dc143c]">
                              01
                           </div>
                           <h5 className="text-2xl font-black tracking-tight">Clinical Safety</h5>
                           <p className="text-base font-bold opacity-60 leading-relaxed" style={{ color: 'var(--text-muted)' }}>His research transformed blood donation from a high-risk ritual into a safe, routine clinical procedure.</p>
                        </div>
                        <div className="space-y-6">
                           <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                              02
                           </div>
                           <h5 className="text-2xl font-black tracking-tight">Viral Mapping</h5>
                           <p className="text-base font-bold opacity-60 leading-relaxed" style={{ color: 'var(--text-muted)' }}>Beyond blood types, he co-discovered the Polio virus, cementing his status as a titan of modern science.</p>
                        </div>
                     </div>
                  </Motion.div>
 
                  <Motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="p-12 rounded-[3.5rem] relative overflow-hidden glass-premium"
                  >
                     <div className="absolute top-0 right-0 w-32 h-32 bg-[#dc143c]/5 blur-3xl rounded-full" />
                     <p className="text-2xl font-black italic relative z-10 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        "As long as there is any chance that a human life can be saved, it is the physician's duty to attempt a transfusion."
                     </p>
                     <div className="flex items-center gap-6 mt-10 relative z-10">
                        <div className="w-16 h-px bg-[#dc143c]/40" />
                        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#dc143c]">Legacy of Nexus</span>
                     </div>
                  </Motion.div>
               </div>
            </div>
         </div>
      </section>
      {/* THE LEGACY OF CHARLES R. DREW */}
      <section className="py-40 relative overflow-hidden bg-white/5">
         <div className="container mx-auto px-6 text-left">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-24">
               
               {/* Content Side */}
               <div className="flex-1 space-y-12">
                  <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                     <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full mb-10 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] text-[#dc143c]">
                        <Droplets className="w-4 h-4" />
                        Father of Blood Banks
                     </div>
                     <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-10">
                        Innovating <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff8080]">Storage Systems.</span>
                     </h2>
                     <p className="text-2xl font-bold leading-relaxed mb-12 opacity-80 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
                        Dr. Charles Richard Drew revolutionized modern medicine by developing techniques for long-term plasma storage — founding the world's first large-scale blood banks.
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
                        <div className="space-y-6">
                           <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl bg-[#dc143c]/10 border border-[#dc143c]/20 text-[#dc143c]">
                              01
                           </div>
                           <h5 className="text-2xl font-black tracking-tight">Global Logistics</h5>
                           <p className="text-base font-bold opacity-60 leading-relaxed" style={{ color: 'var(--text-muted)' }}>During WWII, he organized the "Blood for Britain" program, shipping life-saving plasma across the Atlantic.</p>
                        </div>
                        <div className="space-y-6">
                           <div className="w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black text-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                              02
                           </div>
                           <h5 className="text-2xl font-black tracking-tight">Banking Pioneer</h5>
                           <p className="text-base font-bold opacity-60 leading-relaxed" style={{ color: 'var(--text-muted)' }}>He established the first blood bank for the American Red Cross and pioneered standardized donation processing.</p>
                        </div>
                     </div>
                  </Motion.div>
               </div>
 
               {/* Image Side */}
               <Motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                 className="flex-1 relative"
               >
                  <div className="relative group perspective-1000">
                     <div className="absolute -inset-10 rounded-[5rem] blur-3xl opacity-20" style={{ background: '#4f46e5' }}></div>
                     <div className="relative rounded-[4rem] overflow-hidden border border-white/10 shadow-2xl">
                        <img 
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2tJ6R2Gk0sSKTcaBOCyIViZCVwlu4YU2MPid9SYuXR-hDOG5r_LlDrePF57k_NGYUBx_og3Fely_A-P7KlqQtVZgE4SngEc4cVYCrZg&s=10" 
                          alt="Charles R. Drew" 
                          className="w-full h-auto object-cover grayscale group-hover:grayscale-0 transition-all duration-[1.5s] scale-105 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
                        <div className="absolute bottom-12 right-12 text-white text-right">
                           <p className="text-[10px] font-black uppercase tracking-[0.4em] mb-3 text-[#dc143c]">Surgeon & Pioneer</p>
                           <h4 className="text-4xl font-black tracking-tighter">Dr. Charles R. Drew <span className="text-[#dc143c]">.</span></h4>
                        </div>
                     </div>
                     
                     <Motion.div 
                       animate={{ y: [0, 20, 0] }}
                       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -bottom-12 -left-12 px-10 py-6 rounded-[2rem] flex items-center gap-4 z-10 glass-premium"
                     >
                        <div className="w-12 h-12 rounded-full flex items-center justify-center bg-[#dc143c]/20">
                           <Droplets size={24} className="text-[#dc143c]" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Plasma Pioneer</span>
                     </Motion.div>
                  </div>
               </Motion.div>
 
            </div>
         </div>
      </section>
      {/* AI Compatibility CTA */}
      <section className="py-40 relative overflow-hidden">
         <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-24 p-16 md:p-24 rounded-[4rem] glass-premium relative">
               <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 blur-[120px] rounded-full" />
               <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#dc143c]/10 blur-[120px] rounded-full" />
               
               <div className="flex-1 relative z-10">
                 <Motion.div 
                   initial={{ opacity: 0, y: 20 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   className="inline-flex items-center gap-3 px-6 py-2 rounded-full mb-10 bg-[#dc143c]/10 border border-[#dc143c]/20 text-[#dc143c] text-[10px] font-black uppercase tracking-[0.4em]"
                 >
                   <Droplets className="w-4 h-4 animate-pulse" />
                   Neural Matrix Active
                 </Motion.div>
                 <h2 className="text-6xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter">
                   Sync Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] via-[#ff3b5c] to-indigo-500">Compatibility.</span>
                 </h2>
                 <p className="text-2xl font-bold mb-16 max-w-xl leading-relaxed opacity-80 tracking-tight" style={{ color: 'var(--text-secondary)' }}>
                   Instantly map the clinical compatibility between nodes. Launch our high-fidelity interactive blood matrix system.
                 </p>
                 <Link to="/compatibility" className="btn-nexus inline-flex items-center justify-center gap-4 px-12 py-6 rounded-[2.5rem] text-sm uppercase tracking-[0.3em] font-black transition-all bg-gradient-to-r from-[#dc143c] to-[#9b0023] text-white shadow-[0_25px_50px_rgba(220,20,60,0.4)]">
                   Launch Matrix System <ArrowRight size={24} />
                 </Link>
               </div>
               
               <div className="flex-1 w-full max-w-lg relative z-10">
                 <div className="grid grid-cols-4 gap-6 p-10 glass-premium rounded-[3rem] border-white/5">
                   {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type, i) => (
                     <Motion.div 
                       key={type} 
                       initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                       whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                       whileHover={{ scale: 1.15, rotate: 5, backgroundColor: 'rgba(220,20,60,0.2)', borderColor: 'rgba(220,20,60,0.4)', color: '#dc143c' }}
                       className="aspect-square rounded-[1.5rem] flex items-center justify-center font-black text-2xl cursor-pointer transition-all duration-500 bg-white/5 border border-white/10"
                       style={{ color: 'var(--text-primary)' }}
                     >
                       {type}
                     </Motion.div>
                   ))}
                 </div>
                 
                 {/* Decorative Neural Lines */}
                 <div className="absolute -inset-10 pointer-events-none opacity-20">
                    <svg width="100%" height="100%" viewBox="0 0 400 400">
                      <Motion.path 
                        d="M 50 50 Q 200 200 350 350" 
                        stroke="#dc143c" strokeWidth="1" fill="none"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1 }}
                      />
                      <Motion.path 
                        d="M 350 50 Q 200 200 50 350" 
                        stroke="#6366f1" strokeWidth="1" fill="none"
                        initial={{ pathLength: 0 }}
                        whileInView={{ pathLength: 1 }}
                        transition={{ duration: 2, delay: 1.2 }}
                      />
                    </svg>
                 </div>
               </div>
            </div>
         </div>
      </section>

      <AboutCreator />
    </div>
  );
};

export default Home;
