import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!name.trim() || name.trim().length < 2) {
      newErrors.name = 'Full name must be at least 2 characters.';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email.trim())) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password || password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setIsSubmitting(true);
    const result = await register(name, email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/templates');
    } else {
      setServerError(result.error);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-header">
        <div className="auth-icon-badge">
          <UserPlus size={24} />
        </div>
        <h1 className="auth-title">Create an Account</h1>
        <p className="auth-subtitle">Join Mini SaaS Template Store to manage your favorite templates</p>
      </div>

      {serverError && (
        <div className="alert-banner alert-error">
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="auth-form" noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="name">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            className={`form-input ${errors.name ? 'input-error' : ''}`}
            placeholder="e.g. Alex Morgan"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
            }}
            disabled={isSubmitting}
            autoFocus
          />
          {errors.name && <span className="form-error-text">{errors.name}</span>}
        </div>

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
          />
          {errors.email && <span className="form-error-text">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="password">
            Password (min. 6 characters)
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
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-footer">
        Already have an account?{' '}
        <Link to="/login" className="auth-link">
          Sign In
        </Link>
      </div>
    </div>
  );
}
