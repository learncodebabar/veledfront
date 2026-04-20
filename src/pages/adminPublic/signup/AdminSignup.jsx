import React, { useState, useEffect } from "react";
import API from "../../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./AdminSignup.css";

const AdminSignup = () => {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false
  });

  const [message, setMessage] = useState({ 
    type: "", 
    text: "", 
    visible: false 
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({});

  // Auto hide message after 5 seconds
  useEffect(() => {
    if (message.visible) {
      const timer = setTimeout(() => {
        setMessage(prev => ({ ...prev, visible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.visible]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (message.visible) {
      setMessage({ type: "", text: "", visible: false });
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const showMessage = (type, text) => {
    setMessage({ type, text, visible: true });
  };

  const validateForm = () => {
    if (!form.name.trim()) {
      showMessage("error", "Please enter your full name");
      return false;
    }
    if (form.name.trim().length < 3) {
      showMessage("error", "Name must be at least 3 characters");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email) {
      showMessage("error", "Please enter your email");
      return false;
    }
    if (!emailRegex.test(form.email)) {
      showMessage("error", "Please enter a valid email address");
      return false;
    }

    if (!form.password) {
      showMessage("error", "Please enter a password");
      return false;
    }

    if (form.password.length < 6) {
      showMessage("error", "Password must be at least 6 characters");
      return false;
    }

    if (!form.confirmPassword) {
      showMessage("error", "Please confirm your password");
      return false;
    }
    if (form.password !== form.confirmPassword) {
      showMessage("error", "Passwords do not match");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const res = await API.post("/admin/signup", {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password
      });
      
      showMessage("success", res.data.message || "Registration successful! Redirecting to dashboard...");
      
      // Store token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Registration failed. Please try again.";
      showMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-signup-container">
      {/* Toast Message */}
      {message.visible && (
        <div className={`admin-signup-toast-message ${message.type}`}>
          <div className="admin-signup-toast-content">
            <span className="admin-signup-toast-text">{message.text}</span>
          </div>
          <button 
            className="admin-signup-toast-close"
            onClick={() => setMessage(prev => ({ ...prev, visible: false }))}
          >
            ×
          </button>
        </div>
      )}

      <div className="admin-signup-card">
        <div className="admin-signup-header">
          <h1 className="admin-signup-title">
            Welding Software
          </h1>
          <p className="admin-signup-subtitle">
            Create your administrator account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="admin-signup-form">
          {/* Name Field */}
          <div className="admin-signup-form-group">
            <label htmlFor="name" className="admin-signup-label">
              Full Name <span className="admin-signup-required">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              onBlur={() => handleBlur('name')}
              placeholder="Enter your full name"
              disabled={isLoading}
              className={`admin-signup-input ${touched.name && !form.name ? "admin-signup-error" : ""}`}
            />
          </div>

          {/* Email Field */}
          <div className="admin-signup-form-group">
            <label htmlFor="email" className="admin-signup-label">
              Email Address <span className="admin-signup-required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              onBlur={() => handleBlur('email')}
              placeholder="Enter your email address"
              disabled={isLoading}
              className={`admin-signup-input ${touched.email && !form.email ? "admin-signup-error" : ""}`}
            />
          </div>

          {/* Password Field */}
          <div className="admin-signup-form-group">
            <label htmlFor="password" className="admin-signup-label">
              Password <span className="admin-signup-required">*</span>
            </label>
            <div className="admin-signup-password-wrapper">
              <input
                type={showPassword.password ? "text" : "password"}
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => handleBlur('password')}
                placeholder="Enter your password (min 6 characters)"
                disabled={isLoading}
                className="admin-signup-input"
              />
              <button
                type="button"
                className="admin-signup-password-toggle"
                onClick={() => togglePasswordVisibility("password")}
              >
                {showPassword.password ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Confirm Password Field */}
          <div className="admin-signup-form-group">
            <label htmlFor="confirmPassword" className="admin-signup-label">
              Confirm Password <span className="admin-signup-required">*</span>
            </label>
            <div className="admin-signup-password-wrapper">
              <input
                type={showPassword.confirmPassword ? "text" : "password"}
                id="confirmPassword"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                onBlur={() => handleBlur('confirmPassword')}
                placeholder="Confirm your password"
                disabled={isLoading}
                className="admin-signup-input"
              />
              <button
                type="button"
                className="admin-signup-password-toggle"
                onClick={() => togglePasswordVisibility("confirmPassword")}
              >
                {showPassword.confirmPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className={`admin-signup-submit-btn ${isLoading ? "admin-signup-loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Admin Account"}
          </button>
        </form>

        {/* Footer */}
        <div className="admin-signup-footer">
          <p className="admin-signup-login-link">
            Already have an account?{" "}
            <Link to="/" className="admin-signup-login-link-text">
              Login Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminSignup;