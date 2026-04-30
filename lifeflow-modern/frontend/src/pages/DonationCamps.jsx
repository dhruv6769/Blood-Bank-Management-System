/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Calendar, Clock, Users, Search, Filter, 
  ChevronRight, Heart, Building2, Phone, Sparkles,
  ArrowRight, Navigation, Map as MapIcon, Grid,
  AlertCircle
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../lib/api';
import AnimatedPage from '../components/AnimatedPage';

// Fix for default marker icon
const defaultIconSvg = `<svg width="25" height="41" viewBox="0 0 25 41" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12.5 0C5.596 0 0 5.596 0 12.5C0 21.875 12.5 41 12.5 41C12.5 41 25 21.875 25 12.5C25 5.596 19.404 0 12.5 0ZM12.5 17C10.015 17 8 14.985 8 12.5C8 10.015 10.015 8 12.5 8C14.985 8 17 10.015 17 12.5C17 14.985 14.985 17 12.5 17Z" fill="#dc143c" stroke="white" stroke-width="1"/></svg>`;
const defaultIconUrl = `data:image/svg+xml;base64,${btoa(defaultIconSvg)}`;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: defaultIconUrl,
    iconUrl: defaultIconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const redIcon = new L.Icon({
    iconUrl: defaultIconUrl,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
    iconSize: [30, 46],
    iconAnchor: [15, 46],
    popupAnchor: [0, -40],
    shadowSize: [46, 46]
});

