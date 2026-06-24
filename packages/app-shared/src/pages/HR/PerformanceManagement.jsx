import React, { useState, useEffect } from 'react';
import styles from '../Finance/FeeManagement/FeeManagement.module.css';

const PerformanceManagement = () => {
  const [reviews, setReviews] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchReviews();
    fetchStaff();
  }, [filter]);

  const fetchReviews = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      
      const response = await fetch(`/api/hr/performance?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(data.data);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
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

  const getRatingColor = (rating) => {
    if (rating >= 4.5) return '#4CAF50';
    if (rating >= 3.5) return '#2196F3';
    if (rating >= 2.5) return '#FF9800';
    return '#F44336';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Performance Management</h1>
          <p>Performance reviews and KPI tracking</p>
        </div>
        <button className={styles.addButton} onClick={() => { setEditingReview(null); setShowModal(true); }}>
          + Add Review
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        {['ALL', 'PENDING', 'COMPLETED', 'APPROVED'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            style={{
              padding: '8px 16px',
              background: filter === status ? '#2196F3' : 'white',
              color: filter === status ? 'white' : '#333',
              border: '1px solid #e0e0e0',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loading}>Loading reviews...</div>
      ) : (
        <div className={styles.grid}>
          {reviews.length === 0 ? (
            <div className={styles.noData}>No performance reviews found</div>
          ) : (
            reviews.map(review => (
              <div key={review.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>{review.staffName}</h3>
                  <div style={{ 
                    fontSize: '24px', 
                    fontWeight: 700, 
                    color: getRatingColor(review.overallRating)
                  }}>
                    {review.overallRating?.toFixed(1) || 'N/A'}
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <p><strong>Review Period:</strong> {review.reviewPeriod}</p>
                  <p><strong>Review Date:</strong> {new Date(review.reviewDate).toLocaleDateString()}</p>
                  <p><strong>Reviewer:</strong> {review.reviewerName}</p>
                  
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
                    <div style={{ fontSize: '12px', marginBottom: '8px' }}>
                      <strong>KPI Scores:</strong>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
                      <div>Quality: {review.qualityScore || 0}/5</div>
                      <div>Productivity: {review.productivityScore || 0}/5</div>
                      <div>Teamwork: {review.teamworkScore || 0}/5</div>
                      <div>Punctuality: {review.punctualityScore || 0}/5</div>
                    </div>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button onClick={() => { setEditingReview(review); setShowModal(true); }}>✏️ Edit</button>
                  <button onClick={() => alert('View full review')}>👁️ View</button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        <ReviewModal 
          review={editingReview}
          staff={staff}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); fetchReviews(); }}
        />
      )}
    </div>
  );
};

const ReviewModal = ({ review, staff, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    staffId: review?.staffId || '',
    reviewPeriod: review?.reviewPeriod || '',
    reviewDate: review?.reviewDate?.split('T')[0] || new Date().toISOString().split('T')[0],
    qualityScore: review?.qualityScore || 3,
    productivityScore: review?.productivityScore || 3,
    teamworkScore: review?.teamworkScore || 3,
    punctualityScore: review?.punctualityScore || 3,
    communicationScore: review?.communicationScore || 3,
    strengths: review?.strengths || '',
    areasForImprovement: review?.areasForImprovement || '',
    goals: review?.goals || '',
    comments: review?.comments || ''
  });
  const [loading, setLoading] = useState(false);

  const calculateOverallRating = () => {
    const scores = [
      formData.qualityScore,
      formData.productivityScore,
      formData.teamworkScore,
      formData.punctualityScore,
      formData.communicationScore
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg.toFixed(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = review ? `/api/hr/performance/${review.id}` : '/api/hr/performance';
      const method = review ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          ...formData,
          overallRating: parseFloat(calculateOverallRating())
        })
      });

      if (response.ok) {
        alert(`Review ${review ? 'updated' : 'created'} successfully!`);
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
      <div className={styles.modal} onClick={(e) => e.stopPropagation()} style={{ maxWidth: '700px' }}>
        <div className={styles.modalHeader}>
          <h2>{review ? 'Edit Review' : 'Add Performance Review'}</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Staff Member *</label>
            <select
              required
              value={formData.staffId}
              onChange={(e) => setFormData({...formData, staffId: e.target.value})}
            >
              <option value="">-- Select Staff --</option>
              {staff.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name || `${s.firstName} ${s.lastName}`}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>Review Period *</label>
              <input
                type="text"
                required
                value={formData.reviewPeriod}
                onChange={(e) => setFormData({...formData, reviewPeriod: e.target.value})}
                placeholder="e.g., Q1 2024, Jan-Mar 2024"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Review Date *</label>
              <input
                type="date"
                required
                value={formData.reviewDate}
                onChange={(e) => setFormData({...formData, reviewDate: e.target.value})}
              />
            </div>
          </div>

          <div style={{ padding: '16px', background: '#f5f5f5', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '16px' }}>KPI Scores (1-5)</h3>
            
            {[
              { key: 'qualityScore', label: 'Quality of Work' },
              { key: 'productivityScore', label: 'Productivity' },
              { key: 'teamworkScore', label: 'Teamwork' },
              { key: 'punctualityScore', label: 'Punctuality' },
              { key: 'communicationScore', label: 'Communication' }
            ].map(({ key, label }) => (
              <div key={key} style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '14px' }}>{label}</label>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={formData[key]}
                  onChange={(e) => setFormData({...formData, [key]: parseInt(e.target.value)})}
                  style={{ width: '100%' }}
                />
                <div style={{ textAlign: 'right', fontSize: '14px', fontWeight: 600 }}>{formData[key]}/5</div>
              </div>
            ))}

            <div style={{ marginTop: '16px', padding: '12px', background: 'white', borderRadius: '6px', textAlign: 'center' }}>
              <strong>Overall Rating:</strong> <span style={{ fontSize: '24px', color: '#2196F3' }}>{calculateOverallRating()}/5</span>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Strengths</label>
            <input
              type="text"
              value={formData.strengths}
              onChange={(e) => setFormData({...formData, strengths: e.target.value})}
              placeholder="Key strengths demonstrated"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Areas for Improvement</label>
            <input
              type="text"
              value={formData.areasForImprovement}
              onChange={(e) => setFormData({...formData, areasForImprovement: e.target.value})}
              placeholder="Areas that need development"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Goals for Next Period</label>
            <input
              type="text"
              value={formData.goals}
              onChange={(e) => setFormData({...formData, goals: e.target.value})}
              placeholder="Goals and objectives"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Additional Comments</label>
            <input
              type="text"
              value={formData.comments}
              onChange={(e) => setFormData({...formData, comments: e.target.value})}
              placeholder="Any additional feedback"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Saving...' : 'Save Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerformanceManagement;
