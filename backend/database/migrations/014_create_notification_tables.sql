-- Migration 014: Create notification system tables
-- Supports push notifications, Telegram, and SMS with device tracking

-- UP

-- Add columns to user_devices if they don't exist (table might already exist from 013_create_user_devices_table.sql)
ALTER TABLE user_devices ADD COLUMN IF NOT EXISTS fcm_token TEXT;
ALTER TABLE user_devices ADD COLUMN IF NOT EXISTS platform VARCHAR(20);

-- Create user devices table (for push notifications) - only creates if not exists
CREATE TABLE IF NOT EXISTS user_devices (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL, -- Can reference students, staff, or guardians
  user_type VARCHAR(20) NOT NULL, -- 'student', 'staff', 'guardian'
  device_id VARCHAR(255) UNIQUE NOT NULL,
  fcm_token TEXT, -- Firebase Cloud Messaging token
  platform VARCHAR(20), -- 'android', 'ios', 'web', 'desktop'
  device_name VARCHAR(100),
  is_active BOOLEAN DEFAULT TRUE,
  last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_user_type CHECK (user_type IN ('student', 'staff', 'guardian')),
  CONSTRAINT check_platform CHECK (platform IN ('android', 'ios', 'web', 'desktop'))
);

-- Create notification log table
CREATE TABLE IF NOT EXISTS notification_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL, -- 'payment_reminder', 'absence_alert', 'exam_published', 'report_card', 'announcement'
  title VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  channels JSONB NOT NULL, -- ['push', 'telegram', 'sms']
  delivery_status JSONB, -- {push: 'success', telegram: 'failed', sms: 'success'}
  payload JSONB, -- Additional data for the notification
  sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  CONSTRAINT check_notification_user_type CHECK (user_type IN ('student', 'staff', 'guardian'))
);

-- Create notification preferences table
CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  user_type VARCHAR(20) NOT NULL,
  notification_type VARCHAR(50) NOT NULL,
  enabled_channels JSONB DEFAULT '["push"]', -- ['push', 'telegram', 'sms']
  is_enabled BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT check_pref_user_type CHECK (user_type IN ('student', 'staff', 'guardian')),
  UNIQUE(user_id, user_type, notification_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_devices_user ON user_devices(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_user_devices_fcm ON user_devices(fcm_token);
CREATE INDEX IF NOT EXISTS idx_user_devices_active ON user_devices(is_active);

CREATE INDEX IF NOT EXISTS idx_notification_log_user ON notification_log(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(notification_type);
CREATE INDEX IF NOT EXISTS idx_notification_log_sent ON notification_log(sent_at);
CREATE INDEX IF NOT EXISTS idx_notification_log_read ON notification_log(is_read);

CREATE INDEX IF NOT EXISTS idx_notification_prefs_user ON notification_preferences(user_id, user_type);
CREATE INDEX IF NOT EXISTS idx_notification_prefs_type ON notification_preferences(notification_type);

-- Add triggers to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_devices_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_devices_timestamp
BEFORE UPDATE ON user_devices
FOR EACH ROW
EXECUTE FUNCTION update_user_devices_timestamp();

CREATE OR REPLACE FUNCTION update_notification_prefs_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_prefs_timestamp
BEFORE UPDATE ON notification_preferences
FOR EACH ROW
EXECUTE FUNCTION update_notification_prefs_timestamp();

-- Add trigger to update last_active on device updates
CREATE OR REPLACE FUNCTION update_device_last_active()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_active = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_device_last_active
BEFORE UPDATE ON user_devices
FOR EACH ROW
WHEN (OLD.fcm_token IS DISTINCT FROM NEW.fcm_token OR OLD.is_active IS DISTINCT FROM NEW.is_active)
EXECUTE FUNCTION update_device_last_active();

COMMENT ON TABLE user_devices IS 'Stores user device information for push notifications';
COMMENT ON COLUMN user_devices.user_type IS 'Type of user: student, staff, or guardian';
COMMENT ON COLUMN user_devices.fcm_token IS 'Firebase Cloud Messaging token for push notifications';
COMMENT ON COLUMN user_devices.platform IS 'Device platform: android, ios, web, desktop';

COMMENT ON TABLE notification_log IS 'Logs all notifications sent to users across all channels';
COMMENT ON COLUMN notification_log.notification_type IS 'Type of notification: payment_reminder, absence_alert, exam_published, report_card, announcement';
COMMENT ON COLUMN notification_log.channels IS 'JSON array of channels used: [push, telegram, sms]';
COMMENT ON COLUMN notification_log.delivery_status IS 'JSON object with delivery status per channel: {push: success, telegram: failed, sms: success}';
COMMENT ON COLUMN notification_log.payload IS 'Additional data for the notification (e.g., studentId, examId)';

COMMENT ON TABLE notification_preferences IS 'Stores user preferences for notification channels per notification type';
COMMENT ON COLUMN notification_preferences.enabled_channels IS 'JSON array of enabled channels: [push, telegram, sms]';

-- DOWN
DROP TRIGGER IF EXISTS trigger_update_device_last_active ON user_devices;
DROP FUNCTION IF EXISTS update_device_last_active();
DROP TRIGGER IF EXISTS trigger_update_notification_prefs_timestamp ON notification_preferences;
DROP FUNCTION IF EXISTS update_notification_prefs_timestamp();
DROP TRIGGER IF EXISTS trigger_update_user_devices_timestamp ON user_devices;
DROP FUNCTION IF EXISTS update_user_devices_timestamp();

DROP INDEX IF EXISTS idx_notification_prefs_type;
DROP INDEX IF EXISTS idx_notification_prefs_user;
DROP INDEX IF EXISTS idx_notification_log_read;
DROP INDEX IF EXISTS idx_notification_log_sent;
DROP INDEX IF EXISTS idx_notification_log_type;
DROP INDEX IF EXISTS idx_notification_log_user;
DROP INDEX IF EXISTS idx_user_devices_active;
DROP INDEX IF EXISTS idx_user_devices_fcm;
DROP INDEX IF EXISTS idx_user_devices_user;

DROP TABLE IF EXISTS notification_preferences;
DROP TABLE IF EXISTS notification_log;
DROP TABLE IF EXISTS user_devices;
