import React, { useState, useEffect } from 'react';
import styles from './PaymentManagement.module.css';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchExpenses();
    fetchStaff();
  }, [filter]);

  const fetchExpenses = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      
      const response = await fetch(`/api/finance/expenses?${params}`, {
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

  const fetchStaff = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/staff', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleMarkAsPaid = async (expenseId) => {
    if (!confirm('Are you sure you want to mark this expense as paid?')) return;

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch(`/api/finance/expenses/${expenseId}/mark-paid`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        alert('Expense marked as paid successfully!');
        fetchExpenses();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to mark expense as paid');
      }
    } catch (error) {
      console.error('Error marking expense as paid:', error);
      alert('An error occurred');
    }
  };

  const openDetailsModal = (expense) => {
    setSelectedExpense(expense);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': '#9E9E9E',
      'PENDING': '#FF9800',
      'APPROVED': '#4CAF50',
      'REJECTED': '#F44336',
      'PAID': '#2196F3'
    };
    return colors[status] || '#9E9E9E';
  };

  const getTotalAmount = () => {
    return expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);
  };

  const getStatusCounts = () => {
    return {
      ALL: expenses.length,
      PENDING: expenses.filter(e => e.status === 'PENDING').length,
      APPROVED: expenses.filter(e => e.status === 'APPROVED').length,
      PAID: expenses.filter(e => e.status === 'PAID').length,
      REJECTED: expenses.filter(e => e.status === 'REJECTED').length,
    };
  };

  const getSummaryStats = () => {
    const allExpenses = expenses;
    const pending = allExpenses.filter(e => e.status === 'PENDING');
    const approved = allExpenses.filter(e => e.status === 'APPROVED');
    const paid = allExpenses.filter(e => e.status === 'PAID');
    const rejected = allExpenses.filter(e => e.status === 'REJECTED');

    return {
      totalExpenses: allExpenses.length,
      totalAmount: allExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0),
      pendingCount: pending.length,
      pendingAmount: pending.reduce((sum, e) => sum + parseFloat(e.amount), 0),
      approvedCount: approved.length,
      approvedAmount: approved.reduce((sum, e) => sum + parseFloat(e.amount), 0),
      paidCount: paid.length,
      paidAmount: paid.reduce((sum, e) => sum + parseFloat(e.amount), 0),
      rejectedCount: rejected.length,
      rejectedAmount: rejected.reduce((sum, e) => sum + parseFloat(e.amount), 0),
    };
  };

  const counts = getStatusCounts();
  const stats = getSummaryStats();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Expense Management</h1>
          <p>Track and manage organizational expenses</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
              Total {filter === 'ALL' ? 'All' : filter}
            </div>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: getStatusColor(filter) }}>
              ${getTotalAmount().toFixed(2)}
            </div>
          </div>
          <button className={styles.recordButton} onClick={() => setShowModal(true)}>
            + Add Expense
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
        gap: '20px', 
        marginBottom: '30px' 
      }}>
        {/* Total Expenses Card */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            Total Expenses
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.totalExpenses}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            ${stats.totalAmount.toFixed(2)}
          </div>
        </div>

        {/* Pending Card */}
        <div style={{
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}
        onClick={() => setFilter('PENDING')}
        >
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            ⏳ Pending Approval
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.pendingCount}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            ${stats.pendingAmount.toFixed(2)}
          </div>
        </div>

        {/* Approved Card */}
        <div style={{
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}
        onClick={() => setFilter('APPROVED')}
        >
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            ✅ Approved (Unpaid)
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.approvedCount}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            ${stats.approvedAmount.toFixed(2)}
          </div>
        </div>

        {/* Paid Card */}
        <div style={{
          background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}
        onClick={() => setFilter('PAID')}
        >
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            💵 Paid
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.paidCount}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            ${stats.paidAmount.toFixed(2)}
          </div>
        </div>

        {/* Rejected Card */}
        <div style={{
          background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
          padding: '20px',
          borderRadius: '12px',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          cursor: 'pointer'
        }}
        onClick={() => setFilter('REJECTED')}
        >
          <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
            ❌ Rejected
          </div>
          <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
            {stats.rejectedCount}
          </div>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>
            ${stats.rejectedAmount.toFixed(2)}
          </div>
        </div>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          {['ALL', 'PENDING', 'APPROVED', 'PAID', 'REJECTED'].map(status => (
            <button
              key={status}
              className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
            >
              {status} ({counts[status] || 0})
            </button>
          ))}
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
                <th>Source</th>
                <th>Status</th>
                {filter === 'REJECTED' && <th>Rejection Reason</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr><td colSpan={filter === 'REJECTED' ? '10' : '9'} className={styles.noData}>No expenses found</td></tr>
              ) : (
                expenses.map(expense => (
                  <tr key={expense.id}>
                    <td className={styles.receiptNumber}>{expense.expenseNumber}</td>
                    <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                    <td>{expense.category}</td>
                    <td>
                      {expense.description.length > 50 
                        ? expense.description.substring(0, 50) + '...' 
                        : expense.description}
                      {expense.poNumber && (
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '2px' }}>
                          PO: {expense.poNumber}
                        </div>
                      )}
                    </td>
                    <td className={styles.amount}>${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>{expense.requestedBy}</td>
                    <td>
                      {expense.source === 'INVENTORY' ? (
                        <span style={{ 
                          background: '#e3f2fd', 
                          color: '#1976d2', 
                          padding: '4px 8px', 
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 600
                        }}>
                          📦 Inventory
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#999' }}>Manual</span>
                      )}
                    </td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(expense.status) }}
                      >
                        {expense.status}
                      </span>
                    </td>
                    {filter === 'REJECTED' && (
                      <td>
                        <div style={{ 
                          maxWidth: '250px',
                          color: '#d32f2f',
                          fontSize: '13px',
                          fontWeight: 500
                        }}>
                          {expense.rejectionReason || 'No reason provided'}
                        </div>
                      </td>
                    )}
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.actionButton} 
                          onClick={() => openDetailsModal(expense)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        
                        {expense.status === 'APPROVED' && (
                          <button 
                            className={styles.actionButton}
                            onClick={() => handleMarkAsPaid(expense.id)}
                            title="Mark as Paid"
                            style={{ color: '#4CAF50', fontSize: '18px' }}
                          >
                            💵
                          </button>
                        )}
                        
                        {expense.status === 'PAID' && (
                          <span style={{ color: '#4CAF50', fontSize: '12px', fontWeight: 600 }}>
                            ✓ Paid
                          </span>
                        )}
                        
                        {expense.poNumber && (
                          <button className={styles.actionButton} title="View PO">📦</button>
                        )}
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
        <ExpenseModal 
          staff={staff}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchExpenses(); }}
        />
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
    </div>
  );
};

