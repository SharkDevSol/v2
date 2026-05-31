/**
 * OfflineModeBanner Component Tests
 * 
 * Tests for Phase 10.1.13: Write unit tests for key React components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OfflineModeBanner from '../OfflineModeBanner';

// Mock SyncManager
vi.mock('../../services/SyncManager.js', () => {
  const mockSyncManager = {
    getSyncStats: vi.fn(),
    onStatusChange: vi.fn(),
    offStatusChange: vi.fn(),
    onSyncComplete: vi.fn(),
    offSyncComplete: vi.fn(),
    retryFailed: vi.fn()
  };
  
  return {
    default: mockSyncManager
  };
});

// Import the mocked SyncManager
import syncManager from '../../services/SyncManager.js';

describe('OfflineModeBanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true
    });
    
    // Default mock implementation
    syncManager.getSyncStats.mockReturnValue({
      status: 'synced',
      isOnline: true,
      pendingCount: 0
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should not render when online and synced', () => {
      const { container } = render(<OfflineModeBanner />);
      expect(container.firstChild).toBeNull();
    });

    it('should render when offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('You are offline')).toBeInTheDocument();
    });

    it('should render when syncing', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        isOnline: true,
        pendingCount: 3
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('Syncing data')).toBeInTheDocument();
    });

    it('should render when sync error occurs', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 2
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('Sync error')).toBeInTheDocument();
    });
  });

  describe('Offline Status', () => {
    it('should display offline message', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('You are offline')).toBeInTheDocument();
      expect(screen.getByText('Changes will be saved locally and synced when connection is restored.')).toBeInTheDocument();
    });

    it('should display warning icon for offline', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  describe('Syncing Status', () => {
    it('should display syncing message', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        isOnline: true,
        pendingCount: 5
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('Syncing data')).toBeInTheDocument();
      expect(screen.getByText('Synchronizing your changes with the server...')).toBeInTheDocument();
    });

    it('should display sync icon for syncing', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        isOnline: true,
        pendingCount: 5
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('🔄')).toBeInTheDocument();
    });

    it('should show progress bar when syncing', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        isOnline: true,
        pendingCount: 5
      });

      const { container } = render(<OfflineModeBanner />);
      const progressBar = container.querySelector('[class*="progressBar"]');
      expect(progressBar).toBeInTheDocument();
    });
  });

  describe('Error Status', () => {
    it('should display error message', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 3
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('Sync error')).toBeInTheDocument();
      expect(screen.getByText('Some changes could not be synced. Please try again.')).toBeInTheDocument();
    });

    it('should display warning icon for error', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 3
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('⚠️')).toBeInTheDocument();
    });
  });

  describe('Pending Count Display', () => {
    it('should show pending count by default', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 5
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('items pending')).toBeInTheDocument();
    });

    it('should show singular "item pending" for count of 1', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 1
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('item pending')).toBeInTheDocument();
    });

    it('should hide pending count when showPendingCount is false', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 5
      });

      render(<OfflineModeBanner showPendingCount={false} />);
      expect(screen.queryByText('5')).not.toBeInTheDocument();
      expect(screen.queryByText('items pending')).not.toBeInTheDocument();
    });

    it('should not show pending count when 0', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 0
      });

      render(<OfflineModeBanner />);
      expect(screen.queryByText('items pending')).not.toBeInTheDocument();
    });
  });

  describe('Retry Button', () => {
    it('should show retry button for error status when online', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 3
      });

      render(<OfflineModeBanner />);
      expect(screen.getByText('Retry')).toBeInTheDocument();
    });

    it('should not show retry button when showRetryButton is false', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 3
      });

      render(<OfflineModeBanner showRetryButton={false} />);
      expect(screen.queryByText('Retry')).not.toBeInTheDocument();
    });

    it('should call retryFailed when retry button is clicked', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        pendingCount: 3
      });

      syncManager.retryFailed.mockResolvedValue();

      render(<OfflineModeBanner />);
      
      const retryButton = screen.getByText('Retry');
      fireEvent.click(retryButton);

      expect(syncManager.retryFailed).toHaveBeenCalled();
    });
  });

  describe('Dismiss Functionality', () => {
    it('should show dismiss button when dismissible is true', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      render(<OfflineModeBanner dismissible={true} />);
      expect(screen.getByText('×')).toBeInTheDocument();
    });

    it('should not show dismiss button by default', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      render(<OfflineModeBanner />);
      expect(screen.queryByText('×')).not.toBeInTheDocument();
    });

    it('should hide banner when dismissed', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      const { container } = render(<OfflineModeBanner dismissible={true} />);
      
      const dismissButton = screen.getByText('×');
      fireEvent.click(dismissButton);

      expect(container.firstChild).toBeNull();
    });
  });

  describe('Position Prop', () => {
    it('should apply top position by default', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      const { container } = render(<OfflineModeBanner />);
      const banner = container.querySelector('[class*="top"]');
      expect(banner).toBeInTheDocument();
    });

    it('should apply bottom position when specified', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      const { container } = render(<OfflineModeBanner position="bottom" />);
      const banner = container.querySelector('[class*="bottom"]');
      expect(banner).toBeInTheDocument();
    });
  });

  describe('Event Listeners', () => {
    it('should register status change listener on mount', () => {
      render(<OfflineModeBanner />);
      expect(syncManager.onStatusChange).toHaveBeenCalled();
    });

    it('should register sync complete listener on mount', () => {
      render(<OfflineModeBanner />);
      expect(syncManager.onSyncComplete).toHaveBeenCalled();
    });

    it('should unregister listeners on unmount', () => {
      const { unmount } = render(<OfflineModeBanner />);
      unmount();
      
      expect(syncManager.offStatusChange).toHaveBeenCalled();
      expect(syncManager.offSyncComplete).toHaveBeenCalled();
    });
  });

  describe('Periodic Updates', () => {
    it('should update status periodically', () => {
      render(<OfflineModeBanner />);
      
      syncManager.getSyncStats.mockClear();
      
      // Advance timer by 5 seconds
      vi.advanceTimersByTime(5000);
      
      expect(syncManager.getSyncStats).toHaveBeenCalled();
    });

    it('should stop periodic updates on unmount', () => {
      const { unmount } = render(<OfflineModeBanner />);
      
      syncManager.getSyncStats.mockClear();
      unmount();
      
      // Advance timer
      vi.advanceTimersByTime(5000);
      
      expect(syncManager.getSyncStats).not.toHaveBeenCalled();
    });
  });

  describe('Status Change Handling', () => {
    it('should reset dismissed state when coming back online', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        pendingCount: 0
      });

      const { container } = render(<OfflineModeBanner dismissible={true} />);
      
      // Dismiss the banner
      const dismissButton = screen.getByText('×');
      fireEvent.click(dismissButton);

      // Banner should be hidden
      expect(container.firstChild).toBeNull();
    });
  });
});
