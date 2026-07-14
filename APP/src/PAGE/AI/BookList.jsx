import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiBook, FiUpload, FiRefreshCw, FiTrash2, FiFileText, FiClock, FiLoader } from 'react-icons/fi';
import styles from './AIDashboard.module.css';

export default function BookList() {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchBooks = () => {
    setLoading(true);
    axios.get('/api/ai/books').then(r => { setBooks(r.data.data); }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchBooks(); }, []);

  const deleteBook = async (id, title) => {
    if (!confirm(`Delete "${title}" and all its chunks?`)) return;
    await axios.delete(`/api/ai/books/${id}`);
    setBooks(prev => prev.filter(b => b.id !== id));
  };

  const reindexBook = async (id) => {
    await axios.post(`/api/ai/books/${id}/reindex`);
    alert('Reindexing started');
  };

  const totalChunks = books.reduce((sum, b) => sum + (b.total_chunks || 0), 0);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FiBook /></div>
          <div>
            <h1>Uploaded Books</h1>
            <p>{books.length} book(s) · {totalChunks} total chunks</p>
          </div>
        </div>
        <div className={styles.headerStats}>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{books.length}</span>
            <span className={styles.statLabel}>Books</span>
          </div>
          <div className={styles.statBox}>
            <span className={styles.statNum}>{totalChunks}</span>
            <span className={styles.statLabel}>Chunks</span>
          </div>
        </div>
      </div>

      <div className={styles.controls}>
        <div style={{flex:1}} />
        <button className={styles.genBtn} onClick={() => navigate('/ai/books/upload')} style={{padding:'10px 20px'}}>
          <FiUpload /> Upload Books
        </button>
        <button className={styles.toolBtn} onClick={fetchBooks}>
          <FiRefreshCw className={loading ? styles.spin : ''} /> Refresh
        </button>
      </div>

      {loading ? (
        <div className={styles.skeleton} style={{height:200}}><div className={styles.shimmer} /></div>
      ) : books.length === 0 ? (
        <div className={styles.empty}>
          <FiBook className={styles.emptyIcon} />
          <h3 style={{margin:'12px 0 8px',color:'var(--text-color)'}}>No books uploaded yet</h3>
          <p>Upload your first book to start generating AI content</p>
          <button className={styles.genBtn} onClick={() => navigate('/ai/books/upload')} style={{marginTop:16,padding:'12px 24px'}}>
            <FiUpload /> Upload Books
          </button>
        </div>
      ) : (
        <div className={styles.section} style={{padding:0,overflow:'hidden'}}>
          <table className={styles.bookTable || ''} style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'var(--bg-secondary)',textAlign:'left'}}>
                <th style={{padding:'14px 20px',fontSize:'0.85rem',fontWeight:600,color:'var(--text-color)',textTransform:'uppercase'}}>Title</th>
                <th style={{padding:'14px 20px',fontSize:'0.85rem',fontWeight:600,color:'var(--text-color)',textTransform:'uppercase'}}>Grade</th>
                <th style={{padding:'14px 20px',fontSize:'0.85rem',fontWeight:600,color:'var(--text-color)',textTransform:'uppercase'}}>Subject</th>
                <th style={{padding:'14px 20px',fontSize:'0.85rem',fontWeight:600,color:'var(--text-color)',textTransform:'uppercase'}}>Chunks</th>
                <th style={{padding:'14px 20px',fontSize:'0.85rem',fontWeight:600,color:'var(--text-color)',textTransform:'uppercase'}}>Language</th>
                <th style={{padding:'14px 20px',fontSize:'0.85rem',fontWeight:600,color:'var(--text-color)',textTransform:'uppercase'}}>Status</th>
                <th style={{padding:'14px 20px',fontSize:'0.85rem',fontWeight:600,color:'var(--text-color)',textTransform:'uppercase'}}>Date</th>
                <th style={{padding:'14px 20px',fontSize:'0.85rem',fontWeight:600,color:'var(--text-color)',textTransform:'uppercase'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {books.map(b => (
                <tr key={b.id} style={{borderTop:'1px solid var(--border-color)'}}>
                  <td style={{padding:'14px 20px',fontWeight:500,color:'var(--text-color)'}}><FiFileText style={{marginRight:8,color:'var(--color-primary)'}} />{b.title}</td>
                  <td style={{padding:'14px 20px',color:'var(--text-color)'}}>{b.grade}</td>
                  <td style={{padding:'14px 20px',color:'var(--text-color)'}}>{b.subject}</td>
                  <td style={{padding:'14px 20px',color:'var(--text-color)'}}>{b.total_chunks || 0}</td>
                  <td style={{padding:'14px 20px',color:'var(--text-color)'}}>{b.language || 'English'}</td>
                  <td style={{padding:'14px 20px'}}>
                    <span className={styles.featureBadge}>{b.status || 'pending'}</span>
                  </td>
                  <td style={{padding:'14px 20px',color:'var(--text-muted)',fontSize:'0.85rem'}}>
                    {new Date(b.created_at).toLocaleDateString()}
                  </td>
                  <td style={{padding:'14px 20px'}}>
                    <button onClick={() => reindexBook(b.id)} className={`${styles.toolBtn}`} style={{padding:'6px 10px',marginRight:4}} title="Reindex"><FiRefreshCw size={14} /></button>
                    <button onClick={() => deleteBook(b.id, b.title)} className={`${styles.toolBtn}`} style={{padding:'6px 10px',color:'var(--color-danger)'}} title="Delete"><FiTrash2 size={14} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
