const pool = require('../config/db');
const fs = require('fs').promises;
const path = require('path');

/**
 * BackupRestoreService - Manages backup and restore operations for device users
 * Provides data backup, restore, and recovery functionality
 */
class BackupRestoreService {
  constructor() {
    this.backupDir = path.join(__dirname, '..', 'backups');
    this.backupInterval = null;
    this.initializeBackupDirectory();
    this.initializeBackupTable();
  }

  /**
   * Initialize backup directory
   */
  async initializeBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
      console.log('✅ BackupRestoreService: Backup directory initialized');
    } catch (error) {
      console.error('❌ BackupRestoreService: Failed to initialize backup directory:', error.message);
    }
  }

  /**
   * Initialize backup metadata table
   */
  async initializeBackupTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS backup_metadata (
          backup_id SERIAL PRIMARY KEY,
          backup_name VARCHAR(255) NOT NULL,
          backup_type VARCHAR(50) NOT NULL,
          file_path TEXT NOT NULL,
          file_size BIGINT,
          record_count INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          created_by VARCHAR(100),
          description TEXT,
          status VARCHAR(50) DEFAULT 'completed'
        )
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS idx_backup_metadata_created_at 
        ON backup_metadata(created_at DESC)
      `);

      console.log('✅ BackupRestoreService: Backup metadata table initialized');
    } catch (error) {
      console.error('❌ BackupRestoreService: Failed to initialize backup table:', error.message);
    }
  }

  /**
   * Create a backup of device users
   * @param {Object} options - Backup options
   * @returns {Promise<{success: boolean, backupId?: number, filePath?: string, error?: string}>}
   */
  async createBackup(options = {}) {
    const {
      backupName = `device_users_${Date.now()}`,
      createdBy = 'system',
      description = 'Device users backup'
    } = options;

    try {
      console.log(`🔄 Creating backup: ${backupName}`);

      // Fetch all device user data (handle missing table)
      let result;
      try {
        result = await pool.query(`
          SELECT * FROM user_machine_mapping
          ORDER BY person_id
        `);
      } catch (queryErr) {
        if (queryErr.code === '42P01') {
          console.log('  ⚠️ user_machine_mapping table not found, skipping backup');
          return { success: true, backupId: null, recordCount: 0 };
        }
        throw queryErr;
      }

      const backupData = {
        timestamp: new Date().toISOString(),
        recordCount: result.rows.length,
        data: result.rows
      };

      // Save to file
      const fileName = `${backupName}.json`;
      const filePath = path.join(this.backupDir, fileName);
      await fs.writeFile(filePath, JSON.stringify(backupData, null, 2));

      // Get file size
      const stats = await fs.stat(filePath);
      const fileSize = stats.size;

      // Save metadata
      const metadataResult = await pool.query(`
        INSERT INTO backup_metadata 
        (backup_name, backup_type, file_path, file_size, record_count, created_by, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING backup_id
      `, [backupName, 'device_users', filePath, fileSize, result.rows.length, createdBy, description]);

      console.log(`✅ Backup created: ${backupName} (${result.rows.length} records, ${fileSize} bytes)`);

      return {
        success: true,
        backupId: metadataResult.rows[0].backup_id,
        filePath,
        recordCount: result.rows.length,
        fileSize
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Restore from a backup
   * @param {number} backupId - The backup ID to restore from
   * @param {Object} options - Restore options
   * @returns {Promise<{success: boolean, restoredCount?: number, error?: string}>}
   */
  async restoreFromBackup(backupId, options = {}) {
    const { overwrite = false } = options;

    try {
      console.log(`🔄 Restoring from backup ID: ${backupId}`);

      // Get backup metadata
      const metadataResult = await pool.query(`
        SELECT * FROM backup_metadata WHERE backup_id = $1
      `, [backupId]);

      if (metadataResult.rows.length === 0) {
        return {
          success: false,
          error: 'Backup not found'
        };
      }

      const metadata = metadataResult.rows[0];
      const filePath = metadata.file_path;

      // Read backup file
      const fileContent = await fs.readFile(filePath, 'utf8');
      const backupData = JSON.parse(fileContent);

      if (!backupData.data || !Array.isArray(backupData.data)) {
        return {
          success: false,
          error: 'Invalid backup file format'
        };
      }

      // Restore data
      let restoredCount = 0;
      const client = await pool.connect();

      try {
        await client.query('BEGIN');

        for (const record of backupData.data) {
          if (overwrite) {
            // Delete existing record if overwrite is enabled
            await client.query(`
              DELETE FROM user_machine_mapping 
              WHERE person_id = $1 AND person_type = $2
            `, [record.person_id, record.person_type]);
          }

          // Insert record
          await client.query(`
            INSERT INTO user_machine_mapping 
            (person_id, person_type, machine_user_id, machine_user_name, synced_to_device, last_sync_time)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (person_id, person_type) DO NOTHING
          `, [
            record.person_id,
            record.person_type,
            record.machine_user_id,
            record.machine_user_name,
            record.synced_to_device || false,
            record.last_sync_time
          ]);

          restoredCount++;
        }

        await client.query('COMMIT');
        console.log(`✅ Restored ${restoredCount} records from backup`);

        return {
          success: true,
          restoredCount
        };
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error restoring from backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * List all backups
   * @param {number} limit - Maximum number of backups to retrieve
   * @returns {Promise<Array>}
   */
  async listBackups(limit = 50) {
    try {
      const result = await pool.query(`
        SELECT * FROM backup_metadata
        ORDER BY created_at DESC
        LIMIT $1
      `, [limit]);

      return result.rows;
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  /**
   * Delete a backup
   * @param {number} backupId - The backup ID to delete
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteBackup(backupId) {
    try {
      // Get backup metadata
      const metadataResult = await pool.query(`
        SELECT * FROM backup_metadata WHERE backup_id = $1
      `, [backupId]);

      if (metadataResult.rows.length === 0) {
        return {
          success: false,
          error: 'Backup not found'
        };
      }

      const metadata = metadataResult.rows[0];
      const filePath = metadata.file_path;

      // Delete file
      try {
        await fs.unlink(filePath);
      } catch (fileError) {
        console.warn('Could not delete backup file:', fileError.message);
      }

      // Delete metadata
      await pool.query(`
        DELETE FROM backup_metadata WHERE backup_id = $1
      `, [backupId]);

      console.log(`✅ Deleted backup ID: ${backupId}`);

      return { success: true };
    } catch (error) {
      console.error('Error deleting backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get backup details
   * @param {number} backupId - The backup ID
   * @returns {Promise<Object|null>}
   */
  async getBackupDetails(backupId) {
    try {
      const result = await pool.query(`
        SELECT * FROM backup_metadata WHERE backup_id = $1
      `, [backupId]);

      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      console.error('Error getting backup details:', error);
      return null;
    }
  }

  /**
   * Clean up old backups
   * @param {number} daysOld - Remove backups older than this many days
   * @returns {Promise<{success: boolean, deletedCount?: number, error?: string}>}
   */
  async cleanupOldBackups(daysOld = 30) {
    try {
      const result = await pool.query(`
        SELECT backup_id, file_path FROM backup_metadata
        WHERE created_at < NOW() - INTERVAL '${daysOld} days'
      `);

      let deletedCount = 0;

      for (const backup of result.rows) {
        // Delete file
        try {
          await fs.unlink(backup.file_path);
        } catch (fileError) {
          console.warn('Could not delete backup file:', fileError.message);
        }

        // Delete metadata
        await pool.query(`
          DELETE FROM backup_metadata WHERE backup_id = $1
        `, [backup.backup_id]);

        deletedCount++;
      }

      console.log(`🧹 Cleaned up ${deletedCount} old backups`);

      return {
        success: true,
        deletedCount
      };
    } catch (error) {
      console.error('Error cleaning up old backups:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Export backup data as JSON
   * @param {number} backupId - The backup ID to export
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async exportBackup(backupId) {
    try {
      const metadata = await this.getBackupDetails(backupId);
      
      if (!metadata) {
        return {
          success: false,
          error: 'Backup not found'
        };
      }

      const fileContent = await fs.readFile(metadata.file_path, 'utf8');
      const backupData = JSON.parse(fileContent);

      return {
        success: true,
        data: backupData
      };
    } catch (error) {
      console.error('Error exporting backup:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Start automatic backup service
   * @param {number} intervalHours - How often to backup (default: 6 hours)
   */
  startAutoBackup(intervalHours = 6) {
    if (this.backupInterval) {
      console.log('⚠️  Auto-backup is already running');
      return;
    }

    console.log(`🚀 Starting Auto-Backup Service (every ${intervalHours} hours)`);

    // Run initial backup
    this.performAutoBackup();

    // Schedule periodic backups
    this.backupInterval = setInterval(() => {
      this.performAutoBackup();
    }, intervalHours * 60 * 60 * 1000);
  }

  /**
   * Stop automatic backup service
   */
  stopAutoBackup() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('🛑 Auto-backup service stopped');
    }
  }

  /**
   * Perform automatic backup
   */
  async performAutoBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `auto_backup_${timestamp}`;

      console.log(`🔄 Performing automatic backup: ${backupName}`);

      const result = await this.createBackup({
        backupName,
        createdBy: 'auto_backup_service',
        description: 'Automatic scheduled backup'
      });

      if (result.success) {
        console.log(`✅ Auto-backup completed: ${backupName} (${result.recordCount} records)`);

        // Auto cleanup old backups (keep last 30 days)
        if (Math.random() < 0.2) { // 20% chance on each backup
          await this.cleanupOldBackups(30);
        }
      } else {
        console.error(`❌ Auto-backup failed: ${result.error}`);
      }
    } catch (error) {
      console.error('Error performing auto-backup:', error);
    }
  }

  /**
   * Get backup service status
   */
  getBackupStatus() {
    return {
      isRunning: !!this.backupInterval,
      backupDirectory: this.backupDir
    };
  }
}

module.exports = new BackupRestoreService();
