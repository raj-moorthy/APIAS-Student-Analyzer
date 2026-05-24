import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'History', 'Economics', 'Geography',
  'Data Science', 'Machine Learning', 'Web Development',
  'Mechanical Engineering', 'Electrical Engineering',
];

const DOMAIN_OPTIONS = [
  'Tutorial', 'Full Course Lecture', 'Crash Course',
  'Problem Solving', 'Exam Preparation', 'Lab / Practical',
];

const Resources = () => {
  const { user } = useAuth();
  const [youtubeVideos, setYoutubeVideos] = useState([]);
  const [subject, setSubject]     = useState('');
  const [domain, setDomain]       = useState('');
  const [level, setLevel]         = useState('');
  const [customQuery, setCustomQuery] = useState('');

  const [loading, setLoading]     = useState(false);
  const [searched, setSearched]   = useState(false);
  const [error, setError]         = useState('');

  /* ── fetch from backend ── */
  const fetchVideos = useCallback(async (query) => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setSearched(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/resources/search?q=${encodeURIComponent(query + ' english high quality')}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error('Failed to retrieve videos');
      const data = await res.json();
      setYoutubeVideos(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── auto-load profile-based recommendations on mount ── */
  useEffect(() => {
    if (user?.major) {
      setSubject(user.major);
      fetchVideos(`${user.major} tutorial english`);
    }
  }, [user, fetchVideos]);

  /* ── search handler ── */
  const handleSearch = (e) => {
    e.preventDefault();
    const parts = [];
    if (subject)     parts.push(subject);
    if (domain)      parts.push(domain);
    if (level)       parts.push(level);
    if (customQuery) parts.push(customQuery);
    if (parts.length === 0) parts.push('study tips');
    fetchVideos(parts.join(' ') + ' english');
  };

  /* ── quick-tag click ── */
  const handleQuickTag = (tag) => {
    setSubject(tag);
    setDomain('');
    setLevel('');
    setCustomQuery('');
    fetchVideos(`${tag} tutorial english`);
  };

  if (!user) return null;

  return (
    <div className="resources-container fade-in">

      {/* ── Hero Search Panel ── */}
      <div className="res-hero glassmorphism">
        <div className="res-hero-text">
          <h2>🔍 Discover Free Video Lectures</h2>
          <p>Choose your subject and domain to find the highest-viewed, English-language educational content from YouTube.</p>
        </div>

        <form className="res-search-form" onSubmit={handleSearch}>
          <div className="res-search-row">
            {/* Subject */}
            <div className="form-group res-field">
              <label>Subject / Topic</label>
              {subject === 'Custom' ? (
                <input
                  type="text"
                  value={customQuery} // fallback to customQuery for typing if custom
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder="Type your subject..."
                  autoFocus
                />
              ) : (
                <select value={subject} onChange={(e) => setSubject(e.target.value)}>
                  <option value="">Select Subject...</option>
                  {SUBJECT_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  <option value="Custom">Other (Type Custom)</option>
                </select>
              )}
            </div>

            {/* Domain */}
            <div className="form-group res-field">
              <label>Domain / Format</label>
              <select value={domain} onChange={(e) => setDomain(e.target.value)}>
                <option value="">Any Format</option>
                {DOMAIN_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Level Dropdown */}
            <div className="form-group res-field">
              <label>Difficulty Level</label>
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                <option value="">Any Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <button type="submit" className="btn-primary res-search-btn">
              🔎 Search
            </button>
          </div>
        </form>

        {/* Quick Tags */}
        <div className="res-quick-tags">
          <span className="tag-label">Popular:</span>
          {['Calculus', 'Data Structures', 'Organic Chemistry', 'Physics Mechanics', 'Machine Learning', 'Study Tips'].map(tag => (
            <button key={tag} className="tag-btn" onClick={() => handleQuickTag(tag)}>{tag}</button>
          ))}
        </div>
      </div>

      {/* ── Results ── */}
      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="res-loader">
          <div className="res-loader-spinner" />
          <span>Searching YouTube for top-rated educational content…</span>
        </div>
      ) : youtubeVideos.length > 0 ? (
        <>
          <div className="res-results-header">
            <h3>📺 Found {youtubeVideos.length} Educational Videos</h3>
            <span className="res-results-tag">Sorted by views & relevance</span>
          </div>
          <div className="res-video-grid">
            {youtubeVideos.map((video, idx) => (
              <div
                className="res-video-card glassmorphism"
                key={video.id}
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <div className="res-thumb-wrap">
                  <img src={video.thumbnail} alt={video.title} className="res-thumb-img" />
                  <span className="res-duration-pill">{video.duration}</span>
                </div>
                <div className="res-video-body">
                  <span className="res-channel-name">{video.channel}</span>
                  <h4 className="res-video-title" title={video.title}>{video.title}</h4>
                  <p className="res-video-desc">{video.description}</p>
                  <div className="res-video-footer">
                    <span className="res-views-badge">🔥 {video.views}</span>
                    <a
                      href={video.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary res-watch-btn"
                    >
                      ▶ Watch
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : searched ? (
        <div className="res-empty">
          <div className="res-empty-icon">🎓</div>
          <h3>No matching videos found</h3>
          <p>Try broadening your search keywords or selecting a different subject.</p>
        </div>
      ) : null}
    </div>
  );
};

export default Resources;