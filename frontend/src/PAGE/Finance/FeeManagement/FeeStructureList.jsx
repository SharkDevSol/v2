import React, { useState, useEffect } from 'react';
import styles from './FeeStructureList.module.css';

const FeeStructureList = () => {
  const [feeStructures, setFeeStructures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFeeStructures();
  }, []);

  const fetchFeeStructures = async () => {
    try {
      const response = await fetch('/api/finance/fee-structures', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setFeeStructures(data.data || []);
    } catch (error) {
      console.error('Error fetching fee structures:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2>Fee Structures</h2>
      <button className={styles.createButton}>Create Fee Structure</button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Academic Year</th>
            <th>Grade Level</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {feeStructures.map(structure => (
            <tr key={structure.id}>
              <td>{structure.name}</td>
              <td>{structure.academicYearId}</td>
              <td>{structure.gradeLevel || 'All'}</td>
              <td>{structure.isActive ? 'Active' : 'Inactive'}</td>
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

export default FeeStructureList;
