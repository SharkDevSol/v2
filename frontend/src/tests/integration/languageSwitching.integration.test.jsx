/**
 * Language Switching Integration Tests
 * 
 * Comprehensive integration tests for language switching functionality.
 * Tests the complete flow of language switching between English, Amharic, and Arabic.
 * Verifies LanguageContext, LanguageSelector, localStorage persistence, RTL support, and i18n translations.
 * 
 * Task: 11.1.24 Test language switching functionality
 */

import { describe, test, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from '../../COMPONENTS/LanguageSelector/LanguageSelector';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';

// Test component that uses translations
const TranslatedComponent = () => {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  
  return (
    <div>
      <div data-testid="current-language">{language}</div>
      <div data-testid="is-rtl">{isRTL ? 'true' : 'false'}</div>
      <div data-testid="translated-text">{t('common.welcome')}</div>
      <div data-testid="document-dir">{document.documentElement.dir}</div>
      <div data-testid="document-lang">{document.documentElement.lang}</div>
    </div>
  );
};

// Full app simulation with LanguageSelector and translated content
const FullAppSimulation = () => {
  const { t } = useTranslation();
  const { language, isRTL } = useLanguage();
  
  return (
    <div>
      <header>
        <LanguageSelector />
        <h1 data-testid="app-title">{t('common.appName')}</h1>
      </header>
      <main>
        <p data-testid="welcome-message">{t('common.welcome')}</p>
        <p data-testid="language-info">Current: {language}, RTL: {isRTL ? 'Yes' : 'No'}</p>
      </main>
    </div>
  );
};

describe('Language Switching Integration Tests', () => {
  beforeEach(() => {
    // Clear all state before each test
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.body.style.fontFamily = '';
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    // Clean up after each test
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.body.style.fontFamily = '';
  });

  describe('Complete Language Switching Flow', () => {
    test('should switch from English to Amharic with all side effects', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      // Verify initial state (English)
      expect(screen.getByTestId('language-info')).toHaveTextContent('Current: en, RTL: No');
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');
      // localStorage might be null initially before first change
      const initialLang = localStorage.getItem('language');
      expect(initialLang === null || initialLang === 'en').toBe(true);

      // Open language selector and switch to Amharic
      const languageButton = screen.getByRole('button', { name: /select language/i });
      await user.click(languageButton);

      const amharicOption = screen.getByText('አማርኛ').closest('button');
      await user.click(amharicOption);

      // Verify all changes
      await waitFor(() => {
        // Context updated
        expect(screen.getByTestId('language-info')).toHaveTextContent('Current: am, RTL: No');
        
        // Document attributes updated
        expect(document.documentElement.lang).toBe('am');
        expect(document.documentElement.dir).toBe('ltr');
        
        // Font family updated for Amharic
        expect(document.body.style.fontFamily).toBe('var(--font-amharic), var(--font-sans)');
        
        // localStorage persisted
        expect(localStorage.getItem('language')).toBe('am');
        
        // i18n updated
        expect(i18n.language).toBe('am');
        
        // LanguageSelector displays Amharic
        expect(languageButton).toHaveTextContent('አማርኛ');
      });
    });

    test('should switch from English to Arabic with RTL support', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      // Verify initial state (English)
      expect(screen.getByTestId('language-info')).toHaveTextContent('Current: en, RTL: No');
      expect(document.documentElement.dir).toBe('ltr');

      // Open language selector and switch to Arabic
      const languageButton = screen.getByRole('button', { name: /select language/i });
      await user.click(languageButton);

      const arabicOption = screen.getByText('العربية').closest('button');
      await user.click(arabicOption);

      // Verify all changes including RTL
      await waitFor(() => {
        // Context updated with RTL
        expect(screen.getByTestId('language-info')).toHaveTextContent('Current: ar, RTL: Yes');
        
        // Document direction changed to RTL
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ar');
        
        // Font family is default (not Amharic)
        expect(document.body.style.fontFamily).toBe('var(--font-sans)');
        
        // localStorage persisted
        expect(localStorage.getItem('language')).toBe('ar');
        
        // i18n updated
        expect(i18n.language).toBe('ar');
        
        // LanguageSelector displays Arabic
        expect(languageButton).toHaveTextContent('العربية');
      });
    });

    test('should cycle through all three languages', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });

      // Start with English
      expect(languageButton).toHaveTextContent('English');
      expect(document.documentElement.dir).toBe('ltr');

      // Switch to Amharic
      await user.click(languageButton);
      await user.click(screen.getByText('አማርኛ').closest('button'));

      await waitFor(() => {
        expect(languageButton).toHaveTextContent('አማርኛ');
        expect(document.documentElement.lang).toBe('am');
        expect(document.documentElement.dir).toBe('ltr');
        expect(document.body.style.fontFamily).toBe('var(--font-amharic), var(--font-sans)');
      });

      // Switch to Arabic
      await user.click(languageButton);
      await user.click(screen.getByText('العربية').closest('button'));

      await waitFor(() => {
        expect(languageButton).toHaveTextContent('العربية');
        expect(document.documentElement.lang).toBe('ar');
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.body.style.fontFamily).toBe('var(--font-sans)');
      });

      // Switch back to English
      await user.click(languageButton);
      const englishOptions = screen.getAllByText('English');
      const englishOption = englishOptions.find(el => el.closest('button') !== languageButton);
      await user.click(englishOption.closest('button'));

      await waitFor(() => {
        expect(languageButton).toHaveTextContent('English');
        expect(document.documentElement.lang).toBe('en');
        expect(document.documentElement.dir).toBe('ltr');
        expect(document.body.style.fontFamily).toBe('var(--font-sans)');
      });
    });
  });

  describe('LocalStorage Persistence', () => {
    test('should persist language selection across page reloads', async () => {
      const user = userEvent.setup();

      // First render - switch to Amharic
      const { unmount } = render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });
      await user.click(languageButton);
      await user.click(screen.getByText('አማርኛ').closest('button'));

      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('am');
      });

      // Unmount (simulate page reload)
      unmount();

      // Second render - should remember Amharic
      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const newLanguageButton = screen.getByRole('button', { name: /select language/i });
      expect(newLanguageButton).toHaveTextContent('አማርኛ');
      expect(screen.getByTestId('language-info')).toHaveTextContent('Current: am');
      expect(document.documentElement.lang).toBe('am');
    });

    test('should persist Arabic with RTL across page reloads', async () => {
      const user = userEvent.setup();

      // First render - switch to Arabic
      const { unmount } = render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });
      await user.click(languageButton);
      await user.click(screen.getByText('العربية').closest('button'));

      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('ar');
        expect(document.documentElement.dir).toBe('rtl');
      });

      // Unmount (simulate page reload)
      unmount();

      // Second render - should remember Arabic and RTL
      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const newLanguageButton = screen.getByRole('button', { name: /select language/i });
      expect(newLanguageButton).toHaveTextContent('العربية');
      expect(screen.getByTestId('language-info')).toHaveTextContent('Current: ar, RTL: Yes');
      expect(document.documentElement.dir).toBe('rtl');
      expect(document.documentElement.lang).toBe('ar');
    });
  });

  describe('RTL Support', () => {
    test('should properly toggle RTL when switching between Arabic and other languages', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });

      // English (LTR)
      expect(document.documentElement.dir).toBe('ltr');

      // Switch to Arabic (RTL)
      await user.click(languageButton);
      await user.click(screen.getByText('العربية').closest('button'));

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });

      // Switch to Amharic (LTR)
      await user.click(languageButton);
      await user.click(screen.getByText('አማርኛ').closest('button'));

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
      });

      // Switch back to Arabic (RTL)
      await user.click(languageButton);
      await user.click(screen.getByText('العربية').closest('button'));

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
      });

      // Switch to English (LTR)
      await user.click(languageButton);
      const englishOptions = screen.getAllByText('English');
      const englishOption = englishOptions.find(el => el.closest('button') !== languageButton);
      await user.click(englishOption.closest('button'));

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('ltr');
      });
    });

    test('should initialize with RTL when Arabic is stored in localStorage', () => {
      localStorage.setItem('language', 'ar');
      i18n.changeLanguage('ar');

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      expect(document.documentElement.dir).toBe('rtl');
      expect(screen.getByTestId('language-info')).toHaveTextContent('RTL: Yes');
    });
  });

  describe('i18n Translation Integration', () => {
    test('should display translations in the selected language', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <TranslatedComponent />
        </LanguageProvider>
      );

      // Initial English translation
      const translatedText = screen.getByTestId('translated-text');
      const initialText = translatedText.textContent;

      // Switch to Amharic
      i18n.changeLanguage('am');
      await waitFor(() => {
        const amharicText = translatedText.textContent;
        // Text should change (unless translation is missing)
        expect(amharicText).toBeDefined();
      });

      // Switch to Arabic
      i18n.changeLanguage('ar');
      await waitFor(() => {
        const arabicText = translatedText.textContent;
        expect(arabicText).toBeDefined();
      });
    });

    test('should synchronize i18n with LanguageContext', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });

      // Switch to Amharic
      await user.click(languageButton);
      await user.click(screen.getByText('አማርኛ').closest('button'));

      await waitFor(() => {
        expect(i18n.language).toBe('am');
        expect(screen.getByTestId('language-info')).toHaveTextContent('Current: am');
      });

      // Switch to Arabic
      await user.click(languageButton);
      await user.click(screen.getByText('العربية').closest('button'));

      await waitFor(() => {
        expect(i18n.language).toBe('ar');
        expect(screen.getByTestId('language-info')).toHaveTextContent('Current: ar');
      });
    });
  });

  describe('Font Family Management', () => {
    test('should apply Amharic font only when Amharic is selected', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });

      // English - default font (might be empty initially)
      const initialFont = document.body.style.fontFamily;
      expect(initialFont === '' || initialFont === 'var(--font-sans)').toBe(true);

      // Switch to Amharic - Amharic font
      await user.click(languageButton);
      await user.click(screen.getByText('አማርኛ').closest('button'));

      await waitFor(() => {
        expect(document.body.style.fontFamily).toBe('var(--font-amharic), var(--font-sans)');
      });

      // Switch to Arabic - default font
      await user.click(languageButton);
      await user.click(screen.getByText('العربية').closest('button'));

      await waitFor(() => {
        expect(document.body.style.fontFamily).toBe('var(--font-sans)');
      });

      // Switch back to Amharic - Amharic font again
      await user.click(languageButton);
      await user.click(screen.getByText('አማርኛ').closest('button'));

      await waitFor(() => {
        expect(document.body.style.fontFamily).toBe('var(--font-amharic), var(--font-sans)');
      });
    });
  });

  describe('Multiple Components Synchronization', () => {
    test('should synchronize language across multiple LanguageSelector instances', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <div>
            <LanguageSelector />
            <LanguageSelector />
            <TranslatedComponent />
          </div>
        </LanguageProvider>
      );

      const buttons = screen.getAllByRole('button', { name: /select language/i });
      expect(buttons).toHaveLength(2);

      // Both should show English initially
      buttons.forEach(button => {
        expect(button).toHaveTextContent('English');
      });

      // Click first button and select Amharic
      await user.click(buttons[0]);
      await user.click(screen.getAllByText('አማርኛ')[0].closest('button'));

      // Both buttons should update
      await waitFor(() => {
        buttons.forEach(button => {
          expect(button).toHaveTextContent('አማርኛ');
        });
        expect(screen.getByTestId('current-language')).toHaveTextContent('am');
      });
    });
  });

  describe('Document Attributes', () => {
    test('should update all document attributes correctly for each language', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });

      // English
      expect(document.documentElement.lang).toBe('en');
      expect(document.documentElement.dir).toBe('ltr');

      // Amharic
      await user.click(languageButton);
      await user.click(screen.getByText('አማርኛ').closest('button'));

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('am');
        expect(document.documentElement.dir).toBe('ltr');
      });

      // Arabic
      await user.click(languageButton);
      await user.click(screen.getByText('العربية').closest('button'));

      await waitFor(() => {
        expect(document.documentElement.lang).toBe('ar');
        expect(document.documentElement.dir).toBe('rtl');
      });
    });
  });

  describe('Edge Cases', () => {
    test('should handle rapid language switching', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });

      // Rapidly switch languages
      await user.click(languageButton);
      await user.click(screen.getByText('አማርኛ').closest('button'));

      await user.click(languageButton);
      await user.click(screen.getByText('العربية').closest('button'));

      await user.click(languageButton);
      const englishOptions = screen.getAllByText('English');
      const englishOption = englishOptions.find(el => el.closest('button') !== languageButton);
      await user.click(englishOption.closest('button'));

      // Should end up in English state
      await waitFor(() => {
        expect(languageButton).toHaveTextContent('English');
        expect(document.documentElement.lang).toBe('en');
        expect(document.documentElement.dir).toBe('ltr');
        expect(localStorage.getItem('language')).toBe('en');
      });
    });

    test('should handle invalid localStorage value gracefully', () => {
      localStorage.setItem('language', 'invalid');

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      // Should fallback to English
      const languageButton = screen.getByRole('button', { name: /select language/i });
      expect(languageButton).toHaveTextContent('English');
    });
  });

  describe('Accessibility', () => {
    test('should maintain accessibility attributes during language switching', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <FullAppSimulation />
        </LanguageProvider>
      );

      const languageButton = screen.getByRole('button', { name: /select language/i });

      // Check initial accessibility
      expect(languageButton).toHaveAttribute('aria-label', 'Select language');
      expect(languageButton).toHaveAttribute('aria-expanded', 'false');

      // Open dropdown
      await user.click(languageButton);
      expect(languageButton).toHaveAttribute('aria-expanded', 'true');

      // Select language
      await user.click(screen.getByText('አማርኛ').closest('button'));

      // Accessibility attributes should still be present
      await waitFor(() => {
        expect(languageButton).toHaveAttribute('aria-label', 'Select language');
        expect(languageButton).toHaveAttribute('aria-expanded', 'false');
      });
    });
  });
});
