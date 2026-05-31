/**
 * PendingSyncCounter Component Tests
 * 
 * Tests for Phase 10.1.13: Write unit tests for key React components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PendingSyncCounter from '../PendingSyncCounter';

// Mock SyncManager
vi.mock('../../services/SyncManager.js', () => {
  const mockSyncManager = {
    onSyncComplete: vi.fn(),
    offSyncComplete: vi.fn(),
    manualSync: vi.fn()
  };
  
  return {
    default: mockSyncManager
  };
});

// Mock OfflineDatabase
vi.mock('../../services/OfflineDatabase.js', () => {
  const mockOfflineDB = {
    getStats: vi.fn()
  };
  
  return {
    default: mockOfflineDB
  };
});

// Import the mocked modules
import syncManager from '../../services/SyncManager.js';
import offlineDB from '../../services/OfflineDatabase.js';

describe('PendingSyncCounter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    offlineDB.getStats.mockResolvedValue({
      unsyncedStudents: 0,
      unsyncedAttendance: 0,
      unsyncedMarks: 0,
      unsyncedExams: 0,
      unsyncedPosts: 0,
      pendingSyncQueue: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', async () => {
      render(<PendingSyncCounter />);
      await waitFor(() => {
        expect(screen.getByText('All synced')).toBeInTheDocument();
      });
    });

    it('should show loading state initially', () => {
      render(<PendingSyncCounter />);
      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should display "All synced" when no pending items', async () => {
      render(<PendingSyncCounter />);
      
      await waitFor(() => {
        expect(screen.getByText('All synced')).toBeInTheDocument();
      });
    });

    it('should display pending count when items exist', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 2,
        unsyncedAttendance: 3,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter />);
      
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
        expect(screen.getByText('items pending')).toBeInTheDocument();
      });
    });

    it('should display singular "item pending" for count of 1', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 1,
        unsyncedAttendance: 0,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter />);
      
      await waitFor(() => {
        expect(screen.getByText('1')).toBeInTheDocument();
        expect(screen.getByText('item pending')).toBeInTheDocument();
      });
    });
  });

  describe('Variant Prop', () => {
    it('should apply default variant class', async () => {
      const { container } = render(<PendingSyncCounter />);
      
      await waitFor(() => {
        const counter = container.querySelector('[class*="default"]');
        expect(counter).toBeInTheDocument();
      });
    });

    it('should apply compact variant class', async () => {
      const { container } = render(<PendingSyncCounter variant="compact" />);
      
      await waitFor(() => {
        const counter = container.querySelector('[class*="compact"]');
        expect(counter).toBeInTheDocument();
      });
    });

    it('should apply detailed variant class', async () => {
      const { container } = render(<PendingSyncCounter variant="detailed" />);
      
      await waitFor(() => {
        const counter = container.querySelector('[class*="detailed"]');
        expect(counter).toBeInTheDocument();
      });
    });
  });

  describe('Details Expansion', () => {
    it('should not show details by default', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 5,
        unsyncedAttendance: 0,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter showDetails={false} />);
      
      await waitFor(() => {
        expect(screen.queryByText('Sync Now')).not.toBeInTheDocument();
      });
    });

    it('should show expand icon when showDetails is true', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 5,
        unsyncedAttendance: 0,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter showDetails={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('▶')).toBeInTheDocument();
      });
    });

    it('should toggle details when clicked', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 5,
        unsyncedAttendance: 0,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter showDetails={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('▶')).toBeInTheDocument();
      });

      const header = screen.getByText('5').closest('div');
      fireEvent.click(header);

      await waitFor(() => {
        expect(screen.getByText('▼')).toBeInTheDocument();
        expect(screen.getByText('Sync Now')).toBeInTheDocument();
      });
    });
  });

  describe('Breakdown Display', () => {
    it('should show breakdown when showBreakdown is true and expanded', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 2,
        unsyncedAttendance: 3,
        unsyncedMarks: 1,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter showDetails={true} showBreakdown={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('6')).toBeInTheDocument();
      });

      const header = screen.getByText('6').closest('div');
      fireEvent.click(header);

      await waitFor(() => {
        expect(screen.getByText('Breakdown by Type')).toBeInTheDocument();
        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.getByText('Attendance')).toBeInTheDocument();
        expect(screen.getByText('Marks')).toBeInTheDocument();
      });
    });

    it('should only show non-zero breakdown items', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 2,
        unsyncedAttendance: 0,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter showDetails={true} showBreakdown={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('2')).toBeInTheDocument();
      });

      const header = screen.getByText('2').closest('div');
      fireEvent.click(header);

      await waitFor(() => {
        expect(screen.getByText('Students')).toBeInTheDocument();
        expect(screen.queryByText('Attendance')).not.toBeInTheDocument();
        expect(screen.queryByText('Marks')).not.toBeInTheDocument();
      });
    });

    it('should display correct breakdown values', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 5,
        unsyncedAttendance: 3,
        unsyncedMarks: 2,
        unsyncedExams: 1,
        unsyncedPosts: 4,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter showDetails={true} showBreakdown={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('15')).toBeInTheDocument();
      });

      const header = screen.getByText('15').closest('div');
      fireEvent.click(header);

      await waitFor(() => {
        const breakdownItems = screen.getAllByText(/\d+/);
        // Should have the total count plus individual breakdown values
        expect(breakdownItems.length).toBeGreaterThan(1);
      });
    });
  });

  describe('Manual Sync', () => {
    it('should call manualSync when Sync Now button is clicked', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 5,
        unsyncedAttendance: 0,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      syncManager.manualSync.mockResolvedValue();

      render(<PendingSyncCounter showDetails={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });

      const header = screen.getByText('5').closest('div');
      fireEvent.click(header);

      await waitFor(() => {
        const syncButton = screen.getByText('Sync Now');
        fireEvent.click(syncButton);
      });

      expect(syncManager.manualSync).toHaveBeenCalled();
    });

    it('should handle sync errors gracefully', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 5,
        unsyncedAttendance: 0,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      syncManager.manualSync.mockRejectedValue(new Error('Sync failed'));

      render(<PendingSyncCounter showDetails={true} />);
      
      await waitFor(() => {
        expect(screen.getByText('5')).toBeInTheDocument();
      });

      const header = screen.getByText('5').closest('div');
      fireEvent.click(header);

      await waitFor(() => {
        const syncButton = screen.getByText('Sync Now');
        fireEvent.click(syncButton);
      });

      // Should not throw error
      expect(syncManager.manualSync).toHaveBeenCalled();
    });
  });

  describe('Event Listeners', () => {
    it('should register sync complete listener on mount', () => {
      render(<PendingSyncCounter />);
      expect(syncManager.onSyncComplete).toHaveBeenCalled();
    });

    it('should unregister listener on unmount', () => {
      const { unmount } = render(<PendingSyncCounter />);
      unmount();
      
      expect(syncManager.offSyncComplete).toHaveBeenCalled();
    });
  });

  describe('Periodic Updates', () => {
    it('should update counts periodically', async () => {
      vi.useFakeTimers();
      
      render(<PendingSyncCounter />);
      
      await waitFor(() => {
        expect(offlineDB.getStats).toHaveBeenCalled();
      });
      
      offlineDB.getStats.mockClear();
      
      // Advance timer by 5 seconds
      vi.advanceTimersByTime(5000);
      
      await waitFor(() => {
        expect(offlineDB.getStats).toHaveBeenCalled();
      });
      
      vi.useRealTimers();
    });

    it('should stop periodic updates on unmount', async () => {
      vi.useFakeTimers();
      
      const { unmount } = render(<PendingSyncCounter />);
      
      await waitFor(() => {
        expect(offlineDB.getStats).toHaveBeenCalled();
      });
      
      offlineDB.getStats.mockClear();
      unmount();
      
      // Advance timer
      vi.advanceTimersByTime(5000);
      
      // Should not be called after unmount
      expect(offlineDB.getStats).not.toHaveBeenCalled();
      
      vi.useRealTimers();
    });
  });

  describe('Error Handling', () => {
    it('should handle getStats errors gracefully', async () => {
      offlineDB.getStats.mockRejectedValue(new Error('Database error'));

      render(<PendingSyncCounter />);
      
      // Should not crash
      await waitFor(() => {
        expect(screen.getByText('All synced')).toBeInTheDocument();
      });
    });
  });

  describe('Icons', () => {
    it('should display checkmark icon when all synced', async () => {
      render(<PendingSyncCounter />);
      
      await waitFor(() => {
        expect(screen.getByText('✓')).toBeInTheDocument();
      });
    });

    it('should display sync icon when items pending', async () => {
      offlineDB.getStats.mockResolvedValue({
        unsyncedStudents: 5,
        unsyncedAttendance: 0,
        unsyncedMarks: 0,
        unsyncedExams: 0,
        unsyncedPosts: 0,
        pendingSyncQueue: 0
      });

      render(<PendingSyncCounter />);
      
      await waitFor(() => {
        expect(screen.getByText('⟳')).toBeInTheDocument();
      });
    });
  });
});
