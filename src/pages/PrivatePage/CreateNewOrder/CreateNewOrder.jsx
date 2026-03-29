// src/pages/PrivatePage/CreateNewOrder/CreateNewOrder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { 
  FiShoppingBag, FiX, FiPlus, FiTrash2, 
  FiPackage, FiClock, FiCalendar, FiDollarSign,
  FiChevronDown, FiAlertCircle, FiEdit2, FiSave, FiFileText
} from "react-icons/fi";
import { BsCurrencyRupee, BsWallet2, BsCalendar2Date, BsTelephone, BsGeoAlt } from "react-icons/bs";
import { MdPendingActions, MdOutlineLocalShipping } from "react-icons/md";
import { FiCheckCircle } from "react-icons/fi";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { createOrder } from "../../../api/orderApi";
import { fetchJobsByCustomer } from "../../../api/jobApi";
import { getCustomerById } from "../../../api/customerApi";
import "./CreateNewOrder.css";

const CreateNewOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId } = useParams();
  const customerFromState = location.state?.customerData;

  // Customer state
  const [customer, setCustomer] = useState(null);
  const [loadingCustomer, setLoadingCustomer] = useState(false);

  // Work Items State
  const [works, setWorks] = useState([]);
  
  // Current Work Form
  const [currentWork, setCurrentWork] = useState({
    name: "",
    qty: 1,
    rate: 0,
    total: 0,
    notes: ""
  });
  
  // Edit Mode States
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingWork, setEditingWork] = useState(null);
  
  const [orderData, setOrderData] = useState({
    finalTotal: 0,
    advancePayment: 0,
    remainingBalance: 0,
    status: "pending",
    dueDate: "",
    notes: ""
  });
  
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  const statusOptions = [
    { value: "pending", label: "Pending", icon: <MdPendingActions />, color: "#f59e0b" },
    { value: "in-progress", label: "In Progress", icon: <MdOutlineLocalShipping />, color: "#3b82f6" },
    { value: "completed", label: "Completed", icon: <FiCheckCircle />, color: "#10b981" }
  ];

  const selectedStatus = statusOptions.find(s => s.value === orderData.status) || statusOptions[0];

  // Load customer data and previous works on mount
  useEffect(() => {
    loadCustomerData();
  }, [customerId, customerFromState]);

  // Calculate remaining balance when finalTotal or advancePayment changes
  useEffect(() => {
    const finalTotal = parseInt(orderData.finalTotal) || 0;
    const advancePayment = parseInt(orderData.advancePayment) || 0;
    setOrderData(prev => ({
      ...prev,
      remainingBalance: finalTotal - advancePayment
    }));
  }, [orderData.finalTotal, orderData.advancePayment]);

  // Calculate current work total
  useEffect(() => {
    const qty = parseInt(currentWork.qty) || 0;
    const rate = parseInt(currentWork.rate) || 0;
    const total = qty * rate;
    setCurrentWork(prev => ({ ...prev, total }));
  }, [currentWork.qty, currentWork.rate]);

  const loadCustomerData = async () => {
    try {
      let customerData = null;
      
      if (customerFromState && customerFromState._id) {
        customerData = customerFromState;
      } else if (customerId) {
        setLoadingCustomer(true);
        const response = await getCustomerById(customerId);
        
        if (response?.data?.customer) {
          customerData = response.data.customer;
        } else if (response?.customer) {
          customerData = response.customer;
        } else if (response?.data) {
          customerData = response.data;
        } else {
          customerData = response;
        }
      }
      
      if (customerData) {
        setCustomer(customerData);
        await loadPreviousWorks(customerData._id);
      }
      
    } catch (error) {
      console.error("Error loading customer:", error);
      showToast("Failed to load customer information", "error");
    } finally {
      setLoadingCustomer(false);
    }
  };

  const loadPreviousWorks = async (custId) => {
    try {
      const response = await fetchJobsByCustomer(custId);
      console.log("Previous jobs response:", response);
      
      let jobs = [];
      if (response?.data?.data) {
        jobs = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        jobs = response.data;
      } else if (Array.isArray(response)) {
        jobs = response;
      } else if (response?.data) {
        jobs = response.data;
      }
      
      // Extract works from previous jobs
      const previousWorks = [];
      jobs.forEach(job => {
        if (job.works && job.works.length > 0) {
          job.works.forEach(work => {
            let qty = parseInt(work.qty) || 1;
            let total = 0;
            let rate = 0;
            
            if (work.materials && work.materials.length > 0) {
              total = work.materials.reduce((sum, mat) => {
                return sum + ((parseInt(mat.qty) || 1) * (parseInt(mat.rate) || 0));
              }, 0);
              rate = total / qty;
            } else if (work.total) {
              total = parseInt(work.total) || 0;
              rate = total / qty;
            } else if (job.estimatedAmounts) {
              total = parseInt(job.estimatedAmounts.medium) || 0;
              rate = total / qty;
            }
            
            previousWorks.push({
              id: Date.now() + Math.random() * 1000,
              name: work.name || "Work Item",
              qty: qty,
              rate: Math.floor(rate), // Convert to integer
              total: total,
              notes: work.description || ""
            });
          });
        }
      });
      
      if (previousWorks.length > 0) {
        setWorks(previousWorks);
        showToast(`${previousWorks.length} previous work${previousWorks.length !== 1 ? 's' : ''} loaded`, "info");
      }
      
    } catch (error) {
      console.error("Error loading previous works:", error);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Function to remove decimal points and keep only integers
  const getIntegerValue = (value) => {
    // Remove any decimal part and convert to integer
    const num = parseInt(value);
    return isNaN(num) ? 0 : num;
  };

  // Add new work
  const addWork = () => {
    if (!currentWork.name.trim()) {
      showToast("Please enter work name", "error");
      return;
    }
    
    const qty = parseInt(currentWork.qty) || 1;
    const rate = parseInt(currentWork.rate) || 0;
    
    if (qty <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }
    
    if (rate <= 0) {
      showToast("Rate must be greater than 0", "error");
      return;
    }
    
    const total = qty * rate;
    
    const newWork = {
      id: Date.now(),
      name: currentWork.name,
      qty: qty,
      rate: rate,
      total: total,
      notes: currentWork.notes || ""
    };
    
    setWorks([...works, newWork]);
    
    // Reset form
    setCurrentWork({
      name: "",
      qty: 1,
      rate: 0,
      total: 0,
      notes: ""
    });
    
    showToast("Work added successfully", "success");
  };

  // Remove work
  const removeWork = (index) => {
    const updatedWorks = works.filter((_, i) => i !== index);
    setWorks(updatedWorks);
    showToast("Work removed", "success");
  };

  // Start editing work
  const startEditing = (index) => {
    const work = works[index];
    setEditingIndex(index);
    setEditingWork({ ...work });
  };

  // Save edited work
  const saveEditing = () => {
    if (!editingWork.name.trim()) {
      showToast("Please enter work name", "error");
      return;
    }
    
    const qty = parseInt(editingWork.qty) || 1;
    const rate = parseInt(editingWork.rate) || 0;
    
    if (qty <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }
    
    if (rate <= 0) {
      showToast("Rate must be greater than 0", "error");
      return;
    }
    
    const total = qty * rate;
    const updatedWork = { ...editingWork, qty, rate, total };
    
    const updatedWorks = [...works];
    updatedWorks[editingIndex] = updatedWork;
    
    setWorks(updatedWorks);
    setEditingIndex(null);
    setEditingWork(null);
    showToast("Work updated successfully", "success");
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingWork(null);
  };

  const handleCurrentWorkChange = (e) => {
    const { name, value } = e.target;
    if (name === "qty" || name === "rate") {
      // Remove any decimal points and convert to integer
      const intValue = parseInt(value);
      const cleanValue = isNaN(intValue) ? 0 : intValue;
      setCurrentWork(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setCurrentWork(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditingWorkChange = (e) => {
    const { name, value } = e.target;
    if (name === "qty" || name === "rate") {
      const intValue = parseInt(value);
      const cleanValue = isNaN(intValue) ? 0 : intValue;
      setEditingWork(prev => ({ ...prev, [name]: cleanValue }));
    } else {
      setEditingWork(prev => ({ ...prev, [name]: value }));
    }
  };

  // Handle final total change - only integers allowed
  const handleFinalTotalChange = (value) => {
    const finalTotal = parseInt(value) || 0;
    const advancePayment = parseInt(orderData.advancePayment) || 0;
    setOrderData(prev => ({
      ...prev,
      finalTotal: finalTotal,
      remainingBalance: finalTotal - advancePayment
    }));
  };

  // Handle advance payment change - only integers allowed
  const handleAdvanceChange = (value) => {
    const advance = parseInt(value) || 0;
    const finalTotal = parseInt(orderData.finalTotal) || 0;
    setOrderData(prev => ({
      ...prev,
      advancePayment: advance,
      remainingBalance: finalTotal - advance
    }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "finalTotal") {
      handleFinalTotalChange(value);
    } else if (name === "advancePayment") {
      handleAdvanceChange(value);
    } else if (name === "dueDate") {
      setOrderData({ ...orderData, dueDate: value });
    } else if (name === "notes") {
      setOrderData({ ...orderData, notes: value });
    }
  };

  const handleStatusSelect = (statusValue) => {
    setOrderData(prev => ({ ...prev, status: statusValue }));
    setIsStatusDropdownOpen(false);
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Rs 0";
    return `Rs ${Number(amount).toLocaleString('en-PK')}`;
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const validateWorks = () => {
    if (works.length === 0) {
      showToast("Please add at least one work to the order", "error");
      return false;
    }
    
    for (let i = 0; i < works.length; i++) {
      const work = works[i];
      if (!work.name.trim()) {
        showToast(`Work ${i + 1}: Please enter work name`, "error");
        return false;
      }
      if (work.qty <= 0) {
        showToast(`Work ${i + 1}: Quantity must be greater than 0`, "error");
        return false;
      }
      if (work.rate <= 0) {
        showToast(`Work ${i + 1}: Rate must be greater than 0`, "error");
        return false;
      }
    }
    return true;
  };

  const validateOrder = () => {
    const finalTotal = parseInt(orderData.finalTotal) || 0;
    const advancePayment = parseInt(orderData.advancePayment) || 0;
    
    if (finalTotal <= 0) {
      showToast("Please enter a valid final total amount", "error");
      return false;
    }
    
    if (advancePayment > finalTotal) {
      showToast("Advance payment cannot be greater than final total", "error");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!customer?._id) {
      showToast("Customer information is missing", "error");
      return;
    }

    if (!validateWorks()) {
      return;
    }

    if (!validateOrder()) {
      return;
    }

    try {
      setLoading(true);
      
      const finalTotal = parseInt(orderData.finalTotal) || 0;
      const advancePayment = parseInt(orderData.advancePayment) || 0;
      
      const orderPayload = {
        customer: customer._id,
        items: works.map(work => ({
          itemName: work.name,
          quantity: work.qty,
          unitPrice: work.rate,
          totalPrice: work.total,
          notes: work.notes || ''
        })),
        finalTotal: finalTotal,
        advancePayment: advancePayment,
        status: orderData.status,
        dueDate: orderData.dueDate || null,
        notes: orderData.notes || ''
      };

      console.log("Creating order with payload:", orderPayload);
      
      const response = await createOrder(orderPayload);
      console.log("Order created:", response.data);
      
      showToast("Order created successfully!", "success");
      
      setTimeout(() => {
        navigate("/admin-all-customer");
      }, 2000);
      
    } catch (error) {
      console.error("Error creating order:", error);
      const errorMessage = error.response?.data?.message || error.message || "Error creating order";
      showToast(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loadingCustomer) {
    return (
      <div className="main-container-create-order">
        <Sidebar />
        <div className="content-wrapper-create-order">
          <div className="loading-container-create-order">
            <FiPackage className="spinning" />
            <p>Loading customer information...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="main-container-create-order">
        <Sidebar />
        <div className="content-wrapper-create-order">
          <div className="error-container-create-order">
            <FiAlertCircle className="error-icon-create-order" />
            <h2>No Customer Selected</h2>
            <p>Please select a customer from the customers page to create an order.</p>
            <button onClick={() => navigate("/admin-all-customer")} className="back-btn-create-order">
              Go Back to Customers
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container-create-order">
      <Sidebar />
      
      <div className="content-wrapper-create-order">
        {/* Toast Message */}
        {toast.show && (
          <div className={`toast-message-create-order ${toast.type}`}>
            <div className="toast-content-create-order">
              <span className="toast-text-create-order">{toast.message}</span>
            </div>
            <button className="toast-close-create-order" onClick={() => setToast({ show: false })}>×</button>
          </div>
        )}

        <div className="add-order-card-create-order">
          {/* Header */}
          <div className="add-order-header-create-order">
            <div className="add-order-title-create-order">
              <FiShoppingBag className="header-icon-create-order" />
              <h1>Create New Order</h1>
            </div>
            <button className="back-btn-create-order" onClick={() => navigate("/admin-all-customer")}>
              Back to Customers
            </button>
          </div>

          {/* Customer Information Section */}
          <div className="section-card-create-order">
            <h2 className="section-title-create-order">
              <span className="section-icon-create-order">👤</span>
              Customer Information
            </h2>
            <div className="customer-info-display-create-order">
              <div className="customer-avatar-create-order">
                {customer.name?.charAt(0).toUpperCase()}
              </div>
              <div className="customer-details-create-order">
                <h3>{customer.name}</h3>
                <p><BsTelephone className="info-icon" /> {customer.phone}</p>
                {customer.address && <p><BsGeoAlt className="info-icon" /> {customer.address}</p>}
              </div>
            </div>
          </div>

          {/* Add New Work Section */}
          <div className="section-card-create-order">
            <h2 className="section-title-create-order">
              <span className="section-icon-create-order">➕</span>
              Add New Work
            </h2>
            
            <div className="add-work-form-create-order">
              <div className="form-group-create-order">
                <input
                  type="text"
                  name="name"
                  value={currentWork.name}
                  onChange={handleCurrentWorkChange}
                  placeholder="Work name (e.g., Welding Gate, Steel Frame)"
                  className="work-name-input-create-order"
                />
              </div>
              <div className="form-group-create-order">
                <input
                  type="number"
                  name="qty"
                  value={currentWork.qty}
                  onChange={handleCurrentWorkChange}
                  placeholder="Quantity"
                  min="1"
                  step="1"
                  className="work-qty-input-create-order"
                />
              </div>
              <div className="form-group-create-order">
                <input
                  type="number"
                  name="rate"
                  value={currentWork.rate}
                  onChange={handleCurrentWorkChange}
                  placeholder="Rate (Rs)"
                  min="0"
                  step="1"
                  className="work-rate-input-create-order"
                />
              </div>
              <div className="form-group-create-order">
                <input
                  type="text"
                  name="notes"
                  value={currentWork.notes}
                  onChange={handleCurrentWorkChange}
                  placeholder="Notes (optional)"
                  className="work-notes-input-create-order"
                />
              </div>
              <button onClick={addWork} className="add-work-btn-create-order">
                <FiPlus /> Add Work
              </button>
            </div>
            
            <div className="work-preview">
              {currentWork.name && currentWork.rate > 0 && (
                <div className="current-work-total">
                  <strong>Preview:</strong> {currentWork.name} | Qty: {currentWork.qty} × Rs {currentWork.rate} = {formatCurrency(currentWork.total)}
                </div>
              )}
            </div>
          </div>

          {/* Works List Section */}
          <div className="section-card-create-order">
            <h2 className="section-title-create-order">
              <span className="section-icon-create-order">🔧</span>
              Works List
              {works.length > 0 && (
                <span className="works-count-badge">{works.length} Work{works.length !== 1 ? 's' : ''}</span>
              )}
            </h2>

            {works.length === 0 ? (
              <div className="empty-works-create-order">
                <FiPackage className="empty-icon" />
                <p>No works added yet.</p>
                <small>Add works from above form</small>
              </div>
            ) : (
              <div className="works-list-container-create-order">
                {works.map((work, index) => (
                  <div key={work.id || index} className="work-card-create-order">
                    {editingIndex === index ? (
                      <div className="edit-work-mode">
                        <div className="edit-work-form">
                          <input
                            type="text"
                            name="name"
                            value={editingWork.name}
                            onChange={handleEditingWorkChange}
                            placeholder="Work name"
                            className="edit-work-name"
                          />
                          <input
                            type="number"
                            name="qty"
                            value={editingWork.qty}
                            onChange={handleEditingWorkChange}
                            min="1"
                            step="1"
                            className="edit-work-qty"
                          />
                          <input
                            type="number"
                            name="rate"
                            value={editingWork.rate}
                            onChange={handleEditingWorkChange}
                            min="0"
                            step="1"
                            className="edit-work-rate"
                          />
                          <input
                            type="text"
                            name="notes"
                            value={editingWork.notes || ''}
                            onChange={handleEditingWorkChange}
                            placeholder="Notes"
                            className="edit-work-notes"
                          />
                          <div className="edit-actions">
                            <button onClick={saveEditing} className="save-edit-btn">
                              <FiSave /> Save
                            </button>
                            <button onClick={cancelEditing} className="cancel-edit-btn">
                              <FiX /> Cancel
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="work-header">
                          <div className="work-info">
                            <span className="work-name">{work.name}</span>
                            {work.notes && <span className="work-notes-preview">({work.notes})</span>}
                          </div>
                          <div className="work-actions">
                            <button onClick={() => startEditing(index)} className="edit-work-btn" title="Edit work">
                              <FiEdit2 />
                            </button>
                            <button onClick={() => removeWork(index)} className="remove-work-btn" title="Remove work">
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                        <div className="work-details">
                          <span className="work-qty">Qty: {work.qty}</span>
                          <span className="work-rate">× Rs {work.rate}</span>
                          <span className="work-total">= {formatCurrency(work.total)}</span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Details Section */}
          <div className="section-card-create-order">
            <h2 className="section-title-create-order">
              <span className="section-icon-create-order">💰</span>
              Payment Details
            </h2>
            
            <div className="order-details-grid-create-order">
              {/* Final Total - Manual Entry (No Decimals) */}
              <div className="form-group-create-order">
                <label>
                  <FiDollarSign className="input-icon" />
                  Final Total (Rs) <span className="required">*</span>
                </label>
                <input
                  type="number"
                  name="finalTotal"
                  value={orderData.finalTotal}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  placeholder="Enter final total amount (whole numbers only)"
                  className="final-total-input-create-order"
                />
                <small className="field-hint">Enter whole numbers only (no decimals)</small>
              </div>

              {/* Advance Payment - No Decimals */}
              <div className="form-group-create-order">
                <label>
                  <BsWallet2 className="input-icon" />
                  Advance Payment (Rs)
                </label>
                <input
                  type="number"
                  name="advancePayment"
                  value={orderData.advancePayment}
                  onChange={handleInputChange}
                  min="0"
                  max={orderData.finalTotal}
                  step="1"
                  placeholder="Enter advance payment amount"
                  className="advance-input-create-order"
                />
                <small className="field-hint">Whole numbers only (no decimals)</small>
              </div>

              {/* Remaining Balance - Auto Calculated */}
              <div className="form-group-create-order">
                <label>
                  <BsCurrencyRupee className="input-icon" />
                  Remaining Balance (Rs)
                </label>
                <input
                  type="text"
                  value={formatCurrency(orderData.remainingBalance)}
                  readOnly
                  className={`remaining-balance-display ${orderData.remainingBalance === 0 ? 'paid' : 'pending'}`}
                  disabled
                />
              </div>

              {/* Payment Status - Auto Calculated */}
              <div className="form-group-create-order">
                <label>Payment Status</label>
                <div className={`payment-status-display ${orderData.advancePayment >= orderData.finalTotal ? 'paid' : orderData.advancePayment > 0 ? 'partial' : 'pending'}`}>
                  {orderData.advancePayment >= orderData.finalTotal ? (
                    <><FiCheckCircle /> Fully Paid</>
                  ) : orderData.advancePayment > 0 ? (
                    <><FiClock /> Partially Paid</>
                  ) : (
                    <><FiAlertCircle /> Pending</>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Order Status & Notes Section */}
          <div className="section-card-create-order">
            <h2 className="section-title-create-order">
              <span className="section-icon-create-order">📋</span>
              Order Status & Notes
            </h2>
            
            <div className="order-details-grid-create-order">
              <div className="form-group-create-order">
                <label>Order Status *</label>
                <div className="custom-status-select-create-order">
                  <div 
                    className={`selected-status-create-order ${isStatusDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  >
                    <span className="selected-status-content" style={{ color: selectedStatus.color }}>
                      {selectedStatus.icon}
                      <span>{selectedStatus.label}</span>
                    </span>
                    <FiChevronDown className={`dropdown-arrow ${isStatusDropdownOpen ? 'rotate' : ''}`} />
                  </div>
                  {isStatusDropdownOpen && (
                    <div className="status-dropdown-create-order">
                      {statusOptions.map(option => (
                        <div
                          key={option.value}
                          className={`status-option ${orderData.status === option.value ? 'selected' : ''}`}
                          onClick={() => handleStatusSelect(option.value)}
                        >
                          <span style={{ color: option.color }}>{option.icon}</span>
                          <span>{option.label}</span>
                          {orderData.status === option.value && <FiCheckCircle className="check-icon" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group-create-order">
                <label>Due Date (Optional)</label>
                <input
                  type="date"
                  name="dueDate"
                  value={orderData.dueDate}
                  onChange={handleInputChange}
                  min={formatDateForInput(new Date())}
                  className="date-input-create-order"
                />
              </div>

              <div className="form-group-create-order full-width">
                <label>Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={orderData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this order..."
                  rows="3"
                  className="notes-input-create-order"
                />
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="grand-total-card-create-order">
            <div className="grand-total-content-create-order">
              <span className="grand-total-label-create-order">Grand Total</span>
              <span className="grand-total-amount-create-order">{formatCurrency(orderData.finalTotal)}</span>
            </div>
            
            {orderData.advancePayment > 0 && (
              <div className="payment-breakdown-create-order">
                <div className="breakdown-item">
                  <span>Advance Payment:</span>
                  <span className="advance-amount">{formatCurrency(orderData.advancePayment)}</span>
                </div>
                <div className="breakdown-item total-row">
                  <span>Remaining Balance:</span>
                  <span className={`remaining-amount ${orderData.remainingBalance === 0 ? 'paid' : 'pending'}`}>
                    {formatCurrency(orderData.remainingBalance)}
                  </span>
                </div>
              </div>
            )}
            
            {orderData.dueDate && (
              <div className="due-date-display">
                <BsCalendar2Date className="due-icon" />
                <span>Due Date: {new Date(orderData.dueDate).toLocaleDateString('en-PK')}</span>
              </div>
            )}
          </div>

          {/* Create Order Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="save-order-btn-create-order"
            disabled={loading || works.length === 0 || orderData.finalTotal <= 0}
          >
            {loading ? (
              <>
                <FiPackage className="spinning" />
                Creating Order...
              </>
            ) : (
              <>
                <FiShoppingBag />
                Create Order
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateNewOrder;