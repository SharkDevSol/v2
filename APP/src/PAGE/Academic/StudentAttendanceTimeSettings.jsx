import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiClock, FiSave, FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi';
import styles from './StudentAttendanceTimeSettings.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5052/api';

const StudentAttendanceTimeSettings = () => {
  const [autoAbsentEnabled, setAutoAbsentEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [task1Config, setTask1Config] = useState(null);
  const [task2Classes, setTask2Classes] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchTask1Config();
    fetchClassShifts();
  }, []);

  const fetchTask1Config = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/schedule/config`);
      if (res.data) setTask1Config(res.data);
    } catch {}
  };

  const fetchClassShifts = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/academic/student-attendance/class-shifts`);
      if (res.data.success) setTask2Classes(res.data.data);
    } catch {}
  };

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/academic/student-attendance/settings`);
      if (response.data.success) {
        setAutoAbsentEnabled(response.data.data.auto_absent_enabled !== undefined
          ? response.data.data.auto_absent_enabled
          : true);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setMessage({ type: '', text: '' });
      const response = await axios.put(`${API_BASE_URL}/academic/student-attendance/settings`, {
        auto_absent_enabled: autoAbsentEnabled
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1><FiClock /> Student Attendance Time Settings</h1>
        <p>Attendance configuration is managed in Task 1 (School Setup) and Task 2 (Class Registration)</p>
      </div>

      {message.text && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.type === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span>{message.text}</span>
        </div>
      )}

      {/* Task 1 School Config Reference */}
      {task1Config && (
        <div className={styles.section}>
          <h2>School Configuration (from Task 1)</h2>
          <div className={styles.referenceGrid}>
            <div className={styles.referenceItem}>
              <span className={styles.referenceLabel}>School Days</span>
              <span className={styles.referenceValue}>
                {Array.isArray(task1Config.school_days)
                  ? task1Config.school_days.map(d => typeof d === 'string' ? d : ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][d - 1]).join(', ')
                  : task1Config.school_days || 'Not configured'}
              </span>
            </div>
            <div className={styles.referenceItem}>
              <span className={styles.referenceLabel}>Total Shifts</span>
              <span className={styles.referenceValue}>{task1Config.total_shifts || 1}</span>
            </div>
            <div className={styles.referenceItem}>
              <span className={styles.referenceLabel}>Periods per Shift</span>
              <span className={styles.referenceValue}>{task1Config.periods_per_shift || 'Not configured'}</span>
            </div>
            <div className={styles.referenceItem}>
              <span className={styles.referenceLabel}>Period Duration</span>
              <span className={styles.referenceValue}>{task1Config.period_duration ? `${task1Config.period_duration} min` : 'Not configured'}</span>
            </div>
            <div className={styles.referenceItem}>
              <span className={styles.referenceLabel}>Shift Rotation</span>
              <span className={styles.referenceValue}>{task1Config.shift_rotation ? 'Weekly rotation enabled' : 'Fixed shifts'}</span>
            </div>
            <div className={styles.referenceItem}>
              <span className={styles.referenceLabel}>KG Section</span>
              <span className={styles.referenceValue}>{task1Config.has_kg ? 'Enabled' : 'Disabled'}</span>
            </div>
          </div>
        </div>
      )}

      {/* Class Shift Assignments Reference */}
      {task2Classes && Object.keys(task2Classes).length > 0 && (
        <div className={styles.section}>
          <h2>Class Shift Assignments (from Task 2)</h2>
          <div className={styles.classShiftGrid}>
            {Object.entries(task2Classes).map(([className, cfg]) => (
              <div key={className} className={styles.classShiftItem}>
                <span className={styles.classLabel}>{className}</span>
                <span className={styles.shiftBadge}>
                  {cfg.isKG ? 'KG' : `Shift ${cfg.shift_number || 1}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Absent Feature */}
      <div className={styles.section}>
        <h2>Auto-Absent Marking</h2>

        <label className={styles.toggleLabel}>
          <input
            type="checkbox"
            checked={autoAbsentEnabled}
            onChange={(e) => setAutoAbsentEnabled(e.target.checked)}
            disabled={isLoading}
            className={styles.toggleInput}
          />
          <span className={styles.toggleSwitch}></span>
          <span className={styles.toggleText}>
            {autoAbsentEnabled ? 'Enabled' : 'Disabled'}
          </span>
        </label>

        <p className={styles.featureDesc}>
          When enabled, students who haven't checked in by the auto-absent marking time
          will automatically be marked as ABSENT. This runs daily on school days.
        </p>
      </div>

      {/* Save Button */}
      <div className={styles.actions}>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className={styles.saveButton}
        >
          <FiSave />
          {isLoading ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
};

export default StudentAttendanceTimeSettings;
