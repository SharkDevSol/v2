/**
 * LanguageContext Tests
 * 
 * Tests for language switching functionality between English, Amharic, and Arabic.
 * Verifies LanguageContext and LanguageProvider work correctly.
 * Tests language persistence in localStorage.
 * Tests RTL support for Arabic.
 * Tests i18n integration.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { renderHook, act } from '@testing-library/react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import i18n from '../i18n/config';

// Mock component to test language context
const TestComponent = () => {
  const { language, changeLanguage, isRTL, isAmharic, isEnglish } = useLanguage();
  
  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="is-rtl">{isRTL ? 'true' : 'false'}</div>
      <div data-testid="is-amharic">{isAmharic ? 'true' : 'false'}</div>
      <div data-testid="is-english">{isEnglish ? 'true' : 'false'}</div>
      <button onClick={() => changeLanguage('en')} data-testid="set-english-button">
        Set English
      </button>
      <button onClick={() => changeLanguage('am')} data-testid="set-amharic-button">
        Set Amharic
      </button>
      <button onClick={() => changeLanguage('ar')} data-testid="set-arabic-button">
        Set Arabic
      </button>
    </div>
  );
};

describe('LanguageContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
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

  describe('Initialization', () => {
    test('should default to English when no localStorage', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      expect(screen.getByTestId('is-english')).toHaveTextContent('true');
      expect(screen.getByTestId('is-amharic')).toHaveTextContent('false');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
    });

    test('should use localStorage language if available', () => {
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('am');
      expect(screen.getByTestId('is-amharic')).toHaveTextContent('true');
      expect(screen.getByTestId('is-english')).toHaveTextContent('false');
    });

    test('should initialize with Arabic from localStorage', () => {
      localStorage.setItem('language', 'ar');
      i18n.changeLanguage('ar');

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
    });
  });

  describe('Language Switching', () => {
    test('should switch from English to Amharic', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');

      // Switch to Amharic
      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('am');
        expect(screen.getByTestId('is-amharic')).toHaveTextContent('true');
        expect(screen.getByTestId('is-english')).toHaveTextContent('false');
      });
    });

    test('should switch from English to Arabic', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('en');

      // Switch to Arabic
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
      });
    });

    test('should switch from Amharic to Arabic', async () => {
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(screen.getByTestId('current-language')).toHaveTextContent('am');

      // Switch to Arabic
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
        expect(screen.getByTestId('is-amharic')).toHaveTextContent('false');
      });
    });

    test('should switch between all three languages', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Start with English
      expect(screen.getByTestId('current-language')).toHaveTextContent('en');

      // Switch to Amharic
      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('am');
      });

      // Switch to Arabic
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      });

      // Switch back to English
      act(() => {
        screen.getByTestId('set-english-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('en');
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    test('should save language to localStorage when changed', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Initially localStorage might be null or 'en' depending on i18n initialization
      // The important part is that it gets saved when changed

      // Switch to Amharic
      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('am');
      });
    });

    test('should persist language across component remounts', async () => {
      const { unmount } = render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Switch to Arabic
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
      });

      // Unmount component
      unmount();

      // Remount component
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Should still be Arabic
      expect(screen.getByTestId('current-language')).toHaveTextContent('ar');
    });

    test('should update localStorage for all language changes', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Switch to Amharic
      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('am');
      });

      // Switch to Arabic
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('ar');
      });

      // Switch to English
      act(() => {
        screen.getByTestId('set-english-button').click();
      });

      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('en');
      });
    });
  });

  describe('RTL Support', () => {
    test('should set document direction to LTR for English', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(document.documentElement.dir).toBe('ltr');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
    });

    test('should set document direction to LTR for Amharic', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('false');
      });
    });

    test('should set document direction to RTL for Arabic', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
      });
    });

    test('should toggle RTL when switching between Arabic and other languages', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Switch to Arabic (RTL)
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });

      // Switch to English (LTR)
      act(() => {
        screen.getByTestId('set-english-button').click();
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
      });

      // Switch back to Arabic (RTL)
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });
    });

    test('should initialize with RTL when Arabic is in localStorage', () => {
      localStorage.setItem('language', 'ar');
      i18n.changeLanguage('ar');

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(document.documentElement.dir).toBe('rtl');
      expect(screen.getByTestId('is-rtl')).toHaveTextContent('true');
    });
  });

  describe('Document Language Attribute', () => {
    test('should set document lang attribute to English', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(document.documentElement.lang).toBe('en');
    });

    test('should update document lang attribute when language changes', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Switch to Amharic
      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('am');
      });

      // Switch to Arabic
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('ar');
      });
    });
  });

  describe('Font Family for Amharic', () => {
    test('should use default font for English', () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Font family might be empty initially or set to default
      // The important part is that it's not the Amharic font
      expect(document.body.style.fontFamily).not.toContain('--font-amharic');
    });

    test('should use Amharic font when Amharic is selected', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(document.body.style.fontFamily).toBe('var(--font-amharic), var(--font-sans)');
      });
    });

    test('should revert to default font when switching from Amharic', async () => {
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(document.body.style.fontFamily).toBe('var(--font-amharic), var(--font-sans)');

      // Switch to English
      act(() => {
        screen.getByTestId('set-english-button').click();
      });

      await waitFor(() => {
        expect(document.body.style.fontFamily).toBe('var(--font-sans)');
      });
    });

    test('should use default font for Arabic', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(document.body.style.fontFamily).toBe('var(--font-sans)');
      });
    });
  });

  describe('i18n Integration', () => {
    test('should update i18n language when changeLanguage is called', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      expect(i18n.language).toBe('en');

      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(i18n.language).toBe('am');
      });
    });

    test('should synchronize with i18n for all languages', async () => {
      render(
        <LanguageProvider>
          <TestComponent />
        </LanguageProvider>
      );

      // Switch to Amharic
      act(() => {
        screen.getByTestId('set-amharic-button').click();
      });

      await waitFor(() => {
        expect(i18n.language).toBe('am');
      });

      // Switch to Arabic
      act(() => {
        screen.getByTestId('set-arabic-button').click();
      });

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
      });

      // Switch to English
      act(() => {
        screen.getByTestId('set-english-button').click();
      });

      await waitFor(() => {
        expect(i18n.language).toBe('en');
      });
    });
  });

  describe('Hook Error Handling', () => {
    test('should throw error when useLanguage is used outside LanguageProvider', () => {
      // Suppress console.error for this test
      const originalError = console.error;
      console.error = vi.fn();

      expect(() => {
        renderHook(() => useLanguage());
      }).toThrow('useLanguage must be used within LanguageProvider');

      console.error = originalError;
    });
  });

  describe('Context Value', () => {
    test('should provide correct context values for English', () => {
      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe('en');
      expect(result.current.isEnglish).toBe(true);
      expect(result.current.isAmharic).toBe(false);
      expect(result.current.isRTL).toBe(false);
      expect(typeof result.current.changeLanguage).toBe('function');
    });

    test('should provide correct context values for Amharic', async () => {
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe('am');
      expect(result.current.isAmharic).toBe(true);
      expect(result.current.isEnglish).toBe(false);
      expect(result.current.isRTL).toBe(false);
      expect(typeof result.current.changeLanguage).toBe('function');
    });

    test('should provide correct context values for Arabic', () => {
      localStorage.setItem('language', 'ar');
      i18n.changeLanguage('ar');

      const { result } = renderHook(() => useLanguage(), {
        wrapper: LanguageProvider,
      });

      expect(result.current.language).toBe('ar');
      expect(result.current.isRTL).toBe(true);
      expect(result.current.isEnglish).toBe(false);
      expect(result.current.isAmharic).toBe(false);
      expect(typeof result.current.changeLanguage).toBe('function');
    });
  });

  describe('Multiple Components', () => {
    test('should share language state across multiple components', async () => {
      const Component1 = () => {
        const { language } = useLanguage();
        return <div data-testid="component1-language">{language}</div>;
      };

      const Component2 = () => {
        const { language, changeLanguage } = useLanguage();
        return (
          <div>
            <div data-testid="component2-language">{language}</div>
            <button onClick={() => changeLanguage('am')} data-testid="component2-change">
              Change to Amharic
            </button>
          </div>
        );
      };

      render(
        <LanguageProvider>
          <Component1 />
          <Component2 />
        </LanguageProvider>
      );

      // Both components should show English initially
      expect(screen.getByTestId('component1-language')).toHaveTextContent('en');
      expect(screen.getByTestId('component2-language')).toHaveTextContent('en');

      // Change language from component2
      act(() => {
        screen.getByTestId('component2-change').click();
      });

      // Both components should update to Amharic
      await waitFor(() => {
        expect(screen.getByTestId('component1-language')).toHaveTextContent('am');
        expect(screen.getByTestId('component2-language')).toHaveTextContent('am');
      });
    });
  });
});
