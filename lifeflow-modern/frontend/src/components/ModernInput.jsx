import { useState, useRef } from 'react';
import { motion as Motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';

const ModernInput = ({ 
    label, 
    type = 'text', 
    value, 
    onChange, 
    required = false, 
    placeholder = '', 
    icon: Icon,
    disabled = false,
    readOnly = false,
    className = "",
    rows = null,
    showPasswordToggle = false,
    name,
    suffix,
    valueDisplay
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const inputRef = useRef(null);
    const hasValue = value && value.toString().length > 0;
    const isFloating = isFocused || hasValue;

    const InputTag = rows ? 'textarea' : 'input';
    const isPasswordField = type === 'password';
    const currentType = isPasswordField ? (showPassword ? 'text' : 'password') : type;

    return (
        <div className={`relative group ${className}`}>
            {/* Label */}
            <Motion.label
                initial={false}
                animate={{
                    y: isFloating ? -32 : 0,
                    x: isFloating ? (Icon ? 0 : -8) : (Icon ? 32 : 0),
                    scale: isFloating ? 0.8 : 1,
                    color: isFocused ? 'var(--accent)' : 'var(--text-muted)'
                }}
                className={`absolute left-6 top-4 pointer-events-none z-10 font-black uppercase tracking-widest text-[9px] origin-left transition-all duration-300`}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </Motion.label>

            {/* Input Wrapper */}
            <div 
                className="relative overflow-hidden rounded-2xl md:rounded-3xl cursor-text"
                onClick={() => {
                    if (type === 'date' && inputRef.current?.showPicker) {
                        inputRef.current.showPicker();
                    } else {
                        inputRef.current?.focus();
                    }
                }}
            >
                {Icon && (
                    <div className={`absolute left-6 top-1/2 -translate-y-1/2 z-20 transition-colors duration-300 pointer-events-none ${isFocused ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'}`}>
                        <Icon size={18} />
                    </div>
                )}
                
                <InputTag
                    ref={inputRef}
                    type={currentType}
                    name={name}
                    value={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    required={required}
                    disabled={disabled}
                    readOnly={readOnly}
                    rows={rows}
                    className={`
                        w-full bg-[var(--bg-primary)] border-2 border-[var(--border)] 
                        ${Icon ? 'pl-16' : 'px-6'} py-4 
                        ${(showPasswordToggle && isPasswordField) || suffix ? 'pr-28' : 'pr-6'}
                        ${rows ? 'resize-none min-h-[100px]' : ''}
                        ${valueDisplay ? 'text-transparent caret-transparent selection:bg-transparent' : 'text-[var(--text-primary)]'} font-bold outline-none transition-all duration-500 rounded-xl
                        hover:border-[var(--border-hover)]
                        focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10
                        disabled:opacity-50 disabled:cursor-not-allowed
                        placeholder:text-[var(--text-muted)] placeholder:opacity-50 text-sm
                    `}
                    placeholder={isFloating ? placeholder : ""}
                />

                {isPasswordField && showPasswordToggle ? (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowPassword(!showPassword);
                        }}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-20 text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
                    >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                ) : suffix && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-20 pointer-events-none">
                        {suffix}
                    </div>
                )}

                {valueDisplay && (
                    <div className={`absolute ${Icon ? 'left-16' : 'left-6'} right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-none text-xl font-black text-[#dc143c] brand-font tracking-tight`}>
                        {valueDisplay}
                    </div>
                )}

                {/* Removed Background Glow for Visibility */}
            </div>
        </div>
    );
};

export default ModernInput;
