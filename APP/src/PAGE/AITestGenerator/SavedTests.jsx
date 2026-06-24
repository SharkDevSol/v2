import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const branchHeaders = () => ({ 'x-branch-code': (localStorage.getItem('branchCode') || '').toUpperCase() });

const SavedTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => { fetchTests(); }, []);

  const fetchTests = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/list-tests`, { headers: branchHeaders() });
      const data = await res.json();
      if (data.success) setTests(data.data || []);
    } catch (e) {
      console.error('Error fetching tests:', e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>Saved Tests & Exams</h1>
          <p style={{ color: '#6b7280', margin: '0.5rem 0 0' }}>All AI-generated tests and exams</p>
        </div>
        <button onClick={() => navigate('/ai-test-generator')} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
          + Generate New Test
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#6b7280' }}>Loading saved tests...</div>
      ) : tests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', background: '#f9fafb', borderRadius: '12px' }}>
          <p style={{ fontSize: '1.2rem', color: '#6b7280' }}>No saved tests yet</p>
          <p style={{ color: '#9ca3af', marginBottom: '1.5rem' }}>Generate a test using the AI Test Generator and save it to see it here.</p>
          <button onClick={() => navigate('/ai-test-generator')} style={{ padding: '12px 24px', borderRadius: '8px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontWeight: 600 }}>
            Generate Your First Test
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', background: '#f9fafb' }}>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>Subject</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>Class</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>Term</th>
                <th style={{ padding: '14px 16px', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>Component</th>
                <th style={{ padding: '14px 16px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>Questions</th>
                <th style={{ padding: '14px 16px', textAlign: 'right', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tests.map((test, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '14px 16px', fontWeight: 500 }}>{test.subject}</td>
                  <td style={{ padding: '14px 16px' }}>{test.className.replace(/([a-z])(\d)/gi, '$1 $2')}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>{test.termNumber}</td>
                  <td style={{ padding: '14px 16px' }}>{test.componentName}</td>
                  <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                    <span style={{ background: '#dbeafe', borderRadius: '12px', padding: '2px 10px', fontSize: '0.85rem', fontWeight: 600 }}>{test.questionCount}</span>
                  </td>
                  <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                    <button onClick={() => navigate(`/ai-test-player?subject=${encodeURIComponent(test.subject)}&class=${encodeURIComponent(test.className)}&term=${test.termNumber}&component=${encodeURIComponent(test.componentName)}`)}
                      style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', background: '#2563eb', color: 'white', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                      Take Test
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SavedTests;
