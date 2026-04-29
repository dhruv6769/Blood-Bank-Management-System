import { motion as Motion } from 'framer-motion';

const AnimatedPage = ({ children }) => {
  return (
    <>
      {/* Primary Transition Layer */}
      <Motion.div
        initial={{ top: 0, height: '100vh' }}
        animate={{ top: '100vh', height: '0vh' }}
        exit={{ top: 0, height: '100vh' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
        className="fixed left-0 right-0 z-[99999] bg-[#dc143c] pointer-events-none"
      />
      
      {/* Secondary Transition Layer */}
      <Motion.div
        initial={{ top: 0, height: '100vh' }}
        animate={{ top: '100vh', height: '0vh' }}
        exit={{ top: 0, height: '100vh' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.1 }}
        className="fixed left-0 right-0 z-[99998] bg-[var(--bg-primary)] pointer-events-none shadow-2xl"
      />

      {/* Page Content Reveal */}
      <Motion.div
        initial={{ opacity: 0, y: 50, scale: 0.98, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -50, scale: 0.98, filter: 'blur(8px)' }}
        transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1], delay: 0.2 }}
        className="w-full relative z-0"
      >
        {children}
      </Motion.div>
    </>
  );
};

export default AnimatedPage;
