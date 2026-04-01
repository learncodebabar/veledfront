// src/Route/RolePrivateRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";

const RolePrivateRoute = ({ children, allowedRoles = [] }) => {
  const roleToken = localStorage.getItem("roleToken");
  const roleUser = JSON.parse(localStorage.getItem("roleUser") || "null");
  const adminToken = localStorage.getItem("adminToken");
  const currentPath = window.location.pathname;
  
  console.log('🔐 RolePrivateRoute Check:', {
    roleToken: !!roleToken,
    adminToken: !!adminToken,
    currentPath: currentPath,
    roleUser: roleUser
  });

  // ✅ Admin can access everything
  if (adminToken) {
    console.log('✅ Admin access granted');
    return children;
  }

  // ✅ No role token - redirect to role login
  if (!roleToken) {
    console.log('❌ No role token - redirecting to role login');
    return <Navigate to="/roles-login" replace />;
  }

  // ✅ Token expiry check
  try {
    const base64Url = roleToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = JSON.parse(atob(base64));
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      console.log('❌ Token expired');
      localStorage.removeItem('roleToken');
      localStorage.removeItem('roleUser');
      return <Navigate to="/roles-login" replace />;
    }
  } catch (e) {
    console.error('Error decoding token:', e);
  }

  // ✅ Get user permissions
  const userPermissions = roleUser?.permissionsArray || [];
  console.log('📦 User Permissions:', userPermissions);

  // ✅ DYNAMIC PATH PERMISSION CHECK
  const dynamicPathMap = {
    '/Customer-Detail/': 'customer-detail',
    '/customer-orders/': 'customer-orders',
    '/edit-customer/': 'edit-customer',
    '/edit-labor/': 'edit-labor',
    '/Worker-Details-Page/': 'worker-details',
    '/Create-New-Order/': 'create-new-order',
    '/quotation-to-order/': 'quotation-customer',
    '/quotation/': 'all-quotations'
  };
  
  let isDynamicPath = false;
  for (const [pathPattern, permissionId] of Object.entries(dynamicPathMap)) {
    if (currentPath.startsWith(pathPattern)) {
      isDynamicPath = true;
      if (!userPermissions.includes(permissionId)) {
        console.log(`❌ No permission for ${permissionId} on path: ${currentPath}`);
        return <Navigate to="/unauthorized" replace />;
      }
      console.log(`✅ Permission granted for ${permissionId}`);
      break;
    }
  }

  // ✅ For non-dynamic paths, check if user has permission for this exact path
  if (!isDynamicPath) {
    // Path to permission mapping for static paths
    const staticPathMap = {
      '/Admin-Dashboard-overall': 'admin-dashboard',
      '/Role-dashboard': 'role-dashboard',
      '/admin-all-customer': 'all-customers',
      '/role-customers': 'role-customers',
      '/Admin-Add-customer': 'add-customer',
      '/Role-Add-Customer': 'role-add-customer',
      '/All-Orders': 'all-orders',
      '/role-orders': 'role-orders',
      '/All-Labor': 'all-labor',
      '/role-labor': 'role-labor',
      '/Add-Labor': 'add-labor',
      '/role-add-labor': 'role-add-labor',
      '/Attendance-Page': 'attendance',
      '/role-attendance': 'role-attendance',
      '/all-Quotation': 'all-quotations',
      '/role-quotations': 'role-quotations',
      '/QuotationCustomer': 'quotation-customer',
      '/Admin-Material': 'admin-material',
      '/admin-expenses': 'admin-expenses',
      '/Admin-Payment': 'admin-payment',
      '/add-roles': 'roles-management',
      '/Admin-Profile-custoize': 'profile',
      '/Admin-Account-Settings': 'account-settings',
      '/Theme-Settings': 'theme-settings'
    };
    
    const requiredPermission = staticPathMap[currentPath];
    if (requiredPermission && !userPermissions.includes(requiredPermission)) {
      console.log(`❌ No permission for static path: ${currentPath}, need: ${requiredPermission}`);
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // ✅ Role access check
  const userRole = roleUser?.role || 'manager';
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.log(`❌ Role ${userRole} not allowed. Required:`, allowedRoles);
    return <Navigate to="/unauthorized" replace />;
  }

  console.log(`✅ Access granted for ${currentPath}`);
  return children;
};

export default RolePrivateRoute;