import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { FiCalendar, FiArrowLeft, FiRefreshCw, FiDownload, FiUsers } from 'react-icons/fi';
import styles from './Reports.module.css';

const AttendanceReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students'); // 'students' or 'staff'
  const [data, setData] = useState({
    studentSummary: null,
    studentByClass: [],
    studentTrends: [],
    studentAbsentees: [],
    staffSummary: null,
    staffAttendance: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [
        studentSummaryRes, 
        studentByClassRes, 
        studentTrendsRes, 
        studentAbsenteesRes,
        staffSummaryRes
      ] = await Promise.all([
        api.get('/reports/attendance/summary'),
        api.get('/reports/attendance/by-class'),
        api.get('/reports/attendance/trends?weeks=4'),
        api.get('/reports/attendance/absentees?limit=20'),
        api.get('/reports/hr/summary')
      ]);

      setData({
        studentSummary: studentSummaryRes.data?.data || studentSummaryRes.data,
        studentByClass: studentByClassRes.data?.data || [],
        studentTrends: studentTrendsRes.data?.data || [],
        studentAbsentees: studentAbsenteesRes.data?.data || [],
        staffSummary: staffSummaryRes.data?.data || staffSummaryRes.data,
        staffAttendance: []
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Attendance Reports...</p>
      </div>
    );
  }

  const studentSummary = data.studentSummary || {};
  const staffSummary = data.staffSummary || {};

  return (
    <div className={styles.reportPage}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div className={styles.headerTitle}>
          <FiCalendar className={styles.headerIcon} />
          <div>
            <h1>Attendance Report</h1>
            <p>Student and staff attendance tracking</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button onClick={fetchData} className={styles.refreshBtn}>
            <FiRefreshCw /> Refresh
          </button>
          <button className={styles.exportBtn}>
            <FiDownload /> Export
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button 
          className={`${styles.tab} ${activeTab === 'students' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <FiUsers /> Student Attendance
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'staff' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('staff')}
        >
          <FiUsers /> Staff Attendance
        </button>
      </div>

      {/* Student Attendance Tab */}
      {activeTab === 'students' && (
        <>
          {/* Summary Cards */}
          <div className={styles.summaryCards}>
            <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
              <h3>Attendance Rate</h3>
              <p className={styles.bigNumber}>{(Number(studentSummary.attendanceRate) || 0).toFixed(1)}%</p>
              <span className={styles.subtitle}>Overall attendance</span>
            </motion.div>
            <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
              <h3>Present Today</h3>
              <p className={styles.bigNumber} style={{ color: '#4caf50' }}>{studentSummary.present || 0}</p>
              <span className={styles.subtitle}>Students present</span>
            </motion.div>
            <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
              <h3>Absent Today</h3>
              <p className={styles.bigNumber} style={{ color: '#f44336' }}>{studentSummary.absent || 0}</p>
              <span className={styles.subtitle}>Students absent</span>
            </motion.div>
            <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
              <h3>Late Today</h3>
              <p className={styles.bigNumber} style={{ color: '#ff9800' }}>{studentSummary.late || 0}</p>
              <span className={styles.subtitle}>Students late</span>
            </motion.div>
          </div>

          {/* Attendance by Class */}
          <div className={styles.section}>
            <h2>Student Attendance by Class</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Class Name</th>
                    <th>Total Students</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Late</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.studentByClass.length > 0 ? (
                    data.studentByClass.map((cls, idx) => (
                      <tr key={idx}>
                        <td><strong>{cls.className}</strong></td>
                        <td>{cls.total || cls.totalStudents}</td>
                        <td className={styles.success}>{cls.present}</td>
                        <td className={styles.danger}>{cls.absent}</td>
                        <td className={styles.warning}>{cls.late || 0}</td>
                        <td className={cls.rate >= 90 ? styles.success : cls.rate >= 75 ? styles.warning : styles.danger}>
                          {cls.rate}%
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className={styles.noData}>No attendance data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Frequently Absent Students */}
          <div className={styles.section}>
            <h2>Frequently Absent Students</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Class</th>
                    <th>Total Absences</th>
                    <th>Attendance Rate</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {data.studentAbsentees.length > 0 ? (
                    data.studentAbsentees.map((student, idx) => (
                      <tr key={idx}>
                        <td><strong>{student.name || student.studentName}</strong></td>
                        <td>{student.className}</td>
                        <td className={styles.danger}>{student.absences || student.totalAbsences}</td>
                        <td className={student.attendanceRate >= 75 ? styles.warning : styles.danger}>
                          {student.attendanceRate}%
                        </td>
                        <td className={styles.warning}>Needs Attention</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className={styles.noData}>No frequently absent students</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Staff Attendance Tab */}
      {activeTab === 'staff' && (
        <>
          {/* Summary Cards */}
          <div className={styles.summaryCards}>
            <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
              <h3>Total Staff</h3>
              <p className={styles.bigNumber}>{staffSummary.totalStaff || 0}</p>
              <span className={styles.subtitle}>All staff members</span>
            </motion.div>
            <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
              <h3>Present Today</h3>
              <p className={styles.bigNumber} style={{ color: '#4caf50' }}>{staffSummary.present || 0}</p>
              <span className={styles.subtitle}>Staff present</span>
            </motion.div>
            <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
              <h3>Absent Today</h3>
              <p className={styles.bigNumber} style={{ color: '#f44336' }}>{staffSummary.absent || 0}</p>
              <span className={styles.subtitle}>Staff absent</span>
            </motion.div>
            <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
              <h3>On Leave</h3>
              <p className={styles.bigNumber} style={{ color: '#ff9800' }}>{staffSummary.onLeave || 0}</p>
              <span className={styles.subtitle}>Staff on leave</span>
            </motion.div>
          </div>

          {/* Staff Attendance Summary */}
          <div className={styles.section}>
            <h2>Staff Attendance Summary</h2>
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Count</th>
                    <th>Percentage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Total Staff</strong></td>
                    <td>{staffSummary.totalStaff || 0}</td>
                    <td>100%</td>
                  </tr>
                  <tr>
                    <td><strong>Present</strong></td>
                    <td className={styles.success}>{staffSummary.present || 0}</td>
                    <td className={styles.success}>
                      {staffSummary.totalStaff > 0 ? ((staffSummary.present / staffSummary.totalStaff) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Absent</strong></td>
                    <td className={styles.danger}>{staffSummary.absent || 0}</td>
                    <td className={styles.danger}>
                      {staffSummary.totalStaff > 0 ? ((staffSummary.absent / staffSummary.totalStaff) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td><strong>On Leave</strong></td>
                    <td className={styles.warning}>{staffSummary.onLeave || 0}</td>
                    <td className={styles.warning}>
                      {staffSummary.totalStaff > 0 ? ((staffSummary.onLeave / staffSummary.totalStaff) * 100).toFixed(1) : 0}%
                    </td>
                  </tr>
                  <tr>
                    <td><strong>Pending Leave Requests</strong></td>
                    <td>{staffSummary.pendingRequests || 0}</td>
                    <td>-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Staff Attendance Rate */}
          <div className={styles.section}>
            <h2>Staff Attendance Rate</h2>
            <div className={styles.genderChart}>
              <div className={styles.genderBar}>
                <div 
                  className={styles.maleBar} 
                  style={{ 
                    width: `${staffSummary.totalStaff > 0 ? ((staffSummary.present / staffSummary.totalStaff) * 100).toFixed(1) : 0}%`,
                    background: 'linear-gradient(135deg, #4caf50, #45a049)'
                  }}
                >
                  <span>Present: {staffSummary.present || 0} ({staffSummary.totalStaff > 0 ? ((staffSummary.present / staffSummary.totalStaff) * 100).toFixed(1) : 0}%)</span>
                </div>
                <div 
                  className={styles.femaleBar} 
                  style={{ 
                    width: `${staffSummary.totalStaff > 0 ? ((staffSummary.absent / staffSummary.totalStaff) * 100).toFixed(1) : 0}%`,
                    background: 'linear-gradient(135deg, #f44336, #d32f2f)'
                  }}
                >
                  <span>Absent: {staffSummary.absent || 0} ({staffSummary.totalStaff > 0 ? ((staffSummary.absent / staffSummary.totalStaff) * 100).toFixed(1) : 0}%)</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AttendanceReport;
