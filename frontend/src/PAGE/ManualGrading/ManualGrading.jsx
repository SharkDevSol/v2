/**
 * Manual Grading Page for Teachers
 * 
 * This page allows teachers to manually grade essay and short answer questions
 * that require human evaluation.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ManualGrading.module.css';

const ManualGrading = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [queue, setQueue] = useState([]);
  const [filteredQueue, setFilteredQueue] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [awardedMarks, setAwardedMarks] = useState('');
  const [feedback, setFeedback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState('pending');
  const [examFilter, setExamFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Get teacher ID from context or localStorage
  const teacherId = localStorage.getItem('userId') || null;

  useEffect(() => {
    fetchManualGradingQueue();
  }, [statusFilter]);

  useEffect(() => {
    applyFilters();
  }, [queue, examFilter, searchTerm]);

  /**
   * Fetch manual grading queue from API
   */
  const fetchManualGradingQueue = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (teacherId) params.append('teacherId', teacherId);
      if (statusFilter !== 'all') params.append('status', statusFilter);

      const response = await axios.get(
        `/api/exams/manual-grading/queue?${params.toString()}`
      );

      if (response.data.success) {
        setQueue(response.data.queue);
      } else {
        setError('Failed to fetch manual grading queue');
      }
    } catch (err) {
      console.error('Error fetching manual grading queue:', err);
      setError('Error loading manual grading queue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Apply filters to the queue
   */
  const applyFilters = () => {
    let filtered = [...queue];

    // Filter by exam
    if (examFilter !== 'all') {
      filtered = filtered.filter(item => item.exam_id === parseInt(examFilter));
    }

    // Filter by search term (student name or exam title)
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.first_name.toLowerCase().includes(term) ||
        item.last_name.toLowerCase().includes(term) ||
        item.exam_title.toLowerCase().includes(term) ||
        item.student_code.toLowerCase().includes(term)
      );
    }

    setFilteredQueue(filtered);
  };

  /**
   * Get unique exams from queue for filter dropdown
   */
  const getUniqueExams = () => {
    const exams = new Map();
    queue.forEach(item => {
      if (!exams.has(item.exam_id)) {
        exams.set(item.exam_id, {
          id: item.exam_id,
          title: item.exam_title
        });
      }
    });
    return Array.from(exams.values());
  };

  /**
   * Select an item for grading
   */
  const selectItem = (item) => {
    setSelectedItem(item);
    setAwardedMarks('');
    setFeedback('');
    setSuccess(null);
    setError(null);
  };

  /**
   * Save manual grading
   */
  const saveGrading = async () => {
    if (!selectedItem) return;

    // Validate awarded marks
    const marks = parseFloat(awardedMarks);
    if (isNaN(marks) || marks < 0) {
      setError('Please enter a valid mark (0 or greater)');
      return;
    }

    const questionData = JSON.parse(selectedItem.question_data);
    const maxMarks = questionData.marks || 0;

    if (marks > maxMarks) {
      setError(`Awarded marks cannot exceed maximum marks (${maxMarks})`);
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await axios.put(
        `/api/exams/manual-grading/${selectedItem.id}`,
        {
          awardedMarks: marks,
          feedback: feedback.trim(),
          gradedBy: teacherId
        }
      );

      if (response.data.success) {
        setSuccess('Grading saved successfully!');
        
        // Update queue to remove graded item
        setQueue(prevQueue => 
          prevQueue.filter(item => item.id !== selectedItem.id)
        );

        // Clear selection after a delay
        setTimeout(() => {
          setSelectedItem(null);
          setSuccess(null);
        }, 2000);

        // If all manual grading is complete, show notification
        if (response.data.result.allManualGradingComplete) {
          alert('All manual grading for this student is complete! Results have been sent to student and guardian.');
        }
      } else {
        setError('Failed to save grading');
      }
    } catch (err) {
      console.error('Error saving grading:', err);
      setError('Error saving grading. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  /**
   * Render question content based on type
   */
  const renderQuestionContent = (item) => {
    const questionData = JSON.parse(item.question_data);
    const studentAnswer = JSON.parse(item.student_answer);

    return (
      <div className={styles.questionContent}>
        <div className={styles.questionSection}>
          <h4>Question</h4>
          <p className={styles.questionText}>{questionData.question}</p>
          
          {questionData.questionType === 'short_answer' && questionData.expectedAnswer && (
            <div className={styles.expectedAnswer}>
              <strong>Expected Answer:</strong>
              <p>{questionData.expectedAnswer}</p>
            </div>
          )}
        </div>

        <div className={styles.answerSection}>
          <h4>Student's Answer</h4>
          <div className={styles.studentAnswer}>
            {studentAnswer ? (
              <p>{studentAnswer}</p>
            ) : (
              <p className={styles.noAnswer}>No answer provided</p>
            )}
          </div>
        </div>

        <div className={styles.marksInfo}>
          <span className={styles.maxMarks}>
            Maximum Marks: <strong>{questionData.marks || 0}</strong>
          </span>
        </div>
      </div>
    );
  };

  /**
   * Get status badge class
   */
  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'pending':
        return styles.statusPending;
      case 'completed':
        return styles.statusCompleted;
      default:
        return styles.statusDefault;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading manual grading queue...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Manual Grading</h1>
        <p className={styles.subtitle}>
          Grade essay and short answer questions that require manual evaluation
        </p>
      </div>

      {error && (
        <div className={styles.errorBanner}>
          <span className={styles.errorIcon}>⚠️</span>
          {error}
        </div>
      )}

      {success && (
        <div className={styles.successBanner}>
          <span className={styles.successIcon}>✓</span>
          {success}
        </div>
      )}

      <div className={styles.content}>
        {/* Filters and Queue List */}
        <div className={styles.queuePanel}>
          <div className={styles.filters}>
            <div className={styles.filterGroup}>
              <label>Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="all">All</option>
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Exam</label>
              <select 
                value={examFilter} 
                onChange={(e) => setExamFilter(e.target.value)}
                className={styles.filterSelect}
              >
                <option value="all">All Exams</option>
                {getUniqueExams().map(exam => (
                  <option key={exam.id} value={exam.id}>
                    {exam.title}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.filterGroup}>
              <label>Search</label>
              <input
                type="text"
                placeholder="Student name or exam..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
          </div>

          <div className={styles.queueStats}>
            <span className={styles.statItem}>
              Total: <strong>{filteredQueue.length}</strong>
            </span>
            <span className={styles.statItem}>
              Pending: <strong>{filteredQueue.filter(i => i.status === 'pending').length}</strong>
            </span>
          </div>

          <div className={styles.queueList}>
            {filteredQueue.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No items in the queue</p>
                {statusFilter === 'pending' && (
                  <p className={styles.emptySubtext}>
                    All questions have been graded! 🎉
                  </p>
                )}
              </div>
            ) : (
              filteredQueue.map(item => (
                <div
                  key={item.id}
                  className={`${styles.queueItem} ${selectedItem?.id === item.id ? styles.queueItemSelected : ''}`}
                  onClick={() => selectItem(item)}
                >
                  <div className={styles.queueItemHeader}>
                    <span className={styles.studentName}>
                      {item.first_name} {item.last_name}
                    </span>
                    <span className={`${styles.statusBadge} ${getStatusBadgeClass(item.status)}`}>
                      {item.status}
                    </span>
                  </div>
                  <div className={styles.queueItemDetails}>
                    <span className={styles.examTitle}>{item.exam_title}</span>
                    <span className={styles.questionType}>
                      {item.question_type.replace('_', ' ')}
                    </span>
                  </div>
                  <div className={styles.queueItemFooter}>
                    <span className={styles.studentCode}>ID: {item.student_code}</span>
                    <span className={styles.createdAt}>
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Grading Panel */}
        <div className={styles.gradingPanel}>
          {selectedItem ? (
            <>
              <div className={styles.gradingHeader}>
                <h2>Grade Question</h2>
                <div className={styles.studentInfo}>
                  <span className={styles.studentName}>
                    {selectedItem.first_name} {selectedItem.last_name}
                  </span>
                  <span className={styles.examTitle}>{selectedItem.exam_title}</span>
                </div>
              </div>

              {renderQuestionContent(selectedItem)}

              <div className={styles.gradingForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="awardedMarks">
                    Awarded Marks <span className={styles.required}>*</span>
                  </label>
                  <input
                    id="awardedMarks"
                    type="number"
                    min="0"
                    max={JSON.parse(selectedItem.question_data).marks || 0}
                    step="0.5"
                    value={awardedMarks}
                    onChange={(e) => setAwardedMarks(e.target.value)}
                    placeholder="Enter marks"
                    className={styles.marksInput}
                    disabled={saving}
                  />
                  <span className={styles.maxMarksHint}>
                    Max: {JSON.parse(selectedItem.question_data).marks || 0}
                  </span>
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="feedback">
                    Feedback (Optional)
                  </label>
                  <textarea
                    id="feedback"
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Provide feedback to the student..."
                    className={styles.feedbackTextarea}
                    rows={4}
                    disabled={saving}
                  />
                </div>

                <div className={styles.formActions}>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className={styles.cancelButton}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveGrading}
                    className={styles.saveButton}
                    disabled={saving || !awardedMarks}
                  >
                    {saving ? 'Saving...' : 'Save Grades'}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.emptyGradingPanel}>
              <div className={styles.emptyIcon}>📝</div>
              <h3>Select a question to grade</h3>
              <p>Choose an item from the queue on the left to start grading</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManualGrading;
