import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { createCustomer, updateCustomer, getCustomerById } from "../../../api/customerApi";
import { createJob, updateJob, fetchJobsByCustomer } from "../../../api/jobApi";
import { getProfile } from "../../../api/profileApi";
import Sidebar from "../../../components/Sidebar/Sidebar";
import { FiCheckCircle, FiPrinter, FiX, FiPackage, FiDollarSign, FiShoppingBag } from "react-icons/fi";
import { BsShop, BsTelephone, BsGeoAlt } from "react-icons/bs";
// import "./AddCustomer.css"; // RoleAddCustomer ke liye alag CSS ho sakti hai

export default function RoleAddcustomer() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get actual token from localStorage
  const [token, setToken] = useState(localStorage.getItem('roleToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('roleUser') || '{}'));
  const [userRole, setUserRole] = useState(user.role || 'manager');
  
  // CUSTOMER
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [customerSaved, setCustomerSaved] = useState(false);
  const [customerId, setCustomerId] = useState(null);

  // EDIT MODE STATES
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(false);
  const [loadingJobs, setLoadingJobs] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);

  // BUSINESS PROFILE
  const [businessProfile, setBusinessProfile] = useState(null);

  // ESTIMATED AMOUNTS
  const [estimatedAmounts, setEstimatedAmounts] = useState({
    low: "",
    medium: "",
    high: ""
  });

  // WORK ITEMS & MATERIALS
  const [workName, setWorkName] = useState("");
  const [workQty, setWorkQty] = useState(1);
  
  // MATERIALS for current work
  const [currentWorkMaterials, setCurrentWorkMaterials] = useState([]);
  const [matName, setMatName] = useState("");
  const [matQty, setMatQty] = useState(1);
  const [matRate, setMatRate] = useState(0);

  // All combined items
  const [allItems, setAllItems] = useState([]);

  // Saved Bills
  const [savedBills, setSavedBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  // Edit mode states
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [editingExpenseIndex, setEditingExpenseIndex] = useState(null);
  const [editingWorkName, setEditingWorkName] = useState("");
  const [editingWorkQty, setEditingWorkQty] = useState(1);
  const [editingExpense, setEditingExpense] = useState({ name: "", qty: 1, rate: 0, total: 0 });
  
  // Add expense in edit mode
  const [addingExpenseInEdit, setAddingExpenseInEdit] = useState(false);
  const [newExpenseInEdit, setNewExpenseInEdit] = useState({ name: "", qty: 1, rate: 0 });

  // Toast state
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Success Overlay
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [savedBillData, setSavedBillData] = useState(null);

  // Loading states
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [savingBill, setSavingBill] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    const currentToken = localStorage.getItem('roleToken');
    const currentUser = JSON.parse(localStorage.getItem('roleUser') || '{}');
    
    console.log('🔐 Checking authentication...');
    console.log('Token exists:', currentToken ? '✅ Yes' : '❌ No');
    
    if (!currentToken) {
      showToast('Please login first', 'error');
      navigate('/login');
      return;
    }
    
    // Decode token to check expiry
    try {
      const base64Url = currentToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const decoded = JSON.parse(atob(base64));
      
      console.log('Decoded token:', decoded);
      console.log('Token type:', decoded.type);
      console.log('Token expiry:', new Date(decoded.exp * 1000).toLocaleString());
      
      // Check if token is expired
      const now = Math.floor(Date.now() / 1000);
      if (decoded.exp < now) {
        showToast('Session expired. Please login again', 'error');
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        navigate('/login');
        return;
      }
    } catch (e) {
      console.error('Error decoding token:', e);
    }
    
    setToken(currentToken);
    setUser(currentUser);
    setUserRole(currentUser.role || 'manager');
    
    checkEditMode();
    loadBusinessProfile();
  }, [location.pathname, location.state]);

  // Load saved bills when customer is saved
  useEffect(() => {
    if (customerId) {
      fetchSavedBills(customerId);
    }
  }, [customerId]);

  // Recalculate totals
  useEffect(() => {
    if (allItems.length > 0) {
      const updatedItems = allItems.map(item => {
        const expenseTotal = item.materials?.reduce((sum, mat) => {
          return sum + ((parseFloat(mat.qty) || 0) * (parseFloat(mat.rate) || 0));
        }, 0) || 0;
        
        return { ...item, expenseTotal };
      });
      
      const hasChanged = updatedItems.some((item, index) => 
        item.expenseTotal !== allItems[index].expenseTotal
      );
      
      if (hasChanged) {
        setAllItems(updatedItems);
      }
    }
  }, [allItems.map(item => JSON.stringify(item.materials)).join(',')]);

  // Get redirect path based on role
  const getRedirectPath = () => {
    const currentUser = JSON.parse(localStorage.getItem('roleUser') || '{}');
    return currentUser.role === 'admin' ? '/admin-all-customer' : '/admin-all-customer';
  };

  // Check edit mode
  const checkEditMode = async () => {
    const currentPath = location.pathname;
    console.log("Current path:", currentPath);
    
    if (currentPath === '/Role-Add-Customer' || currentPath === '/role-add-customer') {
      console.log("On Role Add Customer page - not edit mode");
      setIsEditMode(false);
      resetForm();
      return;
    }
    
    if (location.state?.customerData) {
      const customerData = location.state.customerData;
      console.log("Loading customer from state:", customerData);
      
      if (!customerData._id) {
        showToast('Invalid customer data', 'error');
        navigate('/Role-Add-Customer');
        return;
      }
      
      setIsEditMode(true);
      setCustomer({
        name: customerData.name || '',
        phone: customerData.phone || '',
        address: customerData.address || ''
      });
      setCustomerId(customerData._id);
      setCustomerSaved(true);
      
      await loadCustomerJobs(customerData._id);
      showToast('Customer loaded for editing', 'success');
    } else {
      const pathParts = currentPath.split('/');
      const lastPart = pathParts[pathParts.length - 1];
      
      console.log("Last part of URL:", lastPart);
      
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(lastPart);
      
      if (isValidObjectId && pathParts[pathParts.length - 2] === 'Role-Add-Customer') {
        console.log("Loading customer by ID from URL:", lastPart);
        await loadCustomerForEdit(lastPart);
      } else if (lastPart !== 'Role-Add-Customer' && lastPart !== 'role-add-customer') {
        console.log("Not a valid customer ID, redirecting to Role Add Customer");
        navigate('/Role-Add-Customer');
      }
    }
  };

  const resetForm = () => {
    setCustomer({ name: "", phone: "", address: "" });
    setCustomerId(null);
    setCustomerSaved(false);
    setAllItems([]);
    setEstimatedAmounts({ low: "", medium: "", high: "" });
    setCurrentWorkMaterials([]);
    setWorkName("");
    setCurrentJobId(null);
    setIsEditMode(false);
  };

  const loadCustomerForEdit = async (id) => {
    try {
      setLoadingCustomer(true);
      const response = await getCustomerById(id);
      console.log("Customer loaded for edit:", response);
      
      // ✅ FIXED: Handle different response structures
      let customerData;
      if (response?.data?.customer) {
        customerData = response.data.customer;
      } else if (response?.data) {
        customerData = response.data;
      } else if (response?.customer) {
        customerData = response.customer;
      } else {
        customerData = response;
      }
      
      console.log("Extracted customer data:", customerData);
      
      setIsEditMode(true);
      setCustomer({
        name: customerData.name || '',
        phone: customerData.phone || '',
        address: customerData.address || ''
      });
      setCustomerId(customerData._id || customerData.id);
      setCustomerSaved(true);
      
      await loadCustomerJobs(customerData._id || customerData.id);
      showToast('Customer loaded for editing', 'success');
    } catch (error) {
      console.error("Error loading customer:", error);
      showToast('Failed to load customer data', 'error');
    } finally {
      setLoadingCustomer(false);
    }
  };

  const loadCustomerJobs = async (custId) => {
    try {
      setLoadingJobs(true);
      const response = await fetchJobsByCustomer(custId);
      console.log("Customer jobs loaded:", response);
      
      // ✅ FIXED: Handle different response formats
      let jobsData = [];
      if (response?.data?.data) {
        jobsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        jobsData = response.data;
      } else if (Array.isArray(response)) {
        jobsData = response;
      } else if (response?.data) {
        jobsData = response.data;
      }
      
      console.log("Extracted jobs data:", jobsData);
      
      if (jobsData.length > 0) {
        const latestJob = jobsData[0];
        setCurrentJobId(latestJob._id);
        
        if (latestJob.works?.length > 0) {
          const processedWorks = latestJob.works.map(work => ({
            name: work.name || '',
            qty: Number(work.qty) || 1,
            materials: (work.materials || []).map(mat => ({
              name: mat.name || '',
              qty: Number(mat.qty) || 1,
              rate: Number(mat.rate) || 0,
              total: (Number(mat.qty) || 1) * (Number(mat.rate) || 0)
            })),
            expenseTotal: (work.materials || []).reduce((sum, mat) => 
              sum + ((Number(mat.qty) || 1) * (Number(mat.rate) || 0)), 0
            )
          }));
          
          setAllItems(processedWorks);
        }
        
        if (latestJob.estimatedAmounts) {
          setEstimatedAmounts({
            low: latestJob.estimatedAmounts.low || "",
            medium: latestJob.estimatedAmounts.medium || "",
            high: latestJob.estimatedAmounts.high || ""
          });
        }
      }
    } catch (error) {
      console.error("Error loading customer jobs:", error);
      showToast('Failed to load customer jobs', 'error');
    } finally {
      setLoadingJobs(false);
    }
  };

  const loadBusinessProfile = async () => {
    try {
      const response = await getProfile();
      console.log("Business profile loaded:", response);
      
      // ✅ FIXED: Handle different response formats
      let profileData = null;
      if (response?.data?.data) {
        profileData = response.data.data;
      } else if (response?.data) {
        profileData = response.data;
      } else if (response) {
        profileData = response;
      }
      
      setBusinessProfile(profileData);
    } catch (error) {
      console.log("No business profile found");
    }
  };

  const fetchSavedBills = async (custId) => {
    try {
      setLoadingBills(true);
      const response = await fetchJobsByCustomer(custId);
      
      // ✅ FIXED: Handle different response formats
      let billsData = [];
      if (response?.data?.data) {
        billsData = response.data.data;
      } else if (response?.data && Array.isArray(response.data)) {
        billsData = response.data;
      } else if (Array.isArray(response)) {
        billsData = response;
      } else if (response?.data) {
        billsData = response.data;
      }
      
      setSavedBills(billsData);
    } catch (error) {
      console.error("Error fetching saved bills:", error);
    } finally {
      setLoadingBills(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const closeToast = () => {
    setToast({ show: false, message: "", type: "" });
  };

  // SAVE CUSTOMER
  const saveCustomer = async () => {
    if (!customer.name || !customer.phone) {
      showToast("Please fill customer name and phone", "error");
      return;
    }
    
    const currentToken = localStorage.getItem('roleToken');
    if (!currentToken) {
      showToast("Session expired. Please login again", "error");
      setTimeout(() => navigate('/login'), 1500);
      return;
    }
    
    try {
      setSavingCustomer(true);
      
      if (isEditMode && customerId) {
        // Update existing customer
        const response = await updateCustomer(customerId, customer);
        console.log("Customer updated:", response);
        showToast("Customer Updated Successfully", "success");
        
        setTimeout(() => {
          navigate(getRedirectPath());
        }, 1500);
      } else {
        // Create new customer
        const response = await createCustomer(customer);
        console.log('Customer saved response:', response);
        
        // ✅ FIXED: Extract customer data properly
        let savedCustomerData;
        if (response?.data?.customer) {
          savedCustomerData = response.data.customer;
        } else if (response?.customer) {
          savedCustomerData = response.customer;
        } else if (response?.data) {
          savedCustomerData = response.data;
        } else {
          savedCustomerData = response;
        }
        
        console.log("Extracted customer data:", savedCustomerData);
        
        showToast("Customer Saved Successfully", "success");
        
        setCustomerSaved(true);
        setCustomer(savedCustomerData);
        setCustomerId(savedCustomerData._id || savedCustomerData.id);
      }
    } catch (err) {
      console.error("Error saving customer:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        showToast("Session expired. Please login again", "error");
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        showToast(err.response?.data?.message || `Error ${isEditMode ? 'updating' : 'saving'} customer`, "error");
      }
    } finally {
      setSavingCustomer(false);
    }
  };

  // ADD EXPENSE
  const addExpense = () => {
    if (!matName || matQty <= 0 || matRate <= 0) {
      showToast("Please enter valid material details", "error");
      return;
    }
    
    const qty = parseInt(matQty) || 1;
    const rate = parseFloat(matRate) || 0;
    const total = qty * rate;
    
    const newExpense = {
      name: matName,
      qty: qty,
      rate: rate,
      total: total,
      type: 'expense'
    };

    setCurrentWorkMaterials([...currentWorkMaterials, newExpense]);
    setMatName("");
    setMatQty(1);
    setMatRate(0);
  };

  // ADD EXPENSE IN EDIT MODE
  const addExpenseInEdit = () => {
    if (!newExpenseInEdit.name || newExpenseInEdit.qty <= 0 || newExpenseInEdit.rate <= 0) {
      showToast("Please enter valid expense details", "error");
      return;
    }

    const updatedItems = [...allItems];
    const qty = parseInt(newExpenseInEdit.qty) || 1;
    const rate = parseFloat(newExpenseInEdit.rate) || 0;
    const newTotal = qty * rate;
    
    updatedItems[editingItemIndex].materials.push({
      name: newExpenseInEdit.name,
      qty: qty,
      rate: rate,
      total: newTotal
    });

    updatedItems[editingItemIndex].expenseTotal =
      updatedItems[editingItemIndex].materials.reduce((sum, exp) => sum + exp.total, 0);

    setAllItems(updatedItems);
    setNewExpenseInEdit({ name: "", qty: 1, rate: 0 });
    setAddingExpenseInEdit(false);
    showToast("Expense added successfully", "success");
  };

  // SAVE WORK
  const saveWorkWithExpenses = () => {
    if (!workName || workQty <= 0) {
      showToast("Please enter valid work name and quantity", "error");
      return;
    }

    const expenseTotal = currentWorkMaterials.reduce((sum, exp) => sum + exp.total, 0);
    
    const newWork = {
      name: workName,
      qty: Number(workQty),
      materials: currentWorkMaterials,
      expenseTotal: expenseTotal
    };

    setAllItems([...allItems, newWork]);
    setWorkName("");
    setWorkQty(1);
    setCurrentWorkMaterials([]);
    showToast("Work added successfully", "success");
  };

  // Quantity controls
  const increaseQuantity = (itemIndex) => {
    const updatedItems = [...allItems];
    updatedItems[itemIndex].qty += 1;
    setAllItems(updatedItems);
    showToast("Quantity increased", "success");
  };

  const decreaseQuantity = (itemIndex) => {
    const updatedItems = [...allItems];
    if (updatedItems[itemIndex].qty > 1) {
      updatedItems[itemIndex].qty -= 1;
      setAllItems(updatedItems);
      showToast("Quantity decreased", "success");
    } else {
      showToast("Quantity cannot be less than 1", "error");
    }
  };

  // Edit functions
  const startEditingWork = (itemIndex) => {
    const item = allItems[itemIndex];
    setEditingItemIndex(itemIndex);
    setEditingWorkName(item.name);
    setEditingWorkQty(item.qty);
  };

  const saveWorkEdit = () => {
    if (!editingWorkName || editingWorkQty <= 0) {
      showToast("Please enter valid work name and quantity", "error");
      return;
    }

    const updatedItems = [...allItems];
    updatedItems[editingItemIndex] = {
      ...updatedItems[editingItemIndex],
      name: editingWorkName,
      qty: parseInt(editingWorkQty)
    };

    setAllItems(updatedItems);
    cancelEdit();
    showToast("Work updated successfully", "success");
  };

  const startEditingExpense = (itemIndex, expenseIndex) => {
    const expense = allItems[itemIndex].materials[expenseIndex];
    setEditingItemIndex(itemIndex);
    setEditingExpenseIndex(expenseIndex);
    setEditingExpense({
      name: expense.name,
      qty: expense.qty,
      rate: expense.rate,
      total: expense.total
    });
  };

  const saveExpenseEdit = () => {
    if (!editingExpense.name || editingExpense.qty <= 0 || editingExpense.rate <= 0) {
      showToast("Please enter valid material details", "error");
      return;
    }

    const updatedItems = [...allItems];
    const qty = parseInt(editingExpense.qty) || 1;
    const rate = parseFloat(editingExpense.rate) || 0;
    const newTotal = qty * rate;

    updatedItems[editingItemIndex].materials[editingExpenseIndex] = {
      name: editingExpense.name,
      qty: qty,
      rate: rate,
      total: newTotal
    };

    updatedItems[editingItemIndex].expenseTotal =
      updatedItems[editingItemIndex].materials.reduce((sum, exp) => sum + exp.total, 0);

    setAllItems(updatedItems);
    cancelEdit();
    showToast("Expense updated successfully", "success");
  };

  const cancelEdit = () => {
    setEditingItemIndex(null);
    setEditingExpenseIndex(null);
    setAddingExpenseInEdit(false);
    setEditingWorkName("");
    setEditingWorkQty(1);
    setEditingExpense({ name: "", qty: 1, rate: 0, total: 0 });
    setNewExpenseInEdit({ name: "", qty: 1, rate: 0 });
  };

  const removeItem = (index) => {
    setAllItems(allItems.filter((_, i) => i !== index));
    showToast("Item removed", "success");
  };

  const removeCurrentExpense = (index) => {
    setCurrentWorkMaterials(currentWorkMaterials.filter((_, i) => i !== index));
  };

  const removeExpenseFromEdit = (expenseIndex) => {
    const updatedItems = [...allItems];
    updatedItems[editingItemIndex].materials = 
      updatedItems[editingItemIndex].materials.filter((_, i) => i !== expenseIndex);
    
    updatedItems[editingItemIndex].expenseTotal =
      updatedItems[editingItemIndex].materials.reduce((sum, exp) => sum + exp.total, 0);
    
    setAllItems(updatedItems);
    showToast("Expense removed", "success");
  };

  // CALCULATIONS
  const calculateGrandTotal = () => {
    return allItems.reduce((sum, item) => {
      const materialsTotal = item.materials?.reduce((matSum, mat) => {
        return matSum + (mat.total || 0);
      }, 0) || 0;
      
      return sum + (materialsTotal * (Number(item.qty) || 1));
    }, 0);
  };

  const grandTotal = calculateGrandTotal();

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "Rs 0";
    return `Rs ${Number(amount).toFixed(2)}`;
  };

  const formatEstimatedAmount = (amount) => {
    if (!amount) return '';
    return `Rs ${Number(amount).toFixed(2)}`;
  };

  // PRINT FUNCTION - Complete with styles
  const printBillDirect = (billData) => {
    const profile = businessProfile;
    const works = billData.works || allItems || [];
    
    const calculateWorkTotal = (work) => {
      const materialsTotal = work.materials?.reduce((sum, m) => sum + (m.total || 0), 0) || 0;
      return materialsTotal * (work.qty || 1);
    };

    const printGrandTotal = billData.total || grandTotal;

    const printStyles = `
      <style>
        @page {
          size: A4;
          margin: 0.3in;
        }
        
        @media print {
          body { 
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            padding: 0; 
            margin: 0; 
            background: #fff; 
            color: #1e293b;
          }
          
          .print-bill { 
            max-width: 100%;
            margin: 0 auto;
            padding: 10px;
          }
          
          .print-header {
            text-align: center;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          
          .print-business-name {
            font-size: 32px;
            font-weight: 800;
            color: #1e293b;
            letter-spacing: -0.5px;
            margin-bottom: 8px;
            text-transform: uppercase;
          }
          
          .print-business-contact {
            display: flex;
            justify-content: center;
            gap: 25px;
            font-size: 14px;
            color: #475569;
            margin-bottom: 5px;
          }
          
          .print-business-address {
            font-size: 13px;
            color: #64748b;
            margin-top: 5px;
          }
          
          .print-title {
            text-align: center;
            margin: 15px 0;
          }
          
          .print-title h1 {
            font-size: 28px;
            color: #2563eb;
            margin: 0;
            font-weight: 700;
            letter-spacing: 1px;
          }
          
          .print-bill-details {
            display: flex;
            justify-content: space-between;
            background: #f8fafc;
            padding: 10px 15px;
            border-radius: 8px;
            margin: 15px 0;
            font-size: 13px;
            font-weight: 500;
          }
          
          .print-works {
            margin-bottom: 20px;
          }
          
          .print-works h3 {
            font-size: 18px;
            margin: 0 0 15px 0;
            color: #1e293b;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 8px;
          }
          
          .print-work {
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            margin-bottom: 15px;
            padding: 15px;
          }
          
          .print-work-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px dashed #cbd5e1;
            padding-bottom: 8px;
            margin-bottom: 10px;
          }
          
          .print-work-name {
            font-size: 16px;
            font-weight: 600;
            color: #2563eb;
          }
          
          .print-work-qty {
            background: #f1f5f9;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            color: #475569;
          }
          
          .print-materials-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
          }
          
          .print-materials-table th {
            background: #f8fafc;
            padding: 10px;
            text-align: left;
            font-weight: 600;
            color: #475569;
            border-bottom: 2px solid #e2e8f0;
          }
          
          .print-materials-table td {
            padding: 8px 10px;
            border-bottom: 1px solid #e2e8f0;
          }
          
          .print-work-total {
            text-align: right;
            margin-top: 12px;
            padding-top: 8px;
            border-top: 2px solid #2563eb;
            font-weight: 600;
            font-size: 14px;
          }
          
          .print-grand-total {
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            margin: 20px 0;
          }
          
          .print-grand-total-label {
            font-size: 18px;
            font-weight: 600;
          }
          
          .print-grand-total-value {
            font-size: 28px;
            font-weight: 800;
            color: #fbbf24;
          }
          
          .print-footer {
            text-align: center;
            border-top: 2px solid #e2e8f0;
            padding-top: 15px;
            margin-top: 20px;
          }
          
          .print-footer-note {
            font-size: 13px;
            color: #64748b;
            font-style: italic;
            margin-bottom: 8px;
          }
          
          .print-footer-contact {
            font-size: 12px;
            color: #94a3b8;
          }
          
          .print-date {
            text-align: right;
            font-size: 10px;
            color: #94a3b8;
            margin-top: 10px;
          }
        }
      </style>
    `;

    const printHTML = `
      <div class="print-bill">
        <div class="print-header">
          <div class="print-business-name">${profile?.shopName || 'Business Name'}</div>
          <div class="print-business-contact">
            ${profile?.phone ? `📞 ${profile.phone}` : ''}
            ${profile?.whatsapp ? `📱 ${profile.whatsapp}` : ''}
          </div>
          ${profile?.address ? `<div class="print-business-address">${profile.address}</div>` : ''}
        </div>

        <div class="print-title">
          <h1>INVOICE</h1>
        </div>

        <div class="print-bill-details">
          <span><strong>Bill #:</strong> ${billData.billNumber || 'N/A'}</span>
          <span><strong>Date:</strong> ${billData.date || new Date().toLocaleDateString()}</span>
        </div>

        <div style="background: #f8fafc; padding: 10px 15px; border-radius: 8px; margin: 15px 0; font-size: 13px;">
          <div><strong>Customer:</strong> ${billData.customer?.name || customer.name || ''}</div>
          <div><strong>Phone:</strong> ${billData.customer?.phone || customer.phone || ''}</div>
          ${(billData.customer?.address || customer.address) ? `<div><strong>Address:</strong> ${billData.customer?.address || customer.address}</div>` : ''}
        </div>

        <div class="print-works">
          <h3>WORK DETAILS</h3>
          ${works.length > 0 ? works.map((work, idx) => `
            <div class="print-work">
              <div class="print-work-header">
                <span class="print-work-name">${work.name || 'Work'}</span>
                <span class="print-work-qty">Qty: ${work.qty || 1}</span>
              </div>
              
              ${work.materials && work.materials.length > 0 ? `
                <table class="print-materials-table">
                  <thead>
                    <tr>
                      <th>Material</th>
                      <th>Qty</th>
                      <th>Rate</th>
                      <th>Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${work.materials.map(mat => `
                      <tr>
                        <td>${mat.name || ''}</td>
                        <td>${mat.qty || 0}</td>
                        <td>${formatCurrency(mat.rate)}</td>
                        <td>${formatCurrency(mat.total)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                
                <div class="print-work-total">
                  Work Total: ${formatCurrency(calculateWorkTotal(work))}
                </div>
              ` : '<p style="color: #64748b; font-style: italic; text-align: center;">No materials added</p>'}
            </div>
          `).join('') : '<p style="text-align: center; color: #64748b;">No works found</p>'}
        </div>

        <div class="print-grand-total">
          <span class="print-grand-total-label">GRAND TOTAL</span>
          <span class="print-grand-total-value">${formatCurrency(printGrandTotal)}</span>
        </div>

        ${(billData.estimatedAmounts && Object.keys(billData.estimatedAmounts).length > 0) || estimatedAmounts.low || estimatedAmounts.medium || estimatedAmounts.high ? `
          <div style="background: #f8fafc; padding: 12px 15px; border-radius: 8px; margin: 15px 0; border-left: 4px solid #2563eb;">
            <strong>Estimated Amounts:</strong><br>
            ${(billData.estimatedAmounts?.low || estimatedAmounts.low) ? `Low: ${formatCurrency(billData.estimatedAmounts?.low || estimatedAmounts.low)}<br>` : ''}
            ${(billData.estimatedAmounts?.medium || estimatedAmounts.medium) ? `Medium: ${formatCurrency(billData.estimatedAmounts?.medium || estimatedAmounts.medium)}<br>` : ''}
            ${(billData.estimatedAmounts?.high || estimatedAmounts.high) ? `High: ${formatCurrency(billData.estimatedAmounts?.high || estimatedAmounts.high)}` : ''}
          </div>
        ` : ''}

        <div class="print-footer">
          ${profile?.footerNote ? `<div class="print-footer-note">${profile.footerNote}</div>` : ''}
          <div class="print-footer-contact">
            ${profile?.phone ? `Phone: ${profile.phone}` : ''}
          </div>
          <div class="print-date">Printed: ${new Date().toLocaleString()}</div>
        </div>
      </div>
    `;

    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printStyles + printHTML;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // SAVE BILL
  const saveBill = async () => {
    if (!customerSaved) {
      showToast("Please save customer first!", "error");
      return;
    }
    if (allItems.length === 0) {
      showToast("Add at least one work item", "error");
      return;
    }

    const currentToken = localStorage.getItem('roleToken');
    if (!currentToken) {
      showToast("Session expired. Please login again", "error");
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    try {
      setSavingBill(true);
      
      const works = allItems.map(item => {
        const materials = (item.materials || []).map(mat => ({
          name: mat.name,
          qty: Number(mat.qty) || 1,
          rate: Number(mat.rate) || 0,
          total: (Number(mat.qty) || 1) * (Number(mat.rate) || 0)
        }));
        
        return {
          name: item.name,
          qty: Number(item.qty) || 1,
          materials: materials,
          expenseTotal: materials.reduce((sum, mat) => sum + mat.total, 0)
        };
      });

      const estimatedAmountsToSend = {};
      if (estimatedAmounts.low) estimatedAmountsToSend.low = Number(estimatedAmounts.low);
      if (estimatedAmounts.medium) estimatedAmountsToSend.medium = Number(estimatedAmounts.medium);
      if (estimatedAmounts.high) estimatedAmountsToSend.high = Number(estimatedAmounts.high);

      const finalGrandTotal = works.reduce((sum, work) => {
        const workTotal = work.materials.reduce((matSum, mat) => matSum + mat.total, 0);
        return sum + (workTotal * work.qty);
      }, 0);

      const billData = {
        customer: customer._id || customer.id || customerId,
        works: works,
        total: finalGrandTotal,
        estimatedAmounts: estimatedAmountsToSend,
        billNumber: 'BILL-' + Math.floor(Math.random() * 10000),
        date: new Date().toLocaleString('en-PK')
      };

      console.log("Sending bill data:", billData);
      
      if (isEditMode && currentJobId) {
        const response = await updateJob(currentJobId, billData);
        console.log("Bill updated:", response);
        showToast("Bill Updated Successfully", "success");
        
        setTimeout(() => {
          navigate(getRedirectPath());
        }, 1500);
      } else {
        const response = await createJob(billData);
        console.log("Bill saved:", response);
        showToast("Bill Saved Successfully", "success");

        // ✅ FIXED: Extract saved bill data properly
        let savedBill = null;
        if (response?.data?.data) {
          savedBill = response.data.data;
        } else if (response?.data) {
          savedBill = response.data;
        } else if (response) {
          savedBill = response;
        }

        const completeBillData = {
          ...savedBill,
          works: works,
          customer: customer,
          businessProfile: businessProfile,
          total: finalGrandTotal,
          billNumber: billData.billNumber,
          date: billData.date,
          estimatedAmounts: estimatedAmountsToSend
        };

        if (customerId) {
          await fetchSavedBills(customerId);
        }
        await loadBusinessProfile();

        setSavedBillData(completeBillData);
        setShowSuccessOverlay(true);
      }
    } catch (err) {
      console.error("Error saving bill:", err);
      console.error("Error response:", err.response?.data);
      
      if (err.response?.status === 401) {
        showToast("Session expired. Please login again", "error");
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        setTimeout(() => navigate('/login'), 1500);
      } else {
        showToast(err.response?.data?.message || "Error saving bill", "error");
      }
    } finally {
      setSavingBill(false);
    }
  };

  const handleOverlayAndRedirect = () => {
    setShowSuccessOverlay(false);
    setSavedBillData(null);
    navigate(getRedirectPath());
  };

  const hasEstimatedAmounts = estimatedAmounts.low || estimatedAmounts.medium || estimatedAmounts.high;

  return (
    <div className="main-container-Customer">
      <div className="sidebar-wrapper-Customer">
        <Sidebar />
      </div>

      <div className="content-wrapper-Customer">
        {/* Toast Message */}
        {toast.show && (
          <div className={`toast-message-Customer ${toast.type}`}>
            <div className="toast-content-Customer">
              <span className="toast-text-Customer">{toast.message}</span>
            </div>
            <button className="toast-close-Customer" onClick={closeToast}>×</button>
          </div>
        )}

        {/* Role Indicator */}
        <div className="role-indicator" style={{
          backgroundColor: userRole === 'admin' ? '#3b82f6' : 
                          userRole === 'manager' ? '#8b5cf6' : '#10b981',
          color: 'white',
          padding: '4px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          display: 'inline-block',
          marginBottom: '15px'
        }}>
          {userRole === 'admin' ? '👑 Admin Mode' : 
           userRole === 'manager' ? '👔 Manager Mode' : '👤 Customer Creator Mode'}
        </div>

        {/* Loading indicator */}
        {(loadingCustomer || loadingJobs) && (
          <div className="loading-overlay-Customer">
            <div className="loading-spinner-Customer"></div>
            <p>Loading customer data...</p>
          </div>
        )}

        {/* Success Overlay */}
        {showSuccessOverlay && savedBillData && (
          <div className="success-overlay-Customer">
            <div className="success-modal-Customer professional-success">
              <div className="success-modal-header-Customer">
                <div className="success-modal-header-Customer-main">
                  <div className="success-icon-Customer professional">
                    <FiCheckCircle />
                  </div>
                  <div className="success-title-Customer">
                    <h2>Thank You for Shopping!</h2>
                    <p>Your bill has been generated successfully</p>
                  </div>
                </div>
                <button className="close-modal-btn" onClick={handleOverlayAndRedirect}>
                  <FiX />
                </button>
              </div>

              <div className="success-modal-body-Customer">
                {savedBillData.works?.length > 0 && (
                  <div className="bill-section-Customer">
                    <h3>Work Details</h3>
                    {savedBillData.works.map((work, workIndex) => (
                      <div key={workIndex} className="saved-item-card-Customer">
                        <div className="saved-item-header-Customer">
                          <span className="work-title-Customer">
                            <strong>{work.name}</strong> (Qty: {work.qty})
                          </span>
                        </div>

                        {work.materials?.length > 0 ? (
                          <div className="saved-expenses-Customer">
                            <table className="bill-table-Customer">
                              <thead>
                                <tr>
                                  <th>Material</th>
                                  <th>Qty</th>
                                  <th>Rate</th>
                                  <th>Total</th>
                                </tr>
                              </thead>
                              <tbody>
                                {work.materials.map((mat, matIndex) => (
                                  <tr key={matIndex}>
                                    <td>{mat.name}</td>
                                    <td>{mat.qty}</td>
                                    <td>{formatCurrency(mat.rate)}</td>
                                    <td>{formatCurrency(mat.total)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            
                            <div className="work-total-display">
                              <div className="work-total-calculation">
                                <span>Materials Total: {formatCurrency(work.materials.reduce((sum, m) => sum + m.total, 0))}</span>
                                <span className="multiply-symbol">×</span>
                                <span>Quantity: {work.qty}</span>
                                <span className="equals-symbol">=</span>
                                <span className="work-grand-total">
                                  {formatCurrency(work.materials.reduce((sum, m) => sum + m.total, 0) * work.qty)}
                                </span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="empty-state-Customer">No materials added</p>
                        )}
                      </div>
                    ))}
                    
                    <div className="success-grand-total">
                      <span>GRAND TOTAL:</span>
                      <span className="success-grand-total-value">{formatCurrency(savedBillData.total || grandTotal)}</span>
                    </div>
                  </div>
                )}
              </div>

              <div className="success-modal-footer-Customer">
                <button onClick={() => printBillDirect(savedBillData)} className="print-btn-Customer professional">
                  <FiPrinter className="btn-icon" />
                  Print Bill
                </button>
                <button onClick={handleOverlayAndRedirect} className="ok-btn-Customer professional">
                  OK
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Saved Bills List */}
        {customerSaved && savedBills.length > 0 && isEditMode && (
          <div className="saved-bills-section">
            <h3>Previous Bills</h3>
            <div className="saved-bills-list">
              {savedBills.map((bill, index) => (
                <div key={bill._id || index} className="saved-bill-card">
                  <div className="bill-info">
                    <span className="bill-number">{bill.billNumber}</span>
                    <span className="bill-date">{bill.date}</span>
                    <span className="bill-total">{formatCurrency(bill.total)}</span>
                  </div>
                  <button onClick={() => printBillDirect(bill)} className="view-bill-btn">
                    <FiPrinter className="btn-icon" />
                    Print
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="add-customer-card-Customer">
          {/* Customer Section */}
          <div className="section-card-Customer">
            <h2 className="section-title-Customer">
              <span className="section-icon-Customer">👤</span>
              {isEditMode ? 'Edit Customer Information' : 'Customer Information'}
            </h2>
            <div className="form-grid-Customer">
              <div className="form-group-Customer">
                <label>Customer Name <span className="required-Customer">*</span></label>
                <input
                  type="text"
                  placeholder="Enter customer name"
                  value={customer.name}
                  onChange={e => setCustomer({ ...customer, name: e.target.value })}
                  className={customerSaved ? 'disabled-input-Customer' : ''}
                  disabled={customerSaved}
                />
              </div>
              <div className="form-group-Customer">
                <label>Phone Number <span className="required-Customer">*</span></label>
                <input
                  type="tel"
                  placeholder="03XX-XXXXXXX"
                  value={customer.phone}
                  onChange={e => setCustomer({ ...customer, phone: e.target.value })}
                  className={customerSaved ? 'disabled-input-Customer' : ''}
                  disabled={customerSaved}
                />
              </div>
              <div className="form-group-Customer full-width-Customer">
                <label>Address</label>
                <input
                  type="text"
                  placeholder="Enter complete address"
                  value={customer.address}
                  onChange={e => setCustomer({ ...customer, address: e.target.value })}
                  className={customerSaved ? 'disabled-input-Customer' : ''}
                  disabled={customerSaved}
                />
              </div>
            </div>
            <button
              type="button"
              onClick={saveCustomer}
              className={`save-customer-btn-Customer ${customerSaved ? 'saved-Customer' : ''}`}
              disabled={customerSaved || savingCustomer || loadingCustomer}
            >
              {loadingCustomer ? 'Loading...' : 
               savingCustomer ? (isEditMode ? 'Updating...' : 'Saving...') :
               customerSaved ? (isEditMode ? 'Customer Updated' : 'Customer Saved') :
               isEditMode ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>

          {/* Work & Materials Section */}
          <div className="section-card-Customer">
            <h2 className="section-title-Customer">
              <span className="section-icon-Customer">🔧</span>
              Work & Materials
            </h2>

            {/* Current Work Input */}
            <div className="current-work-section-Customer">
              <div className="add-item-form-Customer">
                <div className="form-group-Customer">
                  <input
                    type="text"
                    placeholder="Work name (e.g., Painting, Plumbing)"
                    value={workName}
                    onChange={e => setWorkName(e.target.value)}
                    disabled={!customerSaved}
                  />
                </div>
                <div className="form-group-Customer">
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={workQty}
                    onChange={e => setWorkQty(e.target.value)}
                    min="1"
                    disabled={!customerSaved}
                  />
                </div>
              </div>

              {/* Materials for Current Work */}
              {customerSaved && workName && (
                <div className="expenses-section-Customer">
                  <h4>Add Materials for this Work</h4>
                  <div className="add-item-form-Customer materials-form-Customer">
                    <div className="form-group-Customer">
                      <input
                        type="text"
                        placeholder="Material name"
                        value={matName}
                        onChange={e => setMatName(e.target.value)}
                      />
                    </div>
                    <div className="form-group-Customer">
                      <input
                        type="number"
                        placeholder="Qty"
                        value={matQty}
                        onChange={e => setMatQty(e.target.value)}
                        min="1"
                      />
                    </div>
                    <div className="form-group-Customer">
                      <input
                        type="number"
                        placeholder="Rate (Rs)"
                        value={matRate}
                        onChange={e => setMatRate(e.target.value)}
                        min="0"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addExpense}
                      className="add-item-btn-Customer"
                    >
                      + Add Material
                    </button>
                  </div>

                  {/* Current Materials List */}
                  {currentWorkMaterials.length > 0 && (
                    <div className="current-expenses-list-Customer">
                      <h5>Materials for this work:</h5>
                      {currentWorkMaterials.map((mat, idx) => (
                        <div key={idx} className="expense-item-Customer">
                          <span className="expense-details-Customer">
                            <span className="expense-name-Customer">{mat.name}</span>
                            <span className="expense-calculation-Customer">
                              {mat.qty} × {formatCurrency(mat.rate)} = {formatCurrency(mat.total)}
                            </span>
                          </span>
                          <button onClick={() => removeCurrentExpense(idx)} className="remove-small-Customer">×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Save Work Button */}
                  <button
                    type="button"
                    onClick={saveWorkWithExpenses}
                    className="save-work-btn-Customer"
                    disabled={!workName}
                  >
                    Save Work with Materials
                  </button>
                </div>
              )}
            </div>

            {/* All Saved Items Display */}
            {allItems.length > 0 && (
              <div className="saved-items-list-Customer">
                <h3>All Saved Items</h3>
                {allItems.map((item, idx) => (
                  <div key={idx} className="saved-item-card-Customer">
                    {editingItemIndex === idx ? (
                      // EDIT MODE
                      <div className="edit-mode-container">
                        {/* Work Edit Form */}
                        <div className="edit-work-section">
                          <h4>Edit Work</h4>
                          <div className="edit-work-form">
                            <input
                              type="text"
                              value={editingWorkName}
                              onChange={(e) => setEditingWorkName(e.target.value)}
                              placeholder="Work name"
                            />
                            <input
                              type="number"
                              value={editingWorkQty}
                              onChange={(e) => setEditingWorkQty(e.target.value)}
                              min="1"
                              placeholder="Quantity"
                            />
                            <div className="edit-actions">
                              <button onClick={saveWorkEdit} className="save-edit-btn">Save</button>
                              <button onClick={cancelEdit} className="cancel-edit-btn">Cancel</button>
                            </div>
                          </div>
                        </div>

                        {/* Add Material Button */}
                        {!addingExpenseInEdit ? (
                          <button onClick={() => setAddingExpenseInEdit(true)} className="add-expense-in-edit-btn">
                            + Add New Material
                          </button>
                        ) : (
                          <div className="add-expense-in-edit-mode">
                            <h4>Add New Material</h4>
                            <div className="add-expense-form">
                              <input
                                type="text"
                                placeholder="Material name"
                                value={newExpenseInEdit.name}
                                onChange={(e) => setNewExpenseInEdit({ ...newExpenseInEdit, name: e.target.value })}
                              />
                              <input
                                type="number"
                                placeholder="Quantity"
                                value={newExpenseInEdit.qty}
                                onChange={(e) => setNewExpenseInEdit({ ...newExpenseInEdit, qty: parseInt(e.target.value) || 1 })}
                                min="1"
                              />
                              <input
                                type="number"
                                placeholder="Rate"
                                value={newExpenseInEdit.rate}
                                onChange={(e) => setNewExpenseInEdit({ ...newExpenseInEdit, rate: parseFloat(e.target.value) || 0 })}
                                min="0"
                              />
                              <div className="edit-actions">
                                <button onClick={addExpenseInEdit} className="save-edit-btn">Add</button>
                                <button onClick={() => setAddingExpenseInEdit(false)} className="cancel-edit-btn">Cancel</button>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Existing Materials */}
                        {item.materials?.length > 0 && (
                          <div className="existing-expenses-section">
                            <h4>Existing Materials</h4>
                            {item.materials.map((mat, matIdx) => (
                              <div key={matIdx} className="existing-expense-item">
                                {editingExpenseIndex === matIdx ? (
                                  <div className="edit-expense-form">
                                    <input
                                      type="text"
                                      value={editingExpense.name}
                                      onChange={(e) => setEditingExpense({ ...editingExpense, name: e.target.value })}
                                    />
                                    <input
                                      type="number"
                                      value={editingExpense.qty}
                                      onChange={(e) => setEditingExpense({ ...editingExpense, qty: parseInt(e.target.value) || 1 })}
                                    />
                                    <input
                                      type="number"
                                      value={editingExpense.rate}
                                      onChange={(e) => setEditingExpense({ ...editingExpense, rate: parseFloat(e.target.value) || 0 })}
                                    />
                                    <div className="edit-actions-small">
                                      <button onClick={saveExpenseEdit} className="save-small">✓</button>
                                      <button onClick={cancelEdit} className="cancel-small">✗</button>
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="expense-details">
                                      <span className="expense-name">{mat.name}</span>
                                      <span className="expense-calculation">
                                        {mat.qty} × {formatCurrency(mat.rate)} = {formatCurrency(mat.total)}
                                      </span>
                                    </div>
                                    <div className="expense-actions">
                                      <button onClick={() => startEditingExpense(idx, matIdx)} className="edit-expense-btn">✎</button>
                                      <button onClick={() => removeExpenseFromEdit(matIdx)} className="remove-expense-btn">×</button>
                                    </div>
                                  </>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // NORMAL MODE
                      <>
                        <div className="saved-item-header-Customer">
                          <div className="work-title-with-controls">
                            <span className="work-title-Customer">
                              <strong>{item.name}</strong>
                            </span>
                            <div className="quantity-controls">
                              <button onClick={() => decreaseQuantity(idx)} className="qty-btn minus">−</button>
                              <span className="qty-display">{item.qty}</span>
                              <button onClick={() => increaseQuantity(idx)} className="qty-btn plus">+</button>
                            </div>
                          </div>
                          <div className="item-actions">
                            <button onClick={() => startEditingWork(idx)} className="edit-item-btn">✎</button>
                            <button onClick={() => removeItem(idx)} className="remove-item-Customer">×</button>
                          </div>
                        </div>

                        {item.materials?.length > 0 && (
                          <div className="saved-expenses-Customer">
                            <small>Materials:</small>
                            {item.materials.map((mat, matIdx) => (
                              <div key={matIdx} className="saved-expense-Customer">
                                <div className="expense-info">
                                  <span className="expense-name-Customer">{mat.name}</span>
                                  <span className="expense-calculation-Customer">
                                    {mat.qty} × {formatCurrency(mat.rate)} = {formatCurrency(mat.total)}
                                  </span>
                                </div>
                              </div>
                            ))}
                            
                            <div className="work-total-display">
                              <div className="work-total-calculation">
                                <span>Materials Total: {formatCurrency(item.expenseTotal)}</span>
                                <span className="multiply-symbol">×</span>
                                <span>Quantity: {item.qty}</span>
                                <span className="equals-symbol">=</span>
                                <span className="work-grand-total">{formatCurrency(item.expenseTotal * item.qty)}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Grand Total Card */}
          <div className="grand-total-card-Customer">
            <div className="grand-total-content-Customer">
              <span className="grand-total-label-Customer">Grand Total (All Works)</span>
              <span className="grand-total-amount-Customer">{formatCurrency(grandTotal)}</span>
            </div>
          </div>
         
          {/* Estimated Amounts Section */}
          <div className="section-card-Customer">
            <h2 className="section-title-Customer">
              <span className="section-icon-Customer">💰</span>
              Estimated Costs
            </h2>
            <div className="estimated-amounts-grid">
              <div className="form-group-Customer">
                <label>Low Estimate (Rs)</label>
                <input
                  type="number"
                  placeholder="Enter low estimate"
                  value={estimatedAmounts.low}
                  onChange={e => setEstimatedAmounts({ ...estimatedAmounts, low: e.target.value })}
                  min="0"
                  disabled={!customerSaved}
                />
              </div>
              <div className="form-group-Customer">
                <label>Medium Estimate (Rs)</label>
                <input
                  type="number"
                  placeholder="Enter medium estimate"
                  value={estimatedAmounts.medium}
                  onChange={e => setEstimatedAmounts({ ...estimatedAmounts, medium: e.target.value })}
                  min="0"
                  disabled={!customerSaved}
                />
              </div>
              <div className="form-group-Customer">
                <label>High Estimate (Rs)</label>
                <input
                  type="number"
                  placeholder="Enter high estimate"
                  value={estimatedAmounts.high}
                  onChange={e => setEstimatedAmounts({ ...estimatedAmounts, high: e.target.value })}
                  min="0"
                  disabled={!customerSaved}
                />
              </div>
            </div>
            {hasEstimatedAmounts && (
              <div className="estimated-summary">
                <p className="estimated-note">
                  <span className="estimated-dot low"></span> Low: {formatEstimatedAmount(estimatedAmounts.low)}
                </p>
                <p className="estimated-note">
                  <span className="estimated-dot medium"></span> Medium: {formatEstimatedAmount(estimatedAmounts.medium)}
                </p>
                <p className="estimated-note">
                  <span className="estimated-dot high"></span> High: {formatEstimatedAmount(estimatedAmounts.high)}
                </p>
              </div>
            )}
          </div>
          
          {/* Save All Button */}
          <button
            type="button"
            onClick={saveBill}
            className="save-bill-btn-Customer"
            disabled={!customerSaved || allItems.length === 0 || savingBill}
          >
            {savingBill ? (isEditMode ? "Updating Bill..." : "Saving Bill...") :
             isEditMode ? "Update Complete Bill" : "Save Complete Bill"}
          </button>

          {/* Warning */}
          {!customerSaved && (
            <div className="warning-message-Customer">
              ⚠️ Please save customer information first to add items
            </div>
          )}
        </div>
      </div>
    </div>
  );
}