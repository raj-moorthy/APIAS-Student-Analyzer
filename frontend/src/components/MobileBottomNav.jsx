import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BOTTOM_NAV = [
  { path: '/dashboard',  icon: '📊', label: 'Home' },
  { path: '/planner',    icon: '📅', label: 'Planner' },
  { path: '/resources',  icon: '📚', label: 'Learn' },
  { path: '/goals',      icon: '🎯', label: 'Goals' },
  { path: '/profile',    icon: '👤', label: 'Profile' },
];

const MobileBottomNav = () => {
  const { user } = useAuth();
  if (!user) return null;

  return (
    <nav className="mobile-bottom-nav" role="navigation" aria-label="Mobile Navigation">
      {BOTTOM_NAV.map(({ path, icon, label }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `mobile-nav-item ${isActive ? 'active' : ''}`
          }
          style={{ position: 'relative' }}
        >
          <span className="mobile-nav-icon" aria-hidden="true">{icon}</span>
          <span className="mobile-nav-label">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default MobileBottomNav;
