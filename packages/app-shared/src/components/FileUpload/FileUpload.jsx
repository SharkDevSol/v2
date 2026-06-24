import React, { useRef, useState } from 'react';
import { Upload, X, File, Image as ImageIcon, FileText, AlertCircle } from 'lucide-react';
import styles from './FileUpload.module.css';
import FilePreview from './FilePreview';

/**
 * FileUpload component with drag-and-drop support
 * 
 * @component
 * @param {Object} props - Component props
 * @param {string} [props.label] - Label text for the upload area
 * @param {string} [props.accept] - Accepted file types (e.g., 'image/*', '.pdf,.doc')
 * @param {boolean} [props.multiple=false] - Allow multiple file selection
 * @param {number} [props.maxSize] - Maximum file size in bytes (default: 5MB)
 * @param {number} [props.maxFiles] - Maximum number of files allowed
 * @param {function} props.onChange - Callback function when files are selected (receives File[] array)
 * @param {function} [props.onError] - Callback function when validation error occurs
 * @param {boolean} [props.disabled=false] - Disabled state
 * @param {string} [props.error] - Error message to display
 * @param {boolean} [props.preview=true] - Show image preview for image files
 * @param {string} [props.className] - Additional CSS classes
 * @param {File[]} [props.value] - Controlled value (array of File objects)
 */
const FileUpload = ({
  label,
  accept,
  multiple = false,
  maxSize = 5 * 1024 * 1024, // 5MB default
  maxFiles,
  onChange,
  onError,
  disabled = false,
  error,
  preview = true,
  className = '',
  value = [],
  ...props
}) => {
  const [files, setFiles] = useState(value);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const fileInputRef = useRef(null);
  const dropZoneRef = useRef(null);

  // Sync internal state with value prop (controlled component support)
  React.useEffect(() => {
    setFiles(value);
  }, [value]);

  // Generate unique ID for accessibility
  const uploadId = `file-upload-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${uploadId}-error`;

  /**
   * Format file size to human-readable format
   */
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  /**
   * Validate file type
   */
  const isValidFileType = (file) => {
    if (!accept) return true;
    
    const acceptedTypes = accept.split(',').map(type => type.trim());
    const fileType = file.type;
    const fileName = file.name;
    
    return acceptedTypes.some(type => {
      // Handle MIME types (e.g., 'image/*', 'application/pdf')
      if (type.includes('*')) {
        const baseType = type.split('/')[0];
        return fileType.startsWith(baseType + '/');
      }
      // Handle extensions (e.g., '.pdf', '.doc')
      if (type.startsWith('.')) {
        return fileName.toLowerCase().endsWith(type.toLowerCase());
      }
      // Handle exact MIME types
      return fileType === type;
    });
  };

  /**
   * Validate file size
   */
  const isValidFileSize = (file) => {
    return file.size <= maxSize;
  };

  /**
   * Validate files
   */
  const validateFiles = (filesToValidate) => {
    const errors = [];
    
    // Check max files limit
    if (maxFiles && files.length + filesToValidate.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} file${maxFiles > 1 ? 's' : ''} allowed`);
    }
    
    // Validate each file
    filesToValidate.forEach(file => {
      if (!isValidFileType(file)) {
        errors.push(`${file.name}: Invalid file type`);
      }
      if (!isValidFileSize(file)) {
        errors.push(`${file.name}: File size exceeds ${formatFileSize(maxSize)}`);
      }
    });
    
    return errors;
  };

  /**
   * Handle file selection
   */
  const handleFiles = (selectedFiles) => {
    if (disabled) return;
    
    const fileArray = Array.from(selectedFiles);
    const validationErrors = validateFiles(fileArray);
    
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.join(', ');
      if (onError) {
        onError(errorMessage);
      }
      return;
    }
    
    // Add new files to existing files (or replace if not multiple)
    const newFiles = multiple ? [...files, ...fileArray] : fileArray;
    
    // Limit to maxFiles if specified
    const finalFiles = maxFiles ? newFiles.slice(0, maxFiles) : newFiles;
    
    setFiles(finalFiles);
    
    if (onChange) {
      onChange(finalFiles);
    }
    
    // Simulate upload progress (for demo purposes)
    fileArray.forEach((file, index) => {
      simulateUploadProgress(file.name);
    });
  };

  /**
   * Simulate upload progress (replace with actual upload logic)
   */
  const simulateUploadProgress = (fileName) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(prev => ({
        ...prev,
        [fileName]: progress
      }));
      
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          setUploadProgress(prev => {
            const newProgress = { ...prev };
            delete newProgress[fileName];
            return newProgress;
          });
        }, 500);
      }
    }, 100);
  };

  /**
   * Handle file input change
   */
  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFiles(selectedFiles);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  /**
   * Handle drag events
   */
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if leaving the drop zone itself
    if (e.target === dropZoneRef.current) {
      setIsDragging(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (disabled) return;
    
    const droppedFiles = e.dataTransfer.files;
    if (droppedFiles && droppedFiles.length > 0) {
      handleFiles(droppedFiles);
    }
  };

  /**
   * Handle file removal
   */
  const handleRemoveFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    
    if (onChange) {
      onChange(newFiles);
    }
  };

  /**
   * Open file picker
   */
  const handleClick = () => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handle keyboard interaction
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <div className={`${styles.fileUploadGroup} ${className}`}>
      {label && (
        <label className={styles.label}>
          {label}
        </label>
      )}
      
      <div
        ref={dropZoneRef}
        className={`
          ${styles.dropZone}
          ${isDragging ? styles.dragging : ''}
          ${disabled ? styles.disabled : ''}
          ${error ? styles.error : ''}
        `}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label || 'Upload files'}
        aria-disabled={disabled}
        aria-describedby={error ? errorId : undefined}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileInputChange}
          className={styles.fileInput}
          disabled={disabled}
          aria-hidden="true"
          tabIndex={-1}
          {...props}
        />
        
        <div className={styles.dropZoneContent}>
          <Upload className={styles.uploadIcon} size={48} />
          <p className={styles.dropZoneText}>
            {isDragging ? (
              <strong>Drop files here</strong>
            ) : (
              <>
                <strong>Click to upload</strong> or drag and drop
              </>
            )}
          </p>
          <p className={styles.dropZoneHint}>
            {accept && `Accepted formats: ${accept}`}
            {maxSize && ` • Max size: ${formatFileSize(maxSize)}`}
            {maxFiles && ` • Max files: ${maxFiles}`}
          </p>
        </div>
      </div>
      
      {error && (
        <span 
          id={errorId}
          className={styles.errorMessage}
          role="alert"
          aria-live="assertive"
        >
          <AlertCircle size={14} />
          {error}
        </span>
      )}
      
      {files.length > 0 && (
        <div className={styles.fileList}>
          {files.map((file, index) => (
            <FilePreview
              key={`${file.name}-${index}`}
              file={file}
              onRemove={() => handleRemoveFile(index)}
              showPreview={preview}
              progress={uploadProgress[file.name]}
              disabled={disabled}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
