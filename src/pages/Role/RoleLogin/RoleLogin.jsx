import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import roleService from '../../../api/roleService';
import './RoleLogin.css';

// React Icons
import { 
  FaEnvelope, FaLock, FaEye, FaEyeSlash,
  FaCheckCircle, FaExclamationCircle, FaSpinner,
  FaShieldAlt, FaArrowLeft, FaKey, FaClock
} from 'react-icons/fa';

const RoleLogin = () => {
  const navigate = useNavigate();

  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [userId, setUserId] = useState(null);

  // UI State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, type: '', message: '' });
  const [errors, setErrors] = useState({});
  const [otpTimer, setOtpTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // OTP Refs
  const otpRefs = Array(6).fill(0).map(() => React.createRef());

  const showToast = (type, message) => {
    setToast({ show: true, type, message });
    setTimeout(() => {
      setToast({ show: false, type: '', message: '' });
    }, 3000);
  };

  const validateCredentials = () => {
    const newErrors = {};

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateOtp = () => {
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      showToast('error', 'Please enter complete 6-digit OTP');
      return false;
    }
    return true;
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();

    if (!validateCredentials()) {
      return;
    }

    try {
      setLoading(true);
      console.log('📝 Sending OTP to:', email);

      const response = await roleService.sendOtp({
        email: email.toLowerCase().trim(),
        password: password
      });

      console.log('✅ OTP sent:', response);

      if (response.success) {
        setUserId(response.userId);
        setStep(2);
        startOtpTimer();
        showToast('success', 'OTP sent to your email!');
        
        setTimeout(() => {
          otpRefs[0].current?.focus();
        }, 100);
      } else {
        showToast('error', response.message || 'Failed to send OTP');
      }

    } catch (err) {
      console.error('❌ Error sending OTP:', err);
      showToast('error', err.message || 'Failed to send OTP. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!validateOtp()) {
      return;
    }

    try {
      setOtpLoading(true);
      const otpString = otp.join('');

      console.log('📝 Verifying OTP:', otpString);

      const response = await roleService.verifyOtpAndLogin({
        userId: userId,
        otp: otpString,
        email: email.toLowerCase().trim()
      });

      console.log('✅ Login response:', response);

      if (response.success && response.token) {
        const { token, user } = response;
        
        console.log('🔑 Storing token and user data...');
        
        // Clear any existing data
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('roleToken');
        localStorage.removeItem('roleUser');
        localStorage.removeItem('userType');
        
        // Store role data with permissions array
        localStorage.setItem('roleToken', token);
        localStorage.setItem('roleUser', JSON.stringify({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          permissionsArray: user.permissionsArray || user.permissions || []
        }));
        localStorage.setItem('userType', 'role');
        
        console.log('✅ Token stored:', !!localStorage.getItem('roleToken'));
        console.log('✅ User stored:', localStorage.getItem('roleUser'));
        console.log('✅ Permissions Array:', user.permissionsArray || user.permissions);
        
        showToast('success', response.message || 'Login successful!');

        // ✅ Check if user has dashboard access (admin-dashboard permission)
        const hasDashboardAccess = user.permissionsArray?.includes('admin-dashboard') || 
                                   user.permissions?.includes('admin-dashboard') ||
                                   user.role === 'admin';
        
        console.log('Has Dashboard Access:', hasDashboardAccess);
        
        // ✅ REDIRECT: Dashboard access hai to Admin Dashboard, nahi to Welcome Page
        setTimeout(() => {
          if (hasDashboardAccess) {
            console.log('🚀 Redirecting to Admin Dashboard...');
            window.location.href = '/Admin-Dashboard-overall';
          } else {
            console.log('🚀 No dashboard access, redirecting to Welcome Page...');
            window.location.href = '/welcome';  // ✅ YEH CHANGE KARO (unauthorized ki jagah welcome)
          }
        }, 1000);
        
      } else {
        showToast('error', response.message || 'Invalid OTP');
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      }

    } catch (err) {
      console.error('❌ Login error:', err);
      showToast('error', err.message || 'Login failed. Please try again.');
      setOtp(['', '', '', '', '', '']);
      otpRefs[0].current?.focus();
    } finally {
      setOtpLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      const pastedOtp = value.slice(0, 6).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      
      const lastFilledIndex = Math.min(pastedOtp.length, 5);
      if (lastFilledIndex < 6) {
        otpRefs[lastFilledIndex].current?.focus();
      }
    } else {
      if (value.match(/^[0-9]$/) || value === '') {
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        if (value !== '' && index < 5) {
          otpRefs[index + 1].current?.focus();
        }
      }
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index] === '' && index > 0) {
        otpRefs[index - 1].current?.focus();
      }
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const pastedOtp = pastedData.replace(/\D/g, '').slice(0, 6);
    
    if (pastedOtp.length > 0) {
      const newOtp = [...otp];
      pastedOtp.split('').forEach((digit, i) => {
        if (i < 6) newOtp[i] = digit;
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(pastedOtp.length, 5);
      if (nextIndex < 6) {
        otpRefs[nextIndex].current?.focus();
      }
    }
  };

  const startOtpTimer = () => {
    setOtpTimer(60);
    setCanResend(false);
    
    const timer = setInterval(() => {
      setOtpTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    try {
      setOtpLoading(true);
      
      const response = await roleService.resendOtp({
        email: email.toLowerCase().trim(),
        userId: userId
      });

      if (response.success) {
        showToast('success', 'OTP resent successfully!');
        startOtpTimer();
        setOtp(['', '', '', '', '', '']);
        otpRefs[0].current?.focus();
      } else {
        showToast('error', response.message || 'Failed to resend OTP');
      }

    } catch (err) {
      console.error('❌ Resend OTP error:', err);
      showToast('error', err.message || 'Failed to resend OTP');
    } finally {
      setOtpLoading(false);
    }
  };

  const goBackToCredentials = () => {
    setStep(1);
    setOtp(['', '', '', '', '', '']);
    setOtpTimer(60);
    setCanResend(false);
    setErrors({});
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="role-login-container">
      <div className="role-login-bg">
        <div className="role-bg-circle circle-11"></div>
        <div className="role-bg-circle circle-21"></div>
        <div className="role-bg-circle circle-31"></div>
      </div>

      {toast.show && (
        <div className={`role-toast ${toast.type}`}>
          <div className="role-toast-content">
            {toast.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
            <span>{toast.message}</span>
          </div>
          <button 
            className="role-toast-close" 
            onClick={() => setToast({ ...toast, show: false })}
          >
            ×
          </button>
        </div>
      )}

      <div className="role-login-wrapper">
        <div className="role-login-card">
          <div className="role-login-header">
            <div className="role-icon-wrapper">
              <FaShieldAlt className="role-main-icon" />
            </div>
            <h1>Role Login</h1>
          </div>

          {step === 1 && (
            <form onSubmit={handleCredentialsSubmit} className="role-login-form">
              <div className="role-form-group">
                <label>
                  <FaEnvelope className="role-field-icon" />
                  Email Address
                </label>
                <div className="role-input-wrapper">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    disabled={loading}
                    className={errors.email ? 'error' : ''}
                  />
                  <FaEnvelope className="role-input-icon" />
                </div>
                {errors.email && <small className="role-error-text">{errors.email}</small>}
              </div>

              <div className="role-form-group">
                <label>
                  <FaLock className="role-field-icon" />
                  Password
                </label>
                <div className="role-input-wrapper">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    disabled={loading}
                    className={errors.password ? 'error' : ''}
                  />
                  <FaLock className="role-input-icon" />
                  <button
                    type="button"
                    className="role-password-toggle"
                    onClick={togglePasswordVisibility}
                    disabled={loading}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </button>
                </div>
                {errors.password && <small className="role-error-text">{errors.password}</small>}
              </div>

              <div className="role-forgot-password">
                <Link to="/forgot-password">Forgot Password?</Link>
              </div>

              <button
                type="submit"
                className="role-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <FaSpinner className="role-spinning" />
                    Sending OTP...
                  </>
                ) : (
                  'Send OTP'
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleOtpSubmit} className="role-login-form">
              <div className="role-form-group">
                <label>
                  <FaKey className="role-field-icon" />
                  Enter 6-Digit OTP
                </label>
                <div className="role-otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      ref={otpRefs[index]}
                      className="role-otp-input"
                      disabled={otpLoading}
                      autoFocus={index === 0}
                    />
                  ))}
                </div>
              </div>

              <div className="role-otp-timer">
                {otpTimer > 0 ? (
                  <p>
                    <FaClock />
                    Resend OTP in {Math.floor(otpTimer / 60)}:
                    {(otpTimer % 60).toString().padStart(2, '0')}
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    className="role-resend-btn"
                    disabled={otpLoading}
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <button
                type="submit"
                className="role-submit-btn"
                disabled={otpLoading || otp.join('').length !== 6}
              >
                {otpLoading ? (
                  <>
                    <FaSpinner className="role-spinning" />
                    Verifying...
                  </>
                ) : (
                  'Verify & Login'
                )}
              </button>

              <button
                type="button"
                onClick={goBackToCredentials}
                className="role-back-btn"
                disabled={otpLoading}
              >
                <FaArrowLeft />
                Back to Login
              </button>
            </form>
          )}

          <div className="role-login-footer">
            <div className="role-security-badge">
              <FaShieldAlt />
              <span>Secured by OTP Verification</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleLogin;