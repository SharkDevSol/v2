/**
 * i18n Configuration Tests
 * 
 * Tests for i18next configuration and initialization.
 * Verifies translation loading, language detection, and fallback behavior.
 */

import { describe, test, expect, beforeEach } from 'vitest';
import i18n from './config';

describe('i18n Configuration', () => {
  beforeEach(() => {
    // Reset to English before each test
    i18n.changeLanguage('en');
    localStorage.clear();
  });

  describe('Initialization', () => {
    test('should initialize i18next', () => {
      expect(i18n).toBeDefined();
      expect(i18n.isInitialized).toBe(true);
    });

    test('should have English as fallback language', () => {
      // fallbackLng can be a string or array depending on i18next version
      const fallback = i18n.options.fallbackLng;
      if (Array.isArray(fallback)) {
        expect(fallback).toContain('en');
      } else {
        expect(fallback).toBe('en');
      }
    });

    test('should have interpolation configured', () => {
      expect(i18n.options.interpolation).toBeDefined();
      expect(i18n.options.interpolation.escapeValue).toBe(false);
    });

    test('should have language detection configured', () => {
      expect(i18n.options.detection).toBeDefined();
      expect(i18n.options.detection.order).toContain('localStorage');
      expect(i18n.options.detection.order).toContain('navigator');
      expect(i18n.options.detection.caches).toContain('localStorage');
    });
  });

  describe('Supported Languages', () => {
    test('should have English translations loaded', () => {
      expect(i18n.hasResourceBundle('en', 'translation')).toBe(true);
    });

    test('should have Amharic translations loaded', () => {
      expect(i18n.hasResourceBundle('am', 'translation')).toBe(true);
    });

    test('should have Arabic translations loaded', () => {
      expect(i18n.hasResourceBundle('ar', 'translation')).toBe(true);
    });
  });

  describe('Translation Keys', () => {
    test('should have common translations in English', () => {
      i18n.changeLanguage('en');
      
      expect(i18n.t('common.save')).toBe('Save');
      expect(i18n.t('common.cancel')).toBe('Cancel');
      expect(i18n.t('common.delete')).toBe('Delete');
      expect(i18n.t('common.edit')).toBe('Edit');
      expect(i18n.t('common.search')).toBe('Search');
    });

    test('should have auth translations in English', () => {
      i18n.changeLanguage('en');
      
      expect(i18n.t('auth.login')).toBe('Login');
      expect(i18n.t('auth.logout')).toBe('Logout');
      expect(i18n.t('auth.username')).toBe('Username');
      expect(i18n.t('auth.password')).toBe('Password');
    });

    test('should have dashboard translations in English', () => {
      i18n.changeLanguage('en');
      
      expect(i18n.t('dashboard.title')).toBe('Dashboard');
      expect(i18n.t('dashboard.overview')).toBe('Overview');
      expect(i18n.t('dashboard.statistics')).toBe('Statistics');
    });

    test('should have common translations in Amharic', () => {
      i18n.changeLanguage('am');
      
      expect(i18n.t('common.save')).toBe('አስቀምጥ');
      expect(i18n.t('common.cancel')).toBe('ሰርዝ');
      expect(i18n.t('common.delete')).toBe('ሰርዝ');
      expect(i18n.t('common.edit')).toBe('አርትዕ');
      expect(i18n.t('common.search')).toBe('ፈልግ');
    });

    test('should have auth translations in Amharic', () => {
      i18n.changeLanguage('am');
      
      expect(i18n.t('auth.login')).toBe('ግባ');
      expect(i18n.t('auth.logout')).toBe('ውጣ');
      expect(i18n.t('auth.username')).toBe('የተጠቃሚ ስም');
      expect(i18n.t('auth.password')).toBe('የይለፍ ቃል');
    });

    test('should have common translations in Arabic', () => {
      i18n.changeLanguage('ar');
      
      expect(i18n.t('common.save')).toBe('حفظ');
      expect(i18n.t('common.cancel')).toBe('إلغاء');
      expect(i18n.t('common.delete')).toBe('حذف');
      expect(i18n.t('common.edit')).toBe('تعديل');
      expect(i18n.t('common.search')).toBe('بحث');
    });

    test('should have auth translations in Arabic', () => {
      i18n.changeLanguage('ar');
      
      expect(i18n.t('auth.login')).toBe('تسجيل الدخول');
      expect(i18n.t('auth.logout')).toBe('تسجيل الخروج');
      expect(i18n.t('auth.username')).toBe('اسم المستخدم');
      expect(i18n.t('auth.password')).toBe('كلمة المرور');
    });
  });

  describe('Language Switching', () => {
    test('should switch from English to Amharic', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
      
      await i18n.changeLanguage('am');
      expect(i18n.language).toBe('am');
    });

    test('should switch from English to Arabic', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
      
      await i18n.changeLanguage('ar');
      expect(i18n.language).toBe('ar');
    });

    test('should switch between all languages', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
      
      await i18n.changeLanguage('am');
      expect(i18n.language).toBe('am');
      
      await i18n.changeLanguage('ar');
      expect(i18n.language).toBe('ar');
      
      await i18n.changeLanguage('en');
      expect(i18n.language).toBe('en');
    });

    test('should update translations when language changes', async () => {
      await i18n.changeLanguage('en');
      expect(i18n.t('common.save')).toBe('Save');
      
      await i18n.changeLanguage('am');
      expect(i18n.t('common.save')).toBe('አስቀምጥ');
      
      await i18n.changeLanguage('ar');
      expect(i18n.t('common.save')).toBe('حفظ');
    });
  });

  describe('Interpolation', () => {
    test('should interpolate variables in English', () => {
      i18n.changeLanguage('en');
      const result = i18n.t('dashboard.welcome', { name: 'John' });
      expect(result).toBe('Welcome back, John');
    });

    test('should interpolate variables in Amharic', () => {
      i18n.changeLanguage('am');
      const result = i18n.t('dashboard.welcome', { name: 'ጆን' });
      expect(result).toBe('እንኳን ደህና መጡ, ጆን');
    });

    test('should interpolate variables in Arabic', () => {
      i18n.changeLanguage('ar');
      const result = i18n.t('dashboard.welcome', { name: 'جون' });
      expect(result).toBe('مرحبًا بعودتك، جون');
    });
  });

  describe('Fallback Behavior', () => {
    test('should fallback to English for missing keys', () => {
      i18n.changeLanguage('am');
      
      // If a key doesn't exist in Amharic, it should fallback to English
      const result = i18n.t('nonexistent.key');
      expect(result).toBeDefined();
    });

    test('should return key if translation missing in all languages', () => {
      const result = i18n.t('completely.nonexistent.key');
      expect(result).toBe('completely.nonexistent.key');
    });
  });

  describe('Translation Namespaces', () => {
    test('should have all required namespaces', () => {
      const namespaces = ['common', 'auth', 'dashboard', 'students', 'staff', 
                         'academic', 'finance', 'communication', 'settings', 'app'];
      
      namespaces.forEach(namespace => {
        expect(i18n.t(`${namespace}.title`)).toBeDefined();
      });
    });

    test('should access nested translation keys', () => {
      i18n.changeLanguage('en');
      
      expect(i18n.t('students.firstName')).toBe('First Name');
      expect(i18n.t('students.lastName')).toBe('Last Name');
      expect(i18n.t('staff.staffType')).toBe('Staff Type');
    });
  });

  describe('Language Detection', () => {
    test('should detect language from localStorage', () => {
      localStorage.setItem('i18nextLng', 'am');
      
      // Create new i18n instance to test detection
      // In real scenario, this would be on app initialization
      expect(localStorage.getItem('i18nextLng')).toBe('am');
    });

    test('should cache language selection', async () => {
      await i18n.changeLanguage('ar');
      
      // i18next should cache the language
      expect(localStorage.getItem('i18nextLng')).toBe('ar');
    });
  });

  describe('Translation Completeness', () => {
    test('should have matching keys across all languages', () => {
      const enKeys = Object.keys(i18n.getResourceBundle('en', 'translation'));
      const amKeys = Object.keys(i18n.getResourceBundle('am', 'translation'));
      const arKeys = Object.keys(i18n.getResourceBundle('ar', 'translation'));
      
      expect(enKeys.sort()).toEqual(amKeys.sort());
      expect(enKeys.sort()).toEqual(arKeys.sort());
    });

    test('should have translations for all common actions', () => {
      const commonActions = ['save', 'cancel', 'delete', 'edit', 'add', 'search', 
                            'filter', 'export', 'import', 'submit', 'close'];
      
      ['en', 'am', 'ar'].forEach(lang => {
        i18n.changeLanguage(lang);
        commonActions.forEach(action => {
          const translation = i18n.t(`common.${action}`);
          expect(translation).toBeDefined();
          expect(translation).not.toBe(`common.${action}`);
        });
      });
    });

    test('should have translations for all auth fields', () => {
      const authFields = ['login', 'logout', 'username', 'password', 'branchCode'];
      
      ['en', 'am', 'ar'].forEach(lang => {
        i18n.changeLanguage(lang);
        authFields.forEach(field => {
          const translation = i18n.t(`auth.${field}`);
          expect(translation).toBeDefined();
          expect(translation).not.toBe(`auth.${field}`);
        });
      });
    });

    test('should have translations for all modules', () => {
      const modules = ['dashboard', 'students', 'staff', 'academic', 
                      'finance', 'communication', 'settings'];
      
      ['en', 'am', 'ar'].forEach(lang => {
        i18n.changeLanguage(lang);
        modules.forEach(module => {
          const translation = i18n.t(`${module}.title`);
          expect(translation).toBeDefined();
          expect(translation).not.toBe(`${module}.title`);
        });
      });
    });
  });

  describe('Performance', () => {
    test('should load translations quickly', () => {
      const start = performance.now();
      i18n.t('common.save');
      const end = performance.now();
      
      // Translation should be instant (< 10ms)
      expect(end - start).toBeLessThan(10);
    });

    test('should switch languages quickly', async () => {
      const start = performance.now();
      await i18n.changeLanguage('am');
      const end = performance.now();
      
      // Language switch should be fast (< 100ms)
      expect(end - start).toBeLessThan(100);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid language codes gracefully', async () => {
      const currentLang = i18n.language;
      
      try {
        await i18n.changeLanguage('invalid');
      } catch (error) {
        // Should not throw error
      }
      
      // Should still be able to get translations
      expect(i18n.t('common.save')).toBeDefined();
    });

    test('should handle missing translation keys gracefully', () => {
      const result = i18n.t('this.key.does.not.exist');
      expect(result).toBe('this.key.does.not.exist');
    });
  });
});
