import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useState, useEffect } from "react";

import AdminSignup from "./pages/adminPublic/signup/AdminSignup";
import AdminLogin from "./pages/adminPublic/Login/AdminLogin";
import Dashboard from "./pages/PrivatePage/Dashboard/Dashboard";
import AdminPrivateRoute from "./Route/AdminPrivateRoute";
import RolePrivateRoute from "./Route/RolePrivateRoute";
import SharedRoute from "./Route/SharedRoute";
import AddCustomer from "./pages/PrivatePage/AddCustomer/AddCustomer";
import Profile from "./pages/PrivatePage/Profile/Profile";
import AllCustomer from "./pages/PrivatePage/AllCustomer/AllCustomer";
import CustomerDetail from "./pages/PrivatePage/CustomerDetail/CustomerDetail";
import { ThemeProvider } from "./ThemeContext/ThemeContext";
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
import API from "./api/axios";
import NotFound from "./pages/adminPublic/NotFound/NotFound";
import Roles from "./pages/PrivatePage/Roles/Roles";
import RoleLogin from "./pages/Role/RoleLogin/RoleLogin";
import Roledashboard from "./pages/Role/Roledashboard/Roledashboard";
import RoleAddCustomer from "./pages/Role/Addcustomer/Addcustomer";
import QuotationCustomer from "./pages/PrivatePage/QuotationCustomer/AddQuotationCustomer";
import AdminMaterial from "./pages/PrivatePage/AdminMaterial/AdminMaterial";
import Quotations from "./pages/PrivatePage/Quotations/Quotations";
import PrintQuotation from "./pages/PrivatePage/Quotations/PrintQuotation.jsx"; // ✅ Import PrintQuotation

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
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Checking system status...</p>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/Admin-Signup-Page" 
            element={
              adminExists ? <Navigate to="/" replace /> : <AdminSignup />
            } 
          />
          <Route path="/" element={<AdminLogin />} />
          <Route path="/roles-login" element={<RoleLogin />} />

          {/* ===== ADMIN ROUTES ===== */}
          <Route
            path="/Admin-Dashboard-overall"
            element={
              <AdminPrivateRoute>
                <Dashboard />
              </AdminPrivateRoute>
            }
          />
          
          <Route
            path="/QuotationCustomer"
            element={
              <AdminPrivateRoute>
                <QuotationCustomer />
              </AdminPrivateRoute>
            }
          />
           
          <Route
            path="/Admin-Material"
            element={
              <AdminPrivateRoute>
                <AdminMaterial />
              </AdminPrivateRoute>
            }
          />
          
          <Route
            path="/add-roles"
            element={
              <AdminPrivateRoute>
                <Roles />
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

          {/* ✅ ADD PRINT QUOTATION ROUTE    */}
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

          {/* Add Customer Routes */}
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

          {/* Admin Profile Routes */}
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
            path="/Admin-Payment"
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
            path="/Theme-Settings"
            element={
              <AdminPrivateRoute>
                <ThemeSettings />
              </AdminPrivateRoute>
            }
          />

          {/* ===== SHARED ROUTES (Admin + Role) ===== */}
          <Route
            path="/admin-all-customer"
            element={
              <SharedRoute>
                <AllCustomer />
              </SharedRoute>
            }
          />

          <Route
            path="/Customer-Detail/:id"
            element={
              <SharedRoute>
                <CustomerDetail />
              </SharedRoute>
            }
          />

          <Route
            path="/customer-orders/:id"
            element={
              <SharedRoute>
                <CustomerOrders />
              </SharedRoute>
            }
          />

          <Route
            path="/All-Orders"
            element={
              <SharedRoute>
                <AllOrders />
              </SharedRoute>
            }
          />

          <Route
            path="/Add-Labor"
            element={
              <SharedRoute>
                <AddLabor />
              </SharedRoute>
            }
          />

          <Route
            path="/All-Labor"
            element={
              <SharedRoute>
                <AllLabor />
              </SharedRoute>
            }
          />

          <Route
            path="/edit-labor/:id"
            element={
              <SharedRoute>
                <EditLabor />
              </SharedRoute>
            }
          />

          <Route
            path="/Worker-Details-Page/:id"
            element={
              <SharedRoute>
                <WorkerDetailsPage />
              </SharedRoute>
            }
          />

          <Route
            path="/Attendance-Page"
            element={
              <SharedRoute>
                <AttendancePage />
              </SharedRoute>
            }
          />

          {/* ===== ROLE ROUTES ===== */}
          <Route
            path="/Role-dashboard"
            element={
              <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
                <Roledashboard />
              </RolePrivateRoute>
            }
          />

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
              <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
                <AllCustomer />
              </RolePrivateRoute>
            }
          />

          <Route
            path="/role-orders"
            element={
              <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
                <AllOrders />
              </RolePrivateRoute>
            }
          />

          <Route
            path="/role-attendance"
            element={
              <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
                <AttendancePage />
              </RolePrivateRoute>
            }
          />

          <Route
            path="/role-labor"
            element={
              <RolePrivateRoute allowedRoles={['admin', 'manager', 'data_entry']}>
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

          {/* ===== PAYMENT PAGES - ADMIN ONLY ===== */}
          <Route
            path="/payments"
            element={
              <AdminPrivateRoute>
                <AdminPayment />
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

          <Route
            path="/settings"
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
            path="/theme"
            element={
              <AdminPrivateRoute>
                <ThemeSettings />
              </AdminPrivateRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;