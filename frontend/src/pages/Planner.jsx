import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PRIORITY_CONFIG = {
  high:   { label: 'High',   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   icon: '🔴', glow: '#ef444440' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  icon: '🟡', glow: '#f59e0b40' },
  low:    { label: 'Low',    color: '#10b981', bg: 'rgba(16,185,129,0.12)',  icon: '🟢', glow: '#10b98140' },
};

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'History', 'Economics', 'Geography',
  'Data Science', 'Machine Learning', 'Web Development',
];

const STATUS_ICONS  = { pending: '⏳', 'in-progress': '🔄', completed: '✅' };
const STATUS_COLORS = { pending: '#f59e0b', 'in-progress': '#4361ee', completed: '#10b981' };

const Planner = () => {
  const { user } = useAuth();
  const [tasks, setTasks]   = useState([]);
  const [filter, setFilter] = useState('all');
  const [newTask, setNewTask] = useState({
    title: '', subject: '', priority: 'medium', dueDate: '', estimatedHours: ''
  });

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setTasks([...tasks, {
      id: Date.now().toString(),
      ...newTask,
      estimatedHours: parseFloat(newTask.estimatedHours) || 0,
      status: 'pending',
      createdAt: new Date().toISOString()
    }]);
    setNewTask({ title: '', subject: '', priority: 'medium', dueDate: '', estimatedHours: '' });
  };

  const handleMarkComplete = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'completed' } : t));
  };

  const handleStatusCycle = (id) => {
    setTasks(tasks.map(t => {
      if (t.id !== id) return t;
      const cycle = { pending: 'in-progress', 'in-progress': 'completed', completed: 'pending' };
      return { ...t, status: cycle[t.status] };
    }));
  };

  const handleDelete = (id) => setTasks(tasks.filter(t => t.id !== id));

  const filtered = filter === 'all' ? tasks : tasks.filter(t => t.status === filter);

  const stats = {
    total:    tasks.length,
    pending:  tasks.filter(t => t.status === 'pending').length,
    inProg:   tasks.filter(t => t.status === 'in-progress').length,
    done:     tasks.filter(t => t.status === 'completed').length,
    totalHrs: tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0),
  };

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const today = new Date().toISOString().split('T')[0];

  const KPI_CARDS = [
    {
      icon: '📋', label: 'Total Tasks', value: stats.total,
      color: '#4361ee', bg: 'rgba(67,97,238,0.12)', subtext: 'Scheduled',
      extra: stats.total > 0 ? `${completionRate}% done` : 'Start adding tasks',
    },
    {
      icon: '⏳', label: 'Pending', value: stats.pending,
      color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', subtext: 'To do',
      extra: stats.pending > 0 ? 'Needs attention' : '🎉 All clear!',
    },
    {
      icon: '🔄', label: 'In Progress', value: stats.inProg,
      color: '#7c3aed', bg: 'rgba(124,58,237,0.12)', subtext: 'Active',
      extra: stats.inProg > 0 ? 'Keep going!' : 'None active',
    },
    {
      icon: '✅', label: 'Completed', value: stats.done,
      color: '#10b981', bg: 'rgba(16,185,129,0.12)', subtext: 'Done',
      extra: `${completionRate}% rate`,
    },
    {
      icon: '⏱️', label: 'Est. Hours', value: `${stats.totalHrs}h`,
      color: '#f72585', bg: 'rgba(247,37,133,0.12)', subtext: 'Total workload',
      extra: stats.totalHrs > 0 ? `≈ ${(stats.totalHrs / 8).toFixed(1)} study days` : 'No hours logged',
    },
  ];

  return (
    <div className="planner-container fade-in">

      {/* ── Premium KPI Cards ── */}
      <div className="kpi-row kpi-row--5col">
        {KPI_CARDS.map((card, i) => (
          <div
            key={i}
            className="kpi-card kpi-card--premium glassmorphism"
            style={{ '--kpi-color': card.color, '--kpi-bg': card.bg, animationDelay: `${i * 80}ms` }}
          >
            <div className="kpi-card-top">
              <div className="kpi-icon-wrap" style={{ background: card.bg }}>
                <span className="kpi-icon-emoji">{card.icon}</span>
              </div>
              <span className="kpi-trend-tag">{card.subtext}</span>
            </div>
            <div className="kpi-value-wrap">
              <div className="kpi-value kpi-value--large">{card.value}</div>
              <div className="kpi-label">{card.label}</div>
            </div>
            <div className="kpi-card-footer">
              <span className="kpi-extra-info">{card.extra}</span>
            </div>
            {/* Colour accent bar at bottom */}
            <div className="kpi-accent-bar" style={{ background: `linear-gradient(90deg, ${card.color}, transparent)` }} />
          </div>
        ))}
      </div>

      {/* Completion progress bar */}
      {stats.total > 0 && (
        <div className="planner-progress-bar glassmorphism">
          <div className="progress-bar-header">
            <span>🎯 Overall Completion</span>
            <strong>{completionRate}%</strong>
          </div>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${completionRate}%`, background: 'linear-gradient(90deg, #4361ee, #7c3aed, #10b981)' }}
            />
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="content-split-layout">

        {/* LEFT: Add Task Form */}
        <div className="form-panel-side">
          <div className="glass-panel">
            <h2>📝 Add New Task</h2>
            <p className="panel-subtitle">Schedule a study session or assignment deadline.</p>

            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-group">
                <label>Task Title</label>
                <input
                  type="text" name="title"
                  value={newTask.title} onChange={handleChange}
                  required placeholder="e.g. Solve Chapter 5 Exercises"
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text" list="planner-subjects" name="subject"
                  value={newTask.subject} onChange={handleChange}
                  required placeholder="Type or select..."
                />
                <datalist id="planner-subjects">
                  {SUBJECT_OPTIONS.map(s => <option key={s} value={s} />)}
                </datalist>
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Priority</label>
                  <select name="priority" value={newTask.priority} onChange={handleChange}>
                    <option value="low">🟢 Low</option>
                    <option value="medium">🟡 Medium</option>
                    <option value="high">🔴 High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Est. Hours</label>
                  <input
                    type="number" name="estimatedHours"
                    value={newTask.estimatedHours} onChange={handleChange}
                    min="0.5" step="0.5" placeholder="e.g. 2.5"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Due Date</label>
                <input
                  type="date" name="dueDate"
                  value={newTask.dueDate} onChange={handleChange}
                  min={today} required
                />
              </div>

              <button type="submit" className="btn-primary submit-btn-full">
                ＋ Schedule Task
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT: Task Board */}
        <div className="display-panel-side">
          {/* Filter Tabs */}
          <div className="filter-tab-row">
            {['all', 'pending', 'in-progress', 'completed'].map(f => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
              >
                {STATUS_ICONS[f] || '📋'} {f === 'all' ? 'All' : f.replace('-', ' ')}
                <span className="filter-count">
                  {f === 'all' ? tasks.length : tasks.filter(t => t.status === f).length}
                </span>
              </button>
            ))}
          </div>

          {filtered.length > 0 ? (
            <div className="tasks-board">
              {filtered.map((task, idx) => {
                const p = PRIORITY_CONFIG[task.priority];
                const isOverdue = task.dueDate && task.dueDate < today && task.status !== 'completed';
                return (
                  <div
                    key={task.id}
                    className={`task-card premium-card ${task.status === 'completed' ? 'task-done' : ''}`}
                    style={{
                      animationDelay: `${idx * 60}ms`,
                      borderLeft: `4px solid ${p.color}`,
                      boxShadow: `0 4px 24px ${p.glow}`,
                    }}
                  >
                    <div className="task-card-top">
                      <div className="task-priority-pill" style={{ background: p.bg, color: p.color }}>
                        {p.icon} {p.label}
                      </div>
                      <div className="task-card-actions">
                        <button
                          className="status-cycle-btn"
                          onClick={() => handleStatusCycle(task.id)}
                          title="Cycle status"
                          style={{ color: STATUS_COLORS[task.status] }}
                        >
                          {STATUS_ICONS[task.status]}
                        </button>
                        {task.status !== 'completed' && (
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => handleMarkComplete(task.id)}
                            title="Mark Complete"
                          >
                            Complete
                          </button>
                        )}
                        <button
                          className="delete-icon-btn"
                          onClick={() => handleDelete(task.id)}
                          title="Delete"
                        >✕</button>
                      </div>
                    </div>

                    <h3 className={`task-title ${task.status === 'completed' ? 'strikethrough' : ''}`}>
                      {task.title}
                    </h3>

                    <div className="task-meta-row">
                      <span className="task-subject-tag">📖 {task.subject}</span>
                      {task.estimatedHours > 0 && (
                        <span className="task-hours-tag">⏱ {task.estimatedHours}h</span>
                      )}
                    </div>

                    <div className="task-card-footer">
                      <span className={`due-date-tag ${isOverdue ? 'overdue' : ''}`}>
                        📅 {isOverdue ? '⚠️ Overdue — ' : ''}
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                          : 'No deadline'}
                      </span>
                      <span
                        className={`status-badge status-${task.status}`}
                        style={{ background: `${STATUS_COLORS[task.status]}22`, color: STATUS_COLORS[task.status] }}
                      >
                        {task.status.replace('-', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-panel glassmorphism">
              <span className="empty-icon">📚</span>
              <h3>{filter === 'all' ? 'No tasks scheduled yet' : `No ${filter} tasks`}</h3>
              <p>{filter === 'all' ? 'Add your first task on the left to get started.' : 'Change the filter or create a new task.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Planner;