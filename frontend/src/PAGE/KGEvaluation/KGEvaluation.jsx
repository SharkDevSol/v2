import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_CONFIG from '../../config/api.config';
import styles from './KGEvaluation.module.css';

const KGEvaluation = () => {
  const [evaluations, setEvaluations] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    evaluation_name: '',
    class_name: '',
    term: 'Term 1',
    academic_year: '',
    teacher_name: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchEvaluations();
    fetchAreas();
  }, []);

  const fetchEvaluations = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/kg-evaluations`);
      setEvaluations(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching KG evaluations:', error);
      setLoading(false);
    }
  };

  const fetchAreas = async () => {
    try {
      const response = await axios.get(`${API_CONFIG.baseURL}/api/kg-evaluations/areas`);
      setAreas(response.data);
    } catch (error) {
      console.error('Error fetching KG evaluation areas:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCreateEvaluation = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_CONFIG.baseURL}/api/kg-evaluations`, formData);
      alert('KG Evaluation created successfully!');
      setShowCreateForm(false);
      setFormData({
        evaluation_name: '',
        class_name: '',
        term: 'Term 1',
        academic_year: '',
        teacher_name: '',
        status: 'draft'
      });
      fetchEvaluations();
    } catch (error) {
      console.error('Error creating KG evaluation:', error);
      alert('Failed to create KG evaluation');
    }
  };

  const handleDeleteEvaluation = async (id) => {
    if (!window.confirm('Are you sure you want to delete this evaluation?')) {
      return;
    }
    
    try {
      await axios.delete(`${API_CONFIG.baseURL}/api/kg-evaluations/${id}`);
      alert('Evaluation deleted successfully');
      fetchEvaluations();
    } catch (error) {
      console.error('Error deleting evaluation:', error);
      alert('Failed to delete evaluation');
    }
  };

  const handleViewEvaluation = (id) => {
    window.location.href = `/kg-evaluation-form/${id}`;
  };

  if (loading) {
    return <div className={styles.loading}>Loading KG Evaluations...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Kindergarten Evaluations</h1>
        <button 
          className={styles.createButton}
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? 'Cancel' : '+ Create New Evaluation'}
        </button>
      </div>

      {showCreateForm && (
        <div className={styles.createForm}>
          <h2>Create New KG Evaluation</h2>
          <form onSubmit={handleCreateEvaluation}>
            <div className={styles.formGroup}>
              <label>Evaluation Name *</label>
              <input
                type="text"
                name="evaluation_name"
                value={formData.evaluation_name}
                onChange={handleInputChange}
                required
                placeholder="e.g., KG1 Term 1 Development Assessment"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Class Name *</label>
              <input
                type="text"
                name="class_name"
                value={formData.class_name}
                onChange={handleInputChange}
                required
                placeholder="e.g., KG1, KG2, KG3"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Term *</label>
              <select
                name="term"
                value={formData.term}
                onChange={handleInputChange}
                required
              >
                <option value="Term 1">Term 1</option>
                <option value="Term 2">Term 2</option>
                <option value="Term 3">Term 3</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Academic Year</label>
              <input
                type="text"
                name="academic_year"
                value={formData.academic_year}
                onChange={handleInputChange}
                placeholder="e.g., 2024/2025"
              />
            </div>

            <div className={styles.formGroup}>
              <label>Teacher Name</label>
              <input
                type="text"
                name="teacher_name"
                value={formData.teacher_name}
                onChange={handleInputChange}
                placeholder="Teacher's name"
              />
            </div>

            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                Create Evaluation
              </button>
              <button 
                type="button" 
                className={styles.cancelButton}
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className={styles.evaluationsList}>
        <h2>Existing Evaluations</h2>
        {evaluations.length === 0 ? (
          <p className={styles.noData}>No KG evaluations found. Create one to get started!</p>
        ) : (
          <div className={styles.evaluationsGrid}>
            {evaluations.map(evaluation => (
              <div key={evaluation.id} className={styles.evaluationCard}>
                <div className={styles.cardHeader}>
                  <h3>{evaluation.evaluation_name}</h3>
                  <span className={`${styles.status} ${styles[evaluation.status]}`}>
                    {evaluation.status}
                  </span>
                </div>
                <div className={styles.cardBody}>
                  <p><strong>Class:</strong> {evaluation.class_name}</p>
                  <p><strong>Term:</strong> {evaluation.term}</p>
                  {evaluation.academic_year && (
                    <p><strong>Academic Year:</strong> {evaluation.academic_year}</p>
                  )}
                  {evaluation.teacher_name && (
                    <p><strong>Teacher:</strong> {evaluation.teacher_name}</p>
                  )}
                  <p><strong>Created:</strong> {new Date(evaluation.created_at).toLocaleDateString()}</p>
                </div>
                <div className={styles.cardActions}>
                  <button 
                    className={styles.viewButton}
                    onClick={() => handleViewEvaluation(evaluation.id)}
                  >
                    View/Edit
                  </button>
                  <button 
                    className={styles.deleteButton}
                    onClick={() => handleDeleteEvaluation(evaluation.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={styles.areasSection}>
        <h2>Evaluation Areas</h2>
        <div className={styles.areasGrid}>
          {areas.map(area => (
            <div key={area.id} className={styles.areaCard}>
              <h4>{area.area_name}</h4>
              <p>{area.description}</p>
              {area.age_group && (
                <span className={styles.ageGroup}>{area.age_group}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KGEvaluation;
