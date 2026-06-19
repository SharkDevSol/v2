import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ScrambleExam = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [subjects] = useState(['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics', 'ICT', 'Amharic', 'Arabic', 'Afaan Oromo', 'Business', 'Economics', 'General Science']);
  const [form, setForm] = useState({ topic: '', grade: '', subject: '', chapter: '', totalMarks: 50, timeLimit: 60, difficulty: 'Medium', language: 'English' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { axios.get('/api/ai/list-classes').then(r => setClasses(r.data.data?.classes || [])).catch(() => {}); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post('/api/ai/generate-scramble-exam', form);
      setResult(res.data.data?.scrambleExam || res.data.data);
    } catch (err) { setError(err.response?.data?.error || 'Generation failed'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 950, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate('/ai-lesson')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '4px 0', marginBottom: 12 }}>← Back to AI Tools</button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Scramble Exam Generator</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Generate exams with 3 shuffled versions (A, B, C) for anti-cheating</p>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        <input name="topic" placeholder="Topic *" value={form.topic} onChange={handleChange} required style={inputStyle} />
        <select name="grade" value={form.grade} onChange={handleChange} required style={inputStyle}>
          <option value="">Select Grade *</option>
          {classes.map((c, i) => <option key={i} value={c}>{c}</option>)}
        </select>
        <select name="subject" value={form.subject} onChange={handleChange} required style={inputStyle}>
          <option value="">Select Subject *</option>
          {subjects.map((s, i) => <option key={i} value={s}>{s}</option>)}
        </select>
        <input name="chapter" placeholder="Chapter" value={form.chapter} onChange={handleChange} style={inputStyle} />
        <input name="totalMarks" type="number" placeholder="Total Marks" value={form.totalMarks} onChange={handleChange} style={inputStyle} />
        <input name="timeLimit" type="number" placeholder="Time (min)" value={form.timeLimit} onChange={handleChange} style={inputStyle} />
        <select name="difficulty" value={form.difficulty} onChange={handleChange} style={inputStyle}>
          <option>Easy</option><option>Medium</option><option>Hard</option>
        </select>
        <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
          <option>English</option><option>Afaan Oromo</option><option>Arabic</option><option>Amharic</option>
        </select>
        <button type="submit" disabled={loading} style={{ padding: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Generating...' : 'Generate Scramble Exam'}
        </button>
      </form>

      {error && <div style={{ padding: 12, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result && (
        <div>
          <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 }}>
            <h2 style={{ fontSize: 20, fontWeight: 600, color: '#667eea' }}>{result.title}</h2>
            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={badgeStyle}>Grade: {result.grade}</span>
              <span style={badgeStyle}>{result.subject}</span>
              <span style={badgeStyle}>{result.totalMarks} marks</span>
              <span style={badgeStyle}>{result.timeLimit} min</span>
            </div>
            <p style={{ color: '#64748b', marginTop: 8, fontSize: 14 }}>{result.instructions}</p>

            {result.versions && Object.entries(result.versions).map(([vKey, ver]) => (
              <div key={vKey} style={{ marginTop: 24, padding: 16, border: '1px solid #e2e8f0', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: vKey === 'A' ? '#667eea' : vKey === 'B' ? '#10b981' : '#f59e0b' }}>{ver.label}</h3>
                  <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: 4, fontSize: 12, color: '#64748b' }}>Answer Key below</span>
                </div>
                {ver.sections?.map((sec, si) => (
                  <div key={si} style={{ marginBottom: 12 }}>
                    <p style={{ fontWeight: 600, color: '#334155', fontSize: 14, marginBottom: 8 }}>Section {sec.section}: {sec.type}</p>
                    {sec.questions?.map((q, qi) => (
                      <div key={qi} style={{ padding: '6px 0', borderBottom: '1px dashed #f1f5f9' }}>
                        <p style={{ fontSize: 13, color: '#475569' }}>{q.id}. {q.question} <span style={{ color: '#94a3b8' }}>({q.marks} marks)</span></p>
                        {q.options?.map((opt, oi) => <p key={oi} style={{ fontSize: 12, color: '#64748b', marginLeft: 16 }}>{opt}</p>)}
                        <p style={{ fontSize: 11, color: '#059669', marginTop: 2 }}>Answer: {q.correctAnswer}</p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ))}

            {result.answerKey && (
              <details style={{ marginTop: 16 }}>
                <summary style={{ color: '#667eea', cursor: 'pointer', fontWeight: 600 }}>📋 Master Answer Key</summary>
                <pre style={{ background: '#1e293b', color: '#e2e8f0', padding: 16, borderRadius: 8, marginTop: 8, fontSize: 12 }}>{JSON.stringify(result.answerKey, null, 2)}</pre>
              </details>
            )}
            <button onClick={() => window.print()} style={{ marginTop: 16, padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🖨️ Print</button>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = { padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14, outline: 'none', width: '100%', boxSizing: 'border-box' };
const badgeStyle = { padding: '4px 12px', background: '#eff6ff', color: '#3b82f6', borderRadius: 16, fontSize: 13, fontWeight: 500 };

export default ScrambleExam;
