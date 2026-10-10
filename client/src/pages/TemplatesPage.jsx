import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import TemplateCard from '../components/TemplateCard';
import TemplateModal from '../components/TemplateModal';
import GuestPromptModal from '../components/GuestPromptModal';
import { LoadingState, ErrorState, EmptyState } from '../components/UIState';

const CATEGORIES = [
  'All',
  'Analytics',
  'Artificial Intelligence',
  'CRM & Sales',
  'Productivity',
  'E-Commerce',
  'DevOps & Cloud'
];

export default function TemplatesPage() {
  const [templates, setTemplates] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  // Modal preview state
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Guest prompt modal state
  const [showGuestPrompt, setShowGuestPrompt] = useState(false);

  // Debounce search input by 300ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch templates from backend API
  const fetchTemplates = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const params = {};
      if (selectedCategory && selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      if (debouncedSearch && debouncedSearch.trim()) {
        params.search = debouncedSearch.trim();
      }

      const response = await axiosClient.get('/templates', { params });
      if (response.data && response.data.success) {
        setTemplates(response.data.data || []);
      } else {
        setTemplates([]);
      }
    } catch (err) {
      const message =
        err.response?.data?.message || err.message || 'Unable to load SaaS templates. Please try again.';
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, debouncedSearch]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const handleClearFilters = () => {
    setSelectedCategory('All');
    setSearchQuery('');
    setDebouncedSearch('');
  };

  return (
    <div>
      {/* Page Hero Header */}
      <section className="page-hero">
        <h1 className="page-hero-title">Browse SaaS Templates</h1>
        <p className="page-hero-desc">
          Explore curated production-ready architectures and dashboard layouts built for modern founders and engineers.
        </p>
      </section>

      {/* Search & Filter Toolbar */}
      <section className="filter-section">
        {/* Search Bar */}
        <div className="search-box-container">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="Search templates by title or keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '0.875rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-dim)',
                cursor: 'pointer',
                padding: '0.2rem'
              }}
              title="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="category-pills-row" role="tablist">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`category-pill ${selectedCategory === category ? 'active' : ''}`}
              role="tab"
              aria-selected={selectedCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      {/* Main Content Area */}
      {isLoading ? (
        <LoadingState message="Fetching available SaaS templates..." />
      ) : errorMessage ? (
        <ErrorState message={errorMessage} onRetry={fetchTemplates} />
      ) : templates.length === 0 ? (
        <EmptyState
          title="No matching templates found"
          description={`No templates matched your filter "${selectedCategory}" with keyword "${debouncedSearch}".`}
          action={
            <button onClick={handleClearFilters} className="btn btn-secondary btn-sm">
              Clear All Filters
            </button>
          }
        />
      ) : (
        <div className="template-grid">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onSelect={(tpl) => setSelectedTemplate(tpl)}
              onGuestFavoriteAttempt={() => setShowGuestPrompt(true)}
            />
          ))}
        </div>
      )}

      {/* Template Detail Preview Modal */}
      {selectedTemplate && (
        <TemplateModal
          template={selectedTemplate}
          onClose={() => setSelectedTemplate(null)}
          onGuestFavoriteAttempt={() => {
            setSelectedTemplate(null);
            setShowGuestPrompt(true);
          }}
        />
      )}

      {/* Guest Sign-In Prompt Modal */}
      <GuestPromptModal
        isOpen={showGuestPrompt}
        onClose={() => setShowGuestPrompt(false)}
      />
    </div>
  );
}
