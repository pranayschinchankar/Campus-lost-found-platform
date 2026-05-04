import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🔍</span>
          <span className="brand-text">CampusFind</span>
        </Link>

        <div className={`navbar-links ${menuOpen ? 'open' : ''}`}>
          <Link to="/browse" className={`nav-link ${isActive('/browse') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Browse Items</Link>

          {user && (
            <>
              <Link to="/post-item" className={`nav-link ${isActive('/post-item') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Post Item</Link>
              <Link to="/dashboard" className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              {isAdmin && (
                <Link to="/admin" className={`nav-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
            </>
          )}
        </div>

        <div className="navbar-actions">
          {user ? (
            <div className="user-menu">
              <div className="user-avatar" onClick={() => setMenuOpen(!menuOpen)}>
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <div className="user-dropdown">
                <div className="user-info">
                  <strong>{user.name}</strong>
                  <span>{user.email}</span>
                </div>
                <Link to="/dashboard" className="dropdown-link" onClick={() => setMenuOpen(false)}>My Dashboard</Link>
                <button onClick={handleLogout} className="dropdown-link danger">Logout</button>
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn btn-ghost">Login</Link>
              <Link to="/register" className="btn btn-primary">Sign Up</Link>
            </div>
          )}

          <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
