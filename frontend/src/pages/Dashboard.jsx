import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Quick Log State
  const [logForm, setLogForm] = useState({
    subject: 'Mathematics',
    topic: '',
    duration: '',
    notes: '',
    productivity: 3
  });
  const [logLoading, setLogLoading] = useState(false);
  const [logSuccess, setLogSuccess] = useState(false);
  const [recommendedVideos, setRecommendedVideos] = useState([]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to load dashboard metrics');
      }
      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/resources/search?q=${encodeURIComponent(user?.major || 'General Study')}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.ok) {
        const data = await response.json();
        setRecommendedVideos(data.slice(0, 3));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStats();
    if (user?.major) fetchVideos();
  }, [user]);

  const handleLogChange = (e) => {
    const { name, value } = e.target;
    setLogForm(prev => ({
      ...prev,
      [name]: name === 'productivity' ? parseInt(value) || 3 : value
    }));
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    if (!logForm.topic || !logForm.duration) return;

    setLogLoading(true);
    setLogSuccess(false);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/logs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: logForm.subject,
          topic: logForm.topic,
          duration: parseFloat(logForm.duration),
          notes: logForm.notes,
          productivity: logForm.productivity,
          date: new Date().toISOString()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to log study session');
      }

      setLogSuccess(true);
      setLogForm({
        subject: 'Mathematics',
        topic: '',
        duration: '',
        notes: '',
        productivity: 3
      });
      
      // Reload stats to reflect new learning hours immediately
      await fetchStats();
      
      setTimeout(() => setLogSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLogLoading(false);
    }
  };

  if (!user) return null;

  if (loading) {
    return <div className="dashboard-loading">Loading Dashboard Metrics...</div>;
  }

  // Formatting date functions
  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dateStr) => {
    if (!dateStr) return false;
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-welcome">
        <div>
          <h1>Hello, {user.firstName || user.username}! 🎓</h1>
          <p className="welcome-subtitle">Here is your academic overview and study track for today.</p>
        </div>
        <div className="welcome-meta-badge">
          {(() => {
            const levelMapping = {
              1: "LKG (Lower Kindergarten)",
              2: "UKG (Upper Kindergarten)",
              3: "Class 1 to 5 (Primary School)",
              4: "Class 6 to 10 (Secondary School)",
              5: "Class 11 & 12 (Higher Secondary)",
              6: "Undergraduate (UG / Bachelors)",
              7: "Postgraduate (PG / Masters)",
              8: "Doctorate (PhD / Research)"
            };
            const userLvl = levelMapping[user.semester] || `Semester ${user.semester}`;
            return (
              <>
                <span>{user.major}</span> • <span>{userLvl}</span>
              </>
            );
          })()}
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* Main Statistics Grid */}
      <div className="stats-grid premium-cards" style={{ display: 'flex', flexDirection: 'row', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="stat-card glassmorphism">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <h3>Weekly Learning Hours</h3>
            <p className="stat-value">{stats?.studyHoursThisWeek?.toFixed(1) || '0.0'} hrs</p>
            <span className="stat-meta">Active session metrics</span>
          </div>
        </div>
        <div className="stat-card glassmorphism">
          <div className="stat-icon">✅</div>
          <div className="stat-info">
            <h3>Task Completion Rate</h3>
            <p className="stat-value">{stats?.completionRate || 0}%</p>
            <span className="stat-meta">Based on Planner tasks</span>
          </div>
        </div>
        <div className="stat-card glassmorphism">
          <div className="stat-icon">🔔</div>
          <div className="stat-info">
            <h3>Upcoming Deadlines</h3>
            <p className="stat-value">{stats?.upcomingDeadlines || 0}</p>
            <span className="stat-meta">Active planner items</span>
          </div>
        </div>
        <div className="stat-card glassmorphism">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <h3>Current Study Streak</h3>
            <p className="stat-value">{stats?.streakDays || 0} Days</p>
            <span className="stat-meta">Consecutive daily sessions</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content-split">
        {/* Left column - dead lines and logs */}
        <div className="dashboard-main-left">
          
          {/* Deadlines Section */}
          <div className="dashboard-section-card glassmorphism">
            <h2>🚨 Nearest Targets & Deadlines</h2>
            <div className="deadlines-panel-grid">
              
              {/* Task Deadline */}
              <div className={`deadline-item-box ${isOverdue(stats?.nearestTaskDeadline) ? 'overdue' : 'active'}`}>
                <div className="deadline-label">Nearest Study Task</div>
                {stats?.nearestTaskTitle !== "No pending tasks" ? (
                  <>
                    <h3>{stats?.nearestTaskTitle}</h3>
                    <div className="deadline-date-tag">
                      <span>📅 Due:</span> {formatDeadline(stats?.nearestTaskDeadline)}
                    </div>
                  </>
                ) : (
                  <p className="no-data-hint">No pending tasks recorded. Excellent job!</p>
                )}
              </div>

              {/* Goal Deadline */}
              <div className="deadline-item-box active">
                <div className="deadline-label">Nearest Academic Goal</div>
                {stats?.nearestGoalTitle !== "No active goals" ? (
                  <>
                    <h3>{stats?.nearestGoalTitle}</h3>
                    <div className="deadline-date-tag goal">
                      <span>🎯 Target:</span> {formatDeadline(stats?.nearestGoalDeadline)}
                    </div>
                  </>
                ) : (
                  <p className="no-data-hint">No active academic goals set. Define one in Goals!</p>
                )}
              </div>

            </div>
          </div>

          {/* Performance Chart Section */}
          <div className="dashboard-section-card glassmorphism">
            <h2>📈 Study Performance by Day (Data Analytics)</h2>
            <p className="section-description">Total learning hours logged over the last 7 days.</p>
            
            <div className="custom-bar-chart-container">
              {stats?.performanceTrend && stats.performanceTrend.length > 0 ? (
                <div className="custom-bar-chart">
                  {stats.performanceTrend.map((item, idx) => {
                    // Maximum height of 100% corresponds to 6 hours for visual purposes
                    const maxHrs = 6.0;
                    const pct = Math.min((item.score / maxHrs) * 100, 100);
                    return (
                      <div className="chart-column" key={idx}>
                        <div className="column-bar-wrapper">
                          <div className="column-bar-hover-val">{item.score.toFixed(1)} hrs</div>
                          <div className="column-bar-fill" style={{ height: `${Math.max(pct, 5)}%` }}></div>
                        </div>
                        <span className="column-label">{item.date}</span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="no-data-hint">No daily learning records yet. Log study hours to activate chart!</p>
              )}
            </div>
          </div>

        </div>

        {/* Right column - Quick log and updates */}
        <div className="dashboard-main-right">
          
          {/* Quick study logger */}
          <div className="dashboard-section-card glassmorphism quick-logger-card">
            <h2>⏱️ Log Today's Study Hours</h2>
            <p className="section-description">Quickly record your study session duration and topic.</p>
            
            {logSuccess && <div className="alert alert-success">Session logged successfully!</div>}

            <form onSubmit={handleLogSubmit} className="quick-logger-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    list="dashboard-subjects"
                    name="subject"
                    value={logForm.subject}
                    onChange={handleLogChange}
                    required
                    placeholder="Type or select a subject"
                  />
                  <datalist id="dashboard-subjects">
                    <option value="Mathematics" />
                    <option value="Physics" />
                    <option value="Chemistry" />
                    <option value="Computer Science" />
                    <option value="Biology" />
                    <option value="English" />
                    <option value="History" />
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Hours Studied</label>
                  <input
                    type="number"
                    step="0.5"
                    name="duration"
                    min="0.5"
                    max="12"
                    placeholder="e.g. 2.5"
                    value={logForm.duration}
                    onChange={handleLogChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Topic / Concept Studied</label>
                <input
                  type="text"
                  name="topic"
                  placeholder="e.g. Integral Calculus or Matrix Multiplication"
                  value={logForm.topic}
                  onChange={handleLogChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Productivity Level (1-5)</label>
                <select name="productivity" value={logForm.productivity} onChange={handleLogChange}>
                  <option value="1">1 - Highly distracted</option>
                  <option value="2">2 - Low concentration</option>
                  <option value="3">3 - Normal study flow</option>
                  <option value="4">4 - High focus</option>
                  <option value="5">5 - Deep flow state</option>
                </select>
              </div>

              <button type="submit" className="btn-primary logger-btn" disabled={logLoading}>
                {logLoading ? 'Logging...' : 'Save Study Session'}
              </button>
            </form>
          </div>

          {/* New resources updates */}
          <div className="dashboard-section-card glassmorphism">
            <h2>📚 Recommended Videos based on your Major ({user.major})</h2>
            <p className="section-description">High-quality, highly-viewed YouTube videos tailored to your profile.</p>
            <div className="materials-updates-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendedVideos.length > 0 ? (
                recommendedVideos.map((video, idx) => (
                  <div className="material-update-item" key={idx} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img src={video.thumbnail} alt={video.title} style={{ width: '120px', borderRadius: '8px' }} />
                    <div className="update-details">
                      <h4><a href={video.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>{video.title}</a></h4>
                      <span className="update-meta-tag">{video.channel} • {video.views} • {video.duration}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data-hint">Loading recommendations...</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;