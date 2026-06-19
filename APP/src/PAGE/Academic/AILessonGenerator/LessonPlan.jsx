import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const LessonPlan = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState([]);
  const [subjects] = useState(['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics', 'ICT', 'Amharic', 'Arabic', 'Afaan Oromo', 'Business', 'Economics', 'General Science']);
  const [form, setForm] = useState({ topic: '', grade: '', subject: '', chapter: '', duration: 40, language: 'English' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { axios.get('/api/ai/list-classes').then(r => setClasses(r.data.data?.classes || [])).catch(() => {}); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await axios.post('/api/ai/generate-lesson-plan', form);
      setResult(res.data.data?.lessonPlan || res.data.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: 24 }}>
      <button onClick={() => navigate('/ai-lesson')} style={{ background: 'none', border: 'none', color: '#667eea', cursor: 'pointer', fontSize: 14, fontWeight: 500, padding: '4px 0', marginBottom: 12 }}>← Back to AI Tools</button>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>Lesson Plan Generator</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Generate professional lesson plans using DeepSeek AI</p>

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
        <input name="duration" type="number" placeholder="Duration in minutes" value={form.duration} onChange={handleChange} style={inputStyle} />
        <select name="language" value={form.language} onChange={handleChange} style={inputStyle}>
          <option>English</option>
          <option>Afaan Oromo</option>
          <option>Arabic</option>
          <option>Amharic</option>
        </select>
        <button type="submit" disabled={loading} style={{ gridColumn: '1 / -1', padding: 12, background: 'linear-gradient(135deg, #667eea, #764ba2)', color: 'white', border: 'none', borderRadius: 8, fontSize: 16, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'Generating...' : 'Generate Lesson Plan'}
        </button>
      </form>

      {error && <div style={{ padding: 12, background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16 }}>{error}</div>}

      {result && (
        <div style={{ background: 'white', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#667eea', marginBottom: 16 }}>{result.title}</h2>
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={badgeStyle}>Grade: {result.grade}</span>
            <span style={badgeStyle}>Subject: {result.subject}</span>
            <span style={badgeStyle}>Duration: {result.duration}</span>
          </div>

          <Section title="Learning Objectives">
            {result.learningObjectives?.map((o, i) => <li key={i} style={liStyle}>{o}</li>)}
          </Section>

          <Section title="Required Materials">
            {result.requiredMaterials?.map((m, i) => <li key={i} style={liStyle}>{m}</li>)}
          </Section>

          <Section title="Introduction">
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{result.introduction}</p>
          </Section>

          <Section title="Main Activities">
            {result.mainActivities?.map((a, i) => (
              <div key={i} style={{ marginBottom: 16, padding: 12, background: '#f8fafc', borderRadius: 8 }}>
                <p style={{ fontWeight: 600, color: '#334155' }}>Step {a.step} — {a.duration}</p>
                <p style={{ color: '#475569', marginTop: 4 }}><strong>Teacher:</strong> {a.teacherActivity}</p>
                <p style={{ color: '#475569', marginTop: 2 }}><strong>Student:</strong> {a.studentActivity}</p>
              </div>
            ))}
          </Section>

          <Section title="Assessment">
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{result.assessmentMethods}</p>
          </Section>

          <Section title="Summary">
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{result.summary}</p>
          </Section>

          <Section title="Homework">
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{result.homework}</p>
          </Section>

          <Section title="Teacher Notes">
            <p style={{ color: '#475569', lineHeight: 1.6 }}>{result.teacherNotes}</p>
          </Section>

          <button onClick={() => window.print()} style={{ marginTop: 16, padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}>🖨️ Print</button>
        </div>
      )}
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 20 }}>
    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1e293b', marginBottom: 8, paddingBottom: 4, borderBottom: '2px solid #667eea' }}>{title}</h3>
    {children}
  </div>
);

const inputStyle = {
  padding: '10px 14px',
  border: '1px solid #e2e8f0',
  borderRadius: 8,
  fontSize: 14,
  outline: 'none',
  width: '100%',
  boxSizing: 'border-box',
};

const badgeStyle = {
  padding: '4px 12px',
  background: '#eff6ff',
  color: '#3b82f6',
  borderRadius: 16,
  fontSize: 13,
  fontWeight: 500,
};

const liStyle = {
  color: '#475569',
  marginBottom: 4,
  lineHeight: 1.5,
};

export default LessonPlan;
