/**
 * Offline Database using Dexie.js (IndexedDB wrapper)
 * 
 * This class provides offline storage for the Skoolific app,
 * allowing it to work without internet connection.
 * 
 * @module OfflineDatabase
 */

import Dexie from 'dexie';

class OfflineDatabase extends Dexie {
  constructor() {
    super('SkoolificOfflineDB');

    // Define database schema
    // Version 1: Initial schema
    this.version(1).stores({
      // Students table
      students: '++id, student_id, first_name, last_name, class_id, status, synced, lastModified',
      
      // Attendance table
      attendance: '++id, student_id, date, status, class_id, synced, lastModified',
      
      // Marks table
      marks: '++id, student_id, subject_id, term, marks, class_id, synced, lastModified',
      
      // Exams table
      exams: '++id, exam_id, title, class_id, subject_id, status, synced, lastModified',
      
      // Posts table
      posts: '++id, post_id, title, content, created_at, synced, lastModified',
      
      // Sync Queue table
      syncQueue: '++id, operation, table, data, timestamp, status, retryCount, error'
    });

    // Table references
    this.students = this.table('students');
    this.attendance = this.table('attendance');
    this.marks = this.table('marks');
    this.exams = this.table('exams');
    this.posts = this.table('posts');
    this.syncQueue = this.table('syncQueue');
  }

  /**
   * Clear all data from the database
   * @returns {Promise<void>}
   */
  async clearAll() {
    await this.students.clear();
    await this.attendance.clear();
    await this.marks.clear();
    await this.exams.clear();
    await this.posts.clear();
    await this.syncQueue.clear();
  }

  /**
   * Get database statistics
   * @returns {Promise<Object>} Database statistics
   */
  async getStats() {
    const stats = {
      students: await this.students.count(),
      attendance: await this.attendance.count(),
      marks: await this.marks.count(),
      exams: await this.exams.count(),
      posts: await this.posts.count(),
      syncQueue: await this.syncQueue.count(),
      unsyncedStudents: await this.students.where('synced').equals(0).count(),
      unsyncedAttendance: await this.attendance.where('synced').equals(0).count(),
      unsyncedMarks: await this.marks.where('synced').equals(0).count(),
      unsyncedExams: await this.exams.where('synced').equals(0).count(),
      unsyncedPosts: await this.posts.where('synced').equals(0).count(),
      pendingSyncQueue: await this.syncQueue.where('status').equals('pending').count()
    };

    return stats;
  }

  /**
   * Export database to JSON
   * @returns {Promise<Object>} Database export
   */
  async exportToJSON() {
    const data = {
      students: await this.students.toArray(),
      attendance: await this.attendance.toArray(),
      marks: await this.marks.toArray(),
      exams: await this.exams.toArray(),
      posts: await this.posts.toArray(),
      syncQueue: await this.syncQueue.toArray(),
      exportedAt: new Date().toISOString()
    };

    return data;
  }

  /**
   * Import database from JSON
   * @param {Object} data - Database export
   * @returns {Promise<void>}
   */
  async importFromJSON(data) {
    await this.transaction('rw', this.students, this.attendance, this.marks, this.exams, this.posts, this.syncQueue, async () => {
      if (data.students) await this.students.bulkPut(data.students);
      if (data.attendance) await this.attendance.bulkPut(data.attendance);
      if (data.marks) await this.marks.bulkPut(data.marks);
      if (data.exams) await this.exams.bulkPut(data.exams);
      if (data.posts) await this.posts.bulkPut(data.posts);
      if (data.syncQueue) await this.syncQueue.bulkPut(data.syncQueue);
    });
  }

  // ==================== STUDENTS METHODS ====================

  /**
   * Add or update student
   * @param {Object} student - Student data
   * @returns {Promise<number>} Student ID
   */
  async saveStudent(student) {
    const data = {
      ...student,
      synced: student.synced !== undefined ? student.synced : 0,
      lastModified: new Date().toISOString()
    };

    if (student.id) {
      await this.students.put(data);
      return student.id;
    } else {
      return await this.students.add(data);
    }
  }

  /**
   * Get student by ID
   * @param {number} id - Student ID
   * @returns {Promise<Object|null>} Student data
   */
  async getStudent(id) {
    return await this.students.get(id);
  }

