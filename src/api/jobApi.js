// src/api/jobApi.js
import API from "./axios";

// ============ JOB APIS ============
// These work for BOTH Admin and Role users

/**
 * Create a new job
 * @param {Object} jobData - Job data to create
 */
export const createJob = async (jobData) => {
  try {
    console.log('📤 Creating job:', jobData);
    const response = await API.post('/jobs', jobData);
    return response.data;
  } catch (error) {
    console.error('❌ Create job error:', error);
    throw error;
  }
};

/**
 * Get all jobs for a specific customer
 * @param {string} customerId - Customer ID
 */
export const getCustomerJobs = async (customerId) => {
  try {
    console.log('📤 Fetching jobs for customer:', customerId);
    const response = await API.get(`/jobs/customer/${customerId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get customer jobs error:', error);
    throw error;
  }
};

/**
 * Get job by ID
 * @param {string} jobId - Job ID
 */
export const getJobById = async (jobId) => {
  try {
    console.log('📤 Fetching job:', jobId);
    const response = await API.get(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Get job error:', error);
    throw error;
  }
};

/**
 * Update an existing job
 * @param {string} jobId - Job ID
 * @param {Object} jobData - Updated job data
 */
export const updateJob = async (jobId, jobData) => {
  try {
    console.log('📤 Updating job:', jobId, jobData);
    const response = await API.put(`/jobs/${jobId}`, jobData);
    return response.data;
  } catch (error) {
    console.error('❌ Update job error:', error);
    throw error;
  }
};

/**
 * Delete a job
 * @param {string} jobId - Job ID to delete
 */
export const deleteJob = async (jobId) => {
  try {
    console.log('📤 Deleting job:', jobId);
    const response = await API.delete(`/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('❌ Delete job error:', error);
    throw error;
  }
};

/**
 * Get all jobs with optional filters
 * @param {Object} params - Query parameters (page, limit, status, etc.)
 */
export const getAllJobs = async (params = {}) => {
  try {
    console.log('📤 Fetching all jobs with params:', params);
    const response = await API.get('/jobs', { params });
    return response.data;
  } catch (error) {
    console.error('❌ Get all jobs error:', error);
    throw error;
  }
};

// ============ COMPATIBILITY FUNCTIONS ============
// These maintain backward compatibility with your existing code

/**
 * fetchJobsByCustomer - Compatible with your existing code
 * @param {string} customerId 
 */
export const fetchJobsByCustomer = async (customerId) => {
  try {
    const response = await getCustomerJobs(customerId);
    return response;
  } catch (error) {
    console.error('❌ fetchJobsByCustomer error:', error);
    throw error;
  }
};

/**
 * fetchJobDetails - Compatible with your existing code
 * @param {string} jobId 
 */
export const fetchJobDetails = async (jobId) => {
  try {
    const response = await getJobById(jobId);
    return response;
  } catch (error) {
    console.error('❌ fetchJobDetails error:', error);
    throw error;
  }
};