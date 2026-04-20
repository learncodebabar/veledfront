import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../../../api/axios";
import "./AdminLogin.css";

// React Icons
import { 
  FaEnvelope, 
  FaLock, 
  FaEye, 
  FaEyeSlash,
  FaShieldAlt,
  FaUserCircle,
  FaCheckCircle,
  FaExclamationCircle,
  FaSpinner
} from "react-icons/fa";

export default function AdminLogin() {
  const navigate = useNavigate();

  // States for login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // UI States
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "", type: "" });

  // Toast close handler
  const handleCloseToast = () => {
    setToast({ ...toast, show: false });
  };

  // Show toast message
  const showToastMessage = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: "", type: "" });
    }, 5000);
  };

  // Login handler - Direct login without OTP
  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      showToastMessage("Please enter email and password", "error");
      return;
    }

    setLoading(true);

    try {
      const res = await API.post("/admin/login", { email, password });
      
      // Store token and user data
      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminUser", JSON.stringify(res.data.user));
      
      showToastMessage("Login successful! Redirecting to dashboard...", "success");
      
      setTimeout(() => {
        navigate("/Admin-Dashboard-overall");
      }, 1500);
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Invalid email or password";
      showToastMessage(errorMessage, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* Decorative Background Bubbles */}
      <div className="admin-login-bg">
        <div className="login-bg-circle login-circle-1"></div>
        <div className="login-bg-circle login-circle-2"></div>
        <div className="login-bg-circle login-circle-3"></div>
        <div className="login-bg-circle login-circle-4"></div>
        <div className="login-bg-circle login-circle-5"></div>
        <div className="login-bg-circle login-circle-6"></div>
        <div className="login-bg-circle login-circle-7"></div>
        <div className="login-bg-circle login-circle-8"></div>
      </div>

      {/* Toast Message */}
      {toast.show && (
        <div className={`toast-message ${toast.type}`}>
          <div className="toast-content">
            {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
            <span className="toast-text">{toast.message}</span>
          </div>
          <button className="toast-close" onClick={handleCloseToast}>×</button>
        </div>
      )}

      <div className="login-card">
        {/* Decorative Elements */}
        <div className="card-shape shape-1"></div>
        <div className="card-shape shape-2"></div>
        
        {/* Login Form */}
        <div className="login-header">
          <div className="login-icon-wrapper">
            <FaUserCircle className="login-main-icon" />
          </div>
          <h1 className="login-title">Admin Login</h1>
          <p className="login-subtitle">Welcome back! Please login to your account</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">
              <FaEnvelope className="input-icon" /> Email Address <span className="required">*</span>
            </label>
            <div className="input-wrapper">
              <input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className={toast.show && toast.type === 'error' ? 'error' : ''}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">
              <FaLock className="input-icon" /> Password <span className="required">*</span>
            </label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className={toast.show && toast.type === 'error' ? 'error' : ''}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`submit-btn ${loading ? 'loading' : ''}`}
          >
            {loading ? <><FaSpinner className="spinning" /> Logging in...</> : 'Login to Dashboard'}
          </button>
        </form>

        <div className="login-footer">
          <p className="register-link">
            Don't have an account?{' '}
            <Link to="/Admin-Signup-Page" className="register-link-text">
              Signup
            </Link>
          </p>
          <div className="security-note">
            <FaShieldAlt className="security-icon" />
            <span>Secured by 256-bit encryption</span>
          </div>
        </div>
      </div>
    </div>
  );
}