import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiFilter, FiSave, FiShare2, FiDownload, FiSearch, FiCheck, FiX, FiEdit2, FiUsers, FiShield } from 'react-icons/fi';
import { hasFeatureAccess } from '../../utils/roleBasedAccess';
import styles from './MRLIST.module.css';

const MRLIST = () => {
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [user, setUser] = useState(null);
  const [students, setStudents] = useState([
    { id: 1, name: 'Ahmed Musa', studentId: '1001', test1: 85, test2: 78, quiz: 90, final: 88, total: 85.25, status: 'saved' },
    { id: 2, name: 'Fatuma Ali', studentId: '1002', test1: 78, test2: 82, quiz: 75, final: 80, total: 78.75, status: 'saved' },
    { id: 3, name: 'Hana Mohammed', studentId: '1003', test1: '', test2: '', quiz: '', final: '', total: 0, status: 'pending' },
    { id: 4, name: 'John Doe', studentId: '1004', test1: 92, test2: 88, quiz: 95, final: 90, total: 91.25, status: 'saved' },
    { id: 5, name: 'Jane Smith', studentId: '1005', test1: '', test2: '', quiz: '', final: '', total: 0, status: 'pending' },
  ]);

  // Load user data to verify access
  useEffect(() => {
    const storedUser = localStorage.getItem('staffUser');
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        console.log('MRLIST: Loaded user data:', { 
          username: userData.username, 
          staffType: userData.staffType,
          hasMarkListAccess: hasFeatureAccess(userData.staffType, 'mark-lists')
        });
      } catch (error) {
        console.error('MRLIST: Error parsing user data:', error);
      }
    }
  }, []);

  const handleScoreChange = (id, field, value) => {
    const updatedStudents = students.map(student => {
      if (student.id === id) {
        const updated = { ...student, [field]: value };
        // Calculate total (20% test1, 30% test2, 10% quiz, 40% final)
        const t1 = parseFloat(updated.test1) || 0;
        const t2 = parseFloat(updated.test2) || 0;
        const q = parseFloat(updated.quiz) || 0;
        const f = parseFloat(updated.final) || 0;
        updated.total = (t1 * 0.2 + t2 * 0.3 + q * 0.1 + f * 0.4).toFixed(2);
        updated.status = 'unsaved';
        return updated;
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const saveStudent = (id) => {
    const updatedStudents = students.map(student => {
      if (student.id === id) {
        return { ...student, status: 'saved' };
      }
      return student;
    });
    setStudents(updatedStudents);
  };

  const saveAll = () => {
    const updatedStudents = students.map(student => ({
      ...student,
      status: 'saved'
    }));
    setStudents(updatedStudents);
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.includes(searchQuery)
  );

  const completedCount = students.filter(s => s.status === 'saved' && s.total > 0).length;
  const completionPercentage = (completedCount / students.length) * 100;
  const classAverage = (students.reduce((sum, s) => sum + parseFloat(s.total || 0), 0) / students.length).toFixed(2);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.iconWrapper}>
            <FiEdit2 />
          </div>
          <div>
            <h1 className={styles.title}>Mark List</h1>
            <p className={styles.subtitle}>
              Manage student grades and assessments
              {user && (
                <span style={{ 
                  marginLeft: '8px', 
                  padding: '2px 8px', 
                  background: '#e3f2fd', 
                  color: '#1976d2', 
                  borderRadius: '12px', 
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <FiShield size={12} />
                  Teacher Only
                </span>
              )}
            </p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.iconBtn} title="Export">
            <FiDownload />
          </button>
          <button className={styles.iconBtn} title="Share">
            <FiShare2 />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(40, 167, 69, 0.1)' }}>
            <FiUsers style={{ color: '#28a745' }} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{students.length}</div>
            <div className={styles.statLabel}>Total Students</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(0, 123, 255, 0.1)' }}>
            <FiCheck style={{ color: '#007bff' }} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{completedCount}</div>
            <div className={styles.statLabel}>Completed</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
            <FiEdit2 style={{ color: '#ffc107' }} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{students.length - completedCount}</div>
            <div className={styles.statLabel}>Pending</div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(230, 126, 34, 0.1)' }}>
            <FiUsers style={{ color: '#e67e22' }} />
          </div>
          <div className={styles.statInfo}>
            <div className={styles.statValue}>{classAverage}%</div>
            <div className={styles.statLabel}>Class Average</div>
          </div>
        </div>
      </div>

      {/* Filters Toggle */}
      <button 
        className={styles.filterToggle}
        onClick={() => setShowFilters(!showFilters)}
      >
        <FiFilter />
        {showFilters ? 'Hide Filters' : 'Show Filters'}
      </button>

      {/* Filters Section */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            className={styles.filterSection}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className={styles.filterGrid}>
              <div className={styles.filterGroup}>
                <label>Class</label>
                <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                  <option value="">Select Class</option>
                  <option value="A">Class A</option>
                  <option value="B">Class B</option>
                  <option value="C">Class C</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Subject</label>
                <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="">Select Subject</option>
                  <option value="bio">Biology</option>
                  <option value="chem">Chemistry</option>
                  <option value="eng">English</option>
                </select>
              </div>

              <div className={styles.filterGroup}>
                <label>Term</label>
                <select value={selectedTerm} onChange={(e) => setSelectedTerm(e.target.value)}>
                  <option value="">Select Term</option>
                  <option value="1">Term 1</option>
                  <option value="2">Term 2</option>
                  <option value="3">Term 3</option>
                </select>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search and Progress */}
      <div className={styles.searchSection}>
        <div className={styles.searchBox}>
          <FiSearch className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search by name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className={styles.progressInfo}>
          <div className={styles.progressBar}>
            <motion.div 
              className={styles.progressFill}
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 0.8 }}
            />
          </div>
          <span className={styles.progressText}>{completedCount}/{students.length} completed</span>
        </div>
      </div>

      {/* Students List */}
      <div className={styles.studentsList}>
        {filteredStudents.map((student, index) => (
          <motion.div
            key={student.id}
            className={`${styles.studentCard} ${student.status === 'pending' ? styles.pending : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={styles.studentHeader}>
              <div className={styles.studentInfo}>
                <div className={styles.studentNumber}>{index + 1}</div>
                <div>
                  <h3 className={styles.studentName}>{student.name}</h3>
                  <p className={styles.studentId}>ID: {student.studentId}</p>
                </div>
              </div>
              <div className={styles.studentTotal}>
                <div className={styles.totalLabel}>Total</div>
                <div className={styles.totalValue}>{student.total}%</div>
              </div>
            </div>

            <div className={styles.scoresGrid}>
              <div className={styles.scoreItem}>
                <label>Test 1 (20%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.test1}
                  onChange={(e) => handleScoreChange(student.id, 'test1', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className={styles.scoreItem}>
                <label>Test 2 (30%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.test2}
                  onChange={(e) => handleScoreChange(student.id, 'test2', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className={styles.scoreItem}>
                <label>Quiz (10%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.quiz}
                  onChange={(e) => handleScoreChange(student.id, 'quiz', e.target.value)}
                  placeholder="0"
                />
              </div>

              <div className={styles.scoreItem}>
                <label>Final (40%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={student.final}
                  onChange={(e) => handleScoreChange(student.id, 'final', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>

            <div className={styles.studentFooter}>
              <div className={`${styles.statusBadge} ${styles[student.status]}`}>
                {student.status === 'saved' ? (
                  <><FiCheck /> Saved</>
                ) : student.status === 'unsaved' ? (
                  <><FiEdit2 /> Unsaved</>
                ) : (
                  <><FiX /> Pending</>
                )}
              </div>
              {student.status === 'unsaved' && (
                <button 
                  className={styles.saveBtn}
                  onClick={() => saveStudent(student.id)}
                >
                  <FiSave /> Save
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Save All Button */}
      {students.some(s => s.status === 'unsaved') && (
        <motion.button
          className={styles.saveAllBtn}
          onClick={saveAll}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiSave /> Save All Changes
        </motion.button>
      )}
    </div>
  );
};

export default MRLIST;
