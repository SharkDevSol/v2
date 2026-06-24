import React, { useState, useEffect } from 'react';
import styles from './FeeManagement/FeeManagement.module.css';

const BudgetManagement = () => {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [selectedBudget, setSelectedBudget] = useState(null);

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
        setBudgets(data.data);
      }
    } catch (error) {
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateUtilization = (budget) => {
    const spent = parseFloat(budget.spentAmount || 0);
    const total = parseFloat(budget.amount);
    return ((spent / total) * 100).toFixed(1);
  };

  const getUtilizationColor = (percentage) => {
    if (percentage < 70) return '#4CAF50';
    if (percentage < 90) return '#FF9800';
    return '#F44336';
  };

  const getSummaryStats = () => {
    const totalBudgets = budgets.length;
    const totalAllocated = budgets.reduce((sum, b) => sum + parseFloat(b.amount), 0);
    const totalSpent = budgets.reduce((sum, b) => sum + parseFloat(b.spentAmount || 0), 0);
    const totalRemaining = totalAllocated - totalSpent;
    const avgUtilization = totalAllocated > 0 ? ((totalSpent / totalAllocated) * 100).toFixed(1) : 0;

    const healthyBudgets = budgets.filter(b => {
      const util = calculateUtilization(b);
      return parseFloat(util) < 70;
    }).length;

    const warningBudgets = budgets.filter(b => {
      const util = calculateUtilization(b);
      return parseFloat(util) >= 70 && parseFloat(util) < 90;
    }).length;

    const criticalBudgets = budgets.filter(b => {
      const util = calculateUtilization(b);
      return parseFloat(util) >= 90;
    }).length;

    return {
      totalBudgets,
      totalAllocated,
      totalSpent,
      totalRemaining,
      avgUtilization,
      healthyBudgets,
      warningBudgets,
      criticalBudgets
    };
  };

  const openDetailsModal = (budget) => {
    setSelectedBudget(budget);
    setShowDetailsModal(true);
  };

  const stats = getSummaryStats();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Budget Management</h1>
          <p>Plan and track departmental budgets</p>
        </div>
        <button className={styles.addButton} onClick={() => { setEditingBudget(null); setShowModal(true); }}>
          + Add Budget
        </button>
      </div>

      {/* Summary Report Cards */}
      {!loading && budgets.length > 0 && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          {/* Total Budgets Card */}
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              📊 Total Budgets
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.totalBudgets}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              ${stats.totalAllocated.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
              Total Allocated
            </div>
          </div>

          {/* Total Spent Card */}
          <div style={{
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              💸 Total Spent
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              ${stats.totalSpent.toFixed(2)}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              {stats.avgUtilization}% Utilized
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
              Average Utilization
            </div>
          </div>

          {/* Total Remaining Card */}
          <div style={{
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              💰 Total Remaining
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              ${stats.totalRemaining.toFixed(2)}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              {((stats.totalRemaining / stats.totalAllocated) * 100).toFixed(1)}%
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
              Available Budget
            </div>
          </div>

          {/* Healthy Budgets Card */}
          <div style={{
            background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              🟢 Healthy Budgets
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.healthyBudgets}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              &lt; 70% Used
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
              Good Standing
            </div>
          </div>

          {/* Warning Budgets Card */}
          <div style={{
            background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              🟠 Warning Budgets
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.warningBudgets}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              70-90% Used
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
              Monitor Closely
            </div>
          </div>

          {/* Critical Budgets Card */}
          <div style={{
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
            padding: '20px',
            borderRadius: '12px',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '8px' }}>
              🔴 Critical Budgets
            </div>
            <div style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '8px' }}>
              {stats.criticalBudgets}
            </div>
            <div style={{ fontSize: '18px', fontWeight: 600 }}>
              &gt; 90% Used
            </div>
            <div style={{ fontSize: '12px', opacity: 0.8, marginTop: '8px' }}>
              Immediate Attention
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className={styles.loading}>Loading budgets...</div>
      ) : (
        <div className={styles.grid}>
          {budgets.length === 0 ? (
            <div className={styles.noData}>No budgets found</div>
          ) : (
            budgets.map(budget => {
              const utilization = calculateUtilization(budget);
              return (
                <div key={budget.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <h3>{budget.name}</h3>
                    <span className={`${styles.badge} ${budget.status === 'APPROVED' ? styles.active : styles.inactive}`}>
                      {budget.status}
                    </span>
                  </div>
                  <div className={styles.cardBody}>
                    <p><strong>Department:</strong> {budget.department}</p>
                    <p><strong>Period:</strong> {budget.fiscalYear}</p>
                    <p><strong>Budget:</strong> <span className={styles.amount}>${parseFloat(budget.amount).toFixed(2)}</span></p>
                    <p><strong>Spent:</strong> ${parseFloat(budget.spentAmount || 0).toFixed(2)}</p>
                    <p><strong>Remaining:</strong> ${(parseFloat(budget.amount) - parseFloat(budget.spentAmount || 0)).toFixed(2)}</p>
                    
                    <div style={{ marginTop: '12px' }}>
                      <div style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        marginBottom: '4px',
                        fontSize: '12px',
                        color: '#666'
                      }}>
                        <span>Utilization</span>
                        <span style={{ fontWeight: 600, color: getUtilizationColor(utilization) }}>
                          {utilization}%
                        </span>
                      </div>
                      <div style={{ 
                        width: '100%', 
                        height: '8px', 
                        background: '#f0f0f0', 
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{ 
                          width: `${Math.min(utilization, 100)}%`, 
                          height: '100%', 
                          background: getUtilizationColor(utilization),
                          transition: 'width 0.3s ease'
                        }} />
                      </div>
                    </div>
                  </div>
                  <div className={styles.cardActions}>
                    <button onClick={() => { setEditingBudget(budget); setShowModal(true); }}>✏️ Edit</button>
                    <button onClick={() => openDetailsModal(budget)}>📊 Details</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {showModal && (
        <BudgetModal 
          budget={editingBudget}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchBudgets(); }}
        />
      )}

      {showDetailsModal && selectedBudget && (
        <BudgetDetailsModal 
          budget={selectedBudget}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedBudget(null);
          }}
          calculateUtilization={calculateUtilization}
          getUtilizationColor={getUtilizationColor}
        />
      )}
    </div>
  );
};

const BudgetModal = ({ budget, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: budget?.name || '',
    department: budget?.department || '',
    fiscalYear: budget?.fiscalYear || new Date().getFullYear().toString(),
    amount: budget?.amount || '',
    description: budget?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const url = budget ? `/api/finance/budgets/${budget.id}` : '/api/finance/budgets';
      const method = budget ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Budget ${budget ? 'updated' : 'created'} successfully!`);
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Operation failed');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{budget ? 'Edit Budget' : 'Add Budget'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Budget Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., IT Department Budget 2024"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Department *</label>
            <input
              type="text"
              required
              value={formData.department}
              onChange={(e) => setFormData({...formData, department: e.target.value})}
              placeholder="e.g., IT, HR, Finance"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Fiscal Year *</label>
              <input
                type="text"
                required
                value={formData.fiscalYear}
                onChange={(e) => setFormData({...formData, fiscalYear: e.target.value})}
                placeholder="2024"
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
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Optional description"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Saving...' : 'Save Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const BudgetDetailsModal = ({ budget, onClose, calculateUtilization, getUtilizationColor }) => {
  const [linkedExpenses, setLinkedExpenses] = useState([]);
  const [loadingExpenses, setLoadingExpenses] = useState(true);

  useEffect(() => {
    fetchLinkedExpenses();
  }, [budget.id]);

  const fetchLinkedExpenses = async () => {
    try {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      const response = await fetch('/api/finance/expenses', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // Filter expenses linked to this budget
        const filtered = data.data.filter(exp => exp.budgetId === budget.id);
        setLinkedExpenses(filtered);
      }
    } catch (error) {
      console.error('Error fetching linked expenses:', error);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const utilization = calculateUtilization(budget);
  const utilizationColor = getUtilizationColor(utilization);
  const spent = parseFloat(budget.spentAmount || 0);
  const total = parseFloat(budget.amount);
  const remaining = total - spent;

  const paidExpenses = linkedExpenses.filter(e => e.status === 'PAID');
  const approvedExpenses = linkedExpenses.filter(e => e.status === 'APPROVED');
  const pendingExpenses = linkedExpenses.filter(e => e.status === 'PENDING');

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className={styles.modalHeader}>
          <h2>Budget Details</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div style={{ padding: '20px' }}>
          {/* Header Section */}
          <div style={{ 
            background: parseFloat(utilization) >= 90 
              ? 'linear-gradient(135deg, #f44336 0%, #e91e63 100%)'
              : parseFloat(utilization) >= 70
              ? 'linear-gradient(135deg, #FF9800 0%, #FFC107 100%)'
              : 'linear-gradient(135deg, #4CAF50 0%, #8BC34A 100%)',
            padding: '20px',
            borderRadius: '8px',
            marginBottom: '20px',
            color: 'white'
          }}>
            <div style={{ fontSize: '14px', opacity: 0.9, marginBottom: '5px' }}>
              Budget Number
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>
              {budget.budgetNumber}
            </div>
            <div style={{ marginTop: '10px', fontSize: '18px', fontWeight: 600 }}>
              {budget.name}
            </div>
            <div style={{ marginTop: '10px', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span 
                style={{ 
                  background: 'rgba(255,255,255,0.2)',
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 600
                }}
              >
                {budget.status}
              </span>
              <span style={{ fontSize: '12px', opacity: 0.9 }}>
                {budget.department} • {budget.fiscalYear}
              </span>
            </div>
          </div>

          {/* Budget Overview */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '15px', 
            marginBottom: '20px' 
          }}>
            <div style={{ 
              padding: '15px', 
              background: '#f5f5f5', 
              borderRadius: '8px',
              border: '2px solid #e0e0e0'
            }}>
              <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                💰 Total Budget
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#333' }}>
                ${total.toFixed(2)}
              </div>
            </div>

            <div style={{ 
              padding: '15px', 
              background: '#ffebee', 
              borderRadius: '8px',
              border: '2px solid #ef5350'
            }}>
              <div style={{ fontSize: '12px', color: '#c62828', marginBottom: '5px' }}>
                💸 Total Spent
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#d32f2f' }}>
                ${spent.toFixed(2)}
              </div>
            </div>

            <div style={{ 
              padding: '15px', 
              background: '#e8f5e9', 
              borderRadius: '8px',
              border: '2px solid #66bb6a'
            }}>
              <div style={{ fontSize: '12px', color: '#2e7d32', marginBottom: '5px' }}>
                💵 Remaining
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#388e3c' }}>
                ${remaining.toFixed(2)}
              </div>
            </div>

            <div style={{ 
              padding: '15px', 
              background: '#fff3e0', 
              borderRadius: '8px',
              border: `2px solid ${utilizationColor}`
            }}>
              <div style={{ fontSize: '12px', color: '#e65100', marginBottom: '5px' }}>
                📊 Utilization
              </div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: utilizationColor }}>
                {utilization}%
              </div>
            </div>
          </div>

          {/* Utilization Progress Bar */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 600
            }}>
              <span>Budget Utilization</span>
              <span style={{ color: utilizationColor }}>
                ${spent.toFixed(2)} / ${total.toFixed(2)}
              </span>
            </div>
            <div style={{ 
              width: '100%', 
              height: '20px', 
              background: '#f0f0f0', 
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid #ddd'
            }}>
              <div style={{ 
                width: `${Math.min(utilization, 100)}%`, 
                height: '100%', 
                background: utilizationColor,
                transition: 'width 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: 600
              }}>
                {parseFloat(utilization) > 10 && `${utilization}%`}
              </div>
            </div>
          </div>

          {/* Description */}
          {budget.description && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '14px', fontWeight: 600, display: 'block', marginBottom: '8px', color: '#333' }}>
                📝 Description
              </label>
              <div style={{ 
                fontSize: '14px', 
                padding: '12px', 
                background: '#f5f5f5', 
                borderRadius: '6px',
                lineHeight: '1.6',
                color: '#555'
              }}>
                {budget.description}
              </div>
            </div>
          )}

          {/* Linked Expenses Section */}
          <div style={{ 
            background: '#f9f9f9', 
            padding: '15px', 
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '15px', color: '#333' }}>
              💳 Linked Expenses ({linkedExpenses.length})
            </div>

            {loadingExpenses ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                Loading expenses...
              </div>
            ) : linkedExpenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
                No expenses linked to this budget yet
              </div>
            ) : (
              <>
                {/* Expense Summary */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
                  gap: '10px', 
                  marginBottom: '15px' 
                }}>
                  <div style={{ padding: '10px', background: '#e3f2fd', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#1565c0', marginBottom: '3px' }}>
                      💵 Paid
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#0d47a1' }}>
                      {paidExpenses.length}
                    </div>
                    <div style={{ fontSize: '11px', color: '#1976d2' }}>
                      ${paidExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: '#fff3e0', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#e65100', marginBottom: '3px' }}>
                      ✅ Approved
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#ef6c00' }}>
                      {approvedExpenses.length}
                    </div>
                    <div style={{ fontSize: '11px', color: '#f57c00' }}>
                      ${approvedExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: '#fce4ec', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#c2185b', marginBottom: '3px' }}>
                      ⏳ Pending
                    </div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#d81b60' }}>
                      {pendingExpenses.length}
                    </div>
                    <div style={{ fontSize: '11px', color: '#e91e63' }}>
                      ${pendingExpenses.reduce((sum, e) => sum + parseFloat(e.amount), 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Expense List */}
                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {linkedExpenses.map(expense => (
                    <div 
                      key={expense.id} 
                      style={{ 
                        padding: '12px', 
                        background: 'white', 
                        borderRadius: '6px',
                        marginBottom: '8px',
                        border: '1px solid #e0e0e0',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#333', marginBottom: '4px' }}>
                          {expense.expenseNumber}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
                          {expense.description}
                        </div>
                        <div style={{ fontSize: '11px', color: '#999' }}>
                          {new Date(expense.expenseDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: '#333', marginBottom: '4px' }}>
                          ${parseFloat(expense.amount).toFixed(2)}
                        </div>
                        <span 
                          style={{ 
                            fontSize: '11px',
                            padding: '3px 8px',
                            borderRadius: '12px',
                            background: expense.status === 'PAID' ? '#4CAF50' : expense.status === 'APPROVED' ? '#FF9800' : '#9E9E9E',
                            color: 'white',
                            fontWeight: 600
                          }}
                        >
                          {expense.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Timeline */}
          <div style={{ 
            marginTop: '20px',
            padding: '15px', 
            background: '#f5f5f5', 
            borderRadius: '8px',
            border: '1px solid #e0e0e0'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              📅 Timeline
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>📝</span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
                    Created
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(budget.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
              {budget.updatedAt && budget.updatedAt !== budget.createdAt && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>🔄</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#333' }}>
                      Last Updated
                    </div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(budget.updatedAt).toLocaleString()}
                    </div>
                  </div>
                </div>
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

export default BudgetManagement;
