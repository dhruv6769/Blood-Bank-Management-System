 
import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Menu, X, LogOut, Bell, CheckCheck, Droplets,
  ShieldCheck, Info, Sun, Moon, User, ChevronRight
} from 'lucide-react';
import { AnimatePresence, motion as Motion } from 'framer-motion';
import { useAuthStore } from '../context/authStore';
import { useThemeStore } from '../context/themeStore';
import AnimatedAvatar from './AnimatedAvatar';
import api from '../lib/api';
import logoImg from '../assets/logo.png';

const getNotifIcon = (type) => {
  if (type === 'DONATION_APPROVED') return <Droplets className="w-4 h-4 text-red-400" />;
  if (type === 'DONATION_REJECTED') return <ShieldCheck className="w-4 h-4 text-slate-400" />;
  return <Info className="w-4 h-4 text-blue-400" />;
};

const timeAgo = (date) => {
  const s = Math.floor((Date.now() - new Date(date)) / 1000);
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

/* ── Notification Bell ─────────────────────────────────────────── */
const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const ref = useRef(null);

  const fetch = useCallback(async () => {
    try {
      const res = await api.get('/user/notifications');
      if (res.data.status === 'success') {
        setNotifications(res.data.data);
        setUnread(res.data.unreadCount || 0);
      }
    } catch { /* silent */ }
  }, []);

  useEffect(() => { 
    const init = async () => { await fetch(); };
    init();
    const t = setInterval(fetch, 60000); 
    return () => clearInterval(t); 
  }, [fetch]);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  const openNotif = async (n) => {
    setSelected(n);
    if (!n.read) {
      try {
        await api.put(`/user/notifications/${n.id}/read`);
        setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x));
        setUnread(c => Math.max(0, c - 1));
      } catch { /* silent */ }
    }
  };

  const markAll = async () => {
    try {
      await api.put('/user/notifications/read-all');
      setUnread(0);
      setNotifications(p => p.map(n => ({ ...n, read: true })));
    } catch { /* silent */ }
  };

  return (
    <div className="relative" ref={ref}>
      <Motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(v => !v)}
        className="nb-bell-btn"
      >
        <Motion.div animate={unread > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}} transition={{ duration: 0.6, delay: 0.3 }}>
          <Bell size={18} />
        </Motion.div>
        <AnimatePresence>
          {unread > 0 && (
            <Motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="nb-badge">
              {unread > 9 ? '9+' : unread}
            </Motion.span>
          )}
        </AnimatePresence>
      </Motion.button>

      <AnimatePresence>
        {open && (
          <Motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: 15, scale: 0.95, filter: 'blur(10px)' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="nb-panel"
          >
            <div className="nb-panel-header">
              <div>
                <h3 className="nb-panel-title">Notifications</h3>
                {unread > 0 && (
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#dc143c] animate-pulse"></div>
                    <p className="nb-panel-sub">{unread} New Notification{unread > 1 ? 's' : ''}</p>
                  </div>
                )}
              </div>
              {unread > 0 && (
                <Motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={markAll} 
                  className="nb-mark-all"
                >
                  <CheckCheck size={12} className="text-[#dc143c]" /> Mark all as read
                </Motion.button>
              )}
            </div>
            <div className="nb-list custom-scrollbar">
              {notifications.length === 0 ? (
                <div className="nb-empty">
                  <div className="nb-empty-icon relative">
                    <div className="absolute inset-0 bg-[#dc143c]/20 blur-xl rounded-full animate-pulse"></div>
                    <Bell size={20} className="relative z-10 text-[var(--text-muted)]" />
                  </div>
                  <p className="text-[10px] font-black uppercase tracking-widest">No new notifications</p>
                </div>
              ) : (
                <Motion.div
                  initial="hidden"
                  animate="visible"
                  variants={{
                    visible: { transition: { staggerChildren: 0.05 } }
                  }}
                >
                  {notifications.map((n, i) => (
                    <Motion.div
                      key={n.id || i}
                      variants={{
                        hidden: { opacity: 0, x: -10 },
                        visible: { opacity: 1, x: 0 }
                      }}
                      whileHover={{ x: 4, backgroundColor: 'rgba(220,20,60,0.02)' }}
                      onClick={() => openNotif(n)}
                      className={`nb-item ${!n.read ? 'unread' : ''}`}
                    >
                      <div className={`nb-item-icon ${!n.read ? 'unread active-glow' : ''}`}>
                        {getNotifIcon(n.type)}
                      </div>
                      <div className="nb-item-content">
                        <p className={`nb-item-title ${!n.read ? 'unread' : ''}`}>{n.title}</p>
                        <p className="nb-item-msg">{n.message}</p>
                        <div className="flex items-center gap-2 mt-2">
                           <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] opacity-30"></div>
                           <p className="nb-item-time">{timeAgo(n.createdAt)}</p>
                        </div>
                      </div>
                      {!n.read && (
                        <div className="relative flex items-center justify-center">
                           <div className="absolute inset-0 bg-[#dc143c] blur-md opacity-40 animate-pulse"></div>
                           <span className="nb-dot" />
                        </div>
                      )}
                    </Motion.div>
                  ))}
                </Motion.div>
              )}
            </div>
            {notifications.length > 0 && (
              <div className="nb-footer">
                <Link to="/dashboard" onClick={() => setOpen(false)} className="nb-footer-link group">
                  Access Mission Log 
                  <ChevronRight size={14} className="inline ml-1 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      {selected && createPortal(
        <AnimatePresence>
          <Motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="nb-modal-bg" onClick={() => setSelected(null)}>
            <Motion.div key="bc" initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ type: 'spring', damping: 28, stiffness: 350 }}
              className="nb-modal relative overflow-hidden" onClick={e => e.stopPropagation()}>
              
              {/* Clinical Grid Background */}
              <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#dc143c 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
              
              <div className="nb-modal-header relative z-10">
                <div className="relative">
                  <div className="absolute inset-0 bg-[#dc143c]/20 blur-xl rounded-full"></div>
                  <div className={`nb-modal-icon relative z-10 border border-[var(--border)] ${!selected.read ? 'unread' : ''}`}>
                    {getNotifIcon(selected.type)}
                  </div>
                </div>
                <div className="nb-modal-meta">
                  <p className="text-[8px] font-black uppercase tracking-[0.4em] text-[#dc143c] mb-1">Signal Decrypted</p>
                  <h4 className="brand-font">{selected.title}</h4>
                  <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">{timeAgo(selected.createdAt)}</span>
                </div>
                <Motion.button whileHover={{ rotate: 90 }} onClick={() => setSelected(null)} className="nb-modal-close"><X size={18} /></Motion.button>
              </div>
              <div className="nb-modal-body relative z-10">
                <div className="p-6 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border)] shadow-inner">
                  <p className="text-sm font-bold leading-relaxed text-[var(--text-secondary)]">{selected.message}</p>
                </div>
              </div>
              <div className="nb-modal-footer relative z-10">
                <Motion.button 
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(null)} 
                  className="nb-modal-btn"
                >
                  Acknowledge Protocol
                </Motion.button>
              </div>
            </Motion.div>
          </Motion.div>
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
};

