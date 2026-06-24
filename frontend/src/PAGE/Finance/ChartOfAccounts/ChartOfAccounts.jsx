import React, { useState, useEffect } from 'react';
import styles from './ChartOfAccounts.module.css';

const ChartOfAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [expandedAccounts, setExpandedAccounts] = useState(new Set());

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/finance/accounts/tree', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.data);
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (accountId) => {
    const newExpanded = new Set(expandedAccounts);
    if (newExpanded.has(accountId)) {
      newExpanded.delete(accountId);
    } else {
      newExpanded.add(accountId);
    }
    setExpandedAccounts(newExpanded);
  };

  const renderAccountTree = (accountList, level = 0) => {
    return accountList.map(account => (
      <React.Fragment key={account.id}>
        <tr className={styles.accountRow}>
          <td style={{ paddingLeft: `${level * 24 + 16}px` }}>
            {account.children?.length > 0 && (
              <button 
                className={styles.expandButton}
                onClick={() => toggleExpand(account.id)}
              >
                {expandedAccounts.has(account.id) ? '▼' : '▶'}
              </button>
            )}
            {account.code}
          </td>
          <td>{account.name}</td>
          <td>
            <span className={`${styles.typeBadge} ${styles[account.type.toLowerCase()]}`}>
              {account.type}
            </span>
          </td>
          <td>
            <span className={account.isActive ? styles.active : styles.inactive}>
              {account.isActive ? 'Active' : 'Inactive'}
            </span>
          </td>
          <td>
            <div className={styles.actions}>
              <button onClick={() => { setEditingAccount(account); setShowModal(true); }}>✏️</button>
              <button onClick={() => handleDeactivate(account.id)}>🚫</button>
            </div>
          </td>
        </tr>
        {expandedAccounts.has(account.id) && account.children?.length > 0 && 
          renderAccountTree(account.children, level + 1)
        }
      </React.Fragment>
    ));
  };

  const handleDeactivate = async (accountId) => {
    if (!confirm('Deactivate this account?')) return;
    try {
      const response = await fetch(`/api/finance/accounts/${accountId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchAccounts();
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Chart of Accounts</h1>
          <p>Manage your accounting structure</p>
        </div>
        <button className={styles.addButton} onClick={() => { setEditingAccount(null); setShowModal(true); }}>
          + Add Account
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading accounts...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {accounts.length === 0 ? (
                <tr><td colSpan="5" className={styles.noData}>No accounts found</td></tr>
              ) : (
                renderAccountTree(accounts)
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AccountModal 
          account={editingAccount}
          accounts={accounts}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchAccounts(); }}
        />
      )}
    </div>
  );
};

const AccountModal = ({ account, accounts, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: account?.code || '',
    name: account?.name || '',
    type: account?.type || 'ASSET',
    parentId: account?.parentId || '',
    description: account?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = account ? `/api/finance/accounts/${account.id}` : '/api/finance/accounts';
      const method = account ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Account ${account ? 'updated' : 'created'} successfully!`);
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

  const flattenAccounts = (accts, result = []) => {
    accts.forEach(acc => {
      result.push(acc);
      if (acc.children) flattenAccounts(acc.children, result);
    });
    return result;
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>{account ? 'Edit Account' : 'Add Account'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Account Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="e.g., 1000"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Account Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., Cash"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Account Type *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="ASSET">Asset</option>
              <option value="LIABILITY">Liability</option>
              <option value="EQUITY">Equity</option>
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Parent Account</label>
            <select
              value={formData.parentId}
              onChange={(e) => setFormData({...formData, parentId: e.target.value})}
            >
              <option value="">-- None (Top Level) --</option>
              {flattenAccounts(accounts).map(acc => (
                <option key={acc.id} value={acc.id}>{acc.code} - {acc.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              rows="3"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Saving...' : 'Save Account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChartOfAccounts;
