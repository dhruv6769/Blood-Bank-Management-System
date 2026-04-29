/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import {
  Menu, X, LogOut, Bell, CheckCheck, Droplets,
  ShieldCheck, Info, Sun, Moon, User, ChevronRight
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuthStore } from '../context/authStore';
import { useThemeStore } from '../context/themeStore';
import AnimatedAvatar from './AnimatedAvatar';
import api from '../lib/api';

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
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={() => setOpen(v => !v)}
        className="nb-bell-btn"
      >
        <motion.div animate={unread > 0 ? { rotate: [0, -15, 15, -10, 10, 0] } : {}} transition={{ duration: 0.6, delay: 0.3 }}>
          <Bell size={18} />
        </motion.div>
        <AnimatePresence>
          {unread > 0 && (
            <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} className="nb-badge">
              {unread > 9 ? '9+' : unread}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ type: 'spring', damping: 25, stiffness: 400 }}
            className="nb-panel"
          >
            <div className="nb-panel-header">
              <div>
                <h3 className="nb-panel-title">Notifications</h3>
                {unread > 0 && <p className="nb-panel-sub">{unread} unread</p>}
              </div>
              {unread > 0 && (
                <button onClick={markAll} className="nb-mark-all">
                  <CheckCheck size={12} /> Mark all read
                </button>
              )}
            </div>
            <div className="nb-list">
              {notifications.length === 0 ? (
                <div className="nb-empty">
                  <div className="nb-empty-icon"><Bell size={18} /></div>
                  <p>No notifications yet</p>
                </div>
              ) : notifications.map((n, i) => (
                <motion.div
                  key={n.id || i}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => openNotif(n)}
                  className={`nb-item ${!n.read ? 'unread' : ''}`}
                >
                  <div className={`nb-item-icon ${!n.read ? 'unread' : ''}`}>{getNotifIcon(n.type)}</div>
                  <div className="nb-item-content">
                    <p className={`nb-item-title ${!n.read ? 'unread' : ''}`}>{n.title}</p>
                    <p className="nb-item-msg">{n.message}</p>
                    <p className="nb-item-time">{timeAgo(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="nb-dot" />}
                </motion.div>
              ))}
            </div>
            {notifications.length > 0 && (
              <div className="nb-footer">
                <Link to="/dashboard" onClick={() => setOpen(false)} className="nb-footer-link">
                  View Dashboard →
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Detail modal */}
      {selected && createPortal(
        <AnimatePresence>
          <motion.div key="bd" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="nb-modal-bg" onClick={() => setSelected(null)}>
            <motion.div key="bc" initial={{ opacity: 0, scale: 0.88, y: 24 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 12 }} transition={{ type: 'spring', damping: 26, stiffness: 360 }}
              className="nb-modal" onClick={e => e.stopPropagation()}>
              <div className="nb-modal-header">
                <div className={`nb-modal-icon ${!selected.read ? 'unread' : ''}`}>
                  {getNotifIcon(selected.type)}
                </div>
                <div className="nb-modal-meta">
                  <h4>{selected.title}</h4>
                  <span>{timeAgo(selected.createdAt)}</span>
                </div>
                <button onClick={() => setSelected(null)} className="nb-modal-close"><X size={18} /></button>
              </div>
              <div className="nb-modal-body"><p>{selected.message}</p></div>
              <div className="nb-modal-footer">
                <button onClick={() => setSelected(null)} className="nb-modal-btn">Got it</button>
              </div>
            </motion.div>
          </motion.div>
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

  // Removed premature effect closure

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Camps', path: '/camps' },
    { name: 'Heroes', path: '/heroes' },
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
          top: 50px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100% - 48px);
          max-width: 1200px;
          z-index: 999;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          border-radius: 20px;
          font-family: 'Inter','Outfit',system-ui,sans-serif;
        }
        .lf-nav.top {
          background: var(--bg-card);
          border: 1px solid var(--border);
          backdrop-filter: blur(24px);
          box-shadow: var(--shadow);
        }
        .lf-nav.scrolled {
          background: var(--bg-primary);
          opacity: 0.98;
          top: 20px;
          width: calc(100% - 32px);
          border: 1px solid var(--border);
          box-shadow: var(--shadow);
        }
        .lf-nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 28px;
          height: 72px;
        }

        /* Logo */
        .lf-nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          flex-shrink: 0;
        }
        .lf-nav-logo-icon {
          width: 42px; height: 42px;
          background: linear-gradient(135deg, #dc143c, #8b0000);
          border-radius: 12px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 16px rgba(220,20,60,0.4);
          flex-shrink: 0;
        }
        .lf-nav-logo-text {
          font-size: 1.3rem;
          font-weight: 900;
          color: var(--text-primary);
          letter-spacing: -0.02em;
        }
        .lf-nav-logo-text span { color: #ff3355; }

        /* Desktop links */
        .lf-nav-links {
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .lf-nav-link {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--text-secondary);
          padding: 10px 18px;
          border-radius: 12px;
          transition: all 0.3s;
          letter-spacing: 0.01em;
          text-decoration: none;
        }
        .lf-nav-link:hover {
          color: var(--accent);
          background: rgba(220, 20, 60, 0.05);
        }

        /* Actions area */
        .lf-nav-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .lf-nav-theme-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
        }
        .lf-nav-theme-btn:hover { background: var(--bg-primary); color: var(--accent); }

        .lf-nav-login {
          padding: 7px 16px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.82rem; font-weight: 700;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .lf-nav-login:hover { background: var(--bg-primary); color: var(--accent); border-color: var(--accent); }

        .lf-nav-register {
          padding: 8px 18px;
          border-radius: 10px;
          background: linear-gradient(135deg, #dc143c, #9b0023);
          color: #fff;
          font-size: 0.82rem; font-weight: 800;
          text-decoration: none;
          transition: all 0.2s;
          white-space: nowrap;
          box-shadow: 0 2px 14px rgba(220,20,60,0.3);
          letter-spacing: 0.01em;
        }
        .lf-nav-register:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(220,20,60,0.4); }

        .lf-nav-logout {
          padding: 7px 14px;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          color: var(--text-secondary);
          font-size: 0.78rem; font-weight: 700;
          cursor: pointer;
          display: flex; align-items: center; gap: 6px;
          transition: all 0.2s;
          white-space: nowrap;
          letter-spacing: 0.01em;
          font-family: inherit;
        }
        .lf-nav-logout:hover { background: rgba(220,20,60,0.15); color: #ff3355; border-color: rgba(220,20,60,0.3); }

        .lf-nav-user-chip {
          display: flex; align-items: center; gap: 8px;
          padding: 4px 12px 4px 6px;
          border-radius: 100px;
          border: 1px solid var(--border);
          background: var(--bg-card);
          cursor: pointer;
          text-decoration: none;
          transition: all 0.2s;
        }
        .lf-nav-user-chip:hover { background: var(--bg-secondary); }
        .lf-nav-user-name {
          font-size: 0.78rem; font-weight: 800;
          color: var(--text-primary);
          text-transform: uppercase;
          letter-spacing: 0.05em;
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
          font-size: 9px; font-weight: 900;
          border-radius: 100px;
          display: flex; align-items: center; justify-content: center;
          padding: 0 4px;
          box-shadow: 0 0 8px rgba(220,20,60,0.5);
        }
        .nb-panel {
          position: absolute; right: 0; top: calc(100% + 10px);
          width: 320px;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 18px;
          overflow: hidden;
          box-shadow: var(--shadow);
          backdrop-filter: blur(24px);
          z-index: 1000;
        }
        .nb-panel-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 18px;
          border-bottom: 1px solid var(--border);
          background: var(--bg-secondary);
        }
        .nb-panel-title { font-size: 0.88rem; font-weight: 800; color: var(--text-primary); }
        .nb-panel-sub { font-size: 0.7rem; color: #ff3355; font-weight: 600; margin-top: 2px; }
        .nb-mark-all {
          display: flex; align-items: center; gap: 5px;
          font-size: 0.68rem; font-weight: 700; color: var(--text-muted);
          background: var(--bg-primary);
          border: 1px solid var(--border);
          border-radius: 8px;
          padding: 5px 10px;
          cursor: pointer; transition: all 0.2s;
          font-family: inherit;
          text-transform: uppercase; letter-spacing: 0.05em;
        }
        .nb-mark-all:hover { background: var(--bg-secondary); color: var(--text-primary); }
        .nb-list { max-height: 300px; overflow-y: auto; }
        .nb-empty {
          padding: 40px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          color: var(--text-muted);
        }
        .nb-empty-icon {
          width: 44px; height: 44px; border-radius: 50%;
          background: var(--bg-primary);
          display: flex; align-items: center; justify-content: center;
        }
        .nb-empty p { font-size: 0.78rem; font-weight: 500; }
        .nb-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 12px 18px;
          border-bottom: 1px solid var(--border);
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }
        .nb-item:hover { background: var(--bg-primary); }
        .nb-item.unread { background: rgba(220,20,60,0.04); }
        .nb-item-icon {
          width: 32px; height: 32px; border-radius: 9px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          background: var(--bg-primary);
        }
        .nb-item-icon.unread { background: rgba(220,20,60,0.12); }
        .nb-item-content { flex: 1; min-width: 0; }
        .nb-item-title { font-size: 0.78rem; font-weight: 700; color: var(--text-secondary); line-height: 1.3; }
        .nb-item-title.unread { color: var(--text-primary); }
        .nb-item-msg { font-size: 0.72rem; color: var(--text-muted); margin-top: 2px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        .nb-item-time { font-size: 0.68rem; color: var(--text-muted); margin-top: 4px; opacity: 0.6; }
        .nb-dot { width: 7px; height: 7px; border-radius: 50%; background: #ff3355; flex-shrink: 0; margin-top: 4px; }
        .nb-footer-link { font-size: 0.75rem; font-weight: 800; color: #ff3355; text-decoration: none; text-transform: uppercase; letter-spacing: 0.05em; }
        .nb-footer-link:hover { color: #ff6b6b; }

        /* Modal */
        .nb-modal-bg { position: fixed; inset: 0; z-index: 9999; background: rgba(0,0,0,0.7); backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: 24px; }
        .nb-modal { width: 100%; max-width: 420px; background: var(--bg-secondary); border: 1px solid var(--border); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow); }
        .nb-modal-header { display: flex; align-items: center; gap: 14px; padding: 20px 20px 18px; border-bottom: 1px solid var(--border); }
        .nb-modal-icon { width: 44px; height: 44px; border-radius: 13px; background: var(--bg-primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .nb-modal-icon.unread { background: rgba(220,20,60,0.15); }
        .nb-modal-meta { flex: 1; }
        .nb-modal-meta h4 { font-size: 0.95rem; font-weight: 800; color: var(--text-primary); }
        .nb-modal-meta span { font-size: 0.72rem; color: var(--text-muted); }
        .nb-modal-close { color: var(--text-muted); background: none; border: none; cursor: pointer; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 8px; transition: all 0.2s; }
        .nb-modal-close:hover { background: var(--bg-primary); color: var(--text-primary); }
        .nb-modal-body { padding: 20px; }
        .nb-modal-body p { font-size: 0.88rem; color: var(--text-secondary); line-height: 1.7; }
        .nb-modal-footer { padding: 0 20px 20px; }
        .nb-modal-btn { width: 100%; padding: 13px; border-radius: 13px; background: linear-gradient(135deg, #dc143c, #9b0023); color: #fff; font-size: 0.88rem; font-weight: 800; border: none; cursor: pointer; transition: all 0.2s; font-family: inherit; }
        .nb-modal-btn:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(220,20,60,0.35); }

        /* Mobile menu */
        .lf-mobile-menu {
          position: absolute; top: calc(100% + 8px); left: 0; right: 0;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 16px;
          box-shadow: var(--shadow);
          backdrop-filter: blur(24px);
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
          .lf-nav { width: calc(100% - 24px); top: 6px; border-radius: 16px; }
          .lf-nav-links { display: none; }
          .lf-nav-actions.desktop { display: none; }
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
            
            <motion.div
              className="lf-nav-logo-icon relative z-10"
              animate={{ boxShadow: ['0 0 16px rgba(220,20,60,0.4)', '0 0 28px rgba(220,20,60,0.7)', '0 0 16px rgba(220,20,60,0.4)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            >
              <Droplets size={18} color="#fff" />
            </motion.div>
            <span className="lf-nav-logo-text relative z-10">Life<span>Flow</span></span>
          </Link>

          {/* Desktop links */}
          <motion.div 
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
                <motion.div 
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
                      <motion.div
                        layoutId="activeNavTab"
                        className="absolute bottom-1 left-1/2 -translate-x-1/2 w-5 h-[2px] bg-[#dc143c] rounded-full shadow-[0_0_8px_rgba(220,20,60,0.4)]"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

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
            className="lf-mobile-trigger"
            style={{
              width: 36, height: 36, borderRadius: 10, border: '1px solid var(--border)',
              background: 'var(--bg-card)', color: 'var(--text-secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="lf-mobile-menu"
            >
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
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
};

export default Navbar;
