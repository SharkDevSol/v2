import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Worksheet = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [subjects] = useState(['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics', 'ICT', 'Amharic', 'Arabic', 'Afaan Oromo', 'Business', 'Economics', 'General Science']);
  const [form, setForm] = useState({ topic: '', grade: '', subject: '', chapter: '', language: 'English' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { axios.get('/api/ai/list-classes').then(r => setClasses(r.data.data?.classes || [])).catch(() => {}); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post('/api/ai/generate-worksheet', form);
      setResult(res.data.data?.worksheet || res.data.data);
    } catch (err) { setError(err.response?.data?.error || 'Generation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate('/ai-lesson')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '4px 0', marginBottom: 12 }}>← Back to AI Tools</button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Worksheet Generator</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Generate printable classroom worksheets using DeepSeek AI</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <input name="topic" placeholder="Topic *" value={form.topic} onChange={handleChange} required style={inputStyle} />
        <select name="grade" value={form.grade} onChange={handleChange} required style={inputStyle}>
          <option value="">Select Grade *</option>
          {classes.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>
        <select name="subject" value={form.subject} onChange={handleChange} required style={inputStyle}>
          <option value="">Select Subject *</option>
          {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <input name="chapter" placeholder="Chapter (optional)" value={form.chapter} onChange={handleChange} style={inputStyle} />
        <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
          <option>English</option><option>Afaan Oromo</option><option>Arabic</option><option>Amharic</option>
        </select>
        <div></div>
        <button type="submit" disabled={loading} style={{ gridColumn: '1 / -1', padding: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Generating...' : 'Generate Worksheet'}
        </button>
      </form>

      {error && <div style={{ padding: 12, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div><h2 style={{ fontSize: 20, fontWeight: 600, color: '#1e293b' }}>{result.topic}</h2>
              <p style={{ color: '#64748b', fontSize: 13 }}>Name: {result.studentName} &nbsp;&nbsp; Date: {result.date}</p></div>
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={badgeStyle}>{result.grade}</span>
              <span style={badgeStyle}>{result.subject}</span>
            </div>
          </div>

          <p style={{ color: '#475569', marginBottom: 20, fontStyle: 'italic' }}>{result.instructions}</p>

          {result.sections?.map((sec, si) => (
            <div key={si} style={{ marginBottom: 24, padding: 16, background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#667eea', marginBottom: 4 }}>{sec.title}</h3>
              <p style={{ color: '#64748b', fontSize: 13, marginBottom: 12 }}>{sec.instructions}</p>
              {sec.questions?.map((q, qi) => (
                <div key={qi} style={{ marginBottom: 10, padding: 8, borderBottom: '1px dashed #e2e8f0' }}>
                  <p style={{ color: '#334155', fontSize: 14 }}>{qi + 1}. {q.question}</p>
                  <p style={{ color: '#94a3b8', fontSize: 12, marginTop: 2 }}>Answer: {q.answer}</p>
                </div>
              ))}
            </div>
          ))}

          {result.bonusChallenge && (
            <div style={{ padding: 16, background: '#fef9c3', borderRadius: 8, border: '1px solid #fde68a' }}>
              <p style={{ fontWeight: 600, color: '#92400e' }}>⭐ Bonus Challenge</p>
              <p style={{ color: '#78350f' }}>{result.bonusChallenge}</p>
            </div>
          )}
          <button onClick={() => window.print()} style={{ marginTop: 16, padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🖨️ Print</button>
        </div>
      )}
    </div>
  );
};

const inputStyle = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const badgeStyle = { padding: '4px 12px', background: '#eff6ff', color: '#3b82f6', borderRadius: 16, fontSize: 13, fontWeight: 500 };

export default Worksheet;
