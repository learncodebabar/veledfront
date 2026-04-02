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
    <BrowserRouter>
      <AuthProvider>
        <PermissionProvider>
          <ThemeProvider>
            <Routes>
              {/* ==================== PUBLIC ROUTES ==================== */}
              <Route 
                path="/Admin-Signup-Page" 
                element={
                  adminExists ? <Navigate to="/" replace /> : <AdminSignup />
                } 
              />
              <Route path="/" element={<AdminLogin />} />
              <Route path="/roles-login" element={<RoleLogin />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/no-permission" element={<NoPermission />} />
              <Route path="/404" element={<NotFound />} />

              {/* ==================== ADMIN ONLY ROUTES ==================== */}
              
              {/* Dashboard */}
              <Route
                path="/Admin-Dashboard-overall"
                element={
                  <AdminPrivateRoute>
                    <Dashboard />
                  </AdminPrivateRoute>
                }
              />

              {/* Quotation Routes */}
              <Route
                path="/QuotationCustomer"
                element={
                  <AdminPrivateRoute>
                    <QuotationCustomer />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/all-Quotation"
                element={
                  <AdminPrivateRoute>
                    <Quotations />
                  </AdminPrivateRoute>
                }
              />

              {/* ✅ ADMIN PRINT QUOTATION ROUTES */}
              <Route
                path="/quotations/print/:id"
                element={
                  <AdminPrivateRoute>
                    <PrintQuotation />
                  </AdminPrivateRoute>
                }
              />

              {/* Optional: View and Edit Quotation Routes */}
              <Route
                path="/quotations/:id"
                element={
                  <AdminPrivateRoute>
                    <Quotations />
                  </AdminPrivateRoute>
                }
              />

              <Route
                path="/quotations/edit/:id"
                element={
                  <AdminPrivateRoute>
                    <Quotations />
                  </AdminPrivateRoute>
                }
              />

              {/* Material Routes */}
              <Route
                path="/Admin-Material"
                element={
                  <AdminPrivateRoute>
                    <AdminMaterial />
                  </AdminPrivateRoute>
                }
              />

              {/* Role Management */}
              <Route
                path="/add-roles"
                element={
                  <AdminPrivateRoute>
                    <Roles />
                  </AdminPrivateRoute>
                }
              />

              {/* Customer Routes - Admin */}
              <Route
                path="/Admin-Add-customer"
                element={
                  <AdminPrivateRoute>
                    <AddCustomer />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/add-customer"
                element={
                  <AdminPrivateRoute>
                    <AddCustomer />
                  </AdminPrivateRoute>
                }
              />

              <Route
                path="/admin-all-customer"
                element={
                  <AdminPrivateRoute>
                    <AllCustomer />
                  </AdminPrivateRoute>
                }
              />

              {/* Order Routes - Admin */}
              <Route
                path="/All-Orders"
                element={
                  <AdminPrivateRoute>
                    <AllOrders />
                  </AdminPrivateRoute>
                }
              />

              {/* Labor Routes - Admin */}
              <Route
                path="/Add-Labor"
                element={
                  <AdminPrivateRoute>
                    <AddLabor />
                  </AdminPrivateRoute>
                }
              />

              <Route
                path="/All-Labor"
                element={
                  <AdminPrivateRoute>
                    <AllLabor />
                  </AdminPrivateRoute>
                }
              />

              {/* Attendance Routes - Admin */}
              <Route
                path="/Attendance-Page"
                element={
                  <AdminPrivateRoute>
                    <AttendancePage />
                  </AdminPrivateRoute>
                }
              />

              {/* Profile & Settings Routes - Admin */}
              <Route
                path="/Admin-Profile-custoize"
                element={
                  <AdminPrivateRoute>
                    <Profile />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/Admin-Account-Settings"
                element={
                  <AdminPrivateRoute>
                    <AccountSettings />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/profile-settings"
                element={
                  <AdminPrivateRoute>
                    <Profile />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/settings"
                element={
                  <AdminPrivateRoute>
                    <AccountSettings />
                  </AdminPrivateRoute>
                }
              />

              {/* Payment & Expense Routes - Admin */}
              <Route
                path="/Admin-Payment"
                element={
                  <AdminPrivateRoute>
                    <AdminPayment />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/payments"
                element={
                  <AdminPrivateRoute>
                    <AdminPayment />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/admin-expenses"
                element={
                  <AdminPrivateRoute>
                    <AdminExpenses />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/expenses"
                element={
                  <AdminPrivateRoute>
                    <AdminExpenses />
                  </AdminPrivateRoute>
                }
              />

              {/* Theme Routes - Admin */}
              <Route
                path="/Theme-Settings"
                element={
                  <AdminPrivateRoute>
                    <ThemeSettings />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/theme"
                element={
                  <AdminPrivateRoute>
                    <ThemeSettings />
                  </AdminPrivateRoute>
                }
              />

              {/* ==================== DYNAMIC ROUTES (Both Admin & Role) ==================== */}
              
              {/* Customer Dynamic Routes */}
              <Route
                path="/Customer-Detail/:id"
                element={
                  <DynamicRouteGuard requiredPermission="customer-detail" allowedRoles={['admin', 'manager', 'supervisor']}>
                    <CustomerDetail />
                  </DynamicRouteGuard>
                }
              />
              
              <Route
                path="/welcome"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user', 'data_entry']}>
                    <Welcome />
                  </RolePrivateRoute>
                }
              />

              <Route
                path="/customer-orders/:id"
                element={
                  <DynamicRouteGuard requiredPermission="customer-orders" allowedRoles={['admin', 'manager', 'supervisor']}>
                    <CustomerOrders />
                  </DynamicRouteGuard>
                }
              />

              <Route
                path="/edit-customer/:id"
                element={
                  <DynamicRouteGuard requiredPermission="edit-customer" allowedRoles={['admin', 'manager']}>
                    <AddCustomer />
                  </DynamicRouteGuard>
                }
              />

              {/* Order Dynamic Routes */}
              <Route
                path="/quotation-to-order"
                element={
                  <DynamicRouteGuard requiredPermission="quotation-customer" allowedRoles={['admin', 'manager', 'supervisor']}>
                    <CreateQuotationOrder />
                  </DynamicRouteGuard>
                }
              />

              <Route
                path="/Create-New-Order/:customerId"
                element={
                  <DynamicRouteGuard requiredPermission="create-new-order" allowedRoles={['admin', 'manager', 'supervisor']}>
                    <CreateNewOrder />
                  </DynamicRouteGuard>
                }
              />

              {/* Labor Dynamic Routes */}
              <Route
                path="/edit-labor/:id"
                element={
                  <DynamicRouteGuard requiredPermission="edit-labor" allowedRoles={['admin', 'manager']}>
                    <EditLabor />
                  </DynamicRouteGuard>
                }
              />

              <Route
                path="/Worker-Details-Page/:id"
                element={
                  <DynamicRouteGuard requiredPermission="worker-details" allowedRoles={['admin', 'manager', 'supervisor']}>
                    <WorkerDetailsPage />
                  </DynamicRouteGuard>
                }
              />

              {/* ==================== ROLE ONLY ROUTES ==================== */}

              {/* Role Dashboard */}
              <Route
                path="/Role-dashboard"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user', 'data_entry']}>
                    <Roledashboard />
                  </RolePrivateRoute>
                }
              />

              {/* Role Customer Routes */}
              <Route
                path="/Role-Add-Customer"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
                    <RoleAddCustomer />
                  </RolePrivateRoute>
                }
              />

              <Route
                path="/Role-Add-Customer/:id"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
                    <RoleAddCustomer />
                  </RolePrivateRoute>
                }
              />

              <Route
                path="/role-customers"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user', 'data_entry']}>
                    <AllCustomer />
                  </RolePrivateRoute>
                }
              />

              {/* Role Order Routes */}
              <Route
                path="/role-orders"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user']}>
                    <AllOrders />
                  </RolePrivateRoute>
                }
              />

              {/* Role Labor Routes */}
              <Route
                path="/role-labor"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user']}>
                    <AllLabor />
                  </RolePrivateRoute>
                }
              />

              <Route
                path="/role-add-labor"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager']}>
                    <AddLabor />
                  </RolePrivateRoute>
                }
              />

              {/* Role Attendance Routes */}
              <Route
                path="/role-attendance"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user']}>
                    <AttendancePage />
                  </RolePrivateRoute>
                }
              />

              {/* Role Quotation Routes */}
              <Route
                path="/role-quotations"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor']}>
                    <Quotations />
                  </RolePrivateRoute>
                }
              />

              {/* ✅ ROLE PRINT QUOTATION ROUTE */}
              <Route
                path="/role-quotations/print/:id"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor']}>
                    <PrintQuotation />
                  </RolePrivateRoute>
                }
              />

              {/* ==================== CATCH ALL ROUTE ==================== */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </ThemeProvider>
        </PermissionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;