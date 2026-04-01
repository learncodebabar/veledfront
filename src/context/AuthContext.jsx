// src/context/AuthContext.jsx - Update the login function
import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFromStorage = () => {
      try {
        console.log('Loading from storage...');
        
        const roleToken = localStorage.getItem('roleToken');
        const roleUserStr = localStorage.getItem('roleUser');
        const adminToken = localStorage.getItem('adminToken');
        const adminUserStr = localStorage.getItem('adminUser');
        
        if (roleToken && roleUserStr) {
          try {
            const roleUser = JSON.parse(roleUserStr);
            console.log('Role user found:', roleUser);
            setToken(roleToken);
            setUser(roleUser);
            setUserType('role');
          } catch (e) {
            console.error('Error parsing role user:', e);
          }
        }
        else if (adminToken && adminUserStr) {
          try {
            const adminUser = JSON.parse(adminUserStr);
            console.log('Admin user found:', adminUser);
            setToken(adminToken);
            setUser(adminUser);
            setUserType('admin');
          } catch (e) {
            console.error('Error parsing admin user:', e);
          }
        }
      } catch (error) {
        console.error('Error in loadFromStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  const login = (userData, userToken, type) => {
    console.log('Login called:', { userData, type });
    
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('roleToken');
    localStorage.removeItem('roleUser');
    localStorage.removeItem('userType');
    
    if (type === 'admin') {
      localStorage.setItem('adminToken', userToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));
    } else {
      localStorage.setItem('roleToken', userToken);
      // ✅ Store user with permissions array
      const userToStore = {
        ...userData,
        permissionsArray: userData.permissionsArray || userData.permissions || []
      };
      localStorage.setItem('roleUser', JSON.stringify(userToStore));
    }
    localStorage.setItem('userType', type);
    
    setUser(userData);
    setToken(userToken);
    setUserType(type);
    
    console.log('Login successful');
  };

  const logout = () => {
    console.log('Logout called');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('roleToken');
    localStorage.removeItem('roleUser');
    localStorage.removeItem('userType');
    
    setUser(null);
    setToken(null);
    setUserType(null);
    
    window.location.href = '/';
  };

  const value = {
    user,
    token,
    userType,
    loading,
    login,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: userType === 'admin',
    isRole: userType === 'role'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};