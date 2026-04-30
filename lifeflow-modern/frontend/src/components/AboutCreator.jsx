import React from 'react';
import { motion as Motion, useMotionValue, useTransform } from 'framer-motion';
import { Heart, Code, Zap, Award, Instagram, Github, Linkedin } from 'lucide-react';

const AboutCreator = () => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [10, -10]);
  const rotateY = useTransform(x, [-100, 100], [-10, 10]);

  const handleMouseMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set(event.clientX - centerX);
    y.set(event.clientY - centerY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <section className="py-40 relative overflow-hidden">
      {/* Neural Mesh Overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[#dc143c] blur-[150px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500 blur-[150px] rounded-full" />
      </div>
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-24">
          {/* Content Side */}
          <div className="flex-1 space-y-12 z-10">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Motion.div 
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', damping: 15 }}
                className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[#dc143c]/10 border border-[#dc143c]/20 text-[#dc143c] text-[10px] font-black uppercase tracking-[0.4em] mb-10 shadow-sm"
              >
                <Code className="w-4 h-4" />
                System Architect
              </Motion.div>
              <h2 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-[var(--text-primary)] mb-8">
                The Core <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff3355]">Developer.</span>
              </h2>
              <p className="text-2xl text-[var(--text-secondary)] font-bold leading-relaxed mb-10 tracking-tight">
                I am <strong className="text-[var(--text-primary)] font-black">Dhruv Rajput</strong>. Based in Patan, I engineered LifeFlow to harmonize advanced clinical protocols with human empathy.
              </p>

              {/* Badges/Highlights */}
              <Motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12"
              >
                <Motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } } }} className="glass-premium p-6 rounded-3xl group flex items-center gap-5 cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                    <Code className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-black text-[var(--text-primary)] text-lg tracking-tight">Web Architect</h5>
                    <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">Tuvoc Technologies</p>
                  </div>
                </Motion.div>
                <Motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } } }} className="glass-premium p-6 rounded-3xl group flex items-center gap-5 cursor-pointer">
                  <div className="w-14 h-14 rounded-2xl bg-[#dc143c]/10 flex items-center justify-center text-[#dc143c] shrink-0 group-hover:scale-110 group-hover:bg-[#dc143c] group-hover:text-white transition-all duration-500">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="font-black text-[var(--text-primary)] text-lg tracking-tight">Clinical Logic</h5>
                    <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest">Gokul Global University</p>
                  </div>
                </Motion.div>
              </Motion.div>
              
              {/* Social Links */}
              <div className="flex items-center gap-6 relative z-50">
                {[
                  { icon: Github, url: "https://github.com/dhruv6769", color: "hover:bg-gray-900" },
                  { icon: Linkedin, url: "https://www.linkedin.com/in/dhruv-rajput-7b76603b9/", color: "hover:bg-blue-600" },
                  { icon: Instagram, url: "https://www.instagram.com/dhruv_19s/", color: "hover:bg-pink-600" }
                ].map((social, idx) => (
                  <Motion.a 
                    key={idx}
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    whileHover={{ scale: 1.15, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    className={`w-16 h-16 rounded-[1.5rem] glass-premium flex items-center justify-center text-[var(--text-secondary)] hover:text-white transition-all duration-500 ${social.color}`}
                  >
                    <social.icon size={24} />
                  </Motion.a>
                ))}
              </div>
            </Motion.div>
          </div>

          {/* Image Side */}
          <Motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex-1 relative max-w-xl mx-auto w-full"
            style={{ perspective: 2000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Motion.div 
              style={{ rotateX, rotateY }}
              className="relative group transform-gpu"
            >
              {/* Complex Glow System */}
              <div className="absolute -inset-10 bg-[#dc143c]/20 rounded-[4rem] blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <div className="absolute -inset-20 bg-indigo-500/10 rounded-full blur-[100px] opacity-0 group-hover:opacity-50 transition-opacity duration-1000" />
              
              <div className="relative rounded-[4rem] overflow-hidden glass-premium p-2">
                <div className="rounded-[3.8rem] overflow-hidden relative">
                  <img 
                    src="/images/creator.jpg" 
                    alt="Dhruv Rajput" 
                    className="w-full h-auto aspect-[4/5] object-cover object-center grayscale-[0.2] group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                  />
                  
                  {/* Cinematic Overlays */}
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-90"></div>
                  <div className="absolute inset-0 ring-1 ring-inset ring-white/10 rounded-[3.8rem]"></div>
                  
                  {/* Overlay Identity Card */}
                  <div className="absolute bottom-10 left-10 right-10 flex items-center justify-between">
                    <div>
                      <h3 className="text-4xl font-black text-white tracking-tighter mb-1">D. RAJPUT</h3>
                      <p className="text-[#dc143c] font-black text-xs uppercase tracking-[0.4em]">Node Origin: Patan</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl glass-premium border-white/20 flex items-center justify-center text-white">
                      <Zap size={32} className="fill-current" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating Intelligence Badge */}
              <Motion.div 
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-10 -right-10 px-8 py-6 rounded-[2rem] glass-premium z-20 hidden md:flex flex-col items-center gap-2 border-white/10"
              >
                <div className="w-4 h-4 rounded-full bg-[#dc143c] animate-ping" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#dc143c]">Clinical Precision</span>
              </Motion.div>
            </Motion.div>
          </Motion.div>
        
        </div>
      </div>
    </section>
  );
};

export default AboutCreator;
