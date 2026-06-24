import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const branchHeaders = () => ({ 'x-branch-code': (localStorage.getItem('branchCode') || '').toUpperCase() });

const TestPlayer = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const subject = params.get('subject');
  const className = params.get('class');
  const termNumber = params.get('term');
  const componentName = params.get('component');

  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!subject || !className || !termNumber || !componentName) return;
    fetch(`${API_BASE_URL}/ai/get-test?subject=${encodeURIComponent(subject)}&className=${encodeURIComponent(className)}&termNumber=${termNumber}&componentName=${encodeURIComponent(componentName)}`, { headers: branchHeaders() })
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          const decode = (s) => s.replace(/&#x2[fF];/g,'/').replace(/&#x27;/g,"'");
          const typeMap = { 'true/false':'true_false','true or false':'true_false','multiple choice':'mcq','mcq':'mcq','fill in the blank':'fill_blank','short answer':'short_answer','essay / open-ended':'essay','essay':'essay','matching':'matching','multiple true/false':'multiple_true_false','numeric':'numeric','transformation / error correction':'transformation','transformation':'transformation' };
          data.data.questions = data.data.questions.map(q => ({ ...q, type: typeMap[decode(q.type?.toLowerCase())] || q.type }));
          setTest(data.data);
        } else navigate('/ai-tests');
      })
      .catch(() => navigate('/ai-tests'))
      .finally(() => setLoading(false));
  }, [subject, className, termNumber, componentName]);

  const handleAnswer = (questionId, value) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const isAutoGraded = (type) => ['mcq', 'true_false', 'fill_blank', 'short_answer', 'transformation', 'matching'].includes(type);

  const handleSubmit = () => {
    let correct = 0;
    let totalAuto = 0;
    let manualCount = 0;
    test.questions.forEach(q => {
      const userAnswer = answers[q.id];
      if (!isAutoGraded(q.type)) {
        manualCount += q.marks;
        return;
      }
      totalAuto += q.marks;
      if (q.type === 'mcq' || q.type === 'true_false') {
        if (userAnswer && userAnswer.toLowerCase() === (q.answer || '').toLowerCase()) correct += q.marks;
      } else if (q.type === 'matching' && q.correctMatches) {
        let matchScore = 0;
        q.correctMatches.forEach(m => { if (userAnswer?.[m.left] === m.right) matchScore++; });
        const perMatch = q.marks / q.correctMatches.length;
        correct += Math.round(matchScore * perMatch);
      } else {
        if (userAnswer && userAnswer.toLowerCase().trim() === (q.answer || '').toLowerCase().trim()) correct += q.marks;
      }
    });
    setScore({ correct, total: totalAuto, autoTotal: totalAuto, manualTotal: manualCount, percentage: totalAuto > 0 ? Math.round((correct / totalAuto) * 100) : 0 });
    setSubmitted(true);
  };

  if (loading) return <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading test...</div>;
  if (!test) return <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Test not found</div>;

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ margin: 0 }}>{test.subject} - {test.className}</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0' }}>Term {test.termNumber} · {test.componentName} · {test.questions.length} questions · {test.totalMarks} marks</p>
        </div>
        <button onClick={() => navigate('/ai-tests')} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>← Back</button>
      </div>

      {submitted && score && (
        <div style={{ padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', background: '#dcfce7', border: '1px solid #86efac' }}>
          <h2 style={{ margin: 0 }}>Auto-graded Score: {score.correct} / {score.autoTotal} ({score.percentage}%)</h2>
          {score.manualTotal > 0 && (
            <p style={{ margin: '0.5rem 0 0', color: '#92400e' }}>
              ⏳ {score.manualTotal} marks in essay/optional questions require manual review by your teacher.
            </p>
          )}
        </div>
      )}

      {test.questions.map((q, i) => (
        <div key={q.id} style={{ background: 'white', borderRadius: '10px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ background: '#2563eb', color: 'white', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: 600, flexShrink: 0 }}>{i + 1}</span>
            <span style={{ background: '#f3e8ff', borderRadius: '6px', padding: '2px 10px', fontSize: '0.8rem', alignSelf: 'center' }}>{q.type} · {q.marks} mark{q.marks > 1 ? 's' : ''}</span>
            {submitted && q.answer && (
              <span style={{ background: answers[q.id]?.toLowerCase() === q.answer.toLowerCase() ? '#dcfce7' : '#fee2e2', borderRadius: '6px', padding: '2px 10px', fontSize: '0.8rem', alignSelf: 'center', fontWeight: 600 }}>
                {answers[q.id]?.toLowerCase() === q.answer.toLowerCase() ? '✓ Correct' : '✗ Incorrect'}
              </span>
            )}
          </div>
          <p style={{ margin: '0 0 0.75rem', fontSize: '1rem', lineHeight: '1.5' }}>{q.question}</p>

          {q.type === 'mcq' && q.options && q.options.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {q.options.map((opt, oi) => (
                <label key={oi} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1rem', borderRadius: '8px', border: `1.5px solid ${submitted ? (opt.toLowerCase() === q.answer.toLowerCase() ? '#22c55e' : answers[q.id] === opt ? '#ef4444' : '#e5e7eb') : answers[q.id] === opt ? '#2563eb' : '#e5e7eb'}`, background: submitted && opt.toLowerCase() === q.answer.toLowerCase() ? '#f0fdf4' : answers[q.id] === opt ? '#eff6ff' : 'white', cursor: submitted ? 'default' : 'pointer', transition: 'all 0.15s' }}>
                  <input type="radio" name={`q${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => !submitted && handleAnswer(q.id, opt)} disabled={submitted} style={{ accentColor: '#2563eb' }} />
                  <span>{opt}</span>
                  {submitted && opt.toLowerCase() === q.answer.toLowerCase() && <span style={{ color: '#22c55e', fontWeight: 600, marginLeft: 'auto' }}>✓</span>}
                </label>
              ))}
            </div>
          )}

          {q.type === 'true_false' && (
            <div style={{ display: 'flex', gap: '1rem' }}>
              {['True', 'False'].map(opt => (
                <label key={opt} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '8px', border: `1.5px solid ${submitted ? (opt.toLowerCase() === q.answer.toLowerCase() ? '#22c55e' : answers[q.id] === opt ? '#ef4444' : '#e5e7eb') : answers[q.id] === opt ? '#2563eb' : '#e5e7eb'}`, background: submitted && opt.toLowerCase() === q.answer.toLowerCase() ? '#f0fdf4' : answers[q.id] === opt ? '#eff6ff' : 'white', cursor: submitted ? 'default' : 'pointer' }}>
                  <input type="radio" name={`q${q.id}`} value={opt} checked={answers[q.id] === opt} onChange={() => !submitted && handleAnswer(q.id, opt)} disabled={submitted} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          )}

          {q.type === 'matching' && q.leftColumn && q.rightColumn && (
            <div style={{ marginTop: '0.5rem' }}>
              {(() => {
                const shuffled = [...q.rightColumn].sort(() => Math.random() - 0.5);
                const userMatches = answers[q.id] || {};
                return q.leftColumn.map((item, i) => {
                  const isCorrect = submitted && q.correctMatches && userMatches[item] === q.correctMatches.find(m => m.left === item)?.right;
                  const isWrong = submitted && userMatches[item] && !isCorrect;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', marginBottom: '0.5rem', borderRadius: '8px', background: submitted ? (isCorrect ? '#f0fdf4' : isWrong ? '#fef2f2' : 'white') : '#f9fafb', border: `1.5px solid ${submitted ? (isCorrect ? '#22c55e' : isWrong ? '#ef4444' : '#e5e7eb') : '#e5e7eb'}` }}>
                      <span style={{ minWidth: '40%', fontWeight: 500, fontSize: '0.9rem' }}>{item}</span>
                      <span style={{ color: '#9ca3af' }}>→</span>
                      {submitted ? (
                        <span style={{ fontSize: '0.9rem', color: isCorrect ? '#16a34a' : isWrong ? '#dc2626' : '#6b7280', fontWeight: isCorrect || isWrong ? 600 : 400 }}>
                          {userMatches[item] || '(no answer)'}
                          {isCorrect && ' ✓'}
                          {isWrong && ` ✗ (correct: ${q.correctMatches.find(m => m.left === item)?.right})`}
                        </span>
                      ) : (
                        <select value={userMatches[item] || ''} onChange={e => handleAnswer(q.id, { ...userMatches, [item]: e.target.value })}
                          disabled={submitted} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '0.85rem', background: 'white', cursor: submitted ? 'default' : 'pointer' }}>
                          <option value="">— Select —</option>
                          {shuffled.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                        </select>
                      )}
                    </div>
                  );
                });
              })()}
            </div>
          )}

          {(q.type === 'fill_blank' || q.type === 'short_answer' || q.type === 'transformation') && (
            <div>
              <input type="text" value={answers[q.id] || ''} onChange={e => handleAnswer(q.id, e.target.value)} disabled={submitted}
                placeholder="Type your answer..." style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1.5px solid ${submitted ? '#d1d5db' : '#e5e7eb'}`, fontSize: '0.95rem', boxSizing: 'border-box' }} />
            </div>
          )}

          {q.type === 'essay' && (
            <div>
              <textarea value={answers[q.id] || ''} onChange={e => handleAnswer(q.id, e.target.value)} disabled={submitted}
                placeholder="Write your answer..." rows={4} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: `1.5px solid ${submitted ? '#d1d5db' : '#e5e7eb'}`, fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical', fontFamily: 'inherit' }} />
            </div>
          )}

          {submitted && q.explanation && (
            <div style={{ marginTop: '0.75rem', padding: '0.75rem', background: '#f0f9ff', borderRadius: '8px', borderLeft: '4px solid #3b82f6', fontSize: '0.9rem', color: '#1e40af' }}>
              <strong>Explanation:</strong> {q.explanation}
            </div>
          )}
        </div>
      ))}

      {!submitted && (
        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <button onClick={handleSubmit} disabled={Object.keys(answers).length === 0}
            style={{ padding: '14px 48px', borderRadius: '10px', border: 'none', background: Object.keys(answers).length === 0 ? '#93c5fd' : '#2563eb', color: 'white', fontSize: '1.1rem', fontWeight: 600, cursor: Object.keys(answers).length === 0 ? 'not-allowed' : 'pointer' }}>
            Submit Test
          </button>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginTop: '0.5rem' }}>{Object.keys(answers).length} of {test.questions.length} answered</p>
        </div>
      )}
    </div>
  );
};

export default TestPlayer;
