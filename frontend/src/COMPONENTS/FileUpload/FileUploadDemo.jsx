import React, { useState } from 'react';
import FileUpload from './FileUpload';
import Card from '../Card/Card';
import styles from './FileUploadDemo.module.css';

/**
 * FileUpload Component Demo
 * Demonstrates the FileUpload component with various configurations
 */
const FileUploadDemo = () => {
  const [files1, setFiles1] = useState([]);
  const [files2, setFiles2] = useState([]);
  const [files3, setFiles3] = useState([]);
  const [error, setError] = useState('');

  const handleError = (errorMessage) => {
    setError(errorMessage);
    setTimeout(() => setError(''), 5000);
  };

  return (
    <div className={styles.demo}>
      <h1 className={styles.title}>FileUpload Component Demo</h1>
      <p className={styles.subtitle}>
        Demonstrates drag-and-drop file upload with validation and preview
      </p>

      {/* Basic File Upload */}
      <Card title="Basic File Upload" subtitle="Single file upload with default settings">
        <FileUpload
          label="Upload a file"
          onChange={setFiles1}
          value={files1}
          onError={handleError}
        />
      </Card>

      {/* Multiple Files with Image Preview */}
      <Card 
        title="Multiple Image Upload" 
        subtitle="Upload multiple images with preview"
      >
        <FileUpload
          label="Upload images"
          accept="image/*"
          multiple
          maxFiles={5}
          onChange={setFiles2}
          value={files2}
          onError={handleError}
          preview={true}
        />
      </Card>

      {/* File Upload with Size Limit */}
      <Card 
        title="File Upload with Size Limit" 
        subtitle="Maximum 2MB per file, PDF and DOC only"
      >
        <FileUpload
          label="Upload documents"
          accept=".pdf,.doc,.docx"
          multiple
          maxSize={2 * 1024 * 1024} // 2MB
          maxFiles={3}
          onChange={setFiles3}
          value={files3}
          onError={handleError}
          preview={false}
        />
      </Card>

      {/* Disabled State */}
      <Card title="Disabled State" subtitle="File upload in disabled state">
        <FileUpload
          label="Upload disabled"
          disabled
          onChange={() => {}}
        />
      </Card>

      {/* Error State */}
      <Card title="Error State" subtitle="File upload with error message">
        <FileUpload
          label="Upload with error"
          error="This field is required"
          onChange={() => {}}
        />
      </Card>

      {/* Global Error Display */}
      {error && (
        <div className={styles.errorBanner}>
          {error}
        </div>
      )}

      {/* Features List */}
      <Card title="Features" subtitle="FileUpload component capabilities">
        <ul className={styles.featureList}>
          <li>✅ Click to upload or drag-and-drop files</li>
          <li>✅ Single or multiple file selection</li>
          <li>✅ File type validation (accept prop)</li>
          <li>✅ File size validation (maxSize prop)</li>
          <li>✅ Maximum files limit (maxFiles prop)</li>
          <li>✅ Image preview for image files</li>
          <li>✅ Upload progress indicator</li>
          <li>✅ File removal functionality</li>
          <li>✅ Light and dark mode support</li>
          <li>✅ Fully accessible with ARIA labels</li>
          <li>✅ Keyboard navigation support</li>
          <li>✅ Responsive design (mobile, tablet, desktop)</li>
          <li>✅ RTL layout support</li>
          <li>✅ Disabled state</li>
          <li>✅ Error state with validation messages</li>
        </ul>
      </Card>

      {/* Props Documentation */}
      <Card title="Props" subtitle="Available props for FileUpload component">
        <div className={styles.propsTable}>
          <table>
            <thead>
              <tr>
                <th>Prop</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><code>label</code></td>
                <td>string</td>
                <td>-</td>
                <td>Label text for the upload area</td>
              </tr>
              <tr>
                <td><code>accept</code></td>
                <td>string</td>
                <td>-</td>
                <td>Accepted file types (e.g., 'image/*', '.pdf,.doc')</td>
              </tr>
              <tr>
                <td><code>multiple</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Allow multiple file selection</td>
              </tr>
              <tr>
                <td><code>maxSize</code></td>
                <td>number</td>
                <td>5242880</td>
                <td>Maximum file size in bytes (default: 5MB)</td>
              </tr>
              <tr>
                <td><code>maxFiles</code></td>
                <td>number</td>
                <td>-</td>
                <td>Maximum number of files allowed</td>
              </tr>
              <tr>
                <td><code>onChange</code></td>
                <td>function</td>
                <td>required</td>
                <td>Callback when files are selected (receives File[] array)</td>
              </tr>
              <tr>
                <td><code>onError</code></td>
                <td>function</td>
                <td>-</td>
                <td>Callback when validation error occurs</td>
              </tr>
              <tr>
                <td><code>disabled</code></td>
                <td>boolean</td>
                <td>false</td>
                <td>Disabled state</td>
              </tr>
              <tr>
                <td><code>error</code></td>
                <td>string</td>
                <td>-</td>
                <td>Error message to display</td>
              </tr>
              <tr>
                <td><code>preview</code></td>
                <td>boolean</td>
                <td>true</td>
                <td>Show image preview for image files</td>
              </tr>
              <tr>
                <td><code>value</code></td>
                <td>File[]</td>
                <td>[]</td>
                <td>Controlled value (array of File objects)</td>
              </tr>
              <tr>
                <td><code>className</code></td>
                <td>string</td>
                <td>-</td>
                <td>Additional CSS classes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default FileUploadDemo;
