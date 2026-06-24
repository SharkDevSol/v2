import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const LanguageContext = createContext();

/**
 * LanguageProvider component that manages language state and i18n
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language);
  
  /**
   * Change the application language
   * @param {string} lng - Language code ('en', 'am', 'ar')
   */
  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem('language', lng);
    
    // Update document direction for RTL languages
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = lng;
    
    // Update font family for Amharic
    if (lng === 'am') {
      document.body.style.fontFamily = "var(--font-amharic), var(--font-sans)";
    } else {
      document.body.style.fontFamily = "var(--font-sans)";
    }
  };
  
  useEffect(() => {
    // Set initial direction and language
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    
    // Set initial font family
    if (language === 'am') {
      document.body.style.fontFamily = "var(--font-amharic), var(--font-sans)";
    }
  }, [language]);
  
  const value = {
    language,
    changeLanguage,
    isRTL: language === 'ar',
    isAmharic: language === 'am',
    isEnglish: language === 'en'
  };
  
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

/**
 * Hook to access language context
 * @returns {Object} Language context value
 * @throws {Error} If used outside LanguageProvider
 */
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};

export default LanguageContext;