  /**
   * Get all students
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of students
   */
  async getStudents(filters = {}) {
    let collection = this.students.toCollection();

    if (filters.class_id) {
      collection = this.students.where('class_id').equals(filters.class_id);
    }

    if (filters.status) {
      collection = collection.and(student => student.status === filters.status);
    }

    return await collection.toArray();
  }

  /**
   * Get unsynced students
   * @returns {Promise<Array>} Array of unsynced students
   */
  async getUnsyncedStudents() {
    return await this.students.where('synced').equals(0).toArray();
  }

  /**
   * Mark student as synced
   * @param {number} id - Student ID
   * @returns {Promise<void>}
   */
  async markStudentSynced(id) {
    await this.students.update(id, { synced: 1 });
  }

  // ==================== ATTENDANCE METHODS ====================

  /**
   * Add or update attendance
   * @param {Object} attendance - Attendance data
   * @returns {Promise<number>} Attendance ID
   */
  async saveAttendance(attendance) {
    const data = {
      ...attendance,
      synced: attendance.synced !== undefined ? attendance.synced : 0,
      lastModified: new Date().toISOString()
    };

    if (attendance.id) {
      await this.attendance.put(data);
      return attendance.id;
    } else {
      return await this.attendance.add(data);
    }
  }

  /**
   * Get attendance records
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of attendance records
   */
  async getAttendance(filters = {}) {
    let collection = this.attendance.toCollection();

    if (filters.student_id) {
      collection = this.attendance.where('student_id').equals(filters.student_id);
    }

    if (filters.date) {
      collection = collection.and(record => record.date === filters.date);
    }

    if (filters.class_id) {
      collection = collection.and(record => record.class_id === filters.class_id);
    }

    return await collection.toArray();
  }

  /**
   * Get unsynced attendance records
   * @returns {Promise<Array>} Array of unsynced attendance
   */
  async getUnsyncedAttendance() {
    return await this.attendance.where('synced').equals(0).toArray();
  }

  /**
   * Mark attendance as synced
   * @param {number} id - Attendance ID
   * @returns {Promise<void>}
   */
  async markAttendanceSynced(id) {
    await this.attendance.update(id, { synced: 1 });
  }

  // ==================== MARKS METHODS ====================

  /**
   * Add or update marks
   * @param {Object} mark - Mark data
   * @returns {Promise<number>} Mark ID
   */
  async saveMark(mark) {
    const data = {
      ...mark,
      synced: mark.synced !== undefined ? mark.synced : 0,
      lastModified: new Date().toISOString()
    };

    if (mark.id) {
      await this.marks.put(data);
      return mark.id;
    } else {
      return await this.marks.add(data);
    }
  }

  /**
   * Get marks
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of marks
   */
  async getMarks(filters = {}) {
    let collection = this.marks.toCollection();

    if (filters.student_id) {
      collection = this.marks.where('student_id').equals(filters.student_id);
    }

    if (filters.subject_id) {
      collection = collection.and(mark => mark.subject_id === filters.subject_id);
    }

    if (filters.term) {
      collection = collection.and(mark => mark.term === filters.term);
    }

    if (filters.class_id) {
      collection = collection.and(mark => mark.class_id === filters.class_id);
    }

    return await collection.toArray();
  }

  /**
   * Get unsynced marks
   * @returns {Promise<Array>} Array of unsynced marks
   */
  async getUnsyncedMarks() {
    return await this.marks.where('synced').equals(0).toArray();
  }

  /**
   * Mark marks as synced
   * @param {number} id - Mark ID
   * @returns {Promise<void>}
   */
  async markMarkSynced(id) {
    await this.marks.update(id, { synced: 1 });
  }

  // ==================== EXAMS METHODS ====================

  /**
   * Add or update exam
   * @param {Object} exam - Exam data
   * @returns {Promise<number>} Exam ID
   */
  async saveExam(exam) {
    const data = {
      ...exam,
      synced: exam.synced !== undefined ? exam.synced : 0,
      lastModified: new Date().toISOString()
    };

    if (exam.id) {
      await this.exams.put(data);
      return exam.id;
    } else {
      return await this.exams.add(data);
    }
  }

  /**
   * Get exam by ID
   * @param {number} id - Exam ID
   * @returns {Promise<Object|null>} Exam data
   */
  async getExam(id) {
    return await this.exams.get(id);
  }

