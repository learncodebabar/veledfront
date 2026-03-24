import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import roleService from '../../../api/roleService';
import Sidebar from '../../../components/Sidebar/Sidebar';
import API from '../../../api/axios';
import './Roles.css';

// React Icons - Main Icons
import { 
  FaUserPlus, FaTimes, FaEye, FaEdit, FaTrash, 
  FaCheckCircle, FaExclamationCircle, FaSpinner,
  FaUserCircle, FaEnvelope, FaLock, FaCalendarAlt,
  FaShieldAlt, FaSearch, FaUserTag, FaSave,
  FaLock as FaLockIcon, FaUnlock
} from 'react-icons/fa';

// React Icons - Fi Icons (صرف ضروری)
import { 
  FiHome,
  FiUsers,
  FiShoppingCart,
  FiBriefcase,
  FiCalendar,
  FiFileText,
  FiPackage,
  FiDollarSign,
  FiSettings,
  FiUser,
  FiEdit,
  FiGrid,
  FiList,
  FiCheckCircle,
  FiXCircle,
  FiUserPlus,
  FiEye,
  FiFilePlus,
  FiClock,
  FiLogOut,
  FiChevronDown,
  FiChevronRight
} from 'react-icons/fi';
// ===== ALL PAGES LIST =====
const ALL_PAGES = [
  // Dashboard Pages
  { id: 'admin-dashboard', name: 'Admin Dashboard', category: 'dashboard', icon: <FiHome /> },
  { id: 'role-dashboard', name: 'Role Dashboard', category: 'dashboard', icon: <FiGrid /> },
  
  // Customer Pages
  { id: 'add-customer', name: 'Add Customer (Admin)', category: 'customers', icon: <FiUserPlus /> },
  { id: 'all-customers', name: 'All Customers (Admin)', category: 'customers', icon: <FiUsers /> },
  { id: 'role-add-customer', name: 'Add Customer (Role)', category: 'customers', icon: <FiUserPlus /> },
  { id: 'role-customers', name: 'View Customers (Role)', category: 'customers', icon: <FiUsers /> },
  { id: 'customer-detail', name: 'Customer Detail', category: 'customers', icon: <FiUser /> },
  { id: 'customer-orders', name: 'Customer Orders', category: 'customers', icon: <FiList /> },
  
  // Order Pages
  { id: 'all-orders', name: 'All Orders (Admin)', category: 'orders', icon: <FiShoppingCart /> },
  { id: 'role-orders', name: 'View Orders (Role)', category: 'orders', icon: <FiShoppingCart /> },
  
  // Labor Pages
  { id: 'add-labor', name: 'Add Labor (Admin)', category: 'labor', icon: <FiBriefcase /> },
  { id: 'all-labor', name: 'All Labor (Admin)', category: 'labor', icon: <FiUsers /> },
  { id: 'role-add-labor', name: 'Add Labor (Role)', category: 'labor', icon: <FiBriefcase /> },
  { id: 'role-labor', name: 'View Labor (Role)', category: 'labor', icon: <FiUsers /> },
  { id: 'edit-labor', name: 'Edit Labor', category: 'labor', icon: <FiEdit /> },
  { id: 'worker-details', name: 'Worker Details', category: 'labor', icon: <FiUser /> },
  
  // Attendance Pages
  { id: 'attendance', name: 'Attendance (Admin)', category: 'attendance', icon: <FiCalendar /> },
  { id: 'role-attendance', name: 'Attendance (Role)', category: 'attendance', icon: <FiCalendar /> },
  
  // Quotation Pages
  { id: 'quotation-customer', name: 'Customer Quotations', category: 'quotations', icon: <FiFileText /> },
  { id: 'all-quotations', name: 'All Quotations', category: 'quotations', icon: <FiFileText /> },
  
  // Material Pages
  { id: 'admin-material', name: 'Material Management', category: 'material', icon: <FiPackage /> },
  
  // Payment & Expense Pages
  { id: 'admin-payment', name: 'Payments (Admin)', category: 'financial', icon: <FiDollarSign /> },
  { id: 'admin-expenses', name: 'Expenses (Admin)', category: 'financial', icon: <FiDollarSign /> },
  { id: 'payments', name: 'Payments Overview', category: 'financial', icon: <FiDollarSign /> },
  { id: 'expenses', name: 'Expenses Overview', category: 'financial', icon: <FiDollarSign /> },
  
  // Settings Pages
  { id: 'roles-management', name: 'Role Management', category: 'settings', icon: <FiSettings /> },
  { id: 'profile', name: 'Profile', category: 'settings', icon: <FiUser /> },
  { id: 'account-settings', name: 'Account Settings', category: 'settings', icon: <FiSettings /> },
  { id: 'theme-settings', name: 'Theme Settings', category: 'settings', icon: <FiSettings /> },
  { id: 'profile-settings', name: 'Profile Settings', category: 'settings', icon: <FiUser /> }
];

