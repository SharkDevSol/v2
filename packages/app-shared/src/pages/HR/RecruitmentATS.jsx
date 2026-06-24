import React, { useState, useEffect } from 'react';
import styles from '../Finance/PaymentManagement.module.css';

const RecruitmentATS = () => {
  const [applications, setApplications] = useState([]);
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [activeTab, setActiveTab] = useState('applications');

  useEffect(() => {
    fetchApplications();
    fetchPositions();
  }, [filter]);

  const fetchApplications = async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'ALL') params.append('status', filter);
      
      const response = await fetch(`/api/hr/recruitment/applications?${params}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPositions = async () => {
    try {
      const response = await fetch('/api/hr/recruitment/positions', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPositions(data.data);
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
    }
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/hr/recruitment/applications/${applicationId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'NEW': '#2196F3',
      'SCREENING': '#FF9800',
      'INTERVIEW': '#9C27B0',
      'OFFER': '#4CAF50',
      'HIRED': '#00BCD4',
      'REJECTED': '#F44336'
    };
    return colors[status] || '#9E9E9E';
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>Recruitment (ATS)</h1>
          <p>Applicant Tracking System from CV to Offer Letter</p>
        </div>
        <button className={styles.recordButton} onClick={() => setShowModal(true)}>
          + {activeTab === 'applications' ? 'Add Application' : 'Post Position'}
        </button>
      </div>

      <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
        <button
          onClick={() => setActiveTab('applications')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'applications' ? '#4CAF50' : 'white',
            color: activeTab === 'applications' ? 'white' : '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Applications
        </button>
        <button
          onClick={() => setActiveTab('positions')}
          style={{
            padding: '10px 24px',
            background: activeTab === 'positions' ? '#4CAF50' : 'white',
            color: activeTab === 'positions' ? 'white' : '#333',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Open Positions
        </button>
      </div>

      {activeTab === 'applications' && (
        <>
          <div className={styles.filters}>
            <div className={styles.filterTabs}>
              {['ALL', 'NEW', 'SCREENING', 'INTERVIEW', 'OFFER', 'HIRED', 'REJECTED'].map(status => (
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
            <div className={styles.loading}>Loading applications...</div>
          ) : (
            <div className={styles.tableContainer}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Applicant Name</th>
                    <th>Position</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Applied Date</th>
                    <th>Experience</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr><td colSpan="8" className={styles.noData}>No applications found</td></tr>
                  ) : (
                    applications.map(app => (
                      <tr key={app.id}>
                        <td className={styles.receiptNumber}>{app.applicantName}</td>
                        <td>{app.positionTitle}</td>
                        <td>{app.email}</td>
                        <td>{app.phone}</td>
                        <td>{new Date(app.appliedDate).toLocaleDateString()}</td>
                        <td>{app.experience} years</td>
                        <td>
                          <span 
                            className={styles.statusBadge}
                            style={{ backgroundColor: getStatusColor(app.status) }}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actions}>
                            <button className={styles.actionButton} title="View CV">📄</button>
                            <select
                              value={app.status}
                              onChange={(e) => updateApplicationStatus(app.id, e.target.value)}
                              style={{ padding: '4px', fontSize: '12px', borderRadius: '4px' }}
                            >
                              <option value="NEW">New</option>
                              <option value="SCREENING">Screening</option>
                              <option value="INTERVIEW">Interview</option>
                              <option value="OFFER">Offer</option>
                              <option value="HIRED">Hired</option>
                              <option value="REJECTED">Rejected</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {activeTab === 'positions' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {positions.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#666' }}>
              No open positions
            </div>
          ) : (
            positions.map(position => (
              <div key={position.id} style={{
                background: 'white',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                borderTop: '4px solid #4CAF50'
              }}>
                <h3 style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px' }}>{position.title}</h3>
                <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Department:</strong> {position.departmentName}
                </p>
                <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Vacancies:</strong> {position.vacancies}
                </p>
                <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Applications:</strong> {position.applicationCount || 0}
                </p>
                <p style={{ margin: '8px 0', fontSize: '14px', color: '#666' }}>
                  <strong>Posted:</strong> {new Date(position.postedDate).toLocaleDateString()}
                </p>
                <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                  <button style={{
                    flex: 1,
                    padding: '8px',
                    background: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer'
                  }}>
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showModal && (
        activeTab === 'applications' ? (
          <ApplicationModal 
            positions={positions}
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchApplications(); }}
          />
        ) : (
          <PositionModal 
            onClose={() => setShowModal(false)}
            onSuccess={() => { setShowModal(false); fetchPositions(); }}
          />
        )
      )}
    </div>
  );
};

const ApplicationModal = ({ positions, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    positionId: '',
    applicantName: '',
    email: '',
    phone: '',
    experience: '',
    education: '',
    cvFile: null
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key]) formDataToSend.append(key, formData[key]);
      });

      const response = await fetch('/api/hr/recruitment/applications', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      if (response.ok) {
        alert('Application submitted successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to submit application');
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Add Application</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Position *</label>
            <select
              required
              value={formData.positionId}
              onChange={(e) => setFormData({...formData, positionId: e.target.value})}
            >
              <option value="">-- Select Position --</option>
              {positions.map(pos => (
                <option key={pos.id} value={pos.id}>{pos.title}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Applicant Name *</label>
            <input
              type="text"
              required
              value={formData.applicantName}
              onChange={(e) => setFormData({...formData, applicantName: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Phone *</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Years of Experience *</label>
            <input
              type="number"
              required
              value={formData.experience}
              onChange={(e) => setFormData({...formData, experience: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Education *</label>
            <input
              type="text"
              required
              value={formData.education}
              onChange={(e) => setFormData({...formData, education: e.target.value})}
              placeholder="e.g., Bachelor's in Computer Science"
            />
          </div>

          <div className={styles.formGroup}>
            <label>CV/Resume</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFormData({...formData, cvFile: e.target.files[0]})}
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const PositionModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    departmentId: '',
    vacancies: 1,
    description: '',
    requirements: '',
    salary: ''
  });
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('/api/hr/departments', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setDepartments(data.data);
      }
    } catch (error) {
      console.error('Error fetching departments:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/hr/recruitment/positions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        alert('Position posted successfully!');
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error?.message || 'Failed to post position');
      }
    } catch (error) {
      console.error('Error posting position:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Post New Position</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label>Position Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., Senior Teacher"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Department *</label>
            <select
              required
              value={formData.departmentId}
              onChange={(e) => setFormData({...formData, departmentId: e.target.value})}
            >
              <option value="">-- Select Department --</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Number of Vacancies *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.vacancies}
              onChange={(e) => setFormData({...formData, vacancies: e.target.value})}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Job Description *</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Brief description"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Requirements *</label>
            <input
              type="text"
              required
              value={formData.requirements}
              onChange={(e) => setFormData({...formData, requirements: e.target.value})}
              placeholder="Required qualifications"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Salary Range</label>
            <input
              type="text"
              value={formData.salary}
              onChange={(e) => setFormData({...formData, salary: e.target.value})}
              placeholder="e.g., $50,000 - $70,000"
            />
          </div>

          <div className={styles.modalActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>Cancel</button>
            <button type="submit" disabled={loading} className={styles.submitButton}>
              {loading ? 'Posting...' : 'Post Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecruitmentATS;
