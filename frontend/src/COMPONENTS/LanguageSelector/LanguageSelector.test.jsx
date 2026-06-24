/**
 * LanguageSelector Component Tests
 * 
 * Tests for the LanguageSelector component with dropdown and button variants.
 * Verifies correct language display, variant functionality, flag display, and language switching.
 * Tests accessibility, keyboard navigation, and WCAG AA compliance.
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageProvider, useLanguage } from '../../contexts/LanguageContext';
import LanguageSelector from './LanguageSelector';
import i18n from '../../i18n/config';

describe('LanguageSelector Component', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.body.style.fontFamily = '';
    i18n.changeLanguage('en');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.dir = 'ltr';
    document.documentElement.lang = 'en';
    document.body.style.fontFamily = '';
  });

  describe('Rendering', () => {
    test('should render language selector button', () => {
      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toBeInTheDocument();
    });

    test('should display current language (English) by default', () => {
      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      expect(screen.getByText('English')).toBeInTheDocument();
    });

    test('should display Amharic when Amharic is selected', () => {
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      expect(screen.getByText('አማርኛ')).toBeInTheDocument();
    });

    test('should display Arabic when Arabic is selected', () => {
      localStorage.setItem('language', 'ar');
      i18n.changeLanguage('ar');

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      expect(screen.getByText('العربية')).toBeInTheDocument();
    });

    test('should display Globe icon', () => {
      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      // Check if the button contains an SVG (Globe icon from lucide-react)
      const svg = button.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });

    test('should not display dropdown initially', () => {
      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      // Dropdown options should not be visible initially
      expect(screen.queryByText('Amharic')).not.toBeInTheDocument();
      expect(screen.queryByText('Arabic')).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Interaction', () => {
    test('should open dropdown when button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // All language options should be visible (using getAllByText since text appears multiple times)
      expect(screen.getAllByText('English').length).toBeGreaterThan(1);
      expect(screen.getByText('Amharic')).toBeInTheDocument();
      expect(screen.getByText('Arabic')).toBeInTheDocument();
    });

    test('should close dropdown when button is clicked again', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });

      // Open dropdown
      await user.click(button);
      expect(screen.getByText('Amharic')).toBeInTheDocument();

      // Close dropdown
      await user.click(button);
      await waitFor(() => {
        expect(screen.queryByText('Amharic')).not.toBeInTheDocument();
      });
    });

    test('should close dropdown when clicking outside', async () => {
      const user = userEvent.setup();

      render(
        <div>
          <LanguageProvider>
            <LanguageSelector />
          </LanguageProvider>
          <div data-testid="outside">Outside element</div>
        </div>
      );

      const button = screen.getByRole('button', { name: /select language/i });

      // Open dropdown
      await user.click(button);
      expect(screen.getByText('Amharic')).toBeInTheDocument();

      // Click outside
      await user.click(screen.getByTestId('outside'));

      await waitFor(() => {
        expect(screen.queryByText('Amharic')).not.toBeInTheDocument();
      });
    });

    test('should display all three language options in dropdown', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Check for native names (using getAllByText since text appears multiple times)
      expect(screen.getAllByText('English').length).toBeGreaterThan(1);
      expect(screen.getAllByText('አማርኛ')).toHaveLength(1);
      expect(screen.getAllByText('العربية')).toHaveLength(1);

      // Check for English names
      expect(screen.getByText('Amharic')).toBeInTheDocument();
      expect(screen.getByText('Arabic')).toBeInTheDocument();
    });
  });

  describe('Language Switching', () => {
    test('should switch to Amharic when Amharic option is clicked', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Click Amharic option
      const amharicOption = screen.getByText('አማርኛ').closest('button');
      await user.click(amharicOption);

      await waitFor(() => {
        expect(screen.getByText('አማርኛ')).toBeInTheDocument();
        expect(localStorage.getItem('language')).toBe('am');
        expect(document.documentElement.lang).toBe('am');
      });
    });

    test('should switch to Arabic when Arabic option is clicked', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Click Arabic option
      const arabicOption = screen.getByText('العربية').closest('button');
      await user.click(arabicOption);

      await waitFor(() => {
        expect(screen.getByText('العربية')).toBeInTheDocument();
        expect(localStorage.getItem('language')).toBe('ar');
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ar');
      });
    });

    test('should switch back to English from Amharic', async () => {
      const user = userEvent.setup();
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Click English option
      const englishOptions = screen.getAllByText('English');
      const englishOption = englishOptions.find(el => el.closest('button') !== button);
      await user.click(englishOption.closest('button'));

      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(localStorage.getItem('language')).toBe('en');
        expect(document.documentElement.lang).toBe('en');
      });
    });

    test('should close dropdown after selecting a language', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Click Amharic option
      const amharicOption = screen.getByText('አማርኛ').closest('button');
      await user.click(amharicOption);

      // Dropdown should close
      await waitFor(() => {
        // Only the button text should remain, not the dropdown options
        const amharicTexts = screen.queryAllByText('አማርኛ');
        expect(amharicTexts).toHaveLength(1); // Only in button, not in dropdown
      });
    });

    test('should switch between all three languages', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });

      // Switch to Amharic
      await user.click(button);
      const amharicOption = screen.getByText('አማርኛ').closest('button');
      await user.click(amharicOption);

      await waitFor(() => {
        expect(screen.getByText('አማርኛ')).toBeInTheDocument();
      });

      // Switch to Arabic
      await user.click(button);
      const arabicOption = screen.getByText('العربية').closest('button');
      await user.click(arabicOption);

      await waitFor(() => {
        expect(screen.getByText('العربية')).toBeInTheDocument();
        expect(document.documentElement.dir).toBe('rtl');
      });

      // Switch back to English
      await user.click(button);
      const englishOptions = screen.getAllByText('English');
      const englishOption = englishOptions.find(el => el.closest('button') !== button);
      await user.click(englishOption.closest('button'));

      await waitFor(() => {
        expect(screen.getByText('English')).toBeInTheDocument();
        expect(document.documentElement.dir).toBe('ltr');
      });
    });
  });

  describe('Active Language Indicator', () => {
    test('should show check icon for current language (English)', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Find the English option button
      const englishOptions = screen.getAllByText('English');
      const englishOptionButton = englishOptions.find(el => 
        el.closest('button') && el.closest('button') !== button
      ).closest('button');

      // Check if it has the active class or check icon
      const checkIcon = englishOptionButton.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    test('should show check icon for current language (Amharic)', async () => {
      const user = userEvent.setup();
      localStorage.setItem('language', 'am');
      i18n.changeLanguage('am');

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Find the Amharic option button (use getAllByText since it appears in button and dropdown)
      const amharicTexts = screen.getAllByText('አማርኛ');
      const amharicOptionButton = amharicTexts.find(el => 
        el.closest('button') && el.closest('button') !== button
      ).closest('button');

      // Check if it has the check icon
      const checkIcon = amharicOptionButton.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    test('should move check icon when language changes', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });

      // Open dropdown - English should have check
      await user.click(button);
      const englishOptions = screen.getAllByText('English');
      const englishOptionButton = englishOptions.find(el => 
        el.closest('button') && el.closest('button') !== button
      ).closest('button');
      expect(englishOptionButton.querySelector('svg')).toBeInTheDocument();

      // Switch to Amharic
      const amharicOption = screen.getByText('አማርኛ').closest('button');
      await user.click(amharicOption);

      // Open dropdown again - Amharic should now have check
      await user.click(button);
      const amharicTexts = screen.getAllByText('አማርኛ');
      const amharicOptionButton = amharicTexts.find(el => 
        el.closest('button') && el.closest('button') !== button
      ).closest('button');
      expect(amharicOptionButton.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    test('should have proper aria-label', () => {
      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toHaveAttribute('aria-label', 'Select language');
    });

    test('should have aria-expanded attribute', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });

      // Initially closed
      expect(button).toHaveAttribute('aria-expanded', 'false');

      // Open dropdown
      await user.click(button);
      expect(button).toHaveAttribute('aria-expanded', 'true');

      // Close dropdown
      await user.click(button);
      await waitFor(() => {
        expect(button).toHaveAttribute('aria-expanded', 'false');
      });
    });

    test('should be keyboard accessible', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      // Tab to focus the button
      await user.tab();
      const button = screen.getByRole('button', { name: /select language/i });
      expect(button).toHaveFocus();

      // Press Enter to open dropdown
      await user.keyboard('{Enter}');
      expect(screen.getByText('Amharic')).toBeInTheDocument();
    });

    test('should be focusable', () => {
      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      button.focus();
      expect(button).toHaveFocus();
    });

    test('should allow keyboard navigation through options', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      // Tab to button and open dropdown
      await user.tab();
      await user.keyboard('{Enter}');

      // Tab through options
      await user.tab();
      const firstOption = document.activeElement;
      expect(firstOption).toBeInTheDocument();

      // Press Enter to select
      await user.keyboard('{Enter}');

      // Dropdown should close
      await waitFor(() => {
        expect(screen.queryByText('Amharic')).not.toBeInTheDocument();
      });
    });
  });

  describe('Multiple LanguageSelector Instances', () => {
    test('should synchronize multiple selector instances', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <div>
            <LanguageSelector />
            <LanguageSelector />
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
      const amharicOption = screen.getAllByText('አማርኛ')[0].closest('button');
      await user.click(amharicOption);

      // Both buttons should update to Amharic
      await waitFor(() => {
        buttons.forEach(button => {
          expect(button).toHaveTextContent('አማርኛ');
        });
      });
    });
  });

  describe('Integration with LanguageContext', () => {
    test('should reflect language changes from context', async () => {
      const user = userEvent.setup();

      // Component that can change language externally
      const TestWrapper = () => {
        const { changeLanguage } = useLanguage();
        return (
          <div>
            <LanguageSelector />
            <button onClick={() => changeLanguage('am')} data-testid="external-amharic">
              Set Amharic
            </button>
            <button onClick={() => changeLanguage('ar')} data-testid="external-arabic">
              Set Arabic
            </button>
          </div>
        );
      };

      render(
        <LanguageProvider>
          <TestWrapper />
        </LanguageProvider>
      );

      const selectorButton = screen.getByRole('button', { name: /select language/i });

      // Initially English
      expect(selectorButton).toHaveTextContent('English');

      // Change to Amharic externally
      await user.click(screen.getByTestId('external-amharic'));
      await waitFor(() => {
        expect(selectorButton).toHaveTextContent('አማርኛ');
      });

      // Change to Arabic externally
      await user.click(screen.getByTestId('external-arabic'));
      await waitFor(() => {
        expect(selectorButton).toHaveTextContent('العربية');
      });
    });

    test('should update document attributes when language is selected', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });

      // Switch to Arabic
      await user.click(button);
      const arabicOption = screen.getByText('العربية').closest('button');
      await user.click(arabicOption);

      await waitFor(() => {
        expect(document.documentElement.dir).toBe('rtl');
        expect(document.documentElement.lang).toBe('ar');
        expect(localStorage.getItem('language')).toBe('ar');
      });
    });

    test('should update font family when Amharic is selected', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });

      // Switch to Amharic
      await user.click(button);
      const amharicOption = screen.getByText('አማርኛ').closest('button');
      await user.click(amharicOption);

      await waitFor(() => {
        expect(document.body.style.fontFamily).toBe('var(--font-amharic), var(--font-sans)');
      });
    });
  });

  describe('CSS Classes', () => {
    test('should apply languageSelector CSS class to container', () => {
      const { container } = render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const selector = container.querySelector('[class*="languageSelector"]');
      expect(selector).toBeInTheDocument();
    });

    test('should apply active class to current language option', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      await user.click(button);

      // Find the English option button
      const englishOptions = screen.getAllByText('English');
      const englishOptionButton = englishOptions.find(el => 
        el.closest('button') && el.closest('button') !== button
      ).closest('button');

      // Should have active class
      expect(englishOptionButton.className).toContain('active');
    });
  });

  describe('Button Group Variant', () => {
    test('should render button group variant when variant="buttons"', () => {
      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" />
        </LanguageProvider>
      );

      // Should have three buttons for each language
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);

      // Check for language names
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('አማርኛ')).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();
    });

    test('should switch language when clicking button in button group', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" />
        </LanguageProvider>
      );

      // Click Amharic button
      const amharicButton = screen.getByText('አማርኛ').closest('button');
      await user.click(amharicButton);

      await waitFor(() => {
        expect(localStorage.getItem('language')).toBe('am');
        expect(document.documentElement.lang).toBe('am');
      });
    });

    test('should show active state on current language button', () => {
      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" />
        </LanguageProvider>
      );

      // English button should have active class
      const englishButton = screen.getByText('English').closest('button');
      expect(englishButton.className).toContain('active');
    });

    test('should show check icon on active button', () => {
      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" />
        </LanguageProvider>
      );

      // English button should have check icon
      const englishButton = screen.getByText('English').closest('button');
      const checkIcon = englishButton.querySelector('svg');
      expect(checkIcon).toBeInTheDocument();
    });

    test('should update active state when language changes', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" />
        </LanguageProvider>
      );

      // Initially English is active
      const englishButton = screen.getByText('English').closest('button');
      expect(englishButton.className).toContain('active');

      // Click Arabic button
      const arabicButton = screen.getByText('العربية').closest('button');
      await user.click(arabicButton);

      await waitFor(() => {
        // Arabic should now be active
        expect(arabicButton.className).toContain('active');
        // English should not be active
        expect(englishButton.className).not.toContain('active');
      });
    });

    test('should have proper aria attributes for button group', () => {
      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" />
        </LanguageProvider>
      );

      const buttons = screen.getAllByRole('button');
      
      // Each button should have aria-label
      buttons.forEach(button => {
        expect(button).toHaveAttribute('aria-label');
      });

      // Active button should have aria-pressed="true"
      const englishButton = screen.getByText('English').closest('button');
      expect(englishButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Flag Icons', () => {
    test('should display flag icons when showFlags=true in dropdown variant', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector showFlags={true} />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      
      // Button should contain flag emoji
      expect(button.textContent).toMatch(/🇬🇧|🇪🇹|🇸🇦/);

      // Open dropdown
      await user.click(button);

      // Dropdown options should contain flags
      const dropdown = screen.getByRole('menu');
      expect(dropdown.textContent).toMatch(/🇬🇧/);
      expect(dropdown.textContent).toMatch(/🇪🇹/);
      expect(dropdown.textContent).toMatch(/🇸🇦/);
    });

    test('should not display flag icons when showFlags=false in dropdown variant', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector showFlags={false} />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });
      
      // Button should not contain flag emoji (only Globe icon and text)
      expect(button.textContent).not.toMatch(/🇬🇧|🇪🇹|🇸🇦/);

      // Open dropdown
      await user.click(button);

      // Dropdown options should not contain flags
      const dropdown = screen.getByRole('menu');
      const flagPattern = /🇬🇧|🇪🇹|🇸🇦/;
      expect(dropdown.textContent).not.toMatch(flagPattern);
    });

    test('should display flag icons when showFlags=true in button group variant', () => {
      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" showFlags={true} />
        </LanguageProvider>
      );

      // All buttons should contain flag emojis
      const buttons = screen.getAllByRole('button');
      const allButtonsText = buttons.map(b => b.textContent).join('');
      
      expect(allButtonsText).toMatch(/🇬🇧/);
      expect(allButtonsText).toMatch(/🇪🇹/);
      expect(allButtonsText).toMatch(/🇸🇦/);
    });

    test('should not display flag icons when showFlags=false in button group variant', () => {
      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" showFlags={false} />
        </LanguageProvider>
      );

      // Buttons should not contain flag emojis
      const buttons = screen.getAllByRole('button');
      const allButtonsText = buttons.map(b => b.textContent).join('');
      
      expect(allButtonsText).not.toMatch(/🇬🇧|🇪🇹|🇸🇦/);
    });
  });

  describe('Custom className', () => {
    test('should apply custom className to container', () => {
      const { container } = render(
        <LanguageProvider>
          <LanguageSelector className="custom-class" />
        </LanguageProvider>
      );

      const selector = container.querySelector('.custom-class');
      expect(selector).toBeInTheDocument();
    });

    test('should apply custom className to button group variant', () => {
      const { container } = render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" className="custom-button-group" />
        </LanguageProvider>
      );

      const selector = container.querySelector('.custom-button-group');
      expect(selector).toBeInTheDocument();
    });
  });

  describe('Keyboard Navigation - Escape Key', () => {
    test('should close dropdown when Escape key is pressed', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector />
        </LanguageProvider>
      );

      const button = screen.getByRole('button', { name: /select language/i });

      // Open dropdown
      await user.click(button);
      expect(screen.getByText('Amharic')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      await waitFor(() => {
        expect(screen.queryByText('Amharic')).not.toBeInTheDocument();
      });
    });

    test('should not close dropdown on Escape in button group variant', async () => {
      const user = userEvent.setup();

      render(
        <LanguageProvider>
          <LanguageSelector variant="buttons" />
        </LanguageProvider>
      );

      // Button group doesn't have dropdown, so all languages are always visible
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('አማርኛ')).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();

      // Press Escape
      await user.keyboard('{Escape}');

      // All languages should still be visible
      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('አማርኛ')).toBeInTheDocument();
      expect(screen.getByText('العربية')).toBeInTheDocument();
    });
  });
});
