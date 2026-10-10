import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="state-container" style={{ minHeight: '50vh', border: 'none' }}>
        <div className="spinner" />
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9375rem' }}>
          Verifying authorization...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login page and remember previous path for redirect after login
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
}
