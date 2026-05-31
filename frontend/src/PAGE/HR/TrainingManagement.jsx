import React, { useState, useEffect } from 'react';
import styles from '../Finance/FeeManagement/FeeManagement.module.css';

const TrainingManagement = () => {
  const [trainings, setTrainings] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTraining, setEditingTraining] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchTrainings();
    fetchStaff();
  }, [filter]);

  const fetchTrainings = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      
      const response = await fetch(`/api/hr/training?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTrainings(data.data);
      }
    } catch (error) {
      console.error('Error fetching trainings:', error);
    } finally {
      setLoading(false);
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
          <h1>Training Management</h1>
          <p>Training programs and skill development tracking</p>
        </div>
        <button className={styles.addButton} onClick={() => { setEditingTraining(null); setShowModal(true); }}>
          + Add Training
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        {['ALL', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              background: filter === status ? '#FF5722' : 'white',
              color: filter === status ? 'white' : '#333',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {status.replace('_', ' ')}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading trainings...</div>
      ) : (
        <div className={styles.grid}>
          {trainings.length === 0 ? (
            <div className={styles.noData}>No training programs found</div>
          ) : (
            trainings.map(training => (
              <div key={training.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{training.title}</h3>
                  <span className={`${styles.badge} ${training.status === 'COMPLETED' ? styles.active : styles.inactive}`}>
                    {training.status.replace('_', ' ')}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p><strong>Type:</strong> {training.trainingType}</p>
                  <p><strong>Trainer:</strong> {training.trainer}</p>
                  <p><strong>Start Date:</strong> {new Date(training.startDate).toLocaleDateString()}</p>
                  <p><strong>End Date:</strong> {new Date(training.endDate).toLocaleDateString()}</p>
                  <p><strong>Duration:</strong> {training.duration} hours</p>
                  <p><strong>Participants:</strong> {training.participantCount || 0}</p>
                  {training.location && <p><strong>Location:</strong> {training.location}</p>}
                  
                  {training.status === 'COMPLETED' && training.completionRate && (
                    <div style={{ marginTop: '12px', padding: '8px', background: '#e8f5e9', borderRadius: '6px' }}>
                      <strong>Completion Rate:</strong> {training.completionRate}%
                    </div>
                  )}
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => { setEditingTraining(training); setShowModal(true); }}>✏️ Edit</button>
                  <button onClick={() => alert('View participants')}>👥 Participants</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <TrainingModal 
          training={editingTraining}
          staff={staff}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchTrainings(); }}
        />
      )}
    </div>
  );
};

const TrainingModal = ({ training, staff, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: training?.title || '',
    trainingType: training?.trainingType || 'TECHNICAL',
    trainer: training?.trainer || '',
    startDate: training?.startDate?.split('T')[0] || '',
    endDate: training?.endDate?.split('T')[0] || '',
    duration: training?.duration || '',
    location: training?.location || '',
    description: training?.description || '',
    participants: training?.participants || []
  });
  const [loading, setLoading] = useState(false);

  const handleParticipantToggle = (staffId) => {
    const newParticipants = formData.participants.includes(staffId)
      ? formData.participants.filter(id => id !== staffId)
      : [...formData.participants, staffId];
    setFormData({...formData, participants: newParticipants});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = training ? `/api/hr/training/${training.id}` : '/api/hr/training';
      const method = training ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert(`Training ${training ? 'updated' : 'created'} successfully!`);
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
          <h2>{training ? 'Edit Training' : 'Add Training Program'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Training Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Advanced Excel Training"
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Training Type *</label>
              <select
                required
                value={formData.trainingType}
                onChange={(e) => setFormData({...formData, trainingType: e.target.value})}
              >
                <option value="TECHNICAL">Technical</option>
                <option value="SOFT_SKILLS">Soft Skills</option>
                <option value="LEADERSHIP">Leadership</option>
                <option value="COMPLIANCE">Compliance</option>
                <option value="SAFETY">Safety</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Trainer *</label>
              <input
                type="text"
                required
                value={formData.trainer}
                onChange={(e) => setFormData({...formData, trainer: e.target.value})}
                placeholder="Trainer name"
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({...formData, startDate: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({...formData, endDate: e.target.value})}
              />
            </div>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Duration (Hours) *</label>
              <input
                type="number"
                required
                value={formData.duration}
                onChange={(e) => setFormData({...formData, duration: e.target.value})}
              />
            </div>

            <div className={styles.formGroup}>
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
                placeholder="e.g., Conference Room A"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Description</label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Training objectives and content"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Select Participants</label>
            <div style={{ 
              maxHeight: '200px', 
              overflowY: 'auto', 
              border: '1px solid #e0e0e0', 
              borderRadius: '6px',
              padding: '12px'
            }}>
              {staff.map(s => (
                <label 
                  key={s.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    padding: '6px',
                    cursor: 'pointer',
                    borderRadius: '4px',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(s.id)}
                    onChange={() => handleParticipantToggle(s.id)}
                    style={{ marginRight: '12px', width: '18px', height: '18px' }}
                  />
                  <span>{s.name || `${s.firstName} ${s.lastName}`}</span>
                </label>
              ))}
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              {formData.participants.length} participant(s) selected
            </p>
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Saving...' : 'Save Training'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TrainingManagement;
