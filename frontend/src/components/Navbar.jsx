import React from 'react';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = ({ onAddVehicleClick, onCreateAdminClick, activePage }) => {
  const { user, logout } = useAuth();

  return (
    <header className="evify-navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="brand-logo">⚡</div>
          <div className="brand-text">
            <span className="brand-title">Evify</span>
            <span className="brand-subtitle">Fleet Management</span>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Create Admin nav link */}
          {onCreateAdminClick && (
            <button
              className={`btn-nav-link ${activePage === 'create-admin' ? 'btn-nav-link-active' : ''}`}
              onClick={onCreateAdminClick}
            >
              👤 Create Admin
            </button>
          )}

          {/* Add Vehicle — only visible on dashboard */}
          {onAddVehicleClick && activePage !== 'create-admin' && (
            <button className="btn-add-vehicle" onClick={onAddVehicleClick}>
              + Add Vehicle
            </button>
          )}

          <div className="user-profile">
            <div className="user-avatar">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'Fleet Manager'}</span>
              <span className="user-email">{user?.email || 'admin@evify.com'}</span>
            </div>
            <button className="btn-logout" onClick={logout} title="Sign Out">
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

