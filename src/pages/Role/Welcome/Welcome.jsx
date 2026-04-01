// src/pages/Role/Welcome/Welcome.jsx
import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import './Welcome.css';

// React Icons
import { FaShieldAlt, FaUserCheck, FaChartLine, FaUsers, FaShoppingCart, FaBriefcase } from 'react-icons/fa';
import Sidebar from '../../../components/Sidebar/Sidebar';

const Welcome = () => {
  const { user } = useAuth();
  const roleUser = JSON.parse(localStorage.getItem('roleUser') || '{}');
  const userName = roleUser?.name || user?.name || 'User';
  const userRole = roleUser?.role || user?.role || 'Role User';
  
  // Get permissions count
  const permissions = roleUser?.permissionsArray || [];
  
  return (
    <div className="role-welcome-container sideber-container-Mobile">
        <Sidebar/>
      <div className="role-welcome-content">
        <div className="role-welcome-header">
          <div className="role-welcome-icon">
            <FaShieldAlt />
          </div>
          <h1>Welcome, {userName}!</h1>
          <p className="role-welcome-subtitle">
            You have successfully logged in as <strong>{userRole}</strong>
          </p>
        </div>

        <div className="role-welcome-stats">
          <div className="role-welcome-stat-card">
            <FaUserCheck className="stat-icon" />
            <div className="stat-info">
              <h3>{permissions.length}</h3>
              <p>Permissions Granted</p>
            </div>
          </div>
          <div className="role-welcome-stat-card">
            <FaChartLine className="stat-icon" />
            <div className="stat-info">
              <h3>Access Ready</h3>
              <p>System Access</p>
            </div>
          </div>
        </div>

        <div className="role-welcome-message">
          <h2>What would you like to do?</h2>
          <p>Use the sidebar menu to navigate to different sections.</p>
          <p className="role-welcome-note">
            💡 <strong>Note:</strong> You can only access pages that have been granted by the administrator.
          </p>
        </div>

        <div className="role-welcome-features">
          <h3>Your Available Features:</h3>
          <div className="features-grid">
            {permissions.includes('role-customers') && (
              <div className="feature-item">
                <FaUsers />
                <span>Customer Management</span>
              </div>
            )}
            {permissions.includes('role-orders') && (
              <div className="feature-item">
                <FaShoppingCart />
                <span>Order Management</span>
              </div>
            )}
            {permissions.includes('role-labor') && (
              <div className="feature-item">
                <FaBriefcase />
                <span>Labor Management</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;