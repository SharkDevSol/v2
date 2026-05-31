import React, { useState, useEffect } from 'react';
import styles from './DiscountList.module.css';

const DiscountList = () => {
  const [discounts, setDiscounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDiscounts();
  }, []);

  const fetchDiscounts = async () => {
    try {
      const response = await fetch('/api/finance/discounts', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setDiscounts(data.data || []);
    } catch (error) {
      console.error('Error fetching discounts:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className={styles.container}>
      <h2>Discounts</h2>
      <button className={styles.createButton}>Create Discount</button>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Value</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {discounts.map(discount => (
            <tr key={discount.id}>
              <td>{discount.name}</td>
              <td>{discount.type}</td>
              <td>{discount.type === 'PERCENTAGE' ? `${discount.value}%` : `$${discount.value}`}</td>
              <td>{discount.isActive ? 'Active' : 'Inactive'}</td>
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

export default DiscountList;
