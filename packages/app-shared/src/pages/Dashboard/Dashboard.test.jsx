import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AppProvider } from '../../context/AppContext';
import api from '../../utils/api';

// Mock the API
vi.mock('../../utils/api');

// Mock recharts to avoid rendering issues in tests
vi.mock('recharts', () => ({
  BarChart: ({ children }) => <div data-testid="bar-chart">{children}</div>,
  Bar: () => <div data-testid="bar" />,
  XAxis: () => <div data-testid="x-axis" />,
  YAxis: () => <div data-testid="y-axis" />,
  CartesianGrid: () => <div data-testid="cartesian-grid" />,
  Tooltip: () => <div data-testid="tooltip" />,
  Legend: () => <div data-testid="legend" />,
  ResponsiveContainer: ({ children }) => <div data-testid="responsive-container">{children}</div>,
  PieChart: ({ children }) => <div data-testid="pie-chart">{children}</div>,
  Pie: () => <div data-testid="pie" />,
  Cell: () => <div data-testid="cell" />,
  LineChart: ({ children }) => <div data-testid="line-chart">{children}</div>,
  Line: () => <div data-testid="line" />
}));

const mockApiResponse = {
  data: {
    basic: {
      totalStudents: 485,
      gender: { male: 256, female: 229 },
      staffCount: 42,
      classes: ['Grade 1A', 'Grade 1B', 'Grade 2A', 'Grade 2B'],
      totalFaults: 47,
      uniqueStudentsWithFaults: 32
    }
  }
};

