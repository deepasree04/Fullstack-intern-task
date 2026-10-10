import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Layers, Heart, LogIn, LogOut, UserPlus, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../context/FavoritesContext';

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { favoritesCount } = useFavorites();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/templates');
  };

  return (
    <header className="navbar">
      <div className="nav-container">
        {/* Brand Logo */}
        <Link to="/templates" className="nav-brand">
          <div className="brand-icon-box">
            <Layers size={18} strokeWidth={2.5} />
          </div>
          <span>SaaS Vault</span>
          <span className="brand-badge">Gnxtace</span>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <NavLink
            to="/templates"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <Layers size={16} />
            <span>Templates</span>
          </NavLink>

          {isAuthenticated && (
            <NavLink
              to="/favorites"
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Heart size={16} />
              <span>My Favorites</span>
              {favoritesCount > 0 && (
                <span className="nav-badge-pill">{favoritesCount}</span>
              )}
            </NavLink>
          )}
        </nav>

        {/* Auth Actions */}
        <div className="nav-auth-actions">
          {isAuthenticated ? (
            <>
              <div className="nav-user-greeting">
                <div className="user-avatar-circle" title={user?.email}>
                  {user?.name ? user.name.charAt(0).toUpperCase() : <User size={14} />}
                </div>
                <span style={{ fontWeight: 500 }}>{user?.name?.split(' ')[0] || 'User'}</span>
              </div>
              <button
                onClick={handleLogout}
                className="btn btn-outline-nav btn-sm"
                title="Log out of your account"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline-nav btn-sm">
                <LogIn size={14} />
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={14} />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
