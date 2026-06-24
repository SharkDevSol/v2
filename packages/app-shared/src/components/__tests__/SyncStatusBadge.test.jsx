/**
 * SyncStatusBadge Component Tests
 * 
 * Tests for Phase 10.1.13: Write unit tests for key React components
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import SyncStatusBadge from '../SyncStatusBadge';

// Mock SyncManager
vi.mock('../../services/SyncManager.js', () => {
  const mockSyncManager = {
    getSyncStats: vi.fn(),
    onStatusChange: vi.fn(),
    offStatusChange: vi.fn(),
    onSyncComplete: vi.fn(),
    offSyncComplete: vi.fn()
  };
  
  return {
    default: mockSyncManager
  };
});

// Import the mocked SyncManager
import syncManager from '../../services/SyncManager.js';

describe('SyncStatusBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    
    // Default mock implementation
    syncManager.getSyncStats.mockReturnValue({
      status: 'synced',
      pendingCount: 0,
      isSyncing: false
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      render(<SyncStatusBadge />);
      expect(screen.getByText('Synced')).toBeInTheDocument();
    });

    it('should display offline status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        pendingCount: 0,
        isSyncing: false
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should display syncing status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        pendingCount: 3,
        isSyncing: true
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('Syncing')).toBeInTheDocument();
    });

    it('should display synced status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 0,
        isSyncing: false
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('Synced')).toBeInTheDocument();
    });

    it('should display error status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        pendingCount: 2,
        isSyncing: false
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  describe('Size Prop', () => {
    it('should apply small size class', () => {
      const { container } = render(<SyncStatusBadge size="small" />);
      const badge = container.querySelector('[class*="small"]');
      expect(badge).toBeInTheDocument();
    });

    it('should apply medium size class by default', () => {
      const { container } = render(<SyncStatusBadge />);
      const badge = container.querySelector('[class*="medium"]');
      expect(badge).toBeInTheDocument();
    });

    it('should apply large size class', () => {
      const { container } = render(<SyncStatusBadge size="large" />);
      const badge = container.querySelector('[class*="large"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Text Display', () => {
    it('should show text by default', () => {
      render(<SyncStatusBadge />);
      expect(screen.getByText('Synced')).toBeInTheDocument();
    });

    it('should hide text when showText is false', () => {
      render(<SyncStatusBadge showText={false} />);
      expect(screen.queryByText('Synced')).not.toBeInTheDocument();
    });
  });

  describe('Pending Count Badge', () => {
    it('should show pending count when greater than 0', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 5,
        isSyncing: false
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should not show pending count when 0', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 0,
        isSyncing: false
      });

      const { container } = render(<SyncStatusBadge />);
      const pendingBadge = container.querySelector('[class*="pendingBadge"]');
      expect(pendingBadge).not.toBeInTheDocument();
    });

    it('should hide pending count when showPending is false', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 5,
        isSyncing: false
      });

      render(<SyncStatusBadge showPending={false} />);
      expect(screen.queryByText('5')).not.toBeInTheDocument();
    });
  });

  describe('Click Handler', () => {
    it('should call onClick when clicked', () => {
      const handleClick = vi.fn();
      
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 3,
        isSyncing: false
      });

      render(<SyncStatusBadge onClick={handleClick} />);
      
      const badge = screen.getByText('Synced').closest('div');
      fireEvent.click(badge);

      expect(handleClick).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          status: 'synced',
          pendingCount: 3,
          isSyncing: false
        })
      );
    });

    it('should not call onClick when not provided', () => {
      render(<SyncStatusBadge />);
      
      const badge = screen.getByText('Synced').closest('div');
      expect(() => fireEvent.click(badge)).not.toThrow();
    });

    it('should apply clickable class when onClick is provided', () => {
      const handleClick = vi.fn();
      const { container } = render(<SyncStatusBadge onClick={handleClick} />);
      
      const badge = container.querySelector('[class*="clickable"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('Event Listeners', () => {
    it('should register status change listener on mount', () => {
      render(<SyncStatusBadge />);
      expect(syncManager.onStatusChange).toHaveBeenCalled();
    });

    it('should register sync complete listener on mount', () => {
      render(<SyncStatusBadge />);
      expect(syncManager.onSyncComplete).toHaveBeenCalled();
    });

    it('should unregister listeners on unmount', () => {
      const { unmount } = render(<SyncStatusBadge />);
      unmount();
      
      expect(syncManager.offStatusChange).toHaveBeenCalled();
      expect(syncManager.offSyncComplete).toHaveBeenCalled();
    });
  });

  describe('Periodic Updates', () => {
    it('should update status periodically', () => {
      render(<SyncStatusBadge />);
      
      // Initial call
      expect(syncManager.getSyncStats).toHaveBeenCalled();
      
      // Clear previous calls
      syncManager.getSyncStats.mockClear();
      
      // Advance timer by 3 seconds
      vi.advanceTimersByTime(3000);
      
      // Should have been called again
      expect(syncManager.getSyncStats).toHaveBeenCalled();
    });

    it('should stop periodic updates on unmount', () => {
      const { unmount } = render(<SyncStatusBadge />);
      
      syncManager.getSyncStats.mockClear();
      unmount();
      
      // Advance timer
      vi.advanceTimersByTime(3000);
      
      // Should not be called after unmount
      expect(syncManager.getSyncStats).not.toHaveBeenCalled();
    });
  });

  describe('Status Icons', () => {
    it('should display warning icon for offline status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        pendingCount: 0,
        isSyncing: false
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('⚠')).toBeInTheDocument();
    });

    it('should display sync icon for syncing status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        pendingCount: 0,
        isSyncing: true
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('⟳')).toBeInTheDocument();
    });

    it('should display checkmark icon for synced status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 0,
        isSyncing: false
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('✓')).toBeInTheDocument();
    });

    it('should display error icon for error status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'error',
        pendingCount: 0,
        isSyncing: false
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('✕')).toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply pulse class for offline status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'offline',
        pendingCount: 0,
        isSyncing: false
      });

      const { container } = render(<SyncStatusBadge />);
      const badge = container.querySelector('[class*="pulse"]');
      expect(badge).toBeInTheDocument();
    });

    it('should apply spin class for syncing status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'syncing',
        pendingCount: 0,
        isSyncing: true
      });

      const { container } = render(<SyncStatusBadge />);
      const icon = container.querySelector('[class*="spin"]');
      expect(icon).toBeInTheDocument();
    });

    it('should not apply pulse class for synced status', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 0,
        isSyncing: false
      });

      const { container } = render(<SyncStatusBadge />);
      const badge = container.querySelector('[class*="badge"]');
      expect(badge.className).not.toContain('pulse');
    });
  });

  describe('Title Attribute', () => {
    it('should have title with status and pending count', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 3,
        isSyncing: false
      });

      const { container } = render(<SyncStatusBadge />);
      const badge = container.querySelector('[title]');
      expect(badge).toHaveAttribute('title', 'Status: Synced (3 pending)');
    });

    it('should have title without pending count when 0', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'synced',
        pendingCount: 0,
        isSyncing: false
      });

      const { container } = render(<SyncStatusBadge />);
      const badge = container.querySelector('[title]');
      expect(badge).toHaveAttribute('title', 'Status: Synced');
    });
  });

  describe('Unknown Status', () => {
    it('should handle unknown status gracefully', () => {
      syncManager.getSyncStats.mockReturnValue({
        status: 'unknown_status',
        pendingCount: 0,
        isSyncing: false
      });

      render(<SyncStatusBadge />);
      expect(screen.getByText('Unknown')).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });
});
