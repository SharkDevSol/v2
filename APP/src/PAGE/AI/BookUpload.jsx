import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiUpload, FiFile, FiCheck, FiX, FiLoader, FiBook, FiTrash2 } from 'react-icons/fi';
import styles from './AIDashboard.module.css';

export default function BookUpload() {
  const [files, setFiles] = useState([]); const [uploading, setUploading] = useState(false);
  const [metadata, setMetadata] = useState({ grade: '', subject: '', language: 'English' });
  const [results, setResults] = useState(null); const fileRef = useRef(null); const navigate = useNavigate();
  const [classList, setClassList] = useState([]); const [subjectList, setSubjectList] = useState([]);

  useEffect(() => {
    axios.get('/api/ai/list-classes').then(r => {
      setClassList(r.data.data.classes || []);
      setSubjectList(r.data.data.subjects || []);
    }).catch(() => {});
  }, []);

  const handleDrop = (e) => { e.preventDefault(); setFiles(prev => [...prev, ...[...e.dataTransfer.files].map(f => ({ file: f, status: 'pending', progress: 0 }))]); };
  const removeFile = (i) => setFiles(prev => prev.filter((_, idx) => idx !== i));

  const handleUpload = async () => {
    if (files.length === 0) return; setUploading(true);
    const formData = new FormData();
    files.forEach(({ file }) => formData.append('files', file));
    formData.append('metadata', JSON.stringify(metadata));
    try {
      const res = await axios.post('/api/ai/books/upload', formData, { onUploadProgress: (e) => { if (e.total) setFiles(prev => prev.map(f => ({ ...f, progress: Math.round((e.loaded / e.total) * 100) }))); } });
      setResults(res.data); setFiles([]);
    } catch (err) { alert('Upload failed: ' + (err.response?.data?.error || err.message)); } finally { setUploading(false); }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FiUpload /></div>
          <div><h1>Upload Books</h1><p>Upload textbooks, teacher guides, and reference materials for AI content generation</p></div>
        </div>
      </div>

      <div className={styles.uploadGrid}>
        <div className={styles.dropArea} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => fileRef.current?.click()} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileRef.current?.click(); } }}>
          <FiUpload className={styles.dropIcon} />
          <p className={styles.dropText}>Drag & drop files here, or click to browse</p>
          <p className={styles.dropHint}>PDF, DOCX, PPTX, TXT — Max 100MB per file</p>
          <input ref={fileRef} type="file" multiple hidden onChange={(e) => setFiles(prev => [...prev, ...[...e.target.files].map(f => ({ file: f, status: 'pending', progress: 0 }))])} accept=".pdf,.docx,.pptx,.txt" />
        </div>
        <div className={styles.uploadMeta}>
          <h3 className={styles.sectionTitle}>Book Metadata</h3>
          <label className={styles.formLabel}>Grade
            <select className={styles.formSelect} value={metadata.grade} onChange={e => setMetadata({...metadata, grade: e.target.value})}>
              <option value="">Select Grade</option>
              {classList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className={styles.formLabel}>Subject
            <select className={styles.formSelect} value={metadata.subject} onChange={e => setMetadata({...metadata, subject: e.target.value})}>
              <option value="">Select Subject</option>
              {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className={styles.formCard} style={{marginTop:24}}>
          {files.map((f, i) => (
            <div key={i} className={styles.bookRow}>
              <FiFile className={styles.actionBtn} style={{color:'var(--color-primary)'}} />
              <span className={styles.bookTitle}>{f.file.name}</span>
              <span className={styles.bookMeta}>{(f.file.size / 1024 / 1024).toFixed(1)} MB</span>
              <button className={`${styles.actionBtn} ${styles.actionDelete}`} onClick={() => removeFile(i)}><FiX /></button>
            </div>
          ))}
          <button className={styles.genBtn} onClick={handleUpload} disabled={uploading}>
            {uploading ? <><FiLoader className={styles.spin} /> Uploading...</> : <><FiUpload /> Upload {files.length} File(s)</>}
          </button>
        </div>
      )}

      {results && (
        <div className={styles.section} style={{textAlign:'center',marginTop:24}}>
          <FiCheck style={{fontSize:40,color:'var(--color-success)',marginBottom:12}} />
          <h3>Upload Complete</h3>
          <p>{results.data.length} file(s) uploaded and indexed</p>
          <div style={{display:'flex',gap:12,justifyContent:'center',marginTop:16}}>
            <button className={styles.genBtn} onClick={() => navigate('/ai/dashboard')}>Go to Dashboard</button>
            <button className={styles.toolBtn} onClick={() => setResults(null)}>Upload More</button>
          </div>
        </div>
      )}
    </div>
  );
}
