import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CONTENT_MODES } from './contentModes';
import styles from './AIContentGenerator.module.css';

const MODE_LABELS = Object.fromEntries(CONTENT_MODES.map(m => [m.id, m]));
const STATUS_OPTIONS = ['draft', 'approved', 'archived'];

const SavedContent = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ mode: '', status: '' });
  const [deleting, setDeleting] = useState(null);

  const fetchItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const teacherId = localStorage.getItem('staffId') || localStorage.getItem('userId') || 1;
      const params = { teacher_id: teacherId };
      if (filters.mode) params.mode = filters.mode;
      if (filters.status) params.status = filters.status;

      const res = await axios.get('/api/ai-content', { params });
      setItems(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load saved content');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [filters]);

  const handleDelete = async (id) => {
    if (!window.confirm('Archive this content?')) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/ai-content/${id}`);
      setItems(prev => prev.map(item =>
        item.id === id ? { ...item, status: 'archived' } : item
      ));
    } catch (err) {
      alert('Failed to archive: ' + (err.response?.data?.message || err.message));
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getModeLabel = (mode) => {
    const m = MODE_LABELS[mode];
    return m ? `${m.icon} ${m.title}` : mode;
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'approved': return styles.statusApproved;
      case 'archived': return styles.statusArchived;
      default: return styles.statusDraft;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate('/ai-content')}>
          ← Back
        </button>
        <h1 className={styles.title}>My Saved Content</h1>
        <p className={styles.subtitle}>Browse and manage your AI-generated teaching content.</p>
      </div>

      <div className={styles.filterBar}>
        <select
          className={styles.filterSelect}
          value={filters.mode}
          onChange={(e) => setFilters(f => ({ ...f, mode: e.target.value }))}
        >
          <option value="">All Modes</option>
          {CONTENT_MODES.map(m => (
            <option key={m.id} value={m.id}>{m.icon} {m.title}</option>
          ))}
        </select>

        <select
          className={styles.filterSelect}
          value={filters.status}
          onChange={(e) => setFilters(f => ({ ...f, status: e.target.value }))}
        >
          <option value="">All Status</option>
          {STATUS_OPTIONS.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>

        <button className={styles.toolButton} onClick={fetchItems}>↻ Refresh</button>
      </div>

      {loading && (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading saved content...</p>
        </div>
      )}

      {error && <div className={styles.errorBox}>{error}</div>}

      {!loading && !error && items.length === 0 && (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>📂</div>
          <h3>No Saved Content</h3>
          <p>Generate your first lesson plan, homework, or exam to see it here.</p>
          <button className={styles.generateButton} onClick={() => navigate('/ai-content')}>
            Create New Content
          </button>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className={styles.contentList}>
          {items.map(item => (
            <div key={item.id} className={styles.contentCard}>
              <div className={styles.contentCardHeader}>
                <span className={styles.contentMode}>{getModeLabel(item.mode)}</span>
                <span className={`${styles.contentStatus} ${getStatusClass(item.status)}`}>
                  {item.status}
                </span>
              </div>

              <div className={styles.contentCardBody}>
                <p className={styles.contentTopic}>
                  {item.config?.topic || item.config?.chapter || `Content #${item.id}`}
                </p>
                {item.subject && <p className={styles.contentMeta}>{item.grade} — {item.subject}</p>}
                {item.chapter && <p className={styles.contentMeta}>Chapter: {item.chapter}</p>}
                <p className={styles.contentDate}>Created: {formatDate(item.created_at)}</p>
              </div>

              <div className={styles.contentCardActions}>
                <span className={styles.contentVersion}>v{item.version}</span>
                <button
                  className={styles.toolButton}
                  onClick={() => navigate(`/ai-content/${item.mode}`, { state: { contentId: item.id } })}
                >
                  View
                </button>
                <button
                  className={`${styles.toolButton} ${styles.deleteButton}`}
                  onClick={() => handleDelete(item.id)}
                  disabled={deleting === item.id || item.status === 'archived'}
                >
                  {deleting === item.id ? '...' : 'Archive'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SavedContent;
