/* eslint-disable no-unused-vars */
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, MessageSquare, ShieldCheck, Zap } from 'lucide-react';
import api from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../context/chatStore';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const EnhancedChatBot = () => {
    const navigate = useNavigate();
    const { isOpen, closeChat } = useChatStore();
    const [messages, setMessages] = useState([
        {
            id: 'welcome',
            text: "Welcome to LifeFlow Nexus! I'm your advanced health companion. How can I assist you in saving lives today?",
            sender: 'bot',
            timestamp: new Date(),
            suggestions: [
                { label: "🩸 How to Donate", query: "How do I donate blood?" },
                { label: "📋 Need Blood", query: "I need blood for a patient" },
                { label: "🗺️ Find Camps", query: "Find camps near me" },
                { label: "🩺 Eligibility", query: "Am I eligible to donate?" }
            ]
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (isOpen) scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (messageText = input) => {
        if (!messageText.trim()) return;

        const userMessage = {
            id: Date.now(),
            text: messageText,
            sender: 'user',
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsTyping(true);

        try {
            const response = await api.post('/chatbot/chat', { message: messageText });
            
            const botMessage = {
                id: Date.now() + 1,
                text: response.data.data.message,
                sender: 'bot',
                timestamp: new Date(),
                role: response.data.data.role || 'Assistant',
                ui_action: response.data.data.ui_action || null,
                actions: response.data.data.actions || []
            };

            setMessages(prev => [...prev, botMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const botMessage = {
                id: Date.now() + 1,
                text: "I'm currently optimizing my systems. Please check our help pages or try again later.",
                sender: 'bot',
                timestamp: new Date(),
                role: 'System'
            };
            setMessages(prev => [...prev, botMessage]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleAction = (url, requireAuth) => {
        if (requireAuth && !localStorage.getItem('token')) {
            navigate('/login');
        } else {
            navigate(url);
        }
        closeChat();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] pointer-events-none flex items-end justify-end p-6 md:p-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50, rotate: 2 }}
                        animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 50, rotate: -2 }}
                        className="w-full max-w-[440px] h-[650px] pointer-events-auto bg-[var(--bg-primary)]/80 backdrop-blur-3xl rounded-[3rem] border border-white/20 shadow-[0_50px_100px_rgba(0,0,0,0.3)] flex flex-col overflow-hidden relative"
                    >
                        {/* Premium Header */}
                        <div className="p-8 bg-gradient-to-br from-red-600 to-red-800 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-2xl overflow-hidden group">
                                        <Bot className="w-9 h-9 text-white group-hover:scale-110 transition-transform duration-500" />
                                        <motion.div 
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ repeat: Infinity, duration: 2 }}
                                            className="absolute bottom-0 left-0 w-full h-1 bg-green-400"
                                        ></motion.div>
                                    </div>
                                    <div>
                                        <h3 className="text-white text-2xl font-black brand-font tracking-tight">LifeFlow AI</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                            <span className="text-red-100/80 text-xs font-bold uppercase tracking-[0.2em]">Active Nexus</span>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={closeChat}
                                    className="p-3 rounded-full hover:bg-white/10 transition-colors text-white"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Message Feed */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
                            {messages.map((msg) => (
                                <motion.div
                                    key={msg.id}
                                    initial={{ opacity: 0, x: msg.sender === 'user' ? 20 : -20, y: 10 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] relative ${msg.sender === 'user' ? 'order-2' : ''}`}>
                                        <div className={`p-5 rounded-[2rem] text-sm leading-relaxed shadow-xl ${
                                            msg.sender === 'user' 
                                                ? 'bg-red-600 text-white rounded-tr-sm' 
                                                : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] rounded-tl-sm border border-[var(--border)]'
                                        }`}>
                                            <p className="whitespace-pre-line font-medium">{msg.text}</p>
                                            
                                            {/* Action Buttons */}
                                            {msg.actions?.length > 0 && (
                                                <div className="mt-6 flex flex-wrap gap-2">
                                                    {msg.actions.map((action, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => handleAction(action.url, action.requireAuth)}
                                                            className="px-4 py-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white rounded-xl border border-red-600/20 text-xs font-black uppercase tracking-widest transition-all"
                                                        >
                                                            {action.label}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Micro-Apps (Item 4) */}
                                            {msg.ui_action === 'SHOW_MAP' && (
                                                <div className="mt-4 w-full h-48 rounded-2xl overflow-hidden border border-[var(--border)] shadow-inner" style={{ zIndex: 0 }}>
                                                    <MapContainer center={[23.0225, 72.5714]} zoom={11} style={{ height: '100%', width: '100%', zIndex: 0 }} zoomControl={false}>
                                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                                        <Marker position={[23.0225, 72.5714]}><Popup>Alpha Node Camp</Popup></Marker>
                                                        <Marker position={[23.0525, 72.5314]}><Popup>Sector 7 Drive</Popup></Marker>
                                                    </MapContainer>
                                                </div>
                                            )}
                                        </div>
                                        
                                        {/* Suggestions for first message */}
                                        {msg.suggestions && (
                                            <div className="mt-6 flex flex-wrap gap-2">
                                                {msg.suggestions.map((s, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleSend(s.query)}
                                                        className="px-5 py-2.5 bg-[var(--bg-primary)] border border-[var(--border)] hover:border-red-500/50 text-[var(--text-secondary)] hover:text-red-500 rounded-full text-xs font-bold transition-all shadow-sm flex items-center gap-2 group"
                                                    >
                                                        <div className="w-2 h-2 rounded-full bg-red-500/20 group-hover:bg-red-500 transition-colors"></div>
                                                        {s.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        <span className={`text-[10px] mt-2 block opacity-50 uppercase tracking-widest font-bold ${
                                            msg.sender === 'user' ? 'text-right mr-2' : 'ml-2'
                                        }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                            {isTyping && (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                                    <div className="bg-[var(--bg-secondary)] rounded-[2rem] rounded-tl-sm p-5 border border-[var(--border)] shadow-md">
                                        <div className="flex gap-1.5">
                                            {[0, 1, 2].map(d => (
                                                <motion.div
                                                    key={d}
                                                    animate={{ y: [0, -5, 0] }}
                                                    transition={{ repeat: Infinity, duration: 0.6, delay: d * 0.15 }}
                                                    className="w-2 h-2 bg-red-500 rounded-full"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-8 pt-0">
                            <div className="bg-[var(--bg-secondary)] border border-[var(--border)] rounded-[2.5rem] p-3 flex items-center gap-3 shadow-2xl focus-within:border-red-500/50 focus-within:ring-4 ring-red-500/5 transition-all">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--bg-primary)] flex items-center justify-center text-red-500 shrink-0">
                                    <MessageSquare className="w-6 h-6" />
                                </div>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask for assistance..."
                                    className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-[var(--text-primary)] placeholder-[var(--text-muted)] p-2"
                                />
                                <button 
                                    onClick={() => handleSend()}
                                    disabled={!input.trim() || isTyping}
                                    className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-red-500/20"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Branding Footer */}
                        <div className="pb-8 text-center">
                            <div className="inline-flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 transition-all cursor-default">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] brand-font">Nexus Secured</span>
                                <Zap className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default EnhancedChatBot;
