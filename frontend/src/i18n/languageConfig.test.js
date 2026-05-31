/**
 * Language Configuration Tests
 * 
 * Tests for language configuration utilities and functions.
 * Verifies language metadata, direction detection, font handling, and formatting.
 * Tests localStorage integration and initialization logic.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  SUPPORTED_LANGUAGES,
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  TRANSLATION_NAMESPACES,
  getLanguageConfig,
  isLanguageSupported,
  getLanguageDirection,
  isRTL,
  getLanguageFontFamily,
  applyLanguageAttributes,
  getStoredLanguage,
  storeLanguage,
  getBrowserLanguage,
  initializeLanguage,
  formatters,
} from './languageConfig';

describe('Language Configuration', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    
    // Reset document attributes
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.body.style.fontFamily = '';
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.body.style.fontFamily = '';
  });

  describe('Constants', () => {
    test('should have correct supported languages', () => {
      expect(SUPPORTED_LANGUAGES).toHaveLength(3);
      expect(SUPPORTED_LANGUAGES.map(l => l.code)).toEqual(['en', 'am', 'ar']);
    });

    test('should have English as default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('en');
    });

    test('should have correct language storage key', () => {
      expect(LANGUAGE_STORAGE_KEY).toBe('language');
    });

    test('should have all translation namespaces defined', () => {
      expect(TRANSLATION_NAMESPACES).toHaveProperty('COMMON');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('AUTH');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('DASHBOARD');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('STUDENTS');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('STAFF');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('ACADEMIC');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('FINANCE');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('HR');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('COMMUNICATION');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('SETTINGS');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('NAVIGATION');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('ERRORS');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('VALIDATION');
      expect(TRANSLATION_NAMESPACES).toHaveProperty('APP');
    });
  });

  describe('Language Metadata', () => {
    test('English should have correct metadata', () => {
      const en = SUPPORTED_LANGUAGES.find(l => l.code === 'en');
      expect(en).toEqual({
        code: 'en',
        name: 'English',
        nativeName: 'English',
        direction: 'ltr',
        flag: '🇬🇧',
        fontFamily: 'var(--font-sans)',
        requiresCustomFont: false,
      });
    });

    test('Amharic should have correct metadata', () => {
      const am = SUPPORTED_LANGUAGES.find(l => l.code === 'am');
      expect(am).toEqual({
        code: 'am',
        name: 'Amharic',
        nativeName: 'አማርኛ',
        direction: 'ltr',
        flag: '🇪🇹',
        fontFamily: 'var(--font-amharic), var(--font-sans)',
        requiresCustomFont: true,
      });
    });

    test('Arabic should have correct metadata', () => {
      const ar = SUPPORTED_LANGUAGES.find(l => l.code === 'ar');
      expect(ar).toEqual({
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        direction: 'rtl',
        flag: '🇸🇦',
        fontFamily: 'var(--font-sans)',
        requiresCustomFont: false,
      });
    });
  });

  describe('getLanguageConfig', () => {
    test('should return config for English', () => {
      const config = getLanguageConfig('en');
      expect(config).toBeDefined();
      expect(config.code).toBe('en');
      expect(config.name).toBe('English');
    });

    test('should return config for Amharic', () => {
      const config = getLanguageConfig('am');
      expect(config).toBeDefined();
      expect(config.code).toBe('am');
      expect(config.name).toBe('Amharic');
    });

    test('should return config for Arabic', () => {
      const config = getLanguageConfig('ar');
      expect(config).toBeDefined();
      expect(config.code).toBe('ar');
      expect(config.name).toBe('Arabic');
    });

    test('should return undefined for unsupported language', () => {
      const config = getLanguageConfig('fr');
      expect(config).toBeUndefined();
    });

    test('should return undefined for invalid input', () => {
      expect(getLanguageConfig('')).toBeUndefined();
      expect(getLanguageConfig(null)).toBeUndefined();
      expect(getLanguageConfig(undefined)).toBeUndefined();
    });
  });

  describe('isLanguageSupported', () => {
    test('should return true for English', () => {
      expect(isLanguageSupported('en')).toBe(true);
    });

    test('should return true for Amharic', () => {
      expect(isLanguageSupported('am')).toBe(true);
    });

    test('should return true for Arabic', () => {
      expect(isLanguageSupported('ar')).toBe(true);
    });

    test('should return false for unsupported languages', () => {
      expect(isLanguageSupported('fr')).toBe(false);
      expect(isLanguageSupported('es')).toBe(false);
      expect(isLanguageSupported('de')).toBe(false);
    });

    test('should return false for invalid input', () => {
      expect(isLanguageSupported('')).toBe(false);
      expect(isLanguageSupported(null)).toBe(false);
      expect(isLanguageSupported(undefined)).toBe(false);
    });
  });

  describe('getLanguageDirection', () => {
    test('should return ltr for English', () => {
      expect(getLanguageDirection('en')).toBe('ltr');
    });

    test('should return ltr for Amharic', () => {
      expect(getLanguageDirection('am')).toBe('ltr');
    });

    test('should return rtl for Arabic', () => {
      expect(getLanguageDirection('ar')).toBe('rtl');
    });

    test('should return ltr for unsupported language', () => {
      expect(getLanguageDirection('fr')).toBe('ltr');
    });

    test('should return ltr for invalid input', () => {
      expect(getLanguageDirection('')).toBe('ltr');
      expect(getLanguageDirection(null)).toBe('ltr');
      expect(getLanguageDirection(undefined)).toBe('ltr');
    });
  });

  describe('isRTL', () => {
    test('should return false for English', () => {
      expect(isRTL('en')).toBe(false);
    });

    test('should return false for Amharic', () => {
      expect(isRTL('am')).toBe(false);
    });

    test('should return true for Arabic', () => {
      expect(isRTL('ar')).toBe(true);
    });

    test('should return false for unsupported language', () => {
      expect(isRTL('fr')).toBe(false);
    });

    test('should return false for invalid input', () => {
      expect(isRTL('')).toBe(false);
      expect(isRTL(null)).toBe(false);
      expect(isRTL(undefined)).toBe(false);
    });
  });

  describe('getLanguageFontFamily', () => {
    test('should return default font for English', () => {
      expect(getLanguageFontFamily('en')).toBe('var(--font-sans)');
    });

    test('should return Amharic font for Amharic', () => {
      expect(getLanguageFontFamily('am')).toBe('var(--font-amharic), var(--font-sans)');
    });

    test('should return default font for Arabic', () => {
      expect(getLanguageFontFamily('ar')).toBe('var(--font-sans)');
    });

    test('should return default font for unsupported language', () => {
      expect(getLanguageFontFamily('fr')).toBe('var(--font-sans)');
    });

    test('should return default font for invalid input', () => {
      expect(getLanguageFontFamily('')).toBe('var(--font-sans)');
      expect(getLanguageFontFamily(null)).toBe('var(--font-sans)');
      expect(getLanguageFontFamily(undefined)).toBe('var(--font-sans)');
    });
  });

  describe('applyLanguageAttributes', () => {
    test('should apply English attributes', () => {
      applyLanguageAttributes('en');
      
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
      expect(document.body.style.fontFamily).toBe('var(--font-sans)');
    });

    test('should apply Amharic attributes', () => {
      applyLanguageAttributes('am');
      
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('am');
      expect(document.body.style.fontFamily).toBe('var(--font-amharic), var(--font-sans)');
    });

    test('should apply Arabic attributes', () => {
      applyLanguageAttributes('ar');
      
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
      expect(document.body.style.fontFamily).toBe('var(--font-sans)');
    });

    test('should handle unsupported language gracefully', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      applyLanguageAttributes('fr');
      
      expect(consoleWarnSpy).toHaveBeenCalledWith('Language fr is not supported');
      
      consoleWarnSpy.mockRestore();
    });

    test('should switch between languages correctly', () => {
      // Apply English
      applyLanguageAttributes('en');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('en');
      
      // Apply Arabic
      applyLanguageAttributes('ar');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
      
      // Apply Amharic
      applyLanguageAttributes('am');
      expect(document.documentElement.dir).toBe('ltr');
      expect(document.documentElement.lang).toBe('am');
    });
  });

  describe('LocalStorage Functions', () => {
    describe('getStoredLanguage', () => {
      test('should return null when no language is stored', () => {
        expect(getStoredLanguage()).toBeNull();
      });

      test('should return stored language', () => {
        localStorage.setItem('language', 'am');
        expect(getStoredLanguage()).toBe('am');
      });

      test('should handle localStorage errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
          throw new Error('localStorage error');
        });
        
        const result = getStoredLanguage();
        
        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore();
        getItemSpy.mockRestore();
      });
    });

    describe('storeLanguage', () => {
      test('should store language in localStorage', () => {
        storeLanguage('am');
        expect(localStorage.getItem('language')).toBe('am');
      });

      test('should update stored language', () => {
        storeLanguage('en');
        expect(localStorage.getItem('language')).toBe('en');
        
        storeLanguage('ar');
        expect(localStorage.getItem('language')).toBe('ar');
      });

      test('should handle localStorage errors', () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
          throw new Error('localStorage error');
        });
        
        storeLanguage('am');
        
        expect(consoleErrorSpy).toHaveBeenCalled();
        
        consoleErrorSpy.mockRestore();
        setItemSpy.mockRestore();
      });
    });
  });

  describe('getBrowserLanguage', () => {
    test('should return browser language if supported', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });
      
      expect(getBrowserLanguage()).toBe('en');
    });

    test('should extract language code from locale', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'ar-SA',
        configurable: true,
      });
      
      expect(getBrowserLanguage()).toBe('ar');
    });

    test('should return default language if browser language not supported', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true,
      });
      
      expect(getBrowserLanguage()).toBe('en');
    });

    test('should handle userLanguage fallback', () => {
      Object.defineProperty(navigator, 'language', {
        value: undefined,
        configurable: true,
      });
      Object.defineProperty(navigator, 'userLanguage', {
        value: 'am-ET',
        configurable: true,
      });
      
      expect(getBrowserLanguage()).toBe('am');
    });
  });

  describe('initializeLanguage', () => {
    test('should return stored language if available', () => {
      localStorage.setItem('language', 'am');
      expect(initializeLanguage()).toBe('am');
    });

    test('should return browser language if no stored language', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'ar-SA',
        configurable: true,
      });
      
      expect(initializeLanguage()).toBe('ar');
    });

    test('should return default language if neither stored nor browser language supported', () => {
      Object.defineProperty(navigator, 'language', {
        value: 'fr-FR',
        configurable: true,
      });
      
      expect(initializeLanguage()).toBe('en');
    });

    test('should prioritize stored language over browser language', () => {
      localStorage.setItem('language', 'am');
      Object.defineProperty(navigator, 'language', {
        value: 'ar-SA',
        configurable: true,
      });
      
      expect(initializeLanguage()).toBe('am');
    });

    test('should ignore invalid stored language', () => {
      localStorage.setItem('language', 'invalid');
      Object.defineProperty(navigator, 'language', {
        value: 'en-US',
        configurable: true,
      });
      
      expect(initializeLanguage()).toBe('en');
    });
  });

  describe('Formatters', () => {
    describe('number formatter', () => {
      test('should format number in English locale', () => {
        const result = formatters.number(1234.56, 'en');
        expect(result).toBe('1,234.56');
      });

      test('should format number in Amharic locale', () => {
        const result = formatters.number(1234.56, 'am');
        // Amharic uses Ethiopian locale which may have different formatting
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      test('should format number in Arabic locale', () => {
        const result = formatters.number(1234.56, 'ar');
        // Arabic uses Arabic-Indic numerals in some locales
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      test('should handle large numbers', () => {
        const result = formatters.number(1234567.89, 'en');
        expect(result).toBe('1,234,567.89');
      });

      test('should handle zero', () => {
        const result = formatters.number(0, 'en');
        expect(result).toBe('0');
      });

      test('should handle negative numbers', () => {
        const result = formatters.number(-1234.56, 'en');
        expect(result).toBe('-1,234.56');
      });
    });

    describe('currency formatter', () => {
      test('should format currency in English locale', () => {
        const result = formatters.currency(1234.56, 'en', 'ETB');
        expect(result).toContain('1,234.56');
        expect(result).toContain('ETB');
      });

      test('should format currency in Amharic locale', () => {
        const result = formatters.currency(1234.56, 'am', 'ETB');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      test('should format currency in Arabic locale', () => {
        const result = formatters.currency(1234.56, 'ar', 'ETB');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      test('should use ETB as default currency', () => {
        const result = formatters.currency(1234.56, 'en');
        expect(result).toContain('ETB');
      });

      test('should handle different currencies', () => {
        const result = formatters.currency(1234.56, 'en', 'USD');
        // Currency symbol may be displayed as $ instead of USD depending on locale
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('1,234.56');
      });

      test('should handle zero amount', () => {
        const result = formatters.currency(0, 'en', 'ETB');
        expect(result).toContain('0');
      });
    });

    describe('date formatter', () => {
      test('should format date in English locale', () => {
        const date = new Date('2024-01-15');
        const result = formatters.date(date, 'en');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toContain('2024');
      });

      test('should format date in Amharic locale', () => {
        const date = new Date('2024-01-15');
        const result = formatters.date(date, 'am');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      test('should format date in Arabic locale', () => {
        const date = new Date('2024-01-15');
        const result = formatters.date(date, 'ar');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      test('should handle different dates', () => {
        const date1 = new Date('2024-01-01');
        const date2 = new Date('2024-12-31');
        
        const result1 = formatters.date(date1, 'en');
        const result2 = formatters.date(date2, 'en');
        
        expect(result1).not.toBe(result2);
      });
    });

    describe('time formatter', () => {
      test('should format time in English locale', () => {
        const date = new Date('2024-01-15T14:30:00');
        const result = formatters.time(date, 'en');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
        expect(result).toMatch(/\d{1,2}:\d{2}/);
      });

      test('should format time in Amharic locale', () => {
        const date = new Date('2024-01-15T14:30:00');
        const result = formatters.time(date, 'am');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      test('should format time in Arabic locale', () => {
        const date = new Date('2024-01-15T14:30:00');
        const result = formatters.time(date, 'ar');
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });

      test('should handle different times', () => {
        const time1 = new Date('2024-01-15T09:00:00');
        const time2 = new Date('2024-01-15T17:30:00');
        
        const result1 = formatters.time(time1, 'en');
        const result2 = formatters.time(time2, 'en');
        
        expect(result1).not.toBe(result2);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should handle complete language switch workflow', () => {
      // Initialize with English
      const lang = initializeLanguage();
      expect(lang).toBe('en');
      
      // Store Amharic
      storeLanguage('am');
      expect(getStoredLanguage()).toBe('am');
      
      // Apply Amharic attributes
      applyLanguageAttributes('am');
      expect(document.documentElement.lang).toBe('am');
      expect(document.documentElement.dir).toBe('ltr');
      
      // Switch to Arabic
      storeLanguage('ar');
      applyLanguageAttributes('ar');
      expect(document.documentElement.lang).toBe('ar');
      expect(document.documentElement.dir).toBe('rtl');
    });

    test('should validate all supported languages', () => {
      SUPPORTED_LANGUAGES.forEach(lang => {
        expect(isLanguageSupported(lang.code)).toBe(true);
        expect(getLanguageConfig(lang.code)).toBeDefined();
        expect(getLanguageDirection(lang.code)).toBe(lang.direction);
        expect(getLanguageFontFamily(lang.code)).toBe(lang.fontFamily);
      });
    });

    test('should handle language persistence across sessions', () => {
      // Session 1: Set language
      storeLanguage('am');
      
      // Session 2: Initialize
      const lang = initializeLanguage();
      expect(lang).toBe('am');
      
      // Apply attributes
      applyLanguageAttributes(lang);
      expect(document.documentElement.lang).toBe('am');
    });
  });
});
