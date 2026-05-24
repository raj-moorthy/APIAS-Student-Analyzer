import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* ─── tiny animated KPI card ─── */
const KpiCard = ({ icon, label, value, sub, color = 'primary', delay = 0 }) => (
  <div className="kpi-card glassmorphism" style={{ animationDelay: `${delay}ms` }}>
    <div className={`kpi-icon kpi-icon--${color}`}>{icon}</div>
    <div className="kpi-body">
      <div className="kpi-value">{value}</div>
      <div className="kpi-label">{label}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
    </div>
  </div>
);

/* ─── collapsible section wrapper ─── */
const Section = ({ title, icon, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className={`analytics-section ${open ? 'section-open' : 'section-closed'}`}>
      <button className="section-toggle" onClick={() => setOpen(o => !o)}>
        <span>{icon} {title}</span>
        <span className={`toggle-chevron ${open ? 'chevron-up' : ''}`}>▾</span>
      </button>
      <div className="section-body">{children}</div>
    </div>
  );
};

/* ─── horizontal score bar ─── */
const ScoreBar = ({ label, score, max = 100, delay = 0 }) => {
  const pct = Math.min(Math.round((score / max) * 100), 100);
  const color = pct >= 80 ? '#10b981' : pct >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div className="score-bar-row" style={{ animationDelay: `${delay}ms` }}>
      <span className="score-bar-label">{label}</span>
      <div className="score-bar-track">
        <div
          className="score-bar-fill"
          style={{ width: `${pct}%`, background: color, '--target-w': `${pct}%` }}
        />
      </div>
      <span className="score-bar-pct" style={{ color }}>{pct}%</span>
    </div>
  );
};

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'History', 'Economics', 'Geography',
];

