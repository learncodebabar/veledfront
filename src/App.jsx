import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

// ===== CONTEXT PROVIDERS =====
import { AuthProvider } from "./context/AuthContext";
import { PermissionProvider } from "./context/PermissionContext";
import { ThemeProvider } from "./ThemeContext/ThemeContext";

// ===== ROUTE GUARDS =====
import AdminPrivateRoute from "./Route/AdminPrivateRoute";
import RolePrivateRoute from "./Route/RolePrivateRoute";
import SecureRoute from "./components/SecureRoute";

// ===== PUBLIC PAGES =====
import AdminSignup from "./pages/adminPublic/signup/AdminSignup";
import AdminLogin from "./pages/adminPublic/Login/AdminLogin";
import RoleLogin from "./pages/Role/RoleLogin/RoleLogin";
import NotFound from "./pages/adminPublic/NotFound/NotFound";
import Unauthorized from "./pages/Unauthorized/Unauthorized";

// ===== ADMIN PAGES (Full Access) =====
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
import PrintQuotation from "./pages/PrivatePage/Quotations/PrintQuotation"; // ✅ ADD THIS IMPORT

// ===== ROLE PAGES (Permission Based) =====
import Roledashboard from "./pages/Role/Roledashboard/Roledashboard";
import RoleAddCustomer from "./pages/Role/Addcustomer/Addcustomer";

// ===== API =====
import API from "./api/axios";

// ===== STYLES =====
import "./App.css";
import CreateNewOrder from "./pages/PrivatePage/CreateNewOrder/CreateNewOrder";
import CreateQuotationOrder from "./pages/PrivatePage/CreateQuotationOrder/CreateQuotationOrder";
import NoPermission from "./pages/Role/NoPermission/NoPermission";

function App() {
  const [adminExists, setAdminExists] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if admin exists on app load
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

  // Loading state
  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Checking system status...</p>
      </div>
    );
  }

  return (
    <AuthProvider>
      <PermissionProvider>
        <ThemeProvider>
          <BrowserRouter>
            <Routes>
              {/* ===== PUBLIC ROUTES ===== */}
              <Route 
                path="/Admin-Signup-Page" 
                element={
                  adminExists ? <Navigate to="/" replace /> : <AdminSignup />
                } 
              />
              <Route path="/" element={<AdminLogin />} />
              <Route path="/roles-login" element={<RoleLogin />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/404" element={<NotFound />} />

              {/* ===== ADMIN ROUTES - FULL ACCESS (No permission checks) ===== */}
              
              {/* Dashboard */}
              <Route
                path="/Admin-Dashboard-overall"
                element={
                  <AdminPrivateRoute>
                    <Dashboard />
                  </AdminPrivateRoute>
                }
              />
              <Route path="/no-permission" element={<NoPermission />} />

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

              {/* ✅ ADD PRINT QUOTATION ROUTE - MUST BE BEFORE /:id ROUTE */}
              <Route
                path="/quotations/print/:id"
                element={
                  <AdminPrivateRoute>
                    <PrintQuotation />
                  </AdminPrivateRoute>
                }
              />

              {/* ✅ Optional: Add route for viewing quotation details */}
              <Route
                path="/quotations/:id"
                element={
                  <AdminPrivateRoute>
                    <Quotations />
                  </AdminPrivateRoute>
                }
              />

              {/* ✅ Optional: Add route for editing quotation */}
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

              {/* Customer Routes */}
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
                path="/edit-customer/:id"
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

              <Route
                path="/quotation-to-order"
                element={
                  <AdminPrivateRoute>
                    <CreateQuotationOrder />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/Customer-Detail/:id"
                element={
                  <AdminPrivateRoute>
                    <CustomerDetail />
                  </AdminPrivateRoute>
                }
              />

              <Route
                path="/customer-orders/:id"
                element={
                  <AdminPrivateRoute>
                    <CustomerOrders />
                  </AdminPrivateRoute>
                }
              />
              
              <Route
                path="/Create-New-Order/:customerId"
                element={
                  <AdminPrivateRoute>
                    <CreateNewOrder />
                  </AdminPrivateRoute>
                }
              />

              {/* Order Routes */}
              <Route
                path="/All-Orders"
                element={
                  <AdminPrivateRoute>
                    <AllOrders />
                  </AdminPrivateRoute>
                }
              />

              {/* Labor Routes */}
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

              <Route
                path="/edit-labor/:id"
                element={
                  <AdminPrivateRoute>
                    <EditLabor />
                  </AdminPrivateRoute>
                }
              />

              <Route
                path="/Worker-Details-Page/:id"
                element={
                  <AdminPrivateRoute>
                    <WorkerDetailsPage />
                  </AdminPrivateRoute>
                }
              />

              {/* Attendance Routes */}
              <Route
                path="/Attendance-Page"
                element={
                  <AdminPrivateRoute>
                    <AttendancePage />
                  </AdminPrivateRoute>
                }
              />

              {/* Profile & Settings Routes */}
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

              {/* Payment & Expense Routes */}
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

              {/* Theme Routes */}
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

              {/* ===== ROLE ROUTES - WITH PERMISSION CHECKS ===== */}
              {/* Sirf wohi pages jo Role ko access diye gaye hain */}

              {/* Role Dashboard */}
              <Route
                path="/Role-dashboard"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user', 'data_entry']}>
                    <SecureRoute requiredPageId="role-dashboard">
                      <Roledashboard />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              {/* Role Customer Routes */}
              <Route
                path="/Role-Add-Customer"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
                    <SecureRoute requiredPageId="role-add-customer">
                      <RoleAddCustomer />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              <Route
                path="/Role-Add-Customer/:id"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
                    <SecureRoute requiredPageId="role-add-customer">
                      <RoleAddCustomer />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              <Route
                path="/role-customers"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user', 'data_entry']}>
                    <SecureRoute requiredPageId="role-customers">
                      <AllCustomer />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              {/* Role Order Routes */}
              <Route
                path="/role-orders"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user']}>
                    <SecureRoute requiredPageId="role-orders">
                      <AllOrders />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              {/* Role Labor Routes */}
              <Route
                path="/role-labor"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user']}>
                    <SecureRoute requiredPageId="role-labor">
                      <AllLabor />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              <Route
                path="/role-add-labor"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager']}>
                    <SecureRoute requiredPageId="role-add-labor">
                      <AddLabor />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              {/* Role Attendance Routes */}
              <Route
                path="/role-attendance"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor', 'user']}>
                    <SecureRoute requiredPageId="role-attendance">
                      <AttendancePage />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              {/* Role Quotation Routes */}
              <Route
                path="/role-quotations"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor']}>
                    <SecureRoute requiredPageId="all-quotations">
                      <Quotations />
                    </SecureRoute>
                  </RolePrivateRoute>
                }
              />

              {/* ✅ ADD ROLE PRINT QUOTATION ROUTE */}
              <Route
                path="/role-quotations/print/:id"
                element={
                  <RolePrivateRoute allowedRoles={['admin', 'manager', 'supervisor']}>
                    <PrintQuotation />
                  </RolePrivateRoute>
                }
              />

              {/* ===== CATCH ALL ROUTE ===== */}
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </BrowserRouter>
        </ThemeProvider>
      </PermissionProvider>
    </AuthProvider>
  );
}

export default App;