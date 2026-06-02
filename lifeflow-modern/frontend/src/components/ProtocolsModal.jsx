// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

const PROTOCOLS = {
    DONOR: {
        title: "Donor Protocols",
        subtitle: "Mandatory Eligibility Guidelines",
        accent: "#dc143c",
        sections: [
            { title: "Eligibility Criteria", content: "Must be between 18-65 years of age. Weight must be at least 50 kg. Hemoglobin level should be ≥ 12.5 g/dL." },
            { title: "Health & Safety", content: "Must not have donated blood in the last 56 days (8 weeks). Should not have any active infection, cold, or flu." },
            { title: "Post-Donation Care", content: "Hydrate well and avoid strenuous physical activity for at least 24 hours. Do not consume alcohol for 24 hours." },
        ]
    },
    ORGANIZATION: {
        title: "Organization Protocols",
        subtitle: "Clinical Deployment Standards",
        accent: "#dc143c",
        sections: [
            { title: "Legal Verification", content: "Organizations must provide valid registration docs (NGO certificate, Hospital License, or Corporate ID) before hosting." },
            { title: "Medical Standards", content: "All camps hosted must be staffed by certified phlebotomists. Sterile equipment and proper biohazard disposal are strictly mandated." },
            { title: "Data Privacy", content: "Donor data collected during camps is strictly confidential and must adhere to national health data protection regulations." },
        ]
    }
};

const ProtocolsModal = ({ isOpen, onClose, onAgree, role }) => {
    if (!role || !PROTOCOLS[role]) return null;
    const data = PROTOCOLS[role];

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="protocol-modal"
                    initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    animate={{ opacity: 1, backdropFilter: 'blur(20px)' }}
                    exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-6 bg-black/60 overflow-hidden"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, y: 100, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 40, scale: 0.9 }}
                        transition={{ type: "spring", damping: 28, stiffness: 350 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-lg bg-[#0a000a] border border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden relative"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-[-100px] left-[-100px] w-64 h-64 bg-[#dc143c]/10 rounded-full blur-[80px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 md:p-10 border-b border-white/5 bg-white/2 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-2xl shrink-0">
                                    <FileText className="text-[#dc143c] w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white brand-font tracking-tight uppercase leading-none">{data.title}</h2>
                                    <p className="text-[10px] text-white/30 font-black tracking-[0.3em] uppercase mt-2">{data.subtitle}</p>
                                </div>
                            </div>
                            
                            <button onClick={onClose} 
                                className="absolute top-8 right-8 w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 hover:text-white transition-all border border-white/5 text-white/30 flex items-center justify-center">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Scroll Area */}
                        <div className="p-8 md:p-10 space-y-8 max-h-[50vh] overflow-y-auto custom-scrollbar relative z-10 bg-[#0a000a]">
                           <div className="flex items-start gap-4 p-6 rounded-[2rem] bg-[#dc143c]/10 border border-[#dc143c]/20 text-[#dc143c]">
                               <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                               <p className="text-[11px] leading-relaxed font-bold tracking-wide uppercase opacity-90">Protocol compliance is strictly required. Any violation will lead to immediate node suspension within the network.</p>
                           </div>

                           <div className="space-y-10">
                               {data.sections.map((sec, idx) => (
                                   <motion.div 
                                      initial={{ opacity: 0, x: -20 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.1 * idx }}
                                      key={idx} 
                                      className="relative pl-10"
                                   >
                                       <div className="absolute left-0 top-1 w-px h-full bg-white/10"></div>
                                       <div className="absolute left-[-2px] top-1 w-1 h-3 bg-[#dc143c] rounded-full shadow-[0_0_10px_#dc143c]"></div>
                                       
                                       <h3 className="text-[10px] font-black text-white uppercase tracking-[0.3em] mb-3">{sec.title}</h3>
                                       <p className="text-white/40 text-sm leading-relaxed font-medium">
                                            {sec.content}
                                       </p>
                                   </motion.div>
                               ))}
                           </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-8 bg-black/60 border-t border-white/5 flex flex-col md:flex-row justify-end items-center gap-6 relative z-20">
                            <button onClick={onClose} 
                                className="w-full md:w-auto px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-white/20 hover:text-white transition-all order-2 md:order-1">
                                Dismiss Protocol
                            </button>
                            <button onClick={onAgree} 
                                className="w-full md:w-auto px-10 py-5 rounded-2.5xl font-black text-[11px] uppercase tracking-[0.2em] bg-[#dc143c] text-white hover:shadow-[0_10px_30px_rgba(220,20,60,0.4)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-3 border border-white/20 order-1 md:order-2">
                                <CheckCircle2 className="w-5 h-5" /> I COMPREHEND
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ProtocolsModal;
