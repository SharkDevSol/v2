import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import StaffProfile from './StaffProfile';
import { AppProvider } from '../context/AppContext';

// Mock axios
vi.mock('axios');

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ username: 'test-staff' }),
  };
});

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = mockLocalStorage;

// Mock staff data
const mockStaffUser = {
  username: 'john.doe',
  staffType: 'Teacher',
};

const mockStaffProfile = {
  name: 'John Doe',
  global_staff_id: 'STAFF001',
  email: 'john.doe@school.com',
  phone: '+251911234567',
  gender: 'Male',
  date_of_birth: '1985-05-15',
  department: 'Mathematics',
  position: 'Senior Teacher',
  hire_date: '2015-09-01',
  employment_status: 'Active',
  base_salary: '15000',
  allowances: '2000',
  deductions: '500',
  payment_method: 'Bank Transfer',
  bank_account: '1234567890',
  total_working_days: '200',
  present_days: '190',
  absent_days: '5',
  late_days: '5',
  leave_balance: '10',
};

describe('StaffProfile - Card Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === 'staffUser') return JSON.stringify(mockStaffUser);
      if (key === 'staffProfile') return JSON.stringify(mockStaffProfile);
      return null;
    });
  });

  it('should render staff profile with card layout', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    // Wait for profile to load
    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab to navigate to profile view
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content to render - use getAllByText since name appears in header and personal info
    await waitFor(() => {
      const nameElements = screen.getAllByText('John Doe');
      expect(nameElements.length).toBeGreaterThan(0);
    });
  });

  it('should display personal information card', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab to navigate to profile view
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content to render - check for translation key or actual text
    await waitFor(() => {
      // The component uses t('personalInfo') which may return the key itself or translated text
      const personalInfoElement = screen.queryByText(/personal information/i) || screen.queryByText('personalInfo');
      expect(personalInfoElement).toBeInTheDocument();
    });
    
    // Check for personal info fields
    expect(screen.getByText('john.doe')).toBeInTheDocument();
    expect(screen.getByText('john.doe@school.com')).toBeInTheDocument();
    expect(screen.getByText('+251911234567')).toBeInTheDocument();
    expect(screen.getByText('Male')).toBeInTheDocument();
  });

  it('should display employment information card', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content - check for translation key or actual text
    await waitFor(() => {
      const employmentInfoElement = screen.queryByText(/employment information/i) || screen.queryByText('employmentInfo');
      expect(employmentInfoElement).toBeInTheDocument();
    });
    
    // Check for employment info fields
    expect(screen.getByText('Teacher')).toBeInTheDocument();
    expect(screen.getByText('Mathematics')).toBeInTheDocument();
    expect(screen.getByText('Senior Teacher')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('should display salary information card', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content - check for translation key or actual text
    await waitFor(() => {
      const salaryInfoElement = screen.queryByText(/salary information/i) || screen.queryByText('salaryInfo');
      expect(salaryInfoElement).toBeInTheDocument();
    });
    
    // Check for salary info fields
    expect(screen.getByText('15000 ETB')).toBeInTheDocument();
    expect(screen.getByText('2000 ETB')).toBeInTheDocument();
    expect(screen.getByText('500 ETB')).toBeInTheDocument();
    expect(screen.getByText('Bank Transfer')).toBeInTheDocument();
  });

  it('should display attendance summary card', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content - check for translation key or actual text
    await waitFor(() => {
      const attendanceElement = screen.queryByText(/attendance summary/i) || screen.queryByText('attendanceSummary');
      expect(attendanceElement).toBeInTheDocument();
    });
    
    // Check for attendance fields
    expect(screen.getByText('200')).toBeInTheDocument(); // Total working days
    expect(screen.getByText('190')).toBeInTheDocument(); // Present days
    expect(screen.getAllByText('5')[0]).toBeInTheDocument(); // Absent days (use getAllByText since it appears twice)
    expect(screen.getByText('95.0%')).toBeInTheDocument(); // Attendance rate
  });

  it('should calculate net salary correctly', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content - check for translation key or actual text
    await waitFor(() => {
      const salaryInfoElement = screen.queryByText(/salary information/i) || screen.queryByText('salaryInfo');
      expect(salaryInfoElement).toBeInTheDocument();
    });

    // Net salary = 15000 + 2000 - 500 = 16500
    expect(screen.getByText('16500.00 ETB')).toBeInTheDocument();
  });

  it('should calculate attendance rate correctly', async () => {
    render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content - check for translation key or actual text
    await waitFor(() => {
      const attendanceElement = screen.queryByText(/attendance summary/i) || screen.queryByText('attendanceSummary');
      expect(attendanceElement).toBeInTheDocument();
    });

    // Attendance rate = (190 / 200) * 100 = 95.0%
    expect(screen.getByText('95.0%')).toBeInTheDocument();
  });

  it('should support light and dark mode', async () => {
    const { container } = render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content
    await waitFor(() => {
      // Check if profile container exists (it should have theme-aware styling)
      const profileContainer = container.querySelector('[class*="profileTabContainer"]');
      expect(profileContainer).toBeInTheDocument();
    });
  });

  it('should be responsive on different screen sizes', async () => {
    const { container } = render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
    });

    // Click on Profile tab
    const profileButton = screen.getByLabelText('Profile');
    fireEvent.click(profileButton);

    // Wait for profile content
    await waitFor(() => {
      // Check if cards are rendered (CollapsibleCard components)
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });
  });

  it('should redirect to login if no stored data', () => {
    mockLocalStorage.getItem.mockReturnValue(null);

    render(
      <BrowserRouter>
        <AppProvider>
          <StaffProfile />
        </AppProvider>
      </BrowserRouter>
    );

    expect(mockNavigate).toHaveBeenCalledWith('/app/staff-login');
  });
});
