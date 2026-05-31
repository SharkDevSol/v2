import React, { useState, useEffect } from 'react';
import styles from './PaymentManagement.module.css';

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchPayrolls();
    fetchStaff();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const response = await fetch('/api/finance/payroll', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPayrolls(data.data);
      }
    } catch (error) {
      console.error('Error fetching payrolls:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': '#9E9E9E',
      'PENDING': '#FF9800',
      'APPROVED': '#4CAF50',
      'PAID': '#2196F3'
    };
    return colors[status] || '#9E9E9E';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Payroll Management</h1>
          <p>Process staff salaries and generate payslips</p>
        </div>
        <button className={styles.recordButton} onClick={() => setShowModal(true)}>
          + Generate Payroll
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading payrolls...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Payroll #</th>
                <th>Period</th>
                <th>Month/Year</th>
                <th>Staff Count</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.length === 0 ? (
                <tr><td colSpan="7" className={styles.noData}>No payrolls found</td></tr>
              ) : (
                payrolls.map(payroll => (
                  <tr key={payroll.id}>
                    <td className={styles.receiptNumber}>{payroll.payrollNumber}</td>
                    <td>{payroll.payPeriod}</td>
                    <td>{payroll.month}/{payroll.year}</td>
                    <td>{payroll.staffCount || 0}</td>
                    <td className={styles.amount}>${parseFloat(payroll.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(payroll.status) }}
                      >
                        {payroll.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionButton} title="View">👁️</button>
                        <button className={styles.actionButton} title="Download Payslips">📄</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <PayrollModal 
          staff={staff}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchPayrolls(); }}
        />
      )}
    </div>
  );
};

const PayrollModal = ({ staff, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    payPeriod: 'MONTHLY',
    selectedStaff: []
  });
  const [loading, setLoading] = useState(false);

  const handleStaffToggle = (staffId) => {
    const newSelected = formData.selectedStaff.includes(staffId)
      ? formData.selectedStaff.filter(id => id !== staffId)
      : [...formData.selectedStaff, staffId];
    setFormData({...formData, selectedStaff: newSelected});
  };

  const handleSelectAll = () => {
    if (formData.selectedStaff.length === staff.length) {
      setFormData({...formData, selectedStaff: []});
    } else {
      setFormData({...formData, selectedStaff: staff.map(s => s.id)});
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.selectedStaff.length === 0) {
      alert('Please select at least one staff member');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/finance/payroll', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Payroll generated successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to generate payroll');
      }
    } catch (error) {
      console.error('Error generating payroll:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className={styles.modalHeader}>
          <h2>Generate Payroll</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '20px' }}>
            <div className={styles.formGroup}>
              <label>Month *</label>
              <select
                required
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: parseInt(e.target.value)})}
              >
                {[...Array(12)].map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(2000, i).toLocaleString('default', { month: 'long' })}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Year *</label>
              <input
                type="number"
                required
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: parseInt(e.target.value)})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Pay Period *</label>
              <select
                required
                value={formData.payPeriod}
                onChange={(e) => setFormData({...formData, payPeriod: e.target.value})}
              >
                <option value="MONTHLY">Monthly</option>
                <option value="BI_WEEKLY">Bi-Weekly</option>
                <option value="WEEKLY">Weekly</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <label style={{ margin: 0 }}>Select Staff Members *</label>
              <button 
                type="button" 
                onClick={handleSelectAll}
                style={{ 
                  padding: '6px 12px', 
                  fontSize: '12px',
                  background: '#667eea',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                {formData.selectedStaff.length === staff.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div style={{ 
              maxHeight: '300px', 
              overflowY: 'auto', 
              border: '1px solid #e0e0e0', 
              borderRadius: '6px',
              padding: '12px'
            }}>
              {staff.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>No staff members found</p>
              ) : (
                staff.map(s => (
                  <label 
                    key={s.id} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      padding: '8px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      marginBottom: '4px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={formData.selectedStaff.includes(s.id)}
                      onChange={() => handleStaffToggle(s.id)}
                      style={{ marginRight: '12px', width: '18px', height: '18px' }}
                    />
                    <span>{s.name || `${s.firstName} ${s.lastName}`} - {s.position || 'Staff'}</span>
                  </label>
                ))
              )}
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              {formData.selectedStaff.length} staff member(s) selected
            </p>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Generating...' : 'Generate Payroll'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PayrollManagement;
