const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const { getEndpointPath, API_ENDPOINTS } = require('../config/api.config');

// Initialize task completions table
async function initTaskCompletionsTable() {
  try {
    console.log('🔧 Initializing task_completions table...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS task_completions (
        id SERIAL PRIMARY KEY,
        task_id INTEGER UNIQUE NOT NULL,
        completed BOOLEAN DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert default rows for all 7 tasks
    for (let i = 1; i <= 7; i++) {
      await pool.query(`
        INSERT INTO task_completions (task_id, completed)
        VALUES ($1, false)
        ON CONFLICT (task_id) DO NOTHING
      `, [i]);
    }
    console.log('✅ task_completions table initialized successfully');
  } catch (error) {
    console.error('❌ Error initializing task_completions table:', error);
  }
}

// Initialize on module load
initTaskCompletionsTable();

// Mark a task as manually completed
router.post('/complete/:taskId', async (req, res) => {
  try {
    const taskId = parseInt(req.params.taskId);
    console.log(`📝 Received request to complete task ${taskId}`);
    
    if (taskId < 1 || taskId > 7) {
      console.log(`❌ Invalid task ID: ${taskId}`);
      return res.status(400).json({
        success: false,
        error: 'Invalid task ID'
      });
    }

    const result = await pool.query(`
      INSERT INTO task_completions (task_id, completed, completed_at)
      VALUES ($1, true, CURRENT_TIMESTAMP)
      ON CONFLICT (task_id) 
      DO UPDATE SET completed = true, completed_at = CURRENT_TIMESTAMP
      RETURNING *
    `, [taskId]);

    console.log(`✅ Task ${taskId} marked as completed:`, result.rows[0]);

    res.json({
      success: true,
      message: `Task ${taskId} marked as completed`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error marking task as complete:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to mark task as complete',
      details: error.message
    });
  }
});

// Check task completion status based on database data
router.get('/status', async (req, res) => {
  try {
    const taskStatus = {
      1: false, // School Year Setup
      2: false, // Create Student Registration Form
      3: false, // Create Staff Registration Form
      4: false, // Add Staff Members
      5: false, // Configure Subjects & Classes
      6: false, // Teacher-Class-Subject Mapping
      7: false  // Schedule Configuration
    };

    // Task 1: School Year Setup - Check if school config exists or schedule schema is initialized
    try {
      // Check if schedule_schema.school_config table has any data
      const schoolConfig = await pool.query('SELECT COUNT(*) FROM schedule_schema.school_config WHERE id = 1');
      const hasConfig = parseInt(schoolConfig.rows[0].count) > 0;
      
      // Also check if schedule_schema exists and has been initialized
      const schemaCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'schedule_schema' 
          AND table_name = 'school_config'
        );
      `);
      
      taskStatus[1] = hasConfig || schemaCheck.rows[0].exists;
      console.log('Task 1 check:', { hasConfig, schemaExists: schemaCheck.rows[0].exists, result: taskStatus[1] });
    } catch (e) {
      console.log('Task 1 check failed:', e.message);
    }

    // Task 2: Create Student Registration Form - Check if classes exist in school_schema_points
    try {
      const classes = await pool.query('SELECT COUNT(*) FROM school_schema_points.classes');
      taskStatus[2] = parseInt(classes.rows[0].count) > 0;
      console.log('Task 2 check:', { count: classes.rows[0].count, result: taskStatus[2] });
    } catch (e) {
      console.log('Task 2 check failed:', e.message);
    }

    // Task 3: Create Staff Registration Form - Check if staff tables exist
    try {
      // Check if any staff table exists (teaching, administrative, or supportive)
      const staffCheck = await pool.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'staff_teaching_staff' 
          OR table_schema = 'staff_administrative_staff'
          OR table_schema = 'staff_supportive_staff'
        );
      `);
      taskStatus[3] = staffCheck.rows[0].exists;
      console.log('Task 3 check:', { exists: staffCheck.rows[0].exists, result: taskStatus[3] });
    } catch (e) {
      console.log('Task 3 check failed:', e.message);
    }

    // Task 4: Add Staff Members - Check manual completion OR if staff exist in any staff table
    try {
      const manualCheck = await pool.query('SELECT completed FROM task_completions WHERE task_id = 4');
      const manuallyCompleted = manualCheck.rows[0]?.completed || false;
      
      // Check if any staff exists in any of the staff tables
      let hasStaff = false;
      try {
        // Try checking teaching staff
        const teachingStaff = await pool.query('SELECT COUNT(*) FROM staff_teaching_staff.teaching');
        hasStaff = hasStaff || parseInt(teachingStaff.rows[0].count) > 0;
      } catch (e) {
        // Table might not exist yet
      }
      
      try {
        // Try checking administrative staff
        const adminStaff = await pool.query('SELECT COUNT(*) FROM staff_administrative_staff.administrative');
        hasStaff = hasStaff || parseInt(adminStaff.rows[0].count) > 0;
      } catch (e) {
        // Table might not exist yet
      }
      
      try {
        // Try checking supportive staff
        const supportiveStaff = await pool.query('SELECT COUNT(*) FROM staff_supportive_staff.supportive');
        hasStaff = hasStaff || parseInt(supportiveStaff.rows[0].count) > 0;
      } catch (e) {
        // Table might not exist yet
      }
      
      taskStatus[4] = manuallyCompleted || hasStaff;
      console.log('Task 4 check:', { manuallyCompleted, hasStaff, result: taskStatus[4] });
    } catch (e) {
      console.log('Task 4 check failed:', e.message);
    }

    // Task 5: Assign Teachers to Classes - Check if teacher assignments exist
    try {
      const assignments = await pool.query('SELECT COUNT(*) FROM subjects_of_school_schema.teachers_subjects');
      taskStatus[5] = parseInt(assignments.rows[0].count) > 0;
      console.log('Task 5 check:', { count: assignments.rows[0].count, result: taskStatus[5] });
    } catch (e) {
      console.log('Task 5 check failed:', e.message);
    }

    // Task 6: Teacher-Class-Subject Mapping - Check if teachers are assigned
    try {
      const teacherAssignments = await pool.query('SELECT COUNT(*) FROM schedule_schema.teachers');
      taskStatus[6] = parseInt(teacherAssignments.rows[0].count) > 0;
      console.log('Task 6 check:', { count: teacherAssignments.rows[0].count, result: taskStatus[6] });
    } catch (e) {
      console.log('Task 6 check failed:', e.message);
    }

    // Task 7: Schedule Configuration - Check manual completion OR if schedule exists
    try {
      const manualCheck = await pool.query('SELECT completed FROM task_completions WHERE task_id = 7');
      const manuallyCompleted = manualCheck.rows[0]?.completed || false;
      
      const schedules = await pool.query('SELECT COUNT(*) FROM schedule_schema.schedule');
      const hasSchedule = parseInt(schedules.rows[0].count) > 0;
      
      taskStatus[7] = manuallyCompleted || hasSchedule;
      console.log('Task 7 check:', { manuallyCompleted, hasSchedule, result: taskStatus[7] });
    } catch (e) {
      console.log('Task 7 check failed:', e.message);
    }

    // Calculate completed tasks
    const completedTasks = Object.keys(taskStatus).filter(key => taskStatus[key]);
    const totalTasks = Object.keys(taskStatus).length;
    const progress = Math.round((completedTasks.length / totalTasks) * 100);

    res.json({
      success: true,
      taskStatus,
      completedTasks: completedTasks.map(Number),
      totalTasks,
      progress
    });

  } catch (error) {
    console.error('Error checking task status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check task status',
      message: error.message
    });
  }
});

module.exports = router;
