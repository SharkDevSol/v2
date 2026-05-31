/**
 * Exam Repeat Modal Component
 * 
 * This modal allows teachers to repeat exams for selected students
 * with options to reuse the same exam or generate a new one.
 */

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './ExamRepeatModal.module.css';

const ExamRepeatModal = ({ exam, isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [reason, setReason] = useState('');
  const [generateNew, setGenerateNew] = useState(false);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [groupByType, setGroupByType] = useState(false);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Get teacher info from localStorage
  const teacherId = localStorage.getItem('userId');
  const teacherName = localStorage.getItem('username') || 'Teacher';

  useEffect(() => {
    if (isOpen && exam) {
      fetchExamStudents();
    }
  }, [isOpen, exam]);

  /**
   * Fetch students who have taken the exam
   */
  const fetchExamStudents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(`/api/exams/${exam.id}/students`);

      if (response.data.success) {
        setStudents(response.data.students);
      } else {
        setError('Failed to fetch students');
      }
    } catch (err) {
      console.error('Error fetching students:', err);
      setError('Error loading students. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle select all checkbox
   */
  const handleSelectAll = (checked) => {
    setSelectAll(checked);
    if (checked) {
      setSelectedStudents(students.map(s => s.id));
    } else {
      setSelectedStudents([]);
    }
  };

  /**
   * Handle individual student selection
   */
  const handleStudentSelect = (studentId, checked) => {
    if (checked) {
      setSelectedStudents([...selectedStudents, studentId]);
    } else {
      setSelectedStudents(selectedStudents.filter(id => id !== studentId));
      setSelectAll(false);
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (selectedStudents.length === 0) {
      setError('Please select at least one student');
      return;
    }

    if (!reason.trim()) {
      setError('Please provide a reason for the exam repeat');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await axios.post(`/api/exams/${exam.id}/repeat`, {
        studentIds: selectedStudents,
        reason: reason.trim(),
        teacherId: parseInt(teacherId),
        teacherName,
        generateNew,
        randomizeQuestions,
        groupByType
      });

      if (response.data.success) {
        // Show success message
        alert(`Exam repeat successful! ${response.data.data.studentsAffected} student(s) affected.`);
        
        // Call success callback
        if (onSuccess) {
          onSuccess(response.data.data);
        }

        // Close modal
        handleClose();
      } else {
        setError(response.data.error || 'Failed to repeat exam');
      }
    } catch (err) {
      console.error('Error repeating exam:', err);
      setError(err.response?.data?.error || 'Error repeating exam. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    setSelectedStudents([]);
    setSelectAll(false);
    setReason('');
    setGenerateNew(false);
    setRandomizeQuestions(true);
    setGroupByType(false);
    setError(null);
    onClose();
  };

  /**
   * Get status badge class
   */
  const getStatusClass = (status) => {
    switch (status) {
      case 'not_started':
        return styles.statusNotStarted;
      case 'in_progress':
        return styles.statusInProgress;
      case 'submitted':
        return styles.statusSubmitted;
      case 'graded':
        return styles.statusGraded;
      default:
        return styles.statusDefault;
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Repeat Exam</h2>
          <button className={styles.closeButton} onClick={handleClose}>
            ×
          </button>
        </div>

        {error && (
          <div className={styles.errorBanner}>
            <span className={styles.errorIcon}>⚠️</span>
            {error}
          </div>
        )}

        <div className={styles.modalBody}>
          <div className={styles.examInfo}>
            <h3>{exam?.title}</h3>
            <p className={styles.examDetails}>
              Subject: {exam?.subject_name} | Class: {exam?.class_name}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Student Selection */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h4>Select Students</h4>
                <label className={styles.selectAllLabel}>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    disabled={loading || submitting}
                  />
                  <span>Select All ({students.length})</span>
                </label>
              </div>

              <div className={styles.studentList}>
                {loading ? (
                  <div className={styles.loading}>
                    <div className={styles.spinner}></div>
                    <p>Loading students...</p>
                  </div>
                ) : students.length === 0 ? (
                  <div className={styles.emptyState}>
                    <p>No students have taken this exam yet</p>
                  </div>
                ) : (
                  students.map(student => (
                    <label key={student.id} className={styles.studentItem}>
                      <input
                        type="checkbox"
                        checked={selectedStudents.includes(student.id)}
                        onChange={(e) => handleStudentSelect(student.id, e.target.checked)}
                        disabled={submitting}
                      />
                      <div className={styles.studentInfo}>
                        <span className={styles.studentName}>
                          {student.first_name} {student.last_name}
                        </span>
                        <span className={styles.studentCode}>
                          ID: {student.student_code}
                        </span>
                      </div>
                      <div className={styles.studentStats}>
                        <span className={`${styles.statusBadge} ${getStatusClass(student.status)}`}>
                          {student.status.replace('_', ' ')}
                        </span>
                        {student.percentage !== null && (
                          <span className={styles.percentage}>
                            {student.percentage.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>

              <div className={styles.selectionSummary}>
                Selected: <strong>{selectedStudents.length}</strong> of {students.length} students
              </div>
            </div>

            {/* Reason Input */}
            <div className={styles.section}>
              <h4>Reason for Repeat <span className={styles.required}>*</span></h4>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain why this exam needs to be repeated (e.g., technical issues, low scores, etc.)"
                className={styles.reasonTextarea}
                rows={4}
                required
                disabled={submitting}
              />
              <p className={styles.hint}>
                This reason will be sent to the admin for review
              </p>
            </div>

            {/* Exam Options */}
            <div className={styles.section}>
              <h4>Exam Options</h4>

              <label className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={generateNew}
                  onChange={(e) => setGenerateNew(e.target.checked)}
                  disabled={submitting}
                />
                <div className={styles.optionInfo}>
                  <span className={styles.optionTitle}>Generate New Exam</span>
                  <span className={styles.optionDescription}>
                    Create a new exam with different questions (Coming Soon)
                  </span>
                </div>
              </label>

              <label className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={randomizeQuestions}
                  onChange={(e) => setRandomizeQuestions(e.target.checked)}
                  disabled={submitting || generateNew}
                />
                <div className={styles.optionInfo}>
                  <span className={styles.optionTitle}>Randomize Questions</span>
                  <span className={styles.optionDescription}>
                    Shuffle question order for each student
                  </span>
                </div>
              </label>

              <label className={styles.optionLabel}>
                <input
                  type="checkbox"
                  checked={groupByType}
                  onChange={(e) => setGroupByType(e.target.checked)}
                  disabled={submitting || !randomizeQuestions}
                />
                <div className={styles.optionInfo}>
                  <span className={styles.optionTitle}>Group by Type</span>
                  <span className={styles.optionDescription}>
                    Keep questions grouped by type when randomizing
                  </span>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className={styles.modalActions}>
              <button
                type="button"
                onClick={handleClose}
                className={styles.cancelButton}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.submitButton}
                disabled={submitting || selectedStudents.length === 0 || !reason.trim()}
              >
                {submitting ? 'Processing...' : 'Repeat Exam'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExamRepeatModal;
