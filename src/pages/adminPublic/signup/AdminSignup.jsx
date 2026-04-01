import React, { useState, useEffect } from "react";
import API from "../../../api/axios";
import { useNavigate, Link } from "react-router-dom";
import "./AdminSignup.css";

const AdminSignup = () => {
  const navigate = useNavigate();
  
  // Form state
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // OTP state
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [tempToken, setTempToken] = useState("");
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [canResend, setCanResend] = useState(false);
  
  // UI state
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
  
  const inputRefs = [];

  // Auto hide message after 5 seconds
  useEffect(() => {
    if (message.visible) {
      const timer = setTimeout(() => {
        setMessage(prev => ({ ...prev, visible: false }));
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message.visible]);

  // Timer countdown for OTP
  useEffect(() => {
    if (!showOTP) return;
    
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, showOTP]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (message.visible) {
      setMessage({ type: "", text: "", visible: false });
    }
  };

  // Handle input blur
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Show message
  const showMessage = (type, text) => {
    setMessage({ type, text, visible: true });
  };

  // Format time for OTP
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Handle OTP input change
  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (value && !/^\d+$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(0, 1);
    setOtp(newOtp);

    // Auto focus next input
    if (value && index < 5) {
      inputRefs[index + 1].focus();
    }
  };

  // Handle OTP key down for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].focus();
    }
  };

  // Validate form
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
      showMessage("error", "Please enter a valid email");
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

  // Handle form submission - Send OTP
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    
    try {
      const res = await API.post("/admin/send-otp", {
        name: form.name.trim(),
        email: form.email.toLowerCase().trim(),
        password: form.password
      });
      
      setTempToken(res.data.tempToken);
      setShowOTP(true);
      setTimeLeft(600);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      
      showMessage("success", "OTP sent successfully to your email!");
      
      // Focus on first OTP input after a short delay
      setTimeout(() => {
        if (inputRefs[0]) inputRefs[0].focus();
      }, 100);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Something went wrong. Please try again.";
      showMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      showMessage("error", "Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    
    try {
      const res = await API.post("/admin/verify-otp", {
        otp: otpValue,
        tempToken
      });
      
      showMessage("success", res.data.message || "Registration successful! Redirecting to dashboard...");
      
      // Store token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Verification failed. Please try again.";
      showMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!canResend) return;
    
    setIsLoading(true);
    
    try {
      const res = await API.post("/admin/resend-otp", {
        name: form.name,
        email: form.email,
        password: form.password
      });
      
      setTempToken(res.data.tempToken);
      showMessage("success", "New OTP sent to your email!");
      setTimeLeft(600);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
      
      // Focus on first OTP input
      if (inputRefs[0]) inputRefs[0].focus();
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "Failed to resend OTP. Please try again.";
      showMessage("error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle back to registration form
  const handleBackToForm = () => {
    setShowOTP(false);
    setTempToken("");
    setOtp(["", "", "", "", "", ""]);
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
        {!showOTP ? (
          // Registration Form
          <>
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
                  className={`admin-signup-input admin-signup-name-input ${touched.name && !form.name ? "admin-signup-error" : ""}`}
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
                  placeholder="Enter your email"
                  disabled={isLoading}
                  className={`admin-signup-input admin-signup-email-input ${touched.email && !form.email ? "admin-signup-error" : ""}`}
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
                    placeholder="Enter your password"
                    disabled={isLoading}
                    className="admin-signup-input admin-signup-password-input"
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
                    className="admin-signup-input admin-signup-confirm-password-input"
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
                {isLoading ? "Sending OTP..." : "Create Admin Account"}
              </button>
            </form>

            {/* Footer */}
            <div className="admin-signup-footer">
              <p className="admin-signup-login-link">
                Already have an account?{" "}
                <Link to="/" className="admin-signup-login-link-text">
                  Login 
                </Link>
              </p>
            </div>
          </>
        ) : (
          // OTP Verification Form
          <>
            <div className="admin-signup-header">
              <div className="admin-signup-otp-icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20 4H4C2.9 4 2 4.9 2 6V18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V6C22 4.9 21.1 4 20 4ZM20 8L12 13L4 8V6L12 11L20 6V8Z" fill="#667eea"/>
                </svg>
              </div>
              <h2 className="admin-signup-title">Verify Your Email</h2>
              <p className="admin-signup-subtitle">
                We've sent a verification code to <strong>{form.email}</strong>
              </p>
            </div>

            <form onSubmit={handleVerifyOTP} className="admin-signup-form">
              <div className="admin-signup-form-group">
                <label className="admin-signup-label">Enter OTP Code <span className="admin-signup-required">*</span></label>
                <div className="admin-signup-otp-input-group">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs[index] = el)}
                      type="text"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="admin-signup-otp-digit-input"
                      maxLength={1}
                      disabled={isLoading}
                    />
                  ))}
                </div>
              </div>

              <div className="admin-signup-timer-container">
                {timeLeft > 0 ? (
                  <div className="admin-signup-timer">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.58 20 4 16.42 4 12C4 7.58 7.58 4 12 4C16.42 4 20 7.58 20 12C20 16.42 16.42 20 12 20Z" fill="#667eea"/>
                      <path d="M12.5 7H11V13L16.2 16.2L17 14.9L12.5 12.2V7Z" fill="#667eea"/>
                    </svg>
                    <span>Code expires in <strong>{formatTime(timeLeft)}</strong></span>
                  </div>
                ) : (
                  <div className="admin-signup-timer admin-signup-timer-expired">
                    <span>Code has expired</span>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                className={`admin-signup-submit-btn ${isLoading ? "admin-signup-loading" : ""}`}
                disabled={isLoading}
              >
                {isLoading ? "Verifying..." : "Verify & Register"}
              </button>
            </form>

            <div className="admin-signup-footer">
              <div className="admin-signup-resend-section">
                <p className="admin-signup-resend-text">
                  Didn't receive the code?{" "}
                  <button 
                    onClick={handleResendOTP}
                    disabled={!canResend || isLoading}
                    className={`admin-signup-resend-btn ${!canResend ? "admin-signup-disabled" : ""}`}
                  >
                    Resend OTP
                  </button>
                </p>
              </div>
              <button onClick={handleBackToForm} className="admin-signup-back-btn">
                ← Back to Registration
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminSignup;