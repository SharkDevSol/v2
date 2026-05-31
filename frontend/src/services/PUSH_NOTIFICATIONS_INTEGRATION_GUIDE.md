# Push Notifications Integration Guide

## Overview

This guide explains how to integrate push notifications into the Skoolific V2 mobile apps (Staff, Student, Guardian, Super Admin) using the PushNotificationManager service.

## Phase 5.2 Implementation Status

### ✅ Completed Tasks

- **5.2.1** ✅ Create PushNotificationManager class for mobile apps
- **5.2.2** ✅ Implement initialize() method with permission request
- **5.2.3** ✅ Implement FCM token registration
- **5.2.4** ✅ Implement saveTokenToServer() method
- **5.2.5** ✅ Add push notification listeners (received, action performed)
- **5.2.6** ✅ Implement handleNotification() for foreground notifications
- **5.2.7** ✅ Implement handleNotificationAction() for navigation
- **5.2.9** ✅ Configure notification channels for Android

### ⏳ Remaining Tasks

- **5.2.8** ⏳ Test push notifications on Android devices
- **5.2.10** ⏳ Test notification actions and deep linking

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│              Mobile App (Capacitor)                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  PushNotificationManager                           │ │
│  │  - Initialize FCM                                  │ │
│  │  - Request permissions                             │ │
│  │  - Register token                                  │ │
│  │  - Handle notifications                            │ │
│  │  - Deep linking                                    │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                              │
│                          ▼                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │  NotificationChannels (Android)                    │ │
│  │  - Exams & Assessments                             │ │
│  │  - Attendance Alerts                               │ │
│  │  - Payment Reminders                               │ │
│  │  - Report Cards                                    │ │
│  │  - Messages                                        │ │
│  │  - Announcements                                   │ │
│  └────────────────────────────────────────────────────┘ │
│                          │                              │
└──────────────────────────┼──────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Firebase Cloud        │
              │  Messaging (FCM)       │
              └────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │  Backend API           │
              │  /api/v2/devices/*     │
              └────────────────────────┘
```

## Installation

### 1. Install Required Packages

```bash
npm install @capacitor/push-notifications @capacitor/device
```

### 2. Configure Capacitor

Update `capacitor.config.ts`:

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.skoolific.staff', // or student, guardian, superadmin
  appName: 'Skoolific Staff',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
```

### 3. Android Configuration

#### google-services.json

Place your Firebase `google-services.json` file in:
```
android/app/google-services.json
```

#### AndroidManifest.xml

Add permissions (usually auto-added by Capacitor):

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
<uses-permission android:name="android.permission.INTERNET" />
```

#### build.gradle

Ensure Firebase dependencies are included:

```gradle
dependencies {
    implementation 'com.google.firebase:firebase-messaging:23.0.0'
}
```

## Usage

### Basic Integration

#### 1. Initialize in App Entry Point

```javascript
// In App.jsx or main.jsx
import { useEffect } from 'react';
import pushNotificationManager from './services/PushNotificationManager';

function App() {
  useEffect(() => {
    // Initialize push notifications on app start
    const initPushNotifications = async () => {
      try {
        await pushNotificationManager.initialize();
        console.log('Push notifications initialized');
      } catch (error) {
        console.error('Failed to initialize push notifications:', error);
      }
    };

    initPushNotifications();

    // Cleanup on unmount
    return () => {
      pushNotificationManager.cleanup();
    };
  }, []);

  return (
    <div className="app">
      {/* Your app content */}
    </div>
  );
}

export default App;
```

#### 2. Initialize After Login

```javascript
// In Login component or authentication flow
import pushNotificationManager from '../services/PushNotificationManager';

async function handleLogin(credentials) {
  try {
    // Perform login
    const response = await loginAPI(credentials);
    
    // Save auth token
    localStorage.setItem('authToken', response.token);
    
    // Initialize push notifications
    await pushNotificationManager.initialize();
    
    // Navigate to home
    navigate('/home');
  } catch (error) {
    console.error('Login failed:', error);
  }
}
```

#### 3. Cleanup on Logout

```javascript
// In Logout handler
import pushNotificationManager from '../services/PushNotificationManager';

async function handleLogout() {
  try {
    // Remove FCM token from server
    await pushNotificationManager.removeTokenFromServer();
    
    // Cleanup listeners
    await pushNotificationManager.cleanup();
    
    // Clear auth token
    localStorage.removeItem('authToken');
    
    // Navigate to login
    navigate('/login');
  } catch (error) {
    console.error('Logout failed:', error);
  }
}
```

### Custom Notification Handlers

Register custom handlers for specific notification types:

```javascript
import pushNotificationManager from './services/PushNotificationManager';

