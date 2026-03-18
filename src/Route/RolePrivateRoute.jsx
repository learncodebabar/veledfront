// src/Route/RolePrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

/**
 * Role Private Route - Sirf specific roles ko access dega
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render if authorized
 * @param {Array} props.allowedRoles - Allowed roles (e.g., ['manager', 'data_entry'])
 * @param {Array} props.allowedPages - Allowed pages (optional)
 */
const RolePrivateRoute = ({ children, allowedRoles = [], allowedPages = [] }) => {
  // Check for role token
  const roleToken = localStorage.getItem("roleToken");
  const roleUser = JSON.parse(localStorage.getItem("roleUser") || "null");
  
  console.log('🔐 RolePrivateRoute Check:', {
    roleToken: roleToken ? '✅' : '❌',
    roleUser: roleUser,
    allowedRoles: allowedRoles,
    currentPath: window.location.pathname
  });

  // Agar role token nahi hai to role login pe redirect
  if (!roleToken) {
    console.log('❌ No role token - redirecting to role login');
    return <Navigate to="/roles-login" replace />;
  }

  // Token expiry check
  try {
    const base64Url = roleToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.log('❌ Role token expired');
      localStorage.removeItem('roleToken');
      localStorage.removeItem('roleUser');
      return <Navigate to="/roles-login" replace />;
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }

  // Get user role
  const userRole = roleUser?.role || 'manager';

  // Check if role is allowed
  if (allowedRoles.length > 0) {
    if (!allowedRoles.includes(userRole)) {
      console.log(`❌ Role ${userRole} not allowed. Required:`, allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // Role allowed - render children
  console.log(`✅ Role ${userRole} access granted`);
  return children;
};

export default RolePrivateRoute;