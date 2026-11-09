import React, { useState } from 'react';
import { Sprout, Eye, EyeOff, ArrowLeft } from 'lucide-react';

export default function AuthPage({ initialMode = 'login', onAuthSuccess, onNavigate }) {
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    // Client-side validations
    if (isRegister) {
      if (!fullName.trim() || fullName.trim().length < 2) {
        setErrorMsg('Please enter your full name (at least 2 characters).');
        return;
      }
      if (password.length < 8) {
        setErrorMsg('Password must be at least 8 characters long.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
    }

    setLoading(true);
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { fullName, email, password, confirmPassword, organization: 'Farm Workspace' }
      : { email, password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication request failed.');
      }

      // Save token and user info
      localStorage.setItem('crop_health_token', data.token);
      localStorage.setItem('crop_health_user', JSON.stringify(data.user));
      onAuthSuccess(data);
    } catch (err) {
      setErrorMsg(err.message || 'Server error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-overlay" />

      <button
        onClick={() => onNavigate('home')}
        style={{
          position: 'absolute',
          top: '2rem',
          left: '2rem',
          zIndex: 20,
          color: 'var(--primary-dark)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.92rem',
          fontWeight: 600,
          background: '#ffffff',
          padding: '0.6rem 1.2rem',
          borderRadius: 'var(--radius-full)',
          border: '1.5px solid var(--border-light)',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        <ArrowLeft size={16} /> Back to Home
      </button>

      <div className="auth-card">
        <div className="auth-header">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.8rem' }}>
            <img
              src="/logo.png"
              alt="AgroVita AI"
              style={{ width: '64px', height: '64px', objectFit: 'contain' }}
            />
          </div>
          <h2>{isRegister ? 'Create Farm Account' : 'Welcome to AgroVita AI'}</h2>
          <p>{isRegister ? 'Sign up to check and track your crops' : 'Sign in to access your crop health records'}</p>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.8rem 1rem',
              background: '#fef2f2',
              border: '1.5px solid #fecaca',
              borderRadius: 'var(--radius-sm)',
              color: '#dc2626',
              fontSize: '0.88rem',
              marginBottom: '1.2rem',
              fontWeight: 500
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {isRegister && (
            <div className="form-group">
              <label className="form-label">
                Full Name <span className="required-star">*</span>
              </label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="e.g. Ramesh Patel"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              type="email"
              required
              className="form-input"
              placeholder="e.g. farmer@agrovita.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              Password <span className="required-star">*</span>
            </label>
            <div className="password-input-wrap">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                className="form-input"
                placeholder="Enter your password (min 8 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {isRegister && (
            <div className="form-group">
              <label className="form-label">
                Confirm Password <span className="required-star">*</span>
              </label>
              <div className="password-input-wrap">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  className="form-input"
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  title={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', padding: '12px', fontSize: '1rem', marginTop: '0.6rem' }}
          >
            {loading ? 'Please wait...' : isRegister ? 'Create Account' : 'Sign In to Workspace'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', paddingTop: '1.2rem', borderTop: '1px solid var(--border-light)' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            {isRegister ? 'Already have an account?' : 'New to AgroVita AI?'}{' '}
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMsg('');
              }}
              style={{ color: 'var(--primary)', fontWeight: 700 }}
            >
              {isRegister ? 'Sign In' : 'Create an Account'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
