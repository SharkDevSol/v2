import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { FiUsers, FiArrowLeft, FiRefreshCw, FiDownload } from 'react-icons/fi';
import styles from './Reports.module.css';

const StudentsReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    summary: null,
    byClass: [],
    byGender: null,
    byAge: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [summaryRes, byClassRes, byGenderRes, byAgeRes] = await Promise.all([
        api.get('/reports/students/summary'),
        api.get('/reports/students/by-class'),
        api.get('/reports/students/by-gender'),
        api.get('/reports/students/by-age')
      ]);

      setData({
        summary: summaryRes.data?.data || summaryRes.data,
        byClass: byClassRes.data?.data || [],
        byGender: byGenderRes.data?.data || {},
        byAge: byAgeRes.data?.data || []
      });
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Student Reports...</p>
      </div>
    );
  }

  const summary = data.summary || {};
  const totalStudents = summary.total || summary.totalStudents || (summary.male || 0) + (summary.female || 0);

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
            <h1>Students Report</h1>
            <p>Complete student enrollment and demographics</p>
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
          <h3>Total Students</h3>
          <p className={styles.bigNumber}>{totalStudents}</p>
          <span className={styles.subtitle}>Enrolled across all classes</span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Male Students</h3>
          <p className={styles.bigNumber}>{summary.male || 0}</p>
          <span className={styles.subtitle}>
            {totalStudents > 0 ? ((summary.male / totalStudents) * 100).toFixed(1) : 0}% of total
          </span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Female Students</h3>
          <p className={styles.bigNumber}>{summary.female || 0}</p>
          <span className={styles.subtitle}>
            {totalStudents > 0 ? ((summary.female / totalStudents) * 100).toFixed(1) : 0}% of total
          </span>
        </motion.div>
        <motion.div className={styles.card} whileHover={{ scale: 1.02 }}>
          <h3>Total Classes</h3>
          <p className={styles.bigNumber}>{summary.classCount || summary.totalClasses || 0}</p>
          <span className={styles.subtitle}>
            Avg: {summary.classCount ? Math.round(totalStudents / summary.classCount) : 0} students/class
          </span>
        </motion.div>
      </div>

      {/* Students by Class */}
      <div className={styles.section}>
        <h2>Students by Class</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Class Name</th>
                <th>Total Students</th>
                <th>Male</th>
                <th>Female</th>
                <th>Male %</th>
                <th>Female %</th>
              </tr>
            </thead>
            <tbody>
              {data.byClass.length > 0 ? (
                data.byClass.map((cls, idx) => (
                  <tr key={idx}>
                    <td><strong>{cls.className}</strong></td>
                    <td>{cls.total}</td>
                    <td className={styles.male}>{cls.male}</td>
                    <td className={styles.female}>{cls.female}</td>
                    <td>{cls.total > 0 ? ((cls.male / cls.total) * 100).toFixed(1) : 0}%</td>
                    <td>{cls.total > 0 ? ((cls.female / cls.total) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className={styles.noData}>No class data available</td>
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
              style={{ width: `${data.byGender?.malePercent || 0}%` }}
            >
              <span>Male: {data.byGender?.male || 0} ({data.byGender?.malePercent || 0}%)</span>
            </div>
            <div 
              className={styles.femaleBar} 
              style={{ width: `${data.byGender?.femalePercent || 0}%` }}
            >
              <span>Female: {data.byGender?.female || 0} ({data.byGender?.femalePercent || 0}%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Age Distribution */}
      <div className={styles.section}>
        <h2>Age Distribution</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Age</th>
                <th>Number of Students</th>
                <th>Percentage</th>
              </tr>
            </thead>
            <tbody>
              {data.byAge.length > 0 ? (
                data.byAge.map((ageGroup, idx) => (
                  <tr key={idx}>
                    <td><strong>{ageGroup.age} years</strong></td>
                    <td>{ageGroup.count}</td>
                    <td>{totalStudents > 0 ? ((ageGroup.count / totalStudents) * 100).toFixed(1) : 0}%</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className={styles.noData}>No age data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsReport;
