import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Unauthorized.css';

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">🔒</div>
        <h1>403 - Access Denied</h1>
        <p className="unauthorized-message">
          Sorry, you don't have permission to access this page.
        </p>
        <p className="unauthorized-submessage">
          Please contact your administrator if you believe this is a mistake.
        </p>
        <div className="unauthorized-actions">
          <button className="btn-back" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;