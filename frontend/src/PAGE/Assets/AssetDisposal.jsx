import React, { useState, useEffect } from 'react';
import styles from '../Finance/PaymentManagement.module.css';

const AssetDisposal = () => {
  const [disposals, setDisposals] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchDisposals();
    fetchAssets();
  }, []);

  const fetchDisposals = async () => {
    try {
      const response = await fetch('/api/assets/disposals', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDisposals(data.data);
      }
    } catch (error) {
      console.error('Error fetching disposals:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets?status=ACTIVE', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    }
  };

  const getMethodColor = (method) => {
    const colors = {
      'SALE': '#4CAF50',
      'DONATION': '#2196F3',
      'SCRAP': '#FF9800',
      'WRITE_OFF': '#F44336'
    };
    return colors[method] || '#9E9E9E';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Asset Disposal</h1>
          <p>Manage asset disposal and write-offs</p>
        </div>
        <button className={styles.recordButton} onClick={() => setShowModal(true)}>
          + Record Disposal
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading disposal records...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Disposal Method</th>
                <th>Disposal Date</th>
                <th>Book Value</th>
                <th>Disposal Value</th>
                <th>Gain/Loss</th>
                <th>Reason</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {disposals.length === 0 ? (
                <tr><td colSpan="9" className={styles.noData}>No disposal records found</td></tr>
              ) : (
                disposals.map(disposal => {
                  const gainLoss = parseFloat(disposal.disposalValue || 0) - parseFloat(disposal.bookValue || 0);
                  return (
                    <tr key={disposal.id}>
                      <td className={styles.receiptNumber}>{disposal.assetTag}</td>
                      <td>{disposal.assetName}</td>
                      <td>
                        <span 
                          className={styles.statusBadge}
                          style={{ backgroundColor: getMethodColor(disposal.disposalMethod) }}
                        >
                          {disposal.disposalMethod.replace('_', ' ')}
                        </span>
                      </td>
                      <td>{new Date(disposal.disposalDate).toLocaleDateString()}</td>
                      <td className={styles.amount}>${parseFloat(disposal.bookValue || 0).toFixed(2)}</td>
                      <td className={styles.amount}>${parseFloat(disposal.disposalValue || 0).toFixed(2)}</td>
                      <td style={{ 
                        fontWeight: 600, 
                        color: gainLoss >= 0 ? '#4CAF50' : '#F44336' 
                      }}>
                        ${gainLoss.toFixed(2)}
                      </td>
                      <td>{disposal.reason}</td>
                      <td>
                        <div className={styles.actions}>
                          <button className={styles.actionButton} title="View">👁️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <DisposalModal 
          assets={assets}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchDisposals(); }}
        />
      )}
    </div>
  );
};

const DisposalModal = ({ assets, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    assetId: '',
    disposalMethod: 'SALE',
    disposalDate: new Date().toISOString().split('T')[0],
    disposalValue: '',
    reason: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/assets/disposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Asset disposal recorded successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to record disposal');
      }
    } catch (error) {
      console.error('Error recording disposal:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Record Asset Disposal</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Asset *</label>
            <select
              required
              value={formData.assetId}
              onChange={(e) => setFormData({...formData, assetId: e.target.value})}
            >
              <option value="">-- Select Asset --</option>
              {assets.map(asset => (
                <option key={asset.id} value={asset.id}>
                  {asset.assetTag} - {asset.name} (Value: ${parseFloat(asset.currentValue || asset.purchaseCost).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Disposal Method *</label>
            <select
              required
              value={formData.disposalMethod}
              onChange={(e) => setFormData({...formData, disposalMethod: e.target.value})}
            >
              <option value="SALE">Sale</option>
              <option value="DONATION">Donation</option>
              <option value="SCRAP">Scrap</option>
              <option value="WRITE_OFF">Write-Off</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Disposal Date *</label>
            <input
              type="date"
              required
              value={formData.disposalDate}
              onChange={(e) => setFormData({...formData, disposalDate: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Disposal Value</label>
            <input
              type="number"
              step="0.01"
              value={formData.disposalValue}
              onChange={(e) => setFormData({...formData, disposalValue: e.target.value})}
              placeholder="Amount received (if any)"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Reason *</label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
              placeholder="e.g., End of useful life, Damaged beyond repair"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Notes</label>
            <input
              type="text"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
              placeholder="Additional notes"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Recording...' : 'Record Disposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetDisposal;
