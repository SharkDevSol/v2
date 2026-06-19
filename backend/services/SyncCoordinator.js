const pool = require('../config/db');

/**
 * SyncCoordinator - Manages distributed locks for sync operations
 * Prevents multiple sync processes from running simultaneously
 */
class SyncCoordinator {
  /**
   * Ensure the sync_locks table exists
   */
  async ensureTable() {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sync_locks (
          id SERIAL PRIMARY KEY,
          lock_key VARCHAR(255) NOT NULL,
          acquired_by VARCHAR(255),
          expires_at TIMESTAMP NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } catch (e) {
      // table already exists, ignore
    }
  }

  /**
   * Acquire a distributed lock
   * @param {string} lockName - Name of the lock (e.g., 'aasRealtimeSync')
   * @param {number} timeoutSeconds - How long the lock is valid (default: 300 seconds)
   * @returns {Promise<{success: boolean, lockId?: number, error?: string}>}
   */
  async acquireLock(lockName, timeoutSeconds = 300) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Clean up expired locks first
      await client.query(`
        DELETE FROM sync_locks 
        WHERE lock_key = $1 
          AND expires_at < NOW()
      `, [lockName]);

      // Check if lock is already held
      const existingLock = await client.query(`
        SELECT id, expires_at 
        FROM sync_locks 
        WHERE lock_key = $1 AND expires_at > NOW()
      `, [lockName]);

      if (existingLock.rows.length > 0) {
        await client.query('COMMIT');
        return {
          success: false,
          error: 'Lock already held',
          expiresAt: existingLock.rows[0].expires_at
        };
      }

      // Acquire new lock
      const expiresAt = new Date(Date.now() + timeoutSeconds * 1000);
      const acquiredBy = `${process.pid}-${Date.now()}`;

      const result = await client.query(`
        INSERT INTO sync_locks (lock_key, acquired_by, expires_at)
        VALUES ($1, $2, $3)
        RETURNING id
      `, [lockName, acquiredBy, expiresAt]);

      await client.query('COMMIT');

      return {
        success: true,
        lockId: result.rows[0].id,
        expiresAt
      };

    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error acquiring lock:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      client.release();
    }
  }

  /**
   * Release a distributed lock
   * @param {number} lockId - Lock ID to release
   * @returns {Promise<{success: boolean}>}
   */
  async releaseLock(lockId) {
    try {
      await pool.query(`
        DELETE FROM sync_locks 
        WHERE id = $1
      `, [lockId]);

      return { success: true };
    } catch (error) {
      console.error('Error releasing lock:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check if a lock is currently held
   * @param {string} lockName - Name of the lock to check
   * @returns {Promise<{isLocked: boolean, heldBy?: string, expiresAt?: Date}>}
   */
  async checkLockStatus(lockName) {
    try {
      const result = await pool.query(`
        SELECT id, acquired_by, expires_at 
        FROM sync_locks 
        WHERE lock_key = $1 AND expires_at > NOW()
      `, [lockName]);

      if (result.rows.length > 0) {
        return {
          isLocked: true,
          heldBy: result.rows[0].acquired_by,
          expiresAt: result.rows[0].expires_at
        };
      }

      return { isLocked: false };
    } catch (error) {
      console.error('Error checking lock status:', error);
      return { isLocked: false, error: error.message };
    }
  }

  /**
   * Clean up expired locks
   * @returns {Promise<{cleaned: number}>}
   */
  async cleanupExpiredLocks() {
    try {
      const result = await pool.query(`
        DELETE FROM sync_locks 
        WHERE expires_at < NOW()
        RETURNING id
      `);

      if (result.rowCount > 0) {
        console.log(`🧹 Cleaned up ${result.rowCount} expired locks`);
      }

      return { cleaned: result.rowCount };
    } catch (error) {
      console.error('Error cleaning up expired locks:', error);
      return { cleaned: 0, error: error.message };
    }
  }
}

// Auto-create table on first load
const instance = new SyncCoordinator();
instance.ensureTable();
module.exports = instance;
