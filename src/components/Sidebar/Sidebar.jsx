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
  FiMenu, FiX, FiTool, FiAward, FiEye, FiPackage, FiFilePlus
} from 'react-icons/fi';

import { FaUserCircle, FaWrench, FaMoneyBillWave, FaUserTag, FaFileInvoice } from 'react-icons/fa';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ Get user info from localStorage
  const adminToken = localStorage.getItem('adminToken');
  const roleToken = localStorage.getItem('roleToken');
  const adminUser = JSON.parse(localStorage.getItem('user') || 'null');
  const roleUser = JSON.parse(localStorage.getItem('roleUser') || 'null');
  
  // ✅ Determine user type
  const userType = adminToken ? 'admin' : (roleToken ? 'role' : null);
  const user = adminUser || roleUser;
  const userRole = user?.role || 'admin';
  
  // ✅ State for permissions
  const [userPermissions, setUserPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [userData, setUserData] = useState({
    name: user?.name || (userType === 'admin' ? 'Admin' : 'Role User'),
    email: user?.email || (userType === 'admin' ? 'admin@example.com' : 'user@example.com'),
    role: userRole
  });

  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState('dashboard');
  const [activeSubItem, setActiveSubItem] = useState(null);
  const [expandedMenus, setExpandedMenus] = useState(['dashboard']);

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
    if (userType === 'role') {
      fetchUserPermissions();
    }
  }, []);

  // Set active menu based on current path
  useEffect(() => {
    const path = location.pathname;
    
    // Get filtered menu items based on user type
    const currentMenuItems = userType === 'admin' 
      ? adminMenuItems 
      : getFilteredRoleMenuItems();
    
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
            setExpandedMenus(prev => [...prev, item.id]);
            break;
          }
        }
      }
    }
  }, [location.pathname, userPermissions]);

  // Fetch user data from API
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
        const token = localStorage.getItem('roleToken');
        const user = JSON.parse(localStorage.getItem('roleUser') || '{}');
        
        setUserData({
          name: user.name || 'Role User',
          email: user.email || 'user@example.com',
          role: user.role || 'manager'
        });
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  };

  // ✅ Fetch user permissions for role
  const fetchUserPermissions = async () => {
    try {
      setLoading(true);
      const roleId = user?.id || roleUser?.id;
      if (!roleId) return;
      
      const response = await API.get(`/permissions/role/${roleId}`);
      
      if (response.data.success) {
        // Get permissions array
        const permsArray = response.data.role?.permissionsArray || [];
        setUserPermissions(permsArray);
        console.log('User Permissions:', permsArray);
      }
    } catch (error) {
      console.error('Error fetching permissions:', error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Check if user has permission for a page
  const hasPermission = (pageId) => {
    if (userType === 'admin') return true; // Admin ko sab permissions
    return userPermissions.includes(pageId);
  };

  // ✅ Filter role menu items based on permissions
  const getFilteredRoleMenuItems = () => {
    // Filter main menu items
    const filtered = roleMenuItems.filter(item => {
      // Check if main item has permission
      if (item.path) {
        const pageId = item.path.replace('/', '').replace(/-/g, '-');
        return hasPermission(pageId);
      }
      
      // If it has submenu, check if any submenu item has permission
      if (item.subMenu) {
        const hasAnySubPermission = item.subMenu.some(subItem => {
          const pageId = subItem.path.replace('/', '').replace(/-/g, '-');
          return hasPermission(pageId);
        });
        return hasAnySubPermission;
      }
      
      return false;
    });

    // Filter submenu items for each main item
    return filtered.map(item => {
      if (item.subMenu) {
        return {
          ...item,
          subMenu: item.subMenu.filter(subItem => {
            const pageId = subItem.path.replace('/', '').replace(/-/g, '-');
            return hasPermission(pageId);
          })
        };
      }
      return item;
    });
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

  // ✅ Admin Menu Items (Full Access)
  const adminMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <FiHome />,
      path: '/Admin-Dashboard-overall',
      pageId: 'admin-dashboard'
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

  // ✅ Role Menu Items (Will be filtered by permissions)
  const roleMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <FiHome />,
      path: '/Role-dashboard',
      pageId: 'role-dashboard'
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
          path: '/role-materials',
          pageId: 'admin-material'
        },
        { 
          id: 'add-quotation', 
          title: 'Add Quotation', 
          icon: <FiFilePlus />, 
          path: '/role-add-quotation',
          pageId: 'quotation-customer'
        },
        { 
          id: 'all-quotations', 
          title: 'All Quotations', 
          icon: <FiFileText />, 
          path: '/role-quotations',
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
      id: 'settings',
      title: 'Settings',
      icon: <FiSettings />,
      pageId: 'settings',
      subMenu: [
        { 
          id: 'profile', 
          title: 'Profile', 
          icon: <FiUser />, 
          path: '/role-profile',
          pageId: 'profile'
        },
      ]
    }
  ];

  // Get filtered menu based on user type
  const menuItems = userType === 'admin' 
    ? adminMenuItems 
    : getFilteredRoleMenuItems();

  const handleLogout = () => {
    if (userType === 'admin') {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('user');
      navigate('/');
    } else {
      localStorage.removeItem('roleToken');
      localStorage.removeItem('roleUser');
      navigate('/roles-login');
    }
  };

  const handleMenuItemClick = (item) => {
    setActiveItem(item.id);
    if (item.path) {
      // Check permission before navigating
      if (userType === 'admin' || hasPermission(item.pageId)) {
        navigate(item.path);
      }
    }
    if (item.subMenu) toggleSubMenu(item.id);
  };

  const handleSubMenuItemClick = (subItem) => {
    setActiveSubItem(subItem.id);
    // Check permission before navigating
    if (userType === 'admin' || hasPermission(subItem.pageId)) {
      if (subItem.path) navigate(subItem.path);
    }
  };

  // Get user display info
  const getUserDisplay = () => {
    if (userType === 'admin') {
      return {
        name: userData.name,
        email: userData.email,
        badge: '👑 Admin',
        badgeColor: '#3b82f6'
      };
    } else {
      return {
        name: userData.name,
        email: userData.email,
        badge: `👤 ${userRole}`,
        badgeColor: userRole === 'manager' ? '#8b5cf6' : '#10b981'
      };
    }
  };

  const userDisplay = getUserDisplay();

  // Loading state for permissions
  if (userType === 'role' && loading) {
    return (
      <div className="sidebar-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Navbar */}
      <div className="mobile-navbar">
        <div className="mobile-logo">
          {userType === 'admin' ? 'Admin Panel' : 'Role Panel'}
        </div>
        <div className="mobile-menu-btn" onClick={openSidebar}>
          <FiMenu size={24} />
        </div>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={handleOverlayClick}
        ></div>
      )}

      {/* Sidebar */}
      <div 
        className={`admin-sidebar ${isOpen ? 'show' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <div className="mobile-close-wrapper">
          <FiX 
            size={24} 
            className="mobile-close-btn" 
            onClick={closeSidebar}
          />
        </div>

        {/* User Profile with Role Badge */}
        <div className="user-profile">
          <div className="user-avatar">
            <FaUserCircle />
          </div>
          <div className="user-info">
            <span className="user-name">{userDisplay.name}</span>
            <span className="user-email">{userDisplay.email}</span>
            <span className="user-badge" style={{ backgroundColor: userDisplay.badgeColor }}>
              {userDisplay.badge}
            </span>
          </div>
        </div>

        {/* Main Menu */}
        <div className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">
              {userType === 'admin' ? 'ADMIN MENU' : 'ROLE MENU'}
              {userType === 'role' && (
                <span className="menu-count">
                  ({menuItems.length} items)
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

            {userType === 'role' && menuItems.length === 0 && (
              <div className="no-permissions-message">
                <p>No permissions available</p>
                <small>Contact administrator</small>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut className="logout-icon" />
            <span className="logout-text">Sign out</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;