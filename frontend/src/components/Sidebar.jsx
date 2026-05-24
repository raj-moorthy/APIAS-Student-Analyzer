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

  /* Pulse animation for active nav item */
  const activeItem = NAV_ITEMS.find(i => i.path === location.pathname);

  if (!user) return null;

  const initials = `${user.firstName?.[0] || ''}${user.lastName?.[0] || user.username?.[0] || ''}`.toUpperCase();

  const handleLogout = () => {
    if (!showLogoutConfirm) { setShowLogoutConfirm(true); return; }
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
        <div className="sidebar-user-row premium-user">
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
    </aside>
  );
};

export default Sidebar;