// Register handler for exam notifications
pushNotificationManager.registerNotificationHandler('exam_published', (notification) => {
  console.log('Exam published:', notification);
  
  // Show custom UI
  showExamAlert(notification.data);
  
  // Play custom sound
  playExamSound();
  
  // Update badge count
  updateBadgeCount();
});

// Register handler for payment reminders
pushNotificationManager.registerNotificationHandler('payment_reminder', (notification) => {
  console.log('Payment reminder:', notification);
  
  // Show payment dialog
  showPaymentDialog(notification.data);
});
```

### Deep Linking Implementation

Implement navigation methods in your app:

```javascript
// In App.jsx or routing configuration
import { useNavigate } from 'react-router-dom';
import pushNotificationManager from './services/PushNotificationManager';

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    // Override navigation methods with your router
    pushNotificationManager.navigateToExams = (data) => {
      navigate('/exams', { state: { examId: data.examId } });
    };

    pushNotificationManager.navigateToExamResults = (data) => {
      navigate('/exam-results', { state: { examId: data.examId } });
    };

    pushNotificationManager.navigateToReportCard = (data) => {
      navigate('/report-card', { state: { studentId: data.studentId } });
    };

    pushNotificationManager.navigateToPayments = (data) => {
      navigate('/payments');
    };

    pushNotificationManager.navigateToAttendance = (data) => {
      navigate('/attendance', { state: { date: data.date } });
    };

    pushNotificationManager.navigateToPosts = (data) => {
      navigate('/posts', { state: { postId: data.postId } });
    };

    pushNotificationManager.navigateToMessages = (data) => {
      navigate('/messages', { state: { messageId: data.messageId } });
    };

    pushNotificationManager.navigateToNotifications = () => {
      navigate('/notifications');
    };
  }, [navigate]);

  return <div className="app">{/* Your app content */}</div>;
}
```

## Notification Types

The system supports the following notification types:

| Type | Description | Channel | Deep Link |
|------|-------------|---------|-----------|
| `exam_published` | New exam available | Exams | `/exams` |
| `exam_result` | Exam results ready | Exams | `/exam-results` |
| `exam_repeat` | Exam repeat request | Exams | `/exams` |
| `report_card` | Report card available | Report Cards | `/report-card` |
| `payment_reminder` | Payment due | Payments | `/payments` |
| `payment_received` | Payment confirmed | Payments | `/payments` |
| `absence_alert` | Student absent | Attendance | `/attendance` |
| `attendance_report` | Daily attendance | Attendance | `/attendance` |
| `message` | Direct message | Messages | `/messages` |
| `announcement` | School announcement | Announcements | `/posts` |
| `post` | New post | Announcements | `/posts` |

## Android Notification Channels

The app creates the following notification channels:

### 1. Exams & Assessments
- **ID**: `exams`
- **Importance**: MAX (heads-up notification)
- **Sound**: Custom exam notification sound
- **Vibration**: Yes
- **LED**: Red (#FF4444)

### 2. Attendance Alerts
- **ID**: `attendance`
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes
- **LED**: Orange (#FFA500)

### 3. Payment Reminders
- **ID**: `payments`
- **Importance**: HIGH
- **Sound**: Custom payment reminder sound
- **Vibration**: Yes
- **LED**: Green (#4CAF50)

### 4. Report Cards
- **ID**: `report_cards`
- **Importance**: HIGH
- **Sound**: Default
- **Vibration**: Yes
- **LED**: Blue (#2196F3)

### 5. Messages
- **ID**: `messages`
- **Importance**: HIGH
- **Sound**: Custom message tone
- **Vibration**: Yes
- **LED**: Purple (#9C27B0)

### 6. Announcements
- **ID**: `announcements`
- **Importance**: DEFAULT
- **Sound**: Default
- **Vibration**: No
- **LED**: Gray (#607D8B)

### 7. Silent Notifications
- **ID**: `silent`
- **Importance**: LOW
- **Sound**: None
- **Vibration**: No
- **LED**: No

## Backend Integration

### Device Registration Endpoint

The PushNotificationManager automatically registers the device with the backend:

```
POST /api/v2/devices/register
Authorization: Bearer <token>

