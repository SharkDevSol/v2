import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Building2, User as UserIcon, Lock } from 'lucide-react';
import styles from './Login.module.css';
import { getPermissionPath } from '../../config/adminPermissions';
import { ValidationRules, ErrorMessages } from '../../utils/validation';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import ThemeToggle from '../../components/ThemeToggle/ThemeToggle';
import LanguageSelector from '../../components/LanguageSelector/LanguageSelector';
import Toast from '../../components/Toast/Toast';

const Login = () => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'admin123',
    branchCode: 'IQRA'
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
      return;
    }
    
    // Load saved branch code from localStorage
    const savedBranchCode = localStorage.getItem('branchCode');
    if (savedBranchCode) {
      setCredentials(prev => ({ ...prev, branchCode: savedBranchCode }));
    }
  }, [navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Convert branch code to uppercase automatically
    const processedValue = name === 'branchCode' ? value.toUpperCase() : value;
    
    setCredentials(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate field on blur
    let error = '';
    const value = credentials[field];
    
    if (field === 'branchCode') {
      if (!ValidationRules.required(value)) {
        error = ErrorMessages.required;
      }
    } else if (field === 'username') {
      if (!ValidationRules.required(value)) {
        error = ErrorMessages.required;
      } else if (!ValidationRules.minLength(3)(value)) {
        error = ErrorMessages.minLength(3);
      }
    } else if (field === 'password') {
      if (!ValidationRules.required(value)) {
        error = ErrorMessages.required;
      } else if (!ValidationRules.minLength(6)(value)) {
        error = ErrorMessages.minLength(6);
      }
    }
    
    setErrors(prev => ({ ...prev, [field]: error }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ username: true, password: true, branchCode: true });
    
    // Validate all fields
    const newErrors = {};
    
    if (!ValidationRules.required(credentials.branchCode)) {
      newErrors.branchCode = ErrorMessages.required;
    }
    
    if (!ValidationRules.required(credentials.username)) {
      newErrors.username = ErrorMessages.required;
    } else if (!ValidationRules.minLength(3)(credentials.username)) {
      newErrors.username = ErrorMessages.minLength(3);
    }
    
    if (!ValidationRules.required(credentials.password)) {
      newErrors.password = ErrorMessages.required;
    } else if (!ValidationRules.minLength(6)(credentials.password)) {
      newErrors.password = ErrorMessages.minLength(6);
    }
    
    setErrors(newErrors);
    
    // If there are errors, don't submit
    if (Object.keys(newErrors).length > 0) {
      setToastMessage(t('auth.fixErrors', 'Please fix the errors before submitting'));
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/v2/branches/login', {
        ...credentials,
        branchCode: credentials.branchCode.toUpperCase(), // Convert to uppercase
        userType: 'admin'
      });
      
      if (response.data.message === 'Login successful' || response.data.success) {
        const user = response.data.user;
        const token = response.data.token;
        
        // Store JWT token for API authentication
        if (token) {
          localStorage.setItem('authToken', token);
        }
        
        localStorage.setItem('adminUser', JSON.stringify(user));
        localStorage.setItem('userType', user.userType || 'admin');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('branchCode', credentials.branchCode);
        
        // Store permissions for sub-accounts
        if (user.permissions) {
          localStorage.setItem('userPermissions', JSON.stringify(user.permissions));
        } else {
          localStorage.removeItem('userPermissions');
        }
        
        // Determine redirect path based on user type and permissions
        let redirectPath = '/';
        
        if (user.userType === 'sub-account' && user.permissions && user.permissions.length > 0) {
          // For sub-accounts, redirect to their first permitted page
          const firstPermittedPath = getPermissionPath(user.permissions[0]);
          if (firstPermittedPath) {
            redirectPath = firstPermittedPath;
          }
        } else if (user.userType === 'admin') {
          // Primary admin goes to home/dashboard
          redirectPath = location.state?.from?.pathname || '/';
        }
        
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      setToastMessage(error.response?.data?.error || t('auth.loginFailed', 'Login failed. Please check your credentials.'));
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.headerControls}>
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className={styles.content}>
        <div className={styles.loginCard}>
          <div className={styles.logoSection}>
            <img src="/skoolific-icon.png" alt="Skoolific" className={styles.logo} />
            <h1 className={styles.title}>{t('auth.adminPortalTitle', 'School Management System')}</h1>
            <p className={styles.subtitle}>{t('auth.adminPortalSubtitle', 'Admin Login')}</p>
          </div>
          
          <form onSubmit={handleSubmit} className={styles.form}>
            <Input
              label={t('auth.branchCode', 'Branch Code')}
              name="branchCode"
              value={credentials.branchCode}
              onChange={handleInputChange}
              onBlur={() => handleBlur('branchCode')}
              icon={<Building2 size={20} />}
              placeholder={t('auth.branchCodePlaceholder', 'Enter branch code')}
              error={touched.branchCode && errors.branchCode}
              disabled={isLoading}
              required
            />
            
            <Input
              label={t('auth.username', 'Username')}
              name="username"
              value={credentials.username}
              onChange={handleInputChange}
              onBlur={() => handleBlur('username')}
              icon={<UserIcon size={20} />}
              placeholder={t('auth.adminUsernamePlaceholder', 'Enter admin username')}
              error={touched.username && errors.username}
              disabled={isLoading}
              autoComplete="username"
              required
            />
            
            <Input
              label={t('auth.password', 'Password')}
              type="password"
              name="password"
              value={credentials.password}
              onChange={handleInputChange}
              onBlur={() => handleBlur('password')}
              icon={<Lock size={20} />}
              placeholder={t('auth.passwordPlaceholder', 'Enter your password')}
              error={touched.password && errors.password}
              disabled={isLoading}
              autoComplete="current-password"
              required
            />

            <div className={styles.options}>
              <label className={styles.rememberMe}>
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>{t('auth.rememberMe', 'Remember me')}</span>
              </label>
              <a href="#" className={styles.forgotPassword}>{t('auth.forgotPassword', 'Forgot password?')}</a>
            </div>
            
            <Button 
              type="submit" 
              variant="primary"
              size="lg"
              loading={isLoading}
              className={styles.loginButton}
            >
              {t('auth.signIn', 'Sign In')}
            </Button>
          </form>
          
          <div className={styles.footer}>
            <p>© 2025 Skoolific. {t('common.allRightsReserved', 'All rights reserved.')}</p>
          </div>
        </div>
      </div>

      <Toast
        isOpen={showToast}
        onClose={() => setShowToast(false)}
        message={toastMessage}
        type={toastType}
        duration={5000}
        position="top-right"
      />
    </div>
  );
};

export default Login;
