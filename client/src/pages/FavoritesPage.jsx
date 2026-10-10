import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { useFavorites } from '../context/FavoritesContext';
import TemplateCard from '../components/TemplateCard';
import TemplateModal from '../components/TemplateModal';
import { LoadingState, ErrorState, EmptyState } from '../components/UIState';

export default function FavoritesPage() {
  const { favorites, isLoadingFavorites, favoritesError, fetchFavorites } = useFavorites();
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div>
      {/* Header */}
      <section className="page-hero">
        <h1 className="page-hero-title">My Favorite Templates</h1>
        <p className="page-hero-desc">
          Manage your saved SaaS designs, UI kits, and application frameworks.
        </p>
      </section>

      {/* Content */}
      {isLoadingFavorites ? (
        <LoadingState message="Loading your favorited templates..." />
      ) : favoritesError ? (
        <ErrorState message={favoritesError} onRetry={fetchFavorites} />
      ) : favorites.length === 0 ? (
        <EmptyState
          title="Your favorites list is empty"
          description="Explore our collection of production-ready SaaS templates and click the heart icon to save them here."
          action={
            <Link to="/templates" className="btn btn-primary btn-sm">
              <Compass size={16} />
              <span>Browse All Templates</span>
            </Link>
          }
        />
      ) : (
        <div className="template-grid">
          {favorites.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={(tpl) => setSelectedTemplate(tpl)}
            />
          ))}
        </div>
      )}

      {/* Modal Preview */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
        />
      )}
    </div>
  );
}