// Categories with colors
const CATEGORIES = {
  dashboard: { name: 'Dashboard', color: '#4299e1', icon: <FiHome /> },
  customers: { name: 'Customer Management', color: '#48bb78', icon: <FiUsers /> },
  orders: { name: 'Order Management', color: '#ed8936', icon: <FiShoppingCart /> },
  labor: { name: 'Labor Management', color: '#9f7aea', icon: <FiBriefcase /> },
  attendance: { name: 'Attendance', color: '#f56565', icon: <FiCalendar /> },
  quotations: { name: 'Quotations', color: '#38b2ac', icon: <FiFileText /> },
  material: { name: 'Material', color: '#667eea', icon: <FiPackage /> },
  financial: { name: 'Financial', color: '#fbbf24', icon: <FiDollarSign /> },
  settings: { name: 'Settings', color: '#a0aec0', icon: <FiSettings /> }
};

const Roles = () => {
  const navigate = useNavigate();
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('add');
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  
  // Permissions Modal States
  const [showPermissionsModal, setShowPermissionsModal] = useState(false);
  const [selectedRoleForPermissions, setSelectedRoleForPermissions] = useState(null);
  const [rolePermissions, setRolePermissions] = useState({});
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('manager');
  const [status, setStatus] = useState('Active');

  // Toast State
  const [toast, setToast] = useState({ show: false, type: '', message: '' });

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Field errors
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchRoles();
  }, []);

  // ===== ROLE CRUD OPERATIONS =====
  const fetchRoles = async () => {
    try {
      setLoading(true);
      const response = await roleService.getAllRoles();
      setRoles(response.roles || []);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoleById = async (roleId) => {
    try {
      setModalLoading(true);
      const response = await roleService.getRoleById(roleId);
      const roleData = response.role;
      
      setName(roleData.name || '');
      setEmail(roleData.email || '');
      setRole(roleData.role || 'manager');
      setStatus(roleData.status || 'Active');
      setPassword('');
      setConfirmPassword('');
      
      setSelectedRole(roleData);
    } catch (err) {
      showToast('error', err.message || 'Failed to fetch role details');
    } finally {
      setModalLoading(false);
    }
  };

  // ===== PERMISSIONS OPERATIONS WITH ARRAY =====
  const handleOpenPermissions = (role) => {
    setSelectedRoleForPermissions(role);
    fetchRolePermissions(role._id);
    setShowPermissionsModal(true);
  };

  const fetchRolePermissions = async (roleId) => {
    try {
      setLoadingPermissions(true);
      const response = await API.get(`/permissions/role/${roleId}`);
      
      // Permissions object banao
      const perms = {};
      if (response.data.permissions) {
        response.data.permissions.forEach(p => {
          if (p.canAccess) {
            perms[p.pageId] = true;
          }
        });
      }
      
      setRolePermissions(perms);
      
      // Role ka permissions array update karo
      if (response.data.role) {
        setSelectedRoleForPermissions(prev => ({
          ...prev,
          permissions: response.data.role.permissionsArray || []
        }));
      }
      
      console.log('Permissions Array:', response.data.role?.permissionsArray);
      
    } catch (error) {
      console.error('Error fetching permissions:', error);
      showToast('error', 'Failed to load permissions');
    } finally {
      setLoadingPermissions(false);
    }
  };

  const handleTogglePermission = async (pageId, pageName) => {
    try {
      const response = await API.post('/permissions/toggle', {
        roleId: selectedRoleForPermissions._id,
        pageId,
        pageName
      });
      
      if (response.data.success) {
        // Update permissions object
        setRolePermissions(prev => ({
          ...prev,
          [pageId]: response.data.permission.canAccess
        }));
        
        // Update selected role's permissions array
        setSelectedRoleForPermissions(prev => ({
          ...prev,
          permissions: response.data.permissionsArray || []
        }));
        
        showToast('success', response.data.message);
        
        console.log('Updated Permissions Array:', response.data.permissionsArray);
      }
    } catch (error) {
      console.error('Error toggling permission:', error);
      showToast('error', 'Failed to update permission');
    }
  };

  const handleSelectAllInCategory = async (category) => {
    const categoryPages = ALL_PAGES.filter(p => p.category === category);
    const newPermissions = { ...rolePermissions };
    const pageIds = [];
    
    categoryPages.forEach(page => {
      newPermissions[page.id] = true;
      pageIds.push(page.id);
    });
    
    setRolePermissions(newPermissions);
    
    // Bulk update permissions
    try {
      const currentPerms = selectedRoleForPermissions.permissions || [];
      const allPageIds = [...new Set([...currentPerms, ...pageIds])];
      
      const response = await API.post('/permissions/bulk', {
        roleId: selectedRoleForPermissions._id,
        pageIds: allPageIds
      });
      
      if (response.data.success) {
        setSelectedRoleForPermissions(prev => ({
          ...prev,
          permissions: response.data.permissionsArray || []
        }));
        showToast('success', `All ${category} pages selected`);
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      showToast('error', 'Failed to update permissions');
    }
  };

  const handleDeselectAllInCategory = async (category) => {
    const categoryPages = ALL_PAGES.filter(p => p.category === category);
    const newPermissions = { ...rolePermissions };
    const pageIdsToRemove = categoryPages.map(p => p.id);
    
    categoryPages.forEach(page => {
      newPermissions[page.id] = false;
    });
    
    setRolePermissions(newPermissions);
    
    // Bulk remove permissions
    try {
      const currentPerms = selectedRoleForPermissions.permissions || [];
      const updatedPerms = currentPerms.filter(id => !pageIdsToRemove.includes(id));
      
      const response = await API.post('/permissions/bulk', {
        roleId: selectedRoleForPermissions._id,
        pageIds: updatedPerms
      });
      
      if (response.data.success) {
        setSelectedRoleForPermissions(prev => ({
          ...prev,
          permissions: response.data.permissionsArray || []
        }));
        showToast('success', `All ${category} pages deselected`);
      }
    } catch (error) {
      console.error('Error in bulk update:', error);
      showToast('error', 'Failed to update permissions');
    }
  };

  // ===== HELPER FUNCTIONS =====
  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 3000);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('manager');
    setStatus('Active');
    setErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSelectedRole(null);
  };

  const openAddModal = () => {
    resetForm();
    setModalMode('add');
    setShowModal(true);
  };

  const openViewModal = async (roleId) => {
    setModalMode('view');
    setShowModal(true);
    await fetchRoleById(roleId);
  };

  const openEditModal = async (roleId) => {
    setModalMode('edit');
    setShowModal(true);
    await fetchRoleById(roleId);
  };

  const validateForm = (isEditMode) => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Name is required';
    } else if (name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!isEditMode || (isEditMode && password)) {
      if (password && password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      if (password && !confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (password && confirmPassword && password !== confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(false)) {
      return;
    }

    try {
      setModalLoading(true);

      const roleData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: password,
        role: role
      };

      const response = await roleService.createRole(roleData);
      showToast('success', response.message || 'Role created successfully');
      await fetchRoles();
      setShowModal(false);
      resetForm();

    } catch (err) {
      showToast('error', err.message || 'Failed to create role');
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm(true)) {
      return;
    }

    if (!selectedRole) return;

    try {
      setModalLoading(true);

      const roleData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        role: role,
        status: status
      };

      if (password) {
        roleData.password = password;
      }

      const response = await roleService.updateRole(selectedRole._id, roleData);
      showToast('success', response.message || 'Role updated successfully');
      await fetchRoles();
      setShowModal(false);
      resetForm();

    } catch (err) {
      showToast('error', err.message || 'Failed to update role');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteRole = async (roleId) => {
    if (!window.confirm('Are you sure you want to delete this role?')) {
      return;
    }

    try {
      await roleService.deleteRole(roleId);
      showToast('success', 'Role deleted successfully');
      await fetchRoles();
    } catch (err) {
      showToast('error', err.message || 'Failed to delete role');
    }
  };

  // Filter roles based on search
  const filteredRoles = roles.filter(roleItem => {
    const term = searchTerm.toLowerCase();
    return (
      roleItem.name?.toLowerCase().includes(term) ||
      roleItem.email?.toLowerCase().includes(term) ||
      roleItem.role?.toLowerCase().includes(term)
    );
  });

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getModalTitle = () => {
    switch(modalMode) {
      case 'add': return 'Add New Role';
      case 'edit': return 'Edit Role';
      case 'view': return 'View Role Details';
      default: return 'Role';
    }
  };

  return (
    <div className="role-page-permission">
      <Sidebar />
      
      <div className="role-page-permission-content">
        {/* Toast Message */}
        {toast.show && (
          <div className={`role-page-permission-toast ${toast.type}`}>
            <div className="role-page-permission-toast-content">
              {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
              <span>{toast.message}</span>
            </div>
            <button 
              className="role-page-permission-toast-close" 
              onClick={() => setToast({ ...toast, show: false })}
            >
              <FaTimes />
            </button>
          </div>
        )}

        {/* Header */}
        <div className="role-page-permission-header">
          <div className="role-page-permission-header-left">
            <h1><FaShieldAlt /> Role Management</h1>
            <p>Manage system roles and permissions</p>
          </div>
          <button 
            className="role-page-permission-add-btn"
            onClick={openAddModal}
          >
            <FaUserPlus /> Add New Role
          </button>
        </div>

        {/* Search Bar */}
        <div className="role-page-permission-search-section">
          <div className="role-page-permission-search-wrapper">
            <FaSearch className="role-page-permission-search-icon" />
            <input
              type="text"
              className="role-page-permission-search-input"
              placeholder="Search by name, email or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="role-page-permission-clear-search" 
                onClick={() => setSearchTerm('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="role-page-permission-stats-grid">
          <div className="role-page-permission-stat-card">
            <div className="role-page-permission-stat-icon total">
              <FaUserTag />
            </div>
            <div className="role-page-permission-stat-info">
              <span className="role-page-permission-stat-label">Total Roles</span>
              <span className="role-page-permission-stat-value">{roles.length}</span>
            </div>
          </div>
          <div className="role-page-permission-stat-card">
            <div className="role-page-permission-stat-icon active">
              <FaShieldAlt />
            </div>
            <div className="role-page-permission-stat-info">
              <span className="role-page-permission-stat-label">Active Roles</span>
              <span className="role-page-permission-stat-value">
                {roles.filter(r => r.status !== 'Inactive').length}
              </span>
            </div>
          </div>
          <div className="role-page-permission-stat-card">
            <div className="role-page-permission-stat-icon pending">
              <FaCalendarAlt />
            </div>
            <div className="role-page-permission-stat-info">
              <span className="role-page-permission-stat-label">Created Today</span>
              <span className="role-page-permission-stat-value">
                {roles.filter(r => {
                  const today = new Date().toDateString();
                  return new Date(r.createdAt).toDateString() === today;
                }).length}
              </span>
            </div>
          </div>
        </div>

        {/* Roles Table */}
        {loading ? (
          <div className="role-page-permission-loading-state">
            <div className="role-page-permission-spinner"></div>
            <p>Loading roles...</p>
          </div>
        ) : filteredRoles.length === 0 ? (
          <div className="role-page-permission-empty-state">
            <FaUserCircle size={60} />
            <h3>No roles found</h3>
            <p>
              {searchTerm 
                ? 'Try adjusting your search' 
                : 'Click "Add New Role" to create your first role'}
            </p>
            {searchTerm && (
              <button 
                className="role-page-permission-clear-btn" 
                onClick={() => setSearchTerm('')}
              >
                <FaTimes /> Clear Search
              </button>
            )}
          </div>
        ) : (
          <div className="role-page-permission-table-wrapper">
            <table className="role-page-permission-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoles.map((roleItem, index) => (
                  <tr key={roleItem._id}>
                    <td>
                      <span className="role-page-permission-id-badge">{index + 1}</span>
                    </td>
                    <td>
                      <div className="role-page-permission-name-cell">
                        <span className="role-page-permission-avatar">
                          {roleItem.name?.charAt(0).toUpperCase()}
                        </span>
                        <span>{roleItem.name}</span>
                      </div>
                    </td>
                    <td>{roleItem.email}</td>
                    <td>
                      <span className={`role-page-permission-role-badge ${roleItem.role || 'user'}`}>
                        {roleItem.role || 'User'}
                      </span>
                    </td>
                    <td>
                      <span className={`role-page-permission-status-badge ${roleItem.status?.toLowerCase() || 'active'}`}>
                        {roleItem.status || 'Active'}
                      </span>
                    </td>
                    <td>{formatDate(roleItem.createdAt)}</td>
                    <td>
                      <div className="role-page-permission-actions">
                        <button 
                          className="role-page-permission-action-btn view"
                          onClick={() => openViewModal(roleItem._id)}
                          title="View Details"
                        >
                          <FaEye />
                        </button>
                        <button 
                          className="role-page-permission-action-btn edit"
                          onClick={() => openEditModal(roleItem._id)}
                          title="Edit Role"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="role-page-permission-action-btn permissions"
                          onClick={() => handleOpenPermissions(roleItem)}
                          title="Manage Page Permissions"
                        >
                          <FaShieldAlt />
                        </button>
                        <button 
                          className="role-page-permission-action-btn delete"
                          onClick={() => handleDeleteRole(roleItem._id)}
                          title="Delete Role"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Role Modal - Add/Edit/View */}
        {showModal && (
          <div 
            className="role-page-permission-modal-overlay" 
            onClick={() => {
              if (!modalLoading) {
                setShowModal(false);
                resetForm();
              }
            }}
          >
            <div 
              className="role-page-permission-modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="role-page-permission-modal-header">
                <h3>
                  {modalMode === 'add' && <><FaUserPlus /> {getModalTitle()}</>}
                  {modalMode === 'edit' && <><FaEdit /> {getModalTitle()}</>}
                  {modalMode === 'view' && <><FaEye /> {getModalTitle()}</>}
                </h3>
                <button 
                  className="role-page-permission-modal-close"
                  onClick={() => {
                    if (!modalLoading) {
                      setShowModal(false);
                      resetForm();
                    }
                  }}
                  disabled={modalLoading}
                >
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={modalMode === 'add' ? handleCreateSubmit : handleUpdateSubmit}>
                <div className="role-page-permission-modal-body">
                  {modalLoading && (
                    <div className="role-page-permission-modal-loading">
                      <FaSpinner className="spinning" />
                      <p>Loading...</p>
                    </div>
                  )}

                  {!modalLoading && (
                    <>
                      <div className="role-page-permission-form-group">
                        <label>
                          <FaUserCircle /> Full Name 
                          {modalMode !== 'view' && <span className="required">*</span>}
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Enter full name"
                          disabled={modalLoading || modalMode === 'view'}
                          className={errors.name ? 'error' : ''}
                          readOnly={modalMode === 'view'}
                        />
                        {errors.name && <small className="error-text">{errors.name}</small>}
                      </div>

                      <div className="role-page-permission-form-group">
                        <label>
                          <FaEnvelope /> Email Address 
                          {modalMode !== 'view' && <span className="required">*</span>}
                        </label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Enter email address"
                          disabled={modalLoading || modalMode === 'view'}
                          className={errors.email ? 'error' : ''}
                          readOnly={modalMode === 'view'}
                        />
                        {errors.email && <small className="error-text">{errors.email}</small>}
                      </div>

                      <div className="role-page-permission-form-group">
                        <label>
                          <FaShieldAlt /> Role Type
                          {modalMode !== 'view' && <span className="optional">(Optional)</span>}
                        </label>
                        <select
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          disabled={modalLoading || modalMode === 'view'}
                          className="role-page-permission-select"
                        >
                          <option value="admin">Admin</option>
                          <option value="manager">Manager</option>
                          <option value="supervisor">Supervisor</option>
                          <option value="user">User</option>
                        </select>
                      </div>

                      {(modalMode === 'edit' || modalMode === 'view') && (
                        <div className="role-page-permission-form-group">
                          <label>
                            <FaShieldAlt /> Status
                          </label>
                          {modalMode === 'view' ? (
                            <div className="role-page-permission-view-field">
                              <span className={`role-page-permission-status-badge ${status?.toLowerCase()}`}>
                                {status}
                              </span>
                            </div>
                          ) : (
                            <select
                              value={status}
                              onChange={(e) => setStatus(e.target.value)}
                              disabled={modalLoading}
                              className="role-page-permission-select"
                            >
                              <option value="Active">Active</option>
                              <option value="Inactive">Inactive</option>
                              <option value="Suspended">Suspended</option>
                            </select>
                          )}
                        </div>
                      )}

                      {modalMode !== 'view' && (
                        <>
                          <div className="role-page-permission-form-group">
                            <label>
                              <FaLock /> Password 
                              {modalMode === 'add' && <span className="required">*</span>}
                              {modalMode === 'edit' && <span className="optional">(Leave blank to keep current)</span>}
                            </label>
                            <div className="role-page-permission-password-wrapper">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={modalMode === 'add' ? "Enter password" : "Enter new password (optional)"}
                                disabled={modalLoading}
                                className={errors.password ? 'error' : ''}
                              />
                              <button
                                type="button"
                                className="role-page-permission-password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                                disabled={modalLoading}
                              >
                                {showPassword ? 'Hide' : 'Show'}
                              </button>
                            </div>
                            {errors.password && <small className="error-text">{errors.password}</small>}
                          </div>

                          <div className="role-page-permission-form-group">
                            <label>
                              <FaLock /> Confirm Password 
                              {(modalMode === 'add' || (modalMode === 'edit' && password)) && <span className="required">*</span>}
                            </label>
                            <div className="role-page-permission-password-wrapper">
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm password"
                                disabled={modalLoading}
                                className={errors.confirmPassword ? 'error' : ''}
                              />
                              <button
                                type="button"
                                className="role-page-permission-password-toggle"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                disabled={modalLoading}
                              >
                                {showConfirmPassword ? 'Hide' : 'Show'}
                              </button>
                            </div>
                            {errors.confirmPassword && <small className="error-text">{errors.confirmPassword}</small>}
                          </div>
                        </>
                      )}

                      {modalMode === 'view' && selectedRole && (
                        <div className="role-page-permission-view-section">
                          <div className="role-page-permission-view-row">
                            <span className="role-page-permission-view-label">Role ID:</span>
                            <span className="role-page-permission-view-value">{selectedRole._id}</span>
                          </div>
                          <div className="role-page-permission-view-row">
                            <span className="role-page-permission-view-label">Created At:</span>
                            <span className="role-page-permission-view-value">{formatDate(selectedRole.createdAt)}</span>
                          </div>
                          <div className="role-page-permission-view-row">
                            <span className="role-page-permission-view-label">Last Updated:</span>
                            <span className="role-page-permission-view-value">{formatDate(selectedRole.updatedAt)}</span>
                          </div>
                          <div className="role-page-permission-view-row">
                            <span className="role-page-permission-view-label">Permissions Array:</span>
                            <span className="role-page-permission-view-value">
                              {selectedRole.permissions?.length || 0} pages
                            </span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div className="role-page-permission-modal-footer">
                  <button
                    type="button"
                    className="role-page-permission-cancel-btn"
                    onClick={() => {
                      if (!modalLoading) {
                        setShowModal(false);
                        resetForm();
                      }
                    }}
                    disabled={modalLoading}
                  >
                    {modalMode === 'view' ? 'Close' : 'Cancel'}
                  </button>
                  
                  {modalMode !== 'view' && (
                    <button
                      type="submit"
                      className="role-page-permission-submit-btn"
                      disabled={modalLoading}
                    >
                      {modalLoading ? (
                        <><FaSpinner className="spinning" /> {modalMode === 'add' ? 'Creating...' : 'Updating...'}</>
                      ) : (
                        <>{modalMode === 'add' ? 'Create Role' : 'Update Role'}</>
                      )}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ===== PERMISSIONS MODAL WITH TOGGLE SWITCH ===== */}
        {showPermissionsModal && selectedRoleForPermissions && (
          <div className="role-page-permission-modal-overlay" onClick={() => setShowPermissionsModal(false)}>
            <div className="role-page-permission-modal-content permissions-modal" onClick={e => e.stopPropagation()}>
              <div className="role-page-permission-permissions-header">
                <h3>
                  <FaShieldAlt /> Manage Permissions
                </h3>
                <button className="role-page-permission-modal-close" onClick={() => setShowPermissionsModal(false)}>
                  <FaTimes />
                </button>
              </div>
              
              <div className="role-page-permission-permissions-body">
                <div className="role-page-permission-role-info">
                  <div>
                    <h4>{selectedRoleForPermissions.name}</h4>
                    <p className="role-email">{selectedRoleForPermissions.email}</p>
                    
                    {/* Permissions Array Display */}
                    <div className="role-page-permission-array-box">
                      <div className="role-page-permission-array-header">
                        <span className="array-label">Permissions Array:</span>
                        <span className="array-count">
                          {selectedRoleForPermissions.permissions?.length || 0} pages
                        </span>
                      </div>
                      
                      {selectedRoleForPermissions.permissions?.length > 0 ? (
                        <div className="role-page-permission-array-items">
                          {selectedRoleForPermissions.permissions.slice(0, 5).map((perm, idx) => (
                            <span key={idx} className="role-page-permission-array-item" title={perm}>
                              {perm.length > 15 ? perm.substring(0, 12) + '...' : perm}
                            </span>
                          ))}
                          {selectedRoleForPermissions.permissions.length > 5 && (
                            <span className="role-page-permission-array-item more">
                              +{selectedRoleForPermissions.permissions.length - 5} more
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="role-page-permission-array-empty">No permissions in array</p>
                      )}
                    </div>
                  </div>
                  <span className={`role-page-permission-role-type-badge ${selectedRoleForPermissions.role}`}>
                    {selectedRoleForPermissions.role}
                  </span>
                </div>
                
                {loadingPermissions ? (
                  <div className="role-page-permission-permissions-loading">
                    <FaSpinner className="spinning" />
                    <p>Loading permissions...</p>
                  </div>
                ) : (
                  <div className="role-page-permission-permissions-list">
                    {Object.keys(CATEGORIES).map(catKey => {
                      const category = CATEGORIES[catKey];
                      const categoryPages = ALL_PAGES.filter(p => p.category === catKey);
                      
                      if (categoryPages.length === 0) return null;
                      
                      const selectedCount = categoryPages.filter(p => rolePermissions[p.id]).length;
                      
                      return (
                        <div key={catKey} className="role-page-permission-category">
                          <div className="role-page-permission-category-header" style={{ borderLeftColor: category.color }}>
                            <div className="role-page-permission-category-info">
                              <span className="role-page-permission-category-icon">
                                {category.icon}
                              </span>
                              <h4>{category.name}</h4>
                              <span className="role-page-permission-category-count">
                                ({selectedCount}/{categoryPages.length})
                              </span>
                            </div>
                            
                            <div className="role-page-permission-category-actions">
                              <button 
                                className="role-page-permission-select-all-btn"
                                onClick={() => handleSelectAllInCategory(catKey)}
                                title="Select All"
                              >
                                All
                              </button>
                              <button 
                                className="role-page-permission-select-none-btn"
                                onClick={() => handleDeselectAllInCategory(catKey)}
                                title="Select None"
                              >
                                None
                              </button>
                            </div>
                          </div>
                          
                          <div className="role-page-permission-category-pages">
                            {categoryPages.map(page => (
                              <div key={page.id} className="role-page-permission-permission-item">
                                <div className="role-page-permission-page-info">
                                  <span className="role-page-permission-page-icon">
                                    {page.icon}
                                  </span>
                                  <span className="role-page-permission-page-name">{page.name}</span>
                                </div>
                                
                                <div className="role-page-permission-permission-action">
                                  <span className={`role-page-permission-permission-status ${rolePermissions[page.id] ? 'granted' : ''}`}>
                                    {rolePermissions[page.id] ? 'On' : 'Off'}
                                  </span>
                                  <label className="role-page-permission-toggle-switch">
                                    <input
                                      type="checkbox"
                                      checked={rolePermissions[page.id] || false}
                                      onChange={() => handleTogglePermission(page.id, page.name)}
                                    />
                                    <span className="role-page-permission-toggle-slider"></span>
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
              
              <div className="role-page-permission-permissions-footer">
                <button className="role-page-permission-btn-done" onClick={() => setShowPermissionsModal(false)}>
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Roles;