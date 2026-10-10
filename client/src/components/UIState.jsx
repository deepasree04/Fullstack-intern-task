import React from 'react';
import { AlertCircle, RefreshCw, FolderSearch } from 'lucide-react';

export function LoadingState({ message = 'Loading templates...' }) {
  return (
    <div className="state-container">
      <div className="spinner" />
      <h3 className="state-title">Just a moment</h3>
      <p className="state-desc">{message}</p>
    </div>
  );
}

export function ErrorState({ message = 'An unexpected error occurred.', onRetry }) {
  return (
    <div className="state-container">
      <div className="state-icon-box" style={{ color: 'var(--color-danger)', backgroundColor: 'var(--color-danger-light)' }}>
        <AlertCircle size={28} />
      </div>
      <h3 className="state-title">Something went wrong</h3>
      <p className="state-desc">{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );
}

export function EmptyState({ title = 'No templates found', description = 'Try adjusting your search terms or filters.', action }) {
  return (
    <div className="state-container">
      <div className="state-icon-box">
        <FolderSearch size={28} />
      </div>
      <h3 className="state-title">{title}</h3>
      <p className="state-desc">{description}</p>
      {action}
    </div>
  );
}
