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

  getCurrentUser: () => {
    const roleUser = JSON.parse(localStorage.getItem('roleUser') || 'null');
    const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
    return roleUser || adminUser;
  },

  getUserType: () => {
    if (localStorage.getItem('roleToken')) return 'role';
    if (localStorage.getItem('adminToken')) return 'admin';
    return null;
  },

  clearTokens: () => {
    console.log('🧹 Clearing all tokens');
    localStorage.removeItem('roleToken');
    localStorage.removeItem('roleUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userType');
  },

  setRoleToken: (token, user) => {
    console.log('💾 Saving role token');
    localStorage.setItem('roleToken', token);
    localStorage.setItem('roleUser', JSON.stringify(user));
    localStorage.setItem('userType', 'role');
  },

  setAdminToken: (token, user) => {
    console.log('💾 Saving admin token');
    localStorage.setItem('adminToken', token);
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userType', 'admin');
  },

  isAuthenticated: () => {
    return !!(localStorage.getItem('roleToken') || localStorage.getItem('adminToken'));
  },

  getRedirectUrl: () => {
    const userType = tokenManager.getUserType();
    if (userType === 'admin') return '/Admin-Dashboard-overall';
    if (userType === 'role') return '/Role-dashboard';
    return '/';
  }
};

// Request Interceptor
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

// Response Interceptor
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
      
      const isLoginPage = window.location.pathname === '/' || 
                          window.location.pathname === '/roles-login';
      
      if (!isLoginPage) {
        setTimeout(() => {
          window.location.href = '/';
        }, 1500);
      }
    }

    return Promise.reject(error);
  }
);

export default API;