import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Logs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [newLog, setNewLog] = useState({
    title: '',
    description: '',
    duration: '',
    date: ''
  });

  if (!user) {
    return <div>Loading...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewLog(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, this would make an API call to the backend
    setLogs([...logs, {
      id: Date.now().toString(),
      title: newLog.title,
      description: newLog.description,
      duration: parseInt(newLog.duration),
      date: newLog.date,
      createdAt: new Date().toISOString()
    }]);
    // Reset form
    setNewLog({
      title: '',
      description: '',
      duration: '',
      date: ''
    });
  };

  return (
    <div className="logs">
      <h1>Study Logs</h1>

      <div className="logs-header">
        <h2>Add Study Log</h2>
        <form onSubmit={handleSubmit} className="log-form">
          <div className="form-group">
            <label>Log Title</label>
            <input
              type="text"
              name="title"
              value={newLog.title}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={newLog.description}
              onChange={handleChange}
              rows="4"
            />
          </div>
          <div className="form-group">
            <label>Duration (minutes)</label>
            <input
              type="number"
              name="duration"
              value={newLog.duration}
              onChange={handleChange}
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={newLog.date}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn-primary">Add Log</button>
        </form>
      </div>

      <div className="logs-list">
        <h2>Your Logs ({logs.length})</h2>
        {logs.length > 0 ? (
          <ul>
            {logs.map(log => (
              <li key={log.id} className="log-item">
                <div className="log-info">
                  <h3>{log.title}</h3>
                  <p>{log.description}</p>
                  <p><strong>Duration:</strong> {log.duration} minutes</p>
                  <p><strong>Date:</strong> {new Date(log.date).toLocaleDateString()}</p>
                </div>
                <div className="log-actions">
                  <button className="btn-sm">Edit</button>
                  <button className="btn-sm btn-danger">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No logs yet. Add your first study log above!</p>
        )}
      </div>
    </div>
  );
};

export default Logs;