{
  "fcmToken": "string",
  "platform": "android",
  "deviceId": "string",
  "deviceModel": "string",
  "osVersion": "string",
  "appVersion": "string"
}
```

### Device Unregistration Endpoint

Called on logout:

```
POST /api/v2/devices/unregister
Authorization: Bearer <token>

{
  "fcmToken": "string"
}
```

## Testing

### 5.2.8: Test Push Notifications on Android Devices

#### Prerequisites
1. Android device or emulator with Google Play Services
2. Firebase project configured
3. `google-services.json` file in place
4. Backend API running with Firebase Admin SDK

#### Test Steps

1. **Build and Install App**
   ```bash
   npm run build
   npx cap sync android
   npx cap open android
   ```

2. **Test Permission Request**
   - Launch app
   - Verify permission dialog appears
   - Grant permission
   - Check logs for "Push notification permissions granted"

3. **Test Token Registration**
   - Check logs for "Push registration success, token: ..."
   - Verify token is saved to backend (check database)
   - Verify device appears in `user_devices` table

4. **Test Foreground Notifications**
   - Send test notification from Firebase Console
   - Verify notification appears while app is open
   - Check logs for "Push notification received"

5. **Test Background Notifications**
   - Close app or put in background
   - Send test notification
   - Verify notification appears in system tray
   - Tap notification
   - Verify app opens and navigates correctly

6. **Test Notification Channels**
   - Go to Android Settings > Apps > Skoolific > Notifications
   - Verify all channels are created
   - Test disabling a channel
   - Send notification to that channel
   - Verify notification is blocked

### 5.2.10: Test Notification Actions and Deep Linking

#### Test Cases

1. **Exam Published Notification**
   - Send `exam_published` notification
   - Tap notification
   - Verify app navigates to `/exams`
   - Verify exam data is passed correctly

2. **Report Card Notification**
   - Send `report_card` notification
   - Tap notification
   - Verify app navigates to `/report-card`
   - Verify student ID is passed

3. **Payment Reminder Notification**
   - Send `payment_reminder` notification
   - Tap notification
   - Verify app navigates to `/payments`

4. **Attendance Alert Notification**
   - Send `absence_alert` notification
   - Tap notification
   - Verify app navigates to `/attendance`
   - Verify date is passed

5. **Message Notification**
   - Send `message` notification
   - Tap notification
   - Verify app navigates to `/messages`
   - Verify message ID is passed

## Troubleshooting

### Issue: Permission Denied

**Solution**: Check Android manifest has POST_NOTIFICATIONS permission (Android 13+)

### Issue: Token Not Registered

**Solution**: 
1. Verify Firebase configuration
2. Check `google-services.json` is in correct location
3. Verify backend API is running
4. Check auth token is valid

### Issue: Notifications Not Received

**Solution**:
1. Verify device has internet connection
2. Check Firebase Console for delivery status
3. Verify FCM token is valid in database
4. Check notification channel is not disabled

### Issue: Deep Linking Not Working

**Solution**:
1. Verify navigation methods are implemented
2. Check notification data contains required fields
3. Verify router is configured correctly

## API Reference

### PushNotificationManager

#### Methods

- `initialize()` - Initialize push notification system
- `getCurrentToken()` - Get current FCM token
- `isSupported()` - Check if push notifications are supported
- `registerNotificationHandler(type, handler)` - Register custom handler
- `unregisterNotificationHandler(type)` - Unregister handler
- `getDeliveryChannels()` - Get notification channels (Android)
- `removeTokenFromServer()` - Remove FCM token from backend
- `cleanup()` - Clean up and remove all listeners

### NotificationChannels

#### Methods

- `configureNotificationChannels()` - Configure all channels
- `getChannelForNotificationType(type)` - Get channel ID for notification type
- `listNotificationChannels()` - List all configured channels
- `deleteNotificationChannel(channelId)` - Delete a channel
- `channelExists(channelId)` - Check if channel exists
- `updateNotificationChannel(config)` - Update channel configuration

## Next Steps

1. ✅ Complete Phase 5.2.8: Test push notifications on Android devices
2. ✅ Complete Phase 5.2.10: Test notification actions and deep linking
3. Move to Phase 6: Module Consolidation

## Support

For issues or questions:
- Check Firebase Console for delivery logs
- Review Android logcat for errors
- Verify backend API logs for token registration
- Test with Firebase Console test notifications first

---

**Phase 5.2 Status**: 8/10 tasks complete (80%)
**Remaining**: Testing tasks (5.2.8, 5.2.10)
