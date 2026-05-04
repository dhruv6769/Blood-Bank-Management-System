import React, { useState, useRef } from 'react';
import { motion as Motion, useSpring, useMotionValue } from 'framer-motion';
import { 
  Github, Linkedin, Instagram, 
  Code2, Medal, Zap, Terminal
} from 'lucide-react';

const AboutCreator = () => {
    const containerRef = useRef(null);

    // 3D Physics for Image Core - Fixed for production stability
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const x = useSpring(mouseX, { stiffness: 100, damping: 30 });
    const y = useSpring(mouseY, { stiffness: 100, damping: 30 });

    const handleMouseMove = (e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        mouseX.set((e.clientX - centerX) / 20);
        mouseY.set((e.clientY - centerY) / 20);
    };

    const techLogos = [
        { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg", label: "JS" },
        { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg", label: "React" },
        { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg", label: "Node" },
        { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg", label: "HTML" },
        { icon: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg", label: "CSS" },
        { lucide: Github, label: "Git" }
    ];

    return (
        <section 
            ref={containerRef}
            onMouseMove={handleMouseMove}
            className="relative min-h-screen bg-[#050505] flex items-center justify-center overflow-hidden py-32 px-6 md:px-20"
        >
            {/* AMBIENT BACKGROUND */}
            <div className="absolute inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 0.5px, transparent 0.5px)', backgroundSize: '60px 60px' }} />
            
            <div className="container mx-auto relative z-10 flex flex-col lg:flex-row items-center justify-between gap-24 lg:gap-32 max-w-[1600px]">
                
                {/* LEFT CONTENT - SHIFTED LEFT TO PREVENT RING OVERLAP */}
                <div className="flex-1 space-y-10 text-left lg:-translate-x-16">
                    <div className="space-y-6">
                        {/* TOP PILL */}
                        <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full border border-[#dc143c]/30 bg-[#dc143c]/5 text-[#dc143c] text-[11px] font-black uppercase tracking-[0.2em]">
                            <Code2 size={14} />
                            SYSTEM ARCHITECT
                        </div>
                        
                        <h2 className="text-8xl md:text-[110px] font-black text-white leading-[0.85] tracking-tight">
                            The Core<br />
                            <span className="text-[#dc143c]">Developer.</span>
                        </h2>
                    </div>

                    <p className="text-xl md:text-2xl text-gray-400 font-medium max-w-2xl leading-[1.6]">
                        I am <span className="text-white font-extrabold">Dhruv Rajput</span>. Based in Patan, I engineered <span className="text-white font-bold">LifeFlow</span> to harmonize advanced clinical protocols with human empathy.
                    </p>

                    {/* CARDS - INTERACTIVE REPLICA */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
                        {/* WEB ARCHITECT CARD */}
                        <Motion.div 
                            whileHover={{ scale: 1.03, y: -5, borderColor: 'rgba(59, 130, 246, 0.3)' }}
                            className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-2xl transition-colors cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#1e293b]/50 border border-blue-500/10 flex items-center justify-center text-blue-400 group-hover:bg-blue-500/20 group-hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] transition-all duration-500">
                                <Code2 size={28} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <div className="text-white font-black text-lg uppercase group-hover:text-blue-400 transition-colors">Web Architect</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">TUVOC TECHNOLOGIES</div>
                            </div>
                        </Motion.div>

                        {/* CLINICAL LOGIC CARD */}
                        <Motion.div 
                            whileHover={{ scale: 1.03, y: -5, borderColor: 'rgba(220, 20, 60, 0.3)' }}
                            className="bg-[#0a0a0a] p-8 rounded-[2.5rem] border border-white/5 flex items-center gap-6 shadow-2xl transition-colors cursor-pointer group"
                        >
                            <div className="w-16 h-16 rounded-2xl bg-[#dc143c]/10 border border-[#dc143c]/10 flex items-center justify-center text-[#dc143c] group-hover:bg-[#dc143c]/20 group-hover:shadow-[0_0_20px_rgba(220,20,60,0.3)] transition-all duration-500">
                                <Medal size={28} className="group-hover:scale-110 transition-transform" />
                            </div>
                            <div>
                                <div className="text-white font-black text-lg uppercase group-hover:text-[#dc143c] transition-colors">Clinical Logic</div>
                                <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] font-bold">GOKUL GLOBAL UNIVERSITY</div>
                            </div>
                        </Motion.div>
                    </div>

                    {/* SOCIALS - EXACT REPLICA */}
                    <div className="flex items-center gap-6 pt-4">
                        {[
                            { Icon: Github, url: "https://github.com/dhruv6769" },
                            { Icon: Linkedin, url: "https://www.linkedin.com/in/dhruv-rajput-7b76603b9/" },
                            { Icon: Instagram, url: "https://www.instagram.com/dhruv_19s/" }
                        ].map((social, i) => (
                            <Motion.a
                                key={i}
                                whileHover={{ scale: 1.1, backgroundColor: 'rgba(255,255,255,0.05)' }}
                                href={social.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all"
                            >
                                <social.Icon size={24} />
                            </Motion.a>
                        ))}
                    </div>
                </div>

                {/* RIGHT: MASSIVE SATURN RING WITH DUST */}
                <div className="flex-1 relative w-full max-w-xl">
                    
                    {/* THE SATURN RING SYSTEM */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                        <Motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                            className="relative w-[340px] h-[340px] md:w-[850px] md:h-[850px] flex items-center justify-center"
                        >
                            {/* SOLID RING */}
                            <div className="absolute inset-0 rounded-full border-[12px] border-[#fbbf24]/30 shadow-[0_0_100px_rgba(251,191,36,0.2)]" />
                            
                            {/* GOLDEN DUST */}
                            {[...Array(100)].map((_, i) => {
                                const angle = Math.random() * 360;
                                const offset = (Math.random() - 0.5) * 15;
                                return (
                                    <Motion.div
                                        key={`dust-${i}`}
                                        className="absolute w-[2px] h-[2px] bg-yellow-300 rounded-full opacity-60"
                                        animate={{ opacity: [0.2, 0.8, 0.2] }}
                                        transition={{ duration: 2 + Math.random() * 2, repeat: Infinity }}
                                        style={{
                                            transform: `rotate(${angle}deg) translateY(${425 + offset}px)`
                                        }}
                                    />
                                );
                            })}

                            {/* LIGHT SWEEP */}
                            <svg className="absolute inset-0 w-full h-full scale-[1.01] -rotate-90" viewBox="0 0 100 100">
                                <defs>
                                    <linearGradient id="saturnSweep" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" stopColor="#fbbf24" stopOpacity="0" />
                                        <stop offset="50%" stopColor="#fde047" stopOpacity="1" />
                                        <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <Motion.circle 
                                    cx="50" cy="50" r="48.5" 
                                    fill="none" 
                                    stroke="url(#saturnSweep)" 
                                    strokeWidth="6" 
                                    strokeLinecap="round"
                                    animate={{ strokeDashoffset: [0, 305] }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    style={{ strokeDasharray: "140 165" }}
                                />
                            </svg>

                            {/* TECH LOGOS */}
                            {techLogos.map((tech, idx) => {
                                const angle = (idx * 360) / techLogos.length;
                                return (
                                    <div
                                        key={tech.label}
                                        className="absolute top-1/2 left-1/2 w-16 h-16 md:w-24 md:h-24 -ml-8 -mt-8 md:-ml-12 md:-mt-12"
                                        style={{
                                            transform: `rotate(${angle}deg) translateY(425px) rotate(-${angle}deg)`
                                        }}
                                    >
                                        <Motion.div 
                                            animate={{ rotate: -360 }}
                                            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
                                            className="w-full h-full glass-premium border-[#fbbf24]/80 border-2 flex items-center justify-center rounded-[2rem] shadow-[0_0_50px_rgba(251,191,36,0.3)] relative overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-yellow-500/10" />
                                            {tech.lucide ? (
                                                <tech.lucide size={28} className="text-white brightness-125 relative z-10" />
                                            ) : (
                                                <img src={tech.icon} className="w-12 h-12 md:w-16 md:h-16 brightness-125 relative z-10" alt={tech.label} />
                                            )}
                                        </Motion.div>
                                    </div>
                                );
                            })}
                        </Motion.div>
                    </div>

                    {/* IMAGE CORE */}
                    <Motion.div 
                        style={{ rotateX: y, rotateY: x }}
                        className="relative z-20 rounded-[3rem] overflow-hidden glass-premium border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
                    >
                        <div className="aspect-[4/5] relative">
                            <img 
                                src="/images/creator.jpg" 
                                className="w-full h-full object-cover"
                                alt="Dhruv Rajput"
                            />
                            
                            {/* OVERLAYS */}
                            <div className="absolute inset-0 pointer-events-none">
                                <div className="absolute top-8 right-8 flex flex-col items-center">
                                    <div className="w-3 h-3 rounded-full bg-[#dc143c] animate-pulse mb-2 shadow-[0_0_15px_#dc143c]" />
                                    <div className="text-[10px] font-black text-[#dc143c] uppercase tracking-[0.3em] bg-black/40 px-4 py-1 rounded-full border border-[#dc143c]/30">
                                        Clinical Precision
                                    </div>
                                </div>

                                <div className="absolute bottom-10 left-10 text-left">
                                    <h3 className="text-4xl font-black text-white leading-none mb-2">D. RAJPUT</h3>
                                    <div className="text-[10px] font-black text-[#dc143c] uppercase tracking-widest flex items-center gap-2">
                                        Node Origin: <span className="text-white">Patan</span>
                                    </div>
                                </div>

                                <div className="absolute bottom-10 right-10">
                                    <div className="w-12 h-12 rounded-2xl bg-black/60 border border-white/10 flex items-center justify-center text-white">
                                        <Zap size={24} fill="currentColor" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Motion.div>
                </div>
            </div>
        </section>
    );
};

export default AboutCreator;
