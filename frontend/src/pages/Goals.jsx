import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Goals = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState([]);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    targetDate: '',
    category: 'Academic'
  });

  if (!user) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setGoals([...goals, {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description,
      targetDate: newGoal.targetDate,
      category: newGoal.category,
      progress: Math.floor(Math.random() * 50), // Mock progress for visual
      createdAt: new Date().toISOString()
    }]);
    setNewGoal({ title: '', description: '', targetDate: '', category: 'Academic' });
  };

  const handleDelete = (id) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const handleComplete = (id) => {
    setGoals(goals.map(g => g.id === id ? { ...g, progress: 100 } : g));
  };

  const stats = {
    total: goals.length,
    completed: goals.filter(g => g.progress === 100).length
  };

  return (
    <div className="goals-container fade-in">
      <div className="page-header-row">
        <div className="header-text-block">
          <h1>🎯 Goal Optimization</h1>
          <p>Set long-term objectives and track your strategic academic progress over time.</p>
        </div>
      </div>

      <div className="kpi-row">
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--primary">🎯</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.total}</div>
            <div className="kpi-label">Active Goals</div>
          </div>
        </div>
        <div className="kpi-card glassmorphism">
          <div className="kpi-icon kpi-icon--success">🏆</div>
          <div className="kpi-body">
            <div className="kpi-value">{stats.completed}</div>
            <div className="kpi-label">Goals Completed</div>
          </div>
        </div>
      </div>

      <div className="content-split-layout">
        
        {/* Left Side: Goal Entry Form */}
        <div className="form-panel-side">
          <div className="glass-panel">
            <h2>✨ Define New Goal</h2>
            <p className="panel-subtitle">Create a measurable objective to stay focused.</p>
            
            <form onSubmit={handleSubmit} className="premium-form">
              <div className="form-group">
                <label>Goal Title</label>
                <input
                  type="text" name="title"
                  value={newGoal.title} onChange={handleChange}
                  required placeholder="e.g. Achieve 3.8 GPA this semester"
                />
              </div>
              
              <div className="form-group">
                <label>Description & Strategy</label>
                <textarea
                  name="description" rows="3"
                  value={newGoal.description} onChange={handleChange}
                  placeholder="Detail your execution plan here..."
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label>Target Date</label>
                  <input
                    type="date" name="targetDate"
                    value={newGoal.targetDate} onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select name="category" value={newGoal.category} onChange={handleChange}>
                    <option value="Academic">Academic</option>
                    <option value="Skill Development">Skill Development</option>
                    <option value="Career">Career & Internships</option>
                    <option value="Personal">Personal Growth</option>
                  </select>
                </div>
              </div>

              <button type="submit" className="btn-primary submit-btn-full">
                Launch Goal 🚀
              </button>
            </form>
          </div>
        </div>

        {/* Right Side: Goals Board */}
        <div className="display-panel-side">
          <div className="board-header">
            <h2>Your Active Objectives</h2>
          </div>
          
          {goals.length > 0 ? (
            <div className="cards-grid">
              {goals.map((goal, idx) => {
                const isNear = new Date(goal.targetDate) < new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
                return (
                  <div className="premium-card goal-card" key={goal.id} style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className="card-header">
                      <span className="category-tag">{goal.category}</span>
                      <button className="delete-icon-btn" onClick={() => handleDelete(goal.id)} title="Remove">✕</button>
                    </div>
                    
                    <h3 className="card-title">{goal.title}</h3>
                    <p className="card-desc">{goal.description || 'No description provided.'}</p>
                    
                    <div className="card-progress-section">
                      <div className="progress-labels">
                        <span>Progress</span>
                        <span>{goal.progress}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${goal.progress}%`, background: goal.progress > 70 ? 'var(--success)' : 'var(--primary-color)' }}></div>
                      </div>
                    </div>

                    <div className="card-footer">
                      <div className={`date-badge ${isNear ? 'urgent' : ''}`}>
                        📅 {new Date(goal.targetDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                      {goal.progress < 100 ? (
                        <button className="btn-secondary btn-sm" onClick={() => handleComplete(goal.id)}>Complete</button>
                      ) : (
                        <span className="status-badge status-completed">DONE</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="empty-state-panel glassmorphism">
              <span className="empty-icon">🏔️</span>
              <h3>No mountains to climb yet</h3>
              <p>Set your first strategic goal on the left to begin tracking your journey.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Goals;