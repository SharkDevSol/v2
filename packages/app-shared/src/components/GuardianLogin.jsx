import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Building2, User as UserIcon, Lock } from 'lucide-react';
import styles from './GuardianLogin.module.css';
import Input from './Input/Input';
import Button from './Button/Button';
import ThemeToggle from './ThemeToggle/ThemeToggle';
import LanguageSelector from './LanguageSelector/LanguageSelector';
import Toast from './Toast/Toast';

const GuardianLogin = () => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState({ username: '', password: '', branchCode: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Load saved branch code from localStorage on mount
  React.useEffect(() => {
    const savedBranchCode = localStorage.getItem('branchCode');
    if (savedBranchCode) {
      setCredentials(prev => ({ ...prev, branchCode: savedBranchCode }));
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ username: true, password: true, branchCode: true });
    
    // Validate all fields
    const newErrors = {};
    if (!credentials.branchCode) newErrors.branchCode = 'Branch code is required';
    if (!credentials.username) newErrors.username = 'Username is required';
    if (!credentials.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length > 0) {
      setToastMessage('Please fill in all required fields');
      setToastType('error');
      setShowToast(true);
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post('/api/v2/auth/login', {
        ...credentials,
        userType: 'guardian'
      });
      
      const { role } = response.data;
      
      if (role === 'guardian') {
        localStorage.setItem('branchCode', credentials.branchCode);
        navigate(`/app/guardian/${credentials.username}`);
      } else {
        setToastMessage('Please use the Student Login page for student accounts.');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage(err.response?.data?.error || 'Login failed. Please try again.');
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
            <h1 className={styles.title}>{t('auth.guardianPortalTitle', 'Guardian Portal')}</h1>
            <p className={styles.subtitle}>{t('auth.guardianPortalSubtitle', "Stay connected with your child's school")}</p>
          </div>
          
          <form onSubmit={handleLogin} className={styles.form}>
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
              placeholder={t('auth.usernamePlaceholder', 'Enter your username')}
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
            <p>
              Need help? Contact your school administrator or{' '}
              <a href="/app/student-login" className={styles.link}>try Student Login</a>
            </p>
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

export default GuardianLogin;