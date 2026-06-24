import React, { useState, useEffect } from 'react';
import styles from '../Finance/PaymentManagement.module.css';

const AssetRegistry = () => {
  const [assets, setAssets] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchAssets();
    fetchSuppliers();
  }, [filter]);

  const fetchAssets = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      
      const response = await fetch(`/api/assets?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssets(data.data);
      }
    } catch (error) {
      console.error('Error fetching assets:', error);
    } finally {
      setLoading(false);
    }
  };

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
    }
  };

  const generateQRCode = async (assetId, assetTag) => {
    try {
      // Generate QR code URL using a free API service
      const qrData = encodeURIComponent(JSON.stringify({ assetId, assetTag, type: 'ASSET' }));
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${qrData}`;
      
      // Open QR code in new window for download
      window.open(qrCodeUrl, '_blank');
    } catch (error) {
      console.error('Error generating QR code:', error);
      alert('Failed to generate QR code');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'ACTIVE': '#4CAF50',
      'MAINTENANCE': '#FF9800',
      'DISPOSED': '#F44336',
      'RETIRED': '#9E9E9E'
    };
    return colors[status] || '#9E9E9E';
  };

  const filteredAssets = assets.filter(asset =>
    asset.assetTag?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    asset.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Asset Registry</h1>
          <p>Register and manage fixed assets</p>
        </div>
        <button className={styles.recordButton} onClick={() => { setEditingAsset(null); setShowModal(true); }}>
          + Register Asset
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          {['ALL', 'ACTIVE', 'MAINTENANCE', 'DISPOSED', 'RETIRED'].map(status => (
            <button
              key={status}
              className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
            >
              {status}
            </button>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Search by asset tag, name, or category..."
          className={styles.searchInput}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Loading assets...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Name</th>
                <th>Category</th>
                <th>Purchase Date</th>
                <th>Purchase Cost</th>
                <th>Current Value</th>
                <th>Warranty Until</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.length === 0 ? (
                <tr><td colSpan="9" className={styles.noData}>No assets found</td></tr>
              ) : (
                filteredAssets.map(asset => (
                  <tr key={asset.id}>
                    <td className={styles.receiptNumber}>{asset.assetTag}</td>
                    <td>{asset.name}</td>
                    <td>{asset.category}</td>
                    <td>{new Date(asset.purchaseDate).toLocaleDateString()}</td>
                    <td className={styles.amount}>${parseFloat(asset.purchaseCost).toFixed(2)}</td>
                    <td className={styles.amount}>${parseFloat(asset.currentValue || asset.purchaseCost).toFixed(2)}</td>
                    <td>{asset.warrantyUntil ? new Date(asset.warrantyUntil).toLocaleDateString() : 'N/A'}</td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(asset.status) }}
                      >
                        {asset.status}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button 
                          className={styles.actionButton} 
                          onClick={() => { setEditingAsset(asset); setShowModal(true); }}
                          title="Edit"
                        >
                          ✏️
                        </button>
                        <button 
                          className={styles.actionButton}
                          onClick={() => generateQRCode(asset.id, asset.assetTag)}
                          title="Generate QR Code"
                        >
                          📱
                        </button>
                        <button className={styles.actionButton} title="View Details">👁️</button>
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
        <AssetModal 
          asset={editingAsset}
          suppliers={suppliers}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchAssets(); }}
        />
      )}
    </div>
  );
};

const AssetModal = ({ asset, suppliers, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    assetTag: asset?.assetTag || '',
    name: asset?.name || '',
    category: asset?.category || 'FURNITURE',
    purchaseDate: asset?.purchaseDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    purchaseCost: asset?.purchaseCost || '',
    supplierId: asset?.supplierId || '',
    warrantyUntil: asset?.warrantyUntil?.split('T')[0] || '',
    location: asset?.location || '',
    serialNumber: asset?.serialNumber || '',
    description: asset?.description || '',
    depreciationMethod: asset?.depreciationMethod || 'STRAIGHT_LINE',
    usefulLife: asset?.usefulLife || 5
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = asset ? `/api/assets/${asset.id}` : '/api/assets';
      const method = asset ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Asset ${asset ? 'updated' : 'registered'} successfully!`);
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '800px' }}>
        <div className={styles.modalHeader}>
          <h2>{asset ? 'Edit Asset' : 'Register Asset'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Asset Tag *</label>
              <input
                type="text"
                required
                value={formData.assetTag}
                onChange={(e) => setFormData({...formData, assetTag: e.target.value})}
                placeholder="e.g., AST-001"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Asset Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g., Dell Laptop"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Category *</label>
              <select
                required
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="FURNITURE">Furniture</option>
                <option value="EQUIPMENT">Equipment</option>
                <option value="ELECTRONICS">Electronics</option>
                <option value="VEHICLES">Vehicles</option>
                <option value="BUILDINGS">Buildings</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Serial Number</label>
              <input
                type="text"
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                placeholder="Manufacturer serial number"
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Purchase Date *</label>
              <input
                type="date"
                required
                value={formData.purchaseDate}
                onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Purchase Cost *</label>
              <input
                type="number"
                step="0.01"
                required
                value={formData.purchaseCost}
                onChange={(e) => setFormData({...formData, purchaseCost: e.target.value})}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Supplier</label>
              <select
                value={formData.supplierId}
                onChange={(e) => setFormData({...formData, supplierId: e.target.value})}
              >
                <option value="">-- Select Supplier --</option>
                {suppliers.map(supplier => (
                  <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Warranty Until</label>
              <input
                type="date"
                value={formData.warrantyUntil}
                onChange={(e) => setFormData({...formData, warrantyUntil: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Location</label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              placeholder="e.g., Room 101, Main Office"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className={styles.formGroup}>
              <label>Depreciation Method *</label>
              <select
                required
                value={formData.depreciationMethod}
                onChange={(e) => setFormData({...formData, depreciationMethod: e.target.value})}
              >
                <option value="STRAIGHT_LINE">Straight Line</option>
                <option value="DECLINING_BALANCE">Declining Balance</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Useful Life (Years) *</label>
              <input
                type="number"
                required
                value={formData.usefulLife}
                onChange={(e) => setFormData({...formData, usefulLife: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Additional details"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Saving...' : 'Save Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetRegistry;