const cities = ['All Cities', 'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar', 'Bhavnagar', 'Patan'];
const bloodGroups = ['All Types', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const MapFlyTo = ({ position }) => {
    const map = useMap();
    useEffect(() => {
        if (position) map.flyTo(position, 14, { duration: 2, easeLinearity: 0.25 });
    }, [position, map]);
    return null;
};

const ResizeMap = () => {
    const map = useMap();
    useEffect(() => {
        const t = setTimeout(() => map.invalidateSize(), 300);
        return () => clearTimeout(t);
    }, [map]);
    return null;
};

/* ── UI Components ─────────────────────────────────────────────── */

const CampCard = ({ camp, isSelected, onClick }) => {
    const fillPercent = Math.min(100, Math.round((camp.filled / camp.slots) * 100));
    const spotsLeft = Math.max(0, camp.slots - camp.filled);
    
    return (
        <motion.div
            layout
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`group relative p-5 rounded-3xl cursor-pointer transition-all duration-500 overflow-hidden ${
                isSelected 
                ? 'bg-[var(--accent)] text-white shadow-[0_20px_50px_rgba(220,20,60,0.3)]' 
                : 'bg-[var(--bg-card)] border border-[var(--border)] hover:border-[var(--accent)]'
            }`}
        >
            {/* Glossy Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-black text-lg leading-tight truncate mb-1 ${isSelected ? 'text-white' : 'text-[var(--text-primary)]'}`}>
                            {camp.name}
                        </h3>
                        <p className={`text-xs font-bold flex items-center gap-1.5 ${isSelected ? 'text-white/80' : 'text-[var(--text-muted)]'}`}>
                            <Building2 size={12} /> {camp.hospital}
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-3 mb-5">
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        isSelected ? 'bg-white/20' : 'bg-[var(--bg-primary)] text-[var(--accent)]'
                    }`}>
                        <Calendar size={12} /> {new Date(camp.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${
                        isSelected ? 'bg-white/20' : 'bg-[var(--bg-primary)] text-[var(--text-secondary)]'
                    }`}>
                        <Clock size={12} /> {camp.time.split('–')[0]}
                    </div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-end text-[10px] font-black uppercase tracking-widest">
                        <span className={isSelected ? 'text-white/70' : 'text-[var(--text-muted)]'}>Availability</span>
                        <span className={isSelected ? 'text-white' : 'text-[var(--accent)]'}>{spotsLeft} Slots Left</span>
                    </div>
                    <div className={`h-2 w-full rounded-full overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-[var(--bg-primary)]'}`}>
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${fillPercent}%` }}
                            className={`h-full rounded-full ${isSelected ? 'bg-white' : 'bg-gradient-to-r from-red-600 to-red-400'}`}
                        />
                    </div>
                </div>

                <div className="mt-5 flex items-center justify-between">
                    <div className="flex -space-x-2">
                        {camp.bloodGroups.slice(0, 4).map((bg, idx) => (
                            <div key={bg} 
                                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[10px] font-black ${
                                    isSelected 
                                    ? 'bg-white text-[var(--accent)] border-[var(--accent)]' 
                                    : 'bg-[var(--bg-card)] text-[var(--text-primary)] border-[var(--bg-primary)] shadow-sm'
                                }`}
                                style={{ zIndex: 10 - idx }}
                            >
                                {bg}
                            </div>
                        ))}
                        {camp.bloodGroups.length > 4 && (
                            <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-[9px] font-black z-0 ${
                                isSelected ? 'bg-white/20 border-white/20 text-white' : 'bg-[var(--bg-primary)] border-transparent text-[var(--text-muted)]'
                            }`}>
                                +{camp.bloodGroups.length - 4}
                            </div>
                        )}
                    </div>
                    <ArrowRight size={18} className={`${isSelected ? 'text-white' : 'text-[var(--accent)] opacity-40'}`} />
                </div>
            </div>
        </motion.div>
    );
};

const DonationCamps = () => {
    const navigate = useNavigate();
    const [camps, setCamps] = useState([]);
    const [selectedCamp, setSelectedCamp] = useState(null);
    const [search, setSearch] = useState('');
    const [city, setCity] = useState('All Cities');
    const [bloodGroup, setBloodGroup] = useState('All Types');
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState('split'); // 'split' or 'map-focus'

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await api.get('/public/camps');
                if (res.data.status === 'success') {
                    setCamps(res.data.camps.map(c => ({
                        id: c.id,
                        name: c.name,
                        hospital: c.organization?.orgName || c.organization?.name || 'Local Organizer',
                        date: c.date,
                        time: `${c.startTime} – ${c.endTime}`,
                        address: c.address,
                        city: c.city,
                        lat: parseFloat(c.lat) || 23.0225,
                        lng: parseFloat(c.lng) || 72.5714,
                        slots: c.totalSlots || 100,
                        filled: c.filledSlots || 0,
                        bloodGroups: c.bloodGroupsNeeded ? c.bloodGroupsNeeded.split(',').map(s => s.trim()) : ['Any'],
                        contact: c.contactPhone || 'N/A',
                        description: c.description || 'Join our blood donation camp to save lives.'
                    })));
                }
            } catch { /* silent */ } finally { setIsLoading(false); }
        };
        fetch();
    }, []);

    const filtered = useMemo(() => {
        return camps.filter(c => {
            const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase()) || 
                                 c.hospital.toLowerCase().includes(search.toLowerCase());
            const matchesCity = city === 'All Cities' || c.city === city;
            const matchesBlood = bloodGroup === 'All Types' || c.bloodGroups.includes(bloodGroup) || c.bloodGroups.includes('Any');
            return matchesSearch && matchesCity && matchesBlood;
        });
    }, [camps, search, city, bloodGroup]);

    return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col pt-4">
                
                {/* 🌌 Cinematic Hero Context */}
                <div className="px-6 pb-12 pt-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex flex-col md:flex-row md:items-end justify-between gap-8"
                        >
                            <div className="max-w-2xl">
                                <div className="flex items-center gap-2 text-[var(--accent)] font-black text-xs uppercase tracking-[0.4em] mb-4">
                                    <Sparkles size={14} /> Active Operations
                                </div>
                                <h1 className="text-5xl md:text-7xl font-black brand-font tracking-tight text-[var(--text-primary)] mb-6">
                                    Safe Lives <br/>Near You<span className="text-[var(--accent)]">.</span>
                                </h1>
                                <p className="text-[var(--text-secondary)] text-xl font-medium leading-relaxed opacity-80">
                                    Connect with the nexus network of verified donation camps. Every drop creates a ripple of life.
                                </p>
                            </div>
                            
                            <div className="flex items-center gap-4 bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border)] shadow-sm">
                                <button 
                                    onClick={() => setViewMode('split')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'split' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                >
                                    <Grid size={20} />
                                </button>
                                <button 
                                    onClick={() => setViewMode('map-focus')}
                                    className={`p-3 rounded-xl transition-all ${viewMode === 'map-focus' ? 'bg-[var(--accent)] text-white shadow-lg' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}
                                >
                                    <MapIcon size={20} />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* 🛡️ HUD Filter Bar */}
                <div className="sticky top-2 z-[900] px-6">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-7xl mx-auto glass p-3 rounded-[2.5rem] shadow-[0_25px_50px_rgba(0,0,0,0.1)] flex flex-col md:flex-row gap-4 items-center"
                    >
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
                            <input 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search by camp name or organizer..."
                                className="w-full h-14 pl-14 pr-6 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[2rem] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] text-sm font-bold placeholder:opacity-50"
                            />
                        </div>
                        
                        <div className="flex gap-3 w-full md:w-auto">
                            <div className="relative flex-1 md:w-48">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                <select 
                                    value={city}
                                    onChange={e => setCity(e.target.value)}
                                    className="w-full h-14 pl-12 pr-10 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[2rem] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
                                >
                                    {cities.map(c => <option key={c} value={c} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{c}</option>)}
                                </select>
                            </div>
                            
                            <div className="relative flex-1 md:w-48">
                                <Heart className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
                                <select 
                                    value={bloodGroup}
                                    onChange={e => setBloodGroup(e.target.value)}
                                    className="w-full h-14 pl-12 pr-10 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-[2rem] border border-[var(--border)] focus:ring-2 focus:ring-[var(--accent)] text-xs font-black uppercase tracking-widest appearance-none cursor-pointer"
                                >
                                    {bloodGroups.map(bg => <option key={bg} value={bg} className="bg-[var(--bg-card)] text-[var(--text-primary)]">{bg}</option>)}
                                </select>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* 🗺️ Main View Controller */}
                <div className={`flex-grow flex flex-col lg:flex-row mt-12 transition-all duration-700 ${viewMode === 'map-focus' ? 'h-[700px]' : ''}`}>
                    
                    {/* List Area */}
                    <AnimatePresence mode="popLayout">
                        {viewMode === 'split' && (
                            <motion.div 
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -30 }}
                                className="w-full lg:w-[450px] shrink-0 px-6 pb-20"
                            >
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2 mb-4">
                                        <h2 className="text-sm font-black uppercase tracking-[0.3em] text-[var(--text-muted)]">
                                            Found <span className="text-[var(--text-primary)]">{filtered.length}</span> Results
                                        </h2>
                                    </div>
                                    
                                    {isLoading ? (
                                        [...Array(3)].map((_, i) => (
                                            <div key={i} className="h-48 rounded-3xl bg-[var(--bg-card)] animate-pulse border border-[var(--border)]" />
                                        ))
                                    ) : filtered.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 bg-[var(--bg-card)] rounded-2xl flex items-center justify-center mx-auto mb-6 text-[var(--text-muted)]">
                                                <AlertCircle size={32} />
                                            </div>
                                            <h3 className="font-black text-[var(--text-primary)] mb-2">No Camps Found</h3>
                                            <p className="text-sm text-[var(--text-muted)]">Try adjusting your filters or location.</p>
                                        </div>
                                    ) : (
                                        filtered.map(c => (
                                            <CampCard 
                                                key={c.id} 
                                                camp={c} 
                                                isSelected={selectedCamp?.id === c.id}
                                                onClick={() => setSelectedCamp(c)}
                                            />
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Map Area */}
                    <div className="flex-grow min-h-[500px] lg:min-h-0 px-6 pb-20">
                        <motion.div 
                            layout
                            className="w-full h-full rounded-[3rem] overflow-hidden border border-[var(--border)] shadow-2xl relative"
                        >
                            <MapContainer 
                                center={[23.0225, 72.5714]} 
                                zoom={11} 
                                className="w-full h-full z-0"
                            >
                                <TileLayer 
                                    url="https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                                    attribution='&copy; <a href="https://www.google.com/intl/en_US/help/terms_maps.html">Google Maps</a>'
                                />
                                <ResizeMap />
                                {selectedCamp && <MapFlyTo position={[selectedCamp.lat, selectedCamp.lng]} />}
                                
                                {filtered.map(c => (
                                    <Marker 
                                        key={c.id} 
                                        position={[c.lat, c.lng]} 
                                        icon={redIcon}
                                        eventHandlers={{ click: () => setSelectedCamp(c) }}
                                    >
                                        <Popup className="premium-popup">
                                            <div className="p-2 min-w-[200px]">
                                                <h4 className="font-black text-[var(--accent)] mb-1 leading-tight">{c.name}</h4>
                                                <p className="text-[10px] font-bold text-gray-500 mb-3">{c.address}</p>
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="px-2 py-0.5 bg-red-50 rounded-md text-[9px] font-black text-red-600">
                                                        {c.slots - c.filled} LEFT
                                                    </div>
                                                </div>
                                                <button 
                                                    onClick={() => navigate(`/dashboard?section=donate&campId=${c.id}`)}
                                                    className="w-full py-2 bg-[var(--accent)] text-white text-[10px] font-black uppercase tracking-widest rounded-lg"
                                                >
                                                    Secure Spot
                                                </button>
                                            </div>
                                        </Popup>
                                    </Marker>
                                ))}
                            </MapContainer>

                            {/* Tactical Radar Overlay */}
                            <div className="absolute inset-0 pointer-events-none z-[400] overflow-hidden mix-blend-screen opacity-50 dark:opacity-70">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full border border-[#dc143c]/10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-[#dc143c]/20" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250px] h-[250px] rounded-full border border-[#dc143c]/30" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-[#dc143c]/10" />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-full w-[1px] bg-[#dc143c]/10" />
                                
                                {/* Scanning Sweep */}
                                <motion.div 
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                    className="absolute top-1/2 left-1/2 origin-top-left w-[400px] h-[400px]"
                                    style={{ background: 'conic-gradient(from 180deg at 0 0, transparent 0deg, rgba(220,20,60,0.3) 90deg, transparent 90deg)' }}
                                />
                                
                                {/* Central Pulse */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-[#dc143c] rounded-full shadow-[0_0_20px_#dc143c] animate-ping" style={{ animationDuration: '2s' }} />
                            </div>

                            {/* Floating Map Controls */}
                            <div className="absolute top-6 right-6 z-[800] flex flex-col gap-2">
                                <motion.button 
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => setSelectedCamp(null)}
                                    className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center text-[var(--accent)] border border-[var(--border)]"
                                >
                                    <Navigation size={20} />
                                </motion.button>
                            </div>

                            {/* Immersive Selection Detail Overlay */}
                            <AnimatePresence>
                                {selectedCamp && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 100 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 100 }}
                                        className="absolute bottom-10 left-10 right-10 z-[800]"
                                    >
                                        <div className="bg-[var(--bg-card)]/90 backdrop-blur-3xl border border-white/20 p-8 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.3)] flex flex-col md:flex-row items-center gap-8">
                                            <div className="flex-grow">
                                                <div className="flex items-center gap-3 mb-3">
                                                    <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-black uppercase tracking-widest rounded-full">
                                                        Featured Camp
                                                    </span>
                                                    <span className="text-[var(--text-muted)] text-[10px] font-bold flex items-center gap-1">
                                                        <MapPin size={12} /> {selectedCamp.city}
                                                    </span>
                                                </div>
                                                <h2 className="text-4xl font-black text-[var(--text-primary)] mb-2">{selectedCamp.name}</h2>
                                                <p className="text-[var(--text-secondary)] text-sm leading-relaxed max-w-xl opacity-70 italic">
                                                    "{selectedCamp.description}"
                                                </p>
                                            </div>
                                            
                                            <div className="flex flex-col sm:flex-row gap-4 shrink-0">
                                                <a href={`tel:${selectedCamp.contact}`} className="px-8 py-4 bg-[var(--bg-primary)] text-[var(--text-primary)] font-black text-xs uppercase tracking-widest rounded-2xl border border-[var(--border)] transition-all hover:bg-[var(--bg-secondary)] flex items-center gap-2">
                                                    <Phone size={14} /> Call Support
                                                </a>
                                                <button 
                                                    onClick={() => navigate(`/dashboard?section=donate&campId=${selectedCamp.id}`)}
                                                    className="px-10 py-5 bg-[var(--accent)] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-[0_15px_35px_rgba(220,20,60,0.3)] transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                                                >
                                                    <Heart size={16} /> Book Appointment
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
                .premium-popup .leaflet-popup-content-wrapper {
                    background: var(--bg-card);
                    color: var(--text-primary);
                    border-radius: 20px;
                    padding: 0;
                    overflow: hidden;
                    border: 1px solid var(--border);
                    backdrop-filter: blur(20px);
                }
                .premium-popup .leaflet-popup-content { margin: 0; }
                .premium-popup .leaflet-popup-tip { background: var(--bg-card); border: 1px solid var(--border); }
            `}} />
        </div>
    );
};

export default DonationCamps;
