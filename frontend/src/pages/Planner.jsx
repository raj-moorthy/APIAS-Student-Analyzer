import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const PRIORITY_CONFIG = {
  high: { label: 'High', color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: '🔴' },
  medium: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: '🟡' },
  low: { label: 'Low', color: '#10b981', bg: 'rgba(16,185,129,0.1)', icon: '🟢' },
};

const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Computer Science',
  'Biology', 'English', 'History', 'Economics', 'Geography',
  'Data Science', 'Machine Learning', 'Web Development',
];

const STATUS_ICONS = { pending: '⏳', completed: '✅' };

const Planner = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
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
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProg: tasks.filter(t => t.status === 'in-progress').length,
    done: tasks.filter(t => t.status === 'completed').length,
    totalHrs: tasks.reduce((s, t) => s + (t.estimatedHours || 0), 0),
  };

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="planner-container fade-in">

      {/* ── KPI Bar ── */}
      <div className="kpi-row">
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--primary">📋</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.total}</div>
            <div className="kpi-label">Total Tasks</div>
          </div>
        </div>
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--warning">⏳</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.pending}</div>
            <div className="kpi-label">Pending</div>
          </div>
        </div>
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--success">✅</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.done}</div>
            <div className="kpi-label">Completed</div>
          </div>
        </div>
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--danger">⏱️</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.totalHrs}h</div>
            <div className="kpi-label">Est. Hours</div>
          </div>
        </div>
      </div>

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
            {['all', 'pending', 'completed'].map(f => (
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
                    style={{ animationDelay: `${idx * 60}ms`, borderLeft: `4px solid ${p.color}` }}
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
                      <span className={`status-badge status-${task.status}`}>
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