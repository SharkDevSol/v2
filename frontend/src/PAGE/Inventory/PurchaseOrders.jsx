import React, { useState, useEffect } from 'react';
import styles from '../Finance/PaymentManagement.module.css';

const PurchaseOrders = () => {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchOrders();
    fetchItems();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      
      const response = await fetch(`/api/inventory/purchase-orders?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
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

  const markAsReceived = async (orderId) => {
    if (!confirm('Mark this purchase order as received? This will create a corresponding expense in Finance.')) return;
    
    try {
      const response = await fetch(`/api/inventory/purchase-orders/${orderId}/receive`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        }
      });
      
      if (response.ok) {
        alert('Purchase order marked as received and expense created!');
        fetchOrders();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to mark as received');
      }
    } catch (error) {
      console.error('Error marking as received:', error);
      alert('An error occurred');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'DRAFT': '#9E9E9E',
      'PENDING': '#FF9800',
      'APPROVED': '#2196F3',
      'ORDERED': '#9C27B0',
      'RECEIVED': '#4CAF50',
      'CANCELLED': '#F44336'
    };
    return colors[status] || '#9E9E9E';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Purchase Orders</h1>
          <p>Manage purchase requests and orders</p>
        </div>
        <button className={styles.recordButton} onClick={() => setShowModal(true)}>
          + Create Purchase Order
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          {['ALL', 'DRAFT', 'PENDING', 'APPROVED', 'ORDERED', 'RECEIVED'].map(status => (
            <button
              key={status}
              className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading purchase orders...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Items</th>
                <th>Total Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr><td colSpan="7" className={styles.noData}>No purchase orders found</td></tr>
              ) : (
                orders.map(order => (
                  <tr key={order.id}>
                    <td className={styles.receiptNumber}>{order.poNumber}</td>
                    <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                    <td>{order.supplierName}</td>
                    <td>{order.itemCount || 0} items</td>
                    <td className={styles.amount}>${parseFloat(order.totalAmount || 0).toFixed(2)}</td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(order.status) }}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionButton} title="View">👁️</button>
                        {(order.status === 'APPROVED' || order.status === 'ORDERED') && (
                          <button 
                            className={styles.actionButton} 
                            onClick={() => markAsReceived(order.id)}
                            title="Mark as Received & Create Expense"
                            style={{ background: '#4CAF50', color: 'white' }}
                          >
                            📦✅
                          </button>
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
        <PurchaseOrderModal 
          items={items}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchOrders(); }}
        />
      )}
    </div>
  );
};

const PurchaseOrderModal = ({ items, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    supplierName: '',
    orderDate: new Date().toISOString().split('T')[0],
    expectedDeliveryDate: '',
    items: []
  });
  const [selectedItem, setSelectedItem] = useState({ itemId: '', quantity: '', unitPrice: '' });
  const [loading, setLoading] = useState(false);

  const addItem = () => {
    if (!selectedItem.itemId || !selectedItem.quantity || !selectedItem.unitPrice) {
      alert('Please fill all item fields');
      return;
    }

    const item = items.find(i => i.id === selectedItem.itemId);
    const newItem = {
      itemId: selectedItem.itemId,
      itemName: item.name,
      quantity: parseFloat(selectedItem.quantity),
      unitPrice: parseFloat(selectedItem.unitPrice),
      total: parseFloat(selectedItem.quantity) * parseFloat(selectedItem.unitPrice)
    };

    setFormData({
      ...formData,
      items: [...formData.items, newItem]
    });
    setSelectedItem({ itemId: '', quantity: '', unitPrice: '' });
  };

  const removeItem = (index) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index)
    });
  };

  const calculateTotal = () => {
    return formData.items.reduce((sum, item) => sum + item.total, 0).toFixed(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/inventory/purchase-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Purchase order created successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to create purchase order');
      }
    } catch (error) {
      console.error('Error creating purchase order:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '900px' }}>
        <div className={styles.modalHeader}>
          <h2>Create Purchase Order</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Supplier Name *</label>
            <input
              type="text"
              required
              value={formData.supplierName}
              onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
              placeholder="Enter supplier name"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Order Date *</label>
              <input
                type="date"
                required
                value={formData.orderDate}
                onChange={(e) => setFormData({...formData, orderDate: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Expected Delivery Date</label>
              <input
                type="date"
                value={formData.expectedDeliveryDate}
                onChange={(e) => setFormData({...formData, expectedDeliveryDate: e.target.value})}
              />
            </div>
          </div>

          <div style={{ border: '1px solid #e0e0e0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>Add Items</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '12px', alignItems: 'end' }}>
              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Item</label>
                <select
                  value={selectedItem.itemId}
                  onChange={(e) => setSelectedItem({...selectedItem, itemId: e.target.value})}
                >
                  <option value="">-- Select Item --</option>
                  {items.map(item => (
                    <option key={item.id} value={item.id}>{item.name} ({item.code})</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedItem.quantity}
                  onChange={(e) => setSelectedItem({...selectedItem, quantity: e.target.value})}
                />
              </div>

              <div className={styles.formGroup} style={{ marginBottom: 0 }}>
                <label>Unit Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={selectedItem.unitPrice}
                  onChange={(e) => setSelectedItem({...selectedItem, unitPrice: e.target.value})}
                />
              </div>

              <button 
                type="button" 
                onClick={addItem}
                style={{
                  padding: '10px 20px',
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                + Add
              </button>
            </div>

            {formData.items.length > 0 && (
              <div style={{ marginTop: '16px' }}>
                <table style={{ width: '100%', fontSize: '14px' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e0e0e0' }}>
                      <th style={{ textAlign: 'left', padding: '8px' }}>Item</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Qty</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Unit Price</th>
                      <th style={{ textAlign: 'right', padding: '8px' }}>Total</th>
                      <th style={{ textAlign: 'center', padding: '8px' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.items.map((item, index) => (
                      <tr key={index} style={{ borderBottom: '1px solid #f0f0f0' }}>
                        <td style={{ padding: '8px' }}>{item.itemName}</td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>{item.quantity}</td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>${item.unitPrice.toFixed(2)}</td>
                        <td style={{ textAlign: 'right', padding: '8px' }}>${item.total.toFixed(2)}</td>
                        <td style={{ textAlign: 'center', padding: '8px' }}>
                          <button 
                            type="button" 
                            onClick={() => removeItem(index)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' }}
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                    <tr style={{ fontWeight: 'bold', borderTop: '2px solid #e0e0e0' }}>
                      <td colSpan="3" style={{ textAlign: 'right', padding: '8px' }}>Total:</td>
                      <td style={{ textAlign: 'right', padding: '8px' }}>${calculateTotal()}</td>
                      <td></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Creating...' : 'Create Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PurchaseOrders;
