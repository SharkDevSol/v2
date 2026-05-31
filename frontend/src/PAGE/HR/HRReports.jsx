import React, { useState } from 'react';
import styles from '../Finance/FinanceReports.module.css';

const HRReports = () => {
  const [selectedReport, setSelectedReport] = useState('staff-summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    {
      id: 'staff-summary',
      name: 'Staff Summary',
      description: 'Complete staff list with departments and roles',
      icon: '👥'
    },
    {
      id: 'attendance-report',
      name: 'Attendance Report',
      description: 'Staff attendance analysis and trends',
      icon: '⏰'
    },
    {
      id: 'leave-report',
      name: 'Leave Report',
      description: 'Leave balance and utilization analysis',
      icon: '🏖️'
    },
    {
      id: 'payroll-report',
      name: 'Payroll Report',
      description: 'Payroll summary and cost analysis',
      icon: '💰'
    },
    {
      id: 'performance-report',
      name: 'Performance Report',
      description: 'Performance ratings and trends',
      icon: '📊'
    },
    {
      id: 'training-report',
      name: 'Training Report',
      description: 'Training participation and completion rates',
      icon: '🎓'
    },
    {
      id: 'recruitment-report',
      name: 'Recruitment Report',
      description: 'Hiring pipeline and time-to-hire metrics',
      icon: '📢'
    },
    {
      id: 'turnover-report',
      name: 'Turnover Report',
      description: 'Staff turnover and retention analysis',
      icon: '📉'
    }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/hr/reports/${selectedReport}?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const data = await response.json();
        setReportData(data.data);
      } else {
        alert('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format) => {
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format
      });

      const response = await fetch(`/api/hr/reports/${selectedReport}/export?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${selectedReport}-${new Date().toISOString().split('T')[0]}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert('Failed to export report');
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('An error occurred');
    }
  };

  const renderReportContent = () => {
    if (!reportData) {
      return (
        <div className={styles.emptyState}>
          <p>Select a report and click "Generate Report" to view data</p>
        </div>
      );
    }

    return (
      <div className={styles.reportTable}>
        <h2>{reports.find(r => r.id === selectedReport)?.name}</h2>
        
        {reportData.summary && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {Object.entries(reportData.summary).map(([key, value]) => (
              <div key={key} style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                  {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </div>
                <div style={{ fontSize: '24px', fontWeight: 700, color: '#2196F3' }}>
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </div>
              </div>
            ))}
          </div>
        )}

        <table>
          <thead>
            <tr>
              {reportData.columns?.map((col, index) => (
                <th key={index}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reportData.rows?.length === 0 ? (
              <tr><td colSpan={reportData.columns?.length || 1} style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No data found</td></tr>
            ) : (
              reportData.rows?.map((row, index) => (
                <tr key={index}>
                  {Object.values(row).map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>HR Reports</h1>
        <p>HR analytics and comprehensive reports</p>
      </div>

      <div className={styles.reportSelector}>
        <div className={styles.reportGrid}>
          {reports.map(report => (
            <div
              key={report.id}
              className={`${styles.reportCard} ${selectedReport === report.id ? styles.selected : ''}`}
              onClick={() => setSelectedReport(report.id)}
            >
              <div className={styles.reportIcon}>{report.icon}</div>
              <h3>{report.name}</h3>
              <p>{report.description}</p>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.dateRange}>
          <div className={styles.dateInput}>
            <label>Start Date</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
            />
          </div>
          <div className={styles.dateInput}>
            <label>End Date</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
            />
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.generateButton} onClick={generateReport} disabled={loading}>
            {loading ? 'Generating...' : '📊 Generate Report'}
          </button>
          {reportData && (
            <>
              <button className={styles.exportButton} onClick={() => exportReport('pdf')}>
                📄 Export PDF
              </button>
              <button className={styles.exportButton} onClick={() => exportReport('xlsx')}>
                📊 Export Excel
              </button>
            </>
          )}
        </div>
      </div>

      <div className={styles.reportContent}>
        {renderReportContent()}
      </div>
    </div>
  );
};

export default HRReports;
