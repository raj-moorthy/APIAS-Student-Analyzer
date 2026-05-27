import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const { register, verifyEmail, resendVerification } = useAuth();
  const navigate = useNavigate();

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

  // ── Verification screen state ──
  const [verifyStep, setVerifyStep] = useState(false);
  const [verifyEmail_addr, setVerifyEmail_addr] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifySuccess, setVerifySuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  // ── Resend cooldown timer ──
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

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
      const result = await register(submissionData);
      if (result?.requiresVerification) {
        setVerifyEmail_addr(result.email);
        setVerifyStep(true);
        setResendCooldown(60);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Username or Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP digit input handlers ──
  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    setVerifyError('');
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      e.preventDefault();
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) { setVerifyError('Please enter the 6-digit code.'); return; }
    setVerifyLoading(true);
    setVerifyError('');
    try {
      await verifyEmail(verifyEmail_addr, code);
      setVerifySuccess('✅ Email verified! Taking you to your dashboard…');
      setTimeout(() => navigate('/dashboard'), 1500);
    } catch (err) {
      setVerifyError(err.message || 'Invalid or expired verification code.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await resendVerification(verifyEmail_addr);
      setVerifySuccess('Verification code resent! Check your inbox.');
      setResendCooldown(60);
      setTimeout(() => setVerifySuccess(''), 4000);
    } catch (err) {
      setVerifyError('Failed to resend. Please try again.');
    }
  };



  return (
    <div className="auth-page">

      {/* ── EMAIL VERIFICATION SCREEN ── */}
      {verifyStep && (
        <div className="auth-card glassmorphism" style={{ maxWidth: '460px', textAlign: 'center' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #4361ee, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '2rem', margin: '0 auto 1.25rem'
            }}>✉️</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Verify your email</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
              We sent a 6-digit code to<br />
              <strong style={{ color: 'var(--text-main)' }}>{verifyEmail_addr}</strong>
            </p>
          </div>

          {verifyError && <div className="alert alert-error" style={{ textAlign: 'left', marginBottom: '1rem' }}>{verifyError}</div>}
          {verifySuccess && <div className="alert alert-success" style={{ textAlign: 'left', marginBottom: '1rem' }}>{verifySuccess}</div>}

          <form onSubmit={handleVerify}>
            {/* OTP digit boxes */}
            <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', margin: '1.5rem 0' }}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-${i}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  onPaste={handleOtpPaste}
                  style={{
                    width: '48px', height: '56px', textAlign: 'center',
                    fontSize: '1.5rem', fontWeight: 800,
                    borderRadius: '12px', border: `2px solid ${digit ? 'var(--primary-color)' : 'var(--border-color)'}`,
                    background: 'var(--bg-primary)', color: 'var(--text-main)',
                    transition: 'border-color 0.15s',
                    outline: 'none',
                  }}
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={verifyLoading}
              style={{ width: '100%', padding: '0.9rem', fontSize: '1rem', borderRadius: '10px' }}
            >
              {verifyLoading ? '⏳ Verifying…' : '✅ Verify & Continue'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Didn't get the code?{' '}
            {resendCooldown > 0 ? (
              <span style={{ color: 'var(--text-light)' }}>Resend in {resendCooldown}s</span>
            ) : (
              <button
                onClick={handleResend}
                style={{ background: 'none', border: 'none', color: 'var(--primary-color)',
                         cursor: 'pointer', fontWeight: 700, fontSize: '0.88rem', padding: 0 }}
              >
                Resend code
              </button>
            )}
          </div>
          <p style={{ marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Check spam/junk if you don't see it in your inbox.
          </p>
        </div>
      )}

      {/* ── REGISTRATION FORM ── */}
      {!verifyStep && (
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
      )}  {/* end !verifyStep */}
    </div>
  );

};

export default Register;