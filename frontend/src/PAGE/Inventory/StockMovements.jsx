import React, { useState, useEffect } from 'react';
import styles from '../Finance/PaymentManagement.module.css';

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchMovements();
    fetchItems();
  }, [filter]);

  const fetchMovements = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('type', filter);
      
      const response = await fetch(`/api/inventory/movements?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMovements(data.data);
      }
    } catch (error) {
      console.error('Error fetching movements:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const response = await fetch('/api/inventory/items', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setItems(data.data);
      }
    } catch (error) {
      console.error('Error fetching items:', error);
    }
  };

  const getTypeColor = (type) => {
    const colors = {
      'IN': '#4CAF50',
      'OUT': '#F44336',
      'TRANSFER': '#2196F3',
      'ADJUSTMENT': '#FF9800'
    };
    return colors[type] || '#9E9E9E';
  };

  const getTypeIcon = (type) => {
    const icons = {
      'IN': '📥',
      'OUT': '📤',
      'TRANSFER': '🔄',
      'ADJUSTMENT': '⚙️'
    };
    return icons[type] || '📦';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Stock Movements</h1>
          <p>Track stock transfers, adjustments, and consumption</p>
        </div>
        <button className={styles.recordButton} onClick={() => setShowModal(true)}>
          + Record Movement
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          {['ALL', 'IN', 'OUT', 'TRANSFER', 'ADJUSTMENT'].map(type => (
            <button
              key={type}
              className={`${styles.filterTab} ${filter === type ? styles.active : ''}`}
              onClick={() => setFilter(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading movements...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Item</th>
                <th>Quantity</th>
                <th>From Location</th>
                <th>To Location</th>
                <th>Reference</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {movements.length === 0 ? (
                <tr><td colSpan="9" className={styles.noData}>No movements found</td></tr>
              ) : (
                movements.map(movement => (
                  <tr key={movement.id}>
                    <td>{new Date(movement.movementDate).toLocaleDateString()}</td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getTypeColor(movement.type) }}
                      >
                        {getTypeIcon(movement.type)} {movement.type}
                      </span>
                    </td>
                    <td>{movement.itemName}</td>
                    <td className={styles.amount}>{parseFloat(movement.quantity).toFixed(2)}</td>
                    <td>{movement.fromLocation || '-'}</td>
                    <td>{movement.toLocation || '-'}</td>
                    <td>{movement.referenceNumber || '-'}</td>
                    <td>{movement.notes || '-'}</td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionButton} title="View">👁️</button>
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
        <MovementModal 
          items={items}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchMovements(); }}
        />
      )}
    </div>
  );
};

const MovementModal = ({ items, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    type: 'IN',
    itemId: '',
    quantity: '',
    fromLocation: '',
    toLocation: '',
    referenceNumber: '',
    notes: '',
    movementDate: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/inventory/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Stock movement recorded successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to record movement');
      }
    } catch (error) {
      console.error('Error recording movement:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Record Stock Movement</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Movement Type *</label>
            <select
              required
              value={formData.type}
              onChange={(e) => setFormData({...formData, type: e.target.value})}
            >
              <option value="IN">Stock In (Receipt)</option>
              <option value="OUT">Stock Out (Issue/Consumption)</option>
              <option value="TRANSFER">Transfer Between Locations</option>
              <option value="ADJUSTMENT">Adjustment (Count/Damage)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Item *</label>
            <select
              required
              value={formData.itemId}
              onChange={(e) => setFormData({...formData, itemId: e.target.value})}
            >
              <option value="">-- Select Item --</option>
              {items.map(item => (
                <option key={item.id} value={item.id}>
                  {item.name} ({item.code}) - Available: {parseFloat(item.quantity || 0).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Quantity *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              placeholder="Enter quantity"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Movement Date *</label>
            <input
              type="date"
              required
              value={formData.movementDate}
              onChange={(e) => setFormData({...formData, movementDate: e.target.value})}
            />
          </div>

          {(formData.type === 'TRANSFER' || formData.type === 'OUT') && (
            <div className={styles.formGroup}>
              <label>From Location</label>
              <input
                type="text"
                value={formData.fromLocation}
                onChange={(e) => setFormData({...formData, fromLocation: e.target.value})}
                placeholder="e.g., Main Store, Room 101"
              />
            </div>
          )}

          {(formData.type === 'TRANSFER' || formData.type === 'IN') && (
            <div className={styles.formGroup}>
              <label>To Location</label>
              <input
                type="text"
                value={formData.toLocation}
                onChange={(e) => setFormData({...formData, toLocation: e.target.value})}
                placeholder="e.g., Main Store, Room 101"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Reference Number</label>
            <input
              type="text"
              value={formData.referenceNumber}
              onChange={(e) => setFormData({...formData, referenceNumber: e.target.value})}
              placeholder="PO number, GRN number, etc."
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
              {loading ? 'Recording...' : 'Record Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockMovements;
