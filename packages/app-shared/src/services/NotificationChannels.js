/**
 * Android Notification Channels Configuration
 * 
 * Defines notification channels for Android 8.0+ (API level 26+)
 * Channels allow users to control notification behavior per category
 * 
 * @module NotificationChannels
 */

import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';

/**
 * Notification channel definitions
 * Each channel represents a category of notifications with specific behavior
 */
export const NOTIFICATION_CHANNELS = {
  DEFAULT: {
    id: 'default',
    name: 'General Notifications',
    description: 'General school notifications and announcements',
    importance: 4, // High importance
    visibility: 1, // Public
    sound: 'default',
    vibration: true,
    lights: true,
    lightColor: '#488AFF'
  },
  
  EXAMS: {
    id: 'exams',
    name: 'Exams & Assessments',
    description: 'Notifications about exams, tests, and assessment results',
    importance: 5, // Max importance (heads-up notification)
    visibility: 1, // Public
    sound: 'exam_notification',
    vibration: true,
    lights: true,
    lightColor: '#FF4444'
  },
  
  ATTENDANCE: {
    id: 'attendance',
    name: 'Attendance Alerts',
    description: 'Daily attendance reports and absence alerts',
    importance: 4, // High importance
    visibility: 1, // Public
    sound: 'default',
    vibration: true,
    lights: true,
    lightColor: '#FFA500'
  },
  
  PAYMENTS: {
    id: 'payments',
    name: 'Payment Reminders',
    description: 'Monthly payment reminders and financial notifications',
    importance: 4, // High importance
    visibility: 1, // Public
    sound: 'payment_reminder',
    vibration: true,
    lights: true,
    lightColor: '#4CAF50'
  },
  
  REPORT_CARDS: {
    id: 'report_cards',
    name: 'Report Cards',
    description: 'Academic report cards and performance reports',
    importance: 4, // High importance
    visibility: 1, // Public
    sound: 'default',
    vibration: true,
    lights: true,
    lightColor: '#2196F3'
  },
  
  MESSAGES: {
    id: 'messages',
    name: 'Messages',
    description: 'Direct messages from teachers and administrators',
    importance: 4, // High importance
    visibility: 1, // Public
    sound: 'message_tone',
    vibration: true,
    lights: true,
    lightColor: '#9C27B0'
  },
  
  ANNOUNCEMENTS: {
    id: 'announcements',
    name: 'Announcements',
    description: 'School announcements and posts',
    importance: 3, // Default importance
    visibility: 1, // Public
    sound: 'default',
    vibration: false,
    lights: true,
    lightColor: '#607D8B'
  },
  
  SILENT: {
    id: 'silent',
    name: 'Silent Notifications',
    description: 'Low priority notifications without sound or vibration',
    importance: 2, // Low importance
    visibility: 0, // Private
    sound: null,
    vibration: false,
    lights: false
  }
};

/**
 * Importance levels for Android notification channels
 * Based on NotificationManager importance constants
 */
export const IMPORTANCE_LEVELS = {
  NONE: 0,      // No notification
  MIN: 1,       // Shows in shade, no sound/vibration
  LOW: 2,       // Shows in shade, no sound/vibration
  DEFAULT: 3,   // Shows everywhere, makes sound
  HIGH: 4,      // Shows everywhere, makes sound, may peek
  MAX: 5        // Shows everywhere, makes sound, always peeks
};

/**
 * Visibility levels for Android notification channels
 */
export const VISIBILITY_LEVELS = {
  SECRET: -1,   // Not shown on lock screen
  PRIVATE: 0,   // Shows on lock screen but hides sensitive content
  PUBLIC: 1     // Shows full content on lock screen
};

/**
 * Configure all notification channels for Android
 * Should be called once during app initialization
 * 
 * @returns {Promise<void>}
 */
export async function configureNotificationChannels() {
  const platform = Capacitor.getPlatform();
  
  // Notification channels are Android-only (API 26+)
  if (platform !== 'android') {
    console.log('Notification channels not needed on', platform);
    return;
  }

  try {
    console.log('Configuring notification channels for Android...');

    // Create all defined channels
    for (const [key, channel] of Object.entries(NOTIFICATION_CHANNELS)) {
      await createNotificationChannel(channel);
      console.log(`Created notification channel: ${channel.name} (${channel.id})`);
    }

    console.log('All notification channels configured successfully');
  } catch (error) {
    console.error('Failed to configure notification channels:', error);
    throw error;
  }
}

