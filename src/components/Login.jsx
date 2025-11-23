import React, { useState } from 'react';
import '../styles/Login.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();
  const apiBaseUrl = import.meta.env.VITE_API_URL;

  const validateForm = () => {
    const newErrors = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${apiBaseUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Login failed');
      }

      const data = await response.json();
      toast.success('🚜 Welcome to Arya Krishi Farm!');
      
      localStorage.setItem('token', data.token);
     
      navigate('/dashboard');
    } catch (error) {
      setErrors({ general: error.message || 'Invalid credentials' });
      toast.error('❌ Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Side - Animated Brand Section */}
      <div className="brand-section">
        <div className="animated-background">
          <div className="floating-icon">🌾</div>
          <div className="floating-icon">🚜</div>
          <div className="floating-icon">💧</div>
          <div className="floating-icon">🌱</div>
          <div className="floating-icon">☀️</div>
        </div>
        
        <div className="brand-content">
          <div className="logo-animation">
            <div className="logo-circle">
              <span className="logo-main">🌾</span>
            </div>
          </div>
          
          <h1 className="brand-title">
            Arya Krishi Farm<span className="highlight"></span>
          </h1>
          
          <p className="brand-tagline">
            Growing Together, <span className="glow-text">Prospering Forever</span>
          </p>

          <div className="feature-highlights">
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <div className="feature-text">
                <h3>Smart Payments</h3>
                <p>Seamless financial management</p>
              </div>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <div className="feature-text">
                <h3>Live Analytics</h3>
                <p>Real-time business insights</p>
              </div>
            </div>
          </div>

          <div className="powered-by">
            <p>Powered by <span className="company-name">codes.book</span></p>
            <div className="product-badge">
              <span className="product-icon">💎</span>
              MoneyMate
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="login-section">
        <div className="login-card">
          <div className="login-header">
            <div className="welcome-badge">
              <span className="badge-icon">👋</span>
              Welcome back
            </div>
            <h2>Access Your Account</h2>
            <p>Enter your credentials to continue</p>
          </div>

          {errors.general && (
            <div className="error-message">
              ⚠️ {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className={`input-group ${errors.email ? 'error' : ''}`}>
              <label>Email Address</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="modern-input"
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className={`input-group ${errors.password ? 'error' : ''}`}>
              <label>Password</label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="modern-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>

            <div className="form-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="modern-checkbox"
                />
                <span className="checkmark"></span>
                Remember me
              </label>
              <a href="/forgot-password" className="forgot-link">
                Forgot password?
              </a>
            </div>

            <button 
              type="submit" 
              className={`login-btn ${isLoading ? 'loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="btn-spinner"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <span className="btn-icon">→</span>
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            {/* <p>New to Arya Krishi Farm? <a href="/signup" className="signup-link">Create account</a></p> */}
          </div>
        </div>

        <div className="page-footer">
          <p>© 2025 Arya Krishi Farm. All rights reserved.</p>
          <p>Built with 💚 by <strong>codes.book</strong></p>
        </div>
      </div>
    </div>
  );
};

export default Login;