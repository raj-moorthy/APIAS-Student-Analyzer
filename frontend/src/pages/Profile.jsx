import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    major: '',
    semester: 1
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        major: user.major || 'General Study',
        semester: user.semester || 1
      });
      setLoading(false);
    }
  }, [user]);

  if (!user) return null;

  if (loading) {
    return <div className="profile-loading">Loading your student profile...</div>;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: name === 'semester' ? parseInt(value) || 1 : value
    }));
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api'}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          email: profileData.email,
          major: profileData.major,
          semester: profileData.semester
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update student profile in database');
      }

      const updatedUser = await response.json();
      
      // Update global context state so header and sidebar update instantly
      updateUser(updatedUser);
      setSuccess(true);
      
      setTimeout(() => setSuccess(false), 4000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-container">
      <div className="profile-welcome">
        <h1>👤 Student Profile</h1>
        <p className="welcome-subtitle">Manage your personal program details and personal identification details.</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">Profile details updated successfully!</div>}

      <div className="profile-layout-grid">
        {/* Left Side: Update Form */}
        <div className="profile-form-panel glassmorphism">
          <h2>✏️ Edit Personal Details</h2>
          <p className="section-description">Keep your academic registration details accurate for tailored recommendations.</p>

          <form onSubmit={handleSubmit} className="profile-editor-form">
            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name</label>
                <input
                  id="firstName"
                  type="text"
                  name="firstName"
                  value={profileData.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name</label>
                <input
                  id="lastName"
                  type="text"
                  name="lastName"
                  value={profileData.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                value={profileData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label htmlFor="major">Major / Specialized Branch</label>
                <input
                  id="major"
                  type="text"
                  name="major"
                  value={profileData.major}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="semester">Current Academic Semester</label>
                <select
                  id="semester"
                  name="semester"
                  value={profileData.semester}
                  onChange={handleChange}
                  required
                >
                  <option value="1">Semester 1 (Freshman)</option>
                  <option value="2">Semester 2 (Freshman)</option>
                  <option value="3">Semester 3 (Sophomore)</option>
                  <option value="4">Semester 4 (Sophomore)</option>
                  <option value="5">Semester 5 (Junior)</option>
                  <option value="6">Semester 6 (Junior)</option>
                  <option value="7">Semester 7 (Senior)</option>
                  <option value="8">Semester 8 (Senior)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary profile-save-btn" disabled={saving}>
              {saving ? 'Updating Database...' : 'Save Profile Changes'}
            </button>
          </form>
        </div>

        {/* Right Side: Profile Preview Card */}
        <div className="profile-preview-panel glassmorphism">
          <h2>🎓 Student ID Card</h2>
          <div className="id-card-visual">
            <div className="avatar-wrapper">
              <div className="avatar-glow"></div>
              <div className="avatar">
                <span>{profileData.firstName?.charAt(0)}{profileData.lastName?.charAt(0)}</span>
              </div>
            </div>
            <div className="id-card-details">
              <h3>{profileData.firstName} {profileData.lastName}</h3>
              <span className="role-tag">{user.role?.toUpperCase()}</span>
              
              <div className="id-metadata-list">
                <div className="meta-row">
                  <span>Major:</span>
                  <strong>{profileData.major}</strong>
                </div>
                <div className="meta-row">
                  <span>Semester:</span>
                  <strong>{profileData.semester}</strong>
                </div>
                <div className="meta-row">
                  <span>Username:</span>
                  <strong>{user.username}</strong>
                </div>
                <div className="meta-row">
                  <span>System Access:</span>
                  <strong className="active-glow">Online</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;