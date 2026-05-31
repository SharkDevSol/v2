import React, { useState, useEffect } from 'react';
import styles from './PaymentManagement.module.css';

const InventoryExpenseIntegration = () => {
  const [purchaseOrders, setPurchaseOrders] = useState([]);
  const [linkedExpenses, setLinkedExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedPO, setSelectedPO] = useState(null);

  useEffect(() => {
    fetchPurchaseOrders();
    fetchLinkedExpenses();
  }, []);

  const fetchPurchaseOrders = async () => {
    try {
      // Fetch received POs that haven't been linked to expenses
      const response = await fetch('/api/inventory/purchase-orders?status=RECEIVED&unlinked=true', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPurchaseOrders(data.data);
      }
    } catch (error) {
      console.error('Error fetching purchase orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLinkedExpenses = async () => {
    try {
      const response = await fetch('/api/finance/expenses?source=INVENTORY', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setLinkedExpenses(data.data);
      }
    } catch (error) {
      console.error('Error fetching linked expenses:', error);
    }
  };

  const linkPOToExpense = async (poId) => {
    try {
      const response = await fetch('/api/finance/expenses/link-purchase-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ purchaseOrderId: poId })
      });

      if (response.ok) {
        alert('Purchase order linked to expense successfully!');
        fetchPurchaseOrders();
        fetchLinkedExpenses();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to link purchase order');
      }
    } catch (error) {
      console.error('Error linking purchase order:', error);
      alert('An error occurred');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Inventory-Finance Integration</h1>
          <p>Link purchase orders to expenses for Cost of Goods tracking</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
        <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#856404' }}>⏳ Pending Purchase Orders</h3>
          <p style={{ fontSize: '32px', fontWeight: 700, margin: 0, color: '#856404' }}>
            {purchaseOrders.length}
          </p>
          <p style={{ fontSize: '12px', color: '#856404', margin: '4px 0 0 0' }}>
            Received POs not yet linked to expenses
          </p>
        </div>

        <div style={{ padding: '20px', background: '#d4edda', borderRadius: '8px', border: '1px solid #28a745' }}>
          <h3 style={{ margin: '0 0 8px 0', color: '#155724' }}>✅ Linked Expenses</h3>
          <p style={{ fontSize: '32px', fontWeight: 700, margin: 0, color: '#155724' }}>
            {linkedExpenses.length}
          </p>
          <p style={{ fontSize: '12px', color: '#155724', margin: '4px 0 0 0' }}>
            Purchase orders tracked in finance
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>Unlinked Purchase Orders</h2>
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
                  <th>Received Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {purchaseOrders.length === 0 ? (
                  <tr><td colSpan="7" className={styles.noData}>All purchase orders are linked to expenses</td></tr>
                ) : (
                  purchaseOrders.map(po => (
                    <tr key={po.id}>
                      <td className={styles.receiptNumber}>{po.poNumber}</td>
                      <td>{new Date(po.orderDate).toLocaleDateString()}</td>
                      <td>{po.supplierName}</td>
                      <td>{po.itemCount || 0} items</td>
                      <td className={styles.amount}>${parseFloat(po.totalAmount || 0).toFixed(2)}</td>
                      <td>{po.receivedDate ? new Date(po.receivedDate).toLocaleDateString() : '-'}</td>
                      <td>
                        <button 
                          className={styles.actionButton}
                          onClick={() => {
                            setSelectedPO(po);
                            setShowLinkModal(true);
                          }}
                          style={{ 
                            background: '#4CAF50', 
                            color: 'white', 
                            padding: '6px 12px',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                        >
                          🔗 Link to Expense
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h2 style={{ marginBottom: '16px' }}>Linked Inventory Expenses</h2>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Expense #</th>
                <th>PO Number</th>
                <th>Date</th>
                <th>Supplier</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {linkedExpenses.length === 0 ? (
                <tr><td colSpan="8" className={styles.noData}>No linked expenses found</td></tr>
              ) : (
                linkedExpenses.map(expense => (
                  <tr key={expense.id}>
                    <td className={styles.receiptNumber}>{expense.expenseNumber}</td>
                    <td>{expense.poNumber}</td>
                    <td>{new Date(expense.expenseDate).toLocaleDateString()}</td>
                    <td>{expense.vendorName}</td>
                    <td>{expense.category}</td>
                    <td className={styles.amount}>${parseFloat(expense.amount).toFixed(2)}</td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: '#4CAF50' }}
                      >
                        {expense.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionButton} title="View Details">👁️</button>
                        <button className={styles.actionButton} title="View PO">📦</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showLinkModal && selectedPO && (
        <LinkModal 
          po={selectedPO}
          onClose={() => {
            setShowLinkModal(false);
            setSelectedPO(null);
          }}
          onConfirm={() => {
            linkPOToExpense(selectedPO.id);
            setShowLinkModal(false);
            setSelectedPO(null);
          }}
        />
      )}
    </div>
  );
};

const LinkModal = ({ po, onClose, onConfirm }) => {
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
        <div className={styles.modalHeader}>
          <h2>Link Purchase Order to Expense</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <div style={{ padding: '24px' }}>
          <div style={{ background: '#f5f5f5', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '12px' }}>Purchase Order Details</h3>
            <div style={{ display: 'grid', gap: '8px', fontSize: '14px' }}>
              <div><strong>PO Number:</strong> {po.poNumber}</div>
              <div><strong>Supplier:</strong> {po.supplierName}</div>
              <div><strong>Order Date:</strong> {new Date(po.orderDate).toLocaleDateString()}</div>
              <div><strong>Items:</strong> {po.itemCount || 0} items</div>
              <div><strong>Total Amount:</strong> ${parseFloat(po.totalAmount || 0).toFixed(2)}</div>
            </div>
          </div>

          <div style={{ background: '#e3f2fd', padding: '16px', borderRadius: '8px', marginBottom: '20px' }}>
            <h4 style={{ marginTop: 0, marginBottom: '8px', color: '#1976d2' }}>📋 What will happen:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#1565c0' }}>
              <li>A new expense will be created in the Finance module</li>
              <li>Category will be set to "INVENTORY_PURCHASE"</li>
              <li>Amount will match the PO total amount</li>
              <li>Expense will be linked to this purchase order</li>
              <li>Cost of Goods will be tracked in financial reports</li>
            </ul>
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button 
              onClick={onClose}
              style={{
                padding: '10px 20px',
                background: '#f5f5f5',
                border: '1px solid #ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              style={{
                padding: '10px 20px',
                background: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              ✅ Confirm & Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryExpenseIntegration;
