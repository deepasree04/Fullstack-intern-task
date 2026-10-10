import React, { useEffect } from 'react';
import { X, Heart, Tag, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export default function TemplateModal({ template, onClose, onGuestFavoriteAttempt }) {
  const { isAuthenticated } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!template) return null;

  const favorited = isFavorited(template.id);

  const handleFavoriteClick = async () => {
    if (!isAuthenticated) {
      if (onGuestFavoriteAttempt) onGuestFavoriteAttempt();
      return;
    }
    await toggleFavorite(template);
  };

  const formattedDate = template.created_at
    ? new Date(template.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Close Button */}
        <button onClick={onClose} className="modal-close-btn" aria-label="Close modal">
          <X size={18} />
        </button>

        {/* Header Preview Image */}
        <img
          src={template.thumbnail_url}
          alt={template.name}
          className="modal-header-image"
          onError={(e) => {
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
          }}
        />

        {/* Modal Details Body */}
        <div className="modal-body">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span className="category-tag">
              <Tag size={12} style={{ display: 'inline', marginRight: '4px' }} />
              {template.category}
            </span>

            {formattedDate && (
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} />
                Added {formattedDate}
              </span>
            )}
          </div>

          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '0.75rem' }}>
            {template.name}
          </h2>

          <p style={{ fontSize: '0.9375rem', color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '2rem' }}>
            {template.description}
          </p>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', borderTop: '1px solid var(--border-light)', paddingTop: '1.25rem' }}>
            <button
              onClick={handleFavoriteClick}
              className={`btn ${favorited ? 'btn-danger-outline' : 'btn-secondary'} btn-sm`}
            >
              <Heart
                size={16}
                fill={favorited ? 'var(--color-danger)' : 'none'}
                stroke={favorited ? 'var(--color-danger)' : 'currentColor'}
              />
              <span>{favorited ? 'Remove Favorite' : 'Save to Favorites'}</span>
            </button>

            <button onClick={onClose} className="btn btn-primary btn-sm">
              Close Preview
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
