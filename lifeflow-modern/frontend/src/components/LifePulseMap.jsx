import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Activity, ShieldCheck, Droplets } from 'lucide-react';

const PulsePoint = ({ x, y, type }) => {
  const color = type === 'emergency' ? 'bg-red-500' : 'bg-green-500';
  const shadowColor = type === 'emergency' ? 'rgba(239, 68, 68, 0.6)' : 'rgba(34, 197, 94, 0.6)';

  return (
    <div 
      className="absolute" 
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <Motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: [1, 2, 1.5], opacity: [0.8, 0.4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut" }}
        className={`absolute -inset-4 rounded-full ${color} opacity-20`}
        style={{ boxShadow: `0 0 20px 10px ${shadowColor}` }}
      />
      <div className={`relative w-3 h-3 rounded-full ${color} border-2 border-white shadow-lg`} />
    </div>
  );
};

const LifePulseMap = () => {
    const [events, setEvents] = useState([
        { id: 1, x: 25, y: 40, type: 'emergency' },
        { id: 2, x: 65, y: 30, type: 'donation' },
        { id: 3, x: 45, y: 70, type: 'emergency' },
        { id: 4, x: 80, y: 55, type: 'donation' },
    ]);
    const [mapStars] = useState(() => [...Array(20)].map((_, i) => ({
        id: i,
        cx: Math.random() * 800,
        cy: Math.random() * 450,
        opacity: Math.random() * 0.4 + 0.2
    })));

    useEffect(() => {
        const interval = setInterval(() => {
            setEvents(prev => {
                const newEvents = [...prev];
                if (newEvents.length > 8) newEvents.shift();
                newEvents.push({
                    id: Date.now(),
                    x: Math.random() * 80 + 10,
                    y: Math.random() * 70 + 15,
                    type: Math.random() > 0.4 ? 'donation' : 'emergency'
                });
                return newEvents;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <section className="py-32 bg-[var(--bg-primary)] border-y border-[var(--border)] relative overflow-hidden">
            {/* Background Grid */}
            <div className="absolute inset-0 opacity-10" style={{ 
                backgroundImage: 'linear-gradient(#475569 1px, transparent 1px), linear-gradient(90deg, #475569 1px, transparent 1px)',
                backgroundSize: '50px 50px' 
            }}></div>
            
            <div className="container mx-auto px-6 relative z-10">
                <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
                    {/* Text Area */}
                    <div className="flex-1 space-y-8">
                        <Motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-black uppercase tracking-widest"
                        >
                            <Activity className="w-4 h-4 animate-pulse" />
                            Live Network Pulse
                        </Motion.div>
                        
                        <h2 className="text-4xl md:text-5xl lg:text-7xl font-black brand-font tracking-tight text-[var(--text-primary)] leading-tight">
                            The Heartbeat of <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-red-400">Global Giving.</span>
                        </h2>
                        
                        <p className="text-xl text-[var(--text-secondary)] font-medium leading-relaxed">
                            Watch the real-time flow of life. Our network connects thousands of donors to critical emergencies every second, ensuring that no request goes unanswered in the moments that matter most.
                        </p>

                        <div className="flex flex-wrap gap-8 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                                <span className="text-[var(--text-secondary)] font-bold tracking-tight">Active Emergencies</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                <span className="text-[var(--text-secondary)] font-bold tracking-tight">Donations Fulfilled</span>
                            </div>
                        </div>

                        <div className="p-6 md:p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] backdrop-blur-xl group hover:border-red-500/30 transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-muted)] mb-2 block">System Status</span>
                            <div className="flex items-center gap-4 text-green-400 font-black brand-font text-2xl uppercase">
                                <ShieldCheck className="w-8 h-8" />
                                Optimal & Secure
                            </div>
                        </div>
                    </div>

                    {/* Map Area */}
                    <div className="flex-[1.5] w-full relative">
                        <div className="aspect-[16/9] rounded-[3rem] bg-[var(--bg-secondary)] border border-[var(--border)] overflow-hidden relative group shadow-2xl shadow-red-500/5">
                            {/* Stylized Map SVG Backdrop */}
                            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none scale-110 group-hover:scale-105 transition-transform duration-1000" viewBox="0 0 800 450">
                                <path 
                                    fill="none" 
                                    stroke="white" 
                                    strokeWidth="0.5" 
                                    d="M100 200 Q 150 150 200 180 T 300 160 T 450 220 T 600 180 T 750 200"
                                    className="opacity-40"
                                />
                                <path 
                                    fill="none" 
                                    stroke="white" 
                                    strokeWidth="0.5" 
                                    d="M50 300 Q 200 350 350 320 T 550 380 T 700 340"
                                    className="opacity-30"
                                />
                                {mapStars.map((star) => (
                                    <circle key={star.id} cx={star.cx} cy={star.cy} r="0.8" fill="white" opacity={star.opacity} />
                                ))}
                            </svg>

                            {/* Live Events Overlay */}
                            <AnimatePresence>
                                {events.map(event => (
                                    <PulsePoint key={event.id} x={event.x} y={event.y} type={event.type} />
                                ))}
                            </AnimatePresence>

                            {/* Glass Statistics Overlay */}
                            <div className="absolute top-4 left-4 md:top-8 md:left-8 p-4 md:p-6 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] backdrop-blur-md pointer-events-none">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mb-1">Impact Velocity</p>
                                        <p className="text-xl font-black text-[var(--text-primary)] brand-font uppercase">14.2 s <span className="text-red-500">/ Match</span></p>
                                    </div>
                                    <div className="w-full h-1 bg-[var(--bg-primary)] rounded-full overflow-hidden">
                                        <Motion.div 
                                            animate={{ width: ["10%", "90%", "40%", "75%"] }}
                                            transition={{ duration: 10, repeat: Infinity }}
                                            className="h-full bg-red-500" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LifePulseMap;
