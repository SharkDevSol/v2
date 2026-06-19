import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Homework = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [subjects] = useState(['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics', 'ICT', 'Amharic', 'Arabic', 'Afaan Oromo', 'Business', 'Economics', 'General Science']);
  const [form, setForm] = useState({ topic: '', grade: '', subject: '', chapter: '', difficulty: 'Medium', language: 'English', count: 5 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { axios.get('/api/ai/list-classes').then(r => setClasses(r.data.data?.classes || [])).catch(() => {}); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post('/api/ai/generate-homework', form);
      setResult(res.data.data?.homework || res.data.data);
    } catch (err) { setError(err.response?.data?.error || 'Generation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate('/ai-lesson')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '4px 0', marginBottom: 12 }}>← Back to AI Tools</button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Homework Generator</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Generate homework assignments using DeepSeek AI</p>

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
        <select name="difficulty" value={form.difficulty} onChange={handleChange} style={inputStyle}>
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
          <option>English</option><option>Afaan Oromo</option><option>Arabic</option><option>Amharic</option>
        </select>
        <input name="count" type="number" placeholder="Questions per type" value={form.count} onChange={handleChange} style={inputStyle} min="1" max="20" />
        <button type="submit" disabled={loading} style={{ gridColumn: '1 / -1', padding: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Generating...' : 'Generate Homework'}
        </button>
      </form>

      {error && <div style={{ padding: 12, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#667eea', marginBottom: 4 }}>{result.topic}</h2>
          <p style={{ color: '#64748b', marginBottom: 16 }}>{result.instructions}</p>
          <div style={{ display: 'flex', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
            <span style={badgeStyle}>Grade: {result.grade}</span>
            <span style={badgeStyle}>Subject: {result.subject}</span>
            <span style={badgeStyle}>Total: {result.totalQuestions} questions</span>
          </div>

          {result.questions?.map((q, i) => (
            <div key={i} style={{ marginBottom: 16, padding: 16, background: '#f8fafc', borderRadius: 8, borderLeft: '4px solid #667eea' }}>
              <p style={{ fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>Q{i + 1}. {q.question}</p>
              {q.options?.map((opt, j) => <p key={j} style={{ color: '#475569', marginLeft: 16, fontSize: 14 }}>{opt}</p>)}
              <details style={{ marginTop: 8 }}>
                <summary style={{ color: '#667eea', cursor: 'pointer', fontSize: 13 }}>Show Answer</summary>
                <p style={{ color: '#059669', fontSize: 13, marginTop: 4 }}>Answer: {q.correctAnswer || q.answer}</p>
                {q.explanation && <p style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>{q.explanation}</p>}
              </details>
            </div>
          ))}

          {result.answerKey && (
            <details style={{ marginTop: 16 }}>
              <summary style={{ color: '#667eea', cursor: 'pointer', fontWeight: 600 }}>📋 Answer Key (Teachers only)</summary>
              <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: 16, borderRadius: 8, marginTop: 8, fontSize: 13, whiteSpace: 'pre-wrap' }}>{typeof result.answerKey === 'string' ? result.answerKey : JSON.stringify(result.answerKey, null, 2)}</pre>
            </details>
          )}
          <button onClick={() => window.print()} style={{ marginTop: 16, padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🖨️ Print</button>
        </div>
      )}
    </div>
  );
};

const inputStyle = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const badgeStyle = { padding: '4px 12px', background: '#eff6ff', color: '#3b82f6', borderRadius: 16, fontSize: 13, fontWeight: 500 };

export default Homework;
