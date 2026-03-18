// src/Route/AdminPrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const AdminPrivateRoute = ({ children }) => {
  const adminToken = localStorage.getItem("adminToken");
  
  console.log('🔐 AdminPrivateRoute Check:', {
    adminToken: adminToken ? '✅' : '❌'
  });

  if (!adminToken) {
    console.log('❌ No admin token - redirecting to admin login');
    return <Navigate to="/" replace />;
  }

  // Token expiry check
  try {
    const base64Url = adminToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.log('❌ Admin token expired');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }

  console.log('✅ Admin access granted');
  return children;
};

export default AdminPrivateRoute;