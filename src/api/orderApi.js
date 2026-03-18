import axios from "axios";
import API from "./axios";

// ✅ Request Interceptor - Har request mein token lagao
API.interceptors.request.use((req) => {
  // Pehle roleToken check karo, phir adminToken
  const roleToken = localStorage.getItem("roleToken");
  const adminToken = localStorage.getItem("adminToken");
  
  // Dono tokens mein se jo bhi ho use karo
  const token = roleToken || adminToken;
  
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
    
    // Debug ke liye
    console.log("🔑 API Request:", {
      url: req.url,
      method: req.method,
      tokenType: roleToken ? "role" : (adminToken ? "admin" : "none"),
      hasToken: !!token
    });
  } else {
    console.warn("⚠️ No token found for request:", req.url);
  }

  return req;
});

// ✅ Response Interceptor - 401 errors handle karo
API.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", {
      url: response.config.url,
      status: response.status
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message
    });
    
    // Agar 401 (Unauthorized) error aaye
    if (error.response?.status === 401) {
      console.log("🔒 Session expired - clearing tokens");
      
      // Dono tokens clear karo
      localStorage.removeItem("roleToken");
      localStorage.removeItem("roleUser");
      localStorage.removeItem("adminToken");
      localStorage.removeItem("user");
      
      // Redirect to login page
      window.location.href = "/login";
    }
    
    return Promise.reject(error);
  }
);

// ✅ Helper function to get current user type
export const getUserType = () => {
  if (localStorage.getItem("roleToken")) return "role";
  if (localStorage.getItem("adminToken")) return "admin";
  return null;
};

// ✅ Helper function to get current user
export const getCurrentUser = () => {
  const roleUser = JSON.parse(localStorage.getItem("roleUser") || "null");
  const adminUser = JSON.parse(localStorage.getItem("user") || "null");
  return roleUser || adminUser;
};

// ✅ Helper function to check if user can perform action
export const canPerformAction = (allowedRoles = []) => {
  const userType = getUserType();
  const user = getCurrentUser();
  const userRole = user?.role || "admin";
  
  // Admin can do everything
  if (userType === "admin") return true;
  
  // Role user - check if their role is allowed
  if (userType === "role" && allowedRoles.includes(userRole)) return true;
  
  return false;
};

// ==================== ORDER APIS ====================

// ✅ Create Order
export const createOrder = async (orderData) => {
  try {
    console.log("📤 Creating order with data:", orderData);
    
    // Check permission
    const userType = getUserType();
    const user = getCurrentUser();
    
    if (userType === "role" && !["admin", "manager"].includes(user?.role)) {
      throw new Error("You don't have permission to create orders");
    }
    
    const response = await API.post("/orders", orderData);
    console.log("📥 Order created successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - createOrder:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get All Orders
export const getAllOrders = async () => {
  try {
    console.log("📤 Fetching all orders");
    
    const response = await API.get("/orders");
    console.log("📥 Orders fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - getAllOrders:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get Order By ID
export const getOrderById = async (id) => {
  try {
    console.log(`📤 Fetching order with ID: ${id}`);
    
    const response = await API.get(`/orders/${id}`);
    console.log("📥 Order fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - getOrderById:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get Orders By Customer
export const getOrdersByCustomer = async (customerId) => {
  try {
    console.log(`📤 Fetching orders for customer: ${customerId}`);
    
    const response = await API.get(`/orders/customer/${customerId}`);
    console.log("📥 Customer orders fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - getOrdersByCustomer:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update Order
export const updateOrder = async (id, updatedData) => {
  try {
    console.log(`📤 Updating order: ${id}`, updatedData);
    
    // Check permission
    const userType = getUserType();
    const user = getCurrentUser();
    
    if (userType === "role" && !["admin", "manager"].includes(user?.role)) {
      throw new Error("You don't have permission to update orders");
    }
    
    const response = await API.put(`/orders/${id}`, updatedData);
    console.log("📥 Order updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - updateOrder:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Delete Order (Only Admin)
export const deleteOrder = async (id) => {
  try {
    console.log(`📤 Deleting order: ${id}`);
    
    // Only admin can delete orders
    const userType = getUserType();
    if (userType !== "admin") {
      throw new Error("Only admin can delete orders");
    }
    
    const response = await API.delete(`/orders/${id}`);
    console.log("📥 Order deleted successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - deleteOrder:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Get Order Statistics
export const getOrderStatistics = async () => {
  try {
    console.log("📤 Fetching order statistics");
    
    const response = await API.get("/orders/statistics");
    console.log("📥 Statistics fetched successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - getOrderStatistics:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Update Order Status
export const updateOrderStatus = async (id, status) => {
  try {
    console.log(`📤 Updating order status: ${id}`, { status });
    
    // Check permission
    const userType = getUserType();
    const user = getCurrentUser();
    
    if (userType === "role" && !["admin", "manager"].includes(user?.role)) {
      throw new Error("You don't have permission to update order status");
    }
    
    const response = await API.patch(`/orders/${id}/status`, { status });
    console.log("📥 Order status updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - updateOrderStatus:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Add Payment to Order
export const addOrderPayment = async (id, paymentData) => {
  try {
    console.log(`📤 Adding payment to order: ${id}`, paymentData);
    
    // Check permission
    const userType = getUserType();
    const user = getCurrentUser();
    
    if (userType === "role" && !["admin", "manager"].includes(user?.role)) {
      throw new Error("You don't have permission to add payments");
    }
    
    const response = await API.post(`/orders/${id}/payments`, paymentData);
    console.log("📥 Payment added successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ API Error - addOrderPayment:", error.response?.data || error.message);
    throw error;
  }
};

// ✅ Export orders (Admin only)
export const exportOrders = async (format = "csv") => {
  try {
    console.log(`📤 Exporting orders as ${format}`);
    
    // Only admin can export
    const userType = getUserType();
    if (userType !== "admin") {
      throw new Error("Only admin can export orders");
    }
    
    const response = await API.get(`/orders/export/${format}`, {
      responseType: "blob"
    });
    console.log("📥 Orders exported successfully");
    return response;
  } catch (error) {
    console.error("❌ API Error - exportOrders:", error.response?.data || error.message);
    throw error;
  }
};