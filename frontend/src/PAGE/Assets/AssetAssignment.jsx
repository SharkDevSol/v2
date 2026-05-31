import React, { useState, useEffect } from 'react';
import styles from '../Finance/PaymentManagement.module.css';

const AssetAssignment = () => {
  const [assignments, setAssignments] = useState([]);
  const [assets, setAssets] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchAssets();
    fetchStaff();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await fetch('/api/assets/assignments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAssignments(data.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
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

  const fetchStaff = async () => {
    try {
      const response = await fetch('/api/staff', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStaff(data.data || data);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleReturn = async (assignmentId) => {
    if (!confirm('Mark this asset as returned?')) return;
    
    try {
      const response = await fetch(`/api/assets/assignments/${assignmentId}/return`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        fetchAssignments();
      }
    } catch (error) {
      console.error('Error returning asset:', error);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Asset Assignment</h1>
          <p>Assign assets to staff members or locations</p>
        </div>
        <button className={styles.recordButton} onClick={() => setShowModal(true)}>
          + Assign Asset
        </button>
      </div>

      {loading ? (
        <div className={styles.loading}>Loading assignments...</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Asset Tag</th>
                <th>Asset Name</th>
                <th>Assigned To</th>
                <th>Assignment Type</th>
                <th>Assigned Date</th>
                <th>Return Date</th>
                <th>Location</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.length === 0 ? (
                <tr><td colSpan="9" className={styles.noData}>No assignments found</td></tr>
              ) : (
                assignments.map(assignment => (
                  <tr key={assignment.id}>
                    <td className={styles.receiptNumber}>{assignment.assetTag}</td>
                    <td>{assignment.assetName}</td>
                    <td>{assignment.assignedToName || assignment.location}</td>
                    <td>{assignment.assignmentType}</td>
                    <td>{new Date(assignment.assignedDate).toLocaleDateString()}</td>
                    <td>{assignment.returnDate ? new Date(assignment.returnDate).toLocaleDateString() : '-'}</td>
                    <td>{assignment.location || '-'}</td>
                    <td>
                      <span 
                        className={styles.statusBadge}
                        style={{ backgroundColor: assignment.returnDate ? '#9E9E9E' : '#4CAF50' }}
                      >
                        {assignment.returnDate ? 'Returned' : 'Active'}
                      </span>
                    </td>
                    <td>
                      <div className={styles.actions}>
                        <button className={styles.actionButton} title="View">👁️</button>
                        {!assignment.returnDate && (
                          <button 
                            className={styles.actionButton}
                            onClick={() => handleReturn(assignment.id)}
                            title="Mark as Returned"
                          >
                            ↩️
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
        <AssignmentModal 
          assets={assets}
          staff={staff}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchAssignments(); }}
        />
      )}
    </div>
  );
};

const AssignmentModal = ({ assets, staff, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    assetId: '',
    assignmentType: 'STAFF',
    assignedToStaffId: '',
    location: '',
    assignedDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/assets/assignments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Asset assigned successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to assign asset');
      }
    } catch (error) {
      console.error('Error assigning asset:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Assign Asset</h2>
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
            <label>Assignment Type *</label>
            <select
              required
              value={formData.assignmentType}
              onChange={(e) => setFormData({...formData, assignmentType: e.target.value})}
            >
              <option value="STAFF">Assign to Staff</option>
              <option value="LOCATION">Assign to Location</option>
            </select>
          </div>

          {formData.assignmentType === 'STAFF' ? (
            <div className={styles.formGroup}>
              <label>Staff Member *</label>
              <select
                required
                value={formData.assignedToStaffId}
                onChange={(e) => setFormData({...formData, assignedToStaffId: e.target.value})}
              >
                <option value="">-- Select Staff --</option>
                {staff.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name || `${s.firstName} ${s.lastName}`}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className={styles.formGroup}>
              <label>Location *</label>
              <input
                type="text"
                required
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Room 101, Main Office"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label>Assignment Date *</label>
            <input
              type="date"
              required
              value={formData.assignedDate}
              onChange={(e) => setFormData({...formData, assignedDate: e.target.value})}
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
              {loading ? 'Assigning...' : 'Assign Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssetAssignment;
