import React, { useState, useEffect } from 'react';
import styles from '../Finance/PaymentManagement.module.css';

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

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
    } finally {
      setLoading(false);
    }
  };

  const getStockStatus = (item) => {
    const qty = parseFloat(item.quantity || 0);
    const min = parseFloat(item.minQuantity || 0);
    if (qty === 0) return { text: 'Out of Stock', color: '#F44336' };
    if (qty <= min) return { text: 'Low Stock', color: '#FF9800' };
    return { text: 'In Stock', color: '#4CAF50' };
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Item Master</h1>
          <p>Manage inventory items and stock levels</p>
        </div>
        <button className={styles.recordButton} onClick={() => { setEditingItem(null); setShowModal(true); }}>
          + Add Item
        </button>
      </div>

      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by item name or code..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading items...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Category</th>
                <th>Unit</th>
                <th>Quantity</th>
                <th>Min Qty</th>
                <th>Unit Price</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.length === 0 ? (
                <tr><td colSpan="9" className={styles.noData}>No items found</td></tr>
              ) : (
                filteredItems.map(item => {
                  const status = getStockStatus(item);
                  return (
                    <tr key={item.id}>
                      <td className={styles.receiptNumber}>{item.code}</td>
                      <td>{item.name}</td>
                      <td>{item.category}</td>
                      <td>{item.unit}</td>
                      <td className={styles.amount}>{parseFloat(item.quantity || 0).toFixed(2)}</td>
                      <td>{parseFloat(item.minQuantity || 0).toFixed(2)}</td>
                      <td>${parseFloat(item.unitPrice || 0).toFixed(2)}</td>
                      <td>
                        <span 
                          className={styles.statusBadge}
                          style={{ backgroundColor: status.color }}
                        >
                          {status.text}
                        </span>
                      </td>
                      <td>
                        <div className={styles.actions}>
                          <button 
                            className={styles.actionButton} 
                            onClick={() => { setEditingItem(item); setShowModal(true); }}
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button className={styles.actionButton} title="View History">📊</button>
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
        <ItemModal 
          item={editingItem}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchItems(); }}
        />
      )}
    </div>
  );
};

const ItemModal = ({ item, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    code: item?.code || '',
    name: item?.name || '',
    category: item?.category || 'SUPPLIES',
    unit: item?.unit || 'PCS',
    quantity: item?.quantity || 0,
    minQuantity: item?.minQuantity || 0,
    unitPrice: item?.unitPrice || 0,
    description: item?.description || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = item ? `/api/inventory/items/${item.id}` : '/api/inventory/items';
      const method = item ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Item ${item ? 'updated' : 'created'} successfully!`);
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
          <h2>{item ? 'Edit Item' : 'Add Item'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Item Code *</label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({...formData, code: e.target.value})}
              placeholder="e.g., ITM-001"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Item Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., A4 Paper"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Category *</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="SUPPLIES">Supplies</option>
              <option value="EQUIPMENT">Equipment</option>
              <option value="FURNITURE">Furniture</option>
              <option value="BOOKS">Books</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Unit *</label>
            <select
              required
              value={formData.unit}
              onChange={(e) => setFormData({...formData, unit: e.target.value})}
            >
              <option value="PCS">Pieces</option>
              <option value="BOX">Box</option>
              <option value="KG">Kilogram</option>
              <option value="LITER">Liter</option>
              <option value="SET">Set</option>
              <option value="PACK">Pack</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Current Quantity *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.quantity}
              onChange={(e) => setFormData({...formData, quantity: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Minimum Quantity *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.minQuantity}
              onChange={(e) => setFormData({...formData, minQuantity: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Unit Price *</label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.unitPrice}
              onChange={(e) => setFormData({...formData, unitPrice: e.target.value})}
            />
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
              {loading ? 'Saving...' : 'Save Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemMaster;
