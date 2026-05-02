import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const NeuralBackground = () => {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll();
  const mouseX = useRef(0);
  const mouseY = useRef(0);
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseX.current = e.clientX;
      mouseY.current = e.clientY;
      if (glowRef.current) {
        glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Parallax effects for blobs based on scroll
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 45]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-[-1] bg-[#020205] overflow-hidden"
    >
      {/* 1. Subtle Neural Grid */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(220, 20, 60, 0.3) 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* 2. Primary Mesh Blobs */}
      <motion.div 
        style={{ y: y1, rotate }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full bg-[#dc143c] opacity-[0.07] blur-[120px]"
      />
      
      <motion.div 
        style={{ y: y2, rotate: -rotate }}
        className="absolute -bottom-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-[#4f46e5] opacity-[0.05] blur-[140px]"
      />

      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.03, 0.06, 0.03]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[30%] left-[40%] w-[40%] h-[40%] rounded-full bg-[#ff3b5c] opacity-[0.04] blur-[100px]"
      />

      {/* 3. Mouse Follower Glow */}
      <div 
        ref={glowRef}
        className="absolute -left-[150px] -top-[150px] w-[300px] h-[300px] bg-[#dc143c] opacity-[0.03] blur-[80px] rounded-full transition-transform duration-300 ease-out z-0"
      />

      {/* 4. Horizontal Scanlines */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(to bottom, transparent 50%, rgba(220, 20, 60, 0.1) 50%)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* 5. Scanline/Noise Overlay */}
      <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none">
        <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
          <filter id="noiseFilter">
            <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
      </div>

      {/* 6. High-Tech Corner Accents */}
      <div className="absolute top-0 left-0 w-32 h-32 border-t border-l border-[#dc143c]/10 rounded-tl-[2rem] m-8 opacity-40"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-t border-r border-[#dc143c]/10 rounded-tr-[2rem] m-8 opacity-40"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b border-l border-[#dc143c]/10 rounded-bl-[2rem] m-8 opacity-40"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-b border-r border-[#dc143c]/10 rounded-br-[2rem] m-8 opacity-40"></div>

      {/* 7. Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      
      {/* 8. Cinematic Light Beams */}
      {[...Array(3)].map((_, i) => (
        <motion.div 
          key={`beam-${i}`}
          initial={{ top: '-10%', left: `${20 + i * 30}%`, opacity: 0 }}
          animate={{ 
            top: '110%', 
            left: `${80 - i * 20}%`,
            opacity: [0, 0.4, 0]
          }}
          transition={{ 
            duration: 10 + i * 2, 
            repeat: Infinity, 
            delay: i * 3, 
            ease: "linear" 
          }}
          className="absolute w-[1px] h-[400px] bg-gradient-to-b from-transparent via-[#dc143c]/40 to-transparent rotate-[35deg] blur-[2px]"
        />
      ))}

      {/* 9. Floating Life Nodes (Subtle Particles) */}
      {[...Array(15)].map((_, i) => (
        <motion.div
          key={`node-${i}`}
          initial={{ 
            x: Math.random() * 100 + '%', 
            y: Math.random() * 100 + '%',
            opacity: 0 
          }}
          animate={{ 
            y: ['0%', '-20%', '0%'],
            opacity: [0, 0.15, 0]
          }}
          transition={{ 
            duration: 15 + Math.random() * 10, 
            repeat: Infinity, 
            delay: Math.random() * 5 
          }}
          className="absolute w-1 h-1 bg-[#dc143c] rounded-full blur-[1px]"
        />
      ))}

      {/* 10. Central Depth Grid (Interactive) */}
      <div 
        className="absolute inset-0 opacity-[0.05]"
        style={{
          perspective: '1000px',
          transformStyle: 'preserve-3d'
        }}
      >
        <motion.div 
          animate={{ rotateX: [15, 25, 15] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 border-b-[2px] border-[#dc143c]/30"
          style={{
            backgroundImage: 'linear-gradient(rgba(220, 20, 60, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(220, 20, 60, 0.1) 1px, transparent 1px)',
            backgroundSize: '100px 100px',
            transform: 'translateZ(-200px) rotateX(20deg)'
          }}
        />
      </div>
    </div>
  );
};

export default NeuralBackground;
