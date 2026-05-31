/**
 * OfflineStatusIndicator Component Tests
 * 
 * Tests for Phase 10.1.13: Write unit tests for key React components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OfflineStatusIndicator from '../OfflineStatusIndicator';

// Mock SyncManager - must be defined before vi.mock
vi.mock('../../services/SyncManager.js', () => {
  const syncManager = {
    getSyncStats: vi.fn(),
    onStatusChange: vi.fn(),
    offStatusChange: vi.fn(),
    onSyncComplete: vi.fn(),
    offSyncComplete: vi.fn(),
    manualSync: vi.fn(),
    retryFailed: vi.fn()
  };
  
  return {
    default: syncManager
  };
});

// Import the mocked SyncManager
import syncManager from '../../services/SyncManager.js';

describe('OfflineStatusIndicator', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default mock implementation
    syncManager.getSyncStats.mockReturnValue({
      status: 'synced',
      isOnline: true,
      isSyncing: false,
      pendingCount: 0,
      lastSyncTime: new Date().toISOString()
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<OfflineStatusIndicator />);
      expect(screen.getByText(/Online/i)).toBeInTheDocument();
    });

    it('should display online status when connected', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      expect(screen.getByText('Online')).toBeInTheDocument();
    });

    it('should display offline status when disconnected', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: null
      });

      render(<OfflineStatusIndicator />);
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should display syncing status when syncing', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        isOnline: true,
        isSyncing: true,
        pendingCount: 5,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      expect(screen.getByText('Syncing')).toBeInTheDocument();
    });

    it('should display error status when sync fails', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        isSyncing: false,
        pendingCount: 3,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      expect(screen.getByText('Sync Error')).toBeInTheDocument();
    });
  });

  describe('Compact Mode', () => {
    it('should render in compact mode when compact prop is true', () => {
      const { container } = render(<OfflineStatusIndicator compact={true} />);
      const indicator = container.querySelector('[class*="compact"]');
      expect(indicator).toBeInTheDocument();
    });

    it('should show pending count badge in compact mode', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 5,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator compact={true} />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });

  describe('Details Panel', () => {
    it('should toggle details panel when clicked', async () => {
      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText(/Status:/i)).toBeInTheDocument();
        expect(screen.getByText(/Connection:/i)).toBeInTheDocument();
      });
    });

    it('should display connection status in details', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        // Check for "Online" text in the details panel (not using CSS selector)
        const onlineTexts = screen.getAllByText('Online');
        expect(onlineTexts.length).toBeGreaterThan(1); // Should appear in both status bar and details
      });
    });

    it('should display pending count in details when items are pending', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 3,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText(/3 items/i)).toBeInTheDocument();
      });
    });

    it('should display last sync time in details', async () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
      
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: fiveMinutesAgo
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText(/5m ago/i)).toBeInTheDocument();
      });
    });

    it('should display "Never" when no sync has occurred', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: null
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Offline').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText('Never')).toBeInTheDocument();
      });
    });
  });

  describe('Manual Sync', () => {
    it('should show "Sync Now" button when online and not syncing', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText('Sync Now')).toBeInTheDocument();
      });
    });

    it('should call manualSync when "Sync Now" is clicked', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: new Date().toISOString()
      });

      syncManager.manualSync.mockResolvedValue();

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        const syncButton = screen.getByText('Sync Now');
        fireEvent.click(syncButton);
      });

      expect(syncManager.manualSync).toHaveBeenCalled();
    });

    it('should not show "Sync Now" button when offline', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        isOnline: false,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: null
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Offline').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.queryByText('Sync Now')).not.toBeInTheDocument();
      });
    });

    it('should not show "Sync Now" button when syncing', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        isOnline: true,
        isSyncing: true,
        pendingCount: 5,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Syncing').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.queryByText('Sync Now')).not.toBeInTheDocument();
        // Check for syncing text (may appear multiple times)
        const syncingTexts = screen.queryAllByText(/Syncing/i);
        expect(syncingTexts.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Retry Failed', () => {
    it('should show "Retry Failed" button when status is error', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        isSyncing: false,
        pendingCount: 3,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Sync Error').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText('Retry Failed')).toBeInTheDocument();
      });
    });

    it('should call retryFailed when "Retry Failed" is clicked', async () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        isOnline: true,
        isSyncing: false,
        pendingCount: 3,
        lastSyncTime: new Date().toISOString()
      });

      syncManager.retryFailed.mockResolvedValue();

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Sync Error').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        const retryButton = screen.getByText('Retry Failed');
        fireEvent.click(retryButton);
      });

      expect(syncManager.retryFailed).toHaveBeenCalled();
    });
  });

  describe('Pending Count Badge', () => {
    it('should show badge when pending count > 0', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 7,
        lastSyncTime: new Date().toISOString()
      });

      render(<OfflineStatusIndicator />);
      expect(screen.getByText('7')).toBeInTheDocument();
    });

    it('should not show badge when pending count is 0', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: new Date().toISOString()
      });

      const { container } = render(<OfflineStatusIndicator />);
      const badge = container.querySelector('[class*="badge"]');
      expect(badge).not.toBeInTheDocument();
    });
  });

  describe('Position Prop', () => {
    it('should apply top-right position by default', () => {
      const { container } = render(<OfflineStatusIndicator />);
      const indicator = container.querySelector('[class*="top-right"]');
      expect(indicator).toBeInTheDocument();
    });

    it('should apply custom position when provided', () => {
      const { container } = render(<OfflineStatusIndicator position="bottom-left" />);
      const indicator = container.querySelector('[class*="bottom-left"]');
      expect(indicator).toBeInTheDocument();
    });
  });

  describe('Event Listeners', () => {
    it('should register status change listener on mount', () => {
      render(<OfflineStatusIndicator />);
      expect(syncManager.onStatusChange).toHaveBeenCalled();
    });

    it('should register sync complete listener on mount', () => {
      render(<OfflineStatusIndicator />);
      expect(syncManager.onSyncComplete).toHaveBeenCalled();
    });

    it('should unregister listeners on unmount', () => {
      const { unmount } = render(<OfflineStatusIndicator />);
      unmount();
      
      expect(syncManager.offStatusChange).toHaveBeenCalled();
      expect(syncManager.offSyncComplete).toHaveBeenCalled();
    });
  });

  describe('Time Formatting', () => {
    it('should format time as "Just now" for recent syncs', async () => {
      const now = new Date().toISOString();
      
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: now
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText('Just now')).toBeInTheDocument();
      });
    });

    it('should format time in minutes for syncs < 1 hour ago', async () => {
      const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: thirtyMinutesAgo
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText(/30m ago/i)).toBeInTheDocument();
      });
    });

    it('should format time in hours for syncs < 24 hours ago', async () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: twoHoursAgo
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText(/2h ago/i)).toBeInTheDocument();
      });
    });

    it('should format time in days for syncs > 24 hours ago', async () => {
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        isOnline: true,
        isSyncing: false,
        pendingCount: 0,
        lastSyncTime: threeDaysAgo
      });

      render(<OfflineStatusIndicator />);
      
      const statusBar = screen.getByText('Online').closest('div');
      fireEvent.click(statusBar);

      await waitFor(() => {
        expect(screen.getByText(/3d ago/i)).toBeInTheDocument();
      });
    });
  });
});

