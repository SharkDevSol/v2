import React, { useState, useEffect } from 'react';
import styles from './ScholarshipList.module.css';

const ScholarshipList = () => {
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchScholarships();
  }, []);

  const fetchScholarships = async () => {
    try {
      const response = await fetch('/api/finance/scholarships', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setScholarships(data.data || []);
    } catch (error) {
      console.error('Error fetching scholarships:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2>Scholarships</h2>
      <button className={styles.createButton}>Create Scholarship</button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Discount</th>
            <th>Max Recipients</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {scholarships.map(scholarship => (
            <tr key={scholarship.id}>
              <td>{scholarship.name}</td>
              <td>{scholarship.discount?.name || 'N/A'}</td>
              <td>{scholarship.maxRecipients || 'Unlimited'}</td>
              <td>{scholarship.isActive ? 'Active' : 'Inactive'}</td>
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

export default ScholarshipList;
