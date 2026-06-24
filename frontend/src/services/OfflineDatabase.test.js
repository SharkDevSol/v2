/**
 * Test suite for OfflineDatabase
 * 
 * This test suite verifies IndexedDB storage and retrieval functionality
 * using Dexie.js for the Skoolific offline-first architecture.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import offlineDB from './OfflineDatabase.js';

describe('OfflineDatabase', () => {
  // Clear database before each test
  beforeEach(async () => {
    await offlineDB.clearAll();
  });

  // Clean up after all tests
  afterEach(async () => {
    await offlineDB.clearAll();
  });

  describe('Database Initialization', () => {
    it('should initialize database with correct tables', async () => {
      const tables = offlineDB.tables.map(table => table.name);
      
      expect(tables).toContain('students');
      expect(tables).toContain('attendance');
      expect(tables).toContain('marks');
      expect(tables).toContain('exams');
      expect(tables).toContain('posts');
      expect(tables).toContain('syncQueue');
    });

    it('should have correct table references', () => {
      expect(offlineDB.students).toBeDefined();
      expect(offlineDB.attendance).toBeDefined();
      expect(offlineDB.marks).toBeDefined();
      expect(offlineDB.exams).toBeDefined();
      expect(offlineDB.posts).toBeDefined();
      expect(offlineDB.syncQueue).toBeDefined();
    });
  });

  describe('Students Table', () => {
    it('should save a new student', async () => {
      const student = {
        student_id: 'STU001',
        first_name: 'Ahmed',
        last_name: 'Hassan',
        class_id: 1,
        status: 'active'
      };

      const id = await offlineDB.saveStudent(student);
      expect(id).toBeGreaterThan(0);

      const savedStudent = await offlineDB.getStudent(id);
      expect(savedStudent.first_name).toBe('Ahmed');
      expect(savedStudent.last_name).toBe('Hassan');
      expect(savedStudent.synced).toBe(0);
      expect(savedStudent.lastModified).toBeDefined();
    });

    it('should update an existing student', async () => {
      const student = {
        student_id: 'STU002',
        first_name: 'Fatima',
        last_name: 'Ali',
        class_id: 2,
        status: 'active'
      };

      const id = await offlineDB.saveStudent(student);
      
      // Update student
      const updatedStudent = {
        id,
        student_id: 'STU002',
        first_name: 'Fatima',
        last_name: 'Ali Updated',
        class_id: 2,
        status: 'active'
      };

      await offlineDB.saveStudent(updatedStudent);
      
      const result = await offlineDB.getStudent(id);
      expect(result.last_name).toBe('Ali Updated');
    });

    it('should get all students', async () => {
      await offlineDB.saveStudent({
        student_id: 'STU003',
        first_name: 'Mohammed',
        last_name: 'Ibrahim',
        class_id: 1,
        status: 'active'
      });

      await offlineDB.saveStudent({
        student_id: 'STU004',
        first_name: 'Aisha',
        last_name: 'Omar',
        class_id: 1,
        status: 'active'
      });

      const students = await offlineDB.getStudents();
      expect(students.length).toBe(2);
    });

    it('should filter students by class_id', async () => {
      await offlineDB.saveStudent({
        student_id: 'STU005',
        first_name: 'Yusuf',
        last_name: 'Ahmed',
        class_id: 1,
        status: 'active'
      });

      await offlineDB.saveStudent({
        student_id: 'STU006',
        first_name: 'Maryam',
        last_name: 'Hassan',
        class_id: 2,
        status: 'active'
      });

      const class1Students = await offlineDB.getStudents({ class_id: 1 });
      expect(class1Students.length).toBe(1);
      expect(class1Students[0].first_name).toBe('Yusuf');
    });

    it('should get unsynced students', async () => {
      await offlineDB.saveStudent({
        student_id: 'STU007',
        first_name: 'Zainab',
        last_name: 'Ali',
        class_id: 1,
        status: 'active',
        synced: 0
      });

      await offlineDB.saveStudent({
        student_id: 'STU008',
        first_name: 'Ibrahim',
        last_name: 'Mohammed',
        class_id: 1,
        status: 'active',
        synced: 1
      });

      const unsyncedStudents = await offlineDB.getUnsyncedStudents();
      expect(unsyncedStudents.length).toBe(1);
      expect(unsyncedStudents[0].first_name).toBe('Zainab');
    });

    it('should mark student as synced', async () => {
      const id = await offlineDB.saveStudent({
        student_id: 'STU009',
        first_name: 'Khalid',
        last_name: 'Omar',
        class_id: 1,
        status: 'active'
      });

      await offlineDB.markStudentSynced(id);
      
      const student = await offlineDB.getStudent(id);
      expect(student.synced).toBe(1);
    });
  });

  describe('Attendance Table', () => {
    it('should save attendance record', async () => {
      const attendance = {
        student_id: 1,
        date: '2024-01-15',
        status: 'present',
        class_id: 1
      };

      const id = await offlineDB.saveAttendance(attendance);
      expect(id).toBeGreaterThan(0);

      const records = await offlineDB.getAttendance({ student_id: 1 });
      expect(records.length).toBe(1);
      expect(records[0].status).toBe('present');
    });

    it('should filter attendance by date', async () => {
      await offlineDB.saveAttendance({
        student_id: 1,
        date: '2024-01-15',
        status: 'present',
        class_id: 1
      });

      await offlineDB.saveAttendance({
        student_id: 1,
        date: '2024-01-16',
        status: 'absent',
        class_id: 1
      });

      const records = await offlineDB.getAttendance({ 
        student_id: 1, 
        date: '2024-01-15' 
      });
      
      expect(records.length).toBe(1);
      expect(records[0].status).toBe('present');
    });

    it('should get unsynced attendance records', async () => {
      await offlineDB.saveAttendance({
        student_id: 1,
        date: '2024-01-15',
        status: 'present',
        class_id: 1,
        synced: 0
      });

      const unsynced = await offlineDB.getUnsyncedAttendance();
      expect(unsynced.length).toBe(1);
    });

    it('should mark attendance as synced', async () => {
      const id = await offlineDB.saveAttendance({
        student_id: 1,
        date: '2024-01-15',
        status: 'present',
        class_id: 1
      });

      await offlineDB.markAttendanceSynced(id);
      
      const records = await offlineDB.getAttendance({ student_id: 1 });
      expect(records[0].synced).toBe(1);
    });
  });

  describe('Marks Table', () => {
    it('should save mark record', async () => {
      const mark = {
        student_id: 1,
        subject_id: 1,
        term: 1,
        marks: 85,
        class_id: 1
      };

      const id = await offlineDB.saveMark(mark);
      expect(id).toBeGreaterThan(0);

      const marks = await offlineDB.getMarks({ student_id: 1 });
      expect(marks.length).toBe(1);
      expect(marks[0].marks).toBe(85);
    });

    it('should filter marks by subject and term', async () => {
      await offlineDB.saveMark({
        student_id: 1,
        subject_id: 1,
        term: 1,
        marks: 85,
        class_id: 1
      });

      await offlineDB.saveMark({
        student_id: 1,
        subject_id: 2,
        term: 1,
        marks: 90,
        class_id: 1
      });

      const marks = await offlineDB.getMarks({ 
        student_id: 1, 
        subject_id: 1 
      });
      
      expect(marks.length).toBe(1);
      expect(marks[0].marks).toBe(85);
    });

    it('should get unsynced marks', async () => {
      await offlineDB.saveMark({
        student_id: 1,
        subject_id: 1,
        term: 1,
        marks: 85,
        class_id: 1,
        synced: 0
      });

      const unsynced = await offlineDB.getUnsyncedMarks();
      expect(unsynced.length).toBe(1);
    });
  });

  describe('Exams Table', () => {
    it('should save exam', async () => {
      const exam = {
        exam_id: 'EX001',
        title: 'Math Midterm',
        class_id: 1,
        subject_id: 1,
        status: 'published'
      };

      const id = await offlineDB.saveExam(exam);
      expect(id).toBeGreaterThan(0);

      const savedExam = await offlineDB.getExam(id);
      expect(savedExam.title).toBe('Math Midterm');
    });

    it('should filter exams by class and subject', async () => {
      await offlineDB.saveExam({
        exam_id: 'EX002',
        title: 'Science Quiz',
        class_id: 1,
        subject_id: 2,
        status: 'published'
      });

      await offlineDB.saveExam({
        exam_id: 'EX003',
        title: 'Math Quiz',
        class_id: 1,
        subject_id: 1,
        status: 'published'
      });

      const exams = await offlineDB.getExams({ 
        class_id: 1, 
        subject_id: 1 
      });
      
      expect(exams.length).toBe(1);
      expect(exams[0].title).toBe('Math Quiz');
    });

    it('should get unsynced exams', async () => {
      await offlineDB.saveExam({
        exam_id: 'EX004',
        title: 'History Test',
        class_id: 1,
        subject_id: 3,
        status: 'draft',
        synced: 0
      });

      const unsynced = await offlineDB.getUnsyncedExams();
      expect(unsynced.length).toBe(1);
    });
  });

  describe('Posts Table', () => {
    it('should save post', async () => {
      const post = {
        post_id: 'POST001',
        title: 'School Announcement',
        content: 'Important announcement for all students',
        created_at: new Date().toISOString()
      };

      const id = await offlineDB.savePost(post);
      expect(id).toBeGreaterThan(0);

      const savedPost = await offlineDB.getPost(id);
      expect(savedPost.title).toBe('School Announcement');
    });

    it('should get all posts', async () => {
      await offlineDB.savePost({
        post_id: 'POST002',
        title: 'Post 1',
        content: 'Content 1',
        created_at: new Date().toISOString()
      });

      await offlineDB.savePost({
        post_id: 'POST003',
        title: 'Post 2',
        content: 'Content 2',
        created_at: new Date().toISOString()
      });

      const posts = await offlineDB.getPosts();
      expect(posts.length).toBe(2);
    });

    it('should get unsynced posts', async () => {
      await offlineDB.savePost({
        post_id: 'POST004',
        title: 'Unsynced Post',
        content: 'This post is not synced',
        created_at: new Date().toISOString(),
        synced: 0
      });

      const unsynced = await offlineDB.getUnsyncedPosts();
      expect(unsynced.length).toBe(1);
    });
  });

  describe('Sync Queue Table', () => {
    it('should add operation to sync queue', async () => {
      const operation = {
        operation: 'create',
        table: 'students',
        data: { student_id: 'STU010', first_name: 'Test' }
      };

      const id = await offlineDB.addToSyncQueue(operation);
      expect(id).toBeGreaterThan(0);

      const pending = await offlineDB.getPendingSyncQueue();
      expect(pending.length).toBe(1);
      expect(pending[0].operation).toBe('create');
      expect(pending[0].status).toBe('pending');
    });

    it('should mark sync queue item as completed', async () => {
      const id = await offlineDB.addToSyncQueue({
        operation: 'update',
        table: 'students',
        data: { id: 1, first_name: 'Updated' }
      });

      await offlineDB.markSyncQueueCompleted(id);
      
      const pending = await offlineDB.getPendingSyncQueue();
      expect(pending.length).toBe(0);
    });

    it('should mark sync queue item as failed', async () => {
      const id = await offlineDB.addToSyncQueue({
        operation: 'delete',
        table: 'students',
        data: { id: 1 }
      });

      await offlineDB.markSyncQueueFailed(id, 'Network error');
      
      const item = await offlineDB.syncQueue.get(id);
      expect(item.status).toBe('failed');
      expect(item.error).toBe('Network error');
      expect(item.retryCount).toBe(1);
    });

    it('should retry failed sync queue items', async () => {
      const id = await offlineDB.addToSyncQueue({
        operation: 'create',
        table: 'attendance',
        data: { student_id: 1, date: '2024-01-15' }
      });

      await offlineDB.markSyncQueueFailed(id, 'Timeout');
      await offlineDB.retryFailedSyncQueue();
      
      const item = await offlineDB.syncQueue.get(id);
      expect(item.status).toBe('pending');
    });

    it('should not retry items with 3+ failures', async () => {
      const id = await offlineDB.addToSyncQueue({
        operation: 'create',
        table: 'marks',
        data: { student_id: 1, marks: 85 }
      });

      // Fail 3 times
      await offlineDB.markSyncQueueFailed(id, 'Error 1');
      await offlineDB.markSyncQueueFailed(id, 'Error 2');
      await offlineDB.markSyncQueueFailed(id, 'Error 3');
      
      await offlineDB.retryFailedSyncQueue();
      
      const item = await offlineDB.syncQueue.get(id);
      expect(item.status).toBe('failed');
      expect(item.retryCount).toBe(3);
    });

    it('should clear completed sync queue items', async () => {
      const id1 = await offlineDB.addToSyncQueue({
        operation: 'create',
        table: 'students',
        data: { student_id: 'STU011' }
      });

      const id2 = await offlineDB.addToSyncQueue({
        operation: 'update',
        table: 'students',
        data: { id: 1 }
      });

      await offlineDB.markSyncQueueCompleted(id1);
      await offlineDB.clearCompletedSyncQueue();
      
      const allItems = await offlineDB.syncQueue.toArray();
      expect(allItems.length).toBe(1);
      expect(allItems[0].id).toBe(id2);
    });
  });

  describe('Database Statistics', () => {
    it('should get accurate database statistics', async () => {
      // Add test data
      await offlineDB.saveStudent({
        student_id: 'STU012',
        first_name: 'Test',
        last_name: 'Student',
        class_id: 1,
        status: 'active',
        synced: 0
      });

      await offlineDB.saveAttendance({
        student_id: 1,
        date: '2024-01-15',
        status: 'present',
        class_id: 1,
        synced: 1
      });

      await offlineDB.addToSyncQueue({
        operation: 'create',
        table: 'students',
        data: {}
      });

      const stats = await offlineDB.getStats();
      
      expect(stats.students).toBe(1);
      expect(stats.attendance).toBe(1);
      expect(stats.unsyncedStudents).toBe(1);
      expect(stats.pendingSyncQueue).toBe(1);
    });
  });

  describe('Database Export/Import', () => {
    it('should export database to JSON', async () => {
      await offlineDB.saveStudent({
        student_id: 'STU013',
        first_name: 'Export',
        last_name: 'Test',
        class_id: 1,
        status: 'active'
      });

      await offlineDB.savePost({
        post_id: 'POST005',
        title: 'Export Post',
        content: 'Test content',
        created_at: new Date().toISOString()
      });

      const exportData = await offlineDB.exportToJSON();
      
      expect(exportData.students.length).toBe(1);
      expect(exportData.posts.length).toBe(1);
      expect(exportData.exportedAt).toBeDefined();
    });

    it('should import database from JSON', async () => {
      const importData = {
        students: [
          {
            id: 1,
            student_id: 'STU014',
            first_name: 'Import',
            last_name: 'Test',
            class_id: 1,
            status: 'active',
            synced: 1,
            lastModified: new Date().toISOString()
          }
        ],
        posts: [
          {
            id: 1,
            post_id: 'POST006',
            title: 'Import Post',
            content: 'Imported content',
            created_at: new Date().toISOString(),
            synced: 1,
            lastModified: new Date().toISOString()
          }
        ]
      };

      await offlineDB.importFromJSON(importData);
      
      const students = await offlineDB.getStudents();
      const posts = await offlineDB.getPosts();
      
      expect(students.length).toBe(1);
      expect(students[0].first_name).toBe('Import');
      expect(posts.length).toBe(1);
      expect(posts[0].title).toBe('Import Post');
    });
  });

  describe('Database Clear', () => {
    it('should clear all data from database', async () => {
      // Add data to all tables
      await offlineDB.saveStudent({
        student_id: 'STU015',
        first_name: 'Clear',
        last_name: 'Test',
        class_id: 1,
        status: 'active'
      });

      await offlineDB.saveAttendance({
        student_id: 1,
        date: '2024-01-15',
        status: 'present',
        class_id: 1
      });

      await offlineDB.saveMark({
        student_id: 1,
        subject_id: 1,
        term: 1,
        marks: 85,
        class_id: 1
      });

      await offlineDB.clearAll();
      
      const stats = await offlineDB.getStats();
      expect(stats.students).toBe(0);
      expect(stats.attendance).toBe(0);
      expect(stats.marks).toBe(0);
      expect(stats.exams).toBe(0);
      expect(stats.posts).toBe(0);
      expect(stats.syncQueue).toBe(0);
    });
  });
});
