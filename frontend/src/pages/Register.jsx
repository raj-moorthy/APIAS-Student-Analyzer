import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ── Registration form state ──
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
  const [avatar, setAvatar] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);

  // ── Pre-registration Inline OTP State ──
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  // Handle incoming redirect state (e.g. from unverified login redirect)
  useEffect(() => {
    if (location.state?.verifyEmail) {
      setFormData(prev => ({ ...prev, email: location.state.verifyEmail }));
    }
  }, [location.state]);

  // Email validation regex
  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email);

  // Checks if all fields are filled & email is verified & passwords match
  const isFormValid =
    formData.firstName.trim() !== '' &&
    formData.lastName.trim() !== '' &&
    formData.username.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.major.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    formData.password === formData.confirmPassword &&
    formData.password.length >= 6 &&
    isEmailVerified;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setError('Profile picture must be under 2 MB');
      return;
    }
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

  // ── Send 4-Digit Inline OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!isEmailValid) return;
    setSendingOtp(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/send-inline-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to send verification code.');
      }
      setOtpSent(true);
      setOtpSuccess('📩 Code sent! Please check your email.');
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setSendingOtp(false);
    }
  };

  // ── Verify 4-Digit Inline OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 4) {
      setOtpError('Please enter the 4-digit code.');
      return;
    }
    setVerifyingOtp(true);
    setOtpError('');
    setOtpSuccess('');
    try {
      const res = await fetch(`${API_BASE}/auth/verify-inline-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, otp: otpCode }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Invalid or expired verification code.');
      }
      setIsEmailVerified(true);
      setOtpSuccess('✔️ Email verified successfully!');
      setOtpSent(false);
    } catch (err) {
      setOtpError(err.message);
    } finally {
      setVerifyingOtp(false);
    }
  };

  // ── Submit Complete Form ──
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isFormValid) return;
    setLoading(true);
    setError('');

    const submissionData = {
      username: formData.username,
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
          <input id="avatarInput" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <div className="auth-logo-badge" style={{ marginTop: '0.75rem' }}>APAIS</div>
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

            <div className="form-group" style={{ position: 'relative' }}>
              <label htmlFor="email">
                Email Address
                {isEmailVerified && (
                  <span style={{ color: '#10b981', marginLeft: '8px', fontWeight: 'bold' }}>
                    ✔️ Verified
                  </span>
                )}
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="john.doe@university.edu"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                  required
                  style={{ flex: 1 }}
                />
              </div>

              {/* Inline OTP Code Action */}
              {!isEmailVerified && (
                <div style={{ marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={!isEmailValid || sendingOtp}
                    style={{
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      borderRadius: '6px',
                      border: 'none',
                      cursor: isEmailValid ? 'pointer' : 'not-allowed',
                      transition: 'all 0.2s ease',
                      fontWeight: 'bold',
                      background: isEmailValid
                        ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)'
                        : 'rgba(255, 255, 255, 0.08)',
                      color: isEmailValid ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                      boxShadow: isEmailValid ? '0 2px 8px rgba(67, 97, 238, 0.2)' : 'none',
                    }}
                  >
                    {sendingOtp ? '⏳ Sending…' : otpSent ? '🔄 Resend Code' : '🔑 Send Code'}
                  </button>
                </div>
              )}

              {/* OTP Space */}
              {otpSent && !isEmailVerified && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px'
                }}>
                  <label htmlFor="otpCode" style={{ fontSize: '0.8rem', display: 'block', marginBottom: '6px' }}>
                    Enter 4-digit code
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      id="otpCode"
                      type="text"
                      maxLength={4}
                      placeholder="XXXX"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      style={{
                        width: '90px',
                        textAlign: 'center',
                        fontSize: '1rem',
                        fontWeight: 'bold',
                        letterSpacing: '3px',
                        padding: '6px',
                        minHeight: '38px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'var(--bg-primary)',
                        color: 'var(--text-main)',
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleVerifyOtp}
                      disabled={otpCode.length !== 4 || verifyingOtp}
                      style={{
                        padding: '6px 16px',
                        fontSize: '0.85rem',
                        borderRadius: '6px',
                        border: 'none',
                        fontWeight: 'bold',
                        cursor: otpCode.length === 4 ? 'pointer' : 'not-allowed',
                        background: otpCode.length === 4 ? '#10b981' : 'rgba(255, 255, 255, 0.08)',
                        color: otpCode.length === 4 ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {verifyingOtp ? 'Verifying…' : '✔️ Verify'}
                    </button>
                  </div>
                </div>
              )}

              {otpError && <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '6px' }}>⚠️ {otpError}</div>}
              {otpSuccess && <div style={{ color: '#10b981', fontSize: '0.8rem', marginTop: '6px' }}>{otpSuccess}</div>}
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

          <button
            type="submit"
            className="btn-primary auth-btn"
            disabled={!isFormValid || loading}
            style={{
              cursor: isFormValid ? 'pointer' : 'not-allowed',
              opacity: isFormValid ? 1 : 0.5,
              background: isFormValid
                ? 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)'
                : 'rgba(255, 255, 255, 0.08)',
              color: isFormValid ? '#ffffff' : 'rgba(255, 255, 255, 0.35)',
              transition: 'all 0.3s ease',
            }}
          >
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