import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { 
  FiUsers, FiDollarSign, FiCheckCircle, FiAlertCircle,
  FiTrendingUp, FiBook, FiCalendar,
  FiRefreshCw, FiDownload, FiChevronRight,
  FiPackage, FiTool, FiAward
} from 'react-icons/fi';
import styles from './Dashboard.module.css';

const DashboardPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [expandedSection, setExpandedSection] = useState(null);
  const [detailedData, setDetailedData] = useState({});
  const [loadingDetails, setLoadingDetails] = useState(false);
  
  // State for all dashboard data
  const [quickStats, setQuickStats] = useState(null);
  const [students, setStudents] = useState(null);
  const [staff, setStaff] = useState(null);
  const [finance, setFinance] = useState(null);
  const [academic, setAcademic] = useState(null);
  const [attendance, setAttendance] = useState(null);
  const [behavior, setBehavior] = useState(null);
  const [hr, setHr] = useState(null);
  const [inventory, setInventory] = useState(null);
  const [assets, setAssets] = useState(null);
  const [evaluations, setEvaluations] = useState(null);
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    fetchAllData();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => {
      fetchAllData(true);
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async (isAutoRefresh = false) => {
    if (isAutoRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      // Fetch all data in parallel
      const [
        summaryRes,
        studentsRes,
        staffRes,
        financeRes,
        academicRes,
        attendanceRes,
        behaviorRes,
        hrRes,
        inventoryRes,
        assetsRes,
        evaluationsRes
      ] = await Promise.all([
        api.get('/reports/summary').catch(() => ({ data: null })),
        api.get('/reports/students/summary').catch(() => ({ data: null })),
        api.get('/reports/staff/summary').catch(() => ({ data: null })),
        api.get('/reports/finance/summary').catch(() => ({ data: null })),
        api.get('/reports/academic/class-performance').catch(() => ({ data: null })),
        api.get('/reports/attendance/summary').catch(() => ({ data: null })),
        api.get('/reports/faults/summary').catch(() => ({ data: null })),
        api.get('/reports/hr/summary').catch(() => ({ data: null })),
        api.get('/reports/inventory/summary').catch(() => ({ data: null })),
        api.get('/reports/assets/summary').catch(() => ({ data: null })),
        api.get('/reports/evaluations/summary').catch(() => ({ data: null }))
      ]);

      setQuickStats(summaryRes.data);
      setStudents(studentsRes.data?.data || studentsRes.data);
      setStaff(staffRes.data?.data || staffRes.data);
      setFinance(financeRes.data?.data || financeRes.data);
      setAcademic(academicRes.data?.data || academicRes.data);
      setAttendance(attendanceRes.data?.data || attendanceRes.data);
      setBehavior(behaviorRes.data?.data || behaviorRes.data);
      setHr(hrRes.data?.data || hrRes.data);
      setInventory(inventoryRes.data?.data || inventoryRes.data);
      setAssets(assetsRes.data?.data || assetsRes.data);
      setEvaluations(evaluationsRes.data?.data || evaluationsRes.data);
      
      // Log data for debugging
      console.log('=== DASHBOARD DATA LOADED ===');
      console.log('Quick Stats:', summaryRes.data);
      console.log('Students:', studentsRes.data);
      console.log('Staff:', staffRes.data);
      console.log('Finance:', financeRes.data);
      console.log('Academic:', academicRes.data);
      console.log('Attendance:', attendanceRes.data);
      console.log('Behavior:', behaviorRes.data);
      console.log('HR:', hrRes.data);
      console.log('Inventory:', inventoryRes.data);
      console.log('Assets:', assetsRes.data);
      console.log('Evaluations:', evaluationsRes.data);
      console.log('============================');
      
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchAllData(true);
  };

  const handleSectionClick = async (sectionType) => {
    // If clicking the same section, collapse it
    if (expandedSection === sectionType) {
      setExpandedSection(null);
      return;
    }

    setExpandedSection(sectionType);
    
    // If we already have data for this section, don't fetch again
    if (detailedData[sectionType]) {
      return;
    }

    setLoadingDetails(true);

    try {
      let data = {};
      
      switch(sectionType) {
        case 'students':
          const [byClass, byGender, byAge] = await Promise.all([
            api.get('/reports/students/by-class'),
            api.get('/reports/students/by-gender'),
            api.get('/reports/students/by-age')
          ]);
          data = {
            byClass: byClass.data?.data || [],
            byGender: byGender.data?.data || {},
            byAge: byAge.data?.data || []
          };
          break;

        case 'staff':
          const [byType, byRole, byGenderStaff] = await Promise.all([
            api.get('/reports/staff/by-type'),
            api.get('/reports/staff/by-role'),
            api.get('/reports/staff/by-gender')
          ]);
          data = {
            byType: byType.data?.data || [],
            byRole: byRole.data?.data || [],
            byGender: byGenderStaff.data?.data || {}
          };
          break;

        case 'academic':
          const [classPerf, topPerf, bottomPerf, rankings] = await Promise.all([
            api.get('/reports/academic/class-performance'),
            api.get('/reports/academic/top-performers?limit=10'),
            api.get('/reports/academic/bottom-performers?limit=10'),
            api.get('/reports/academic/class-rankings')
          ]);
          data = {
            classPerformance: classPerf.data?.data || [],
            topPerformers: topPerf.data?.data || [],
            bottomPerformers: bottomPerf.data?.data || [],
            rankings: rankings.data?.data || []
          };
          break;

        case 'attendance':
          const [attByClass, attTrends, absentees] = await Promise.all([
            api.get('/reports/attendance/by-class'),
            api.get('/reports/attendance/trends?weeks=4'),
            api.get('/reports/attendance/absentees?limit=10')
          ]);
          data = {
            byClass: attByClass.data?.data || [],
            trends: attTrends.data?.data || [],
            absentees: absentees.data?.data || []
          };
          break;

        case 'behavior':
          const [faultsByClass, faultsByType, faultsByLevel, recentFaults] = await Promise.all([
            api.get('/reports/faults/by-class'),
            api.get('/reports/faults/by-type'),
            api.get('/reports/faults/by-level'),
            api.get('/reports/faults/recent?days=7&limit=20')
          ]);
          data = {
            byClass: faultsByClass.data?.data || [],
            byType: faultsByType.data?.data || [],
            byLevel: faultsByLevel.data?.data || [],
            recent: recentFaults.data?.data || []
          };
          break;

        case 'evaluations':
          const [evalByClass, responseRates] = await Promise.all([
            api.get('/reports/evaluations/by-class'),
            api.get('/reports/evaluations/response-rates')
          ]);
          data = {
            byClass: evalByClass.data?.data || [],
            responseRates: responseRates.data?.data || []
          };
          break;

        case 'finance':
          const financeReports = await api.get('/reports/finance/summary');
          data = financeReports.data?.data || {};
          break;

        case 'hr':
          const hrReports = await api.get('/reports/hr/summary');
          data = hrReports.data?.data || {};
          break;

        default:
          data = { message: 'Detailed reports coming soon' };
      }

      setDetailedData(prev => ({
        ...prev,
        [sectionType]: data
      }));
    } catch (error) {
      console.error('Error fetching detailed data:', error);
      setDetailedData(prev => ({
        ...prev,
        [sectionType]: { error: 'Failed to load data' }
      }));
    } finally {
      setLoadingDetails(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1>Dashboard Overview</h1>
          <p className={styles.lastUpdated}>
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        </div>
        <div className={styles.headerActions}>
          <button 
            onClick={handleRefresh} 
            className={styles.refreshBtn}
            disabled={refreshing}
          >
            <FiRefreshCw className={refreshing ? styles.spinning : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className={styles.exportBtn}>
            <FiDownload />
            Export
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className={styles.quickStats}>
        <StatCard
          title="Total Students"
          value={quickStats?.totalStudents || students?.total || students?.totalStudents || (students?.male || 0) + (students?.female || 0)}
          subtitle="Enrolled students across all classes"
          icon={<FiUsers />}
          color="blue"
          trend="+5%"
        />
        <StatCard
          title="Total Staff"
          value={quickStats?.totalStaff || staff?.total || staff?.totalStaff || 0}
          subtitle="Teachers, admin & support staff"
          icon={<FiUsers />}
          color="green"
          trend="+2%"
        />
        <StatCard
          title="Total Revenue"
          value={`${(quickStats?.totalRevenue || finance?.revenue || 0).toLocaleString()} Birr`}
          subtitle="Total income from all sources"
          icon={<FiDollarSign />}
          color="purple"
          trend="+12%"
        />
        <StatCard
          title="Attendance Rate"
          value={`${(Number(quickStats?.attendanceRate) || Number(attendance?.attendanceRate) || 0).toFixed(1)}%`}
          subtitle="Students present today"
          icon={<FiCheckCircle />}
          color="orange"
          trend="+3%"
        />
      </div>

      {/* Main Content Grid */}
      <div className={styles.contentGrid}>
        {/* Students Section */}
        <Section 
          title="Students Overview" 
          icon={<FiUsers />} 
          description="Complete student enrollment statistics"
          onClick={() => handleSectionClick('students')}
          isExpanded={expandedSection === 'students'}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Total Students:</span>
              <strong>{students?.total || students?.totalStudents || (students?.male || 0) + (students?.female || 0)}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Male Students:</span>
              <strong>{students?.male || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Female Students:</span>
              <strong>{students?.female || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Total Classes:</span>
              <strong>{students?.classCount || students?.totalClasses || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Average per Class:</span>
              <strong>{(students?.total || students?.totalStudents || (students?.male || 0) + (students?.female || 0)) && (students?.classCount || students?.totalClasses) ? Math.round(((students?.total || students?.totalStudents || (students?.male || 0) + (students?.female || 0))) / (students?.classCount || students?.totalClasses)) : 0}</strong>
            </div>
          </div>
          
          {/* Detailed Report */}
          {expandedSection === 'students' && (
            <DetailedReport 
              type="students" 
              data={detailedData.students} 
              loading={loadingDetails}
            />
          )}
        </Section>

        {/* Staff Section */}
        <Section 
          title="Staff Management" 
          icon={<FiUsers />} 
          description="Staff distribution and roles"
          onClick={() => handleSectionClick('staff')}
          isExpanded={expandedSection === 'staff'}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Total Staff Members:</span>
              <strong>{staff?.total || staff?.totalStaff || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Teaching Staff:</span>
              <strong>{staff?.teachers || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Administrative Staff:</span>
              <strong>{staff?.admin || staff?.administrative || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Support Staff:</span>
              <strong>{staff?.support || staff?.supportive || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Staff-Student Ratio:</span>
              <strong>1:{(students?.total || students?.totalStudents || (students?.male || 0) + (students?.female || 0)) && (staff?.total || staff?.totalStaff) ? Math.round(((students?.total || students?.totalStudents || (students?.male || 0) + (students?.female || 0))) / (staff?.total || staff?.totalStaff)) : 0}</strong>
            </div>
          </div>
          
          {/* Detailed Report */}
          {expandedSection === 'staff' && (
            <DetailedReport 
              type="staff" 
              data={detailedData.staff} 
              loading={loadingDetails}
            />
          )}
        </Section>

        {/* Finance Section */}
        <Section 
          title="Financial Summary" 
          icon={<FiDollarSign />} 
          description="Income, expenses and profit overview"
          onClick={() => navigate('/finance/reports')}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Total Revenue (Income):</span>
              <strong className={styles.success}>{(finance?.revenue || 0).toLocaleString()} Birr</strong>
            </div>
            <div className={styles.statRow}>
              <span>Total Expenses (Costs):</span>
              <strong className={styles.danger}>{(finance?.expenses || 0).toLocaleString()} Birr</strong>
            </div>
            <div className={styles.statRow}>
              <span>Net Profit (Revenue - Expenses):</span>
              <strong className={styles.success}>{(finance?.profit || 0).toLocaleString()} Birr</strong>
            </div>
            <div className={styles.statRow}>
              <span>Pending Fees (Unpaid):</span>
              <strong className={styles.warning}>{(finance?.pending || 0).toLocaleString()} Birr</strong>
            </div>
            <div className={styles.statRow}>
              <span>Collection Rate:</span>
              <strong>{finance?.revenue && finance?.pending ? (Number((finance.revenue / (finance.revenue + finance.pending)) * 100) || 0).toFixed(1) : 0}%</strong>
            </div>
          </div>
        </Section>

        {/* Academic Section */}
        <Section 
          title="Academic Performance" 
          icon={<FiBook />} 
          description="Student grades and evaluation results"
          onClick={() => handleSectionClick('academic')}
          isExpanded={expandedSection === 'academic'}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Average Score (All Students):</span>
              <strong>{academic?.averageScore || 'N/A'}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Total Evaluations Conducted:</span>
              <strong>{academic?.totalEvaluations || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Pass Rate (Above 50%):</span>
              <strong className={styles.success}>{academic?.passRate || 0}%</strong>
            </div>
            <div className={styles.statRow}>
              <span>Top Performing Class:</span>
              <strong>{academic?.topPerformer || 'N/A'}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Students Needing Support:</span>
              <strong className={styles.warning}>{academic?.needsSupport || 0}</strong>
            </div>
          </div>
          {expandedSection === 'academic' && (
            <DetailedReport type="academic" data={detailedData.academic} loading={loadingDetails} />
          )}
        </Section>

        {/* Attendance Section */}
        <Section 
          title="Attendance Tracking" 
          icon={<FiCalendar />} 
          description="Daily student attendance records"
          onClick={() => handleSectionClick('attendance')}
          isExpanded={expandedSection === 'attendance'}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Today's Attendance Rate:</span>
              <strong className={styles.success}>{(Number(attendance?.attendanceRate) || 0).toFixed(1)}%</strong>
            </div>
            <div className={styles.statRow}>
              <span>Students Present Today:</span>
              <strong className={styles.success}>{attendance?.present || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Students Absent Today:</span>
              <strong className={styles.danger}>{attendance?.absent || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Students Late Today:</span>
              <strong className={styles.warning}>{attendance?.late || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Excused Absences:</span>
              <strong>{attendance?.excused || 0}</strong>
            </div>
          </div>
          {expandedSection === 'attendance' && (
            <DetailedReport type="attendance" data={detailedData.attendance} loading={loadingDetails} />
          )}
        </Section>

        {/* Behavior Section */}
        <Section 
          title="Behavior & Discipline" 
          icon={<FiAlertCircle />} 
          description="Student conduct and fault records"
          onClick={() => handleSectionClick('behavior')}
          isExpanded={expandedSection === 'behavior'}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Total Faults Recorded:</span>
              <strong className={styles.danger}>{behavior?.totalFaults || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Faults This Week:</span>
              <strong>{behavior?.weeklyFaults || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Critical/Severe Faults:</span>
              <strong className={styles.danger}>{behavior?.criticalFaults || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Students with Faults:</span>
              <strong>{behavior?.uniqueStudents || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Resolved Issues:</span>
              <strong className={styles.success}>{behavior?.resolved || 0}</strong>
            </div>
          </div>
          {expandedSection === 'behavior' && (
            <DetailedReport type="behavior" data={detailedData.behavior} loading={loadingDetails} />
          )}
        </Section>

        {/* HR Section */}
        <Section 
          title="HR & Payroll" 
          icon={<FiTrendingUp />} 
          description="Staff attendance and leave management"
          onClick={() => navigate('/hr/attendance')}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Staff Present Today:</span>
              <strong className={styles.success}>{hr?.present || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Staff Absent Today:</span>
              <strong className={styles.danger}>{hr?.absent || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Staff on Leave:</span>
              <strong className={styles.warning}>{hr?.onLeave || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Pending Leave Requests:</span>
              <strong>{hr?.pendingRequests || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Staff Attendance Rate:</span>
              <strong>{hr?.present && staff?.totalStaff ? (Number((hr.present / staff.totalStaff) * 100) || 0).toFixed(1) : 0}%</strong>
            </div>
          </div>
        </Section>

        {/* Inventory Section */}
        <Section 
          title="Inventory & Stock" 
          icon={<FiPackage />} 
          description="Inventory items and stock levels"
          onClick={() => navigate('/inventory')}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Total Items:</span>
              <strong>{inventory?.totalItems || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Low Stock Items:</span>
              <strong className={styles.warning}>{inventory?.lowStock || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Out of Stock:</span>
              <strong className={styles.danger}>{inventory?.outOfStock || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Total Inventory Value:</span>
              <strong>{(inventory?.totalValue || 0).toLocaleString()} Birr</strong>
            </div>
            <div className={styles.statRow}>
              <span>Stock Health:</span>
              <strong className={inventory?.lowStock > 5 ? styles.warning : styles.success}>
                {inventory?.lowStock > 5 ? 'Needs Attention' : 'Good'}
              </strong>
            </div>
          </div>
        </Section>

        {/* Assets Section */}
        <Section 
          title="Asset Management" 
          icon={<FiTool />} 
          description="School assets and equipment tracking"
          onClick={() => navigate('/assets')}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Total Assets:</span>
              <strong>{assets?.totalAssets || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Assets In Use:</span>
              <strong className={styles.success}>{assets?.inUse || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Under Maintenance:</span>
              <strong className={styles.warning}>{assets?.maintenance || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Total Asset Value:</span>
              <strong>{(assets?.totalValue || 0).toLocaleString()} Birr</strong>
            </div>
            <div className={styles.statRow}>
              <span>Asset Utilization:</span>
              <strong>{assets?.totalAssets && assets?.inUse ? (Number((assets.inUse / assets.totalAssets) * 100) || 0).toFixed(1) : 0}%</strong>
            </div>
          </div>
        </Section>

        {/* Evaluations Section */}
        <Section 
          title="Evaluations & Assessments" 
          icon={<FiAward />} 
          description="Student evaluation and assessment tracking"
          onClick={() => handleSectionClick('evaluations')}
          isExpanded={expandedSection === 'evaluations'}
        >
          <div className={styles.sectionContent}>
            <div className={styles.statRow}>
              <span>Total Evaluations:</span>
              <strong>{evaluations?.total || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Completed Evaluations:</span>
              <strong className={styles.success}>{evaluations?.completed || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Pending Evaluations:</span>
              <strong className={styles.warning}>{evaluations?.pending || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Guardian Responses:</span>
              <strong>{evaluations?.responded || 0}</strong>
            </div>
            <div className={styles.statRow}>
              <span>Completion Rate:</span>
              <strong>{evaluations?.total && evaluations?.completed ? (Number((evaluations.completed / evaluations.total) * 100) || 0).toFixed(1) : 0}%</strong>
            </div>
          </div>
          {expandedSection === 'evaluations' && (
            <DetailedReport type="evaluations" data={detailedData.evaluations} loading={loadingDetails} />
          )}
        </Section>
      </div>
    </div>
  );
};

// StatCard Component
const StatCard = ({ title, value, icon, color, trend }) => (
  <motion.div 
    className={`${styles.statCard} ${styles[color]}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
    whileHover={{ scale: 1.02 }}
  >
    <div className={styles.statIcon}>{icon}</div>
    <div className={styles.statInfo}>
      <h3>{title}</h3>
      <p className={styles.statValue}>{value}</p>
      {trend && <span className={styles.trend}>{trend}</span>}
    </div>
  </motion.div>
);

// Section Component - Now expandable
const Section = ({ title, icon, description, children, onClick, isExpanded }) => (
  <motion.div 
    className={`${styles.section} ${onClick ? styles.clickable : ''} ${isExpanded ? styles.expanded : ''}`}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className={styles.sectionHeader} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <div className={styles.sectionTitle}>
        {icon}
        <div>
          <h2>{title}</h2>
          {description && <p className={styles.sectionDescription}>{description}</p>}
        </div>
      </div>
      {onClick && (
        <motion.div
          animate={{ rotate: isExpanded ? 90 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <FiChevronRight className={styles.chevronIcon} />
        </motion.div>
      )}
    </div>
    {children}
  </motion.div>
);

// Detailed Report Component
const DetailedReport = ({ type, data, loading }) => {
  if (loading) {
    return (
      <div className={styles.detailedLoading}>
        <div className={styles.spinner}></div>
        <p>Loading detailed data...</p>
      </div>
    );
  }

  if (!data) return null;

  if (data.error) {
    return <div className={styles.detailedError}>{data.error}</div>;
  }

  return (
    <motion.div 
      className={styles.detailedReport}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
    >
      {type === 'students' && (
        <>
          <h3>Students by Class</h3>
          <div className={styles.detailedTable}>
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total</th>
                  <th>Male</th>
                  <th>Female</th>
                </tr>
              </thead>
              <tbody>
                {data.byClass?.map((cls, idx) => (
                  <tr key={idx}>
                    <td><strong>{cls.className}</strong></td>
                    <td>{cls.total}</td>
                    <td>{cls.male}</td>
                    <td>{cls.female}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {type === 'staff' && (
        <>
          <h3>Staff by Type</h3>
          <div className={styles.detailedTable}>
            <table>
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Count</th>
                </tr>
              </thead>
              <tbody>
                {data.byType?.map((type, idx) => (
                  <tr key={idx}>
                    <td><strong>{type.type}</strong></td>
                    <td>{type.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {type === 'academic' && (
        <>
          <h3>Top 10 Performers</h3>
          <div className={styles.detailedTable}>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Average</th>
                </tr>
              </thead>
              <tbody>
                {data.topPerformers?.slice(0, 10).map((student, idx) => (
                  <tr key={idx}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td>{student.name || student.studentName}</td>
                    <td>{student.className}</td>
                    <td className={styles.success}>{student.average || student.averageScore}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {type === 'attendance' && (
        <>
          <h3>Attendance by Class</h3>
          <div className={styles.detailedTable}>
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.byClass?.map((cls, idx) => (
                  <tr key={idx}>
                    <td><strong>{cls.className}</strong></td>
                    <td className={styles.success}>{cls.present}</td>
                    <td className={styles.danger}>{cls.absent}</td>
                    <td>{cls.rate}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {type === 'behavior' && (
        <>
          <h3>Recent Faults (Last 7 Days)</h3>
          <div className={styles.detailedTable}>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Type</th>
                  <th>Level</th>
                </tr>
              </thead>
              <tbody>
                {data.recent?.slice(0, 10).map((fault, idx) => (
                  <tr key={idx}>
                    <td>{fault.studentName || fault.name}</td>
                    <td>{fault.className}</td>
                    <td>{fault.type || fault.faultType}</td>
                    <td className={fault.level === 'Critical' ? styles.danger : styles.warning}>
                      {fault.level || fault.severity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {type === 'evaluations' && (
        <>
          <h3>Evaluations by Class</h3>
          <div className={styles.detailedTable}>
            <table>
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Total</th>
                  <th>Completed</th>
                  <th>Pending</th>
                </tr>
              </thead>
              <tbody>
                {data.byClass?.map((cls, idx) => (
                  <tr key={idx}>
                    <td><strong>{cls.className}</strong></td>
                    <td>{cls.total}</td>
                    <td className={styles.success}>{cls.completed}</td>
                    <td className={styles.warning}>{cls.pending}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </motion.div>
  );
};

export default DashboardPage;