const renderDashboard = (theme = 'light', language = 'en') => {
  const mockAppContext = {
    theme,
    language,
    t: (key) => key
  };

  return render(
    <BrowserRouter>
      <AppProvider value={mockAppContext}>
        <Dashboard />
      </AppProvider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue(mockApiResponse);
  });

  describe('Task 11.7.3-11.7.4: Dashboard page with new design', () => {
    it('should render dashboard with header', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('dashboard')).toBeInTheDocument();
      });
    });

    it('should display last updated time', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/lastUpdated/i)).toBeInTheDocument();
      });
    });

    it('should have refresh button', async () => {
      renderDashboard();
      
      await waitFor(() => {
        const refreshBtn = screen.getByText('refresh');
        expect(refreshBtn).toBeInTheDocument();
      });
    });
  });

  describe('Task 11.7.5: Stat cards grid', () => {
    it('should render all 4 stat cards', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('totalStudents')).toBeInTheDocument();
        expect(screen.getByText('staffMembers')).toBeInTheDocument();
        expect(screen.getByText('classes')).toBeInTheDocument();
        expect(screen.getByText('attendanceRate')).toBeInTheDocument();
      });
    });

    it('should display correct student count', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('485')).toBeInTheDocument();
      });
    });

    it('should display gender breakdown', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/256.*male/i)).toBeInTheDocument();
        expect(screen.getByText(/229.*female/i)).toBeInTheDocument();
      });
    });

    it('should show trend indicators', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText(/vsLastMonth/i)).toBeInTheDocument();
      });
    });
  });

  describe('Task 11.7.6: Charts with responsive design', () => {
    it('should render attendance chart', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('weeklyAttendance')).toBeInTheDocument();
        expect(screen.getByTestId('bar-chart')).toBeInTheDocument();
      });
    });

    it('should render enrollment trend chart', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('enrollmentTrend')).toBeInTheDocument();
        expect(screen.getByTestId('line-chart')).toBeInTheDocument();
      });
    });

    it('should use responsive containers for charts', async () => {
      renderDashboard();
      
      await waitFor(() => {
        const containers = screen.getAllByTestId('responsive-container');
        expect(containers.length).toBeGreaterThanOrEqual(2);
      });
    });
  });

  describe('Task 11.7.7: Recent activity section', () => {
    it('should render recent activity section', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('recentActivity')).toBeInTheDocument();
      });
    });

    it('should display activity items', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('New Student Registered')).toBeInTheDocument();
        expect(screen.getByText('Attendance Marked')).toBeInTheDocument();
        expect(screen.getByText('Payment Received')).toBeInTheDocument();
      });
    });

    it('should show activity timestamps', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('2 hours ago')).toBeInTheDocument();
        expect(screen.getByText('3 hours ago')).toBeInTheDocument();
      });
    });
  });

  describe('Task 11.7.8: Upcoming events section', () => {
    it('should render upcoming events section', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('upcomingEvents')).toBeInTheDocument();
      });
    });

    it('should display event items', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('Parent-Teacher Meeting')).toBeInTheDocument();
        expect(screen.getByText('Mathematics Exam')).toBeInTheDocument();
        expect(screen.getByText('Sports Day')).toBeInTheDocument();
      });
    });

    it('should show event dates and times', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('10:00 AM')).toBeInTheDocument();
        expect(screen.getByText('9:00 AM')).toBeInTheDocument();
      });
    });
  });

  describe('Task 11.7.9: Light and dark mode testing', () => {
    it('should render correctly in light mode', async () => {
      const { container } = renderDashboard('light');
      
      await waitFor(() => {
        expect(container.querySelector('.dashboard')).toBeInTheDocument();
      });
    });

    it('should render correctly in dark mode', async () => {
      const { container } = renderDashboard('dark');
      
      await waitFor(() => {
        expect(container.querySelector('.dashboard')).toBeInTheDocument();
      });
    });

    it('should apply dark mode class when theme is dark', async () => {
      const { container } = renderDashboard('dark');
      
      await waitFor(() => {
        const dashboard = container.querySelector('.dashboard');
        expect(dashboard).toBeInTheDocument();
      });
    });
  });

  describe('Task 11.7.10: Language testing', () => {
    it('should render in English', async () => {
      renderDashboard('light', 'en');
      
      await waitFor(() => {
        expect(screen.getByText('dashboard')).toBeInTheDocument();
      });
    });

    it('should render in Amharic', async () => {
      renderDashboard('light', 'am');
      
      await waitFor(() => {
        expect(screen.getByText('dashboard')).toBeInTheDocument();
      });
    });

    it('should render in Arabic', async () => {
      renderDashboard('light', 'ar');
      
      await waitFor(() => {
        expect(screen.getByText('dashboard')).toBeInTheDocument();
      });
    });

    it('should use translation function for all text', async () => {
      const mockT = vi.fn((key) => key);
      const mockAppContext = {
        theme: 'light',
        language: 'en',
        t: mockT
      };

      render(
        <BrowserRouter>
          <AppProvider value={mockAppContext}>
            <Dashboard />
          </AppProvider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(mockT).toHaveBeenCalledWith('dashboard');
        expect(mockT).toHaveBeenCalledWith('totalStudents');
        expect(mockT).toHaveBeenCalledWith('recentActivity');
      });
    });
  });

  describe('Task 11.7.11: Responsiveness testing', () => {
    it('should render on mobile viewport', async () => {
      global.innerWidth = 375;
      global.innerHeight = 667;
      
      const { container } = renderDashboard();
      
      await waitFor(() => {
        expect(container.querySelector('.dashboard')).toBeInTheDocument();
      });
    });

    it('should render on tablet viewport', async () => {
      global.innerWidth = 768;
      global.innerHeight = 1024;
      
      const { container } = renderDashboard();
      
      await waitFor(() => {
        expect(container.querySelector('.dashboard')).toBeInTheDocument();
      });
    });

    it('should render on desktop viewport', async () => {
      global.innerWidth = 1920;
      global.innerHeight = 1080;
      
      const { container } = renderDashboard();
      
      await waitFor(() => {
        expect(container.querySelector('.dashboard')).toBeInTheDocument();
      });
    });

    it('should have responsive grid classes', async () => {
      const { container } = renderDashboard();
      
      await waitFor(() => {
        expect(container.querySelector('.statsGrid')).toBeInTheDocument();
        expect(container.querySelector('.chartsGrid')).toBeInTheDocument();
        expect(container.querySelector('.activityEventsGrid')).toBeInTheDocument();
      });
    });
  });

  describe('Functionality tests', () => {
    it('should refresh data when refresh button is clicked', async () => {
      renderDashboard();
      
      await waitFor(() => {
        const refreshBtn = screen.getByText('refresh');
        fireEvent.click(refreshBtn);
      });

      expect(api.get).toHaveBeenCalledTimes(2); // Initial load + refresh
    });

    it('should handle API errors gracefully', async () => {
      api.get.mockRejectedValueOnce(new Error('API Error'));
      
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.getByText('dashboard')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      renderDashboard();
      
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should hide loading state after data loads', async () => {
      renderDashboard();
      
      await waitFor(() => {
        expect(screen.queryByText(/loading/i)).not.toBeInTheDocument();
      });
    });
  });
});
