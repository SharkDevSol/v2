import React, { useState, useEffect } from 'react';
import styles from '../Finance/PaymentManagement.module.css';

const AssetMaintenance = () => {
  const [maintenances, setMaintenances] = useState([]);
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchMaintenances();
    fetchAssets();
  }, [filter]);

  const fetchMaintenances = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      
      const response = await fetch(`/api/assets/maintenance?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMaintenances(data.data);
      }
    } catch (error) {
      console.error('Error fetching maintenances:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch('/api/assets', {
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

  const getStatusColor = (status) => {
    const colors = {
      'SCHEDULED': '#2196F3',
      'IN_PROGRESS': '#FF9800',
      'COMPLETED': '#4CAF50',
      'CANCELLED': '#F44336'
    };
    return colors[status] || '#9E9E9E';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Asset Maintenance</h1>
          <p>Track maintenance schedules and service history</p>
        </div>
        <button className={styles.recordButton} onClick={() => setShowModal(true)}>
          + Schedule Maintenance
        </button>
      </div>

      <div className={styles.filters}>
        <div className={styles.filterTabs}>
          {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
            <button
              key={status}
              className={`${styles.filterTab} ${filter === status ? styles.active : ''}`}
              onClick={() => setFilter(status)}
            >
              {status.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading maintenance records...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Maintenance Type</th>
                <th>Scheduled Date</th>
                <th>Completed Date</th>
                <th>Cost</th>
                <th>Vendor</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.length === 0 ? (
                <tr><td colSpan="9" className={styles.noData}>No maintenance records found</td></tr>
              ) : (
                maintenances.map(maintenance => (
                  <tr key={maintenance.id}>
                    <td className={styles.receiptNumber}>{maintenance.assetTag}</td>
                    <td>{maintenance.assetName}</td>
                    <td>{maintenance.maintenanceType}</td>
                    <td>{new Date(maintenance.scheduledDate).toLocaleDateString()}</td>
                    <td>{maintenance.completedDate ? new Date(maintenance.completedDate).toLocaleDateString() : '-'}</td>
                    <td className={styles.amount}>${parseFloat(maintenance.cost || 0).toFixed(2)}</td>
                    <td>{maintenance.vendor || '-'}</td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: getStatusColor(maintenance.status) }}
                      >
                        {maintenance.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionButton} title="View">👁️</button>
                        {maintenance.status !== 'COMPLETED' && (
                          <button className={styles.actionButton} title="Mark Complete">✅</button>
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
        <MaintenanceModal 
          assets={assets}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchMaintenances(); }}
        />
      )}
    </div>
  );
};

const MaintenanceModal = ({ assets, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    assetId: '',
    maintenanceType: 'PREVENTIVE',
    scheduledDate: new Date().toISOString().split('T')[0],
    description: '',
    vendor: '',
    estimatedCost: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/assets/maintenance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Maintenance scheduled successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to schedule maintenance');
      }
    } catch (error) {
      console.error('Error scheduling maintenance:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Schedule Maintenance</h2>
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
                  {asset.assetTag} - {asset.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Maintenance Type *</label>
            <select
              required
              value={formData.maintenanceType}
              onChange={(e) => setFormData({...formData, maintenanceType: e.target.value})}
            >
              <option value="PREVENTIVE">Preventive</option>
              <option value="CORRECTIVE">Corrective</option>
              <option value="INSPECTION">Inspection</option>
              <option value="REPAIR">Repair</option>
              <option value="UPGRADE">Upgrade</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Scheduled Date *</label>
            <input
              type="date"
              required
              value={formData.scheduledDate}
              onChange={(e) => setFormData({...formData, scheduledDate: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Description *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe the maintenance work"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Vendor/Service Provider</label>
            <input
              type="text"
              value={formData.vendor}
              onChange={(e) => setFormData({...formData, vendor: e.target.value})}
              placeholder="Optional"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Estimated Cost</label>
            <input
              type="number"
              step="0.01"
              value={formData.estimatedCost}
              onChange={(e) => setFormData({...formData, estimatedCost: e.target.value})}
              placeholder="Optional"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Scheduling...' : 'Schedule Maintenance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetMaintenance;
