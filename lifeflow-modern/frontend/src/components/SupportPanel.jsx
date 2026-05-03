/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageSquare, Clock, CheckCircle2, AlertCircle, LifeBuoy, ChevronRight, MessageCircle } from 'lucide-react';
import api from '../lib/api';
import { useAuthStore } from '../context/authStore';

import toast from 'react-hot-toast';

import { createPortal } from 'react-dom';

const SupportPanel = ({ isOpen, onClose }) => {
    const { user } = useAuthStore();
    const [messages, setMessages] = useState([]);
    const [activeTab, setActiveTab] = useState('history'); // 'history' | 'new'
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ subject: '', message: '' });
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchMessages();
        }
    }, [isOpen]);

    const fetchMessages = async () => {
        try {
            const res = await api.get('/support/user');
            setMessages(res.data.data);
        } catch (error) {
            console.error('Error fetching support messages:', error);
            toast.error('Failed to load support history');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const toastId = toast.loading('Sending report...');
        try {
            await api.post('/support', formData);
            setSuccess(true);
            toast.success('Report submitted successfully!', { id: toastId });
            setFormData({ subject: '', message: '' });
            setTimeout(() => {
                setSuccess(false);
                setActiveTab('history');
                fetchMessages();
            }, 2000);
        } catch (error) {
            console.error('Error submitting support:', error);
            toast.error('Failed to submit report. Please try again.', { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    const content = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 pointer-events-none">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md pointer-events-auto"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[600px] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-white/10 relative z-10 pointer-events-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Header */}
                        <div className="p-6 md:p-8 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-red-500/5 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-red-500 flex items-center justify-center text-white shadow-lg shadow-red-500/20">
                                    <LifeBuoy className="w-6 h-6 animate-pulse" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-gray-900 dark:text-white">Support Center</h2>
                                    <p className="text-xs text-gray-500 dark:text-slate-400 font-bold uppercase tracking-widest">How can we help you, {user?.name?.split(' ')[0]}?</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors text-gray-400">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex px-6 md:px-8 mt-4 gap-2">
                            <button
                                onClick={() => setActiveTab('history')}
                                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'history' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                            >
                                My Messages
                            </button>
                            <button
                                onClick={() => setActiveTab('new')}
                                className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'new' ? 'bg-red-500 text-white shadow-lg shadow-red-500/20' : 'bg-gray-100 dark:bg-slate-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-slate-700'}`}
                            >
                                Report Problem
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 md:p-8">
                            <AnimatePresence mode="wait">
                                {activeTab === 'history' ? (
                                    <motion.div
                                        key="history"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        className="space-y-4"
                                    >
                                        {messages.length === 0 ? (
                                            <div className="h-64 flex flex-col items-center justify-center text-center opacity-40">
                                                <MessageCircle className="w-16 h-16 mb-4" />
                                                <p className="font-bold text-lg dark:text-white">No messages found</p>
                                                <p className="text-sm dark:text-slate-400">Your reported problems will appear here.</p>
                                            </div>
                                        ) : (
                                            messages.map((msg) => (
                                                <div key={msg.id} className="p-5 rounded-3xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 group hover:shadow-lg transition-all duration-300">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-2 py-1 rounded-full ${msg.status === 'REPLIED' ? 'bg-green-100 text-green-700' : msg.status === 'RESOLVED' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>
                                                                {msg.status}
                                                            </span>
                                                            <h3 className="text-base font-black text-gray-900 dark:text-white mt-1">{msg.subject}</h3>
                                                        </div>
                                                        <span className="text-[10px] text-gray-400 font-bold">{new Date(msg.createdAt).toLocaleDateString()}</span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2 italic font-medium">"{msg.message}"</p>
                                                    
                                                    {msg.adminReply && (
                                                        <div className="mt-4 p-4 rounded-2xl bg-white dark:bg-slate-800 border-l-4 border-red-500/30">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Official Admin Response</span>
                                                            </div>
                                                            <p className="text-sm text-gray-800 dark:text-slate-100 font-bold leading-relaxed">{msg.adminReply}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        )}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="new"
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -20 }}
                                    >
                                        {success ? (
                                            <div className="h-64 flex flex-col items-center justify-center text-center">
                                                <motion.div 
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="w-20 h-20 rounded-full bg-green-500 text-white flex items-center justify-center mb-6"
                                                >
                                                    <CheckCircle2 className="w-10 h-10" />
                                                </motion.div>
                                                <h3 className="text-2xl font-black dark:text-white mb-2">Message Sent!</h3>
                                                <p className="text-gray-500 dark:text-slate-400 font-medium">We'll review your report and get back to you soon.</p>
                                            </div>
                                        ) : (
                                            <form onSubmit={handleSubmit} className="space-y-6">
                                                <div className="space-y-4 p-6 rounded-3xl bg-gray-50 dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Subject</label>
                                                        <input 
                                                            required
                                                            type="text" 
                                                            placeholder="What's the issue about?"
                                                            className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-red-500/20 transition-all dark:text-white"
                                                            value={formData.subject}
                                                            onChange={(e) => setFormData({...formData, subject: e.target.value})}
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Description</label>
                                                        <textarea 
                                                            required
                                                            rows={4}
                                                            placeholder="Describe your problem in detail..."
                                                            className="w-full bg-white dark:bg-slate-900 border-none rounded-2xl p-4 text-sm font-bold shadow-sm focus:ring-2 focus:ring-red-500/20 transition-all dark:text-white resize-none"
                                                            value={formData.message}
                                                            onChange={(e) => setFormData({...formData, message: e.target.value})}
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <button 
                                                    disabled={loading}
                                                    className="w-full bg-gray-900 dark:bg-white dark:text-gray-900 text-white py-4 rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-black/10 disabled:opacity-50 flex items-center justify-center gap-3"
                                                >
                                                    {loading ? (
                                                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <>
                                                            <Send className="w-4 h-4" />
                                                            Submit Report
                                                        </>
                                                    )}
                                                </button>
                                            </form>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Footer Hint */}
                        <div className="p-6 bg-gray-50 dark:bg-slate-800/30 border-t border-gray-100 dark:border-slate-800 flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-gray-400" />
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Admins usually respond within 24 hours.</p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return createPortal(content, document.getElementById('portal-root') || document.body);
};

export default SupportPanel;
