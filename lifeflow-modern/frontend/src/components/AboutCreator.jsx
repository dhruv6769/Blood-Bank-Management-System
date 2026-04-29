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
    <section className="py-32 bg-[var(--bg-primary)] relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-red-50/50 skew-x-[-15deg] -z-10 origin-top-right transform translate-x-10"></div>
      
      <div className="container mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          {/* Content Side */}
          <div className="flex-1 space-y-8 z-10">
            <Motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Motion.div 
                initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', damping: 15 }}
                className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-red-50/10 border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest mb-8 shadow-sm backdrop-blur-md"
              >
                <Code className="w-4 h-4" />
                The Architect
              </Motion.div>
              <h2 className="text-5xl md:text-7xl font-black brand-font tracking-tight leading-[1] text-[var(--text-primary)] mb-6">
                Meet the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dc143c] to-[#ff3355]">Creator.</span>
              </h2>
              <p className="text-xl text-[var(--text-secondary)] font-medium leading-relaxed mb-6">
                Hi, I'm <strong className="text-[var(--text-primary)]">Dhruv Rajput</strong>, a 19-year-old Web Developer (born Aug 7, 2006) based in Patan. I built LifeFlow to bridge the gap between technology and humanity's most critical need.
              </p>

              {/* Badges/Highlights */}
              <Motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }}
                variants={{ visible: { transition: { staggerChildren: 0.15 } } }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10"
              >
                <Motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } } }} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shrink-0 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all">
                    <Code className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[var(--text-primary)] text-sm">Web Developer</h5>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Tuvoc Technologies, Ahmedabad</p>
                  </div>
                </Motion.div>
                <Motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300 } } }} className="flex items-center gap-4 p-4 rounded-2xl bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm hover:shadow-md transition-all group">
                  <div className="w-12 h-12 rounded-full bg-[#dc143c]/10 flex items-center justify-center text-[#dc143c] shrink-0 group-hover:scale-110 group-hover:bg-[#dc143c] group-hover:text-white transition-all">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h5 className="font-bold text-[var(--text-primary)] text-sm">BSc IT</h5>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Gokul Global University, Siddhpur</p>
                  </div>
                </Motion.div>
              </Motion.div>
              
              {/* Social Links */}
              <div className="flex items-center gap-4 relative z-50">
                <a href="https://github.com/dhruv6769" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--text-primary)] hover:bg-[var(--bg-secondary)] transition-all hover:scale-110 shadow-sm cursor-pointer">
                  <Github className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/in/dhruv-rajput-7b76603b9/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50 transition-all hover:scale-110 shadow-sm cursor-pointer">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://www.instagram.com/dhruv_19s/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--text-secondary)] hover:text-pink-600 hover:border-pink-200 hover:bg-pink-50 transition-all hover:scale-110 shadow-sm cursor-pointer">
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </Motion.div>
          </div>

          {/* Image Side */}
          <Motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 relative max-w-lg mx-auto w-full"
            style={{ perspective: 1000 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <Motion.div 
              style={{ rotateX, rotateY }}
              className="relative group perspective-1000 transform-gpu transition-all duration-300 ease-out"
            >
              {/* Glow Behind */}
              <div className="absolute -inset-6 bg-[#dc143c]/10 rounded-[3rem] blur-2xl group-hover:bg-[#dc143c]/20 transition-all duration-700"></div>
              
              <div className="relative rounded-[2.5rem] overflow-hidden border border-[var(--border)] shadow-[var(--shadow)] transform transition-transform duration-700 group-hover:scale-[1.02]">
                <img 
                  src="/images/creator.jpg" 
                  alt="Dhruv Rajput" 
                  className="w-full h-auto aspect-[4/5] object-cover object-center"
                />
                
                {/* Gradient Overlay for Text Visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-transparent to-transparent opacity-80"></div>
                
                {/* Overlay Text */}
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-black text-white brand-font tracking-tight">Dhruv Rajput</h3>
                    <p className="text-red-400 font-bold text-sm uppercase tracking-widest">Creator</p>
                  </div>
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                    <Award className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
              
              {/* Floating Element */}
              <Motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -top-6 -right-6 px-6 py-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] shadow-xl z-20 md:flex flex-col items-center gap-1 hidden"
              >
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse mb-1"></div>
                <span className="text-sm font-black brand-font text-[var(--text-primary)]">Passion for code</span>
              </Motion.div>
            </div>
          </Motion.div>
        
        </div>
      </div>
    </section>
  );
};

export default AboutCreator;
