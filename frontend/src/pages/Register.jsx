import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    semester: 1,
    major: 'Computer Science'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [avatar, setAvatar] = useState(null);         // base64 preview
  const [avatarFile, setAvatarFile] = useState(null); // raw file

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setError('Profile picture must be under 2 MB'); return; }
    setAvatarFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'semester' ? parseInt(value) || 1 : value
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const submissionData = {
      username: formData.username || formData.email.split('@')[0],
      email: formData.email,
      password: formData.password,
      firstName: formData.firstName,
      lastName: formData.lastName,
      role: 'student',
      semester: formData.semester,
      major: formData.major,
      avatar: avatar || ''
    };

    try {
      await register(submissionData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Registration failed. Username or Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card register-card glassmorphism">
        <div className="auth-header">
          {/* Avatar Upload */}
          <div className="avatar-upload-circle" onClick={() => document.getElementById('avatarInput').click()} title="Upload profile picture">
            {avatar
              ? <img src={avatar} alt="avatar" className="avatar-preview" />
              : <span className="avatar-placeholder">📷</span>}
            <div className="avatar-upload-overlay">Upload Photo</div>
          </div>
          <input id="avatarInput" type="file" accept="image/*" style={{display:'none'}} onChange={handleAvatarChange} />
          <div className="auth-logo-badge" style={{marginTop:'0.75rem'}}>APAIS</div>
          <h2>Join APAIS</h2>
          <p>Optimize and track your academic path with precision</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form register-form-grid">
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                type="text"
                name="firstName"
                placeholder="John"
                value={formData.firstName}
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
                placeholder="Doe"
                value={formData.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                name="username"
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="john.doe@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="major">Major / Program</label>
              <input
                id="major"
                type="text"
                list="major-options"
                name="major"
                placeholder="Computer Science"
                value={formData.major}
                onChange={handleChange}
                required
              />
              <datalist id="major-options">
                <option value="Computer Science" />
                <option value="Engineering" />
                <option value="Business Administration" />
                <option value="Psychology" />
                <option value="Biology" />
                <option value="Mathematics" />
                <option value="Arts & Humanities" />
                <option value="Other" />
              </datalist>
            </div>
            <div className="form-group">
              <label htmlFor="semester">Current Semester</label>
              <select
                id="semester"
                name="semester"
                value={formData.semester}
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

          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="Min 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                name="confirmPassword"
                placeholder="Repeat password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength="6"
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-loader">Creating Account...</span>
            ) : (
              'Create Free Account'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <span className="link" onClick={() => navigate('/login')}>
              Sign In
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;