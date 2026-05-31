import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Building2, 
  User as UserIcon, 
  Lock, 
  LogIn, 
  Shield, 
  GraduationCap,
  BarChart3,
  Users,
  CalendarCheck,
  Zap
} from 'lucide-react';
import styles from './Login.module.css';
import './LoginOverrides.css';
import { getPermissionPath } from '../../config/adminPermissions';
import { ValidationRules, ErrorMessages } from '../../utils/validation';
import Input from '../../COMPONENTS/Input/Input';
import Button from '../../COMPONENTS/Button/Button';
import LanguageSelector from '../../COMPONENTS/LanguageSelector/LanguageSelector';
import Toast from '../../COMPONENTS/Toast/Toast';

const Login = () => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({
    username: '',
    password: '',
    branchCode: ''
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

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    if (isLoggedIn) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
    
    const savedBranchCode = localStorage.getItem('branchCode');
    if (savedBranchCode) {
      setCredentials(prev => ({ ...prev, branchCode: savedBranchCode }));
    }
  }, [navigate, location]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'branchCode' ? value.toUpperCase() : value;
    
    setCredentials(prev => ({
      ...prev,
      [name]: processedValue
    }));
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
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
    
    setTouched({ username: true, password: true, branchCode: true });
    
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
        branchCode: credentials.branchCode.toUpperCase(),
        userType: 'admin'
      });
      
      if (response.data.message === 'Login successful' || response.data.success) {
        const user = response.data.user;
        const token = response.data.token;
        
        if (token) {
          localStorage.setItem('authToken', token);
        }
        
        localStorage.setItem('adminUser', JSON.stringify(user));
        localStorage.setItem('userType', user.userType || 'admin');
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('branchCode', credentials.branchCode);
        
        if (user.permissions) {
          localStorage.setItem('userPermissions', JSON.stringify(user.permissions));
        } else {
          localStorage.removeItem('userPermissions');
        }
        
        let redirectPath = '/';
        
        if (user.userType === 'sub-account' && user.permissions && user.permissions.length > 0) {
          const firstPermittedPath = getPermissionPath(user.permissions[0]);
          if (firstPermittedPath) {
            redirectPath = firstPermittedPath;
          }
        } else if (user.userType === 'admin') {
          redirectPath = location.state?.from?.pathname || '/';
        }
        
        navigate(redirectPath, { replace: true });
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || t('auth.loginFailed', 'Login failed. Please check your credentials.');
      if (errorMsg) {
        setToastMessage(errorMsg);
        setToastType('error');
        setShowToast(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Animated gradient background */}
      <div className={styles.bgGradient} />
      
      {/* Animated color blobs */}
      <div className={styles.blob1} />
      <div className={styles.blob2} />
      <div className={styles.blob3} />
      <div className={styles.blob4} />

      {/* Glass card layout */}
      <motion.div 
        className={styles.glassLayout}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Left Panel - Branding */}
        <div className={styles.brandPanel}>
          <motion.div 
            className={styles.brandContent}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.img 
              src="/skoolific-icon.png" 
              alt="Skoolific" 
              className={styles.brandLogo}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            />
            <h1 className={styles.brandTitle}>
              {t('auth.brandLine1', 'The future of')}
              <br />
              <span className={styles.brandTitleGradient}>
                {t('auth.brandLine2', 'school management')}
              </span>
            </h1>
            <p className={styles.brandSubtitle}>
              {t('auth.brandSubtitle', 'Everything you need to run your school efficiently — students, staff, finance, and analytics in one platform.')}
            </p>
            
            <div className={styles.brandFeatures}>
              <motion.div 
                className={styles.brandFeature}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
              >
                <div className={styles.featureIcon}>
                  <Users size={18} />
                </div>
                <span className={styles.featureText}>
                  {t('auth.feature1', 'Student & Staff Management')}
                </span>
              </motion.div>
              
              <motion.div 
                className={styles.brandFeature}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
              >
                <div className={styles.featureIcon}>
                  <BarChart3 size={18} />
                </div>
                <span className={styles.featureText}>
                  {t('auth.feature2', 'Real-time Analytics & Reports')}
                </span>
              </motion.div>
              
              <motion.div 
                className={styles.brandFeature}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <div className={styles.featureIcon}>
                  <CalendarCheck size={18} />
                </div>
                <span className={styles.featureText}>
                  {t('auth.feature3', 'Attendance & Schedule Tracking')}
                </span>
              </motion.div>

              <motion.div 
                className={styles.brandFeature}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className={styles.featureIcon}>
                  <Zap size={18} />
                </div>
                <span className={styles.featureText}>
                  {t('auth.feature4', 'AI-Powered Exam Generation')}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Panel - Glass Form */}
        <div className={styles.formPanel}>
          <div className={styles.headerControls}>
            <LanguageSelector />
          </div>

          <motion.div 
            className={styles.content}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.loginCard} data-theme="glass">
              <div className={styles.logoSection}>
                <motion.div 
                  className={styles.logoWrapper}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 0.5 }}
                >
                  <div className={styles.logoGlow} />
                  <img src="/skoolific-icon.png" alt="Skoolific" className={styles.logo} />
                </motion.div>
                <motion.h1 
                  className={styles.title}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                >
                  {t('auth.welcomeBack', 'Welcome back')}
                </motion.h1>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <span className={styles.subtitle}>
                    <Shield size={13} className={styles.subtitleIcon} />
                    {t('auth.adminPortalSubtitle', 'Admin Portal')}
                  </span>
                </motion.div>
              </div>
              
              <motion.form 
                onSubmit={handleSubmit} 
                className={styles.form}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.5 }}
              >
                <Input
                  label={t('auth.branchCode', 'Branch Code')}
                  name="branchCode"
                  value={credentials.branchCode}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('branchCode')}
                  prefixIcon={<Building2 size={18} />}
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
                  prefixIcon={<UserIcon size={18} />}
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
                  prefixIcon={<Lock size={18} />}
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
                      className={styles.checkbox}
                    />
                    <span className={styles.checkboxCustom} />
                    <span>{t('auth.rememberMe', 'Remember me')}</span>
                  </label>
                  <a href="#" className={styles.forgotPassword}>
                    {t('auth.forgotPassword', 'Forgot password?')}
                  </a>
                </div>
                
                <Button 
                  type="submit" 
                  variant="primary"
                  size="lg"
                  loading={isLoading}
                  fullWidth
                  icon={<LogIn size={18} />}
                  className={styles.loginButton}
                >
                  {t('auth.signIn', 'Sign In')}
                </Button>
              </motion.form>
              
              <div className={styles.footer}>
                <div className={styles.footerBrand}>
                  <GraduationCap size={12} />
                  <span>Skoolific</span>
                </div>
                <p>© 2025 {t('common.allRightsReserved', 'All rights reserved.')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {showToast && toastMessage && (
        <Toast
          onClose={() => setShowToast(false)}
          message={toastMessage}
          type={toastType}
          duration={5000}
          position="top-right"
        />
      )}
    </div>
  );
};

export default Login;
