import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';

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

const Header = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [prevPath, setPrevPath] = useState(location.pathname);
  const [animKey, setAnimKey] = useState(0);

  const currentPage = PAGE_TITLES[location.pathname] || { title: 'APAIS', icon: '🎓', color: '#4361ee' };

  if (location.pathname === '/') {
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

  return (
    <header className={`header premium-header ${scrolled ? 'header-scrolled' : ''}`}>
      <div className="header-content">
        {/* Left – Page Title */}
        <div className="header-page-info">
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

            {/* Notification bell */}
            <button className="header-notif-btn" title="Notifications" aria-label="Notifications">
              <span>🔔</span>
              <span className="notif-pip" />
            </button>

            {/* User info badge */}
            <div className="header-badge premium-badge">
              <span className="header-semester">Sem {user.semester || 1}</span>
              <span className="header-divider">•</span>
              <span className="header-major">{user.major || 'Student'}</span>
            </div>

            {/* Avatar with glow */}
            <div className="header-avatar premium-avatar" style={{ '--page-color': currentPage.color }}>
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