const ExpenseModal = ({ staff, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    category: 'SUPPLIES',
    description: '',
    amount: '',
    expenseDate: new Date().toISOString().split('T')[0],
    requestedBy: '',
    vendorName: '',
    paymentMethod: 'CASH',
    budgetId: ''
  });
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch budgets when component mounts
  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/finance/budgets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setBudgets(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/finance/expenses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Expense created successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to create expense');
      }
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add Expense</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value, budgetId: ''})}
            >
              <option value="SUPPLIES">Supplies</option>
              <option value="BUDGET">Budget</option>
              <option value="INVENTORY_PURCHASE">Inventory Purchase</option>
              <option value="UTILITIES">Utilities</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="SALARIES">Salaries</option>
              <option value="TRANSPORT">Transport</option>
              <option value="MARKETING">Marketing</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Show budget dropdown only when Budget category is selected */}
          {formData.category === 'BUDGET' && (
            <div className={styles.formGroup}>
              <label>Select Budget *</label>
              <select
                required
                value={formData.budgetId}
                onChange={(e) => setFormData({...formData, budgetId: e.target.value})}
              >
                <option value="">-- Select Budget --</option>
                {budgets.map(budget => (
                  <option key={budget.id} value={budget.id}>
                    {budget.name} - {budget.department} ({budget.fiscalYear}) - 
                    ${parseFloat(budget.amount).toFixed(2)} 
                    (Remaining: ${(parseFloat(budget.amount) - parseFloat(budget.spentAmount || 0)).toFixed(2)})
                  </option>
                ))}
              </select>
              {budgets.length === 0 && (
                <div style={{ fontSize: '12px', color: '#f44336', marginTop: '5px' }}>
                  No budgets available. Please create a budget first.
                </div>
              )}
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Description *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description of expense"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Amount *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Expense Date *</label>
            <input
              type="date"
              required
              value={formData.expenseDate}
              onChange={(e) => setFormData({...formData, expenseDate: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Requested By *</label>
            <select
              required
              value={formData.requestedBy}
              onChange={(e) => setFormData({...formData, requestedBy: e.target.value})}
            >
              <option value="">-- Select Staff --</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>{s.name || s.firstName + ' ' + s.lastName}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Vendor Name</label>
            <input
              type="text"
              value={formData.vendorName}
              onChange={(e) => setFormData({...formData, vendorName: e.target.value})}
              placeholder="Optional"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Payment Method *</label>
            <select
              required
              value={formData.paymentMethod}
              onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})}
            >
              <option value="CASH">Cash</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="CHEQUE">Cheque</option>
              <option value="CARD">Card</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Creating...' : 'Create Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExpenseDetailsModal = ({ expense, onClose }) => {
  const [budgetInfo, setBudgetInfo] = useState(null);

  useEffect(() => {
    if (expense.budgetId) {
      fetchBudgetInfo(expense.budgetId);
    }
  }, [expense.budgetId]);

  const fetchBudgetInfo = async (budgetId) => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/finance/budgets', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const budget = data.data.find(b => b.id === budgetId);
        setBudgetInfo(budget);
      }
    } catch (error) {
      console.error('Error fetching budget info:', error);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className={styles.modalHeader}>
          <h2>Expense Details</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          {/* Header Section */}
          <div style={{ 
            background: expense.status === 'REJECTED' 
              ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
              : expense.status === 'PAID'
              ? 'linear-gradient(135deg, #2196F3 0%, #00BCD4 100%)'
              : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
              Expense Number
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>
              {expense.expenseNumber}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center' }}>
              <span 
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {expense.status}
              </span>
              <span style={{ fontSize: '24px', fontWeight: 700 }}>
                ${parseFloat(expense.amount).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Rejection Reason - If Rejected */}
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

          {/* Details Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <DetailItem label="Category" value={expense.category} />
            <DetailItem label="Payment Method" value={expense.paymentMethod} />
            <DetailItem label="Requested By" value={expense.requestedBy} />
            <DetailItem label="Vendor Name" value={expense.vendorName || '-'} />
            {expense.poNumber && (
              <DetailItem label="PO Number" value={expense.poNumber} />
            )}
          </div>

          {/* Budget Information - If linked to budget */}
          {expense.budgetId && budgetInfo && (
            <div style={{ 
              marginBottom: '20px',
              padding: '15px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '8px',
              color: 'white'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: 700, 
                marginBottom: '10px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span style={{ fontSize: '20px' }}>💰</span>
                Linked Budget
              </div>
              <div style={{ fontSize: '15px', lineHeight: '1.8' }}>
                <div><strong>Budget:</strong> {budgetInfo.name}</div>
                <div><strong>Department:</strong> {budgetInfo.department}</div>
                <div><strong>Fiscal Year:</strong> {budgetInfo.fiscalYear}</div>
                <div><strong>Budget Number:</strong> {budgetInfo.budgetNumber}</div>
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                  <strong>Budget Status:</strong> ${parseFloat(budgetInfo.spentAmount || 0).toFixed(2)} / ${parseFloat(budgetInfo.amount).toFixed(2)} spent
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              Description
            </label>
            <div style={{ 
              fontSize: '14px', 
              padding: '12px', 
              background: '#f5f5f5', 
              borderRadius: '6px',
              lineHeight: '1.6'
            }}>
              {expense.description}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ 
            background: '#f9f9f9', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              📅 Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <TimelineItem 
                icon="📝"
                label="Created"
                date={expense.createdAt}
                color="#9E9E9E"
              />
              <TimelineItem 
                icon="📅"
                label="Expense Date"
                date={expense.expenseDate}
                color="#2196F3"
              />
              {expense.approvedAt && (
                <TimelineItem 
                  icon="✅"
                  label="Approved"
                  date={expense.approvedAt}
                  color="#4CAF50"
                />
              )}
              {expense.rejectedAt && (
                <TimelineItem 
                  icon="❌"
                  label="Rejected"
                  date={expense.rejectedAt}
                  color="#F44336"
                />
              )}
              {expense.paidAt && (
                <TimelineItem 
                  icon="💵"
                  label="Paid"
                  date={expense.paidAt}
                  color="#4CAF50"
                />
              )}
            </div>
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

const DetailItem = ({ label, value }) => (
  <div>
    <label style={{ fontSize: '12px', color: '#666', display: 'block', marginBottom: '5px', fontWeight: 600 }}>
      {label}
    </label>
    <div style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>
      {value}
    </div>
  </div>
);

const TimelineItem = ({ icon, label, date, color }) => (
  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
    <span style={{ fontSize: '18px' }}>{icon}</span>
    <div style={{ flex: 1 }}>
      <div style={{ fontSize: '13px', fontWeight: 600, color: color }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', color: '#666' }}>
        {new Date(date).toLocaleString()}
      </div>
    </div>
  </div>
);

export default ExpenseManagement;
