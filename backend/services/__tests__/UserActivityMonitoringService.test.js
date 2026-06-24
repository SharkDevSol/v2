/**
 * User Activity Monitoring Service Tests
 * 
 * Phase 10.8.7: Monitor user activity
 */

// Mock the dependencies BEFORE requiring the service
jest.mock('../../config/db', () => ({
  query: jest.fn()
}));

jest.mock('../../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

const userActivityMonitoring = require('../UserActivityMonitoringService');
const pool = require('../../config/db');

describe('UserActivityMonitoringService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('logActivity', () => {
    it('should log user activity successfully', async () => {
      const mockActivity = {
        userId: 1,
        username: 'testuser',
        userType: 'admin',
        branchCode: 'ib3',
        activityType: 'login',
        activityCategory: 'authentication',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        sessionId: 'session123',
        status: 'success'
      };

      pool.query.mockResolvedValueOnce({
        rows: [{ activity_id: 1 }]
      });

      const result = await userActivityMonitoring.logActivity(mockActivity);

      expect(result.success).toBe(true);
      expect(result.activityId).toBe(1);
      expect(pool.query).toHaveBeenCalled();
    });

    it('should handle errors when logging activity', async () => {
      const mockActivity = {
        userId: 1,
        username: 'testuser',
        userType: 'admin',
        branchCode: 'ib3',
        activityType: 'login'
      };

      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await userActivityMonitoring.logActivity(mockActivity);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });

  describe('createSession', () => {
    it('should create user session successfully', async () => {
      const mockSession = {
        sessionId: 'session123',
        userId: 1,
        username: 'testuser',
        userType: 'admin',
        branchCode: 'ib3',
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0',
        deviceType: 'desktop-web'
      };

      pool.query.mockResolvedValue({ rows: [] });

      const result = await userActivityMonitoring.createSession(mockSession);

      expect(result.success).toBe(true);
      expect(result.sessionId).toBe('session123');
    });
  });

  describe('endSession', () => {
    it('should end user session successfully', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          user_id: 1,
          username: 'testuser',
          user_type: 'admin',
          branch_code: 'ib3'
        }]
      });

      pool.query.mockResolvedValueOnce({ rows: [] });

      const result = await userActivityMonitoring.endSession('session123');

      expect(result.success).toBe(true);
    });
  });

  describe('getActiveUsers', () => {
    it('should return active users', async () => {
      const mockUsers = [
        {
          user_id: 1,
          username: 'user1',
          user_type: 'admin',
          branch_code: 'ib3',
          last_activity: new Date(),
          activity_count: 10
        },
        {
          user_id: 2,
          username: 'user2',
          user_type: 'teacher',
          branch_code: 'ib3',
          last_activity: new Date(),
          activity_count: 5
        }
      ];

      pool.query.mockResolvedValueOnce({ rows: mockUsers });

      const result = await userActivityMonitoring.getActiveUsers({
        branchCode: 'ib3',
        minutesBack: 30
      });

      expect(result).toHaveLength(2);
      expect(result[0].username).toBe('user1');
    });

    it('should handle errors when getting active users', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await userActivityMonitoring.getActiveUsers();

      expect(result).toEqual([]);
    });
  });

  describe('getActivityStatistics', () => {
    it('should return activity statistics', async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [{
            total_activities: 100,
            unique_users: 10,
            total_sessions: 15,
            avg_duration_ms: 5000
          }]
        })
        .mockResolvedValueOnce({
          rows: [
            { activity_type: 'login', count: 20 },
            { activity_type: 'view', count: 50 }
          ]
        })
        .mockResolvedValueOnce({
          rows: [
            { activity_category: 'authentication', count: 20 },
            { activity_category: 'academic', count: 30 }
          ]
        })
        .mockResolvedValueOnce({
          rows: [
            { hour: 9, count: 30 },
            { hour: 14, count: 40 }
          ]
        })
        .mockResolvedValueOnce({
          rows: [
            { user_id: 1, username: 'user1', user_type: 'admin', activity_count: 50 }
          ]
        });

      const result = await userActivityMonitoring.getActivityStatistics({
        hoursBack: 24
      });

      expect(result.overall.total_activities).toBe(100);
      expect(result.byType).toHaveLength(2);
      expect(result.byCategory).toHaveLength(2);
      expect(result.hourlyDistribution).toHaveLength(2);
      expect(result.topUsers).toHaveLength(1);
    });
  });

  describe('getUserEngagementScore', () => {
    it('should calculate user engagement score', async () => {
      pool.query.mockResolvedValueOnce({
        rows: [{
          total_activities: 150,
          active_days: 20,
          total_sessions: 25,
          avg_activity_duration: 3000,
          feature_diversity: 8
        }]
      });

      const result = await userActivityMonitoring.getUserEngagementScore(1, 30);

      expect(result.userId).toBe(1);
      expect(result.engagementScore).toBeGreaterThan(0);
      expect(result.engagementScore).toBeLessThanOrEqual(100);
      expect(result.totalActivities).toBe(150);
      expect(result.activeDays).toBe(20);
    });

    it('should handle errors when calculating engagement score', async () => {
      pool.query.mockRejectedValueOnce(new Error('Database error'));

      const result = await userActivityMonitoring.getUserEngagementScore(1, 30);

      expect(result.engagementScore).toBe(0);
      expect(result.error).toBe('Database error');
    });
  });

  describe('generateDailyMetrics', () => {
    it('should generate daily metrics successfully', async () => {
      pool.query
        .mockResolvedValueOnce({
          rows: [{
            branch_code: 'ib3',
            user_type: 'admin',
            total_users: 5,
            total_sessions: 10,
            total_activities: 100,
            avg_session_duration: 45.5,
            most_active_hour: 14,
            most_used_feature: 'view_dashboard'
          }]
        })
        .mockResolvedValue({ rows: [] });

      const result = await userActivityMonitoring.generateDailyMetrics(new Date());

      expect(result.success).toBe(true);
    });
  });

  describe('cleanupOldRecords', () => {
    it('should clean up old records successfully', async () => {
      pool.query
        .mockResolvedValueOnce({ rowCount: 50 })
        .mockResolvedValueOnce({ rowCount: 10 });

      const result = await userActivityMonitoring.cleanupOldRecords(90);

      expect(result.success).toBe(true);
      expect(result.deletedCount).toBe(60);
    });
  });
});
