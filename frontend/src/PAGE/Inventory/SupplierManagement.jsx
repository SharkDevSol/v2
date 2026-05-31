import React, { useState, useEffect } from 'react';
import styles from '../Finance/FeeManagement/FeeManagement.module.css';

const SupplierManagement = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await fetch('/api/inventory/suppliers', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSuppliers(data.data);
      }
    } catch (error) {
      console.error('Error fetching suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this supplier?')) return;
    try {
      const response = await fetch(`/api/inventory/suppliers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchSuppliers();
      }
    } catch (error) {
      console.error('Error deleting supplier:', error);
    }
  };

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.phone?.includes(searchTerm)
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Supplier Management</h1>
          <p>Manage supplier information and relationships</p>
        </div>
        <button className={styles.addButton} onClick={() => { setEditingSupplier(null); setShowModal(true); }}>
          + Add Supplier
        </button>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Search suppliers by name, email, or phone..."
          style={{
            width: '100%',
            padding: '12px 16px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '14px'
          }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading suppliers...</div>
      ) : (
        <div className={styles.grid}>
          {filteredSuppliers.length === 0 ? (
            <div className={styles.noData}>No suppliers found</div>
          ) : (
            filteredSuppliers.map(supplier => (
              <div key={supplier.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{supplier.name}</h3>
                  <span className={`${styles.badge} ${supplier.isActive ? styles.active : styles.inactive}`}>
                    {supplier.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p><strong>Contact Person:</strong> {supplier.contactPerson || 'N/A'}</p>
                  <p><strong>Email:</strong> {supplier.email || 'N/A'}</p>
                  <p><strong>Phone:</strong> {supplier.phone || 'N/A'}</p>
                  <p><strong>Address:</strong> {supplier.address || 'N/A'}</p>
                  {supplier.taxId && <p><strong>Tax ID:</strong> {supplier.taxId}</p>}
                  {supplier.paymentTerms && <p><strong>Payment Terms:</strong> {supplier.paymentTerms}</p>}
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => { setEditingSupplier(supplier); setShowModal(true); }}>✏️ Edit</button>
                  <button onClick={() => handleDelete(supplier.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <SupplierModal 
          supplier={editingSupplier}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchSuppliers(); }}
        />
      )}
    </div>
  );
};

const SupplierModal = ({ supplier, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
    taxId: supplier?.taxId || '',
    paymentTerms: supplier?.paymentTerms || '',
    notes: supplier?.notes || ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = supplier ? `/api/inventory/suppliers/${supplier.id}` : '/api/inventory/suppliers';
      const method = supplier ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Supplier ${supplier ? 'updated' : 'created'} successfully!`);
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
          <h2>{supplier ? 'Edit Supplier' : 'Add Supplier'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Supplier Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="e.g., ABC Supplies Ltd"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Contact Person</label>
              <input
                type="text"
                value={formData.contactPerson}
                onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                placeholder="e.g., John Doe"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                placeholder="e.g., +1234567890"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="e.g., supplier@example.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              placeholder="Full address"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Tax ID / VAT Number</label>
              <input
                type="text"
                value={formData.taxId}
                onChange={(e) => setFormData({...formData, taxId: e.target.value})}
                placeholder="e.g., 123456789"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Payment Terms</label>
              <input
                type="text"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                placeholder="e.g., Net 30 days"
              />
            </div>
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
              {loading ? 'Saving...' : 'Save Supplier'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SupplierManagement;
