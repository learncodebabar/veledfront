// src/pages/AllCustomer/AllCustomer.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  FiUsers, FiSearch, FiPlus, FiEdit2, FiShoppingBag, 
  FiX, FiFilter, FiChevronRight, FiPackage, FiClock,
  FiCheckCircle, FiAlertCircle, FiDollarSign, FiChevronDown,
  FiEye, FiCalendar, FiMoreVertical
} from "react-icons/fi";
import { 
  BsPersonCircle, BsTelephone, BsGeoAlt,
  BsBoxSeam, BsCurrencyRupee, BsWallet2, BsCalendar2Date
} from "react-icons/bs";
import { 
  MdOutlineRefresh, MdOutlineClear,
  MdPendingActions, MdOutlineLocalShipping
} from "react-icons/md";
import { FaRegUserCircle } from "react-icons/fa";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { getAllCustomers } from "../../../api/customerApi";
import { getOrdersByCustomer } from "../../../api/orderApi";
import "./AllCustomer.css";

const AllCustomer = () => {
  const navigate = useNavigate();
  
  // Get user info from localStorage
  const adminToken = localStorage.getItem("adminToken");
  const roleToken = localStorage.getItem("roleToken");
  const adminUser = JSON.parse(localStorage.getItem("user") || "null");
  const roleUser = JSON.parse(localStorage.getItem("roleUser") || "null");
  
  // Determine user type and permissions
  const userType = adminToken ? "admin" : (roleToken ? "role" : null);
  const user = adminUser || roleUser;
  const userRole = user?.role || "admin";
  
  // Permissions based on user type and role
  const canAddCustomer = userType === "admin" || ["manager", "data_entry"].includes(userRole);
  const canEditCustomer = userType === "admin" || ["manager", "data_entry"].includes(userRole);
  const canCreateOrder = userType === "admin" || ["manager"].includes(userRole);
  const canViewOrders = true;

  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });
  const [customersWithOrders, setCustomersWithOrders] = useState(new Set());
  const [expandedRow, setExpandedRow] = useState(null);

  // Status options for orders
  const statusOptions = [
    { value: "pending", label: "Pending", icon: <MdPendingActions />, color: "#f59e0b" },
    { value: "in-progress", label: "In Progress", icon: <MdOutlineLocalShipping />, color: "#3b82f6" },
    { value: "completed", label: "Completed", icon: <FiCheckCircle />, color: "#10b981" }
  ];

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    if (customers.length > 0) {
      const filtered = customers.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        (customer.address && customer.address.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCustomers(filtered);
    }
  }, [searchTerm, customers]);

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getAllCustomers();
      console.log("Customers response:", response);
      
      let customersData = [];
      
      if (response.data && Array.isArray(response.data)) {
        customersData = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        customersData = response.data.data;
      } else if (Array.isArray(response)) {
        customersData = response;
      } else {
        customersData = [];
      }
      
      setCustomers(customersData);
      setFilteredCustomers(customersData);
      
      await checkCustomersOrders(customersData);
      
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError(error.response?.data?.message || error.message || "Failed to fetch customers");
      showToast("Failed to fetch customers", "error");
    } finally {
      setLoading(false);
    }
  };

  const checkCustomersOrders = async (customersData) => {
    try {
      const customersWithOrdersSet = new Set();
      
      await Promise.all(customersData.map(async (customer) => {
        try {
          const response = await getOrdersByCustomer(customer._id);
          let orders = [];
          
          if (response.data && response.data.data && Array.isArray(response.data.data)) {
            orders = response.data.data;
          } else if (response.data && Array.isArray(response.data)) {
            orders = response.data;
          } else if (Array.isArray(response)) {
            orders = response;
          }
          
          if (orders.length > 0) {
            customersWithOrdersSet.add(customer._id);
          }
        } catch (error) {
          console.error(`Error fetching orders for customer ${customer._id}:`, error);
        }
      }));
      
      setCustomersWithOrders(customersWithOrdersSet);
    } catch (error) {
      console.error("Error checking customers orders:", error);
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    try {
      setOrdersLoading(true);
      const response = await getOrdersByCustomer(customerId);
      console.log("Customer orders:", response);
      
      let orders = [];
      
      if (response.data && response.data.data && Array.isArray(response.data.data)) {
        orders = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
        orders = response.data;
      } else if (Array.isArray(response)) {
        orders = response;
      } else {
        orders = [];
      }
      
      setCustomerOrders(orders);
      
      if (orders.length > 0) {
        setCustomersWithOrders(prev => new Set([...prev, customerId]));
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      showToast(error.response?.data?.message || "Failed to fetch orders", "error");
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleEdit = (e, customer) => {
    e.stopPropagation();
    
    if (!canEditCustomer) {
      showToast("You don't have permission to edit customers", "error");
      return;
    }
    
    if (userType === "admin") {
      navigate(`/edit-customer/${customer._id}`, { 
        state: { customerData: customer } 
      });
    } else {
      navigate(`/Role-Add-Customer/${customer._id}`, { 
        state: { customerData: customer } 
      });
    }
  };

  const handleViewOrders = (e, customer) => {
    e.stopPropagation();
    setSelectedCustomer(customer);
    fetchCustomerOrders(customer._id);
    setShowOrdersModal(true);
  };

  const handleViewDetails = (e, customer) => {
    e.stopPropagation();
    navigate(`/Customer-Detail/${customer._id}`);
  };

  const handleCreateOrder = (e, customer) => {
    e.stopPropagation();
    
    if (!canCreateOrder) {
      showToast("You don't have permission to create orders", "error");
      return;
    }
    
    navigate(`/create-new-order/${customer._id}`, { 
      state: { customerData: customer } 
    });
  };

  const handleAddCustomer = () => {
    if (!canAddCustomer) {
      showToast("You don't have permission to add customers", "error");
      return;
    }
    
    if (userType === "admin") {
      navigate("/admin-add-customer");
    } else {
      navigate("/Role-Add-Customer");
    }
  };

  const handleRefresh = () => {
    fetchCustomers();
    setSearchTerm("");
  };

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(s => s.value === status) || statusOptions[0];
    return (
      <span className="order-status-badge" style={{ backgroundColor: statusOption.color + '20', color: statusOption.color }}>
        {statusOption.icon}
        {statusOption.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Rs 0";
    return `Rs ${Number(amount).toLocaleString('en-PK')}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const toggleRowExpand = (customerId) => {
    if (expandedRow === customerId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(customerId);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="main-container-customer-page">
        <Sidebar />
        <div className="content-wrapper-customer-page loading-container-customer-page">
          <div className="loading-spinner-customer-page">
            <FiPackage className="spinner-icon-customer-page" />
            <h2>Loading Customers...</h2>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="main-container-customer-page">
        <Sidebar />
        <div className="content-wrapper-customer-page error-container-customer-page">
          <div className="error-content-customer-page">
            <FiAlertCircle className="error-icon-customer-page" />
            <h2>Error Loading Customers</h2>
            <p>{error}</p>
            <button onClick={handleRefresh} className="refresh-btn-customer-page">
              <MdOutlineRefresh className="btn-icon-customer-page" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container-customer-page">
      <Sidebar />
      
      <div className="content-wrapper-customer-page">
        {/* Toast Message */}
        {toast.show && (
          <div className={`toast-message-customer-page ${toast.type}`}>
            <div className="toast-content-customer-page">
              <span className="toast-text-customer-page">{toast.message}</span>
            </div>
            <button className="toast-close-customer-page" onClick={() => setToast({ show: false })}>×</button>
          </div>
        )}

        {/* User Type Badge */}
        <div className={`user-type-badge ${userType}`}>
          {userType === "admin" ? "👑 Admin Mode" : `👤 ${userRole} Mode`}
        </div>

        {/* Header */}
        <div className="page-header-customer-page">
          <div className="header-title-customer-page">
            <FiUsers className="header-icon-customer-page" />
            <h1>All Customers</h1>
            <span className="customer-count-customer-page">{customers.length}</span>
          </div>
          <div className="header-actions-customer-page">
            <button onClick={handleRefresh} className="refresh-btn-customer-page" title="Refresh">
              <MdOutlineRefresh className="btn-icon-customer-page" />
            </button>
            
            {canAddCustomer && (
              <button 
                className="add-customer-btn-customer-page"
                onClick={handleAddCustomer}
              >
                <FiPlus className="btn-icon-customer-page" />
                Add New Customer
              </button>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="search-section-customer-page">
          <div className="search-wrapper-customer-page">
            <FiSearch className="search-icon-customer-page" />
            <input
              type="text"
              placeholder="Search by name, phone, or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input-customer-page"
            />
            {searchTerm && (
              <button 
                className="clear-search-customer-page"
                onClick={() => setSearchTerm("")}
              >
                <MdOutlineClear />
              </button>
            )}
          </div>
          <div className="search-stats-customer-page">
            <FiFilter className="stats-icon-customer-page" />
            Found {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
          </div>
        </div>

        {/* Customers Table */}
        {filteredCustomers.length === 0 ? (
          <div className="no-customers-customer-page">
            <FaRegUserCircle className="no-data-icon-customer-page" />
            <p>No customers found</p>
            {searchTerm && (
              <button 
                className="clear-search-btn-customer-page"
                onClick={() => setSearchTerm("")}
              >
                <MdOutlineRefresh className="btn-icon-customer-page" />
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="customers-table-container">
            <table className="customers-table">
              <thead>
                <tr>
                  <th className="col-name">Customer Name</th>
                  <th className="col-phone">Phone Number</th>
                  <th className="col-address">Address</th>
                  <th className="col-orders">Orders</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const hasOrders = customersWithOrders.has(customer._id);
                  const isExpanded = expandedRow === customer._id;
                  
                  return (
                    <React.Fragment key={customer._id}>
                      <tr className="customer-row" onClick={() => toggleRowExpand(customer._id)}>
                        <td className="col-name">
                          <div className="customer-name-cell">
                            <div className="customer-avatar-table">
                              {customer.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div className="customer-name-info">
                              <span className="customer-name">{customer.name || 'Unknown'}</span>
                              <span className="customer-id">ID: {customer._id?.slice(-6) || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="col-phone">
                          <div className="phone-cell">
                            <BsTelephone className="cell-icon" />
                            <span>{customer.phone || 'N/A'}</span>
                          </div>
                        </td>
                        <td className="col-address">
                          <div className="address-cell">
                            <BsGeoAlt className="cell-icon" />
                            <span>{customer.address || "Not provided"}</span>
                          </div>
                        </td>
                        <td className="col-orders">
                          <div className="orders-count-cell">
                            <FiPackage className="cell-icon" />
                            <span>{hasOrders ? 'Has Orders' : 'No Orders'}</span>
                          </div>
                        </td>
                        <td className="col-actions">
                          <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                            {canEditCustomer && (
                              <button
                                className="action-btn-table edit-btn"
                                onClick={(e) => handleEdit(e, customer)}
                                title="Edit Customer"
                              >
                                <FiEdit2 />
                              </button>
                            )}
                            
                            <button
                              className="action-btn-table orders-btn"
                              onClick={(e) => handleViewOrders(e, customer)}
                              title="View Orders"
                            >
                              <FiPackage />
                            </button>
                            
                            {hasOrders ? (
                              <button
                                className="action-btn-table details-btn"
                                onClick={(e) => handleViewDetails(e, customer)}
                                title="View Details"
                              >
                                <FiEye />
                              </button>
                            ) : (
                              canCreateOrder && (
                                <button
                                  className="action-btn-table order-btn"
                                  onClick={(e) => handleCreateOrder(e, customer)}
                                  title="New Order"
                                >
                                  <FiShoppingBag />
                                </button>
                              )
                            )}
                          </div>
                        </td>
                      </tr>
                      
                      {/* Expanded Row for Orders Preview */}
                      {isExpanded && hasOrders && (
                        <tr className="orders-preview-row">
                          <td colSpan="5">
                            <div className="orders-preview-container">
                              <div className="orders-preview-header">
                                <FiPackage className="preview-icon" />
                                <h4>Recent Orders</h4>
                                <button 
                                  className="view-all-orders-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleViewOrders(e, customer);
                                  }}
                                >
                                  View All Orders
                                </button>
                              </div>
                              <div className="orders-preview-list">
                                {customerOrders.slice(0, 3).map((order) => (
                                  <div key={order._id} className="order-preview-item">
                                    <div className="order-preview-info">
                                      <span className="order-bill">{order.billNumber}</span>
                                      <span className="order-date">{formatDate(order.date)}</span>
                                      {getStatusBadge(order.status || 'pending')}
                                    </div>
                                    <div className="order-preview-amount">
                                      <span className="order-total">{formatCurrency(order.finalTotal)}</span>
                                      {order.advancePayment > 0 && (
                                        <span className="order-advance">Adv: {formatCurrency(order.advancePayment)}</span>
                                      )}
                                    </div>
                                  </div>
                                ))}
                                {customerOrders.length > 3 && (
                                  <div className="more-orders-indicator">
                                    +{customerOrders.length - 3} more orders
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* View Orders Modal */}
        {showOrdersModal && selectedCustomer && (
          <div className="modal-overlay-customer-page" onClick={() => setShowOrdersModal(false)}>
            <div className="modal-content-customer-page orders-modal-customer-page" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-customer-page">
                <div className="modal-header-title-customer-page">
                  <FiPackage className="modal-icon-customer-page" />
                  <h2>Customer Orders</h2>
                </div>
                <button className="close-modal-customer-page" onClick={() => setShowOrdersModal(false)}>
                  <FiX />
                </button>
              </div>

              <div className="modal-body-customer-page">
                <div className="selected-customer-info-customer-page">
                  <BsPersonCircle className="customer-modal-icon-customer-page" />
                  <div className="customer-modal-details-customer-page">
                    <h3>{selectedCustomer.name}</h3>
                    <p><BsTelephone className="detail-icon-customer-page" /> {selectedCustomer.phone}</p>
                  </div>
                </div>

                {ordersLoading ? (
                  <div className="orders-loading-customer-page">
                    <FiPackage className="spinner-icon-customer-page" />
                    <p>Loading orders...</p>
                  </div>
                ) : customerOrders.length === 0 ? (
                  <div className="no-orders-customer-page">
                    <FiPackage className="no-data-icon-customer-page" />
                    <p>No orders found for this customer</p>
                    {canCreateOrder && (
                      <button 
                        className="create-order-btn-customer-page"
                        onClick={() => {
                          setShowOrdersModal(false);
                          handleCreateOrder(null, selectedCustomer);
                        }}
                      >
                        <FiShoppingBag />
                        Create First Order
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="orders-list-customer-page">
                    {customerOrders.map((order) => (
                      <div key={order._id} className="order-item-customer-page">
                        <div className="order-header-customer-page">
                          <span className="order-bill-customer-page">{order.billNumber}</span>
                          <span className="order-date-customer-page">{formatDate(order.date)}</span>
                          {getStatusBadge(order.status || 'pending')}
                        </div>
                        {order.items && order.items.length > 0 && (
                          <div className="order-items-preview-customer-page">
                            {order.items.slice(0, 2).map((item, idx) => (
                              <span key={idx} className="order-item-preview">
                                {item.quantity}x {item.itemName}
                              </span>
                            ))}
                            {order.items.length > 2 && (
                              <span className="order-item-preview">+{order.items.length - 2} more</span>
                            )}
                          </div>
                        )}
                        <div className="order-footer-customer-page">
                          <div className="payment-info-customer-page">
                            <span className="order-total-customer-page">{formatCurrency(order.finalTotal)}</span>
                            {order.advancePayment > 0 && (
                              <span className="advance-badge-customer-page">Adv: {formatCurrency(order.advancePayment)}</span>
                            )}
                          </div>
                          <button 
                            className="view-order-btn-customer-page"
                            onClick={() => navigate(`/customer-orders/${order._id}`)}
                          >
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="modal-footer-customer-page">
                <button 
                  className="cancel-btn-customer-page"
                  onClick={() => setShowOrdersModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCustomer;