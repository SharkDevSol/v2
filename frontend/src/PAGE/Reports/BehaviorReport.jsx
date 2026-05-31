import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiArrowLeft, FiRefreshCw, FiDownload } from 'react-icons/fi';
import styles from './Reports.module.css';

const BehaviorReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    byClass: [],
    byType: [],
    byLevel: [],
    recent: [],
    topOffenders: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, byClassRes, byTypeRes, byLevelRes, recentRes, topOffendersRes] = await Promise.all([
        api.get('/reports/faults/summary'),
        api.get('/reports/faults/by-class'),
        api.get('/reports/faults/by-type'),
        api.get('/reports/faults/by-level'),
        api.get('/reports/faults/recent?days=30&limit=50'),
        api.get('/reports/faults/top-offenders?limit=20')
      ]);

      setData({
        summary: summaryRes.data?.data || summaryRes.data,
        byClass: byClassRes.data?.data || [],
        byType: byTypeRes.data?.data || [],
        byLevel: byLevelRes.data?.data || [],
        recent: recentRes.data?.data || [],
        topOffenders: topOffendersRes.data?.data || []
      });
    } catch (error) {
      console.error('Error fetching behavior data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Behavior Reports...</p>
      </div>
    );
  }

  const summary = data.summary || {};

  return (
    <div className={styles.reportPage}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div className={styles.headerTitle}>
          <FiAlertCircle className={styles.headerIcon} />
          <div>
            <h1>Behavior & Discipline Report</h1>
            <p>Student conduct and fault records</p>
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

      {/* Summary Cards */}
      <div className={styles.summaryCards}>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Total Faults</h3>
          <p className={styles.bigNumber} style={{ color: '#f44336' }}>{summary.totalFaults || summary.total || 0}</p>
          <span className={styles.subtitle}>All recorded faults</span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>This Week</h3>
          <p className={styles.bigNumber} style={{ color: '#ff9800' }}>{summary.weeklyFaults || summary.thisWeek || 0}</p>
          <span className={styles.subtitle}>Faults this week</span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Critical Faults</h3>
          <p className={styles.bigNumber} style={{ color: '#d32f2f' }}>{summary.criticalFaults || summary.critical || 0}</p>
          <span className={styles.subtitle}>Severe incidents</span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Students with Faults</h3>
          <p className={styles.bigNumber}>{summary.uniqueStudents || 0}</p>
          <span className={styles.subtitle}>Unique students</span>
        </motion.div>
      </div>

      {/* Faults by Class */}
      <div className={styles.section}>
        <h2>Faults by Class</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Total Faults</th>
                <th>Critical</th>
                <th>Major</th>
                <th>Minor</th>
              </tr>
            </thead>
            <tbody>
              {data.byClass.length > 0 ? (
                data.byClass.map((cls, idx) => (
                  <tr key={idx}>
                    <td><strong>{cls.className}</strong></td>
                    <td className={styles.danger}>{cls.count || cls.total}</td>
                    <td className={styles.danger}>{cls.critical || 0}</td>
                    <td className={styles.warning}>{cls.major || 0}</td>
                    <td>{cls.minor || 0}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>No fault data by class</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faults by Type */}
      <div className={styles.section}>
        <h2>Faults by Type</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Fault Type</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.byType.length > 0 ? (
                data.byType.map((type, idx) => (
                  <tr key={idx}>
                    <td><strong>{type.type || type.faultType}</strong></td>
                    <td className={styles.danger}>{type.count}</td>
                    <td>{summary.totalFaults > 0 ? ((type.count / summary.totalFaults) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noData}>No fault type data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Faults by Severity Level */}
      <div className={styles.section}>
        <h2>Faults by Severity Level</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Severity Level</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.byLevel.length > 0 ? (
                data.byLevel.map((level, idx) => (
                  <tr key={idx}>
                    <td>
                      <strong className={
                        level.level === 'Critical' ? styles.danger : 
                        level.level === 'Major' ? styles.warning : ''
                      }>
                        {level.level}
                      </strong>
                    </td>
                    <td className={
                      level.level === 'Critical' ? styles.danger : 
                      level.level === 'Major' ? styles.warning : ''
                    }>
                      {level.count}
                    </td>
                    <td>{summary.totalFaults > 0 ? ((level.count / summary.totalFaults) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noData}>No severity level data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Faults */}
      <div className={styles.section}>
        <h2>Recent Faults (Last 30 Days)</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Fault Type</th>
                <th>Severity</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {data.recent.length > 0 ? (
                data.recent.map((fault, idx) => (
                  <tr key={idx}>
                    <td>{new Date(fault.date || fault.createdAt).toLocaleDateString()}</td>
                    <td><strong>{fault.studentName || fault.name}</strong></td>
                    <td>{fault.className}</td>
                    <td>{fault.type || fault.faultType}</td>
                    <td className={
                      fault.level === 'Critical' || fault.severity === 'Critical' ? styles.danger : 
                      fault.level === 'Major' || fault.severity === 'Major' ? styles.warning : ''
                    }>
                      {fault.level || fault.severity}
                    </td>
                    <td>{fault.description || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>No recent faults</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Offenders */}
      {data.topOffenders.length > 0 && (
        <div className={styles.section}>
          <h2>Students with Most Faults</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Total Faults</th>
                  <th>Critical</th>
                  <th>Major</th>
                  <th>Minor</th>
                </tr>
              </thead>
              <tbody>
                {data.topOffenders.map((student, idx) => (
                  <tr key={idx}>
                    <td><strong>{student.studentName || student.name}</strong></td>
                    <td>{student.className}</td>
                    <td className={styles.danger}>{student.totalFaults || student.count}</td>
                    <td className={styles.danger}>{student.critical || 0}</td>
                    <td className={styles.warning}>{student.major || 0}</td>
                    <td>{student.minor || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BehaviorReport;
