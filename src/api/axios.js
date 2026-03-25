// src/api/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const tokenManager = {
  getToken: () => {
    const roleToken = localStorage.getItem('roleToken');
    const adminToken = localStorage.getItem('adminToken');
    
    if (roleToken) {
      console.log('🔑 Using Role Token');
      return { token: roleToken, type: 'role' };
    }
    if (adminToken) {

      console.log('🔑 Using Admin Token');
      return { token: adminToken, type: 'admin' };
    }
    return { token: null, type: null };
  },

  // Get current user
  getCurrentUser: () => {
    const roleUser = JSON.parse(localStorage.getItem('roleUser') || 'null');
    const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
    return roleUser || adminUser;
  },

  // Get user type
  getUserType: () => {
    if (localStorage.getItem('roleToken')) return 'role';
    if (localStorage.getItem('adminToken')) return 'admin';
    return null;
  },

  // Clear all tokens (logout)
  clearTokens: () => {
    console.log('🧹 Clearing all tokens');
    localStorage.removeItem('roleToken');
    localStorage.removeItem('roleUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
  },

  // Save role token after login
  setRoleToken: (token, user) => {
    console.log('💾 Saving role token');
    localStorage.setItem('roleToken', token);
    localStorage.setItem('roleUser', JSON.stringify(user));
  },

  // Save admin token after login
  setAdminToken: (token, user) => {
    console.log('💾 Saving admin token');
    localStorage.setItem('adminToken', token);
    localStorage.setItem('user', JSON.stringify(user));
  }
};

// Request Interceptor - Automatically add token to all requests
API.interceptors.request.use(
  (config) => {
    const { token, type } = tokenManager.getToken();
    
    console.log('📤 API Request:', {
      url: config.url,
      method: config.method,
      userType: type || 'none',
      hasToken: token ? '✅' : '❌'
    });
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request Error:', error);
    return Promise.reject(error);
  }
);

// Response Interceptor - Handle 401 errors
API.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      url: response.config.url,
      status: response.status,
      success: response.data?.success
    });
    return response;
  },
  (error) => {
    console.error('❌ Response Error:', {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      console.log('🔒 Session expired - logging out');
      tokenManager.clearTokens();
      
      // Don't redirect if already on login page
      if (!window.location.pathname.includes('/login')) {
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }
    }

    return Promise.reject(error);
  }
);

export default API;