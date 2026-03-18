import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ;

const getToken = () => {
  const adminToken = localStorage.getItem('adminToken');
  const roleToken = localStorage.getItem('roleToken');
  return adminToken || roleToken;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Create new quotation customer
export const createQuotationCustomer = async (customerData) => {
  try {
    const response = await api.post('/quotation-customers', customerData);
    return response;
  } catch (error) {
    console.error('Error in createQuotationCustomer:', error);
    throw error;
  }
};

// Get all quotation customers
export const getAllQuotationCustomers = async () => {
  try {
    const response = await api.get('/quotation-customers');
    return response;
  } catch (error) {
    console.error('Error in getAllQuotationCustomers:', error);
    throw error;
  }
};

// Get single quotation customer
export const getQuotationCustomerById = async (id) => {
  try {
    const response = await api.get(`/quotation-customers/${id}`);
    return response;
  } catch (error) {
    console.error('Error in getQuotationCustomerById:', error);
    throw error;
  }
};

// Get customer by phone number
export const getCustomerByPhone = async (phone) => {
  try {
    const response = await api.get(`/quotation-customers/phone/${phone}`);
    return response;
  } catch (error) {
    console.error('Error in getCustomerByPhone:', error);
    throw error;
  }
};

// Update quotation customer
export const updateQuotationCustomer = async (id, customerData) => {
  try {
    const response = await api.put(`/quotation-customers/${id}`, customerData);
    return response;
  } catch (error) {
    console.error('Error in updateQuotationCustomer:', error);
    throw error;
  }
};

// Delete quotation customer
export const deleteQuotationCustomer = async (id) => {
  try {
    const response = await api.delete(`/quotation-customers/${id}`);
    return response;
  } catch (error) {
    console.error('Error in deleteQuotationCustomer:', error);
    throw error;
  }
};

// Search quotation customers
export const searchQuotationCustomers = async (query) => {
  try {
    const response = await api.get(`/quotation-customers/search?query=${encodeURIComponent(query)}`);
    return response;
  } catch (error) {
    console.error('Error in searchQuotationCustomers:', error);
    throw error;
  }
};

// Alias for getAllQuotationCustomers (if you prefer the name getAllCustomers)
export const getAllCustomers = getAllQuotationCustomers;