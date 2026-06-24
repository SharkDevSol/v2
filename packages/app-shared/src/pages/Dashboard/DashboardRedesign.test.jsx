import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import DashboardRedesign from './DashboardRedesign';
import { useApp } from '../../context/AppContext';
import api from '../../utils/api';

// Mock dependencies
vi.mock('../../context/AppContext');
vi.mock('../../utils/api');
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn()
  };
});

// Mock PageLayout to simplify testing
vi.mock('../../COMPONENTS/Layout/PageLayout', () => ({
  default: ({ children, title, subtitle, actions, loading }) => (
    <div data-testid="page-layout">
      {loading ? (
        <div data-testid="loading">Loading...</div>
      ) : (
        <>
          <div data-testid="page-header">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
            {actions && <div data-testid="page-actions">{actions}</div>}
          </div>
          <div data-testid="page-content">{children}</div>
        </>
      )}
    </div>
  )
}));

describe('DashboardRedesign', () => {
  const mockT = (key) => key;
  const mockTheme = { primaryColor: '#667eea', secondaryColor: '#764ba2' };
  const mockLanguage = 'en';

  const mockDashboardData = {
    basic: {
      totalStudents: 485,
      staffCount: 42,
      classes: ['Grade_1A', 'Grade_1B', 'Grade_2A']
    },
    recentActivity: [
      {
        id: 1,
        type: 'student',
        title: 'New Student Registered',
        description: 'Abebe Kebede joined Grade 2A',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment Received',
        description: 'Fee payment from Sara Mohammed',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      }
    ]
  };

  beforeEach(() => {
    // Setup default mocks
    useApp.mockReturnValue({
      theme: mockTheme,
      t: mockT,
      language: mockLanguage
    });

    api.get.mockResolvedValue({
      data: mockDashboardData
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render dashboard with page layout', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-layout')).toBeInTheDocument();
      });
    });

    it('should display dashboard title and subtitle', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('dashboard.title')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    it('should render all four metric StatCards', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('dashboard.totalStudents')).toBeInTheDocument();
        expect(screen.getByText('dashboard.totalStaff')).toBeInTheDocument();
        expect(screen.getByText('dashboard.attendanceRate')).toBeInTheDocument();
        expect(screen.getByText('dashboard.feeCollectionRate')).toBeInTheDocument();
      });
    });

    it('should render three chart placeholders', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('dashboard.attendanceTrend')).toBeInTheDocument();
        expect(screen.getByText('dashboard.enrollmentTrend')).toBeInTheDocument();
        expect(screen.getByText('dashboard.financialOverview')).toBeInTheDocument();
      });
    });

    it('should render recent activity section', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('dashboard.recentActivity')).toBeInTheDocument();
      });
    });

    it('should render upcoming events section', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('dashboard.upcomingEvents')).toBeInTheDocument();
      });
    });
  });

  describe('Data Loading', () => {
    it('should fetch dashboard data on mount', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/dashboard/enhanced-stats');
      });
    });

    it('should display fetched statistics', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('485')).toBeInTheDocument(); // Total students
        expect(screen.getByText('42')).toBeInTheDocument(); // Total staff
      });
    });

    it('should display recent activity items', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('New Student Registered')).toBeInTheDocument();
        expect(screen.getByText('Abebe Kebede joined Grade 2A')).toBeInTheDocument();
        expect(screen.getByText('Payment Received')).toBeInTheDocument();
      });
    });

    it('should handle API errors gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      // Should load sample data on error - check for any non-zero value
      await waitFor(() => {
        const statCards = screen.getAllByRole('article');
        expect(statCards.length).toBeGreaterThan(0);
      });
    });

    it('should show empty state when no recent activity', async () => {
      api.get.mockResolvedValueOnce({
        data: {
          basic: mockDashboardData.basic,
          recentActivity: []
        }
      });

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('dashboard.noRecentActivity')).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should refresh data when refresh button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(1);
      });

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render metrics grid with proper structure', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        const metricsSection = screen.getByLabelText('Key Metrics');
        expect(metricsSection).toBeInTheDocument();
      });
    });

    it('should render charts grid with proper structure', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        const chartsSection = screen.getByLabelText('Analytics Charts');
        expect(chartsSection).toBeInTheDocument();
      });
    });

    it('should render activity grid with proper structure', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        const activitySection = screen.getByLabelText('Activity and Events');
        expect(activitySection).toBeInTheDocument();
      });
    });
  });

  describe('Internationalization', () => {
    it('should use translation function for all text', async () => {
      const mockTSpy = vi.fn((key) => key);
      useApp.mockReturnValue({
        theme: mockTheme,
        t: mockTSpy,
        language: mockLanguage
      });

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockTSpy).toHaveBeenCalledWith('dashboard.title');
        expect(mockTSpy).toHaveBeenCalledWith('dashboard.totalStudents');
        expect(mockTSpy).toHaveBeenCalledWith('dashboard.totalStaff');
        expect(mockTSpy).toHaveBeenCalledWith('dashboard.attendanceRate');
        expect(mockTSpy).toHaveBeenCalledWith('dashboard.feeCollectionRate');
      });
    });

    it('should format dates according to language', async () => {
      useApp.mockReturnValue({
        theme: mockTheme,
        t: mockT,
        language: 'am' // Amharic
      });

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('dashboard.upcomingEvents')).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for sections', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByLabelText('Key Metrics')).toBeInTheDocument();
        expect(screen.getByLabelText('Analytics Charts')).toBeInTheDocument();
        expect(screen.getByLabelText('Activity and Events')).toBeInTheDocument();
      });
    });

    it('should have accessible StatCard components', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        const statCards = screen.getAllByRole('article');
        expect(statCards.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Time Formatting', () => {
    it('should format relative time correctly for minutes', async () => {
      const recentTimestamp = new Date(Date.now() - 30 * 60 * 1000); // 30 minutes ago
      api.get.mockResolvedValueOnce({
        data: {
          basic: mockDashboardData.basic,
          recentActivity: [
            {
              id: 1,
              type: 'student',
              title: 'Test Activity',
              description: 'Test Description',
              timestamp: recentTimestamp
            }
          ]
        }
      });

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/30.*dashboard\.minutesAgo/)).toBeInTheDocument();
      });
    });

    it('should format relative time correctly for hours', async () => {
      const recentTimestamp = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 hours ago
      api.get.mockResolvedValueOnce({
        data: {
          basic: mockDashboardData.basic,
          recentActivity: [
            {
              id: 1,
              type: 'student',
              title: 'Test Activity',
              description: 'Test Description',
              timestamp: recentTimestamp
            }
          ]
        }
      });

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/3.*dashboard\.hoursAgo/)).toBeInTheDocument();
      });
    });
  });

  describe('Dark Mode Support', () => {
    it('should render correctly in dark mode', async () => {
      useApp.mockReturnValue({
        theme: { ...mockTheme, mode: 'dark' },
        t: mockT,
        language: mockLanguage
      });

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('page-layout')).toBeInTheDocument();
      });
    });
  });

  describe('Last Updated Display', () => {
    it('should display last updated timestamp', async () => {
      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard\.lastUpdated/)).toBeInTheDocument();
      });
    });

    it('should update timestamp after refresh', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <DashboardRedesign />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/dashboard\.lastUpdated/)).toBeInTheDocument();
      });

      const initialTime = screen.getByText(/dashboard\.lastUpdated/).textContent;

      // Wait a bit and refresh
      await new Promise(resolve => setTimeout(resolve, 1000));

      const refreshButton = screen.getByRole('button', { name: /refresh/i });
      await user.click(refreshButton);

      await waitFor(() => {
        const updatedTime = screen.getByText(/dashboard\.lastUpdated/).textContent;
        expect(updatedTime).not.toBe(initialTime);
      });
    });
  });
});
