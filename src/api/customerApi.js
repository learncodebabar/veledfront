// src/api/customerApi.js
import API from "./axios";

// ============ CUSTOMER APIS ============

/**
 * Get single customer by ID
 * @param {string} id - Customer ID
 */
export const getCustomerById = async (id) => {
  try {
    console.log('📤 Fetching customer:', id);
    const response = await API.get(`/customers/${id}`);
    console.log('📥 Customer response:', response.data);
    return response.data; // Returns { success: true, customer: {...}, jobs: [...] }
  } catch (error) {
    console.error('❌ Get customer error:', error);
    throw error;
  }
};

/**
 * Create new customer
 * @param {Object} customerData - Customer data
 */
export const createCustomer = async (customerData) => {
  try {
    console.log('📤 Creating customer:', customerData);
    const response = await API.post('/customers', customerData);
    return response.data;
  } catch (error) {
    console.error('❌ Create customer error:', error);
    throw error;
  }
};

/**
 * Update existing customer
 * @param {string} id - Customer ID
 * @param {Object} customerData - Updated customer data
 */
export const updateCustomer = async (id, customerData) => {
  try {
    console.log('📤 Updating customer:', id, customerData);
    const response = await API.put(`/customers/${id}`, customerData);
    return response.data;
  } catch (error) {
    console.error('❌ Update customer error:', error);
    throw error;
  }
};

/**
 * Delete customer
 * @param {string} id - Customer ID to delete
 */
export const deleteCustomer = async (id) => {
  try {
    console.log('📤 Deleting customer:', id);
    const response = await API.delete(`/customers/${id}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete customer error:', error);
    throw error;
  }
};

/**
 * Get all customers with optional filters
 * @param {Object} params - Query parameters (page, limit, search, etc.)
 */
export const getAllCustomers = async (params = {}) => {
  try {
    console.log('📤 Fetching all customers with params:', params);
    const response = await API.get('/customers', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get all customers error:', error);
    throw error;
  }
};

// ============ JOB RELATED FUNCTIONS ============

/**
 * getCustomerJobs - Get all jobs for a customer
 * @param {string} customerId 
 */
export const getCustomerJobs = async (customerId) => {
  try {
    console.log('📤 Fetching jobs for customer:', customerId);
    // Using the jobs endpoint that already exists
    const response = await API.get(`/jobs/customer/${customerId}`);
    console.log('📥 Jobs response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get customer jobs error:', error);
    throw error;
  }
};