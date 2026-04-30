import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const NexusSelect = ({ 
    label, 
    value, 
    onChange, 
    options = [], 
    required = false, 
    icon: Icon,
    disabled = false,
    className = "",
    placeholder = ""
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value && value.toString().length > 0;
    const isFloating = isFocused || hasValue;

    return (
        <div className={`relative group ${className}`}>
            {/* Label */}
            <motion.label
                initial={false}
                animate={{
                    y: isFloating ? -32 : 0,
                    x: isFloating ? (Icon ? 0 : -8) : (Icon ? 32 : 0),
                    scale: isFloating ? 0.8 : 1,
                    color: isFocused ? 'var(--accent)' : 'var(--text-muted)'
                }}
                className={`absolute left-6 top-4 pointer-events-none z-10 font-black uppercase tracking-widest text-[9px] origin-left transition-colors duration-300`}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </motion.label>

            {/* Select Wrapper */}
            <div className="relative overflow-hidden rounded-xl">
                {Icon && (
                    <div className={`absolute left-6 top-1/2 -translate-y-1/2 z-20 transition-colors duration-300 ${isFocused ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                        <Icon size={18} />
                    </div>
                )}
                
                <select
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required={required}
                    disabled={disabled}
                    className={`
                        w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] 
                        ${Icon ? 'pl-16' : 'px-6'} py-4 pr-12
                        text-[var(--text-primary)] font-bold outline-none transition-all duration-500
                        hover:border-[var(--border-hover)]
                        focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10
                        disabled:opacity-50 disabled:cursor-not-allowed
                        appearance-none cursor-pointer text-sm
                    `}
                >
                    <option value="" disabled hidden>{placeholder}</option>
                    {options.map((opt, idx) => (
                        <option key={idx} value={opt.value || opt} className="bg-[var(--bg-card)] text-[var(--text-primary)]">
                            {opt.label || opt}
                        </option>
                    ))}
                </select>

                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] group-hover:text-[var(--text-primary)] transition-colors">
                    <ChevronDown size={18} />
                </div>

                {/* Removed Background Glow for Visibility */}
            </div>
        </div>
    );
};

export default NexusSelect;
