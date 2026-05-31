import React, { useState, useEffect } from 'react';
import styles from '../Finance/FinanceReports.module.css';

const AssetDepreciation = () => {
  const [depreciationData, setDepreciationData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDepreciationData();
  }, [selectedYear]);

  const fetchDepreciationData = async () => {
    try {
      const response = await fetch(`/api/assets/depreciation?year=${selectedYear}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepreciationData(data.data);
      }
    } catch (error) {
      console.error('Error fetching depreciation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDepreciation = async () => {
    if (!confirm('Calculate depreciation for all assets?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/assets/depreciation/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ year: selectedYear })
      });
      
      if (response.ok) {
        alert('Depreciation calculated successfully!');
        fetchDepreciationData();
      } else {
        alert('Failed to calculate depreciation');
      }
    } catch (error) {
      console.error('Error calculating depreciation:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const postToAccounting = async () => {
    if (!confirm('Post depreciation entries to accounting system?')) return;
    
    try {
      const response = await fetch('/api/assets/depreciation/post-to-accounting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ year: selectedYear })
      });
      
      if (response.ok) {
        alert('Depreciation posted to accounting successfully!');
      } else {
        alert('Failed to post to accounting');
      }
    } catch (error) {
      console.error('Error posting to accounting:', error);
      alert('An error occurred');
    }
  };

  const totalDepreciation = depreciationData.reduce((sum, item) => sum + parseFloat(item.depreciationAmount || 0), 0);
  const totalCurrentValue = depreciationData.reduce((sum, item) => sum + parseFloat(item.currentValue || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Asset Depreciation</h1>
        <p>Calculate and track asset depreciation</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.dateRange}>
          <div className={styles.dateInput}>
            <label>Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #e0e0e0' }}
            >
              {[...Array(5)].map((_, i) => {
                const year = new Date().getFullYear() - i;
                return <option key={year} value={year}>{year}</option>;
              })}
            </select>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.generateButton} onClick={calculateDepreciation} disabled={loading}>
            🔄 Calculate Depreciation
          </button>
          <button className={styles.exportButton} onClick={postToAccounting}>
            📊 Post to Accounting
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Assets</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#2196F3' }}>{depreciationData.length}</div>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Depreciation ({selectedYear})</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#F44336' }}>${totalDepreciation.toFixed(2)}</div>
        </div>
        <div style={{ padding: '20px', background: 'white', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>Total Current Value</div>
          <div style={{ fontSize: '28px', fontWeight: 700, color: '#4CAF50' }}>${totalCurrentValue.toFixed(2)}</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading depreciation data...</div>
      ) : (
        <div className={styles.reportTable}>
          <table>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Purchase Cost</th>
                <th>Purchase Date</th>
                <th>Method</th>
                <th>Useful Life</th>
                <th>Accumulated Depreciation</th>
                <th>Current Value</th>
                <th>Annual Depreciation</th>
              </tr>
            </thead>
            <tbody>
              {depreciationData.length === 0 ? (
                <tr><td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#999' }}>No depreciation data found</td></tr>
              ) : (
                depreciationData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.assetTag}</td>
                    <td>{item.assetName}</td>
                    <td>${parseFloat(item.purchaseCost).toFixed(2)}</td>
                    <td>{new Date(item.purchaseDate).toLocaleDateString()}</td>
                    <td>{item.depreciationMethod === 'STRAIGHT_LINE' ? 'Straight Line' : 'Declining Balance'}</td>
                    <td>{item.usefulLife} years</td>
                    <td>${parseFloat(item.accumulatedDepreciation || 0).toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: '#4CAF50' }}>${parseFloat(item.currentValue).toFixed(2)}</td>
                    <td style={{ fontWeight: 600, color: '#F44336' }}>${parseFloat(item.depreciationAmount || 0).toFixed(2)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AssetDepreciation;
