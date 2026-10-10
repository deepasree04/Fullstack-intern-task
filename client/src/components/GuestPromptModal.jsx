import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, X, LogIn } from 'lucide-react';

export default function GuestPromptModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="toast-guest-modal">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger)' }}>
          <Heart size={18} fill="var(--color-danger)" />
          <strong style={{ color: 'var(--text-main)', fontSize: '0.9375rem' }}>Authentication Required</strong>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-dim)', cursor: 'pointer', padding: '0.2rem' }}
          title="Dismiss"
        >
          <X size={16} />
        </button>
      </div>
      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem', lineHeight: '1.4' }}>
        Sign in to save this SaaS template to your personal favorites collection.
      </p>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Link to="/login" className="btn btn-primary btn-sm btn-block" onClick={onClose}>
          <LogIn size={14} />
          <span>Sign In</span>
        </Link>
        <button onClick={onClose} className="btn btn-secondary btn-sm">
          Cancel
        </button>
      </div>
    </div>
  );
}
