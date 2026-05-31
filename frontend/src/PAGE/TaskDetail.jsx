// PAGE/TaskDetail.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import styles from './TaskDetail.module.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://iqrab3.skoolific.com/api';
import StudentFormBuilder from '../PAGE/CreateRegister/CreateRegisterStudent/StudentFormBuilder';
import StaffFormBuilder from '../PAGE/CreateRegister/CreateRegisterStaff/StaffFormBuilder';
import CreateRegisterStaff from '../PAGE/CreateRegister/CreateRegisterStaff/CreateRegisterStaff';
import SubjectMappingSetup from '../PAGE/CreateMarklist/SubjectMappingSetup';
import Task7 from '../PAGE/Task7';
import { useLanguageSelection, AVAILABLE_LANGUAGES } from '../context/LanguageSelectionContext';

function TaskDetail() {
  const { taskId } = useParams();
  const navigate = useNavigate();
  const [year, setYear] = useState(new Date().getFullYear());
  const [terms, setTerms] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [academicYear, setAcademicYear] = useState('');
  
  // V2 Enhancement: Additional Task 1 configuration options
  const [shiftCount, setShiftCount] = useState(1);
  const [shiftRotation, setShiftRotation] = useState(false);
  const [periodsPerShift, setPeriodsPerShift] = useState(7);
  const [periodDuration, setPeriodDuration] = useState(45);
  const [hasKG, setHasKG] = useState(false);
  const [hasEveningClass, setHasEveningClass] = useState(false);
  const [schoolDays, setSchoolDays] = useState([1, 2, 3, 4, 5]); // Monday-Friday by default

  // Schedule status state for Task 7
  const [scheduleStatus, setScheduleStatus] = useState({
    generated: false,
    slots: 0,
    conflicts: 0,
    checked: false
  });
  const [checkingSchedule, setCheckingSchedule] = useState(false);

  // Function to check schedule generation status
  const checkScheduleCreated = async () => {
    setCheckingSchedule(true);
    try {
      const [scheduleResponse, conflictsResponse] = await Promise.all([
        api.get('/schedule/schedule'),
        api.get('/schedule/conflicts')
      ]);

      const totalSlots = scheduleResponse.data.length;
      const conflicts = conflictsResponse.data.length;

      const newStatus = {
        generated: totalSlots > 0,
        slots: totalSlots,
        conflicts: conflicts,
        checked: true
      };

      setScheduleStatus(newStatus);
      return newStatus.generated;
    } catch (error) {
      console.error('Error checking schedule:', error);
      setScheduleStatus(prev => ({ ...prev, checked: true }));
      return false;
    } finally {
      setCheckingSchedule(false);
    }
  };

  const TOTAL_TASKS = 6;
  
  const handleComplete = async () => {
    const id = parseInt(taskId);
    console.log(`🔵 Attempting to complete task ${id}`);
    
    try {
      // Mark task as completed in database
      console.log(`📡 Calling API: POST /tasks/complete/${id}`);
      const response = await api.post(`/tasks/complete/${id}`);
      console.log(`✅ API Response:`, response.data);
      
      // Also update localStorage for backward compatibility
      const stored = JSON.parse(localStorage.getItem('completedTasks') || '[]');
      if (!stored.includes(id)) {
        stored.push(id);
        localStorage.setItem('completedTasks', JSON.stringify(stored));
        console.log(`💾 Updated localStorage:`, stored);
      }
      
      // Check if all tasks are now completed
      console.log(`📡 Fetching task status...`);
      const statusResponse = await api.get('/tasks/status');
      console.log(`📊 Task status:`, statusResponse.data);
      const completedCount = statusResponse.data.completedTasks.length;
      
      if (completedCount >= TOTAL_TASKS) {
        // All tasks completed, redirect to dashboard
        console.log(`🎉 All tasks completed! Redirecting to dashboard...`);
        navigate('/dashboard', { replace: true });
      } else {
        // More tasks remaining, go back to tasks list
        console.log(`📋 ${completedCount}/${TOTAL_TASKS} tasks completed. Redirecting to tasks page...`);
        navigate('/tasks');
      }
    } catch (error) {
      console.error('❌ Error completing task:', error);
      console.error('Error details:', error.response?.data);
      setError(`Failed to mark task as complete: ${error.response?.data?.error || error.message}`);
    }
  };

  // Enhanced handleComplete for Task 7 with schedule check
  const handleCompleteTask7 = async () => {
    const isScheduleCreated = await checkScheduleCreated();
    
    if (!isScheduleCreated) {
      setError('⚠️ Schedule not generated! Please generate the schedule before completing this task.');
      return;
    }

    // Check for teacher conflicts
    const conflictsResponse = await api.get('/schedule/conflicts');
    const teacherConflicts = conflictsResponse.data.filter(conflict => 
      conflict.conflict_type === 'TEACHER_DOUBLE_BOOKING'
    );

    if (teacherConflicts.length > 0) {
      const proceed = window.confirm(`⚠️ There are ${teacherConflicts.length} teacher scheduling conflicts. Are you sure you want to complete the task anyway?`);
      if (!proceed) return;
    }

    handleComplete();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Save schedule config with V2 enhancements
      const response = await fetch(`${API_BASE_URL}/schedule/config`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          terms,
          periods_per_shift: periodsPerShift,
          period_duration: periodDuration,
          short_break_duration: 10,
          total_shifts: shiftCount,
          shift_rotation: shiftRotation,
          teaching_days_per_week: schoolDays.length,
          school_days: schoolDays,
          has_kg: hasKG,
          has_evening_class: hasEveningClass,
          shift1_morning_start: '07:00',
          shift1_morning_end: '12:30',
          shift1_afternoon_start: '12:30',
          shift1_afternoon_end: '17:30',
          shift2_morning_start: '07:00',
          shift2_morning_end: '12:30',
          shift2_afternoon_start: '12:30',
          shift2_afternoon_end: '17:30'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save school setup');
      }
      
      // Also save academic year to branding settings
      const academicYearStr = `${year}-${year + 1}`;
      await api.put('/admin/branding', {
        academic_year: academicYearStr
      });
      
      const result = await response.json();
      console.log('School setup saved:', result);
      handleComplete();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Check schedule status when Task 6 component mounts
  useEffect(() => {
    if (taskId === '6') {
      checkScheduleCreated();
    }
  }, [taskId]);

  // Load academic year from branding settings for Task 1
  useEffect(() => {
    if (taskId === '1') {
      const loadAcademicYear = async () => {
        try {
          const response = await api.get('/admin/branding');
          if (response.data.academic_year) {
            setAcademicYear(response.data.academic_year);
            // Parse year from academic year string (e.g., "2024-2025" -> 2024)
            const yearMatch = response.data.academic_year.match(/^(\d{4})/);
            if (yearMatch) {
              setYear(parseInt(yearMatch[1]));
            }
          }
        } catch (error) {
          console.error('Error loading academic year:', error);
        }
      };
      loadAcademicYear();
    }
  }, [taskId]);

  // Language selection hook for Task 1
  const { selectedLanguages, toggleLanguage, availableLanguages } = useLanguageSelection();

  if (taskId === '1') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>School Year Setup</h1>
        <p className={styles.description}>
          Configure the academic year, number of terms, and form languages.
          {academicYear && (
            <span className={styles.academicYearBadge}>
              Current Academic Year: <strong>{academicYear}</strong>
            </span>
          )}
        </p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="year" className={styles.label}>Select School Year:</label>
            <select 
              id="year"
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className={styles.select}
            >
              {Array.from({ length: 11 }, (_, i) => 2020 + i).map(y => (
                <option key={y} value={y}>{y}-{y+1}</option>
              ))}
            </select>
            <p className={styles.helperText}>
              This will be saved to Settings → School Info → Academic Year
            </p>
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="terms" className={styles.label}>Number of Terms (1-4):</label>
            <select 
              id="terms"
              value={terms}
              onChange={(e) => setTerms(parseInt(e.target.value))}
              className={styles.select}
            >
              {[1,2,3,4].map(t => (
                <option key={t} value={t}>{t} Term{t > 1 ? 's' : ''}</option>
              ))}
            </select>
          </div>

          {/* V2 Enhancement: School Days Selector */}
          <div className={styles.formGroup}>
            <label className={styles.label}>School Days:</label>
            <p className={styles.helperText} style={{ marginBottom: '12px' }}>
              Select which days of the week school is in session
            </p>
            <div className={styles.schoolDaysGrid}>
              {[
                { value: 0, label: 'Sunday' },
                { value: 1, label: 'Monday' },
                { value: 2, label: 'Tuesday' },
                { value: 3, label: 'Wednesday' },
                { value: 4, label: 'Thursday' },
                { value: 5, label: 'Friday' },
                { value: 6, label: 'Saturday' }
              ].map(day => (
                <label key={day.value} className={`${styles.dayChip} ${schoolDays.includes(day.value) ? styles.dayChipActive : ''}`}>
                  <input
                    type="checkbox"
                    checked={schoolDays.includes(day.value)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSchoolDays([...schoolDays, day.value].sort());
                      } else {
                        setSchoolDays(schoolDays.filter(d => d !== day.value));
                      }
                    }}
                    className={styles.dayCheckbox}
                  />
                  <span>{day.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* V2 Enhancement: Shift Count Selector */}
          <div className={styles.formGroup}>
            <label htmlFor="shiftCount" className={styles.label}>Number of Shifts:</label>
            <select 
              id="shiftCount"
              value={shiftCount}
              onChange={(e) => setShiftCount(parseInt(e.target.value))}
              className={styles.select}
            >
              <option value={1}>1 Shift (All classes same time)</option>
              <option value={2}>2 Shifts (Morning & Afternoon)</option>
            </select>
            <p className={styles.helperText}>
              {shiftCount === 1 
                ? 'All classes will attend at the same time' 
                : 'Classes will be divided into morning and afternoon shifts'}
            </p>
          </div>

          {/* V2 Enhancement: Shift Rotation (only show if 2 shifts) */}
          {shiftCount === 2 && (
            <div className={styles.formGroup}>
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={shiftRotation}
                  onChange={(e) => setShiftRotation(e.target.checked)}
                  className={styles.checkboxInput}
                />
                <span className={styles.checkboxLabel}>
                  Enable Shift Rotation
                </span>
              </label>
              <p className={styles.helperText}>
                When enabled, classes will alternate between morning and afternoon shifts weekly
              </p>
            </div>
          )}

          {/* V2 Enhancement: Periods Per Shift */}
          <div className={styles.formGroup}>
            <label htmlFor="periodsPerShift" className={styles.label}>Periods Per Shift:</label>
            <input
              type="number"
              id="periodsPerShift"
              value={periodsPerShift}
              onChange={(e) => setPeriodsPerShift(parseInt(e.target.value))}
              min="4"
              max="10"
              className={styles.select}
            />
            <p className={styles.helperText}>
              Number of teaching periods in each shift (typically 6-8)
            </p>
          </div>

          {/* V2 Enhancement: Period Duration */}
          <div className={styles.formGroup}>
            <label htmlFor="periodDuration" className={styles.label}>Period Duration (minutes):</label>
            <input
              type="number"
              id="periodDuration"
              value={periodDuration}
              onChange={(e) => setPeriodDuration(parseInt(e.target.value))}
              min="30"
              max="60"
              step="5"
              className={styles.select}
            />
            <p className={styles.helperText}>
              Duration of each teaching period (typically 40-50 minutes)
            </p>
          </div>

          {/* V2 Enhancement: KG Checkbox */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={hasKG}
                onChange={(e) => setHasKG(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxLabel}>
                School has Kindergarten (KG) classes
              </span>
            </label>
            <p className={styles.helperText}>
              Enable this if your school has KG classes with different schedules
            </p>
          </div>

          {/* V2 Enhancement: Evening Class Checkbox */}
          <div className={styles.formGroup}>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={hasEveningClass}
                onChange={(e) => setHasEveningClass(e.target.checked)}
                className={styles.checkboxInput}
              />
              <span className={styles.checkboxLabel}>
                School has Evening classes
              </span>
            </label>
            <p className={styles.helperText}>
              Enable this if your school offers evening classes for adult education or special programs
            </p>
          </div>

          {/* Language Selection Section */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Select Additional Form Languages:</label>
            <p className={styles.helperText} style={{ marginBottom: '12px' }}>
              English is always included. Select additional languages for form field labels.
              When creating custom fields in Tasks 2 and 3, you'll need to provide translations for each selected language.
            </p>
            <div className={styles.languageGrid}>
              {/* English - Always selected, disabled */}
              <div className={`${styles.languageCard} ${styles.languageCardDefault}`}>
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className={styles.dayCheckbox}
                />
                <div>
                  <span className={styles.languageName} style={{ color: '#16a34a' }}>English</span>
                  <span className={styles.languageNative}>Default (Required)</span>
                </div>
              </div>

              {/* Other languages */}
              {availableLanguages.map(lang => (
                <div
                  key={lang.code}
                  onClick={() => toggleLanguage(lang.code)}
                  className={`${styles.languageCard} ${selectedLanguages.includes(lang.code) ? styles.languageCardActive : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(lang.code)}
                    onChange={() => toggleLanguage(lang.code)}
                    className={styles.dayCheckbox}
                  />
                  <div>
                    <span className={styles.languageName}>
                      {lang.name}
                    </span>
                    <span className={styles.languageNative}>
                      {lang.nativeName}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            {selectedLanguages.length > 0 && (
              <div className={styles.selectedLanguagesBar}>
                <span className={styles.selectedLanguagesLabel}>Selected Languages ({selectedLanguages.length + 1}):</span>
                <span className={styles.selectedLanguagesList}>
                  English, {selectedLanguages.map(code => {
                    const lang = availableLanguages.find(l => l.code === code);
                    return lang ? lang.name : code;
                  }).join(', ')}
                </span>
              </div>
            )}
          </div>

          {error && <p className={styles.error}>{error}</p>}
          <button 
            type="submit"
            className={styles.completeButton}
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save and Complete'}
          </button>
        </form>
      </div>
    );
  }

  if (taskId === '2') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Create Student Registration Form</h1>
        <p className={styles.description}>
          Set up classes and custom fields for the student registration system.
        </p>
        <StudentFormBuilder 
          onSuccess={handleComplete}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }

  if (taskId === '3') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Create Staff Registration Form</h1>
        <p className={styles.description}>
          Set up the staff type and custom fields for staff registration.
        </p>
        <StaffFormBuilder 
          onSuccess={handleComplete}
        />
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }

  if (taskId === '4') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Configure Subjects and Classes</h1>
        <p className={styles.description}>
          Set up subjects and map them to classes for your school.
        </p>
        <div className={styles.contentArea}>
          <SubjectMappingSetup onComplete={handleComplete} />
        </div>
        {error && <p className={styles.error}>{error}</p>}
      </div>
    );
  }

  if (taskId === '5') {
    const [mergeLoading, setMergeLoading] = useState(false);
    const [mergeData, setMergeData] = useState([]);
    const [stats, setStats] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [classSubjects, setClassSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [assignments, setAssignments] = useState({});
    const [teacherWorkTimes, setTeacherWorkTimes] = useState({});

    // Load existing data on component mount
    useEffect(() => {
      const loadInitialData = async () => {
        try {
          // Check if teacher assignments already exist
          const checkResponse = await fetch(`${API_BASE_URL}/mark-list/teacher-assignments`);
          if (checkResponse.ok) {
            const checkData = await checkResponse.json();
            
            if (checkData.length > 0) {
              setMergeData(checkData);
              setStats({
                insertedCount: checkData.length,
                teacherCount: new Set(checkData.map(item => item.teacher_name)).size,
                classSubjectCount: checkData.length
              });
            }
          }

          // Load class-subject mappings
          const classSubjectsResponse = await fetch(`${API_BASE_URL}/mark-list/subjects-classes`);
          if (classSubjectsResponse.ok) {
            const classSubjectsData = await classSubjectsResponse.json();
            setClassSubjects(classSubjectsData);
          }

          // Load teachers from schedule system with work times
          const teachersResponse = await fetch(`${API_BASE_URL}/school-setup/teachers-with-worktime`);
          if (teachersResponse.ok) {
            const teachersData = await teachersResponse.json();
            setTeachers(teachersData);
            
            // Create work time mapping
            const workTimeMap = {};
            teachersData.forEach(teacher => {
              workTimeMap[teacher.name] = teacher.staff_work_time || 'Full Time';
            });
            setTeacherWorkTimes(workTimeMap);
          }

        } catch (err) {
          console.error('Error loading initial data:', err);
          setError('Failed to load data. Please make sure Tasks 4 and 5 are completed.');
        } finally {
          setDataLoaded(true);
        }
      };

      loadInitialData();
    }, []);

    const handleTeacherAssignment = (classSubjectKey, teacherName) => {
      setAssignments(prev => ({
        ...prev,
        [classSubjectKey]: teacherName
      }));
    };

    // FIXED: handleMerge function with proper work time handling
    const handleMerge = async () => {
      setMergeLoading(true);
      setError(null);
      try {
        // Prepare assignment data for mark-list endpoint
        const assignmentData = Object.entries(assignments).map(([classSubjectKey, teacherName]) => {
          const [className, subjectName] = classSubjectKey.split('|');
          
          // FIX: Get the selected teacher's current work time from the teachers array
          const selectedTeacher = teachers.find(teacher => teacher.name === teacherName);
          const workTime = selectedTeacher ? selectedTeacher.staff_work_time : 'Full Time';
          
          console.log(`Assignment: ${teacherName} -> ${subjectName} Class ${className} as ${workTime}`);
          
          return {
            teacherName: teacherName,
            subjectClass: `${subjectName} Class ${className}`,
            staffWorkTime: workTime // This should now be correct
          };
        });

        if (assignmentData.length === 0) {
          throw new Error('Please assign at least one teacher to a class-subject combination');
        }

        // 1. Save to mark-list system (existing)
        const response = await fetch(`${API_BASE_URL}/mark-list/assign-teachers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ assignments: assignmentData }),
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to assign teachers');
        }
        
        // 2. ALSO save to schedule system with work time information
        const scheduleResponse = await fetch(`${API_BASE_URL}/school-setup/sync-teacher-assignments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            assignments: assignmentData,
            teacherWorkTimes: teacherWorkTimes 
          }),
        });

        if (!scheduleResponse.ok) {
          console.warn('Could not sync with schedule system, but mark-list assignments were saved');
        }

        const result = await response.json();
        setStats({
          insertedCount: result.insertedCount || assignmentData.length,
          teacherCount: new Set(assignmentData.map(item => item.teacherName)).size,
          classSubjectCount: assignmentData.length
        });
        
        // Fetch the updated assignments to display
        const dataResponse = await fetch(`${API_BASE_URL}/mark-list/teacher-assignments`);
        if (dataResponse.ok) {
          const data = await dataResponse.json();
          setMergeData(data);
        }
        
      } catch (err) {
        setError(err.message);
      } finally {
        setMergeLoading(false);
      }
    };

    const canCompleteTask = mergeData.length > 0;

    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Task 5: Assign Teachers to Classes and Subjects</h1>
        <p className={styles.description}>
          Manually assign teachers to their respective classes and subjects for scheduling and period management.
          <br />
          <strong>Important:</strong> Teacher work time (Full-Time/Part-Time) will be used for automatic schedule generation in Task 6.
        </p>
        
        <div className={styles.contentArea}>
          <div className={styles.mergeSection}>
            <h3>Teacher Assignment</h3>
            <p className={styles.infoText}>
              Assign teachers to class-subject combinations. Work time information is automatically included:
            </p>

            {classSubjects.length > 0 && teachers.length > 0 ? (
              <div className={styles.assignmentGrid}>
                <div className={styles.assignmentHeader}>
                  <span>Class-Subject Combination</span>
                  <span>Assigned Teacher (Work Time)</span>
                </div>
                {classSubjects.map((item, index) => {
                  const classSubjectKey = `${item.class_name}|${item.subject_name}`;
                  const assignedTeacher = assignments[classSubjectKey];
                  const workTime = assignedTeacher ? teacherWorkTimes[assignedTeacher] : '';
                  
                  return (
                    <div key={index} className={styles.assignmentRow}>
                      <div className={styles.classSubjectInfo}>
                        <span className={styles.className}>{item.class_name}</span>
                        <span className={styles.subjectName}>{item.subject_name}</span>
                      </div>
                      <div className={styles.teacherSelection}>
                        <select
                          value={assignedTeacher || ''}
                          onChange={(e) => handleTeacherAssignment(classSubjectKey, e.target.value)}
                          className={styles.teacherSelect}
                        >
                          <option value="">Select Teacher</option>
                          {teachers.map((teacher, idx) => (
                            <option key={idx} value={teacher.name}>
                              {teacher.name} ({teacher.role}) - {teacher.staff_work_time || 'Full Time'}
                            </option>
                          ))}
                        </select>
                        {assignedTeacher && workTime && (
                          <span className={`${styles.workTimeBadge} ${
                            workTime === 'Part Time' ? styles.partTime : styles.fullTime
                          }`}>
                            {workTime}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <h4>No Data Available</h4>
                <p>Please complete the following prerequisites:</p>
                <div className={styles.requirements}>
                  <ul>
                    <li className={classSubjects.length === 0 ? styles.pending : styles.completed}>
                      {classSubjects.length === 0 ? '✗' : '✓'} Task 4: Configure Subjects and Classes
                    </li>
                    <li className={teachers.length === 0 ? styles.pending : styles.completed}>
                      {teachers.length === 0 ? '✗' : '✓'} Task 3: Add Staff Members (with Teacher role)
                    </li>
                  </ul>
                  {classSubjects.length === 0 && (
                    <p className={styles.warning}>No class-subject mappings found. Complete Task 4 first.</p>
                  )}
                  {teachers.length === 0 && (
                    <p className={styles.warning}>No teachers found. Add teachers in Task 3 first.</p>
                  )}
                </div>
              </div>
            )}

            <div className={styles.actionSection}>
              <button 
                onClick={handleMerge}
                className={`${styles.mergeButton} ${mergeLoading ? styles.loading : ''}`}
                disabled={mergeLoading || classSubjects.length === 0 || teachers.length === 0}
              >
                {mergeLoading ? (
                  <>
                    <span className={styles.spinner}></span>
                    Saving Assignments...
                  </>
                ) : (
                  'Save Teacher Assignments'
                )}
              </button>

              {stats && (
                <div className={styles.stats}>
                  <h4>Assignments Saved Successfully!</h4>
                  <div className={styles.statGrid}>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{stats.teacherCount}</span>
                      <span className={styles.statLabel}>Teachers Assigned</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{stats.classSubjectCount}</span>
                      <span className={styles.statLabel}>Class-Subject Combinations</span>
                    </div>
                    <div className={styles.statItem}>
                      <span className={styles.statNumber}>{stats.insertedCount}</span>
                      <span className={styles.statLabel}>Total Assignments</span>
                    </div>
                  </div>
                  <div className={styles.scheduleNote}>
                    <strong>Note for Schedule Generation:</strong>
                    <ul>
                      <li>• Full-Time teachers will be automatically assigned to all school days</li>
                      <li>• Part-Time teachers will use their specific available days</li>
                      <li>• System will prevent teacher double-booking in same periods</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {mergeData.length > 0 && (
            <div className={styles.dataSection}>
              <h3>Current Assignments</h3>
              <p className={styles.previewInfo}>
                Current teacher assignments to classes and subjects:
              </p>
              <div className={styles.tableContainer}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Teacher Name</th>
                      <th>Work Time</th>
                      <th>Subject-Class Combination</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mergeData.slice(0, 15).map((item, index) => (
                      <tr key={index}>
                        <td className={styles.teacherCell}>{item.teacher_name}</td>
                        <td className={styles.workTimeCell}>
                          <span className={`${styles.workTimeBadge} ${
                            item.staff_work_time === 'Part Time' ? styles.partTime : styles.fullTime
                          }`}>
                            {item.staff_work_time || 'Full Time'}
                          </span>
                        </td>
                        <td className={styles.subjectCell}>{item.subject_class}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {mergeData.length > 15 && (
                  <p className={styles.tableFooter}>
                    Showing first 15 of {mergeData.length} records
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className={styles.errorSection}>
            <h4>Error</h4>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}
        
        <div className={styles.completeSection}>
          <button 
            onClick={handleComplete}
            className={`${styles.completeButton} ${!canCompleteTask ? styles.disabled : ''}`}
            disabled={!canCompleteTask}
          >
            {canCompleteTask ? 'Complete Task 5' : 'Complete Assignments First'}
          </button>
          
          {!canCompleteTask && (
            <p className={styles.completeHint}>
              You need to save teacher assignments first before completing this task.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (taskId === '6') {
    return (
      <div className={styles.container}>
        <h1 className={styles.title}>Task 6: Schedule Configuration & Generation</h1>
        <p className={styles.description}>
          Configure school schedule settings and generate timetables using teacher assignments from Task 5.
          <br />
          <strong>Important:</strong> The system will schedule exactly the assigned number of periods - no more, no less.
        </p>

        <div className={styles.contentArea}>
          <Task7 
            onComplete={handleCompleteTask7}
            onScheduleGenerated={checkScheduleCreated}
          />
        </div>

        {error && (
          <div className={styles.errorSection}>
            <h4>Error</h4>
            <p className={styles.errorText}>{error}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Task {taskId}</h1>
      <p className={styles.description}>
        This is an empty task page. Click the button below to mark it as complete.
      </p>
      <button 
        onClick={handleComplete}
        className={styles.completeButton}
      >
        Finish Task
      </button>
    </div>
  );
}

export default TaskDetail;
