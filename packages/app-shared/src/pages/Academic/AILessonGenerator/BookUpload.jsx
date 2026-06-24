import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BookUpload = () => {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ subject: '', grade: '', chapter: '', description: '' });
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { loadBooks(); }, []);

  const loadBooks = async () => {
    try { const r = await axios.get('/api/books'); setBooks(r.data.data || []); } catch(e) {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMessage('Select a file');
    setLoading(true); setMessage('');
    const fd = new FormData();
    fd.append('file', file);
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    try {
      await axios.post('/api/books/upload', fd);
      setMessage('✅ Book uploaded successfully!');
      setFile(null); setForm({ subject: '', grade: '', chapter: '', description: '' });
      loadBooks();
    } catch (err) { setMessage('❌ ' + (err.response?.data?.error || err.message)); }
    finally { setLoading(false); }
  };

  const handleDelete = async (id) => {
    try { await axios.delete(`/api/books/${id}`); loadBooks(); } catch(e) {}
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate('/ai-lesson')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '4px 0', marginBottom: 12 }}>← Back to AI Tools</button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Book & Syllabus Upload</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Upload textbooks and syllabi — AI uses these as context for generation</p>

      <form onSubmit={handleSubmit} style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <div>
            <label style={labelStyle}>File * (PDF, TXT, DOC)</label>
            <input type="file" accept=".pdf,.txt,.doc,.docx" onChange={e => setFile(e.target.files[0])} style={inputStyle} />
          </div>
          <input name="subject" placeholder="Subject (e.g., Mathematics)" value={form.subject} onChange={e => setForm({...form, subject: e.target.value})} style={inputStyle} />
          <input name="grade" placeholder="Grade (e.g., Grade 10)" value={form.grade} onChange={e => setForm({...form, grade: e.target.value})} style={inputStyle} />
          <input name="chapter" placeholder="Chapter (optional)" value={form.chapter} onChange={e => setForm({...form, chapter: e.target.value})} style={inputStyle} />
          <textarea name="description" placeholder="Description (optional)" value={form.description} onChange={e => setForm({...form, description: e.target.value})} style={{ ...inputStyle, gridColumn: '1 / -1', minHeight: 60 }} />
        </div>
        <button type="submit" disabled={loading} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Uploading...' : '📤 Upload Book'}
        </button>
        {message && <p style={{ marginTop: 12, color: message.includes('✅') ? '#059669' : '#dc2626' }}>{message}</p>}
      </form>

      <h2 style={{ fontSize: 18, fontWeight: 600, color: '#1e293b', marginBottom: 12 }}>Uploaded Books ({books.length})</h2>
      {books.length === 0 && <p style={{ color: '#94a3b8' }}>No books uploaded yet</p>}
      {books.map(b => (
        <div key={b.id} style={{ background: 'white', borderRadius: 8, padding: 16, marginBottom: 8, border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ fontWeight: 600, color: '#1e293b' }}>{b.name}</p>
            <p style={{ fontSize: 13, color: '#64748b' }}>{b.subject && `${b.subject} • `}{b.grade && `${b.grade} • `}{b.file_size && `${(b.file_size / 1024).toFixed(0)} KB`}</p>
          </div>
          <button onClick={() => handleDelete(b.id)} style={{ padding: '6px 14px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, cursor: 'pointer', fontSize: 13 }}>Delete</button>
        </div>
      ))}
    </div>
  );
};

const labelStyle = { display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 4 };
const inputStyle = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };

export default BookUpload;
