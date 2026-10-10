import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogIn, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/templates';

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email address is required.';
    }
    if (!password) {
      newErrors.password = 'Password is required.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await login(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <div className="auth-icon-badge">
          <LogIn size={24} />
        </div>
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account to view and manage favorites</p>
      </div>

      {serverError && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="email">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            className={`form-input ${errors.email ? 'input-error' : ''}`}
            placeholder="alex@company.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
            }}
            disabled={isSubmitting}
            autoFocus
          />
          {errors.email && <span className="form-error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            type="password"
            className={`form-input ${errors.password ? 'input-error' : ''}`}
            placeholder="••••••••"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
            }}
            disabled={isSubmitting}
          />
          {errors.password && <span className="form-error-text">{errors.password}</span>}
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-footer">
        Don't have an account?{' '}
        <Link to="/register" className="auth-link">
          Create one now
        </Link>
      </div>
    </div>
  );
}
