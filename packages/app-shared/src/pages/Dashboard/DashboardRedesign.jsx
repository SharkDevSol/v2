import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import PageLayout from '../../COMPONENTS/Layout/PageLayout';
import StatCard from '../../COMPONENTS/StatCard/StatCard';
import Card from '../../COMPONENTS/Card/Card';
import Button from '../../COMPONENTS/Button/Button';
import styles from './DashboardRedesign.module.css';
import api from '../../utils/api';
import {
  Users,
  UserCheck,
  GraduationCap,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  Bell,
  Activity,
  BarChart3,
  PieChart,
  LineChart,
  RefreshCw
} from 'lucide-react';

/**
 * Dashboard Component - Redesigned
 * Modern dashboard with responsive grid layout, key metrics, charts, and activity feeds
 * Supports light/dark mode and all languages (English, Amharic, Arabic with RTL)
 */
const DashboardRedesign = () => {
  const { theme, t, language } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  // Dashboard statistics
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    attendanceRate: 0,
    feeCollectionRate: 0
  });

  // Chart data (placeholders for now)
  const [chartData, setChartData] = useState({
    attendanceTrend: [],
    enrollmentTrend: [],
    financialOverview: []
  });

  // Recent activity and upcoming events
  const [recentActivity, setRecentActivity] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  /**
   * Fetch dashboard data from API
   */
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch enhanced stats from dashboard API
      const [dashboardRes] = await Promise.all([
        api.get('/dashboard/enhanced-stats').catch((err) => {
          console.log('Dashboard stats error:', err.message);
          return { data: {} };
        })
      ]);

      const data = dashboardRes.data;
      const basicStats = data.basic || {};

      // Set main statistics
      setStats({
        totalStudents: basicStats.totalStudents || 0,
        totalStaff: basicStats.staffCount || 0,
        attendanceRate: 85, // Placeholder - calculate from actual data
        feeCollectionRate: 73 // Placeholder - calculate from actual data
      });

      // Set recent activity
      setRecentActivity(data.recentActivity || []);

      // Set upcoming events (placeholder)
      setUpcomingEvents([
        {
          id: 1,
          title: 'Mid-term Exams',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          type: 'exam'
        },
        {
          id: 2,
          title: 'Parent-Teacher Meeting',
          date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          type: 'meeting'
        },
        {
          id: 3,
          title: 'Sports Day',
          date: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
          type: 'event'
        }
      ]);

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Load sample data on error
      loadSampleData();
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load sample data for development/testing
   */
  const loadSampleData = () => {
    setStats({
      totalStudents: 485,
      totalStaff: 42,
      attendanceRate: 92,
      feeCollectionRate: 78
    });

    setRecentActivity([
      {
        id: 1,
        type: 'student',
        title: 'New Student Registered',
        description: 'Abebe Kebede joined Grade 2A',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        id: 2,
        type: 'payment',
        title: 'Payment Received',
        description: 'Fee payment from Sara Mohammed',
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000)
      },
      {
        id: 3,
        type: 'attendance',
        title: 'Attendance Marked',
        description: 'Grade 1A attendance completed',
        timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000)
      }
    ]);

    setUpcomingEvents([
      {
        id: 1,
        title: 'Mid-term Exams',
        date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        type: 'exam'
      },
      {
        id: 2,
        title: 'Parent-Teacher Meeting',
        date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        type: 'meeting'
      }
    ]);
  };

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  const formatRelativeTime = (date) => {
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} ${t('dashboard.minutesAgo') || 'minutes ago'}`;
    } else if (diffHours < 24) {
      return `${diffHours} ${t('dashboard.hoursAgo') || 'hours ago'}`;
    } else {
      return `${diffDays} ${t('dashboard.daysAgo') || 'days ago'}`;
    }
  };

  /**
   * Format date for upcoming events
   */
  const formatEventDate = (date) => {
    const options = { month: 'short', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString(language === 'am' ? 'am-ET' : language === 'ar' ? 'ar-SA' : 'en-US', options);
  };

  /**
   * Get activity icon based on type
   */
  const getActivityIcon = (type) => {
    switch (type) {
      case 'student':
        return <Users size={20} />;
      case 'payment':
        return <DollarSign size={20} />;
      case 'attendance':
        return <Calendar size={20} />;
      default:
        return <Activity size={20} />;
    }
  };

  /**
   * Get event icon based on type
   */
  const getEventIcon = (type) => {
    switch (type) {
      case 'exam':
        return <GraduationCap size={20} />;
      case 'meeting':
        return <Users size={20} />;
      case 'event':
        return <Calendar size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  return (
    <PageLayout
      title={t('dashboard.title') || 'Dashboard'}
      subtitle={t('dashboard.dashboardSubtitle') || 'Overview of school management system'}
      loading={loading}
      actions={
        <Button
          variant="secondary"
          size="medium"
          icon={<RefreshCw size={16} />}
          onClick={fetchDashboardData}
        >
          {t('common.refresh') || 'Refresh'}
        </Button>
      }
    >
      <div className={styles.dashboard}>
        {/* Metrics Grid - 4 StatCards */}
        <section className={styles.metricsGrid} aria-label="Key Metrics">
          <StatCard
            icon={<Users size={24} />}
            title={t('dashboard.totalStudents') || 'Total Students'}
            value={stats.totalStudents}
            variant="primary"
            trend={{ value: 5, label: t('dashboard.vsLastMonth') || 'vs last month' }}
            loading={loading}
          />
          <StatCard
            icon={<UserCheck size={24} />}
            title={t('dashboard.totalStaff') || 'Total Staff'}
            value={stats.totalStaff}
            variant="secondary"
            loading={loading}
          />
          <StatCard
            icon={<Calendar size={24} />}
            title={t('dashboard.attendanceRate') || 'Attendance Rate'}
            value={stats.attendanceRate}
            metricType="percentage"
            variant="success"
            trend={{ value: 2, label: t('dashboard.vsYesterday') || 'vs yesterday' }}
            loading={loading}
          />
          <StatCard
            icon={<DollarSign size={24} />}
            title={t('dashboard.feeCollectionRate') || 'Fee Collection Rate'}
            value={stats.feeCollectionRate}
            metricType="percentage"
            variant="warning"
            trend={{ value: -3, label: t('dashboard.vsLastMonth') || 'vs last month' }}
            loading={loading}
          />
        </section>

        {/* Charts Section */}
        <section className={styles.chartsSection} aria-label="Analytics Charts">
          <div className={styles.chartsGrid}>
            {/* Attendance Trend Chart */}
            <Card
              title={t('dashboard.attendanceTrend') || 'Attendance Trend'}
              subtitle={t('dashboard.last30Days') || 'Last 30 days'}
              className={styles.chartCard}
            >
              <div className={styles.chartPlaceholder}>
                <LineChart size={48} className={styles.chartIcon} />
                <p className={styles.chartText}>
                  {t('dashboard.chartPlaceholder') || 'Chart visualization will be implemented here'}
                </p>
              </div>
            </Card>

            {/* Enrollment Trend Chart */}
            <Card
              title={t('dashboard.enrollmentTrend') || 'Enrollment Trend'}
              subtitle={t('dashboard.thisAcademicYear') || 'This academic year'}
              className={styles.chartCard}
            >
              <div className={styles.chartPlaceholder}>
                <BarChart3 size={48} className={styles.chartIcon} />
                <p className={styles.chartText}>
                  {t('dashboard.chartPlaceholder') || 'Chart visualization will be implemented here'}
                </p>
              </div>
            </Card>

            {/* Financial Overview Chart */}
            <Card
              title={t('dashboard.financialOverview') || 'Financial Overview'}
              subtitle={t('dashboard.currentMonth') || 'Current month'}
              className={styles.chartCard}
            >
              <div className={styles.chartPlaceholder}>
                <PieChart size={48} className={styles.chartIcon} />
                <p className={styles.chartText}>
                  {t('dashboard.chartPlaceholder') || 'Chart visualization will be implemented here'}
                </p>
              </div>
            </Card>
          </div>
        </section>

        {/* Activity and Events Section */}
        <section className={styles.activitySection} aria-label="Activity and Events">
          <div className={styles.activityGrid}>
            {/* Recent Activity */}
            <Card
              title={t('dashboard.recentActivity') || 'Recent Activity'}
              subtitle={t('dashboard.latestActions') || 'Latest actions in the system'}
              className={styles.activityCard}
            >
              {recentActivity.length > 0 ? (
                <div className={styles.activityList}>
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className={styles.activityItem}>
                      <div className={styles.activityIcon}>
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className={styles.activityContent}>
                        <h4 className={styles.activityTitle}>{activity.title}</h4>
                        <p className={styles.activityDescription}>{activity.description}</p>
                        <span className={styles.activityTime}>
                          <Clock size={14} />
                          {formatRelativeTime(activity.timestamp)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Activity size={48} />
                  <p>{t('dashboard.noRecentActivity') || 'No recent activity'}</p>
                </div>
              )}
            </Card>

            {/* Upcoming Events */}
            <Card
              title={t('dashboard.upcomingEvents') || 'Upcoming Events'}
              subtitle={t('dashboard.scheduledEvents') || 'Scheduled exams and events'}
              className={styles.eventsCard}
            >
              {upcomingEvents.length > 0 ? (
                <div className={styles.eventsList}>
                  {upcomingEvents.map((event) => (
                    <div key={event.id} className={styles.eventItem}>
                      <div className={styles.eventIcon}>
                        {getEventIcon(event.type)}
                      </div>
                      <div className={styles.eventContent}>
                        <h4 className={styles.eventTitle}>{event.title}</h4>
                        <span className={styles.eventDate}>
                          <Calendar size={14} />
                          {formatEventDate(event.date)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <Bell size={48} />
                  <p>{t('dashboard.noUpcomingEvents') || 'No upcoming events'}</p>
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Last Updated */}
        <div className={styles.lastUpdated}>
          <Clock size={16} />
          <span>
            {t('dashboard.lastUpdated') || 'Last updated'}: {lastUpdated.toLocaleTimeString()}
          </span>
        </div>
      </div>
    </PageLayout>
  );
};

export default DashboardRedesign;
