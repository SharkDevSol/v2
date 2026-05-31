import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { motion } from 'framer-motion';
import { FiBook, FiArrowLeft, FiRefreshCw, FiDownload, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
import styles from './Reports.module.css';

const AcademicReport = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    classPerformance: [],
    topPerformers: [],
    bottomPerformers: [],
    rankings: [],
    subjectAverages: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [classPerfRes, topPerfRes, bottomPerfRes, rankingsRes, subjectAvgRes] = await Promise.all([
        api.get('/reports/academic/class-performance'),
        api.get('/reports/academic/top-performers?limit=20'),
        api.get('/reports/academic/bottom-performers?limit=20'),
        api.get('/reports/academic/class-rankings'),
        api.get('/reports/academic/subject-averages')
      ]);

      setData({
        classPerformance: classPerfRes.data?.data || [],
        topPerformers: topPerfRes.data?.data || [],
        bottomPerformers: bottomPerfRes.data?.data || [],
        rankings: rankingsRes.data?.data || [],
        subjectAverages: subjectAvgRes.data?.data || []
      });
    } catch (error) {
      console.error('Error fetching academic data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Academic Reports...</p>
      </div>
    );
  }

  return (
    <div className={styles.reportPage}>
      {/* Header */}
      <div className={styles.header}>
        <button onClick={() => navigate(-1)} className={styles.backBtn}>
          <FiArrowLeft /> Back to Dashboard
        </button>
        <div className={styles.headerTitle}>
          <FiBook className={styles.headerIcon} />
          <div>
            <h1>Academic Performance Report</h1>
            <p>Student grades, rankings, and performance analysis</p>
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

      {/* Class Rankings */}
      <div className={styles.section}>
        <h2>Class Rankings by Average Score</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Class Name</th>
                <th>Average Score</th>
                <th>Total Students</th>
                <th>Pass Rate</th>
              </tr>
            </thead>
            <tbody>
              {data.rankings.length > 0 ? (
                data.rankings.map((cls, idx) => (
                  <tr key={idx}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td><strong>{cls.className}</strong></td>
                    <td className={cls.average >= 75 ? styles.success : cls.average >= 50 ? styles.warning : styles.danger}>
                      {cls.average}
                    </td>
                    <td>{cls.totalStudents}</td>
                    <td className={cls.passRate >= 75 ? styles.success : cls.passRate >= 50 ? styles.warning : styles.danger}>
                      {cls.passRate}%
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>No ranking data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Performers */}
      <div className={styles.section}>
        <h2><FiTrendingUp style={{ color: '#4caf50' }} /> Top Performing Students</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student Name</th>
                <th>Class</th>
                <th>Average Score</th>
                <th>Total Marks</th>
              </tr>
            </thead>
            <tbody>
              {data.topPerformers.length > 0 ? (
                data.topPerformers.map((student, idx) => (
                  <tr key={idx}>
                    <td><strong>#{idx + 1}</strong></td>
                    <td><strong>{student.name || student.studentName}</strong></td>
                    <td>{student.className}</td>
                    <td className={styles.success}>{student.average || student.averageScore}</td>
                    <td>{student.totalMarks || 'N/A'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className={styles.noData}>No top performer data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Students Needing Support */}
      <div className={styles.section}>
        <h2><FiTrendingDown style={{ color: '#f44336' }} /> Students Needing Support</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Student Name</th>
                <th>Class</th>
                <th>Average Score</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.bottomPerformers.length > 0 ? (
                data.bottomPerformers.map((student, idx) => (
                  <tr key={idx}>
                    <td><strong>{student.name || student.studentName}</strong></td>
                    <td>{student.className}</td>
                    <td className={styles.danger}>{student.average || student.averageScore}</td>
                    <td className={styles.warning}>Needs Support</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className={styles.noData}>No students needing support</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Subject Averages */}
      {data.subjectAverages.length > 0 && (
        <div className={styles.section}>
          <h2>Subject Averages</h2>
          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Average Score</th>
                  <th>Total Students</th>
                  <th>Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.subjectAverages.map((subject, idx) => (
                  <tr key={idx}>
                    <td><strong>{subject.subjectName}</strong></td>
                    <td className={subject.average >= 75 ? styles.success : subject.average >= 50 ? styles.warning : styles.danger}>
                      {subject.average}
                    </td>
                    <td>{subject.totalStudents}</td>
                    <td className={subject.passRate >= 75 ? styles.success : subject.passRate >= 50 ? styles.warning : styles.danger}>
                      {subject.passRate}%
                    </td>
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

export default AcademicReport;
