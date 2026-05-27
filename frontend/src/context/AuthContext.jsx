import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState('');

  const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

  const applySettingsClasses = (prefs) => {
    if (!prefs) return;
    const classes = [prefs.theme || 'dark'];
    if (prefs.highContrast) classes.push('high-contrast');
    if (prefs.privacyMode) classes.push('privacy-mode');
    if (prefs.reduceMotion) classes.push('reduce-motion');
    document.body.className = classes.join(' ');
    localStorage.setItem('themeClasses', classes.join(' '));
    localStorage.setItem('twentyFourHour', prefs.twentyFourHour ? 'true' : 'false');
    if (prefs.defaultView) localStorage.setItem('defaultView', prefs.defaultView);
  };

  const checkAuth = async (token) => {
    try {
      const response = await fetch(`${API_BASE}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data);
        try {
          const settingsRes = await fetch(`${API_BASE}/settings`, { headers: { 'Authorization': `Bearer ${token}` } });
          if (settingsRes.ok) {
            const settingsData = await settingsRes.json();
            if (settingsData.preferences) {
              applySettingsClasses(settingsData.preferences);
            }
          }
        } catch (e) {}
      } else {
        // Token is invalid/expired
        localStorage.removeItem('token');
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to authenticate token with backend:', err);
      // Keep offline fallback decoded token if server is briefly down
      try {
        const payload = token.split('.')[1];
        const parsed = JSON.parse(atob(payload));
        setUser({
          id: parsed.user_id || parsed.sub,
          username: parsed.username,
          role: parsed.role || 'student',
        });
      } catch (e) {
        localStorage.removeItem('token');
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      checkAuth(token);
    } else {
      setLoading(false);
    }
  }, []);

  const loginUser = async (email, password) => {
    setApiError('');
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        // Try to parse JSON body first (for structured errors like requiresVerification)
        let errMsg = 'Invalid email or password';
        try {
          const errData = await response.json();
          if (errData.error) errMsg = errData.error;
          if (errData.requiresVerification) errMsg += ' requiresVerification';
        } catch {
          errMsg = await response.text() || errMsg;
        }
        throw new Error(errMsg);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      setUser(data.user);
      
      try {
        const settingsRes = await fetch(`${API_BASE}/settings`, { headers: { 'Authorization': `Bearer ${data.token}` } });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.preferences) {
            applySettingsClasses(settingsData.preferences);
          }
        }
      } catch (e) {}

      return data.user;
    } catch (err) {
      setApiError(err.message);
      throw err;
    }
  };

  const registerUser = async (userData) => {
    setApiError('');
    try {
      const response = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      // 201 = success, registration requires email verification
      if (response.status === 201) {
        const data = await response.json();
        return data; // { message, email, requiresVerification: true }
      }

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Registration failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      setApiError(err.message);
      throw err;
    }
  };

  const verifyEmail = async (email, otp) => {
    setApiError('');
    try {
      const response = await fetch(`${API_BASE}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      if (!response.ok) {
        const errMsg = await response.text();
        throw new Error(errMsg || 'Verification failed');
      }

      const data = await response.json();
      // data.token + data.user available once verified
      localStorage.setItem('token', data.token);
      setUser(data.user);

      try {
        const settingsRes = await fetch(`${API_BASE}/settings`, { headers: { 'Authorization': `Bearer ${data.token}` } });
        if (settingsRes.ok) {
          const settingsData = await settingsRes.json();
          if (settingsData.preferences) applySettingsClasses(settingsData.preferences);
        }
      } catch (e) {}

      return data.user;
    } catch (err) {
      setApiError(err.message);
      throw err;
    }
  };

  const resendVerification = async (email) => {
    const response = await fetch(`${API_BASE}/auth/send-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!response.ok) throw new Error('Failed to resend verification email');
    return response.json();
  };

  const logoutUser = () => {
    localStorage.removeItem('token');
    setUser(null);
    window.location.href = '/login';
  };

  const updateUserProfileState = (updatedData) => {
    setUser(prev => ({
      ...prev,
      ...updatedData
    }));
  };

  const value = {
    user,
    login: loginUser,
    register: registerUser,
    verifyEmail,
    resendVerification,
    logout: logoutUser,
    updateUser: updateUserProfileState,
    loading,
    apiError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};