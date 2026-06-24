import React, { useState } from 'react';
import styles from '../Finance/FinanceReports.module.css';

const AssetReports = () => {
  const [selectedReport, setSelectedReport] = useState('asset-summary');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);

  const reports = [
    {
      id: 'asset-summary',
      name: 'Asset Summary',
      description: 'Complete list of all assets with current status',
      icon: '📊'
    },
    {
      id: 'depreciation-schedule',
      name: 'Depreciation Schedule',
      description: 'Depreciation schedule for all assets',
      icon: '📉'
    },
    {
      id: 'maintenance-history',
      name: 'Maintenance History',
      description: 'Complete maintenance history and costs',
      icon: '🔧'
    },
    {
      id: 'asset-utilization',
      name: 'Asset Utilization',
      description: 'Asset assignment and utilization rates',
      icon: '📈'
    },
    {
      id: 'disposal-report',
      name: 'Disposal Report',
      description: 'Assets disposed with gain/loss analysis',
      icon: '🗑️'
    },
    {
      id: 'warranty-expiry',
      name: 'Warranty Expiry',
      description: 'Assets with expiring warranties',
      icon: '⚠️'
    }
  ];

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      });

      const response = await fetch(`/api/assets/reports/${selectedReport}?${params}`, {
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

      const response = await fetch(`/api/assets/reports/${selectedReport}/export?${params}`, {
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
        <table>
          <thead>
            <tr>
              <th>Asset Tag</th>
              <th>Asset Name</th>
              <th>Category</th>
              <th>Purchase Date</th>
              <th>Purchase Cost</th>
              <th>Current Value</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {reportData?.assets?.length === 0 ? (
              <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No data found</td></tr>
            ) : (
              reportData?.assets?.map((asset, index) => (
                <tr key={index}>
                  <td>{asset.assetTag}</td>
                  <td>{asset.name}</td>
                  <td>{asset.category}</td>
                  <td>{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                  <td>${parseFloat(asset.purchaseCost).toFixed(2)}</td>
                  <td>${parseFloat(asset.currentValue || asset.purchaseCost).toFixed(2)}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 8px', 
                      borderRadius: '4px', 
                      fontSize: '12px',
                      background: asset.status === 'ACTIVE' ? '#e8f5e9' : '#ffebee',
                      color: asset.status === 'ACTIVE' ? '#4CAF50' : '#F44336'
                    }}>
                      {asset.status}
                    </span>
                  </td>
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
        <h1>Asset Reports</h1>
        <p>View and analyze asset data</p>
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

export default AssetReports;
