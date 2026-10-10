import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FavoritesProvider } from './context/FavoritesContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import TemplatesPage from './pages/TemplatesPage';
import FavoritesPage from './pages/FavoritesPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <FavoritesProvider>
          <div className="app-layout">
            <Navbar />
            <main className="main-content">
              <Routes>
                {/* Home redirects to templates */}
                <Route path="/" element={<Navigate to="/templates" replace />} />

                {/* Public catalog route */}
                <Route path="/templates" element={<TemplatesPage />} />

                {/* Protected favorites route */}
                <Route
                  path="/favorites"
                  element={
                    <ProtectedRoute>
                      <FavoritesPage />
                    </ProtectedRoute>
                  }
                />

                {/* Auth routes */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/templates" replace />} />
              </Routes>
            </main>

            <footer style={{
              borderTop: '1px solid var(--border-light)',
              backgroundColor: '#ffffff',
              padding: '1.75rem 1.5rem',
              textAlign: 'center',
              fontSize: '0.8125rem',
              color: 'var(--text-muted)'
            }}>
              <p>
                <strong>Mini SaaS Template Store</strong> — Developed for <strong>Gnxtace Technologies</strong> Full Stack Web Developer Intern Assignment.
              </p>
            </footer>
          </div>
        </FavoritesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
