import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// ─── Forgot Password Modal ─────────────────────────────────────────────────
const ForgotPasswordModal = ({ onClose }) => {
  const [step, setStep] = useState('email'); // 'email' | 'otp' | 'done'
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handleSendCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      setInfo(data.message || 'Reset code sent! Check your inbox.');
      setStep('otp');
    } catch {
      setError('Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || 'Failed to reset password');
      }
      setStep('done');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card glassmorphism" onClick={e => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose} title="Close">✕</button>

        {step === 'email' && (
          <>
            <div className="modal-header">
              <span className="modal-icon">🔐</span>
              <h2>Forgot Password</h2>
              <p>Enter your registered email and we'll send you a 6-digit verification code.</p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleSendCode} className="auth-form">
              <div className="form-group">
                <label htmlFor="fp-email">Email Address</label>
                <div className="input-wrapper">
                  <span className="input-icon">📧</span>
                  <input
                    id="fp-email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="you@university.edu"
                    required
                    autoFocus
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? 'Sending Code…' : '📤 Send Reset Code'}
              </button>
            </form>
          </>
        )}

        {step === 'otp' && (
          <>
            <div className="modal-header">
              <span className="modal-icon">🔑</span>
              <h2>Enter Verification Code</h2>
              <p>{info || `A 6-digit code was sent to ${email}`}</p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleResetPassword} className="auth-form">
              <div className="form-group">
                <label htmlFor="fp-otp">6-Digit Code</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔢</span>
                  <input
                    id="fp-otp"
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    autoFocus
                    style={{ letterSpacing: '0.4em', fontSize: '1.3rem', textAlign: 'center' }}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="fp-newpw">New Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="fp-newpw"
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="fp-confirmpw">Confirm Password</label>
                <div className="input-wrapper">
                  <span className="input-icon">🔒</span>
                  <input
                    id="fp-confirmpw"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
              <button type="submit" className="btn-primary auth-btn" disabled={loading}>
                {loading ? 'Resetting…' : '✅ Reset Password'}
              </button>
              <button
                type="button"
                className="btn-secondary auth-btn"
                style={{ marginTop: '8px' }}
                onClick={() => { setStep('email'); setError(''); }}
              >
                ← Back
              </button>
            </form>
          </>
        )}

        {step === 'done' && (
          <div className="modal-header" style={{ textAlign: 'center', padding: '24px 0' }}>
            <span className="modal-icon" style={{ fontSize: '3rem' }}>🎉</span>
            <h2>Password Reset!</h2>
            <p>Your password has been updated successfully. You can now log in with your new password.</p>
            <button className="btn-primary auth-btn" style={{ marginTop: '20px' }} onClick={onClose}>
              Go to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Login Page ────────────────────────────────────────────────────────────
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(formData.email, formData.password);
      const defaultView = localStorage.getItem('defaultView') || 'dashboard';
      navigate(`/${defaultView}`);
    } catch (err) {
      // Check if the error is about unverified email (403 response)
      const msg = err.message || '';
      if (msg.includes('not verified') || msg.includes('requiresVerification')) {
        // Redirect back to register page which will show the verify screen
        navigate('/register', { state: { verifyEmail: formData.email } });
        return;
      }
      setError(msg || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="auth-page">
      {showForgot && <ForgotPasswordModal onClose={() => setShowForgot(false)} />}

      <div className="auth-card glassmorphism">
        <div className="auth-header">
          <div className="auth-logo-badge">APAIS</div>
          <h2>Welcome Back</h2>
          <p>Please log in to continue managing your studies</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="you@university.edu"
                value={formData.email}
                onChange={handleChange}
                required
                autoFocus
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="password">
              Password
              <span
                className="forgot-password-link"
                onClick={() => setShowForgot(true)}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && setShowForgot(true)}
              >
                Forgot Password?
              </span>
            </label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                id="password"
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary auth-btn" disabled={loading}>
            {loading ? (
              <span className="spinner-loader">Signing in...</span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            New to APAIS?{' '}
            <span className="link" onClick={() => navigate('/register')}>
              Create an account
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;