/**
 * Language Switching Integration Tests
 * 
 * End-to-end tests for complete language switching functionality.
 * Tests integration between i18n, LanguageContext, and LanguageSelector.
 * Verifies RTL layout switching, font changes, and translation updates.
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from 'react-i18next';
import i18n from './config';
import LanguageSelector from '../COMPONENTS/LanguageSelector/LanguageSelector';

// Test component that uses both LanguageContext and i18n
const TestApp = () => {
  const { language, changeLanguage, isRTL, isAmharic, isEnglish } = useLanguage();
  const { t } = useTranslation();
  
  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="is-rtl">{isRTL ? 'true' : 'false'}</div>
      <div data-testid="is-amharic">{isAmharic ? 'true' : 'false'}</div>
      <div data-testid="is-english">{isEnglish ? 'true' : 'false'}</div>
      <div data-testid="document-dir">{document.documentElement.dir}</div>
      <div data-testid="document-lang">{document.documentElement.lang}</div>
      <div data-testid="body-font">{document.body.style.fontFamily}</div>
      
      <div data-testid="translation-save">{t('common.save')}</div>
      <div data-testid="translation-login">{t('auth.login')}</div>
      <div data-testid="translation-dashboard">{t('dashboard.title')}</div>
      
      <button onClick={() => changeLanguage('en')} data-testid="btn-english">
        English
      </button>
      <button onClick={() => changeLanguage('am')} data-testid="btn-amharic">
        Amharic
      </button>
      <button onClick={() => changeLanguage('ar')} data-testid="btn-arabic">
        Arabic
      </button>
      
      <LanguageSelector />
    </div>
  );
};

describe('Language Switching Integration', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    
    // Reset document attributes
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.body.style.fontFamily = '';
    
    // Reset i18n to English
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.body.style.fontFamily = '';
  });

  describe('Initial State', () => {
    test('should initialize with English by default', () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      expect(screen.getByTestId('is-english')).toHaveTextContent('true');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
      expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
      expect(screen.getByTestId('document-lang')).toHaveTextContent('en');
      expect(screen.getByTestId('translation-save')).toHaveTextContent('Save');
      expect(screen.getByTestId('translation-login')).toHaveTextContent('Login');
      expect(screen.getByTestId('translation-dashboard')).toHaveTextContent('Dashboard');
    });

    test('should initialize with stored language from localStorage', () => {
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('am');
      expect(screen.getByTestId('is-amharic')).toHaveTextContent('true');
      expect(screen.getByTestId('translation-save')).toHaveTextContent('አስቀምጥ');
    });
  });

  describe('Complete Language Switch - English to Amharic', () => {
    test('should switch all aspects from English to Amharic', async () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Initial state - English
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      expect(screen.getByTestId('translation-save')).toHaveTextContent('Save');
      expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
      expect(screen.getByTestId('document-lang')).toHaveTextContent('en');

      // Switch to Amharic
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        // Language state updated
        expect(screen.getByTestId('current-language')).toHaveTextContent('am');
        expect(screen.getByTestId('is-amharic')).toHaveTextContent('true');
        expect(screen.getByTestId('is-english')).toHaveTextContent('false');
        
        // Translations updated
        expect(screen.getByTestId('translation-save')).toHaveTextContent('አስቀምጥ');
        expect(screen.getByTestId('translation-login')).toHaveTextContent('ግባ');
        expect(screen.getByTestId('translation-dashboard')).toHaveTextContent('ዳሽቦርድ');
        
        // Document attributes updated
        expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
        expect(screen.getByTestId('document-lang')).toHaveTextContent('am');
        
        // Font family updated
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-amharic), var(--font-sans)');
        
        // localStorage updated
        expect(localStorage.getItem('language')).toBe('am');
      });
    });
  });

  describe('Complete Language Switch - English to Arabic', () => {
    test('should switch all aspects from English to Arabic including RTL', async () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Initial state - English (LTR)
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
      expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');

      // Switch to Arabic
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        // Language state updated
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
        expect(screen.getByTestId('is-english')).toHaveTextContent('false');
        
        // Translations updated to Arabic
        expect(screen.getByTestId('translation-save')).toHaveTextContent('حفظ');
        expect(screen.getByTestId('translation-login')).toHaveTextContent('تسجيل الدخول');
        expect(screen.getByTestId('translation-dashboard')).toHaveTextContent('لوحة التحكم');
        
        // RTL layout applied
        expect(screen.getByTestId('document-dir')).toHaveTextContent('rtl');
        expect(screen.getByTestId('document-lang')).toHaveTextContent('ar');
        
        // Font family updated
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-sans)');
        
        // localStorage updated
        expect(localStorage.getItem('language')).toBe('ar');
      });
    });
  });

  describe('Complete Language Switch - Amharic to Arabic', () => {
    test('should switch from Amharic to Arabic with RTL change', async () => {
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Initial state - Amharic (LTR)
      expect(screen.getByTestId('current-language')).toHaveTextContent('am');
      expect(screen.getByTestId('is-amharic')).toHaveTextContent('true');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
      expect(screen.getByTestId('translation-save')).toHaveTextContent('አስቀምጥ');

      // Switch to Arabic
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        // Language state updated
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
        expect(screen.getByTestId('is-amharic')).toHaveTextContent('false');
        
        // Translations updated
        expect(screen.getByTestId('translation-save')).toHaveTextContent('حفظ');
        
        // RTL layout applied
        expect(screen.getByTestId('document-dir')).toHaveTextContent('rtl');
        expect(screen.getByTestId('document-lang')).toHaveTextContent('ar');
        
        // Font changed from Amharic to default
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-sans)');
      });
    });
  });

  describe('Complete Language Switch - Arabic to English', () => {
    test('should switch from Arabic to English with RTL to LTR change', async () => {
      localStorage.setItem('language', 'ar');
      i18n.changeLanguage('ar');

      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Initial state - Arabic (RTL)
      // Note: document.dir might not be set immediately on initial render
      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
      });
      
      expect(screen.getByTestId('translation-save')).toHaveTextContent('حفظ');

      // Switch to English
      act(() => {
        screen.getByTestId('btn-english').click();
      });

      await waitFor(() => {
        // Language state updated
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
        expect(screen.getByTestId('is-english')).toHaveTextContent('true');
        
        // Translations updated
        expect(screen.getByTestId('translation-save')).toHaveTextContent('Save');
        
        // LTR layout applied
        expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
        expect(screen.getByTestId('document-lang')).toHaveTextContent('en');
      });
    });
  });

  describe('Cycling Through All Languages', () => {
    test('should correctly cycle through all three languages', async () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Start with English
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      expect(screen.getByTestId('translation-save')).toHaveTextContent('Save');
      expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');

      // Switch to Amharic
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('am');
        expect(screen.getByTestId('translation-save')).toHaveTextContent('አስቀምጥ');
        expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-amharic), var(--font-sans)');
      });

      // Switch to Arabic
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
        expect(screen.getByTestId('translation-save')).toHaveTextContent('حفظ');
        expect(screen.getByTestId('document-dir')).toHaveTextContent('rtl');
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-sans)');
      });

      // Switch back to English
      act(() => {
        screen.getByTestId('btn-english').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
        expect(screen.getByTestId('translation-save')).toHaveTextContent('Save');
        expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
      });
    });
  });

  describe('Persistence Across Remounts', () => {
    test('should persist language selection across component remounts', async () => {
      const { unmount } = render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Switch to Arabic
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
      });

      // Unmount
      unmount();

      // Remount
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Should still be Arabic
      expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
      expect(screen.getByTestId('translation-save')).toHaveTextContent('حفظ');
      expect(screen.getByTestId('document-dir')).toHaveTextContent('rtl');
    });

    test('should persist Amharic font across remounts', async () => {
      const { unmount } = render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Switch to Amharic
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-amharic), var(--font-sans)');
      });

      // Unmount
      unmount();

      // Remount
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Font should still be Amharic
      expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-amharic), var(--font-sans)');
    });
  });

  describe('RTL Layout Switching', () => {
    test('should toggle RTL correctly when switching between Arabic and other languages', async () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // English (LTR)
      expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');

      // Switch to Arabic (RTL)
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('document-dir')).toHaveTextContent('rtl');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
      });

      // Switch to Amharic (LTR)
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
      });

      // Switch back to Arabic (RTL)
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('document-dir')).toHaveTextContent('rtl');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
      });

      // Switch to English (LTR)
      act(() => {
        screen.getByTestId('btn-english').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('document-dir')).toHaveTextContent('ltr');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
      });
    });
  });

  describe('Font Family Switching', () => {
    test('should switch fonts correctly for Amharic', async () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // English - default font (check text content, not DOM node)
      const bodyFont = screen.getByTestId('body-font').textContent;
      expect(bodyFont).not.toContain('--font-amharic');

      // Switch to Amharic - Amharic font
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-amharic), var(--font-sans)');
      });

      // Switch to Arabic - default font
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-sans)');
      });

      // Switch back to Amharic - Amharic font again
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('body-font')).toHaveTextContent('var(--font-amharic), var(--font-sans)');
      });
    });
  });

  describe('Translation Updates', () => {
    test('should update all translations when language changes', async () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // English translations
      expect(screen.getByTestId('translation-save')).toHaveTextContent('Save');
      expect(screen.getByTestId('translation-login')).toHaveTextContent('Login');
      expect(screen.getByTestId('translation-dashboard')).toHaveTextContent('Dashboard');

      // Switch to Amharic
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('translation-save')).toHaveTextContent('አስቀምጥ');
        expect(screen.getByTestId('translation-login')).toHaveTextContent('ግባ');
        expect(screen.getByTestId('translation-dashboard')).toHaveTextContent('ዳሽቦርድ');
      });

      // Switch to Arabic
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('translation-save')).toHaveTextContent('حفظ');
        expect(screen.getByTestId('translation-login')).toHaveTextContent('تسجيل الدخول');
        expect(screen.getByTestId('translation-dashboard')).toHaveTextContent('لوحة التحكم');
      });
    });
  });

  describe('LanguageSelector Integration', () => {
    test('should render LanguageSelector component', () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // LanguageSelector should be present
      const languageButton = screen.getByLabelText('Select language');
      expect(languageButton).toBeInTheDocument();
    });
  });

  describe('Synchronization', () => {
    test('should keep i18n and LanguageContext synchronized', async () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      // Both should start with English
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      expect(i18n.language).toBe('en');

      // Switch to Amharic
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('am');
        expect(i18n.language).toBe('am');
      });

      // Switch to Arabic
      act(() => {
        screen.getByTestId('btn-arabic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
        expect(i18n.language).toBe('ar');
      });
    });
  });

  describe('Performance', () => {
    test('should switch languages quickly', async () => {
      render(
        <LanguageProvider>
          <TestApp />
        </LanguageProvider>
      );

      const start = performance.now();
      
      act(() => {
        screen.getByTestId('btn-amharic').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('am');
      });

      const end = performance.now();
      const duration = end - start;

      // Language switch should be fast (< 500ms)
      expect(duration).toBeLessThan(500);
    });
  });
});
