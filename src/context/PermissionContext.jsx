import React, { createContext, useState, useContext, useEffect } from 'react';
import { useAuth } from './AuthContext';
import API from '../api/axios';

const PermissionContext = createContext();

export const usePermission = () => {
  const context = useContext(PermissionContext);
  if (!context) {
    throw new Error('usePermission must be used within a PermissionProvider');
  }
  return context;
};

export const PermissionProvider = ({ children }) => {
  const { user, userType, isAdmin, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState({});
  const [permissionsArray, setPermissionsArray] = useState([]);
  const [loading, setLoading] = useState(false);

  // جب بھی user change ہو، permissions fetch کریں
  useEffect(() => {
    const fetchPermissions = async () => {
      // صرف role user کے لیے
      if (isAuthenticated && userType === 'role' && user?.id) {
        try {
          setLoading(true);
          console.log('Fetching permissions for role:', user.id);
          
          const token = localStorage.getItem('roleToken');
          const response = await API.get(`/permissions/role/${user.id}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          console.log('Permissions response:', response.data);
          
          const perms = {};
          const permsArray = [];
          
          if (response.data.permissions) {
            response.data.permissions.forEach(p => {
              if (p.canAccess) {
                perms[p.pageId] = true;
                permsArray.push(p.pageId);
              }
            });
          }
          
          // Role ka permissions array
          if (response.data.role?.permissionsArray) {
            setPermissionsArray(response.data.role.permissionsArray);
          } else {
            setPermissionsArray(permsArray);
          }
          
          setPermissions(perms);
          console.log('Permissions loaded:', perms);
          
        } catch (error) {
          console.error('Error fetching permissions:', error);
          if (error.response?.status === 401) {
            // Token expired - logout
            localStorage.clear();
            window.location.href = '/';
          }
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, [isAuthenticated, userType, user?.id]); // جب user ID change ہو

  const hasAccess = (pageId) => {
    if (isAdmin) return true;
    
    // Agar permissions empty hain to false return karo
    if (Object.keys(permissions).length === 0) {
      console.log(`Permissions empty, ${pageId} access denied`);
      return false;
    }
    
    const hasPermission = !!permissions[pageId];
    console.log(`Checking ${pageId}:`, hasPermission);
    return hasPermission;
  };

  const value = {
    permissions,
    permissionsArray,
    loading,
    hasAccess,
    refreshPermissions: () => {} // اب auto fetch ہو رہا ہے
  };

  return React.createElement(
    PermissionContext.Provider,
    { value: value },
    children
  );
};

// ✅ یہ default export شامل کریں (Fast Refresh warning ختم کرنے کے لیے)
export default PermissionProvider;