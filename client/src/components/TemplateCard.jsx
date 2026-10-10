import React from 'react';
import { Heart, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export default function TemplateCard({ template, onSelect, onGuestFavoriteAttempt }) {
  const { isAuthenticated } = useAuth();
  const { isFavorited, toggleFavorite } = useFavorites();

  const favorited = isFavorited(template.id);

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      if (onGuestFavoriteAttempt) {
        onGuestFavoriteAttempt();
      }
      return;
    }
    await toggleFavorite(template);
  };

  return (
    <article className="template-card">
      {/* Thumbnail Banner with Favorite Button Overlay */}
      <div className="card-image-wrapper">
        <img
          src={template.thumbnail_url}
          alt={template.name}
          className="card-thumbnail"
          loading="lazy"
          onError={(e) => {
            // Graceful fallback image if URL fails
            e.currentTarget.src =
              'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80';
          }}
        />
        <button
          onClick={handleFavoriteClick}
          className={`favorite-btn-overlay ${favorited ? 'is-favorited' : ''}`}
          title={
            !isAuthenticated
              ? 'Sign in to favorite'
              : favorited
              ? 'Remove from favorites'
              : 'Add to favorites'
          }
          aria-label={favorited ? 'Unfavorite template' : 'Favorite template'}
        >
          <Heart
            size={18}
            fill={favorited ? 'var(--color-danger)' : 'none'}
            stroke={favorited ? 'var(--color-danger)' : 'currentColor'}
            strokeWidth={favorited ? 1 : 2}
          />
        </button>
      </div>

      {/* Card Content Body */}
      <div className="card-body">
        <div className="card-meta-row">
          <span className="category-tag">{template.category}</span>
        </div>

        <h3 className="card-title">{template.name}</h3>
        <p className="card-desc">{template.description}</p>

        <div className="card-footer">
          <button
            onClick={() => onSelect(template)}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%' }}
          >
            <ExternalLink size={14} />
            <span>View Details</span>
          </button>
        </div>
      </div>
    </article>
  );
}
