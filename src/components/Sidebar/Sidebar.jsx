import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API from '../../api/axios';
import './Sidebar.css';



import { 
  FiHome, FiBarChart2, FiUsers, FiFolder, FiCalendar, 
  FiMessageSquare, FiSettings, FiLogOut,
  FiChevronDown, FiChevronRight, FiActivity, FiFileText,
  FiPieChart, FiUser, FiMail, FiCheckCircle,
  FiClock, FiStar, FiBell, FiShield, FiDatabase, FiServer,
  FiDollarSign, FiShoppingCart, FiUserPlus, FiUserCheck,
  FiUserX, FiUserMinus, FiCreditCard, FiBriefcase,
  FiMenu, FiX, FiTool, FiAward, FiEye, FiPackage, FiFilePlus,
  FiAlertCircle  // ← Added FiAlertCircle
} from 'react-icons/fi';

import { FaUserCircle, FaWrench, FaMoneyBillWave, FaUserTag, FaFileInvoice } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const adminToken = localStorage.getItem('adminToken');
  const roleToken = localStorage.getItem('roleToken');
  const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
  const roleUser = JSON.parse(localStorage.getItem('roleUser') || 'null');
  
  const userType = adminToken ? 'admin' : (roleToken ? 'role' : null);
  const user = adminUser || roleUser;
  const userRole = user?.role || 'admin';
  
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [menuItems, setMenuItems] = useState([]);
  
  const [userData, setUserData] = useState({
    name: user?.name || (userType === 'admin' ? 'Admin' : 'Role User'),
    email: user?.email || (userType === 'admin' ? 'admin@example.com' : 'user@example.com'),
    role: userRole
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState(['dashboard']);

  useEffect(() => {
    fetchUserData();
    if (userType === 'role') {
      loadUserPermissions();
    }
  }, []);

  useEffect(() => {
    // Update menu items when permissions change
    if (userType === 'role') {
      const filteredMenu = getFilteredRoleMenuItems();
      setMenuItems(filteredMenu);
    } else {
      setMenuItems(adminMenuItems);
    }
  }, [userPermissions]);

  useEffect(() => {
    // Set active menu based on current path
    const path = location.pathname;
    const currentMenuItems = userType === 'admin' ? adminMenuItems : menuItems;
    
    for (const item of currentMenuItems) {
      if (item.path === path) {
        setActiveItem(item.id);
        break;
      }
      if (item.subMenu) {
        for (const subItem of item.subMenu) {
          if (subItem.path === path) {
            setActiveItem(item.id);
            setActiveSubItem(subItem.id);
            setExpandedMenus(prev => [...new Set([...prev, item.id])]);
            break;
          }
        }
      }
    }
  }, [location.pathname, menuItems]);

  const fetchUserData = async () => {
    try {
      if (userType === 'admin') {
        const token = localStorage.getItem('adminToken');
        if (!token) return;

        const response = await API.get('/admin/profile', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        const userData = response.data.user;
        setUserData({
          name: userData.name || 'Admin',
          email: userData.email || 'admin@example.com',
          role: 'admin'
        });
      } else if (userType === 'role') {
        const user = JSON.parse(localStorage.getItem('roleUser') || '{}');
        
        setUserData({
          name: user.name || 'Role User',
          email: user.email || 'user@example.com',
          role: user.role || 'manager'
        });
        
        // Load permissions from stored user
        if (user.permissionsArray) {
          setUserPermissions(user.permissionsArray);
          console.log('✅ Permissions loaded from storage:', user.permissionsArray);
        }
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  const loadUserPermissions = async () => {
    try {
      setLoading(true);
      
      // First try to get permissions from stored user
      const storedUser = JSON.parse(localStorage.getItem('roleUser') || '{}');
      if (storedUser.permissionsArray && storedUser.permissionsArray.length > 0) {
        console.log('📦 Using stored permissions:', storedUser.permissionsArray);
        setUserPermissions(storedUser.permissionsArray);
        setLoading(false);
        return;
      }
      
      // If not in storage, fetch from API
      let roleId = storedUser.id || storedUser._id;
      
      if (!roleId) {
        console.warn('⚠️ No role ID found');
        setLoading(false);
        return;
      }
      
      console.log('🔍 Fetching permissions for role ID:', roleId);
      
      const token = localStorage.getItem('roleToken');
      const response = await API.get(`/permissions/role/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('📦 Permissions API response:', response.data);
      
      if (response.data.success) {
        let permsArray = [];
        
        if (response.data.role?.permissionsArray) {
          permsArray = response.data.role.permissionsArray;
        } else if (response.data.permissionsArray) {
          permsArray = response.data.permissionsArray;
        } else if (response.data.permissions) {
          permsArray = response.data.permissions.map(p => p.pageId);
        }
        
        console.log('✅ Permissions loaded from API:', permsArray);
        setUserPermissions(permsArray);
        
        // Update stored user
        storedUser.permissionsArray = permsArray;
        localStorage.setItem('roleUser', JSON.stringify(storedUser));
      } else {
        console.warn('⚠️ No permissions found in API response');
        setUserPermissions([]);
      }
      
    } catch (error) {
      console.error('❌ Error fetching permissions:', error);
      if (error.response?.status === 401) {
        console.log('🔐 Token expired, logging out...');
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        window.location.href = '/roles-login';
      }
    } finally {
      setLoading(false);
    }
  };

  // Check if user has permission for a page
  const hasPermission = (pageId) => {
    if (userType === 'admin') return true;
    
    if (!pageId) return false;
    
    // Super admin has all permissions
    if (userRole === 'super-admin') return true;
    
    // Check if pageId exists in permissions array
    const hasPerm = userPermissions.includes(pageId);
    
    if (!hasPerm) {
      console.log(`❌ No permission for: ${pageId}`);
    }
    
    return hasPerm;
  };

  // Define all possible menu items with their page IDs
  const adminMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <FiHome />,
      pageId: 'dashboard',
      subMenu: [
        { 
          id: 'main-dashboard', 
          title: 'Main Dashboard', 
          icon: <FiBarChart2 />, 
          path: '/Admin-Dashboard-overall',
          pageId: 'admin-dashboard'
        },
      ]
    },
    {
      id: 'quotation',
      title: 'Quotation',
      icon: <FaFileInvoice />,
      pageId: 'quotation',
      subMenu: [
        { 
          id: 'add-material', 
          title: 'Add Material', 
          icon: <FiPackage />, 
          path: '/Admin-Material',
          pageId: 'admin-material'
        },
        { 
          id: 'add-quotation', 
          title: 'Add Quotation', 
          icon: <FiFilePlus />, 
          path: '/QuotationCustomer',
          pageId: 'quotation-customer'
        },
        { 
          id: 'all-quotations', 
          title: 'All Quotations', 
          icon: <FiFileText />, 
          path: '/all-Quotation',
          pageId: 'all-quotations'
        },
      ]
    },
    {
      id: 'customer',
      title: 'Customer',
      icon: <FiUsers />,
      pageId: 'customer',
      subMenu: [
        { 
          id: 'all-customer', 
          title: 'All Customers', 
          icon: <FiUser />, 
          path: '/admin-all-customer',
          pageId: 'all-customers'
        },
        { 
          id: 'add-customer', 
          title: 'Add Customers', 
          icon: <FiUserPlus />, 
          path: '/Admin-Add-customer',
          pageId: 'add-customer'
        },
      ]
    },
    {
      id: 'labor',
      title: 'Labor',
      icon: <FiBriefcase />,
      pageId: 'labor',
      subMenu: [
        { 
          id: 'all-labor', 
          title: 'All Labor', 
          icon: <FiUsers />, 
          path: '/All-Labor',
          pageId: 'all-labor'
        },
        { 
          id: 'add-labor', 
          title: 'Add Labor', 
          icon: <FiUserPlus />, 
          path: '/Add-Labor',
          pageId: 'add-labor'
        },
        { 
          id: 'labor-attendance', 
          title: 'Labor Attendance', 
          icon: <FiClock />, 
          path: '/Attendance-Page',
          pageId: 'attendance'
        },
      ]
    },
    {
      id: 'roles',
      title: 'Roles',
      icon: <FiAward />,
      pageId: 'roles',
      subMenu: [
        { 
          id: 'add-role', 
          title: 'Add Role', 
          icon: <FiUserPlus />, 
          path: '/add-roles',
          pageId: 'roles-management'
        },
      ]
    },
    { 
      id: 'expenses', 
      title: 'Expenses', 
      icon: <FiDollarSign />, 
      path: '/admin-expenses',
      pageId: 'admin-expenses'
    },
    { 
      id: 'payments', 
      title: 'Payments', 
      icon: <FiCreditCard />, 
      path: '/Admin-Payment',
      pageId: 'admin-payment'
    },
    { 
      id: 'all-orders', 
      title: 'All Orders', 
      icon: <FiShoppingCart />, 
      path: '/All-Orders',
      pageId: 'all-orders'
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <FiSettings />,
      pageId: 'settings',
      subMenu: [
        { 
          id: 'account-settings', 
          title: 'Account Settings', 
          icon: <FaUserCircle />, 
          path: '/Admin-Account-Settings',
          pageId: 'account-settings'
        },
        { 
          id: 'profile', 
          title: 'Profile', 
          icon: <FiUser />, 
          path: '/Admin-Profile-custoize',
          pageId: 'profile'
        },
        { 
          id: 'theme-settings', 
          title: 'Theme Settings', 
          icon: <FiBell />, 
          path: '/Theme-Settings',
          pageId: 'theme-settings'
        },
      ]
    }
  ];

  const roleMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <FiHome />,
      pageId: 'dashboard',
      subMenu: [
        { 
          id: 'main-dashboard', 
          title: 'Main Dashboard', 
          icon: <FiBarChart2 />, 
          path: '/Role-dashboard',
          pageId: 'role-dashboard'
        },
      ]
    },
    {
      id: 'customer',
      title: 'Customer',
      icon: <FiUsers />,
      pageId: 'customer',
      subMenu: [
        { 
          id: 'all-customer', 
          title: 'All Customers', 
          icon: <FiUser />, 
          path: '/role-customers',
          pageId: 'role-customers'
        },
        { 
          id: 'add-customer', 
          title: 'Add Customers', 
          icon: <FiUserPlus />, 
          path: '/Role-Add-Customer',
          pageId: 'role-add-customer'
        },
      ]
    },
    {
      id: 'labor',
      title: 'Labor',
      icon: <FiBriefcase />,
      pageId: 'labor',
      subMenu: [
        { 
          id: 'all-labor', 
          title: 'All Labor', 
          icon: <FiUsers />, 
          path: '/role-labor',
          pageId: 'role-labor'
        },
        { 
          id: 'add-labor', 
          title: 'Add Labor', 
          icon: <FiUserPlus />, 
          path: '/role-add-labor',
          pageId: 'role-add-labor'
        },
        { 
          id: 'labor-attendance', 
          title: 'Labor Attendance', 
          icon: <FiClock />, 
          path: '/role-attendance',
          pageId: 'role-attendance'
        },
      ]
    },
    { 
      id: 'all-orders', 
      title: 'All Orders', 
      icon: <FiShoppingCart />, 
      path: '/role-orders',
      pageId: 'role-orders'
    },
    {
      id: 'quotation',
      title: 'Quotation',
      icon: <FaFileInvoice />,
      pageId: 'quotation',
      subMenu: [
        { 
          id: 'all-quotations', 
          title: 'All Quotations', 
          icon: <FiFileText />, 
          path: '/role-quotations',
          pageId: 'role-quotations'
        },
      ]
    }
  ];

  // Filter role menu items based on permissions
  const getFilteredRoleMenuItems = () => {
    console.log('🔍 Filtering menu items with permissions:', userPermissions);
    
    const filtered = roleMenuItems.filter(item => {
      // If item has no submenu, check its own permission
      if (!item.subMenu || item.subMenu.length === 0) {
        return hasPermission(item.pageId);
      }
      
      // If item has submenu, check if any subitem has permission
      const hasAnySubPermission = item.subMenu.some(subItem => {
        return hasPermission(subItem.pageId);
      });
      
      return hasAnySubPermission;
    });

    // Filter submenus
    const filteredWithSubmenus = filtered.map(item => {
      if (item.subMenu && item.subMenu.length > 0) {
        const filteredSubMenu = item.subMenu.filter(subItem => {
          return hasPermission(subItem.pageId);
        });
        
        return {
          ...item,
          subMenu: filteredSubMenu
        };
      }
      return item;
    }).filter(item => {
      // Remove items that have empty submenus
      if (item.subMenu && item.subMenu.length === 0) {
        return false;
      }
      return true;
    });

    console.log('✅ Filtered menu items:', filteredWithSubmenus);
    return filteredWithSubmenus;
  };

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      closeSidebar();
    }
  };

  const toggleSubMenu = (menuId) => {
    setExpandedMenus(prev =>
      prev.includes(menuId)
        ? prev.filter(id => id !== menuId)
        : [...prev, menuId]
    );
  };

  const handleMenuItemClick = (item) => {
    setActiveItem(item.id);
    if (item.path && !item.subMenu) {
      if (userType === 'admin' || hasPermission(item.pageId)) {
        navigate(item.path);
      } else {
        console.log('❌ No permission for:', item.pageId);
        navigate('/no-permission');
      }
    }
    if (item.subMenu) toggleSubMenu(item.id);
  };

  const handleSubMenuItemClick = (subItem) => {
    setActiveSubItem(subItem.id);
    if (userType === 'admin' || hasPermission(subItem.pageId)) {
      if (subItem.path) {
        console.log('✅ Navigating to:', subItem.path);
        navigate(subItem.path);
      }
    } else {
      console.log('❌ No permission for subitem:', subItem.pageId);
      navigate('/no-permission');
    }
  };

  const getUserDisplay = () => {
    if (userType === 'admin') {
      return {
        name: userData.name,
        email: userData.email,
        badge: '👑 Admin',
        badgeColor: '#3b82f6'
      };
    } else {
      const roleBadge = userRole === 'manager' ? '👔 Manager' : 
                        userRole === 'supervisor' ? '👁️ Supervisor' : 
                        userRole === 'data_entry' ? '📝 Data Entry' : '👤 User';
      return {
        name: userData.name,
        email: userData.email,
        badge: roleBadge,
        badgeColor: userRole === 'manager' ? '#8b5cf6' : '#10b981'
      };
    }
  };

  const userDisplay = getUserDisplay();

  if (userType === 'role' && loading) {
    return (
      <div className="sidebar-loading">
        <div className="loading-spinner"></div>
        <p>Loading permissions...</p>
      </div>
    );
  }

  return (
    <>
      <div className="mobile-navbar">
        <div className="mobile-logo">
          {userType === 'admin' ? 'Admin Panel' : 'Role Panel'}
        </div>
        <div className="mobile-menu-btn" onClick={openSidebar}>
          <FiMenu size={24} />
        </div>
      </div>

      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={handleOverlayClick}
        ></div>
      )}

      <div 
        className={`admin-sidebar ${isOpen ? 'show' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mobile-close-wrapper">
          <FiX 
            size={24} 
            className="mobile-close-btn" 
            onClick={closeSidebar}
          />
        </div>

        <div className="user-profile">
          <div className="user-avatar">
            <FaUserCircle />
          </div>
          <div className="user-info">
            <span className="user-name">{userDisplay.name}</span>
           
            <span className="user-email">{userDisplay.email}</span>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">
              {userType === 'admin' ? 'ADMIN MENU' : 'ROLE MENU'}
              {userType === 'role' && userPermissions.length > 0 && (
                <span className="menu-count">
                  ({menuItems.length} menus)
                </span>
              )}
            </h3>

            <ul className="nav-list">
              {menuItems.map(item => (
                <li key={item.id} className="nav-item-wrapper">
                  <div
                    className={`nav-item ${activeItem === item.id ? 'active' : ''}`}
                    onClick={() => handleMenuItemClick(item)}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-title">{item.title}</span>
                    {item.badge && <span className="nav-badge">{item.badge}</span>}
                    {item.subMenu && item.subMenu.length > 0 && (
                      <span className="nav-arrow">
                        {expandedMenus.includes(item.id) ? <FiChevronDown /> : <FiChevronRight />}
                      </span>
                    )}
                  </div>

                  {item.subMenu && expandedMenus.includes(item.id) && item.subMenu.length > 0 && (
                    <ul className="sub-menu">
                      {item.subMenu.map(subItem => (
                        <li
                          key={subItem.id}
                          className={`sub-menu-item ${activeSubItem === subItem.id ? 'active' : ''}`}
                          onClick={() => handleSubMenuItemClick(subItem)}
                        >
                          <span className="sub-menu-icon">{subItem.icon}</span>
                          <span className="sub-menu-title">{subItem.title}</span>
                          {subItem.badge && (
                            <span className="sub-menu-badge">{subItem.badge}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>

            {userType === 'role' && menuItems.length === 0 && !loading && (
              <div className="no-permissions-message">
                <FiAlertCircle className="no-perm-icon" />
                <p>No permissions assigned</p>
                <small>Please contact administrator to get access</small>
              </div>
            )}
          </div>
        </div>

        <div className="sidebar-footer">
          <button className="logout-btn" onClick={() => {
            if (userType === 'admin') {
              localStorage.removeItem('adminToken');
              localStorage.removeItem('user');
              navigate('/');
            } else {
              localStorage.removeItem('roleToken');
              localStorage.removeItem('roleUser');
              navigate('/roles-login');
            }
          }}>
            <FiLogOut className="logout-icon" />
            <span className="logout-text">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;