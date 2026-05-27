import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { path: '/dashboard',  icon: '📊', label: 'Dashboard',   color: '#4361ee' },
  { path: '/planner',    icon: '📅', label: 'Study Planner', color: '#f72585' },
  { path: '/analytics',  icon: '📈', label: 'Analytics',    color: '#7209b7' },
  { path: '/resources',  icon: '📚', label: 'Resources',    color: '#3a0ca3' },
  { path: '/goals',      icon: '🎯', label: 'Goals',        color: '#4cc9f0' },
  { path: '/careers',    icon: '💼', label: 'Careers',      color: '#06b6d4' },
  { path: '/profile',    icon: '👤', label: 'Profile',      color: '#f77f00' },
  { path: '/settings',   icon: '⚙️', label: 'Settings',     color: '#6c757d' },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');

  /* Pulse animation for active nav item */
  const activeItem = NAV_ITEMS.find(i => i.path === location.pathname);

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || user.username?.[0] || ''}`.toUpperCase();

  const handleLogout = () => {
    if (!showLogoutConfirm) { setShowLogoutConfirm(true); return; }
    setShowLogoutConfirm(false);
    setShowFeedbackModal(true);
  };

  const submitFeedback = async (e) => {
    if (e) e.preventDefault();
    const newFeedback = {
      text: feedbackText.trim() || `Excellent portal! Rated APAIS ${rating} out of 5.`,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.username || "Scholar",
      role: `${user.major || 'Student'} Major, Sem ${user.semester || 1}`,
      avatar: `${user.firstName?.[0] || ''}${user.lastName?.[0] || user.username?.[0] || 'S'}`.toUpperCase(),
      rating
    };

    const existing = localStorage.getItem('apais_scholar_feedback');
    let feedbacks = [];
    if (existing) {
      try {
        feedbacks = JSON.parse(existing);
        if (!Array.isArray(feedbacks)) feedbacks = [];
      } catch {
        feedbacks = [];
      }
    }
    feedbacks.unshift(newFeedback);
    localStorage.setItem('apais_scholar_feedback', JSON.stringify(feedbacks));

    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
      const cleanApiBase = apiBase.endsWith('/') ? apiBase.slice(0, -1) : apiBase;
      await fetch(`${cleanApiBase}/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFeedback)
      });
    } catch (err) {
      console.error("Failed to save feedback to global database", err);
    }

    logout();
    navigate('/login');
  };

  const skipFeedback = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className={`sidebar premium-sidebar ${collapsed ? 'sidebar-collapsed' : ''}`}>
      {/* ── Brand / Logo ── */}
      <div className="sidebar-header premium-brand">
        <div className="sidebar-brand">
          <div className={`sidebar-brand-icon premium-brand-icon ${collapsed ? 'icon-only' : ''}`}>
            <span>A</span>
            <div className="brand-ring" />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text brand-slide-in">
              <h2>APAIS</h2>
              <p>Academic Intelligence</p>
            </div>
          )}
        </div>
        <button
          className="sidebar-toggle-btn premium-toggle"
          onClick={() => setCollapsed(!collapsed)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <span className={`toggle-icon ${collapsed ? 'toggle-right' : 'toggle-left'}`}>
            {collapsed ? '›' : '‹'}
          </span>
        </button>
      </div>

      {/* ── Navigation ── */}
      <nav className="sidebar-nav premium-nav">
        <ul>
          {NAV_ITEMS.map(({ path, icon, label, color }) => (
            <li
              key={path}
              onMouseEnter={() => setHovered(path)}
              onMouseLeave={() => setHovered(null)}
            >
              <NavLink
                to={path}
                className={({ isActive }) =>
                  `sidebar-link premium-link ${isActive ? 'active premium-active' : ''}`
                }
                title={collapsed ? label : undefined}
                style={{ '--nav-color': color }}
              >
                {/* Active indicator bar */}
                <span className="nav-active-bar" />
                <span className={`nav-icon premium-icon ${hovered === path ? 'icon-bounce' : ''}`}>
                  {icon}
                </span>
                {!collapsed && (
                  <span className="nav-label premium-label">{label}</span>
                )}
                {!collapsed && hovered === path && (
                  <span className="nav-arrow">›</span>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* ── Sidebar Footer ── */}
      <div className="sidebar-footer premium-footer">
        {/* User profile row */}
        <div 
          className="sidebar-user-row premium-user" 
          onClick={() => navigate('/profile')} 
          style={{ cursor: 'pointer', transition: 'background 0.2s', borderRadius: '10px' }}
        >
          <div
            className="sidebar-avatar premium-avatar-sm"
            style={{
              background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)'
            }}
          >
            {initials}
            <span className="avatar-online" />
          </div>
          {!collapsed && (
            <div className="sidebar-user-info user-info-slide">
              <span className="sidebar-username">{user.firstName || user.username}</span>
              <span className="sidebar-role">{user.major || 'Student'}</span>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          className={`sidebar-logout-btn premium-logout ${showLogoutConfirm ? 'logout-confirm' : ''}`}
          onClick={handleLogout}
          onBlur={() => setShowLogoutConfirm(false)}
          title={collapsed ? 'Logout' : undefined}
        >
          {collapsed ? (
            <span>⏻</span>
          ) : showLogoutConfirm ? (
            <span>⚠ Confirm Logout?</span>
          ) : (
            <>
              <span className="logout-icon">⏻</span>
              <span>Logout</span>
            </>
          )}
        </button>
      </div>

      {/* ── Feedback Modal on Logout ── */}
      {showFeedbackModal && (
        <div className="premium-quiz-modal-overlay" style={{ zIndex: 99999 }}>
          <div className="premium-quiz-modal-content feedback-modal glassmorphism" style={{ maxWidth: '440px', background: 'var(--bg-card)' }}>
            <div className="quiz-modal-header">
              <h2>📣 Share Your Experience</h2>
              <button className="close-quiz-btn" onClick={skipFeedback}>✕</button>
            </div>
            
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4', margin: '0' }}>
              Your testimonial will be featured dynamically on our landing page under "What Scholars Say"!
            </p>

            <form onSubmit={submitFeedback} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>Your Rating</span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      style={{
                        fontSize: '2rem',
                        cursor: 'pointer',
                        color: star <= rating ? '#eab308' : 'var(--text-light)',
                        transition: 'transform 0.1s, color 0.1s'
                      }}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-muted)' }}>Testimonial Description</label>
                <textarea
                  placeholder="e.g. APAIS has significantly boosted my study schedule with its brilliant AI tasks and resource matching!"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  rows={3}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '10px',
                    border: '1px solid var(--border-color)',
                    background: 'var(--bg-primary)',
                    color: 'var(--text-main)',
                    fontSize: '0.85rem',
                    resize: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={skipFeedback}
                  className="btn-secondary"
                  style={{ flex: 1, padding: '0.7rem 0', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Skip
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ flex: 2, padding: '0.7rem 0', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Submit &amp; Logout ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;