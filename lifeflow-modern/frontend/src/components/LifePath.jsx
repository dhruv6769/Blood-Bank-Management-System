import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Beaker, Droplets, Truck, Heart, ShieldCheck, ChevronRight } from 'lucide-react';

const steps = [
    {
        id: 1,
        title: "The Donation",
        desc: "Your journey begins at a certified LifeFlow center. A single pint is collected in about 10 minutes by our eExpert clinical team.",
        icon: Droplets,
        color: "bg-red-500",
        detail: "Did you know? One donation can save up to three lives."
    },
    {
        id: 2,
        title: "Advanced Processing",
        desc: "The blood is separated into red cells, plasma, and platelets using high-speed centrifugation to maximize every drop.",
        icon: Beaker,
        color: "bg-blue-500",
        detail: "Processing happens within 6 hours of collection to ensure peak potency."
    },
    {
        id: 3,
        title: "Rigorous Testing",
        desc: "State-of-the-art laboratory screening for blood type and infectious diseases ensures 100% safety for the recipient.",
        icon: ShieldCheck,
        color: "bg-emerald-500",
        detail: "We perform over 12 distinct tests on every single unit."
    },
    {
        id: 4,
        title: "Strategic Distribution",
        desc: "Using the LifePulse network, units are dispatched to hospitals facing the most critical emergencies in real-time.",
        icon: Truck,
        color: "bg-purple-500",
        detail: "Our 'Smart-Route' system reduces delivery time by 30%."
    },
    {
        id: 5,
        title: "The Transfusion",
        desc: "A patient in need receives your gift. Your legacy is fulfilled as a heartbeat continues and a family stays whole.",
        icon: Heart,
        color: "bg-rose-500",
        detail: "You've just become someone's hero."
    }
];

const LifePath = () => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <section className="py-32 bg-[var(--bg-primary)] relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-red-500/5 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/5 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2"></div>

            <div className="container mx-auto px-6 relative z-10">
                <div className="text-center max-w-3xl mx-auto mb-20 space-y-6">
                    <Motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--bg-secondary)] border border-[var(--border)] shadow-sm text-[var(--text-muted)] text-[10px] font-black uppercase tracking-widest"
                    >
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        Education First
                    </Motion.div>
                    <h2 className="text-5xl md:text-7xl font-black brand-font tracking-tight text-[var(--text-primary)] leading-tight">
                        The <span className="text-red-600">Life Path.</span> <br/>
                        A Journey of Hope.
                    </h2>
                    <p className="text-xl text-[var(--text-muted)] font-medium leading-relaxed">
                        Ever wondered what happens after your donation? Follow the cinematic journey of your blood as it transforms from a simple act of giving into a life-saving miracle.
                    </p>
                </div>

                {/* Interactive Path UI */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    {/* Step Selectors */}
                    <div className="lg:col-span-4 space-y-4">
                        {steps.map((step, idx) => (
                            <Motion.button
                                key={step.id}
                                onClick={() => setActiveStep(idx)}
                                whileHover={{ x: 10 }}
                                className={`w-full p-6 rounded-3xl text-left transition-[background-color,border-color,box-shadow,transform] duration-300 relative overflow-hidden group border border-transparent ${
                                    activeStep === idx 
                                    ? 'bg-[var(--bg-card)] shadow-[var(--shadow)] border-[var(--border)] z-10' 
                                    : 'bg-transparent hover:bg-[var(--bg-secondary)] hover:border-[var(--border)]/50'
                                }`}
                            >
                                {activeStep === idx && (
                                    <Motion.div 
                                        layoutId="active-bg" 
                                        className="absolute inset-0 bg-[var(--bg-card)]"
                                    />
                                )}
                                <div className="relative z-10 flex items-center gap-6">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                                        activeStep === idx ? step.color + ' text-white' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)] group-hover:bg-[var(--border)]'
                                    }`}>
                                        <step.icon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h4 className={`font-black uppercase tracking-widest text-[10px] mb-1 ${
                                            activeStep === idx ? 'text-[var(--text-muted)]' : 'text-[var(--text-muted)]'
                                        }`}>Step 0{step.id}</h4>
                                        <p className={`font-bold brand-font text-xl ${
                                            activeStep === idx ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'
                                        }`}>{step.title}</p>
                                    </div>
                                </div>
                            </Motion.button>
                        ))}
                    </div>

                    {/* Content Display */}
                    <div className="lg:col-span-8 relative min-h-[500px]">
                        <AnimatePresence mode="wait">
                            <Motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.5, ease: "easeOut" }}
                                className="bg-[var(--bg-card)] p-12 md:p-16 rounded-[4rem] shadow-[var(--shadow)] border border-[var(--border)] relative overflow-hidden h-full"
                            >
                                {/* Liquid Graphic Overlay */}
                                <div className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] opacity-20 ${steps[activeStep].color}`}></div>

                                <div className="space-y-12 relative z-10">
                                    <div className={`inline-flex p-6 rounded-[2.5rem] ${steps[activeStep].color} text-white shadow-2xl transition-transform duration-500 hover:rotate-6`}>
                                        {React.createElement(steps[activeStep].icon, { className: "w-16 h-16" })}
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-4xl md:text-6xl font-black brand-font tracking-tight text-[var(--text-primary)]">
                                            {steps[activeStep].title}
                                        </h3>
                                        <p className="text-2xl text-[var(--text-secondary)] font-medium leading-relaxed">
                                            {steps[activeStep].desc}
                                        </p>
                                    </div>

                                    <div className="p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border)] flex items-start gap-6 group hover:border-red-500/10 transition-colors">
                                        <div className="mt-1">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </div>
                                        </div>
                                        <p className="text-[var(--text-secondary)] font-bold leading-relaxed italic">
                                            "{steps[activeStep].detail}"
                                        </p>
                                    </div>

                                    <button className="flex items-center gap-3 font-black uppercase tracking-widest text-xs text-red-600 hover:gap-5 transition-all">
                                        View Clinical Details 
                                        <div className="w-12 h-px bg-red-200 group-hover:w-16 transition-all"></div>
                                    </button>
                                </div>
                            </Motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default LifePath;
