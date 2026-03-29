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
    // مباشرة localStorage سے لوڈ کریں
    const loadFromStorage = () => {
      try {
        console.log('Loading from storage...');
        
        // Role token پہلے چیک کریں
        const roleToken = localStorage.getItem('roleToken');
        const roleUserStr = localStorage.getItem('roleUser');
        const adminToken = localStorage.getItem('adminToken');
        const adminUserStr = localStorage.getItem('adminUser');
        
        console.log('Storage check:', { 
          roleToken: !!roleToken, 
          roleUser: !!roleUserStr,
          adminToken: !!adminToken,
          adminUser: !!adminUserStr
        });

        // Role user
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
        // Admin user
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
        else {
          console.log('No user found in storage');
        }
      } catch (error) {
        console.error('Error in loadFromStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadFromStorage();
  }, []); // Empty array - صرف ایک بار چلے گا

  const login = (userData, userToken, type) => {
    console.log('Login called:', { userData, type });
    
    // پہلے سب صاف کریں
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('roleToken');
    localStorage.removeItem('roleUser');
    localStorage.removeItem('userType');
    
    // نیا ڈیٹا save کریں
    if (type === 'admin') {
      localStorage.setItem('adminToken', userToken);
      localStorage.setItem('adminUser', JSON.stringify(userData));
    } else {
      localStorage.setItem('roleToken', userToken);
      localStorage.setItem('roleUser', JSON.stringify(userData));
    }
    localStorage.setItem('userType', type);
    
    // State update
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
    
    // Redirect to login
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