import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// ===== CONTEXT PROVIDERS =====
import { AuthProvider } from "./context/AuthContext";
import { PermissionProvider } from "./context/PermissionContext";
import { ThemeProvider } from "./ThemeContext/ThemeContext";

// ===== ROUTE GUARDS =====
import AdminPrivateRoute from "./Route/AdminPrivateRoute";
import RolePrivateRoute from "./Route/RolePrivateRoute";

// ===== PUBLIC PAGES =====
import AdminSignup from "./pages/adminPublic/signup/AdminSignup";
import AdminLogin from "./pages/adminPublic/Login/AdminLogin";
import RoleLogin from "./pages/Role/RoleLogin/RoleLogin";
import NotFound from "./pages/adminPublic/NotFound/NotFound";
import Unauthorized from "./pages/Unauthorized/Unauthorized";
import NoPermission from "./pages/Role/NoPermission/NoPermission";

// ===== ADMIN PAGES =====
import Dashboard from "./pages/PrivatePage/Dashboard/Dashboard";
import AddCustomer from "./pages/PrivatePage/AddCustomer/AddCustomer";
import Profile from "./pages/PrivatePage/Profile/Profile";
import AllCustomer from "./pages/PrivatePage/AllCustomer/AllCustomer";
import CustomerDetail from "./pages/PrivatePage/CustomerDetail/CustomerDetail";
import ThemeSettings from "./ThemeContext/ThemeSettings";
import AllOrders from "./pages/PrivatePage/AllOrders/AllOrders";
import AdminExpenses from "./pages/PrivatePage/AdminExpenses/AdminExpenses";
import AdminPayment from "./pages/PrivatePage/AdminPayment/AdminPayment";
import CustomerOrders from "./pages/PrivatePage/CustomerOrders/CustomerOrders";
import AddLabor from "./pages/PrivatePage/AddLabor/AddLabor";
import AllLabor from "./pages/PrivatePage/AllLabor/AllLabor";
import AttendancePage from "./pages/PrivatePage/Attendance/AttendancePage";
import WorkerDetailsPage from "./pages/PrivatePage/WorkerDetailsPage/WorkerDetailsPage";
import AccountSettings from "./pages/PrivatePage/AccountSettings/AccountSettings";
import EditLabor from "./pages/PrivatePage/EditLabor/EditLabor";
import Roles from "./pages/PrivatePage/Roles/Roles";
import QuotationCustomer from "./pages/PrivatePage/QuotationCustomer/AddQuotationCustomer";
import AdminMaterial from "./pages/PrivatePage/AdminMaterial/AdminMaterial";
import Quotations from "./pages/PrivatePage/Quotations/Quotations";
import PrintQuotation from "./pages/PrivatePage/Quotations/PrintQuotation";
import CreateNewOrder from "./pages/PrivatePage/CreateNewOrder/CreateNewOrder";
import CreateQuotationOrder from "./pages/PrivatePage/CreateQuotationOrder/CreateQuotationOrder";

// ===== ROLE PAGES =====
import Roledashboard from "./pages/Role/Roledashboard/Roledashboard";
import RoleAddCustomer from "./pages/Role/Addcustomer/Addcustomer";

// ===== API =====
import API from "./api/axios";

// ===== STYLES =====
import "./App.css";
import Welcome from "./pages/Role/Welcome/Welcome";

// ==================== DYNAMIC ROUTE GUARD COMPONENT ====================
const DynamicRouteGuard = ({ children, requiredPermission, allowedRoles = [] }) => {
  const adminToken = localStorage.getItem('adminToken');
  const roleToken = localStorage.getItem('roleToken');
  const roleUser = JSON.parse(localStorage.getItem('roleUser') || '{}');
  const userPermissions = roleUser.permissionsArray || [];
  
  console.log('🔐 DynamicRouteGuard:', {
    adminToken: !!adminToken,
    roleToken: !!roleToken,
    requiredPermission,
    userPermissions
  });
  
  // ✅ Admin can access everything
  if (adminToken) {
    console.log('✅ Admin access granted for dynamic route');
    return <>{children}</>;
  }
  
  // ✅ Role user check
  if (roleToken) {
    // Check permission
    if (requiredPermission && !userPermissions.includes(requiredPermission)) {
      console.log(`❌ No permission for ${requiredPermission}`);
      return <Navigate to="/unauthorized" replace />;
    }
    
    // Check role
    const userRole = roleUser?.role || 'manager';
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      console.log(`❌ Role ${userRole} not allowed. Required:`, allowedRoles);
      return <Navigate to="/unauthorized" replace />;
    }
    
    console.log('✅ Role access granted for dynamic route');
    return <>{children}</>;
  }
  
  // ❌ No token
  console.log('❌ No token found for dynamic route');
  return <Navigate to="/roles-login" replace />;
};

// ==================== LOADING COMPONENT ====================
const LoadingSpinner = () => (
  <div className="app-loading">
    <div className="loading-spinner"></div>
    <p>Loading...</p>
  </div>
);

// ==================== APP COMPONENT ====================
function App() {
  const [adminExists, setAdminExists] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminExists();
  }, []);

  const checkAdminExists = async () => {
    try {
      setLoading(true);
      const response = await API.get("/admin/check-exists");
      setAdminExists(response.data.exists);
    } catch (err) {
      console.error("Error checking admin:", err);
      try {
        await API.get("/admin/profile");
        setAdminExists(true);
      } catch (profileErr) {
        if (profileErr.response?.status === 404) {
          setAdminExists(false);
        } else {
          setAdminExists(true);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <h1>Hello</h1>
  );
}

export default App;