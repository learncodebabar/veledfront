// src/pages/NoPermission/NoPermission.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiShield, FiHome, FiLogOut } from 'react-icons/fi';
import './NoPermission.css';

const NoPermission = () => {
  const navigate = useNavigate();
  
  // Get role user info
  const roleUser = JSON.parse(localStorage.getItem('roleUser') || '{}');
  const userRole = roleUser?.role || 'Role User';

  const handleLogout = () => {
    localStorage.removeItem('roleToken');
    localStorage.removeItem('roleUser');
    navigate('/roles-login');
  };

  return (
    <div className="no-permission-container">
      <div className="no-permission-card">
        <div className="no-permission-icon">
          <FiShield />
        </div>
        
        <h1 className="no-permission-title">No Permission</h1>
        
        <p className="no-permission-subtitle">
          You don't have any page permissions assigned yet.
        </p>
        
        <div className="no-permission-role-badge">
          <span className="role-icon">👤</span>
          <span className="role-name">{userRole}</span>
        </div>
        
        <div className="no-permission-message">
          <FiAlertCircle className="message-icon" />
          <p>
            Please contact your administrator to assign permissions for your role.
            <br />
            <span className="help-text">You need at least one page permission to access the dashboard.</span>
          </p>
        </div>
        
        <div className="no-permission-actions">
          <button 
            className="no-permission-btn no-permission-btn-logout"
            onClick={handleLogout}
          >
            <FiLogOut />
            Logout
          </button>
          
          <button 
            className="no-permission-btn no-permission-btn-home"
            onClick={() => navigate('/roles-login')}
          >
            <FiHome />
            Go to Login
          </button>
        </div>
        
        <div className="no-permission-footer">
          <p>Need help? Contact your system administrator</p>
        </div>
      </div>
    </div>
  );
};

export default NoPermission;