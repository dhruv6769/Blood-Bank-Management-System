import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, useScroll, useTransform, AnimatePresence, useMotionValue, useSpring } from 'framer-motion';
import { Heart, Activity, Users, ShieldCheck, ArrowRightLeft, Navigation, Play, ChevronRight, Droplets } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import api from '../lib/api';
import LifePulseMap from '../components/LifePulseMap';
import SurvivorGallery from '../components/SurvivorGallery';
import LifePath from '../components/LifePath';
import AboutCreator from '../components/AboutCreator';

const Counter = ({ end, duration = 2.5, suffix = "" }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
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
  }, [end, duration]);

  return <span>{count}{suffix}</span>;
};



const LiquidHero = () => {
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const springX = useSpring(mouseX, { damping: 25, stiffness: 150 });
    const springY = useSpring(mouseY, { damping: 25, stiffness: 150 });

    const [drops] = useState(() => [...Array(6)].map((_, i) => ({
        id: i,
        delay: i * 2,
        duration: 15 + i * 2,
        initialX: (Math.random() * 80 + 10) + "%",
        targetX: (Math.random() * 80 + 10) + "%",
        initialY: (Math.random() * 80 + 10) + "%",
        targetY: (Math.random() * 80 + 10) + "%",
    })));
    
    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX - 150);
            mouseY.set(e.clientY - 150);
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {drops.map((drop) => (
                <Motion.div
                    key={drop.id}
                    initial={{ x: drop.initialX, y: drop.initialY, scale: 1 }}
                    animate={{ 
                        x: [drop.initialX, drop.targetX, drop.initialX],
                        y: [drop.initialY, drop.targetY, drop.initialY],
                        scale: [1, 1.2, 0.9, 1]
                    }}
                    transition={{
                        duration: drop.duration,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    className="absolute w-64 h-64 bg-red-600/30 rounded-full liquid-drop"
                />
            ))}

            {/* Mouse Reactive Drop */}
            <Motion.div
                style={{
                    x: springX,
                    y: springY,
                }}
                className="absolute w-[300px] h-[300px] bg-red-500/40 rounded-full liquid-drop blur-3xl z-10"
            />
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
  const opacityText = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

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
    <div className="w-full overflow-hidden font-sans" style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--text-primary)' }}>

      
      {/* Cinematic Hero Section (Theme-Adaptive Backdrop) */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[var(--bg-primary)]">
         {/* Smooth Continuous Cinematic Background */}
         <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-[var(--bg-primary)]/40 via-[var(--bg-primary)]/20 to-transparent z-10"></div>
            <Motion.img 
              initial={{ scale: 1.02 }}
              animate={{ scale: 1.08, rotate: 0.5 }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity, repeatType: "reverse" }}
              src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=2560" 
              alt="Medical background"
              className="w-full h-full object-cover origin-center opacity-60 dark:opacity-100"
            />
            {/* Liquid Physics Layer */}
            <LiquidHero />
         </div>

         {/* Floating Glass Badges */}
         <Motion.div 
           animate={{ y: [0, -20, 0], rotate: [0, 2, 0] }}
           transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
           className="absolute top-[20%] right-[15%] z-20 hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] shadow-2xl"
         >
           <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-500">
             <Heart className="w-5 h-5 fill-current" />
           </div>
           <div>
             <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Trusted Network</p>
             <p className="text-sm text-[var(--text-primary)] font-bold">50+ Verified Hospitals</p>
           </div>
         </Motion.div>

         <Motion.div 
           animate={{ y: [0, 20, 0], rotate: [0, -2, 0] }}
           transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
           className="absolute bottom-[30%] left-[10%] z-20 hidden lg:flex items-center gap-3 px-5 py-3 rounded-2xl bg-[var(--bg-card)] backdrop-blur-xl border border-[var(--border)] shadow-2xl"
         >
             <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
             <Activity className="w-5 h-5" />
           </div>
           <div>
             <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-bold">Live Status</p>
             <p className="text-sm text-[var(--text-primary)] font-bold">Emergency Active</p>
           </div>
         </Motion.div>

         <div className="container mx-auto px-6 relative z-10 text-center">
             <Motion.div 
               style={{ opacity: opacityText }}
               initial={{ opacity: 0, scale: 0.95 }}
               animate={{ opacity: 1, scale: 1 }}
               transition={{ duration: 1, ease: "easeOut" }}
             >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black tracking-widest uppercase mb-8 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                  Save Lives Today
                </div>
                
                <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black mb-8 tracking-tighter leading-[1.02] brand-font text-[#121212] dark:text-white drop-shadow-sm">
                   Donate Blood. <br className="hidden md:block"/>
                   <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-red-400 dark:from-red-500 dark:via-red-400 dark:to-[#ff8080]">
                     Inspire Humanity.
                   </span>
                </h1>
                
                <p className="text-xl md:text-2xl text-[var(--text-secondary)] font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
                   Join an elite network of heroes. Every drop you give fuels the future, saving up to three lives with a single heroic act.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                   <Link to={user ? (user.role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard') : '/register'} 
                         className="group relative px-10 py-5 bg-red-600 rounded-full font-bold text-white overflow-hidden w-full sm:w-auto text-center transition-all hover:scale-105 active:scale-95 shadow-[0_15px_30px_rgba(220,38,38,0.4)]">
                     <span className="relative z-10 flex items-center justify-center gap-2 text-lg">
                        {user ? 'Go to Dashboard' : 'Become a Hero'} <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                     </span>
                     <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                   </Link>
                   
                   <Link to="/camps" 
                         className="group px-10 py-5 bg-[var(--bg-card)] border border-[var(--border)] backdrop-blur-md hover:bg-[var(--bg-secondary)] rounded-full font-bold text-[var(--text-primary)] transition-all w-full sm:w-auto text-center flex items-center justify-center gap-2 text-lg">
                     <Navigation className="w-5 h-5 text-red-500 group-hover:-translate-y-0.5 transition-transform"/> Find Active Camps
                   </Link>
                </div>
             </Motion.div>
         </div>

         {/* Bottom Fade into Theme Background */}
         <div className="absolute bottom-0 left-0 right-0 h-40 z-10" style={{ background: 'linear-gradient(to top, var(--bg-primary), transparent)' }}></div>
      </section>

      {/* Stats Section — Theme Adaptive Glassmorphism */}
      <section className="relative z-20 py-20 px-6" style={{ background: 'var(--bg-primary)' }}>
         <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { icon: Heart, label: "Lives Saved", value: stats.livesSaved, suffix: "+", color: "#ff3355", glowColor: "rgba(220,20,60,0.2)" },
                  { icon: Users, label: "Active Donors", value: stats.activeDonors, suffix: "+", color: "#60a5fa", glowColor: "rgba(59,130,246,0.2)" },
                  { icon: Activity, label: "Successful Units", value: stats.successfulUnits, suffix: "", color: "#34d399", glowColor: "rgba(16,185,129,0.2)" },
                  { icon: ShieldCheck, label: "Verified Centers", value: stats.verifiedCenters, suffix: "", color: "#a78bfa", glowColor: "rgba(124,58,237,0.2)" },
                ].map((stat, idx) => (
                  <Motion.div 
                    key={idx}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ delay: idx * 0.1, duration: 0.6 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: '1.5rem', padding: '2rem',
                      position: 'relative', overflow: 'hidden', cursor: 'pointer',
                    }}
                  >
                    <div style={{ position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: '50%', background: stat.glowColor, filter: 'blur(30px)', opacity: 0.8 }} />
                    <div style={{ width: 48, height: 48, borderRadius: '13px', background: stat.glowColor, border: '1px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.2rem', color: stat.color }}>
                       <stat.icon style={{ width: 22, height: 22 }} />
                    </div>
                    <h3 className="text-4xl lg:text-5xl font-black brand-font mb-2" style={{ color: 'var(--text-primary)' }}>
                       <Counter end={stat.value} suffix={stat.suffix} />
                    </h3>
                    <p className="font-bold uppercase tracking-widest text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
                  </Motion.div>
                ))}
            </div>
         </div>
      </section>

      <LifePulseMap />

      <SurvivorGallery />

      <LifePath />

      {/* Editorial 'How it Works' Cards */}
      <section className="py-24 relative" style={{ background: 'var(--bg-primary)' }}>
         <div className="container mx-auto px-6">
            <Motion.div 
              initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once:true }}
              className="text-center max-w-3xl mx-auto mb-20"
            >
               <h2 className="text-sm font-black tracking-[0.2em] uppercase mb-4 inline-block px-4 py-2 rounded-full" style={{ color: '#ff3355', background: 'rgba(220,20,60,0.1)', border: '1px solid rgba(220,20,60,0.2)' }}>The Process</h2>
               <h3 className="text-4xl md:text-6xl font-black brand-font tracking-tight mt-4" style={{ color: 'var(--text-primary)' }}>Why <span style={{ background: 'linear-gradient(90deg,#ff3355,#ff8080)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Donate Blood?</span></h3>
            </Motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                {[
                  { img: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&q=80&w=800", title: "Safe & Clinical", desc: "Equipped with state-of-the-art sterile tools, the process takes merely 10 minutes in a comforting environment.", num: "01" },
                  { img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800", title: "Health Vitals Check", desc: "Every donor receives a complimentary advanced mini-physical, tracking pulse, blood pressure, and hemoglobin.", num: "02" },
                  { img: "https://images.unsplash.com/photo-1532938911079-1b06ac7ceec7?auto=format&fit=crop&q=80&w=800", title: "Maximize Impact", desc: "A single pint is separated into plasma, platelets, and red cells—amplifying your heroic impact to save three lives.", num: "03" }
                ].map((card, i) => (
                  <Motion.div 
                    key={i}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.15, duration: 0.5 }}
                    className="group relative rounded-[2rem] overflow-hidden bg-[var(--bg-secondary)] border border-[var(--border)] shadow-2xl shadow-gray-200/20 dark:shadow-black/40 hover:shadow-red-200/20 aspect-[4/5]"
                  >
                     <img src={card.img} alt={card.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
                     {/* Theme-Adaptive Overlay */}
                     <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)]/90 via-[var(--bg-primary)]/40 to-transparent"></div>
                     
                     <div className="absolute inset-0 p-8 flex flex-col justify-end text-left">
                        <span className="text-[var(--text-primary)] opacity-40 font-black text-6xl brand-font mb-4 block transform group-hover:-translate-y-2 transition-transform duration-500">{card.num}</span>
                        <h4 className="text-3xl font-black text-[var(--text-primary)] mb-3 transform group-hover:-translate-y-2 transition-transform duration-500 leading-tight">{card.title}</h4>
                        <p className="text-[var(--text-secondary)] text-base font-medium leading-relaxed transform translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100">
                          {card.desc}
                        </p>
                     </div>
                  </Motion.div>
                ))}
            </div>
         </div>
      </section>      {/* THE LEGACY OF KARL LANDSTEINER */}
      <section className="py-32 relative overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
         <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(220,20,60,0.06) 0%, transparent 60%)' }} />
         <div className="container mx-auto px-6">
            <div className="flex flex-col lg:flex-row items-center gap-20">
               {/* Image Side */}
               <Motion.div 
                 initial={{ opacity: 0, x: -50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="flex-1 relative"
               >
                  <div className="relative group perspective-1000">
                     <div className="absolute -inset-4 rounded-[4rem] blur-2xl" style={{ background: 'rgba(220,20,60,0.08)' }}></div>
                     <div className="relative rounded-[3.5rem] overflow-hidden" style={{ border: '1px solid [var(--border)]' }}>
                        <img 
                          src="https://upload.wikimedia.org/wikipedia/commons/e/e0/Karl_Landsteiner_nobel.jpg" 
                          alt="Karl Landsteiner" 
                          className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        <div className="absolute bottom-10 left-10 text-white">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Nobel Laureate</p>
                           <h4 className="text-2xl font-black brand-font tracking-tight">Karl Landsteiner <span style={{ color: '#ff3355' }}>.</span></h4>
                        </div>
                     </div>
                     
                     {/* Floating Badge */}
                     <Motion.div 
                       animate={{ y: [0, -15, 0] }}
                       transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -top-10 -right-10 w-32 h-32 rounded-full flex flex-col items-center justify-center p-6 text-center z-10"
                       style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}
                     >
                        <span className="text-3xl font-black brand-font mb-0.5" style={{ color: '#ff3355' }}>1930</span>
                        <span className="text-[8px] font-black uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Nobel Prize</span>
                     </Motion.div>
                  </div>
               </Motion.div>

               {/* Content Side */}
               <div className="flex-1 space-y-10">
                  <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                     <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        <Activity className="w-4 h-4" style={{ color: '#ff3355' }} />
                        The Father of Transfusion Medicine
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black brand-font tracking-tight leading-[1] mb-8" style={{ color: 'var(--text-primary)' }}>
                        Discovering the <br/>
                        <span style={{ background: 'linear-gradient(90deg, #ff3355, #ff8080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>ABO Blood Matrix.</span>
                     </h2>
                     <p className="text-xl font-medium leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                        In 1900, Austrian-American biologist Karl Landsteiner made a discovery that would change the course of human history by identifying blood groups A, B, and O.
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black brand-font" style={{ background: 'rgba(220,20,60,0.1)', border: '1px solid rgba(220,20,60,0.2)', color: '#ff3355' }}>
                              01
                           </div>
                           <h5 className="text-lg font-black brand-font" style={{ color: 'var(--text-primary)' }}>Safe Transfusions</h5>
                           <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>His research transformed blood donation from a dangerous ritual into a safe, routine clinical procedure.</p>
                        </div>
                        <div className="space-y-4">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black brand-font" style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', color: '#60a5fa' }}>
                              02
                           </div>
                           <h5 className="text-lg font-black brand-font" style={{ color: 'var(--text-primary)' }}>Polio Research</h5>
                           <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>Beyond blood groups, he co-discovered the Polio virus, cementing his status as a titan of science.</p>
                        </div>
                     </div>
                  </Motion.div>

                  <Motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="p-10 rounded-[2.5rem] relative overflow-hidden"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                     <p className="font-medium italic relative z-10" style={{ color: 'var(--text-secondary)' }}>
                        "As long as there is any chance that a human life can be saved, it is the physician's duty to attempt a transfusion."
                     </p>
                     <div className="flex items-center gap-4 mt-6 relative z-10">
                        <div className="w-10 h-px rounded-full" style={{ background: '#ff3355' }}></div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: '#ff3355' }}>The Landsteiner Legacy</span>
                     </div>
                  </Motion.div>
               </div>
            </div>
         </div>
      </section>

      {/* THE LEGACY OF CHARLES R. DREW */}
      <section className="py-32 relative overflow-hidden" style={{ background: 'var(--bg-secondary)' }}>
         <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 80% 50%, rgba(59,130,246,0.04) 0%, transparent 60%)' }} />
         <div className="container mx-auto px-6 text-left">
            <div className="flex flex-col-reverse lg:flex-row items-center gap-20">
               
               {/* Content Side */}
               <div className="flex-1 space-y-10">
                  <Motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                     <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full mb-8" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: 'var(--text-secondary)', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em' }}>
                        <Droplets className="w-4 h-4" style={{ color: '#ff3355' }} />
                        The Father of Blood Banks
                     </div>
                     <h2 className="text-5xl md:text-7xl font-black brand-font tracking-tight leading-[1] mb-8" style={{ color: 'var(--text-primary)' }}>
                        Innovating <br/>
                        <span style={{ background: 'linear-gradient(90deg, #ff3355, #ff8080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Blood Plasma Storage.</span>
                     </h2>
                     <p className="text-xl font-medium leading-relaxed mb-8" style={{ color: 'var(--text-secondary)' }}>
                        Dr. Charles Richard Drew was a pioneering surgeon who revolutionized medicine by developing a technique for long-term blood plasma storage — leading to the first large-scale blood banks.
                     </p>
                     
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                        <div className="space-y-4">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black brand-font" style={{ background: 'rgba(220,20,60,0.15)', color: 'var(--text-primary)' }}>
                              01
                           </div>
                           <h5 className="text-lg font-black brand-font uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Blood for Britain</h5>
                           <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>During WWII, he organized the "Blood for Britain" program, shipping life-saving plasma to protect lives across the Atlantic.</p>
                        </div>
                        <div className="space-y-4">
                           <div className="w-12 h-12 rounded-2xl flex items-center justify-center font-black brand-font" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', color: '#ff3355' }}>
                              02
                           </div>
                           <h5 className="text-lg font-black brand-font uppercase tracking-tight" style={{ color: 'var(--text-primary)' }}>Banking Concept</h5>
                           <p className="text-sm font-medium leading-relaxed" style={{ color: 'var(--text-muted)' }}>He established the first blood bank for the American Red Cross and pioneered standardized blood donation processing.</p>
                        </div>
                     </div>
                  </Motion.div>
               </div>

               {/* Image Side */}
               <Motion.div 
                 initial={{ opacity: 0, x: 50 }}
                 whileInView={{ opacity: 1, x: 0 }}
                 viewport={{ once: true }}
                 transition={{ duration: 0.8, ease: "easeOut" }}
                 className="flex-1 relative"
               >
                  <div className="relative group perspective-1000">
                     <div className="absolute -inset-4 rounded-[4rem] blur-2xl" style={{ background: 'rgba(220,20,60,0.06)' }}></div>
                     <div className="relative rounded-[3.5rem] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                        <img 
                          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ2tJ6R2Gk0sSKTcaBOCyIViZCVwlu4YU2MPid9SYuXR-hDOG5r_LlDrePF57k_NGYUBx_og3Fely_A-P7KlqQtVZgE4SngEc4cVYCrZg&s=10" 
                          alt="Charles R. Drew" 
                          className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
                        <div className="absolute bottom-10 right-10 text-white text-right">
                           <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Surgeon &amp; Pioneer</p>
                           <h4 className="text-2xl font-black brand-font tracking-tight">Dr. Charles R. Drew <span style={{ color: '#ff3355' }}>.</span></h4>
                        </div>
                     </div>
                     
                     <Motion.div 
                       animate={{ y: [0, 15, 0] }}
                       transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                       className="absolute -bottom-10 -left-10 w-40 h-16 rounded-2xl flex items-center justify-center gap-3 px-6 z-10"
                       style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}
                     >
                        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'rgba(220,20,60,0.15)' }}>
                           <Droplets className="w-4 h-4" style={{ color: '#ff3355' }} />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>Plasma Pioneer</span>
                     </Motion.div>
                  </div>
               </Motion.div>

            </div>
         </div>
      </section>

      {/* AI Compatibility CTA */}
      <section className="py-32 relative overflow-hidden" style={{ background: 'var(--bg-primary)', borderTop: '1px solid var(--border)' }}>
         <div className="absolute inset-0 opacity-50">
            <Motion.div 
              animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full blur-[100px]"
              style={{ background: 'rgba(220,20,60,0.08)' }}
            />
            <Motion.div 
              animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full blur-[100px]"
              style={{ background: 'rgba(124,58,237,0.06)' }}
            />
         </div>
         
         <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-16 p-10 md:p-16 rounded-[3rem]" style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
               <div className="flex-1">
                 <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6" style={{ background: 'rgba(220,20,60,0.1)', border: '1px solid rgba(220,20,60,0.2)', color: '#ff3355', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                   <Droplets className="w-4 h-4" />
                   AI Powered
                 </div>
                 <h2 className="text-4xl md:text-6xl font-black brand-font mb-6 leading-[1.1] tracking-tighter" style={{ color: 'var(--text-primary)' }}>
                   Check Your <br/><span style={{ background: 'linear-gradient(90deg, #ff3355, #ff8080)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Compatibility.</span>
                 </h2>
                 <p className="text-xl font-medium mb-10 max-w-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                   Instantly discover who you can donate to and receive from using our state-of-the-art interactive blood matrix.
                 </p>
                 <Link to="/compatibility" className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-full text-sm uppercase tracking-widest font-black transition-all hover:scale-105" style={{ background: 'linear-gradient(135deg, #dc143c, #9b0023)', color: '#fff', boxShadow: '0 4px 24px rgba(220,20,60,0.3)' }}>
                   Launch Matrix System
                 </Link>
               </div>
               
               <div className="flex-1 w-full max-w-md">
                 <div className="grid grid-cols-4 gap-3">
                   {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type, i) => (
                     <Motion.div 
                       key={type} 
                       initial={{ opacity: 0, scale: 0.8 }}
                       whileInView={{ opacity: 1, scale: 1 }}
                       viewport={{ once: true }}
                       transition={{ delay: i * 0.05 }}
                       whileHover={{ scale: 1.1 }}
                       style={{ aspectRatio: '1', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', cursor: 'pointer', background: 'var(--bg-primary)', border: '1px solid var(--border)', color: 'var(--text-muted)', transition: 'all 0.2s' }}
                     >
                       {type}
                     </Motion.div>
                   ))}
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