  /**
   * Get exams
   * @param {Object} filters - Optional filters
   * @returns {Promise<Array>} Array of exams
   */
  async getExams(filters = {}) {
    let collection = this.exams.toCollection();

    if (filters.class_id) {
      collection = this.exams.where('class_id').equals(filters.class_id);
    }

    if (filters.subject_id) {
      collection = collection.and(exam => exam.subject_id === filters.subject_id);
    }

    if (filters.status) {
      collection = collection.and(exam => exam.status === filters.status);
    }

    return await collection.toArray();
  }

  /**
   * Get unsynced exams
   * @returns {Promise<Array>} Array of unsynced exams
   */
  async getUnsyncedExams() {
    return await this.exams.where('synced').equals(0).toArray();
  }

  /**
   * Mark exam as synced
   * @param {number} id - Exam ID
   * @returns {Promise<void>}
   */
  async markExamSynced(id) {
    await this.exams.update(id, { synced: 1 });
  }

  // ==================== POSTS METHODS ====================

  /**
   * Add or update post
   * @param {Object} post - Post data
   * @returns {Promise<number>} Post ID
   */
  async savePost(post) {
    const data = {
      ...post,
      synced: post.synced !== undefined ? post.synced : 0,
      lastModified: new Date().toISOString()
    };

    if (post.id) {
      await this.posts.put(data);
      return post.id;
    } else {
      return await this.posts.add(data);
    }
  }

  /**
   * Get post by ID
   * @param {number} id - Post ID
   * @returns {Promise<Object|null>} Post data
   */
  async getPost(id) {
    return await this.posts.get(id);
  }

  /**
   * Get all posts
   * @returns {Promise<Array>} Array of posts
   */
  async getPosts() {
    return await this.posts.toArray();
  }

  /**
   * Get unsynced posts
   * @returns {Promise<Array>} Array of unsynced posts
   */
  async getUnsyncedPosts() {
    return await this.posts.where('synced').equals(0).toArray();
  }

  /**
   * Mark post as synced
   * @param {number} id - Post ID
   * @returns {Promise<void>}
   */
  async markPostSynced(id) {
    await this.posts.update(id, { synced: 1 });
  }

  // ==================== SYNC QUEUE METHODS ====================

  /**
   * Add operation to sync queue
   * @param {Object} operation - Operation data
   * @returns {Promise<number>} Queue ID
   */
  async addToSyncQueue(operation) {
    const data = {
      operation: operation.operation, // 'create', 'update', 'delete'
      table: operation.table,
      data: operation.data,
      timestamp: new Date().toISOString(),
      status: 'pending',
      retryCount: 0,
      error: null
    };

    return await this.syncQueue.add(data);
  }

  /**
   * Get pending sync queue items
   * @returns {Promise<Array>} Array of pending operations
   */
  async getPendingSyncQueue() {
    return await this.syncQueue.where('status').equals('pending').toArray();
  }

  /**
   * Mark sync queue item as completed
   * @param {number} id - Queue ID
   * @returns {Promise<void>}
   */
  async markSyncQueueCompleted(id) {
    await this.syncQueue.update(id, { status: 'completed' });
  }

  /**
   * Mark sync queue item as failed
   * @param {number} id - Queue ID
   * @param {string} error - Error message
   * @returns {Promise<void>}
   */
  async markSyncQueueFailed(id, error) {
    const item = await this.syncQueue.get(id);
    await this.syncQueue.update(id, {
      status: 'failed',
      error: error,
      retryCount: (item.retryCount || 0) + 1
    });
  }

  /**
   * Retry failed sync queue items
   * @returns {Promise<void>}
   */
  async retryFailedSyncQueue() {
    const failedItems = await this.syncQueue.where('status').equals('failed').toArray();
    
    for (const item of failedItems) {
      if (item.retryCount < 3) {
        await this.syncQueue.update(item.id, { status: 'pending' });
      }
    }
  }

  /**
   * Clear completed sync queue items
   * @returns {Promise<void>}
   */
  async clearCompletedSyncQueue() {
    await this.syncQueue.where('status').equals('completed').delete();
  }
}

// Create and export singleton instance
const offlineDB = new OfflineDatabase();

export default offlineDB;
