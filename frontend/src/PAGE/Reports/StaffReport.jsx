import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { FiUsers, FiArrowLeft, FiRefreshCw, FiDownload } from 'react-icons/fi';
import styles from './Reports.module.css';

const StaffReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    byType: [],
    byRole: [],
    byGender: null
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, byTypeRes, byRoleRes, byGenderRes] = await Promise.all([
        api.get('/reports/staff/summary'),
        api.get('/reports/staff/by-type'),
        api.get('/reports/staff/by-role'),
        api.get('/reports/staff/by-gender')
      ]);

      setData({
        summary: summaryRes.data?.data || summaryRes.data,
        byType: byTypeRes.data?.data || [],
        byRole: byRoleRes.data?.data || [],
        byGender: byGenderRes.data?.data || {}
      });
    } catch (error) {
      console.error('Error fetching staff data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Staff Reports...</p>
      </div>
    );
  }

  const summary = data.summary || {};
  const totalStaff = summary.total || summary.totalStaff || 0;

  return (
    <div className={styles.reportPage}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div className={styles.headerTitle}>
          <FiUsers className={styles.headerIcon} />
          <div>
            <h1>Staff Report</h1>
            <p>Complete staff distribution and roles</p>
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
          <h3>Total Staff</h3>
          <p className={styles.bigNumber}>{totalStaff}</p>
          <span className={styles.subtitle}>All staff members</span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Teachers</h3>
          <p className={styles.bigNumber}>{summary.teachers || 0}</p>
          <span className={styles.subtitle}>
            {totalStaff > 0 ? (((summary.teachers || 0) / totalStaff) * 100).toFixed(1) : 0}% of total
          </span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Administrative</h3>
          <p className={styles.bigNumber}>{summary.admin || summary.administrative || 0}</p>
          <span className={styles.subtitle}>
            {totalStaff > 0 ? (((summary.admin || summary.administrative || 0) / totalStaff) * 100).toFixed(1) : 0}% of total
          </span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Support Staff</h3>
          <p className={styles.bigNumber}>{summary.support || summary.supportive || 0}</p>
          <span className={styles.subtitle}>
            {totalStaff > 0 ? (((summary.support || summary.supportive || 0) / totalStaff) * 100).toFixed(1) : 0}% of total
          </span>
        </motion.div>
      </div>

      {/* Staff by Type */}
      <div className={styles.section}>
        <h2>Staff by Type</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Staff Type</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.byType.length > 0 ? (
                data.byType.map((type, idx) => (
                  <tr key={idx}>
                    <td><strong>{type.type}</strong></td>
                    <td>{type.count}</td>
                    <td>{totalStaff > 0 ? ((type.count / totalStaff) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noData}>No staff type data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Staff by Role */}
      <div className={styles.section}>
        <h2>Staff by Role</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Role</th>
                <th>Count</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.byRole.length > 0 ? (
                data.byRole.map((role, idx) => (
                  <tr key={idx}>
                    <td><strong>{role.role}</strong></td>
                    <td>{role.count}</td>
                    <td>{totalStaff > 0 ? ((role.count / totalStaff) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noData}>No role data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Gender Distribution */}
      <div className={styles.section}>
        <h2>Gender Distribution</h2>
        <div className={styles.genderChart}>
          <div className={styles.genderBar}>
            <div 
              className={styles.maleBar} 
              style={{ 
                width: `${data.byGender?.total > 0 ? ((data.byGender.male / data.byGender.total) * 100).toFixed(1) : 0}%` 
              }}
            >
              <span>Male: {data.byGender?.male || 0}</span>
            </div>
            <div 
              className={styles.femaleBar} 
              style={{ 
                width: `${data.byGender?.total > 0 ? ((data.byGender.female / data.byGender.total) * 100).toFixed(1) : 0}%` 
              }}
            >
              <span>Female: {data.byGender?.female || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffReport;
