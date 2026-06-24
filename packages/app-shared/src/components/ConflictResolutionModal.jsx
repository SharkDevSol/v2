/**
 * Conflict Resolution Modal Component
 * 
 * This component displays conflicts between local and remote data
 * and allows users to manually resolve them by choosing which version
 * to keep or merging the data manually.
 * 
 * @module ConflictResolutionModal
 */

import React, { useState, useEffect } from 'react';
import conflictResolver from '../services/ConflictResolver.js';
import styles from './ConflictResolutionModal.module.css';

const ConflictResolutionModal = ({ isOpen, onClose, onResolved }) => {
  const [conflicts, setConflicts] = useState([]);
  const [selectedConflict, setSelectedConflict] = useState(null);
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [mergedData, setMergedData] = useState(null);
  const [isResolving, setIsResolving] = useState(false);

  // Load pending conflicts
  useEffect(() => {
    if (isOpen) {
      loadConflicts();
    }
  }, [isOpen]);

  // Listen for new conflicts
  useEffect(() => {
    const handleConflict = (type, conflict) => {
      if (type === 'detected') {
        loadConflicts();
      }
    };

    conflictResolver.onConflict(handleConflict);

    return () => {
      conflictResolver.offConflict(handleConflict);
    };
  }, []);

  const loadConflicts = () => {
    const pending = conflictResolver.getPendingConflicts();
    setConflicts(pending);
    
    if (pending.length > 0 && !selectedConflict) {
      setSelectedConflict(pending[0]);
      setMergedData(pending[0].localData);
    }
  };

  const handleSelectConflict = (conflict) => {
    setSelectedConflict(conflict);
    setSelectedVersion(null);
    setMergedData(conflict.localData);
  };

  const handleSelectVersion = (version) => {
    setSelectedVersion(version);
    
    if (version === 'local') {
      setMergedData(selectedConflict.localData);
    } else if (version === 'remote') {
      setMergedData(selectedConflict.remoteData);
    }
  };

  const handleFieldChange = (field, value) => {
    setMergedData({
      ...mergedData,
      [field]: value
    });
  };

  const handleResolve = async () => {
    if (!selectedConflict || !mergedData) {
      return;
    }

    setIsResolving(true);

    try {
      await conflictResolver.manuallyResolve(selectedConflict.id, mergedData);
      
      // Remove resolved conflict from list
      const remaining = conflicts.filter(c => c.id !== selectedConflict.id);
      setConflicts(remaining);
      
      // Select next conflict or close modal
      if (remaining.length > 0) {
        setSelectedConflict(remaining[0]);
        setMergedData(remaining[0].localData);
        setSelectedVersion(null);
      } else {
        setSelectedConflict(null);
        setMergedData(null);
        onClose();
      }
      
      // Notify parent
      if (onResolved) {
        onResolved(selectedConflict.id, mergedData);
      }
      
    } catch (error) {
      console.error('[ConflictResolutionModal] Failed to resolve conflict:', error);
      alert('Failed to resolve conflict: ' + error.message);
    } finally {
      setIsResolving(false);
    }
  };

  const handleSkip = () => {
    const remaining = conflicts.filter(c => c.id !== selectedConflict.id);
    
    if (remaining.length > 0) {
      setSelectedConflict(remaining[0]);
      setMergedData(remaining[0].localData);
      setSelectedVersion(null);
    } else {
      onClose();
    }
  };

  const renderFieldComparison = () => {
    if (!selectedConflict) return null;

    const { localData, remoteData, conflictData } = selectedConflict;
    const changedFields = conflictData?.changedFields || [];

    return (
      <div className={styles.fieldComparison}>
        <div className={styles.comparisonHeader}>
          <div className={styles.versionColumn}>
            <h4>Local Version</h4>
            <button
              className={`${styles.selectButton} ${selectedVersion === 'local' ? styles.selected : ''}`}
              onClick={() => handleSelectVersion('local')}
            >
              Use Local
            </button>
          </div>
          <div className={styles.versionColumn}>
            <h4>Remote Version</h4>
            <button
              className={`${styles.selectButton} ${selectedVersion === 'remote' ? styles.selected : ''}`}
              onClick={() => handleSelectVersion('remote')}
            >
              Use Remote
            </button>
          </div>
        </div>

        <div className={styles.fieldsContainer}>
          {Object.keys(localData).map(field => {
            // Skip metadata fields
            if (['id', 'synced', 'lastModified', 'updated_at', 'created_at'].includes(field)) {
              return null;
            }

            const isChanged = changedFields.includes(field);
            const localValue = localData[field];
            const remoteValue = remoteData[field];

            return (
              <div
                key={field}
                className={`${styles.fieldRow} ${isChanged ? styles.changed : ''}`}
              >
                <div className={styles.fieldName}>
                  {field}
                  {isChanged && <span className={styles.changedBadge}>Changed</span>}
                </div>
                <div className={styles.fieldValue}>
                  {typeof localValue === 'object' 
                    ? JSON.stringify(localValue, null, 2)
                    : String(localValue)}
                </div>
                <div className={styles.fieldValue}>
                  {typeof remoteValue === 'object'
                    ? JSON.stringify(remoteValue, null, 2)
                    : String(remoteValue)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMergedData = () => {
    if (!mergedData) return null;

    return (
      <div className={styles.mergedData}>
        <h4>Merged Data (Edit if needed)</h4>
        <div className={styles.mergedFields}>
          {Object.keys(mergedData).map(field => {
            // Skip metadata fields
            if (['id', 'synced', 'lastModified', 'updated_at', 'created_at'].includes(field)) {
              return null;
            }

            const value = mergedData[field];
            const isObject = typeof value === 'object';

            return (
              <div key={field} className={styles.mergedField}>
                <label>{field}</label>
                {isObject ? (
                  <textarea
                    value={JSON.stringify(value, null, 2)}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value);
                        handleFieldChange(field, parsed);
                      } catch (err) {
                        // Invalid JSON, don't update
                      }
                    }}
                    rows={5}
                  />
                ) : (
                  <input
                    type="text"
                    value={String(value)}
                    onChange={(e) => handleFieldChange(field, e.target.value)}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2>Resolve Data Conflicts</h2>
          <button className={styles.closeButton} onClick={onClose}>×</button>
        </div>

        {conflicts.length === 0 ? (
          <div className={styles.noConflicts}>
            <p>No conflicts to resolve</p>
            <button onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <div className={styles.conflictsList}>
              <h3>Pending Conflicts ({conflicts.length})</h3>
              <div className={styles.conflictsItems}>
                {conflicts.map(conflict => (
                  <div
                    key={conflict.id}
                    className={`${styles.conflictItem} ${selectedConflict?.id === conflict.id ? styles.active : ''}`}
                    onClick={() => handleSelectConflict(conflict)}
                  >
                    <div className={styles.conflictInfo}>
                      <span className={styles.conflictTable}>{conflict.table}</span>
                      <span className={styles.conflictType}>{conflict.conflictType}</span>
                    </div>
                    <div className={styles.conflictTime}>
                      {new Date(conflict.timestamp).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {selectedConflict && (
              <div className={styles.conflictDetails}>
                <div className={styles.conflictHeader}>
                  <h3>Conflict Details</h3>
                  <div className={styles.conflictMeta}>
                    <span>Table: {selectedConflict.table}</span>
                    <span>Type: {selectedConflict.conflictType}</span>
                    <span>Complex: {selectedConflict.isComplex ? 'Yes' : 'No'}</span>
                  </div>
                </div>

                {renderFieldComparison()}
                {renderMergedData()}

                <div className={styles.actions}>
                  <button
                    className={styles.skipButton}
                    onClick={handleSkip}
                    disabled={isResolving}
                  >
                    Skip
                  </button>
                  <button
                    className={styles.resolveButton}
                    onClick={handleResolve}
                    disabled={isResolving || !mergedData}
                  >
                    {isResolving ? 'Resolving...' : 'Resolve Conflict'}
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ConflictResolutionModal;
