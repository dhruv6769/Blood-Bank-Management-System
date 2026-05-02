import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, FileText, HelpCircle, Lock, Activity, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const PROTOCOL_DATA = {
    support: {
        title: "Support Frequency",
        icon: Activity,
        color: "text-blue-500",
        bg: "bg-blue-500/10",
        content: [
            { h: "System Uptime", p: "The Sanctuary network guarantees 99.9% uptime for emergency blood requests and live donor matching. Scheduled maintenance occurs on the first Sunday of every month between 0200 and 0400 hours GMT." },
            { h: "Response Times", p: "Critical emergency requests are processed within < 200ms. Standard support queries are answered within 2-4 hours by our medical technical team." },
            { h: "Frequency Guidelines", p: "Organizations are limited to establishing 5 concurrent donation camps per region to prevent system overload and maintain phlebotomist availability metrics." }
        ]
    },
    faq: {
        title: "FAQ Database",
        icon: HelpCircle,
        color: "text-purple-500",
        bg: "bg-purple-500/10",
        content: [
            { h: "How does the AI Compatibility matrix work?", p: "The Nexus AI calculates universal donor compatibility based on standard ABO and Rh systems, while factoring in regional availability and urgency algorithms to find the absolute perfect match in seconds." },
            { h: "Who can host a camp?", p: "Any globally verified Organization with valid medical permits can register to host a camp. Applications are manually reviewed by Admin protocols within 24 hours." },
            { h: "What are Hero Badges?", p: "Hero badges are awarded dynamically via our gamification engine based on active participation, total verified donations, and rapid emergency responses." }
        ]
    },
    privacy: {
        title: "Privacy Protocol",
        icon: Lock,
        color: "text-emerald-500",
        bg: "bg-emerald-500/10",
        content: [
            { h: "Data Encryption", p: "All user identifiable data (UID), medical records, and geolocation coordinates are encrypted at rest using AES-256 military-grade encryption." },
            { h: "Information Sharing", p: "We do NOT sell data. Your data is only shared with verified healthcare facilities directly involved in your active donation or emergency request loop." },
            { h: "Right to be Forgotten", p: "Users maintain the ultimate right to enact the wipe protocol. Deleting your account will scrub all PII from the Sanctuary databases within 48 hours." }
        ]
    },
    security: {
        title: "Security Policy",
        icon: ShieldCheck,
        color: "text-rose-500",
        bg: "bg-rose-500/10",
        content: [
            { h: "Authentication", p: "Access to the network is strictly governed by JSON Web Tokens (JWT) requiring periodic re-validation. High-level dashboard actions require elevated clearances." },
            { h: "Threat Mitigation", p: "Our perimeter nodes utilize advanced rate-limiting and heuristic analysis to block DDoS attempts and unauthorized scraping of donor registries." },
            { h: "Vulnerability Disclosure", p: "If you detect a vulnerability within the Sanctuary network, please report it via the Blood Request. Bounties may be awarded for critical discoveries." }
        ]
    },
    terms: {
        title: "Terms of Service",
        icon: FileText,
        color: "text-slate-400",
        bg: "bg-slate-400/10",
        content: [
            { h: "Usage Agreement", p: "By accessing LifeFlow, you agree to utilize the network solely for humanitarian health operations. Malicious use, false requests, or scraping will result in immediate IP bans." },
            { h: "Liability Limitations", p: "LifeFlow acts strictly as a nexus conduit between donors and organizations. We are not liable for medical malpractice or facility standard violations." },
            { h: "Modifications", p: "The Overlords reserve the right to modify these Terms at any time. Continued usage of the Nexus post-modification implies total acceptance of the new protocols." }
        ]
    }
};

const ProtocolPage = () => {
    const { id } = useParams();
    const data = PROTOCOL_DATA[id] || PROTOCOL_DATA.terms;
    const Icon = data.icon;

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [id]);

    return (
        <div className="min-h-[calc(100vh-80px)] bg-[var(--bg-primary)] py-20 relative overflow-hidden flex-grow">
            {/* Dark premium backdrop */}
            <div className="absolute inset-0 z-0 opacity-30 pointer-events-none">
                <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-[var(--accent)] rounded-full blur-[150px] opacity-20 transform-gpu"></div>
            </div>

            <div className="container mx-auto px-6 relative z-10 max-w-4xl">
                <Link to="/" className="inline-flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors mb-12 font-black uppercase tracking-widest text-xs group">
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Return to Nexus
                </Link>

                <motion.div 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, type: "spring", bounce: 0.2 }}
                    className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[3rem] p-10 md:p-16 shadow-[var(--shadow)] relative overflow-hidden"
                >
                    {/* Header */}
                    <div className="flex flex-col md:flex-row gap-8 items-start md:items-center mb-16 border-b border-[var(--border)] pb-12">
                        <div className={`w-24 h-24 rounded-3xl ${data.bg} border border-current flex items-center justify-center shrink-0 shadow-lg ${data.color}`}>
                            <Icon className="w-12 h-12" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-[var(--text-primary)] uppercase tracking-tight brand-font mb-3">{data.title}</h1>
                            <p className="text-[var(--text-muted)] text-[11px] font-black tracking-[0.3em] uppercase">Sanctuary Internal Documentation</p>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-12">
                        {data.content.map((sec, idx) => (
                            <motion.div 
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + (idx * 0.1) }}
                                key={idx} 
                                className="group"
                            >
                                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest mb-4 flex items-center gap-4">
                                    <div className={`w-2.5 h-2.5 rounded-full ${data.bg} ring-2 ring-current ${data.color} shadow-sm`} />
                                    {sec.h}
                                </h3>
                                <p className="text-[var(--text-muted)] text-sm leading-relaxed pl-6 border-l-2 border-[var(--border)] group-hover:border-[var(--accent)]/50 transition-colors font-medium">
                                    {sec.p}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ProtocolPage;
