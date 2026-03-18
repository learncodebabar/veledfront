import API from './axios';

const roleService = {
  // ========== OTP AUTHENTICATION ==========
  
  /**
   * Send OTP to email
   * @param {Object} credentials - { email, password }
   */
  sendOtp: async (credentials) => {
    try {
      console.log('📤 Sending OTP to:', credentials.email);
      
      const response = await API.post('/roles/send-otp', credentials);
      
      console.log('📥 OTP sent response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Send OTP error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { message: error.message };
    }
  },

  /**
   * Verify OTP and login
   * @param {Object} data - { email, otp, userId }
   */
  verifyOtpAndLogin: async (data) => {
    try {
      console.log('📤 Verifying OTP for:', data.email);
      
      const response = await API.post('/roles/verify-otp', data);
      
      console.log('📥 Verify OTP response:', response.data);
      
      if (response.data.success && response.data.token) {
        // Save token and user data
        localStorage.setItem('roleToken', response.data.token);
        localStorage.setItem('roleUser', JSON.stringify(response.data.user));
        
        console.log('✅ Token saved successfully');
        console.log('👤 User:', response.data.user);
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Verify OTP error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { message: error.message };
    }
  },

  /**
   * Resend OTP
   * @param {Object} data - { email, userId }
   */
  resendOtp: async (data) => {
    try {
      console.log('📤 Resending OTP to:', data.email);
      
      const response = await API.post('/roles/resend-otp', data);
      
      console.log('📥 Resend OTP response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Resend OTP error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { message: error.message };
    }
  },

  // ========== EXISTING METHODS ==========
  
  // Helper function to get token
  getToken: () => {
    const roleToken = localStorage.getItem('roleToken');
    const adminToken = localStorage.getItem('adminToken');
    const token = roleToken || adminToken;
    
    console.log('🔑 Token check - roleToken:', roleToken ? 'Present' : 'Missing');
    console.log('🔑 Token check - adminToken:', adminToken ? 'Present' : 'Missing');
    
    return token;
  },

  // Role login (direct - without OTP, for backward compatibility)
  roleLogin: async (credentials) => {
    try {
      console.log('📤 Attempting role login for:', credentials.email);
      
      const response = await API.post('/roles/login', credentials);
      
      console.log('📥 Login response received');
      
      if (response.data.token) {
        const token = response.data.token;
        
        // Validate token format
        const tokenParts = token.split('.');
        console.log('Token parts:', tokenParts.length);
        
        if (tokenParts.length === 3) {
          console.log('✅ Valid JWT token received');
          
          // Decode token to check expiry
          try {
            const base64Url = tokenParts[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const decoded = JSON.parse(atob(base64));
            console.log('📦 Decoded token:', decoded);
            console.log('📅 Token expiry:', new Date(decoded.exp * 1000).toLocaleString());
          } catch (decodeError) {
            console.error('Error decoding token:', decodeError);
          }
          
          // Save to localStorage
          localStorage.setItem('roleToken', token);
          localStorage.setItem('roleUser', JSON.stringify(response.data.user));
          
          console.log('💾 Token saved to localStorage');
          console.log('👤 User saved:', response.data.user);
        } else {
          console.error('❌ Invalid token format - expected 3 parts, got', tokenParts.length);
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('❌ Role login error:', error);
      console.error('Error response:', error.response?.data);
      throw error.response?.data || { message: error.message };
    }
  },

  // Get all roles
  getAllRoles: async () => {
    try {
      const token = roleService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('📤 Fetching all roles with token');
      
      const response = await API.get('/roles', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📥 Roles fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Get roles error:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 Session expired - clearing tokens');
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
      }
      
      throw error.response?.data || { message: error.message };
    }
  },

  // Create new role
  createRole: async (roleData) => {
    try {
      const token = roleService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log('📤 Creating new role');
      
      const response = await API.post('/roles', roleData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Role created successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Create role error:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 Session expired - clearing tokens');
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
      }
      
      throw error.response?.data || { message: error.message };
    }
  },

  // Get role by ID
  getRoleById: async (id) => {
    try {
      const token = roleService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log(`📤 Fetching role with ID: ${id}`);
      
      const response = await API.get(`/roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('📥 Role fetched successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Get role error:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 Session expired - clearing tokens');
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
      }
      
      throw error.response?.data || { message: error.message };
    }
  },

  // Update role
  updateRole: async (id, roleData) => {
    try {
      const token = roleService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log(`📤 Updating role with ID: ${id}`);
      
      const response = await API.put(`/roles/${id}`, roleData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Role updated successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Update role error:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 Session expired - clearing tokens');
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
      }
      
      throw error.response?.data || { message: error.message };
    }
  },

  // Delete role
  deleteRole: async (id) => {
    try {
      const token = roleService.getToken();
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      console.log(`📤 Deleting role with ID: ${id}`);
      
      const response = await API.delete(`/roles/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      console.log('✅ Role deleted successfully');
      return response.data;
    } catch (error) {
      console.error('❌ Delete role error:', error);
      
      if (error.response?.status === 401) {
        console.log('🔒 Session expired - clearing tokens');
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('user');
      }
      
      throw error.response?.data || { message: error.message };
    }
  },

  // Logout function
  logout: () => {
    console.log('🚪 Logging out - clearing all tokens');
    localStorage.removeItem('roleToken');
    localStorage.removeItem('roleUser');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('user');
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    const token = localStorage.getItem('roleToken') || localStorage.getItem('adminToken');
    return !!token;
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
  }
};

export default roleService;