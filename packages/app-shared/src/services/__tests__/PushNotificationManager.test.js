/**
 * Push Notification Manager Tests
 * 
 * Tests for Phase 5.2.8: Test push notifications on Android devices
 * 
 * Note: These are unit tests. Manual testing on actual Android devices
 * is required for full validation.
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock Capacitor plugins
const mockPushNotifications = {
  checkPermissions: vi.fn(),
  requestPermissions: vi.fn(),
  register: vi.fn(),
  addListener: vi.fn(),
  removeAllListeners: vi.fn(),
  createChannel: vi.fn(),
  listChannels: vi.fn()
};

const mockCapacitor = {
  getPlatform: vi.fn(() => 'android')
};

const mockDevice = {
  getInfo: vi.fn(),
  getId: vi.fn()
};

// Mock modules
vi.mock('@capacitor/push-notifications', () => ({
  PushNotifications: mockPushNotifications
}));

vi.mock('@capacitor/core', () => ({
  Capacitor: mockCapacitor
}));

vi.mock('@capacitor/device', () => ({
  Device: mockDevice
}));

vi.mock('axios', () => ({
  default: {
    post: vi.fn()
  }
}));

// Import after mocks
import pushNotificationManager from '../PushNotificationManager';
import axios from 'axios';

describe('PushNotificationManager', () => {
  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();
    
    // Reset manager state
    pushNotificationManager.isInitialized = false;
    pushNotificationManager.currentToken = null;
    
    // Setup default mock responses
    mockPushNotifications.checkPermissions.mockResolvedValue({
      receive: 'granted'
    });
    
    mockPushNotifications.requestPermissions.mockResolvedValue({
      receive: 'granted'
    });
    
    mockPushNotifications.register.mockResolvedValue(undefined);
    
    mockDevice.getInfo.mockResolvedValue({
      model: 'Test Device',
      osVersion: '13',
      appVersion: '2.0.0'
    });
    
    mockDevice.getId.mockResolvedValue({
      identifier: 'test-device-id'
    });
    
    axios.post.mockResolvedValue({
      data: { success: true }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialize()', () => {
    it('should initialize successfully with granted permissions', async () => {
      const result = await pushNotificationManager.initialize();
      
      expect(result).toBe(true);
      expect(pushNotificationManager.isInitialized).toBe(true);
      expect(mockPushNotifications.checkPermissions).toHaveBeenCalled();
      expect(mockPushNotifications.register).toHaveBeenCalled();
    });

    it('should request permissions if status is prompt', async () => {
      mockPushNotifications.checkPermissions.mockResolvedValue({
        receive: 'prompt'
      });
      
      mockPushNotifications.requestPermissions.mockResolvedValue({
        receive: 'granted'
      });
      
      const result = await pushNotificationManager.initialize();
      
      expect(result).toBe(true);
      expect(mockPushNotifications.requestPermissions).toHaveBeenCalled();
    });

    it('should throw error if permissions denied', async () => {
      mockPushNotifications.checkPermissions.mockResolvedValue({
        receive: 'denied'
      });
      
      await expect(pushNotificationManager.initialize()).rejects.toThrow(
        'Push notification permission denied'
      );
    });

    it('should not initialize twice', async () => {
      await pushNotificationManager.initialize();
      const result = await pushNotificationManager.initialize();
      
      expect(result).toBe(true);
      expect(mockPushNotifications.register).toHaveBeenCalledTimes(1);
    });

    it('should return false on web platform', async () => {
      mockCapacitor.getPlatform.mockReturnValue('web');
      
      const result = await pushNotificationManager.initialize();
      
      expect(result).toBe(false);
      expect(mockPushNotifications.register).not.toHaveBeenCalled();
    });

    it('should setup listeners after registration', async () => {
      await pushNotificationManager.initialize();
      
      expect(mockPushNotifications.addListener).toHaveBeenCalledWith(
        'registration',
        expect.any(Function)
      );
      
      expect(mockPushNotifications.addListener).toHaveBeenCalledWith(
        'registrationError',
        expect.any(Function)
      );
      
      expect(mockPushNotifications.addListener).toHaveBeenCalledWith(
        'pushNotificationReceived',
        expect.any(Function)
      );
      
      expect(mockPushNotifications.addListener).toHaveBeenCalledWith(
        'pushNotificationActionPerformed',
        expect.any(Function)
      );
    });
  });

  describe('saveTokenToServer()', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should save FCM token to server', async () => {
      await pushNotificationManager.initialize();
      
      // Simulate token registration
      const registrationListener = mockPushNotifications.addListener.mock.calls
        .find(call => call[0] === 'registration')[1];
      
      await registrationListener({ value: 'test-fcm-token' });
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v2/devices/register'),
        expect.objectContaining({
          fcmToken: 'test-fcm-token',
          platform: 'android',
          deviceId: 'test-device-id'
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );
    });

    it('should not save token if no auth token', async () => {
      localStorage.clear();
      
      await pushNotificationManager.initialize();
      
      const registrationListener = mockPushNotifications.addListener.mock.calls
        .find(call => call[0] === 'registration')[1];
      
      await registrationListener({ value: 'test-fcm-token' });
      
      expect(axios.post).not.toHaveBeenCalled();
    });

    it('should handle server errors gracefully', async () => {
      axios.post.mockRejectedValue(new Error('Server error'));
      
      await pushNotificationManager.initialize();
      
      const registrationListener = mockPushNotifications.addListener.mock.calls
        .find(call => call[0] === 'registration')[1];
      
      // Should not throw
      await expect(
        registrationListener({ value: 'test-fcm-token' })
      ).resolves.not.toThrow();
    });
  });

  describe('handleNotification()', () => {
    it('should handle foreground notifications', async () => {
      await pushNotificationManager.initialize();
      
      const notificationListener = mockPushNotifications.addListener.mock.calls
        .find(call => call[0] === 'pushNotificationReceived')[1];
      
      const notification = {
        title: 'Test Notification',
        body: 'Test Body',
        data: { type: 'exam_published' }
      };
      
      // Should not throw
      expect(() => notificationListener(notification)).not.toThrow();
    });

    it('should execute custom handler if registered', async () => {
      const customHandler = vi.fn();
      pushNotificationManager.registerNotificationHandler('exam_published', customHandler);
      
      await pushNotificationManager.initialize();
      
      const notificationListener = mockPushNotifications.addListener.mock.calls
        .find(call => call[0] === 'pushNotificationReceived')[1];
      
      const notification = {
        title: 'Exam Published',
        body: 'New exam available',
        data: { type: 'exam_published', examId: '123' }
      };
      
      notificationListener(notification);
      
      expect(customHandler).toHaveBeenCalledWith(notification);
    });
  });

  describe('handleNotificationAction()', () => {
    it('should handle notification tap actions', async () => {
      await pushNotificationManager.initialize();
      
      const actionListener = mockPushNotifications.addListener.mock.calls
        .find(call => call[0] === 'pushNotificationActionPerformed')[1];
      
      const action = {
        actionId: 'tap',
        notification: {
          data: { type: 'exam_published', examId: '123' }
        }
      };
      
      // Should not throw
      expect(() => actionListener(action)).not.toThrow();
    });

    it('should execute custom handler on action', async () => {
      const customHandler = vi.fn();
      pushNotificationManager.registerNotificationHandler('payment_reminder', customHandler);
      
      await pushNotificationManager.initialize();
      
      const actionListener = mockPushNotifications.addListener.mock.calls
        .find(call => call[0] === 'pushNotificationActionPerformed')[1];
      
      const action = {
        actionId: 'tap',
        notification: {
          data: { type: 'payment_reminder' }
        }
      };
      
      actionListener(action);
      
      expect(customHandler).toHaveBeenCalled();
    });
  });

  describe('registerNotificationHandler()', () => {
    it('should register custom notification handler', () => {
      const handler = vi.fn();
      
      pushNotificationManager.registerNotificationHandler('test_type', handler);
      
      expect(pushNotificationManager.notificationHandlers.has('test_type')).toBe(true);
    });

    it('should unregister notification handler', () => {
      const handler = vi.fn();
      
      pushNotificationManager.registerNotificationHandler('test_type', handler);
      pushNotificationManager.unregisterNotificationHandler('test_type');
      
      expect(pushNotificationManager.notificationHandlers.has('test_type')).toBe(false);
    });
  });

  describe('getCurrentToken()', () => {
    it('should return null initially', () => {
      expect(pushNotificationManager.getCurrentToken()).toBeNull();
    });

    it('should return token after registration', async () => {
      await pushNotificationManager.initialize();
      
      const registrationListener = mockPushNotifications.addListener.mock.calls
        .find(call => call[0] === 'registration')[1];
      
      await registrationListener({ value: 'test-fcm-token' });
      
      expect(pushNotificationManager.getCurrentToken()).toBe('test-fcm-token');
    });
  });

  describe('isSupported()', () => {
    it('should return true on Android', () => {
      mockCapacitor.getPlatform.mockReturnValue('android');
      expect(pushNotificationManager.isSupported()).toBe(true);
    });

    it('should return true on iOS', () => {
      mockCapacitor.getPlatform.mockReturnValue('ios');
      expect(pushNotificationManager.isSupported()).toBe(true);
    });

    it('should return false on web', () => {
      mockCapacitor.getPlatform.mockReturnValue('web');
      expect(pushNotificationManager.isSupported()).toBe(false);
    });
  });

  describe('removeTokenFromServer()', () => {
    beforeEach(() => {
      localStorage.setItem('authToken', 'test-token');
    });

    afterEach(() => {
      localStorage.clear();
    });

    it('should remove FCM token from server', async () => {
      pushNotificationManager.currentToken = 'test-fcm-token';
      
      await pushNotificationManager.removeTokenFromServer();
      
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/v2/devices/unregister'),
        expect.objectContaining({
          fcmToken: 'test-fcm-token'
        }),
        expect.any(Object)
      );
      
      expect(pushNotificationManager.currentToken).toBeNull();
    });

    it('should not call API if no token', async () => {
      pushNotificationManager.currentToken = null;
      
      await pushNotificationManager.removeTokenFromServer();
      
      expect(axios.post).not.toHaveBeenCalled();
    });
  });

  describe('cleanup()', () => {
    it('should remove all listeners and clean up', async () => {
      await pushNotificationManager.initialize();
      pushNotificationManager.registerNotificationHandler('test', vi.fn());
      
      await pushNotificationManager.cleanup();
      
      expect(mockPushNotifications.removeAllListeners).toHaveBeenCalled();
      expect(pushNotificationManager.isInitialized).toBe(false);
      expect(pushNotificationManager.notificationHandlers.size).toBe(0);
    });
  });

  describe('getDeliveryChannels()', () => {
    it('should return channels on Android', async () => {
      mockCapacitor.getPlatform.mockReturnValue('android');
      mockPushNotifications.listChannels.mockResolvedValue({
        channels: [
          { id: 'default', name: 'Default' },
          { id: 'exams', name: 'Exams' }
        ]
      });
      
      const result = await pushNotificationManager.getDeliveryChannels();
      
      expect(result.channels).toHaveLength(2);
      expect(mockPushNotifications.listChannels).toHaveBeenCalled();
    });

    it('should return empty array on non-Android', async () => {
      mockCapacitor.getPlatform.mockReturnValue('ios');
      
      const result = await pushNotificationManager.getDeliveryChannels();
      
      expect(result.channels).toEqual([]);
      expect(mockPushNotifications.listChannels).not.toHaveBeenCalled();
    });
  });
});

describe('Integration Tests', () => {
  it('should complete full initialization flow', async () => {
    localStorage.setItem('authToken', 'test-token');
    
    // Initialize
    const initResult = await pushNotificationManager.initialize();
    expect(initResult).toBe(true);
    
    // Simulate token registration
    const registrationListener = mockPushNotifications.addListener.mock.calls
      .find(call => call[0] === 'registration')[1];
    await registrationListener({ value: 'test-fcm-token' });
    
    // Verify token saved
    expect(pushNotificationManager.getCurrentToken()).toBe('test-fcm-token');
    expect(axios.post).toHaveBeenCalled();
    
    // Simulate notification received
    const notificationListener = mockPushNotifications.addListener.mock.calls
      .find(call => call[0] === 'pushNotificationReceived')[1];
    notificationListener({
      title: 'Test',
      body: 'Test',
      data: { type: 'test' }
    });
    
    // Cleanup
    await pushNotificationManager.cleanup();
    expect(pushNotificationManager.isInitialized).toBe(false);
    
    localStorage.clear();
  });
});