/* ── Main Navbar ───────────────────────────────────────────────── */
const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { isDark, toggleTheme } = useThemeStore();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Home', path: '/' },
    ...(isAuthenticated ? [
      { name: 'Donation Matrix', path: '/camps' },
      { name: 'Hall of Heroes', path: '/heroes' },
    ] : []),
    { name: 'Community', path: '/community' },
    { name: 'Compatibility', path: '/compatibility' },
  ];

  const handleLogout = () => { logout(); navigate('/login'); };
  const showBell = isAuthenticated && user?.role === 'DONOR';

  return (
    <>
      <style>{`
        .lf-nav {
          position: fixed;
          top: 32px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 64px);
          max-width: 1400px;
          z-index: 999;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
          border-radius: 2.5rem;
          font-family: 'Inter','Outfit',system-ui,sans-serif;
        }
        .lf-nav.top {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(12px);
          box-shadow: 0 20px 80px rgba(0,0,0,0.1);
        }
        .lf-nav.scrolled {
          background: var(--bg-card);
          top: 20px;
          width: calc(100% - 32px);
          border: 1px solid var(--glass-border);
          box-shadow: var(--shadow), var(--inner-glow);
          backdrop-filter: blur(16px) saturate(1.8);
        }
        .lf-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 40px;
          height: 90px;
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lf-nav.scrolled .lf-nav-inner {
          height: 80px;
        }

        /* Logo */
        .lf-nav-logo {
          display: flex;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .lf-nav-logo-icon {
          width: 48px; height: 48px;
          background: linear-gradient(135deg, #dc143c, #9b0023);
          border-radius: 16px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 10px 25px rgba(220,20,60,0.4);
          flex-shrink: 0;
          overflow: hidden;
          transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lf-nav-logo:hover .lf-nav-logo-icon {
          transform: rotate(10deg) scale(1.1);
          box-shadow: 0 15px 35px rgba(220,20,60,0.6);
        }
        .lf-nav-logo-text {
          font-size: 1.6rem;
          font-weight: 950;
          color: var(--text-primary);
          letter-spacing: -0.04em;
          text-transform: lowercase;
        }
        .lf-nav-logo-text span { color: #dc143c; }

        /* Desktop links */
        .lf-nav-links {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lf-nav-link {
          font-size: 0.95rem;
          font-weight: 800;
          color: var(--text-secondary);
          padding: 12px 24px;
          border-radius: 1.25rem;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          letter-spacing: 0.02em;
          text-decoration: none;
          text-transform: uppercase;
          font-size: 0.75rem;
        }
        .lf-nav-link:hover {
          color: var(--accent);
          background: rgba(220, 20, 60, 0.08);
          transform: translateY(-2px);
        }
        .lf-nav-link.active {
          color: var(--accent);
          background: rgba(220, 20, 60, 0.05);
        }

        /* Actions area */
        .lf-nav-actions {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
        }
        .lf-nav-theme-btn {
          width: 44px; height: 44px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.3s;
        }
        .lf-nav-theme-btn:hover { 
          background: var(--bg-primary); 
          color: var(--accent);
          transform: rotate(15deg);
        }

        .lf-nav-login {
          padding: 10px 24px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.85rem; font-weight: 800;
          text-decoration: none;
          transition: all 0.3s;
          white-space: nowrap;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .lf-nav-login:hover { background: var(--bg-primary); color: var(--accent); border-color: var(--accent); }

        .lf-nav-register {
          padding: 12px 28px;
          border-radius: 14px;
          background: linear-gradient(135deg, #dc143c, #9b0023);
          color: #fff;
          font-size: 0.85rem; font-weight: 900;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          white-space: nowrap;
          box-shadow: 0 10px 25px rgba(220,20,60,0.4);
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lf-nav-register:hover { 
          transform: translateY(-4px) scale(1.02); 
          box-shadow: 0 20px 40px rgba(220,20,60,0.5); 
        }

        .lf-nav-logout {
          padding: 10px 20px;
          border-radius: 14px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.8rem; font-weight: 800;
          cursor: pointer;
          display: flex; align-items: center; gap: 8px;
          transition: all 0.3s;
          white-space: nowrap;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }
        .lf-nav-logout:hover { background: rgba(220,20,60,0.15); color: #ff3355; border-color: rgba(220,20,60,0.3); }

        .lf-nav-user-chip {
          display: flex; align-items: center; gap: 12px;
          padding: 6px 20px 6px 8px;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lf-nav-user-chip:hover { 
          background: var(--bg-secondary); 
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        .lf-nav-user-name {
          font-size: 0.85rem; font-weight: 900;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Notification Bell styles */
        .nb-bell-btn {
          position: relative;
          width: 34px; height: 34px;
          border-radius: 9px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .nb-bell-btn:hover { background: var(--bg-primary); color: var(--accent); }
        .nb-panel {
          position: absolute; right: 0; top: calc(100% + 15px);
          width: 360px;
          background: var(--bg-card);
          border: 1px solid var(--glass-border);
          border-radius: 2rem;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(0,0,0,0.4);
          backdrop-filter: blur(24px) saturate(1.8);
          z-index: 1000;
        }
        .nb-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 24px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(to bottom, var(--bg-secondary), transparent);
        }
        .nb-panel-title { font-size: 0.95rem; font-weight: 900; color: var(--text-primary); text-transform: uppercase; letter-spacing: 0.1em; }
        .nb-panel-sub { font-size: 0.65rem; color: #dc143c; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; }
        .nb-mark-all {
          display: flex; align-items: center; gap: 6px;
          font-size: 0.65rem; font-weight: 900; color: var(--text-muted);
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 6px 14px;
          cursor: pointer; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          text-transform: uppercase; letter-spacing: 0.1em;
        }
        .nb-mark-all:hover { background: var(--bg-secondary); color: #dc143c; border-color: #dc143c/20; }
        .nb-list { max-height: 380px; overflow-y: auto; padding: 8px; }
        .nb-empty {
          padding: 60px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 15px;
          color: var(--text-muted);
        }
        .nb-empty-icon {
          width: 54px; height: 54px; border-radius: 18px;
          background: var(--bg-primary);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--border);
        }
        .nb-item {
          display: flex; align-items: flex-start; gap: 16px;
          padding: 16px 20px;
          border-radius: 1.25rem;
          margin-bottom: 4px;
          cursor: pointer;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }
        .nb-item:hover { background: rgba(255, 255, 255, 0.03); }
        .nb-item.unread { background: rgba(220,20,60,0.03); }
        .nb-item-icon {
          width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-primary);
          border: 1px solid var(--border);
          transition: all 0.3s;
        }
        .nb-item-icon.unread { 
            background: rgba(220,20,60,0.1); 
            border-color: rgba(220,20,60,0.2);
            box-shadow: 0 0 15px rgba(220,20,60,0.1);
        }
        .nb-item-icon.active-glow {
            animation: neural-pulse-icon 2s infinite;
        }
        @keyframes neural-pulse-icon {
            0% { border-color: rgba(220,20,60,0.2); }
            50% { border-color: rgba(220,20,60,0.6); }
            100% { border-color: rgba(220,20,60,0.2); }
        }
        .nb-item-content { flex: 1; min-width: 0; }
        .nb-item-title { font-size: 0.8rem; font-weight: 800; color: var(--text-secondary); line-height: 1.4; transition: color 0.3s; }
        .nb-item-title.unread { color: var(--text-primary); }
        .nb-item-msg { font-size: 0.75rem; color: var(--text-muted); margin-top: 4px; line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-weight: 500; }
        .nb-item-time { font-size: 0.65rem; color: var(--text-muted); font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.5; }
        .nb-dot { width: 8px; height: 8px; border-radius: 50%; background: #dc143c; flex-shrink: 0; box-shadow: 0 0 10px #dc143c; }
        .nb-footer { padding: 16px; border-top: 1px solid var(--border); text-align: center; background: rgba(0,0,0,0.02); }
        .nb-footer-link { font-size: 0.72rem; font-weight: 900; color: #dc143c; text-decoration: none; text-transform: uppercase; letter-spacing: 0.1em; transition: all 0.3s; }
        
        /* Modal */
        .nb-modal-bg { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.85); backdrop-filter: blur(16px); display: flex; align-items: center; justify-content: center; padding: 24px; }
        .nb-modal { width: 100%; max-width: 460px; background: var(--bg-secondary); border: 1px solid var(--glass-border); border-radius: 2.5rem; overflow: hidden; box-shadow: 0 50px 150px rgba(0,0,0,0.6); }
        .nb-modal-header { display: flex; align-items: center; gap: 18px; padding: 32px; border-bottom: 1px solid var(--border); }
        .nb-modal-icon { width: 52px; height: 52px; border-radius: 16px; background: var(--bg-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nb-modal-icon.unread { background: rgba(220,20,60,0.15); border-color: rgba(220,20,60,0.3); }
        .nb-modal-meta { flex: 1; }
        .nb-modal-meta h4 { font-size: 1.1rem; font-weight: 900; color: var(--text-primary); letter-spacing: -0.02em; }
        .nb-modal-close { color: var(--text-muted); background: var(--bg-primary); border: 1px solid var(--border); cursor: pointer; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 12px; transition: all 0.3s; }
        .nb-modal-close:hover { background: #dc143c; color: #fff; border-color: #dc143c; }
        .nb-modal-body { padding: 32px; }
        .nb-modal-footer { padding: 0 32px 32px; }
        .nb-modal-btn { width: 100%; padding: 18px; border-radius: 1.25rem; background: linear-gradient(135deg, #dc143c, #9b0023); color: #fff; font-size: 0.85rem; font-weight: 900; border: none; cursor: pointer; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); text-transform: uppercase; letter-spacing: 0.1em; box-shadow: 0 10px 30px rgba(220,20,60,0.3); }
        .nb-modal-btn:hover { transform: translateY(-4px); box-shadow: 0 20px 50px rgba(220,20,60,0.5); }

        /* Mobile menu */
        .lf-mobile-menu {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 16px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(12px);
        }
        .lf-mobile-link {
          display: block; padding: 11px 14px;
          border-radius: 11px;
          font-size: 0.88rem; font-weight: 700;
          color: var(--text-secondary);
          text-decoration: none;
          transition: all 0.15s;
        }
        .lf-mobile-link:hover, .lf-mobile-link.active { color: var(--text-primary); background: var(--bg-primary); }
        .lf-mobile-link.active { color: #ff3355; }
        .lf-mobile-divider { height: 1px; background: var(--border); margin: 10px 0; }
        .lf-mobile-btn {
          width: 100%; padding: 11px;
          border-radius: 11px; font-size: 0.85rem; font-weight: 700;
          cursor: pointer; margin-top: 4px; transition: all 0.2s;
          font-family: inherit;
        }
        .lf-mobile-btn.login {
          background: var(--bg-primary); color: var(--text-secondary);
          border: 1px solid var(--border);
        }
        .lf-mobile-btn.register {
          background: linear-gradient(135deg, #dc143c, #9b0023); color: #fff;
          border: none; box-shadow: 0 4px 20px rgba(220,20,60,0.3);
        }
        .lf-mobile-btn.logout {
          background: rgba(220,20,60,0.1); color: #ff3355;
          border: 1px solid rgba(220,20,60,0.2); display: flex; align-items: center; justify-content: center; gap: 8px;
        }

        @media (max-width: 768px) {
          .lf-nav { width: calc(100% - 24px); top: 12px; border-radius: 1.5rem; }
          .lf-nav-inner { padding: 0 20px; height: 70px !important; }
          .lf-nav-logo-text { font-size: 1.2rem; }
          .lf-nav-logo-icon { width: 36px; height: 36px; border-radius: 12px; }
          .lf-nav-links { display: none; }
          .lf-nav-actions.desktop { display: none; }
          
          .lf-mobile-menu {
            top: calc(100% + 16px);
            padding: 32px 24px;
            border-radius: 2.5rem;
            max-height: calc(100vh - 140px);
            overflow-y: auto;
            text-align: center;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .lf-mobile-link {
            font-size: 1rem;
            padding: 16px;
            border-radius: 1.25rem;
            letter-spacing: 0.05em;
            text-transform: uppercase;
          }
          .lf-mobile-btn {
            padding: 16px;
            border-radius: 1.25rem;
            font-size: 0.9rem;
            letter-spacing: 0.1em;
            text-transform: uppercase;
          }
        }
        @media (min-width: 769px) {
          .lf-mobile-trigger { display: none; }
        }
      `}</style>

      <nav className={`lf-nav ${scrolled ? 'scrolled' : 'top'}`}>
        <div className="lf-nav-inner">
          {/* Logo */}
          <Link to="/" className="lf-nav-logo relative group">
            {/* Logo Aura */}
            <div className="absolute inset-0 bg-[#dc143c] blur-xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 rounded-full scale-150" />
            
            <Motion.div
              className="lf-nav-logo-icon relative z-10 overflow-hidden"
              animate={{ boxShadow: ['0 0 16px rgba(220,20,60,0.4)', '0 0 28px rgba(220,20,60,0.7)', '0 0 16px rgba(220,20,60,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <img src={logoImg} alt="LifeFlow Logo" className="w-full h-full object-cover scale-[1.6]" />
            </Motion.div>
            <span className="lf-nav-logo-text relative z-10">Life<span>Flow</span></span>
          </Link>

          {/* Desktop links */}
          <Motion.div 
            className="lf-nav-links"
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
          >
            {navLinks.map(link => {
              const isActive = location.pathname === link.path;
              return (
                <Motion.div 
                  key={link.path}
                  variants={{
                    hidden: { opacity: 0, y: -10 },
                    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
                  }}
                >
                  <Link
                    to={link.path}
                    className={`lf-nav-link relative ${isActive ? 'active' : ''}`}
                    style={{ color: isActive ? 'var(--accent)' : 'var(--text-secondary)' }}
                  >
                    {link.name}
                    {isActive && (
                      <Motion.div
                        layoutId="activeNavTab"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#dc143c] rounded-full shadow-[0_0_8px_rgba(220,20,60,0.4)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </Motion.div>
              );
            })}
          </Motion.div>

          {/* Desktop actions */}
          <div className="lf-nav-actions desktop">
            {isAuthenticated ? (
              <>
                {showBell && <NotificationBell />}
                <button onClick={toggleTheme} className="lf-nav-theme-btn" title="Toggle theme">
                  {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} />}
                </button>
                <Link
                  to={user?.role === 'ADMIN' ? '/admin-dashboard' : user?.role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard'}
                  className="lf-nav-user-chip relative group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#dc143c] to-[#9b0023] rounded-[100px] blur opacity-0 group-hover:opacity-40 transition-opacity duration-300" />
                  <div className="relative flex items-center gap-2 bg-[var(--bg-card)] rounded-[100px]">
                    <div className="relative">
                       <AnimatedAvatar size="sm" user={user} />
                       <div className="absolute -inset-1 border border-[#dc143c]/30 rounded-full animate-[spin_4s_linear_infinite]" />
                    </div>
                    <span className="lf-nav-user-name relative z-10">{user?.name?.split(' ')[0]}</span>
                  </div>
                </Link>
                <button onClick={handleLogout} className="lf-nav-logout" title="Logout">
                  <LogOut size={13} />
                </button>
              </>
            ) : (
              <>
                <button onClick={toggleTheme} className="lf-nav-theme-btn" title="Toggle theme">
                  {isDark ? <Sun size={15} color="#fbbf24" /> : <Moon size={15} />}
                </button>
                <Link to="/login" className="lf-nav-login">Log in</Link>
                <Link to="/register" className="lf-nav-register">Get Started</Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            className="lf-mobile-trigger flex md:hidden"
            style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-secondary)', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
            }}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <Motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="lf-mobile-menu"
            >
              {/* Branding in Menu */}
              <div className="mb-6 pt-2">
                <h2 className="text-3xl font-black brand-font tracking-tighter text-[var(--text-primary)]">LifeFlow<span className="text-[#dc143c]">.</span></h2>
                <div className="h-1 w-8 bg-[#dc143c] mx-auto rounded-full mt-2 opacity-50"></div>
              </div>
              {isAuthenticated && (
                <div className="flex items-center gap-3 p-4 mb-2 bg-black/5 dark:bg-white/5 rounded-xl">
                  <AnimatedAvatar size="sm" user={user} />
                  <div className="flex-1 overflow-hidden">
                    <p className="text-xs font-black text-primary truncate uppercase tracking-widest" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter" style={{ color: 'var(--text-muted)' }}>Active Session</p>
                  </div>
                </div>
              )}
              {navLinks.map(link => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`lf-mobile-link ${location.pathname === link.path ? 'active' : ''}`}
                  onClick={() => setMobileOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              {isAuthenticated && (
                <Link 
                  to={user?.role === 'ADMIN' ? '/admin-dashboard' : user?.role === 'ORGANIZATION' ? '/org-dashboard' : '/dashboard'}
                  className="lf-mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  My Dashboard
                </Link>
              )}
              <div className="lf-mobile-divider" />
              <button onClick={toggleTheme} className="lf-mobile-btn login" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                {isDark ? <><Sun size={15} color="#fbbf24" /> Light Mode</> : <><Moon size={15} /> Dark Mode</>}
              </button>
              {isAuthenticated ? (
                <button onClick={handleLogout} className="lf-mobile-btn logout">
                  <LogOut size={14} /> Logout Session
                </button>
              ) : (
                <>
                  <Link to="/login" className="lf-mobile-btn login" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Log in</Link>
                  <Link to="/register" className="lf-mobile-btn register" style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}>Get Started</Link>
                </>
              )}
            </Motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
