// src/pages/PrivatePage/CreateQuotationOrder/CreateQuotationOrder.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FiShoppingBag, FiX, FiPackage, FiCalendar, FiDollarSign,
  FiChevronDown, FiAlertCircle, FiCheckCircle, FiClock,
  FiFileText, FiUser, FiPhone, FiMapPin, FiPlus, FiTrash2, FiEdit2
} from "react-icons/fi";
import { BsCurrencyRupee, BsWallet2, BsCalendar2Date } from "react-icons/bs";
import { MdPendingActions, MdOutlineLocalShipping } from "react-icons/md";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { createOrderFromQuotation } from "../../../api/orderApi";
import "./CreateQuotationOrder.css";

const CreateQuotationOrder = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const quotationData = location.state?.quotationData;
  const isFromQuotation = location.state?.isFromQuotation;

  // Order Items State (combines quotation items + new added items)
  const [orderItems, setOrderItems] = useState([]);
  
  // New Item Form
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1,
    rate: 0,
    total: 0,
    notes: ""
  });
  
  // Edit Mode
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  
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
  const [showAddItemForm, setShowAddItemForm] = useState(false);

  const statusOptions = [
    { value: "pending", label: "Pending", icon: <MdPendingActions />, color: "#f59e0b" },
    { value: "in-progress", label: "In Progress", icon: <MdOutlineLocalShipping />, color: "#3b82f6" },
    { value: "completed", label: "Completed", icon: <FiCheckCircle />, color: "#10b981" }
  ];

  const selectedStatus = statusOptions.find(s => s.value === orderData.status) || statusOptions[0];

  // Load quotation items on mount
  useEffect(() => {
    if (isFromQuotation && quotationData) {
      loadQuotationItems();
    }
  }, []);

  // Calculate remaining balance
  useEffect(() => {
    const finalTotal = parseInt(orderData.finalTotal) || 0;
    const advancePayment = parseInt(orderData.advancePayment) || 0;
    setOrderData(prev => ({
      ...prev,
      remainingBalance: finalTotal - advancePayment
    }));
  }, [orderData.finalTotal, orderData.advancePayment]);

  // Calculate new item total
  useEffect(() => {
    const total = (parseInt(newItem.quantity) || 0) * (parseInt(newItem.rate) || 0);
    setNewItem(prev => ({ ...prev, total }));
  }, [newItem.quantity, newItem.rate]);

  // Load items from quotation
  const loadQuotationItems = () => {
    const items = [];
    
    if (quotationData.items && quotationData.items.length > 0) {
      quotationData.items.forEach((item, index) => {
        if (item.materials && item.materials.length > 0) {
          item.materials.forEach((material, matIndex) => {
            items.push({
              id: `quotation_${index}_${matIndex}`,
              name: material.name || item.title || 'Material',
              quantity: material.quantity || 1,
              rate: material.pricePerUnit || 0,
              total: material.totalPrice || 0,
              notes: item.notes || '',
              source: 'quotation'
            });
          });
        } else {
          items.push({
            id: `quotation_${index}`,
            name: item.title || 'Work Item',
            quantity: 1,
            rate: item.subtotal || 0,
            total: item.subtotal || 0,
            notes: item.notes || '',
            source: 'quotation'
          });
        }
      });
    }
    
    setOrderItems(items);
    
    // Set final total from quotation grand total
    if (quotationData.grandTotal) {
      setOrderData(prev => ({
        ...prev,
        finalTotal: quotationData.grandTotal
      }));
    }
    
    // Set notes
    if (quotationData.notes) {
      setOrderData(prev => ({
        ...prev,
        notes: `From Quotation: ${quotationData.quotationNumber || 'N/A'}\n${quotationData.notes}`
      }));
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  // Add new item to order
  const addNewItem = () => {
    if (!newItem.name.trim()) {
      showToast("Please enter item name", "error");
      return;
    }
    
    const quantity = parseInt(newItem.quantity) || 1;
    const rate = parseInt(newItem.rate) || 0;
    
    if (quantity <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }
    
    if (rate <= 0) {
      showToast("Rate must be greater than 0", "error");
      return;
    }
    
    const total = quantity * rate;
    
    const itemToAdd = {
      id: `new_${Date.now()}`,
      name: newItem.name,
      quantity: quantity,
      rate: rate,
      total: total,
      notes: newItem.notes || '',
      source: 'new'
    };
    
    setOrderItems([...orderItems, itemToAdd]);
    
    // Update final total
    const newFinalTotal = (parseInt(orderData.finalTotal) || 0) + total;
    setOrderData(prev => ({
      ...prev,
      finalTotal: newFinalTotal
    }));
    
    // Reset form
    setNewItem({
      name: "",
      quantity: 1,
      rate: 0,
      total: 0,
      notes: ""
    });
    setShowAddItemForm(false);
    
    showToast("Item added successfully", "success");
  };

  // Remove item
  const removeItem = (index) => {
    const itemToRemove = orderItems[index];
    const removedTotal = itemToRemove.total || 0;
    
    const updatedItems = orderItems.filter((_, i) => i !== index);
    setOrderItems(updatedItems);
    
    // Update final total
    const newFinalTotal = (parseInt(orderData.finalTotal) || 0) - removedTotal;
    setOrderData(prev => ({
      ...prev,
      finalTotal: newFinalTotal > 0 ? newFinalTotal : 0
    }));
    
    showToast("Item removed", "success");
  };

  // Start editing item
  const startEditing = (index) => {
    const item = orderItems[index];
    setEditingIndex(index);
    setEditingItem({ ...item });
  };

  // Save edited item
  const saveEditing = () => {
    if (!editingItem.name.trim()) {
      showToast("Please enter item name", "error");
      return;
    }
    
    const quantity = parseInt(editingItem.quantity) || 1;
    const rate = parseInt(editingItem.rate) || 0;
    
    if (quantity <= 0) {
      showToast("Quantity must be greater than 0", "error");
      return;
    }
    
    if (rate <= 0) {
      showToast("Rate must be greater than 0", "error");
      return;
    }
    
    const oldTotal = orderItems[editingIndex].total;
    const newTotal = quantity * rate;
    
    const updatedItem = { ...editingItem, quantity, rate, total: newTotal };
    const updatedItems = [...orderItems];
    updatedItems[editingIndex] = updatedItem;
    
    setOrderItems(updatedItems);
    
    // Update final total
    const totalDiff = newTotal - oldTotal;
    const newFinalTotal = (parseInt(orderData.finalTotal) || 0) + totalDiff;
    setOrderData(prev => ({
      ...prev,
      finalTotal: newFinalTotal > 0 ? newFinalTotal : 0
    }));
    
    setEditingIndex(null);
    setEditingItem(null);
    showToast("Item updated successfully", "success");
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingIndex(null);
    setEditingItem(null);
  };

  const handleNewItemChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity" || name === "rate") {
      const intValue = parseInt(value);
      setNewItem(prev => ({ ...prev, [name]: isNaN(intValue) ? 0 : intValue }));
    } else {
      setNewItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleEditingItemChange = (e) => {
    const { name, value } = e.target;
    if (name === "quantity" || name === "rate") {
      const intValue = parseInt(value);
      setEditingItem(prev => ({ ...prev, [name]: isNaN(intValue) ? 0 : intValue }));
    } else {
      setEditingItem(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "finalTotal") {
      const finalTotal = parseInt(value) || 0;
      setOrderData(prev => ({
        ...prev,
        finalTotal: finalTotal,
        remainingBalance: finalTotal - (prev.advancePayment || 0)
      }));
    } else if (name === "advancePayment") {
      const advance = parseInt(value) || 0;
      setOrderData(prev => ({
        ...prev,
        advancePayment: advance,
        remainingBalance: (prev.finalTotal || 0) - advance
      }));
    } else if (name === "dueDate") {
      setOrderData(prev => ({ ...prev, dueDate: value }));
    } else if (name === "notes") {
      setOrderData(prev => ({ ...prev, notes: value }));
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const validateOrder = () => {
    if (orderItems.length === 0) {
      showToast("Please add at least one item to the order", "error");
      return false;
    }
    
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
    if (!quotationData?._id) {
      showToast("Quotation information is missing", "error");
      return;
    }

    if (!validateOrder()) {
      return;
    }

    try {
      setLoading(true);
      
      const finalTotal = parseInt(orderData.finalTotal) || 0;
      const advancePayment = parseInt(orderData.advancePayment) || 0;
      
      // Prepare order items (combines quotation items + new items)
      const orderItemsPayload = orderItems.map(item => ({
        itemName: item.name,
        quantity: item.quantity,
        unitPrice: item.rate,
        totalPrice: item.total,
        notes: item.notes || ''
      }));
      
      const orderPayload = {
        quotationId: quotationData._id,
        finalTotal: finalTotal,
        advancePayment: advancePayment,
        dueDate: orderData.dueDate || null,
        notes: orderData.notes || `Order created from Quotation: ${quotationData.quotationNumber || 'N/A'}`,
        status: orderData.status,
        items: orderItemsPayload
      };

      console.log("Creating order from quotation with items:", orderPayload);
      
      // ✅ Use createOrderFromQuotation API
      const response = await createOrderFromQuotation(orderPayload);
      console.log("Order created:", response);
      
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

  if (!quotationData) {
    return (
      <div className="main-container-quotation-order">
        <Sidebar />
        <div className="content-wrapper-quotation-order">
          <div className="error-container-quotation-order">
            <FiAlertCircle className="error-icon-quotation-order" />
            <h2>No Quotation Data</h2>
            <p>Please select a quotation to create an order.</p>
            <button onClick={() => navigate("/all-quotations")} className="back-btn-quotation-order">
              Back to Quotations
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-container-quotation-order">
      <Sidebar />
      
      <div className="content-wrapper-quotation-order">
        {/* Toast Message */}
        {toast.show && (
          <div className={`toast-message-quotation-order ${toast.type}`}>
            <div className="toast-content-quotation-order">
              <span className="toast-text-quotation-order">{toast.message}</span>
            </div>
            <button className="toast-close-quotation-order" onClick={() => setToast({ show: false })}>×</button>
          </div>
        )}

        <div className="create-order-card-quotation-order">
          {/* Header */}
          <div className="page-header-quotation-order">
            <div className="header-title-quotation-order">
              <FiShoppingBag className="header-icon-quotation-order" />
              <h1>Create Order from Quotation</h1>
            </div>
            <button className="back-btn-quotation-order" onClick={() => navigate("/all-quotations")}>
              Back to Quotations
            </button>
          </div>

          {/* Quotation Info Banner */}
          <div className="quotation-banner-quotation-order">
            <FiFileText className="banner-icon-quotation-order" />
            <div className="banner-content-quotation-order">
              <strong>Quotation: {quotationData.quotationNumber}</strong>
              <span>Created: {formatDate(quotationData.createdAt)}</span>
            </div>
          </div>

          {/* Customer Information Section */}
          <div className="section-card-quotation-order">
            <h2 className="section-title-quotation-order">
              <span className="section-icon-quotation-order">👤</span>
              Customer Information
            </h2>
            <div className="customer-info-card-quotation-order">
              <div className="customer-avatar-quotation-order">
                {quotationData.customerName?.charAt(0).toUpperCase()}
              </div>
              <div className="customer-details-quotation-order">
                <h3>{quotationData.customerName}</h3>
                <p><FiPhone className="info-icon-quotation-order" /> {quotationData.customerPhone}</p>
                {quotationData.customerAddress && <p><FiMapPin className="info-icon-quotation-order" /> {quotationData.customerAddress}</p>}
              </div>
            </div>
          </div>

          {/* Order Items Section */}
          <div className="section-card-quotation-order">
            <h2 className="section-title-quotation-order">
              <span className="section-icon-quotation-order">📦</span>
              Order Items
              <span className="items-count-badge-quotation-order">
                {orderItems.length} Item{orderItems.length !== 1 ? 's' : ''}
              </span>
            </h2>

            {/* Items List */}
            <div className="items-list-quotation-order">
              {orderItems.map((item, index) => (
                <div key={item.id || index} className="order-item-card-quotation-order">
                  {editingIndex === index ? (
                    // Edit Mode
                    <div className="edit-item-mode-quotation-order">
                      <div className="edit-item-form-quotation-order">
                        <input
                          type="text"
                          name="name"
                          value={editingItem.name}
                          onChange={handleEditingItemChange}
                          placeholder="Item name"
                          className="edit-item-name-quotation-order"
                        />
                        <input
                          type="number"
                          name="quantity"
                          value={editingItem.quantity}
                          onChange={handleEditingItemChange}
                          min="1"
                          className="edit-item-quantity-quotation-order"
                        />
                        <input
                          type="number"
                          name="rate"
                          value={editingItem.rate}
                          onChange={handleEditingItemChange}
                          min="0"
                          className="edit-item-rate-quotation-order"
                        />
                        <input
                          type="text"
                          name="notes"
                          value={editingItem.notes || ''}
                          onChange={handleEditingItemChange}
                          placeholder="Notes"
                          className="edit-item-notes-quotation-order"
                        />
                        <div className="edit-actions-quotation-order">
                          <button onClick={saveEditing} className="save-edit-btn-quotation-order">Save</button>
                          <button onClick={cancelEditing} className="cancel-edit-btn-quotation-order">Cancel</button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // View Mode
                    <>
                      <div className="item-header-quotation-order">
                        <div className="item-info-quotation-order">
                          <span className="item-name-quotation-order">{item.name}</span>
                          {item.source === 'quotation' && (
                            <span className="source-badge-quotation-order">From Quotation</span>
                          )}
                          {item.notes && <span className="item-notes-quotation-order">({item.notes})</span>}
                        </div>
                        <div className="item-actions-quotation-order">
                          <button onClick={() => startEditing(index)} className="edit-item-btn-quotation-order" title="Edit">
                            <FiEdit2 />
                          </button>
                          <button onClick={() => removeItem(index)} className="remove-item-btn-quotation-order" title="Remove">
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <div className="item-details-quotation-order">
                        <span>Qty: {item.quantity}</span>
                        <span>× Rs {item.rate}</span>
                        <span className="item-total-quotation-order">= {formatCurrency(item.total)}</span>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Add New Item Button */}
            {!showAddItemForm ? (
              <button 
                className="add-item-btn-quotation-order"
                onClick={() => setShowAddItemForm(true)}
              >
                <FiPlus /> Add New Item
              </button>
            ) : (
              <div className="add-item-form-container-quotation-order">
                <h4>Add New Item</h4>
                <div className="add-item-form-quotation-order">
                  <input
                    type="text"
                    name="name"
                    value={newItem.name}
                    onChange={handleNewItemChange}
                    placeholder="Item name"
                    className="new-item-name-quotation-order"
                  />
                  <input
                    type="number"
                    name="quantity"
                    value={newItem.quantity}
                    onChange={handleNewItemChange}
                    placeholder="Quantity"
                    min="1"
                    className="new-item-quantity-quotation-order"
                  />
                  <input
                    type="number"
                    name="rate"
                    value={newItem.rate}
                    onChange={handleNewItemChange}
                    placeholder="Rate (Rs)"
                    min="0"
                    className="new-item-rate-quotation-order"
                  />
                  <input
                    type="text"
                    name="notes"
                    value={newItem.notes}
                    onChange={handleNewItemChange}
                    placeholder="Notes (optional)"
                    className="new-item-notes-quotation-order"
                  />
                  <div className="add-item-actions-quotation-order">
                    <button onClick={addNewItem} className="confirm-add-btn-quotation-order">Add Item</button>
                    <button onClick={() => setShowAddItemForm(false)} className="cancel-add-btn-quotation-order">Cancel</button>
                  </div>
                  {newItem.name && newItem.rate > 0 && (
                    <div className="new-item-preview-quotation-order">
                      Preview: {newItem.name} | Qty: {newItem.quantity} × Rs {newItem.rate} = {formatCurrency(newItem.total)}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Estimate Section */}
          {quotationData.estimate && (quotationData.estimate.low || quotationData.estimate.medium || quotationData.estimate.high) && (
            <div className="section-card-quotation-order">
              <h2 className="section-title-quotation-order">
                <span className="section-icon-quotation-order">📊</span>
                Estimated Amounts
              </h2>
              <div className="estimate-grid-quotation-order">
                {quotationData.estimate.low && (
                  <div className="estimate-card low">
                    <span className="estimate-label">Low Estimate</span>
                    <span className="estimate-value">{formatCurrency(quotationData.estimate.low)}</span>
                  </div>
                )}
                {quotationData.estimate.medium && (
                  <div className="estimate-card medium">
                    <span className="estimate-label">Medium Estimate</span>
                    <span className="estimate-value">{formatCurrency(quotationData.estimate.medium)}</span>
                  </div>
                )}
                {quotationData.estimate.high && (
                  <div className="estimate-card high">
                    <span className="estimate-label">High Estimate</span>
                    <span className="estimate-value">{formatCurrency(quotationData.estimate.high)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Payment Details Section */}
          <div className="section-card-quotation-order">
            <h2 className="section-title-quotation-order">
              <span className="section-icon-quotation-order">💰</span>
              Payment Details
            </h2>
            
            <div className="payment-grid-quotation-order">
              <div className="form-group-quotation-order">
                <label>Final Total (Rs) <span className="required-quotation-order">*</span></label>
                <input
                  type="number"
                  name="finalTotal"
                  value={orderData.finalTotal}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  placeholder="Enter final total amount"
                  className="final-total-input-quotation-order"
                />
              </div>

              <div className="form-group-quotation-order">
                <label>Advance Payment (Rs)</label>
                <input
                  type="number"
                  name="advancePayment"
                  value={orderData.advancePayment}
                  onChange={handleInputChange}
                  min="0"
                  max={orderData.finalTotal}
                  step="1"
                  placeholder="Enter advance payment"
                  className="advance-input-quotation-order"
                />
              </div>

              <div className="form-group-quotation-order">
                <label>Remaining Balance</label>
                <div className="remaining-display-quotation-order">
                  {formatCurrency(orderData.remainingBalance)}
                </div>
              </div>
            </div>
          </div>

          {/* Order Status & Notes Section */}
          <div className="section-card-quotation-order">
            <h2 className="section-title-quotation-order">
              <span className="section-icon-quotation-order">📋</span>
              Order Details
            </h2>
            
            <div className="order-details-grid-quotation-order">
              <div className="form-group-quotation-order">
                <label>Order Status *</label>
                <div className="custom-status-select-quotation-order">
                  <div 
                    className={`selected-status-quotation-order ${isStatusDropdownOpen ? 'open' : ''}`}
                    onClick={() => setIsStatusDropdownOpen(!isStatusDropdownOpen)}
                  >
                    <span className="selected-status-content-quotation-order" style={{ color: selectedStatus.color }}>
                      {selectedStatus.icon}
                      <span>{selectedStatus.label}</span>
                    </span>
                    <FiChevronDown className={`dropdown-arrow-quotation-order ${isStatusDropdownOpen ? 'rotate' : ''}`} />
                  </div>
                  {isStatusDropdownOpen && (
                    <div className="status-dropdown-quotation-order">
                      {statusOptions.map(option => (
                        <div
                          key={option.value}
                          className={`status-option-quotation-order ${orderData.status === option.value ? 'selected' : ''}`}
                          onClick={() => handleStatusSelect(option.value)}
                        >
                          <span style={{ color: option.color }}>{option.icon}</span>
                          <span>{option.label}</span>
                          {orderData.status === option.value && <FiCheckCircle className="check-icon-quotation-order" />}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group-quotation-order">
                <label>Due Date (Optional)</label>
                <input
                  type="date"
                  name="dueDate"
                  value={orderData.dueDate}
                  onChange={handleInputChange}
                  min={formatDateForInput(new Date())}
                  className="date-input-quotation-order"
                />
              </div>

              <div className="form-group-quotation-order full-width-quotation-order">
                <label>Order Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={orderData.notes}
                  onChange={handleInputChange}
                  placeholder="Add any notes about this order..."
                  rows="3"
                  className="notes-input-quotation-order"
                />
              </div>
            </div>
          </div>

          {/* Payment Summary */}
          {orderData.advancePayment > 0 && (
            <div className="payment-summary-quotation-order">
              <div className="summary-row-quotation-order">
                <span>Final Total:</span>
                <span>{formatCurrency(orderData.finalTotal)}</span>
              </div>
              <div className="summary-row-quotation-order">
                <span>Advance Payment:</span>
                <span className="advance-amount-quotation-order">{formatCurrency(orderData.advancePayment)}</span>
              </div>
              <div className="summary-row-quotation-order total-row-quotation-order">
                <span>Remaining Balance:</span>
                <span className={`remaining-amount-quotation-order ${orderData.remainingBalance === 0 ? 'paid' : 'pending'}`}>
                  {formatCurrency(orderData.remainingBalance)}
                </span>
              </div>
              <div className="payment-status-row-quotation-order">
                <span>Payment Status:</span>
                <span className={`payment-status-badge-quotation-order ${
                  orderData.advancePayment >= orderData.finalTotal ? 'paid' : 
                  orderData.advancePayment > 0 ? 'partial' : 'pending'
                }`}>
                  {orderData.advancePayment >= orderData.finalTotal ? 'Paid' : 
                   orderData.advancePayment > 0 ? 'Partial' : 'Pending'}
                </span>
              </div>
            </div>
          )}

          {/* Grand Total Card */}
          <div className="grand-total-card-quotation-order">
            <div className="grand-total-content-quotation-order">
              <span className="grand-total-label-quotation-order">Order Grand Total</span>
              <span className="grand-total-amount-quotation-order">{formatCurrency(orderData.finalTotal)}</span>
            </div>
          </div>

          {/* Create Order Button */}
          <button
            type="button"
            onClick={handleSubmit}
            className="create-order-btn-quotation-order"
            disabled={loading || orderItems.length === 0 || orderData.finalTotal <= 0}
          >
            {loading ? (
              <>
                <FiPackage className="spinning-quotation-order" />
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

export default CreateQuotationOrder;