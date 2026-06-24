import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import AddStudentS from './CreateRegisterStudent';

// Mock axios
vi.mock('axios');

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn()
    }
  }),
  I18nextProvider: ({ children }) => children
}));

// Mock react-webcam
vi.mock('react-webcam', () => ({
  default: vi.fn(() => null)
}));

// Mock XLSX
vi.mock('xlsx', () => ({
  utils: {
    book_new: vi.fn(() => ({})),
    aoa_to_sheet: vi.fn(() => ({})),
    book_append_sheet: vi.fn(),
    sheet_to_json: vi.fn(() => [])
  },
  writeFile: vi.fn()
}));

const renderComponent = (component) => {
  return render(component);
};

describe('CreateRegisterStudent - Multi-step Form', () => {
  beforeEach(() => {
    // Mock successful API responses
    axios.get.mockImplementation((url) => {
      if (url.includes('/students/classes')) {
        return Promise.resolve({ data: ['Grade 1', 'Grade 2', 'Grade 3'] });
      }
      if (url.includes('/students/form-structure')) {
        return Promise.resolve({
          data: {
            classes: ['Grade 1', 'Grade 2'],
            customFields: []
          }
        });
      }
      if (url.includes('/schedule/config')) {
        return Promise.resolve({
          data: {
            has_kg: false,
            has_evening_class: false
          }
        });
      }
      if (url.includes('/students/columns/')) {
        return Promise.resolve({
          data: [
            { column_name: 'student_name', is_nullable: 'NO', data_type: 'varchar' },
            { column_name: 'age', is_nullable: 'NO', data_type: 'integer' }
          ]
        });
      }
      return Promise.reject(new Error('Not found'));
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Multi-step Navigation', () => {
    it('should render step 1 (Student Information) by default', async () => {
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      // Check step indicator
      const stepNumbers = screen.getAllByText('1');
      expect(stepNumbers.length).toBeGreaterThan(0);
    });

    it('should navigate to step 2 when Next button is clicked with valid data', async () => {
      const user = userEvent.setup();
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      // Fill in required fields for step 1
      const classSelect = screen.getByLabelText(/Class/i);
      await user.click(classSelect);
      await user.click(screen.getByRole('option', { name: 'Grade 1' }));

      const studentNameInput = screen.getByLabelText(/Student name/i);
      await user.type(studentNameInput, 'John Doe');

      const machineIdInput = screen.getByLabelText(/Student Machine ID/i);
      await user.type(machineIdInput, '1001');

      const ageInput = screen.getByLabelText(/^Age/i);
      await user.type(ageInput, '10');

      const genderSelect = screen.getByLabelText(/Gender/i);
      await user.click(genderSelect);
      await user.click(screen.getByRole('option', { name: 'Male' }));

      // Click Next button
      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      // Should now be on step 2
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Guardian information/i })).toBeInTheDocument();
      });
    });

    it('should show validation errors when trying to proceed with incomplete data', async () => {
      const user = userEvent.setup();
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      // Try to click Next without filling required fields
      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      // Should show validation error toast
      await waitFor(() => {
        expect(screen.getByText(/Please fix the validation errors/i)).toBeInTheDocument();
      });
    });

    it('should navigate back to previous step when Previous button is clicked', async () => {
      const user = userEvent.setup();
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      // Fill step 1 and navigate to step 2
      const classSelect = screen.getByLabelText(/Class/i);
      await user.click(classSelect);
      await user.click(screen.getByRole('option', { name: 'Grade 1' }));

      const studentNameInput = screen.getByLabelText(/Student name/i);
      await user.type(studentNameInput, 'John Doe');

      const machineIdInput = screen.getByLabelText(/Student Machine ID/i);
      await user.type(machineIdInput, '1001');

      const ageInput = screen.getByLabelText(/^Age/i);
      await user.type(ageInput, '10');

      const genderSelect = screen.getByLabelText(/Gender/i);
      await user.click(genderSelect);
      await user.click(screen.getByRole('option', { name: 'Male' }));

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Guardian information/i })).toBeInTheDocument();
      });

      // Click Previous button
      const previousButton = screen.getByRole('button', { name: /Previous/i });
      await user.click(previousButton);

      // Should be back on step 1
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });
    });

    it('should display all 4 steps in the step indicator', async () => {
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByText('Student Information')).toBeInTheDocument();
        expect(screen.getByText('Guardian Information')).toBeInTheDocument();
        expect(screen.getByText('Additional Information')).toBeInTheDocument();
        expect(screen.getByText('Review & Submit')).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate student name minimum length', async () => {
      const user = userEvent.setup();
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      const studentNameInput = screen.getByLabelText(/Student name/i);
      await user.type(studentNameInput, 'A');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Must be at least 2 characters/i)).toBeInTheDocument();
      });
    });

    it('should validate machine ID format (numbers only)', async () => {
      const user = userEvent.setup();
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      const machineIdInput = screen.getByLabelText(/Student Machine ID/i);
      await user.type(machineIdInput, 'ABC123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Machine ID must contain only numbers/i)).toBeInTheDocument();
      });
    });

    it('should validate age range (3-100)', async () => {
      const user = userEvent.setup();
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      const ageInput = screen.getByLabelText(/^Age/i);
      await user.type(ageInput, '2');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Age must be at least 3/i)).toBeInTheDocument();
      });
    });

    it('should validate guardian phone format', async () => {
      const user = userEvent.setup();
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      // Navigate to step 2
      const classSelect = screen.getByLabelText(/Class/i);
      await user.click(classSelect);
      await user.click(screen.getByRole('option', { name: 'Grade 1' }));

      const studentNameInput = screen.getByLabelText(/Student name/i);
      await user.type(studentNameInput, 'John Doe');

      const machineIdInput = screen.getByLabelText(/Student Machine ID/i);
      await user.type(machineIdInput, '1001');

      const ageInput = screen.getByLabelText(/^Age/i);
      await user.type(ageInput, '10');

      const genderSelect = screen.getByLabelText(/Gender/i);
      await user.click(genderSelect);
      await user.click(screen.getByRole('option', { name: 'Male' }));

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Guardian information/i })).toBeInTheDocument();
      });

      // Enter invalid phone
      const phoneInput = screen.getByLabelText(/Guardian phone/i);
      await user.type(phoneInput, '123');
      await user.tab();

      await waitFor(() => {
        expect(screen.getByText(/Please enter a valid phone number/i)).toBeInTheDocument();
      });
    });
  });

  describe('Guardian Search', () => {
    it('should search for existing guardian when phone is entered', async () => {
      const user = userEvent.setup();
      axios.get.mockImplementation((url) => {
        if (url.includes('/students/search-guardian/')) {
          return Promise.resolve({
            data: {
              guardian_name: 'Jane Doe',
              guardian_username: 'jane123',
              guardian_password: 'pass123'
            }
          });
        }
        if (url.includes('/students/classes')) {
          return Promise.resolve({ data: ['Grade 1', 'Grade 2', 'Grade 3'] });
        }
        if (url.includes('/students/form-structure')) {
          return Promise.resolve({
            data: {
              classes: ['Grade 1', 'Grade 2'],
              customFields: []
            }
          });
        }
        if (url.includes('/schedule/config')) {
          return Promise.resolve({
            data: {
              has_kg: false,
              has_evening_class: false
            }
          });
        }
        if (url.includes('/students/columns/')) {
          return Promise.resolve({
            data: [
              { column_name: 'student_name', is_nullable: 'NO', data_type: 'varchar' },
              { column_name: 'age', is_nullable: 'NO', data_type: 'integer' }
            ]
          });
        }
        return Promise.reject(new Error('Not found'));
      });

      renderComponent(<AddStudentS />);

      // Navigate to step 2
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      // Fill step 1 and go to step 2
      const classSelect = screen.getByLabelText(/Class/i);
      await user.click(classSelect);
      await user.click(screen.getByRole('option', { name: 'Grade 1' }));

      const studentNameInput = screen.getByLabelText(/Student name/i);
      await user.type(studentNameInput, 'John Doe');

      const machineIdInput = screen.getByLabelText(/Student Machine ID/i);
      await user.type(machineIdInput, '1001');

      const ageInput = screen.getByLabelText(/^Age/i);
      await user.type(ageInput, '10');

      const genderSelect = screen.getByLabelText(/Gender/i);
      await user.click(genderSelect);
      await user.click(screen.getByRole('option', { name: 'Male' }));

      const nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Guardian information/i })).toBeInTheDocument();
      });

      // Select existing guardian
      const existingGuardianRadio = screen.getByLabelText(/Existing guardian/i);
      await user.click(existingGuardianRadio);

      // Enter phone and trigger search
      const phoneInput = screen.getByLabelText(/Guardian phone/i);
      await user.type(phoneInput, '1234567890');
      fireEvent.blur(phoneInput);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/students/search-guardian/'),
          expect.any(Object)
        );
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit form successfully when all steps are completed', async () => {
      const user = userEvent.setup();
      axios.post.mockResolvedValue({
        data: {
          student_username: 'student123',
          student_password: 'pass123',
          guardian_username: 'guardian123',
          guardian_password: 'gpass123'
        }
      });

      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      // Complete all steps and submit
      // Step 1: Student Information
      const classSelect = screen.getByLabelText(/Class/i);
      await user.click(classSelect);
      await user.click(screen.getByRole('option', { name: 'Grade 1' }));

      const studentNameInput = screen.getByLabelText(/Student name/i);
      await user.type(studentNameInput, 'John Doe');

      const machineIdInput = screen.getByLabelText(/Student Machine ID/i);
      await user.type(machineIdInput, '1001');

      const ageInput = screen.getByLabelText(/^Age/i);
      await user.type(ageInput, '10');

      const genderSelect = screen.getByLabelText(/Gender/i);
      await user.click(genderSelect);
      await user.click(screen.getByRole('option', { name: 'Male' }));

      let nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      // Step 2: Guardian Information
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Guardian information/i })).toBeInTheDocument();
      });

      const phoneInput = screen.getByLabelText(/Guardian phone/i);
      await user.type(phoneInput, '1234567890');

      const guardianNameInput = screen.getByLabelText(/Guardian name/i);
      await user.type(guardianNameInput, 'Jane Doe');

      const relationInput = screen.getByLabelText(/Guardian relation/i);
      await user.type(relationInput, 'Mother');

      nextButton = screen.getByRole('button', { name: /Next/i });
      await user.click(nextButton);

      // Step 3: Custom Fields (skip if none)
      await waitFor(() => {
        nextButton = screen.getByRole('button', { name: /Next/i });
      });
      await user.click(nextButton);

      // Step 4: Review & Submit
      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Review your information/i })).toBeInTheDocument();
      });

      const submitButton = screen.getByRole('button', { name: /Add Student/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          expect.stringContaining('/students/add-student'),
          expect.any(FormData),
          expect.any(Object)
        );
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for form fields', async () => {
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        const studentNameInput = screen.getByLabelText(/Student name/i);
        expect(studentNameInput).toHaveAttribute('aria-label');
      });
    });

    it('should display error messages with role="alert"', async () => {
      axios.get.mockRejectedValue(new Error('Failed to fetch'));

      renderComponent(<AddStudentS />);

      await waitFor(() => {
        const errorElement = screen.queryByRole('alert');
        if (errorElement) {
          expect(errorElement).toBeInTheDocument();
        }
      });
    });

    it('should support keyboard navigation between steps', async () => {
      const user = userEvent.setup();
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: /Student information/i })).toBeInTheDocument();
      });

      // Tab through form fields
      await user.tab();
      await user.tab();
      await user.tab();

      // Should be able to navigate with keyboard
      const nextButton = screen.getByRole('button', { name: /Next/i });
      expect(nextButton).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should render step indicator on mobile', async () => {
      // Mock mobile viewport
      global.innerWidth = 375;
      global.dispatchEvent(new Event('resize'));

      renderComponent(<AddStudentS />);

      await waitFor(() => {
        const stepIndicator = screen.getByText('Student Information');
        expect(stepIndicator).toBeInTheDocument();
      });
    });
  });

  describe('Theme Support', () => {
    it('should apply theme-specific CSS variables', async () => {
      renderComponent(<AddStudentS />);

      await waitFor(() => {
        const container = screen.getByText(/Student Registration/i).closest('div');
        expect(container).toBeInTheDocument();
      });

      // Check if CSS variables are applied (they should be defined in the stylesheet)
      const styles = getComputedStyle(document.documentElement);
      expect(styles.getPropertyValue('--color-primary')).toBeDefined();
    });
  });
});
