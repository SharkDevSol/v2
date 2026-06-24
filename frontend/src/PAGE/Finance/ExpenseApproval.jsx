import React, { useState, useEffect } from 'react';
import styles from './PaymentManagement.module.css';

const ExpenseApproval = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchPendingExpenses();
  }, []);

  const fetchPendingExpenses = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/finance/expenses?status=PENDING', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setExpenses(data.data);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (expenseId) => {
    if (!confirm('Are you sure you want to approve this expense?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/finance/expenses/${expenseId}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Expense approved successfully!');
        fetchPendingExpenses();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to approve expense');
      }
    } catch (error) {
      console.error('Error approving expense:', error);
      alert('An error occurred');
    }
  };

  const handleReject = async () => {
    if (!selectedExpense) return;
    
    // Validate rejection reason
    if (!rejectReason || rejectReason.trim() === '') {
      alert('Please provide a reason for rejecting this expense');
      return;
    }

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/finance/expenses/${selectedExpense.id}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ reason: rejectReason })
      });

      if (response.ok) {
        alert('Expense rejected successfully!');
        setShowRejectModal(false);
        setRejectReason('');
        setSelectedExpense(null);
        fetchPendingExpenses();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to reject expense');
      }
    } catch (error) {
      console.error('Error rejecting expense:', error);
      alert('An error occurred');
    }
  };

  const openRejectModal = (expense) => {
    setSelectedExpense(expense);
    setShowRejectModal(true);
  };

  const openDetailsModal = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Expense Approval</h1>
          <p>Review and approve pending expense requests</p>
        </div>
        <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
          {expenses.length} Pending
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading expenses...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Expense #</th>
                <th>Date</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th>Requested By</th>
                <th>Vendor</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan="8" className={styles.noData}>No pending expenses</td></tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id}>
                    <td className={styles.receiptNumber}>{expense.expenseNumber}</td>
                    <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td>
                      {expense.description}
                      {expense.poNumber && (
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          PO: {expense.poNumber}
                        </div>
                      )}
                    </td>
                    <td className={styles.amount}>${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>{expense.requestedBy}</td>
                    <td>{expense.vendorName || '-'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.actionButton} 
                          onClick={() => openDetailsModal(expense)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        <button 
                          className={styles.actionButton}
                          onClick={() => handleApprove(expense.id)}
                          title="Approve"
                          style={{ color: '#4CAF50' }}
                        >
                          ✅
                        </button>
                        <button 
                          className={styles.actionButton}
                          onClick={() => openRejectModal(expense)}
                          title="Reject"
                          style={{ color: '#F44336' }}
                        >
                          ❌
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showDetailsModal && selectedExpense && (
        <ExpenseDetailsModal 
          expense={selectedExpense}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedExpense(null);
          }}
        />
      )}

      {showRejectModal && (
        <div className={styles.modalOverlay} onClick={() => setShowRejectModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
            <div className={styles.modalHeader}>
              <h2>Reject Expense</h2>
              <button className={styles.closeButton} onClick={() => setShowRejectModal(false)}>×</button>
            </div>
            
            <div style={{ padding: '20px' }}>
              <p style={{ marginBottom: '15px', color: '#666' }}>
                Please provide a reason for rejecting this expense: <span style={{ color: '#F44336' }}>*</span>
              </p>
              <textarea
                required
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason... (required)"
                style={{
                  width: '100%',
                  minHeight: '100px',
                  padding: '10px',
                  border: rejectReason.trim() === '' ? '1px solid #F44336' : '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '14px',
                  fontFamily: 'inherit'
                }}
              />
              {rejectReason.trim() === '' && (
                <div style={{ color: '#F44336', fontSize: '12px', marginTop: '5px' }}>
                  * Rejection reason is required
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button 
                type="button" 
                onClick={() => setShowRejectModal(false)} 
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={handleReject}
                disabled={!rejectReason || rejectReason.trim() === ''}
                className={styles.submitButton}
                style={{ 
                  backgroundColor: !rejectReason || rejectReason.trim() === '' ? '#ccc' : '#F44336',
                  cursor: !rejectReason || rejectReason.trim() === '' ? 'not-allowed' : 'pointer'
                }}
              >
                Reject Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ExpenseDetailsModal = ({ expense, onClose }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className={styles.modalHeader}>
          <h2>Expense Details</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          {/* Rejection Reason - If exists */}
          {expense.rejectionReason && (
            <div style={{ 
              marginBottom: '20px',
              padding: '15px',
              background: '#ffebee',
              border: '2px solid #ef5350',
              borderRadius: '8px'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 700, 
                color: '#c62828', 
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                Rejection Reason
              </div>
              <div style={{ fontSize: '15px', color: '#d32f2f', lineHeight: '1.6' }}>
                {expense.rejectionReason}
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Expense Number
              </label>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1976d2' }}>
                {expense.expenseNumber}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Status
              </label>
              <span 
                className={styles.statusBadge}
                style={{ backgroundColor: '#FF9800' }}
              >
                {expense.status}
              </span>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Category
              </label>
              <div style={{ fontSize: '14px', fontWeight: 500 }}>
                {expense.category}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Amount
              </label>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#4CAF50' }}>
                ${parseFloat(expense.amount).toFixed(2)}
              </div>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Description
              </label>
              <div style={{ fontSize: '14px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                {expense.description}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Expense Date
              </label>
              <div style={{ fontSize: '14px' }}>
                {new Date(expense.expenseDate).toLocaleDateString()}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Created Date
              </label>
              <div style={{ fontSize: '14px' }}>
                {new Date(expense.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Requested By
              </label>
              <div style={{ fontSize: '14px' }}>
                {expense.requestedBy}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Vendor Name
              </label>
              <div style={{ fontSize: '14px' }}>
                {expense.vendorName || '-'}
              </div>
            </div>

            <div>
              <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                Payment Method
              </label>
              <div style={{ fontSize: '14px' }}>
                {expense.paymentMethod}
              </div>
            </div>

            {expense.poNumber && (
              <div>
                <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px' }}>
                  PO Number
                </label>
                <div style={{ fontSize: '14px' }}>
                  {expense.poNumber}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className={styles.modalActions}>
          <button type="button" onClick={onClose} className={styles.cancelButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseApproval;