const Analytics = () => {
  const { user } = useAuth();

  const [analyticsData, setAnalyticsData] = useState(null);
  const [marks, setMarks]                 = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState('');

  const [markForm, setMarkForm] = useState({
    subject: '',
    examName: '',
    score: '',
    maxScore: '100',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  const [sheetUploading, setSheetUploading] = useState(false);
  const [sheetMsg, setSheetMsg]             = useState('');

  /* ── fetch ── */
  const fetchAll = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [aRes, mRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/performance`, { headers }),
        fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/marks`,       { headers }),
      ]);

      if (!aRes.ok) throw new Error('Failed to load performance metrics');
      if (!mRes.ok) throw new Error('Failed to load recorded grades');

      setAnalyticsData(await aRes.json());
      setMarks(await mRes.json());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── add mark ── */
  const handleMarkSubmit = async (e) => {
    e.preventDefault();
    if (!markForm.examName || !markForm.score || !markForm.subject) return;
    setFormLoading(true);
    setFormSuccess(false);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/marks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          subject:  markForm.subject,
          examName: markForm.examName,
          score:    parseFloat(markForm.score),
          maxScore: parseFloat(markForm.maxScore),
          date:     new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error('Failed to save grade');
      setFormSuccess(true);
      setMarkForm({ subject: '', examName: '', score: '', maxScore: '100' });
      await fetchAll();
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  /* ── delete mark ── */
  const handleMarkDelete = async (id) => {
    if (!window.confirm('Remove this grade entry?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/marks/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchAll();
    } catch (err) {
      setError(err.message);
    }
  };

  /* ── parse & bulk-import marksheet ── */
  const handleMarksheetUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setSheetUploading(true);
    setSheetMsg('');
    const text = await file.text();
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    // Expected CSV: Subject,ExamName,Score,MaxScore
    const token = localStorage.getItem('token');
    let imported = 0;
    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length < 3) continue;
      const [subject, examName, score, maxScore = '100'] = parts;
      const numScore = parseFloat(score);
      if (isNaN(numScore)) continue;
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/analytics/marks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ subject, examName, score: numScore, maxScore: parseFloat(maxScore), date: new Date().toISOString() }),
        });
        imported++;
      } catch {}
    }
    await fetchAll();
    setSheetMsg(`✅ Imported ${imported} grade(s) from marksheet.`);
    setSheetUploading(false);
    e.target.value = '';
    setTimeout(() => setSheetMsg(''), 5000);
  };

  /* ── derive per-subject averages for bar chart ── */
  const subjectAverages = React.useMemo(() => {
    if (!marks.length) return [];
    const map = {};
    marks.forEach(m => {
      if (!map[m.subject]) map[m.subject] = { total: 0, maxTotal: 0, count: 0 };
      map[m.subject].total    += m.score;
      map[m.subject].maxTotal += m.maxScore;
      map[m.subject].count    += 1;
    });
    return Object.entries(map).map(([subject, { total, maxTotal }]) => ({
      subject,
      pct: Math.round((total / maxTotal) * 100),
    })).sort((a, b) => b.pct - a.pct);
  }, [marks]);

  if (!user) return null;
  if (loading) return <div className="analytics-loading">Compiling Academic Performance Profile…</div>;

  return (
    <div className="analytics-container fade-in">

      {/* ── KPI Row ── */}
      <div className="kpi-row">
        <KpiCard
          icon="📊" color="primary" delay={0}
          label="Overall Average" value={`${analyticsData?.overallScore || 0}%`}
          sub="Weighted GPA index"
        />
        <KpiCard
          icon="📝" color="accent" delay={80}
          label="Exams Recorded" value={marks.length}
          sub="Total assessments"
        />
        <KpiCard
          icon="🏆" color="success" delay={160}
          label="Strongest Subject"
          value={analyticsData?.strengths?.[0] || '—'}
          sub="Above 80% average"
        />
        <KpiCard
          icon="⚠️" color="danger" delay={240}
          label="Needs Attention"
          value={analyticsData?.improvementAreas?.[0] || '—'}
          sub="Below 70% average"
        />
        <KpiCard
          icon="🧠" color="warning" delay={320}
          label="Learning Style"
          value={analyticsData?.learningStyle || 'Adaptive'}
          sub="Cognitive profile"
        />
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {/* ── Marksheet Upload Panel ── */}
      <div className="marksheet-upload-panel glassmorphism">
        <div className="marksheet-upload-info">
          <span className="marksheet-icon">📄</span>
          <div>
            <h3>Upload Marksheet</h3>
            <p>Import any format of file to bulk-load grades and test analytics integration. Format: <code>Subject, Exam Name, Score, Max Score</code></p>
          </div>
        </div>
        <div className="marksheet-upload-action">
          {sheetMsg && <span className="sheet-success-msg">{sheetMsg}</span>}
          <label className="btn-secondary marksheet-upload-btn" htmlFor="marksheetInput">
            {sheetUploading ? '⏳ Importing...' : '📂 Upload Files'}
          </label>
          <input
            id="marksheetInput" type="file"
            style={{ display: 'none' }}
            onChange={handleMarksheetUpload}
            disabled={sheetUploading}
          />
        </div>
      </div>

      {/* ── Subject Performance Bars ── */}
      {subjectAverages.length > 0 && (
        <Section title="Subject Performance Overview" icon="📊">
          <div className="subject-bars-grid">
            {subjectAverages.map((s, i) => (
              <ScoreBar key={s.subject} label={s.subject} score={s.pct} delay={i * 60} />
            ))}
          </div>
        </Section>
      )}

      {/* ── Two-column layout ── */}
      <div className="analytics-split">

        {/* LEFT */}
        <div className="analytics-left">

          {/* Add grade form */}
          <Section title="Add Exam Grade" icon="📝">
            {formSuccess && <div className="alert alert-success">Grade saved successfully!</div>}
            <form onSubmit={handleMarkSubmit} className="grade-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label>Subject</label>
                  <input
                    type="text"
                    list="analytics-subjects"
                    name="subject"
                    value={markForm.subject}
                    onChange={e => setMarkForm(p => ({ ...p, subject: e.target.value }))}
                    required
                    placeholder="e.g. Mathematics"
                  />
                  <datalist id="analytics-subjects">
                    {SUBJECT_OPTIONS.map(s => <option key={s} value={s} />)}
                  </datalist>
                </div>
                <div className="form-group">
                  <label>Exam / Test Name</label>
                  <input
                    type="text"
                    value={markForm.examName}
                    onChange={e => setMarkForm(p => ({ ...p, examName: e.target.value }))}
                    required placeholder="e.g. Midterm, Quiz 3"
                  />
                </div>
              </div>
              <div className="form-row-2">
                <div className="form-group">
                  <label>Your Score</label>
                  <input
                    type="number" step="0.5" min="0"
                    value={markForm.score}
                    onChange={e => setMarkForm(p => ({ ...p, score: e.target.value }))}
                    required placeholder="e.g. 85"
                  />
                </div>
                <div className="form-group">
                  <label>Maximum Score</label>
                  <input
                    type="number" step="0.5" min="1"
                    value={markForm.maxScore}
                    onChange={e => setMarkForm(p => ({ ...p, maxScore: e.target.value }))}
                    required placeholder="e.g. 100"
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary" disabled={formLoading}>
                {formLoading ? 'Saving…' : '＋ Add Exam Score'}
              </button>
            </form>
          </Section>

          {/* Grades table */}
          <Section title="Recorded Grades Manager" icon="📋" defaultOpen={marks.length > 0}>
            {marks.length > 0 ? (
              <div className="grades-table-container">
                <table className="premium-grades-table">
                  <thead>
                    <tr>
                      <th>Subject</th>
                      <th>Exam</th>
                      <th>Score</th>
                      <th>%</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {marks.map((m) => {
                      const pct = Math.round((m.score / m.maxScore) * 100);
                      return (
                        <tr key={m.id}>
                          <td className="font-bold">{m.subject}</td>
                          <td>{m.examName}</td>
                          <td>{m.score}/{m.maxScore}</td>
                          <td className={`font-bold ${pct >= 80 ? 'text-green' : pct < 70 ? 'text-red' : 'text-yellow'}`}>
                            {pct}%
                          </td>
                          <td>
                            <button onClick={() => handleMarkDelete(m.id)} className="btn-danger btn-sm">✕</button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-data-hint">No grades recorded yet. Add your first exam above.</p>
            )}
          </Section>
        </div>

        {/* RIGHT */}
        <div className="analytics-right">

          {/* Study Plan */}
          <Section title="Actionable Study Plan" icon="🎯">
            <div className="plan-steps-list">
              {analyticsData?.studyPlan?.length > 0 ? (
                analyticsData.studyPlan.map((step, idx) => (
                  <div className="plan-step-item" key={idx} style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="step-number-badge">{idx + 1}</div>
                    <div className="step-content">
                      <div className="step-header">
                        <h4>{step.step}</h4>
                        <span className={`priority-tag ${step.priority?.toLowerCase()}`}>
                          {step.priority}
                        </span>
                      </div>
                      <p>{step.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-data-hint">Log multiple exam grades to generate your personalised study plan.</p>
              )}
            </div>
          </Section>

          {/* Recommendations */}
          <Section title="Performance Recommendations" icon="💡" defaultOpen={false}>
            <ul className="recommendations-bullets">
              {analyticsData?.recommendations?.length > 0 ? (
                analyticsData.recommendations.map((rec, idx) => (
                  <li key={idx}>
                    <span className="bullet-star">✨</span>
                    <p>{rec}</p>
                  </li>
                ))
              ) : (
                <li><p className="no-data-hint">Recommendations appear once grades are recorded.</p></li>
              )}
            </ul>
          </Section>

        </div>
      </div>
    </div>
  );
};

export default Analytics;