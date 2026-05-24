import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    theme: 'dark',
    notifications: true,
    emailUpdates: true,
    studyReminders: true,
    defaultView: 'dashboard',
    language: 'en',
    timeZone: 'UTC',
    highContrast: false,
    privacyMode: false,
    reduceMotion: false,
    twentyFourHour: false,
  });

  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  /* ── Hourly reminder state ── */
  const [reminderEnabled, setReminderEnabled] = useState(
    () => localStorage.getItem('hourlyReminder') === 'true'
  );
  const [reminderStatus, setReminderStatus] = useState('');
  const reminderRef = useRef(null);   // holds the setInterval id

  /* ── fetch backend settings ── */
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
        const res = await fetch(`${API_BASE}/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to load user preferences');
        const data = await res.json();
        if (data.preferences) {
          setSettings(data.preferences);
          const prefs = data.preferences;
          const classes = [prefs.theme || 'dark'];
          if (prefs.highContrast) classes.push('high-contrast');
          if (prefs.privacyMode) classes.push('privacy-mode');
          if (prefs.reduceMotion) classes.push('reduce-motion');
          document.body.className = classes.join(' ');
          localStorage.setItem('themeClasses', classes.join(' '));
          localStorage.setItem('twentyFourHour', prefs.twentyFourHour ? 'true' : 'false');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchSettings();
  }, [user]);

  /* ── Hourly reminder scheduler ── */
  const sendAllReminders = async () => {
    const token = localStorage.getItem('token');
    const email = user?.email || '';
    if (!email) return;

    setReminderStatus('📤 Sending hourly digest...');
    try {
      // 1. Task reminder
      const tasksRaw = localStorage.getItem('plannerTasks');
      const tasks = tasksRaw ? JSON.parse(tasksRaw) : [];
      const pending = tasks.filter(t => t.status !== 'completed');
      if (pending.length) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/notify/task`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            to: email,
            tasks: pending.map(t => ({ title: t.title, subject: t.subject, dueDate: t.dueDate })),
          }),
        });
      }

      // 2. Goal update
      const goalsRaw = localStorage.getItem('userGoals');
      const goals = goalsRaw ? JSON.parse(goalsRaw) : [];
      const activeGoals = goals.filter(g => g.progress < 100);
      if (activeGoals.length) {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/notify/goal`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            to: email,
            goals: activeGoals.map(g => ({ title: g.title, category: g.category, progress: g.progress })),
          }),
        });
      }

      // 3. Resource digest
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/notify/resources`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ to: email, major: user?.major || 'General Study', videos: [] }),
      });

      const now = new Date().toLocaleTimeString();
      setReminderStatus(`✅ Digest sent at ${now}`);
    } catch {
      setReminderStatus('❌ Failed to send digest');
    }
  };

  /* ── start / stop interval when toggle changes ── */
  useEffect(() => {
    if (reminderEnabled) {
      sendAllReminders(); // send immediately on enable
      reminderRef.current = setInterval(sendAllReminders, 60 * 60 * 1000); // every 1 hr
      localStorage.setItem('hourlyReminder', 'true');
    } else {
      if (reminderRef.current) clearInterval(reminderRef.current);
      localStorage.setItem('hourlyReminder', 'false');
      setReminderStatus('');
    }
    return () => { if (reminderRef.current) clearInterval(reminderRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderEnabled]);

  if (!user) return null;
  if (loading) return <div className="settings-loading">Loading preferences...</div>;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => {
      const updated = { ...prev, [name]: type === 'checkbox' ? checked : value };
      const classes = [updated.theme || 'dark'];
      if (updated.highContrast) classes.push('high-contrast');
      if (updated.privacyMode) classes.push('privacy-mode');
      if (updated.reduceMotion) classes.push('reduce-motion');
      document.body.className = classes.join(' ');
      localStorage.setItem('themeClasses', classes.join(' '));
      if (name === 'twentyFourHour') {
        localStorage.setItem('twentyFourHour', checked ? 'true' : 'false');
      }
      if (name === 'defaultView') {
        localStorage.setItem('defaultView', value);
      }
      return updated;
    });
    setSuccess(false);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error('Failed to save settings');
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="settings-container fade-in">
      <div className="settings-welcome">
        <h1>⚙️ System Settings</h1>
        <p className="welcome-subtitle">Configure appearance, automated study alerts, and regional preferences.</p>
      </div>

      {error   && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">✅ Preferences saved successfully!</div>}

      {/* ─────────── HOURLY EMAIL REMINDER CARD ─────────── */}
      <div className="reminder-card glassmorphism">
        <div className="reminder-card-left">
          <span className="reminder-icon">📧</span>
          <div>
            <h3>Hourly Email Digest</h3>
            <p>
              When enabled, APAIS sends a combined email to{' '}
              <strong>{user?.email}</strong> every <strong>1 hour</strong> with:
            </p>
            <ul className="reminder-list">
              <li>📋 All pending study tasks with due dates</li>
              <li>🎯 Active goals with current progress</li>
              <li>📚 Latest resource recommendations for your major</li>
            </ul>
            {reminderStatus && (
              <span className="reminder-status-pill">{reminderStatus}</span>
            )}
          </div>
        </div>

        <div className="reminder-card-right">
          <label className="toggle-switch" htmlFor="hourlyReminder">
            <input
              id="hourlyReminder"
              type="checkbox"
              checked={reminderEnabled}
              onChange={e => setReminderEnabled(e.target.checked)}
            />
            <span className="toggle-track">
              <span className="toggle-thumb" />
            </span>
          </label>
          <span className={`toggle-label ${reminderEnabled ? 'toggle-label--on' : ''}`}>
            {reminderEnabled ? 'Active' : 'Off'}
          </span>
          {reminderEnabled && (
            <button
              className="btn-secondary send-now-btn"
              type="button"
              onClick={sendAllReminders}
            >
              Send Now
            </button>
          )}
        </div>
      </div>

      {/* ─────────── MAIN SETTINGS FORM ─────────── */}
      <form onSubmit={handleSubmit} className="settings-editor-form glassmorphism">

        {/* Appearance */}
        <div className="settings-block">
          <h2>🎨 Appearance &amp; Theme</h2>
          <p className="block-description">Choose how the Academic Intelligence Portal renders on your screen.</p>
          <div className="form-group">
            <label htmlFor="theme">Interface Theme</label>
            <select id="theme" name="theme" value={settings.theme} onChange={handleChange}>
              <option value="light">☀️ Light Theme (Default)</option>
              <option value="dark">🌙 Dark Theme (Glassmorphic)</option>
            </select>
          </div>
        </div>

        {/* Notifications */}
        <div className="settings-block">
          <h2>🔔 Browser Notifications</h2>
          <p className="block-description">Control in-app alerts and browser-level notifications.</p>
          <div className="checkboxes-group">
            <div className="checkbox-row">
              <input id="notifications" type="checkbox" name="notifications"
                checked={settings.notifications} onChange={handleChange} />
              <label htmlFor="notifications">
                <strong>Enable System Alerts</strong>
                <span>Browser alerts for task completions and performance changes.</span>
              </label>
            </div>
            <div className="checkbox-row">
              <input id="studyReminders" type="checkbox" name="studyReminders"
                checked={settings.studyReminders} onChange={handleChange} />
              <label htmlFor="studyReminders">
                <strong>Study Session Reminders</strong>
                <span>Trigger notifications when a task deadline falls under 24 hours.</span>
              </label>
            </div>
          </div>
        </div>

        {/* Accessibility & Privacy */}
        <div className="settings-block">
          <h2>👁️ Accessibility &amp; Privacy</h2>
          <p className="block-description">Enhance your viewing experience and control data visibility.</p>
          <div className="checkboxes-group">
            <div className="checkbox-row">
              <input id="highContrast" type="checkbox" name="highContrast"
                checked={settings.highContrast} onChange={handleChange} />
              <label htmlFor="highContrast">
                <strong>High Contrast Mode</strong>
                <span>Increases contrast of text and borders for better readability.</span>
              </label>
            </div>
            <div className="checkbox-row">
              <input id="reduceMotion" type="checkbox" name="reduceMotion"
                checked={settings.reduceMotion} onChange={handleChange} />
              <label htmlFor="reduceMotion">
                <strong>Reduce Motion</strong>
                <span>Disables UI animations and transitions.</span>
              </label>
            </div>
            <div className="checkbox-row">
              <input id="privacyMode" type="checkbox" name="privacyMode"
                checked={settings.privacyMode} onChange={handleChange} />
              <label htmlFor="privacyMode">
                <strong>Privacy Mode</strong>
                <span>Hides sensitive data like names and avatars on screen.</span>
              </label>
            </div>
            <div className="checkbox-row">
              <input id="twentyFourHour" type="checkbox" name="twentyFourHour"
                checked={settings.twentyFourHour} onChange={handleChange} />
              <label htmlFor="twentyFourHour">
                <strong>24-Hour Time Format</strong>
                <span>Displays time in 24-hour format (e.g., 14:00) instead of AM/PM.</span>
              </label>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="settings-block">
          <h2>🌐 System Preferences</h2>
          <p className="block-description">Manage regional formats, default dashboard, and language.</p>
          <div className="form-group-row">
            <div className="form-group">
              <label htmlFor="defaultView">Startup Default Page</label>
              <select id="defaultView" name="defaultView" value={settings.defaultView} onChange={handleChange}>
                <option value="dashboard">Dashboard Overview</option>
                <option value="planner">Study Planner</option>
                <option value="analytics">Performance Analytics</option>
                <option value="resources">Learning Resources</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="language">System Language</label>
              <select id="language" name="language" value={settings.language} onChange={handleChange}>
                <option value="en">English (US)</option>
                <option value="es">Español (ES)</option>
                <option value="fr">Français (FR)</option>
                <option value="de">Deutsch (DE)</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="timeZone">Timezone Setting</label>
            <select id="timeZone" name="timeZone" value={settings.timeZone} onChange={handleChange}>
              <option value="UTC">UTC (Coordinated Universal Time)</option>
              <option value="America/New_York">EST (Eastern Standard Time)</option>
              <option value="America/Los_Angeles">PST (Pacific Standard Time)</option>
              <option value="Europe/London">GMT (Greenwich Mean Time)</option>
              <option value="Asia/Kolkata">IST (Indian Standard Time)</option>
              <option value="Asia/Tokyo">JST (Japan Standard Time)</option>
            </select>
          </div>
        </div>

        <button type="submit" className="btn-primary settings-save-btn" disabled={saving}>
          {saving ? 'Saving…' : '💾 Save Preferences'}
        </button>
      </form>
    </div>
  );
};

export default Settings;