import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation, useNavigate } from 'react-router-dom';

const PAGE_TITLES = {
  '/dashboard':  { title: 'Dashboard Overview',    icon: '📊', color: '#4361ee' },
  '/planner':    { title: 'Study Planner',          icon: '📅', color: '#f72585' },
  '/analytics':  { title: 'Performance Analytics', icon: '📈', color: '#7209b7' },
  '/resources':  { title: 'Learning Resources',    icon: '📚', color: '#3a0ca3' },
  '/goals':      { title: 'Academic Goals',         icon: '🎯', color: '#4cc9f0' },
  '/profile':    { title: 'My Profile',             icon: '👤', color: '#f77f00' },
  '/careers':    { title: 'Careers & AI Matcher',   icon: '💼', color: '#06b6d4' },
  '/settings':   { title: 'Settings',               icon: '⚙️', color: '#6c757d' },
};

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [animKey, setAnimKey] = useState(0);

  // ── Notifications state ────────────────────────────────
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const notifRef = useRef(null);

  const currentPage = PAGE_TITLES[location.pathname] || { title: 'APAIS', icon: '🎓', color: '#4361ee' };

  if (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register') {
    return null;
  }

  /* Animate page title when route changes */
  useEffect(() => {
    if (prevPath !== location.pathname) {
      setAnimKey(k => k + 1);
      setPrevPath(location.pathname);
    }
  }, [location.pathname]);

  /* Header shrink on scroll */
  useEffect(() => {
    const el = document.querySelector('.page-content') || window;
    const onScroll = () => setScrolled((el.scrollTop ?? window.scrollY) > 20);
    el.addEventListener('scroll', onScroll);
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  /* Clock display */
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const is24 = localStorage.getItem('twentyFourHour') === 'true';
  const timeStr = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: !is24 });
  const dateStr = time.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  /* Fetch notifications */
  useEffect(() => {
    if (!user) return;
    const loadNotifs = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_BASE}/notifications`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setNotifications(data || []);
          setUnreadCount((data || []).filter(n => !n.read).length);
        }
      } catch {
        // Use local fallback notifications
        const fallback = [
          { type: 'system', icon: '🎯', title: 'Study Reminder', message: 'You have pending tasks. Stay on track!', time: new Date(), read: false },
          { type: 'system', icon: '📈', title: 'Weekly Progress', message: 'Check your analytics for your performance.', time: new Date(Date.now() - 7200000), read: false },
          { type: 'system', icon: '📚', title: 'New Resources', message: 'Fresh learning materials available for you.', time: new Date(Date.now() - 3600000), read: true },
        ];
        setNotifications(fallback);
        setUnreadCount(fallback.filter(n => !n.read).length);
      }
    };
    loadNotifs();
  }, [user]);

  /* Close on outside click */
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleBellClick = () => {
    setNotifOpen(prev => !prev);
    if (!notifOpen) {
      // Mark all as read when opening
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  const formatRelativeTime = (t) => {
    if (!t) return '';
    const diff = Date.now() - new Date(t).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <header className={`header premium-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-content">
        {/* Left – Page Title */}
        <div className="header-page-info">
          <button 
            className="mobile-sidebar-toggle"
            onClick={() => document.body.classList.toggle('sidebar-mobile-open')}
            aria-label="Toggle Navigation Menu"
            title="Toggle Navigation Menu"
          >
            ☰
          </button>
          <div
            className="header-icon-badge"
            style={{ '--page-color': currentPage.color }}
          >
            <span
              key={`icon-${animKey}`}
              className="header-page-icon header-icon-jump"
            >
              {currentPage.icon}
            </span>
          </div>
          <div className="header-title-wrap">
            <h1
              key={`title-${animKey}`}
              className="header-page-title header-title-slide"
            >
              {currentPage.title}
            </h1>
            {user && (
              <span className="header-breadcrumb">
                APAIS &nbsp;›&nbsp; {currentPage.title}
              </span>
            )}
          </div>
        </div>

        {/* Right */}
        {user && (
          <div className="header-user-meta">
            {/* Date/Time chip */}
            <div className="header-time-chip">
              <span className="time-icon">🕐</span>
              <span className="time-text">{timeStr}</span>
              <span className="date-divider">·</span>
              <span className="date-text">{dateStr}</span>
            </div>

            {/* Notification bell with dropdown */}
            <div className="notif-wrapper" ref={notifRef}>
              <button
                className="header-notif-btn"
                title="Notifications"
                aria-label="Notifications"
                onClick={handleBellClick}
              >
                <span>🔔</span>
                {unreadCount > 0 && (
                  <span className="notif-pip notif-count">{unreadCount > 9 ? '9+' : unreadCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="notif-dropdown glassmorphism">
                  <div className="notif-dropdown-header">
                    <span className="notif-dropdown-title">🔔 Notifications</span>
                    <span className="notif-badge-pill">{notifications.length} total</span>
                  </div>
                  <div className="notif-list">
                    {notifications.length === 0 ? (
                      <div className="notif-empty">
                        <span>🎉</span>
                        <p>All caught up!</p>
                      </div>
                    ) : (
                      notifications.slice(0, 8).map((n, i) => (
                        <div
                          key={i}
                          className={`notif-item ${n.read ? 'notif-read' : 'notif-unread'}`}
                          onClick={() => n.url && window.open(n.url, '_blank')}
                          style={{ cursor: n.url ? 'pointer' : 'default' }}
                        >
                          <span className="notif-item-icon">{n.icon}</span>
                          <div className="notif-item-body">
                            <strong className="notif-item-title">{n.title}</strong>
                            <p className="notif-item-msg">{n.message}</p>
                          </div>
                          <span className="notif-item-time">{formatRelativeTime(n.time)}</span>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="notif-dropdown-footer">
                    <span onClick={() => setNotifOpen(false)}>View all in Settings →</span>
                  </div>
                </div>
              )}
            </div>

            {/* User info badge */}
            <div className="header-badge premium-badge">
              <span className="header-semester">Sem {user.semester || 1}</span>
              <span className="header-divider">•</span>
              <span className="header-major">{user.major || 'Student'}</span>
            </div>

            {/* Avatar with glow */}
            <div 
              className="header-avatar premium-avatar" 
              style={{ '--page-color': currentPage.color, cursor: 'pointer' }}
              onClick={() => navigate('/profile')}
            >
              {(user.firstName?.[0] || user.username?.[0] || 'U').toUpperCase()}
              <span className="avatar-online-dot" />
            </div>
          </div>
        )}
      </div>

      {/* Animated page-color accent underline */}
      <div
        className="header-accent-line"
        key={`line-${animKey}`}
        style={{ '--page-color': currentPage.color }}
      />
    </header>
  );
};

export default Header;