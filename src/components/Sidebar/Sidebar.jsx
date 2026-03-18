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
  }, []);

  // Set active menu based on current path
  useEffect(() => {
    const path = location.pathname;
    
    // Find which menu item matches current path
    const allMenuItems = [...adminMenuItems, ...roleMenuItems];
    
    for (const item of allMenuItems) {
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
  }, [location.pathname]);

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

  // ✅ Admin Menu Items (with Quotation Menu)
  const adminMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <FiHome />,
      path: '/Admin-Dashboard-overall',
    },
    {
      id: 'quotation', // ✅ NEW QUOTATION MENU
      title: 'Quotation',
      icon: <FaFileInvoice />,
      subMenu: [
        { 
          id: 'add-material', 
          title: 'Add Material', 
          icon: <FiPackage />, 
          path: '/Admin-Material' 
        },
        { 
          id: 'add-quotation', 
          title: 'Add Quotation', 
          icon: <FiFilePlus />, 
          path: '/QuotationCustomer' 
        },
        { 
          id: 'all-quotations', 
          title: 'All Quotations', 
          icon: <FiFileText />, 
          path: '/all-Quotation' 
        },
      ]
    },
    {
      id: 'customer',
      title: 'Customer',
      icon: <FiUsers />,
      subMenu: [
        { id: 'all-customer', title: 'All Customers', icon: <FiUser />, path: '/admin-all-customer' },
        { id: 'add-customer', title: 'Add Customers', icon: <FiUserPlus />, path: '/Admin-Add-customer' },
      ]
    },
    {
      id: 'labor',
      title: 'Labor',
      icon: <FiBriefcase />,
      subMenu: [
        { id: 'all-labor', title: 'All Labor', icon: <FiUsers />, path: '/All-Labor' },
        { id: 'add-labor', title: 'Add Labor', icon: <FiUserPlus />, path: '/Add-Labor' },
        { id: 'labor-attendance', title: 'Labor Attendance', icon: <FiClock />, path: '/Attendance-Page' },
      ]
    },
    {
      id: 'roles',
      title: 'Roles',
      icon: <FiAward />,
      subMenu: [
        { id: 'add-role', title: 'Add Role', icon: <FiUserPlus />, path: '/add-roles' },
      ]
    },
    { id: 'expenses', title: 'Expenses', icon: <FiDollarSign />, path: '/admin-expenses' },
    { id: 'payments', title: 'Payments', icon: <FiCreditCard />, path: '/Admin-Payment' },
    { id: 'all-orders', title: 'All Orders', icon: <FiShoppingCart />, path: '/All-Orders' },
    {
      id: 'settings',
      title: 'Settings',
      icon: <FiSettings />,
      subMenu: [
        { id: 'account-settings', title: 'Account Settings', icon: <FaUserCircle />, path: '/Admin-Account-Settings' },
        { id: 'profile', title: 'Profile', icon: <FiUser />, path: '/Admin-Profile-custoize' },
        { id: 'theme-settings', title: 'Theme Settings', icon: <FiBell />, path: '/Theme-Settings' },
      ]
    }
  ];

  // ✅ Role Menu Items (with Quotation Menu for Role users)
  const roleMenuItems = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      icon: <FiHome />,
      path: '/Role-dashboard',
    },
    {
      id: 'quotation', // ✅ NEW QUOTATION MENU for Role
      title: 'Quotation',
      icon: <FaFileInvoice />,
      subMenu: [
        { 
          id: 'add-material', 
          title: 'Add Material', 
          icon: <FiPackage />, 
          path: '/role-materials' 
        },
        { 
          id: 'add-quotation', 
          title: 'Add Quotation', 
          icon: <FiFilePlus />, 
          path: '/role-add-quotation' 
        },
        { 
          id: 'all-quotations', 
          title: 'All Quotations', 
          icon: <FiFileText />, 
          path: '/role-quotations' 
        },
      ]
    },
    {
      id: 'customer',
      title: 'Customer',
      icon: <FiUsers />,
      subMenu: [
        { id: 'all-customer', title: 'All Customers', icon: <FiUser />, path: '/role-customers' },
        { id: 'add-customer', title: 'Add Customers', icon: <FiUserPlus />, path: '/Role-Add-Customer' },
      ]
    },
    {
      id: 'labor',
      title: 'Labor',
      icon: <FiBriefcase />,
      subMenu: [
        { id: 'all-labor', title: 'All Labor', icon: <FiUsers />, path: '/role-labor' },
        { id: 'add-labor', title: 'Add Labor', icon: <FiUserPlus />, path: '/role-add-labor' },
        { id: 'labor-attendance', title: 'Labor Attendance', icon: <FiClock />, path: '/role-attendance' },
      ]
    },
    { id: 'all-orders', title: 'All Orders', icon: <FiShoppingCart />, path: '/role-orders' },
    // Role ke liye limited settings
    {
      id: 'settings',
      title: 'Settings',
      icon: <FiSettings />,
      subMenu: [
        { id: 'profile', title: 'Profile', icon: <FiUser />, path: '/role-profile' },
      ]
    }
  ];

  // Select menu based on user type
  const menuItems = userType === 'admin' ? adminMenuItems : roleMenuItems;

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
    if (item.path) navigate(item.path);
    if (item.subMenu) toggleSubMenu(item.id);
  };

  const handleSubMenuItemClick = (subItem) => {
    setActiveSubItem(subItem.id);
    if (subItem.path) navigate(subItem.path);
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
          </div>
        </div>

        {/* Main Menu */}
        <div className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">
              {userType === 'admin' ? 'ADMIN MENU' : 'ROLE MENU'}
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
                    {item.subMenu && (
                      <span className="nav-arrow">
                        {expandedMenus.includes(item.id) ? <FiChevronDown /> : <FiChevronRight />}
                      </span>
                    )}
                  </div>

                  {item.subMenu && expandedMenus.includes(item.id) && (
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