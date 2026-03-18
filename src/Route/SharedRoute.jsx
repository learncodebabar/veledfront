// src/Route/SharedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const SharedRoute = ({ children }) => {
  // Dono tokens check karo
  const adminToken = localStorage.getItem("adminToken");
  const roleToken = localStorage.getItem("roleToken");
  
  console.log('🔐 SharedRoute Check:', {
    adminToken: adminToken ? '✅' : '❌',
    roleToken: roleToken ? '✅' : '❌'
  });

  // Agar koi bhi token nahi hai to login pe redirect
  if (!adminToken && !roleToken) {
    console.log('❌ No token found - redirecting to login');
    return <Navigate to="/" replace />;
  }

  // Token expiry check (optional)
  try {
    const token = adminToken || roleToken;
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.log('❌ Token expired');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      localStorage.removeItem('roleToken');
      localStorage.removeItem('roleUser');
      return <Navigate to="/" replace />;
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }

  console.log('✅ Access granted to shared route');
  return children;
};

export default SharedRoute;