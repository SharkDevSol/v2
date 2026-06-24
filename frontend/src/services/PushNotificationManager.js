/**
 * Push Notification Manager for Mobile Apps
 * 
 * Handles Firebase Cloud Messaging (FCM) integration for push notifications
 * in Capacitor-based mobile applications (Staff, Student, Guardian, Super Admin).
 * 
 * Features:
 * - FCM token registration and management
 * - Push notification listeners (foreground and background)
 * - Notification action handling with deep linking
 * - Android notification channels configuration
 * - Multi-device support
 * 
 * @module PushNotificationManager
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { Device } from '@capacitor/device';
import API_CONFIG from '../config/api.config';
import axios from 'axios';
import { configureNotificationChannels, getChannelForNotificationType } from './NotificationChannels';

class PushNotificationManager {
  constructor() {
    this.isInitialized = false;
    this.currentToken = null;
    this.notificationHandlers = new Map();
    this.platform = Capacitor.getPlatform();
  }

  /**
   * Initialize push notification system
   * - Requests permissions
   * - Registers with FCM
   * - Sets up listeners
   * - Saves token to server
   * 
   * @returns {Promise<boolean>} Success status
   * @throws {Error} If permission denied or initialization fails
   */
  async initialize() {
    if (this.isInitialized) {
      console.log('PushNotificationManager already initialized');
      return true;
    }

    // Only initialize on mobile platforms
    if (this.platform === 'web') {
      console.log('Push notifications not supported on web platform');
      return false;
    }

    try {
      // Step 1: Check and request permissions
      let permStatus = await PushNotifications.checkPermissions();
      console.log('Current permission status:', permStatus);

      if (permStatus.receive === 'prompt') {
        console.log('Requesting push notification permissions...');
        permStatus = await PushNotifications.requestPermissions();
      }

      if (permStatus.receive !== 'granted') {
        throw new Error('Push notification permission denied by user');
      }

      console.log('Push notification permissions granted');

      // Step 2: Register with FCM
      await PushNotifications.register();
      console.log('Registered with FCM');

      // Step 3: Configure notification channels (Android only)
      if (this.platform === 'android') {
        await configureNotificationChannels();
        console.log('Notification channels configured');
      }

      // Step 4: Set up listeners
      this.setupListeners();

      this.isInitialized = true;
      console.log('PushNotificationManager initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize PushNotificationManager:', error);
      throw error;
    }
  }

  /**
   * Set up all push notification event listeners
   * - Registration success/error
   * - Notification received (foreground)
   * - Notification action performed (tap)
   * 
   * @private
   */
  setupListeners() {
    // Listen for successful registration
    PushNotifications.addListener('registration', async (token) => {
      console.log('Push registration success, token:', token.value);
      this.currentToken = token.value;
      await this.saveTokenToServer(token.value);
    });

    // Listen for registration errors
    PushNotifications.addListener('registrationError', (error) => {
      console.error('Error on registration:', JSON.stringify(error));
    });

    // Listen for push notifications received while app is in foreground
    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('Push notification received:', JSON.stringify(notification));
      this.handleNotification(notification);
    });

    // Listen for notification actions (user tapped notification)
    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('Push notification action performed:', JSON.stringify(notification));
      this.handleNotificationAction(notification);
    });

    console.log('Push notification listeners set up');
  }

  /**
   * Save FCM token to backend server
   * Registers device with user account for multi-device support
   * 
   * @param {string} token - FCM registration token
   * @returns {Promise<void>}
   * @private
   */
  async saveTokenToServer(token) {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        console.warn('No auth token found, cannot save FCM token to server');
        return;
      }

      const deviceInfo = await Device.getInfo();
      const deviceId = await Device.getId();

      const response = await axios.post(
        `${API_CONFIG.baseURL}/api/v2/devices/register`,
        {
          fcmToken: token,
          platform: this.platform,
          deviceId: deviceId.identifier,
          deviceModel: deviceInfo.model,
          osVersion: deviceInfo.osVersion,
          appVersion: deviceInfo.appVersion || '2.0.0'
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('FCM token saved to server:', response.data);
    } catch (error) {
      console.error('Failed to save FCM token to server:', error);
      // Don't throw - token will be saved on next app launch
    }
  }

  /**
   * Handle notification received while app is in foreground
   * Shows local notification to user
   * 
   * @param {Object} notification - Notification payload
   * @param {string} notification.title - Notification title
   * @param {string} notification.body - Notification body
   * @param {Object} notification.data - Custom data payload
   * @private
   */
  handleNotification(notification) {
    const { title, body, data } = notification;

    console.log('Handling foreground notification:', { title, body, data });

    // Execute custom handler if registered
    const notificationType = data?.type;
    if (notificationType && this.notificationHandlers.has(notificationType)) {
      const handler = this.notificationHandlers.get(notificationType);
      handler(notification);
    }

    // Show notification banner (Android will handle this automatically)
    // For iOS, you might need to show a local notification here
  }

  /**
   * Handle notification action (user tapped notification)
   * Performs deep linking based on notification type
   * 
   * @param {Object} actionPerformed - Action performed object
   * @param {Object} actionPerformed.notification - Notification that was tapped
   * @param {string} actionPerformed.actionId - Action identifier
   * @private
   */
  handleNotificationAction(actionPerformed) {
    const { notification, actionId } = actionPerformed;
    const data = notification.data;

    console.log('Handling notification action:', { actionId, data });

    // Navigate based on notification type
    const notificationType = data?.type;
    
    switch (notificationType) {
      case 'exam_published':
        this.navigateToExams(data);
        break;
      
      case 'exam_result':
        this.navigateToExamResults(data);
        break;
      
      case 'report_card':
        this.navigateToReportCard(data);
        break;
      
      case 'payment_reminder':
        this.navigateToPayments(data);
        break;
      
      case 'absence_alert':
        this.navigateToAttendance(data);
        break;
      
      case 'announcement':
        this.navigateToPosts(data);
        break;
      
      case 'message':
        this.navigateToMessages(data);
        break;
      
      default:
        this.navigateToNotifications();
    }

    // Execute custom handler if registered
    if (notificationType && this.notificationHandlers.has(notificationType)) {
      const handler = this.notificationHandlers.get(notificationType);
      handler(notification);
    }
  }

  /**
   * Register custom notification handler for specific notification type
   * 
   * @param {string} type - Notification type (e.g., 'exam_published')
   * @param {Function} handler - Handler function to execute
   */
  registerNotificationHandler(type, handler) {
    this.notificationHandlers.set(type, handler);
    console.log(`Registered notification handler for type: ${type}`);
  }

  /**
   * Unregister notification handler
   * 
   * @param {string} type - Notification type
   */
  unregisterNotificationHandler(type) {
    this.notificationHandlers.delete(type);
    console.log(`Unregistered notification handler for type: ${type}`);
  }

  /**
   * Get current FCM token
   * 
   * @returns {string|null} Current FCM token or null if not registered
   */
  getCurrentToken() {
    return this.currentToken;
  }

  /**
   * Check if push notifications are supported on current platform
   * 
   * @returns {boolean} True if supported
   */
  isSupported() {
    return this.platform !== 'web';
  }

  /**
   * Get notification delivery channels (for debugging)
   * 
   * @returns {Promise<Object>} Channel information
   */
  async getDeliveryChannels() {
    if (this.platform !== 'android') {
      return { channels: [] };
    }

    try {
      const channels = await PushNotifications.listChannels();
      return channels;
    } catch (error) {
      console.error('Failed to get notification channels:', error);
      return { channels: [] };
    }
  }

  // Navigation methods (to be implemented based on app routing)
  
  navigateToExams(data) {
    console.log('Navigate to exams:', data);
    // Implementation depends on app's routing system
    // Example: window.location.href = '/exams';
    // Or: router.push('/exams');
  }

  navigateToExamResults(data) {
    console.log('Navigate to exam results:', data);
    // Implementation depends on app's routing system
  }

  navigateToReportCard(data) {
    console.log('Navigate to report card:', data);
    // Implementation depends on app's routing system
  }

  navigateToPayments(data) {
    console.log('Navigate to payments:', data);
    // Implementation depends on app's routing system
  }

  navigateToAttendance(data) {
    console.log('Navigate to attendance:', data);
    // Implementation depends on app's routing system
  }

  navigateToPosts(data) {
    console.log('Navigate to posts:', data);
    // Implementation depends on app's routing system
  }

  navigateToMessages(data) {
    console.log('Navigate to messages:', data);
    // Implementation depends on app's routing system
  }

  navigateToNotifications() {
    console.log('Navigate to notifications');
    // Implementation depends on app's routing system
  }

  /**
   * Remove FCM token from server (on logout)
   * 
   * @returns {Promise<void>}
   */
  async removeTokenFromServer() {
    try {
      const authToken = localStorage.getItem('authToken');
      if (!authToken || !this.currentToken) {
        return;
      }

      await axios.post(
        `${API_CONFIG.baseURL}/api/v2/devices/unregister`,
        {
          fcmToken: this.currentToken
        },
        {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('FCM token removed from server');
      this.currentToken = null;
    } catch (error) {
      console.error('Failed to remove FCM token from server:', error);
    }
  }

  /**
   * Clean up and remove all listeners
   * Call this on app unmount or logout
   */
  async cleanup() {
    try {
      await PushNotifications.removeAllListeners();
      await this.removeTokenFromServer();
      this.isInitialized = false;
      this.notificationHandlers.clear();
      console.log('PushNotificationManager cleaned up');
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Export singleton instance
const pushNotificationManager = new PushNotificationManager();
export default pushNotificationManager;
