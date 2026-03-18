// src/api/adminMaterialApi.js
import API, { tokenManager } from './axios';

// Get all materials
export const getAllMaterials = async (params = {}) => {
  try {
    console.log('📤 Fetching materials with params:', params);
    
    // Check if user is authenticated before making request
    const userType = tokenManager.getUserType();
    if (!userType) {
      console.warn('⚠️ No authenticated user found');
      throw { message: 'Please login to access materials' };
    }
    
    // Verify admin access
    if (userType !== 'admin') {
      console.warn('⚠️ Non-admin user attempting to access admin materials');
      throw { message: 'Admin access required' };
    }
    
    const response = await API.get('/admin/materials', { params });
    console.log('📥 Materials fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in getAllMaterials:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error.response?.data || { message: 'Failed to load materials' };
  }
};

// Create material
export const createMaterial = async (materialData) => {
  try {
    console.log('📤 Creating material with data:', materialData);
    
    // Validate admin access
    const userType = tokenManager.getUserType();
    if (userType !== 'admin') {
      throw { message: 'Admin access required to create materials' };
    }
    
    const response = await API.post('/admin/materials', materialData);
    console.log('📥 Material created successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in createMaterial:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to save material' };
  }
};

// Search materials
export const searchMaterials = async (query) => {
  try {
    console.log('📤 Searching materials with query:', query);
    
    const userType = tokenManager.getUserType();
    if (userType !== 'admin') {
      throw { message: 'Admin access required' };
    }
    
    const response = await API.get('/admin/materials/search', { params: { query } });
    console.log('📥 Search results:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in searchMaterials:', error);
    throw error.response?.data || { message: 'Failed to search materials' };
  }
};

// Update material
export const updateMaterial = async (id, materialData) => {
  try {
    console.log('📤 Updating material:', id, materialData);
    
    const userType = tokenManager.getUserType();
    if (userType !== 'admin') {
      throw { message: 'Admin access required to update materials' };
    }
    
    const response = await API.put(`/admin/materials/${id}`, materialData);
    console.log('📥 Material updated successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in updateMaterial:', error.response?.data || error.message);
    throw error.response?.data || { message: 'Failed to update material' };
  }
};

// Delete material
export const deleteMaterial = async (id) => {
  try {
    console.log('📤 Deleting material:', id);
    
    const userType = tokenManager.getUserType();
    if (userType !== 'admin') {
      throw { message: 'Admin access required to delete materials' };
    }
    
    const response = await API.delete(`/admin/materials/${id}`);
    console.log('📥 Material deleted successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in deleteMaterial:', error);
    throw error.response?.data || { message: 'Failed to delete material' };
  }
};

// Get low stock materials
export const getLowStockMaterials = async () => {
  try {
    console.log('📤 Fetching low stock materials');
    
    const userType = tokenManager.getUserType();
    if (userType !== 'admin') {
      throw { message: 'Admin access required' };
    }
    
    const response = await API.get('/admin/materials/low-stock');
    console.log('📥 Low stock materials:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in getLowStockMaterials:', error);
    throw error.response?.data || { message: 'Failed to load low stock materials' };
  }
};

// Bulk delete materials
export const bulkDeleteMaterials = async (materialIds) => {
  try {
    console.log('📤 Bulk deleting materials:', materialIds);
    
    const userType = tokenManager.getUserType();
    if (userType !== 'admin') {
      throw { message: 'Admin access required for bulk delete' };
    }
    
    const response = await API.delete('/admin/materials/bulk', { data: { materialIds } });
    console.log('📥 Bulk delete successful:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in bulkDeleteMaterials:', error);
    throw error.response?.data || { message: 'Failed to delete materials' };
  }
};

// Get material by ID
export const getMaterialById = async (id) => {
  try {
    console.log('📤 Fetching material by ID:', id);
    
    const userType = tokenManager.getUserType();
    if (userType !== 'admin') {
      throw { message: 'Admin access required' };
    }
    
    const response = await API.get(`/admin/materials/${id}`);
    console.log('📥 Material fetched successfully:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error in getMaterialById:', error);
    throw error.response?.data || { message: 'Failed to load material' };
  }
};

// Export a function to check if user has admin access
export const checkAdminAccess = () => {
  const userType = tokenManager.getUserType();
  const isAdmin = userType === 'admin';
  
  console.log('🔐 Admin Access Check:', {
    userType,
    isAdmin,
    hasToken: !!tokenManager.getToken().token
  });
  
  return {
    isAdmin,
    userType,
    currentUser: tokenManager.getCurrentUser()
  };
};

// Export all functions as a single object for convenience
const adminMaterialApi = {
  getAllMaterials,
  createMaterial,
  searchMaterials,
  updateMaterial,
  deleteMaterial,
  getLowStockMaterials,
  bulkDeleteMaterials,
  getMaterialById,
  checkAdminAccess
};

export default adminMaterialApi;