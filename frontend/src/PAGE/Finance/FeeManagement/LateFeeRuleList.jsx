import React, { useState, useEffect } from 'react';
import styles from './LateFeeRuleList.module.css';

const LateFeeRuleList = () => {
  const [lateFeeRules, setLateFeeRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLateFeeRules();
  }, []);

  const fetchLateFeeRules = async () => {
    try {
      const response = await fetch('/api/finance/late-fee-rules', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setLateFeeRules(data.data || []);
    } catch (error) {
      console.error('Error fetching late fee rules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2>Late Fee Rules</h2>
      <button className={styles.createButton}>Create Late Fee Rule</button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
            <th>Grace Period (Days)</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {lateFeeRules.map(rule => (
            <tr key={rule.id}>
              <td>{rule.name}</td>
              <td>{rule.type}</td>
              <td>{rule.type === 'PERCENTAGE' ? `${rule.value}%` : `$${rule.value}`}</td>
              <td>{rule.gracePeriodDays}</td>
              <td>{rule.isActive ? 'Active' : 'Inactive'}</td>
              <td>
                <button>View</button>
                <button>Edit</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LateFeeRuleList;