/**
 * Create a single notification channel
 * 
 * @param {Object} channelConfig - Channel configuration
 * @returns {Promise<void>}
 * @private
 */
async function createNotificationChannel(channelConfig) {
  try {
    await PushNotifications.createChannel({
      id: channelConfig.id,
      name: channelConfig.name,
      description: channelConfig.description,
      importance: channelConfig.importance,
      visibility: channelConfig.visibility,
      sound: channelConfig.sound,
      vibration: channelConfig.vibration,
      lights: channelConfig.lights,
      lightColor: channelConfig.lightColor
    });
  } catch (error) {
    console.error(`Failed to create channel ${channelConfig.id}:`, error);
    // Don't throw - continue with other channels
  }
}

/**
 * Get channel ID for a notification type
 * Maps notification types to appropriate channels
 * 
 * @param {string} notificationType - Type of notification
 * @returns {string} Channel ID
 */
export function getChannelForNotificationType(notificationType) {
  const channelMap = {
    'exam_published': NOTIFICATION_CHANNELS.EXAMS.id,
    'exam_result': NOTIFICATION_CHANNELS.EXAMS.id,
    'exam_repeat': NOTIFICATION_CHANNELS.EXAMS.id,
    'report_card': NOTIFICATION_CHANNELS.REPORT_CARDS.id,
    'payment_reminder': NOTIFICATION_CHANNELS.PAYMENTS.id,
    'payment_received': NOTIFICATION_CHANNELS.PAYMENTS.id,
    'absence_alert': NOTIFICATION_CHANNELS.ATTENDANCE.id,
    'attendance_report': NOTIFICATION_CHANNELS.ATTENDANCE.id,
    'message': NOTIFICATION_CHANNELS.MESSAGES.id,
    'announcement': NOTIFICATION_CHANNELS.ANNOUNCEMENTS.id,
    'post': NOTIFICATION_CHANNELS.ANNOUNCEMENTS.id,
    'silent': NOTIFICATION_CHANNELS.SILENT.id
  };

  return channelMap[notificationType] || NOTIFICATION_CHANNELS.DEFAULT.id;
}

/**
 * List all configured notification channels
 * Useful for debugging and user settings
 * 
 * @returns {Promise<Array>} List of channels
 */
export async function listNotificationChannels() {
  const platform = Capacitor.getPlatform();
  
  if (platform !== 'android') {
    return [];
  }

  try {
    const result = await PushNotifications.listChannels();
    return result.channels || [];
  } catch (error) {
    console.error('Failed to list notification channels:', error);
    return [];
  }
}

/**
 * Delete a notification channel
 * Note: On Android, users can recreate deleted channels
 * 
 * @param {string} channelId - Channel ID to delete
 * @returns {Promise<void>}
 */
export async function deleteNotificationChannel(channelId) {
  const platform = Capacitor.getPlatform();
  
  if (platform !== 'android') {
    return;
  }

  try {
    await PushNotifications.deleteChannel({ id: channelId });
    console.log(`Deleted notification channel: ${channelId}`);
  } catch (error) {
    console.error(`Failed to delete channel ${channelId}:`, error);
    throw error;
  }
}

/**
 * Check if a notification channel exists
 * 
 * @param {string} channelId - Channel ID to check
 * @returns {Promise<boolean>} True if channel exists
 */
export async function channelExists(channelId) {
  const channels = await listNotificationChannels();
  return channels.some(channel => channel.id === channelId);
}

/**
 * Update notification channel (by recreating it)
 * Note: Some properties cannot be changed after creation on Android
 * 
 * @param {Object} channelConfig - New channel configuration
 * @returns {Promise<void>}
 */
export async function updateNotificationChannel(channelConfig) {
  const platform = Capacitor.getPlatform();
  
  if (platform !== 'android') {
    return;
  }

  try {
    // Delete existing channel
    await deleteNotificationChannel(channelConfig.id);
    
    // Create new channel with updated config
    await createNotificationChannel(channelConfig);
    
    console.log(`Updated notification channel: ${channelConfig.id}`);
  } catch (error) {
    console.error(`Failed to update channel ${channelConfig.id}:`, error);
    throw error;
  }
}

export default {
  NOTIFICATION_CHANNELS,
  IMPORTANCE_LEVELS,
  VISIBILITY_LEVELS,
  configureNotificationChannels,
  getChannelForNotificationType,
  listNotificationChannels,
  deleteNotificationChannel,
  channelExists,
  updateNotificationChannel
};
