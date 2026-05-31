import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { FiAward, FiArrowLeft, FiRefreshCw, FiDownload } from 'react-icons/fi';
import styles from './Reports.module.css';

const EvaluationsReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    byClass: [],
    responseRates: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, byClassRes, responseRatesRes] = await Promise.all([
        api.get('/reports/evaluations/summary'),
        api.get('/reports/evaluations/by-class'),
        api.get('/reports/evaluations/response-rates')
      ]);

      setData({
        summary: summaryRes.data?.data || summaryRes.data,
        byClass: byClassRes.data?.data || [],
        responseRates: responseRatesRes.data?.data || []
      });
    } catch (error) {
      console.error('Error fetching evaluations data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Evaluations Reports...</p>
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
          <FiAward className={styles.headerIcon} />
          <div>
            <h1>Evaluations Report</h1>
            <p>Student evaluations and guardian responses</p>
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
          <h3>Total Evaluations</h3>
          <p className={styles.bigNumber}>{summary.total || 0}</p>
          <span className={styles.subtitle}>All evaluations</span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Completed</h3>
          <p className={styles.bigNumber} style={{ color: '#4caf50' }}>{summary.completed || 0}</p>
          <span className={styles.subtitle}>
            {summary.total > 0 ? ((summary.completed / summary.total) * 100).toFixed(1) : 0}% completion
          </span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Pending</h3>
          <p className={styles.bigNumber} style={{ color: '#ff9800' }}>{summary.pending || 0}</p>
          <span className={styles.subtitle}>Awaiting completion</span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Guardian Responses</h3>
          <p className={styles.bigNumber}>{summary.responded || 0}</p>
          <span className={styles.subtitle}>Feedback received</span>
        </motion.div>
      </div>

      {/* Evaluations by Class */}
      <div className={styles.section}>
        <h2>Evaluations by Class</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Total Evaluations</th>
                <th>Completed</th>
                <th>Pending</th>
                <th>Completion Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.byClass.length > 0 ? (
                data.byClass.map((cls, idx) => (
                  <tr key={idx}>
                    <td><strong>{cls.className}</strong></td>
                    <td>{cls.total}</td>
                    <td className={styles.success}>{cls.completed}</td>
                    <td className={styles.warning}>{cls.pending}</td>
                    <td className={
                      cls.completionRate >= 90 ? styles.success : 
                      cls.completionRate >= 70 ? styles.warning : 
                      styles.danger
                    }>
                      {cls.completionRate || (cls.total > 0 ? ((cls.completed / cls.total) * 100).toFixed(1) : 0)}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>No evaluation data by class</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guardian Response Rates */}
      <div className={styles.section}>
        <h2>Guardian Response Rates</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Total Sent</th>
                <th>Responses Received</th>
                <th>Response Rate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.responseRates.length > 0 ? (
                data.responseRates.map((cls, idx) => (
                  <tr key={idx}>
                    <td><strong>{cls.className}</strong></td>
                    <td>{cls.totalSent || cls.total}</td>
                    <td className={styles.success}>{cls.responses || cls.responded}</td>
                    <td className={
                      cls.responseRate >= 80 ? styles.success : 
                      cls.responseRate >= 50 ? styles.warning : 
                      styles.danger
                    }>
                      {cls.responseRate || (cls.totalSent > 0 ? ((cls.responses / cls.totalSent) * 100).toFixed(1) : 0)}%
                    </td>
                    <td className={
                      cls.responseRate >= 80 ? styles.success : 
                      cls.responseRate >= 50 ? styles.warning : 
                      styles.danger
                    }>
                      {cls.responseRate >= 80 ? 'Excellent' : 
                       cls.responseRate >= 50 ? 'Good' : 
                       'Needs Improvement'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>No response rate data</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default EvaluationsReport;
