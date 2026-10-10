import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useAuth } from './AuthContext';

const FavoritesContext = createContext(null);

export function FavoritesProvider({ children }) {
  const { isAuthenticated, token } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(false);
  const [favoritesError, setFavoritesError] = useState(null);

  // Fetch all favorited templates for the logged-in user
  const fetchFavorites = useCallback(async () => {
    if (!isAuthenticated || !token) {
      setFavorites([]);
      return;
    }

    setIsLoadingFavorites(true);
    setFavoritesError(null);

    try {
      const response = await axiosClient.get('/favorites');
      if (response.data && response.data.success) {
        setFavorites(response.data.data || []);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to load favorites';
      setFavoritesError(msg);
    } finally {
      setIsLoadingFavorites(false);
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Check if a template ID is favorited
  const isFavorited = useCallback(
    (templateId) => {
      return favorites.some((f) => f.id === templateId);
    },
    [favorites]
  );

  // Add a template to favorites
  const addFavorite = async (template) => {
    try {
      const response = await axiosClient.post(`/favorites/${template.id}`);
      if (response.data && response.data.success) {
        // Optimistically or explicitly add to state
        setFavorites((prev) => {
          if (prev.some((f) => f.id === template.id)) return prev;
          return [template, ...prev];
        });
        return { success: true };
      }
      return { success: false, error: response.data?.message || 'Could not favorite template' };
    } catch (err) {
      // 409 means already favorited
      if (err.response?.status === 409) {
        setFavorites((prev) => (prev.some((f) => f.id === template.id) ? prev : [template, ...prev]));
        return { success: true, message: 'Already in favorites' };
      }
      const msg = err.response?.data?.message || err.message || 'Failed to add favorite';
      return { success: false, error: msg };
    }
  };

  // Remove a template from favorites
  const removeFavorite = async (templateId) => {
    try {
      const response = await axiosClient.delete(`/favorites/${templateId}`);
      if (response.data && response.data.success) {
        setFavorites((prev) => prev.filter((f) => f.id !== templateId));
        return { success: true };
      }
      return { success: false, error: response.data?.message || 'Could not remove favorite' };
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to remove favorite';
      return { success: false, error: msg };
    }
  };

  // Toggle favorite helper
  const toggleFavorite = async (template) => {
    if (isFavorited(template.id)) {
      return await removeFavorite(template.id);
    } else {
      return await addFavorite(template);
    }
  };

  const value = {
    favorites,
    favoritesCount: favorites.length,
    isLoadingFavorites,
    favoritesError,
    fetchFavorites,
    isFavorited,
    addFavorite,
    removeFavorite,
    toggleFavorite
  };

  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
