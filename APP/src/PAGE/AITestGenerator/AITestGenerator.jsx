import React, { useState, useEffect } from 'react';
import { formatAPIError } from '../../utils/errorMessages';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice (MCQ)' },
  { value: 'true_false', label: 'True/False' },
  { value: 'multiple_true_false', label: 'Multiple True/False' },
  { value: 'matching', label: 'Matching' },
  { value: 'numeric', label: 'Numeric/Computational' },
  { value: 'fill_blank', label: 'Fill-in-the-Blank' },
  { value: 'short_answer', label: 'Short Answer' },
  { value: 'essay', label: 'Essay / Open-Ended' },
  { value: 'transformation', label: 'Transformation / Error Correction' },
];
const LANGUAGES = ['English', 'Arabic', 'Amharic', 'Oromo', 'Somali', 'French'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];

const branchHeaders = () => ({ 'x-branch-code': (localStorage.getItem('branchCode') || '').toUpperCase() });

const AITestGenerator = () => {
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [formData, setFormData] = useState({
    subjectName: '', className: '', termNumber: 1, componentName: '',
    totalMarks: 0, difficulty: ['medium'], language: 'English',
    topic: '', teacherNotes: '', timeLimit: 0,
    questionTypes: [{ type: 'mcq', count: 5, marksPerQuestion: 2 }],
    bonusQuestions: null,
  });
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [componentMarkValue, setComponentMarkValue] = useState(null);
  const [markComponentsMap, setMarkComponentsMap] = useState({});
  const [showSaved, setShowSaved] = useState(false);
  const [savedTests, setSavedTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/mark-list/subjects`, { headers: branchHeaders() })
      .then(r => r.json()).then(d => setSubjects(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API_BASE_URL}/mark-list/subjects-classes`, { headers: branchHeaders() })
      .then(r => r.json()).then(d => setMappings(Array.isArray(d) ? d : [])).catch(() => {});
    fetch(`${API_BASE_URL}/schedule/config`, { headers: branchHeaders() })
      .then(r => r.json()).then(d => {
        if (d && d.school_days) setClasses(d.school_days.map((_, i) => `Class${i + 1}`));
      }).catch(() => {});
  }, []);

  // Fetch mark components when subject+class+term selected
  useEffect(() => {
    if (!formData.subjectName || !formData.className || !formData.termNumber) return;
    fetch(`${API_BASE_URL}/mark-list/mark-list/${formData.subjectName}/${formData.className}/${formData.termNumber}`, { headers: branchHeaders() })
      .then(r => r.json()).then(data => {
        const config = data.config || data;
        const comps = config.mark_components || [];
        const map = {};
        comps.forEach(c => { map[c.name] = c.percentage; });
        setMarkComponentsMap(map);
      }).catch(() => setMarkComponentsMap({}));
  }, [formData.subjectName, formData.className, formData.termNumber]);

  // Auto-set total marks when component selected
  useEffect(() => {
    if (formData.componentName && markComponentsMap[formData.componentName]) {
      const marks = markComponentsMap[formData.componentName];
      setFormData(prev => ({ ...prev, totalMarks: marks }));
      setComponentMarkValue(marks);
    } else {
      setComponentMarkValue(null);
    }
  }, [formData.componentName, markComponentsMap]);

  const updateForm = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

  const addQuestionType = () => {
    setFormData(prev => ({ ...prev, questionTypes: [...prev.questionTypes, { type: 'mcq', count: 1, marksPerQuestion: 1 }] }));
  };

  const updateQuestionType = (index, field, value) => {
    setFormData(prev => {
      const qt = [...prev.questionTypes];
      qt[index] = { ...qt[index], [field]: field === 'type' ? value : parseInt(value) || 0 };
      return { ...prev, questionTypes: qt };
    });
  };

  const removeQuestionType = (index) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.filter((_, i) => i !== index)
    }));
  };

  const totalConfiguredMarks = formData.questionTypes.reduce((sum, qt) => sum + (qt.count * qt.marksPerQuestion), 0);

  const handleGenerate = async () => {
    setLoading(true); setMessage('');
    try {
      const res = await fetch(`${API_BASE_URL}/ai/generate-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...branchHeaders() },
        body: JSON.stringify({ ...formData, difficulty: Array.isArray(formData.difficulty) ? formData.difficulty.join(',') : formData.difficulty }),
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedQuestions(data.questions);
        setStep(3);
      } else {
        setMessage(formatAPIError({ response: { status: res.status, data } }, 'Failed to generate test'));
      }
    } catch (e) {
      setMessage(formatAPIError(e, 'Failed to connect to AI service'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditQuestion = (index) => {
    setEditingQuestion(index);
  };

  const handleSaveQuestion = (index, updated) => {
    const qs = [...generatedQuestions];
    qs[index] = updated;
    setGeneratedQuestions(qs);
    setEditingQuestion(null);
  };

  const handleRemoveQuestion = (index) => {
    setGeneratedQuestions(prev => prev.filter((_, i) => i !== index));
  };

  const handleSaveTest = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/save-test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...branchHeaders() },
        body: JSON.stringify({ ...formData, questions: generatedQuestions }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(`Test saved! ${data.message}`);
      } else {
        setMessage(formatAPIError({ response: { status: res.status, data } }, 'Failed to save'));
      }
    } catch (e) {
      setMessage(formatAPIError(e, 'Failed to save test'));
    } finally {
      setLoading(false);
    }
  };

  const fetchSavedTests = async () => {
    setLoadingTests(true);
    try {
      const res = await fetch(`${API_BASE_URL}/ai/list-tests`, { headers: branchHeaders() });
      const data = await res.json();
      if (data.success) setSavedTests(data.data || []);
    } catch (e) {
      console.error('Error fetching saved tests:', e);
    } finally {
      setLoadingTests(false);
    }
  };

  const toggleSaved = () => {
    if (!showSaved) fetchSavedTests();
    setShowSaved(!showSaved);
  };

  const getAvailableClasses = () => {
    if (!formData.subjectName) return [];
    const classNames = mappings
      .filter(m => m.subject_name === formData.subjectName)
      .map(m => m.class_name);
    return [...new Set(classNames)];
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>AI Test Generator</h1>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            Generate exams using AI. Configure the settings and click Generate.
          </p>
        </div>
        <button onClick={toggleSaved} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: showSaved ? '#2563eb' : 'white', color: showSaved ? 'white' : '#333', cursor: 'pointer', fontWeight: 600 }}>
          {showSaved ? '← Back to Generator' : '📋 Saved Tests'}
        </button>
      </div>

      {message && (
        <div style={{ padding: '12px', borderRadius: '8px', marginBottom: '1rem',
          background: message.includes('saved') || message.includes('success') ? '#d1fae5' : '#fee2e2',
          color: message.includes('saved') || message.includes('success') ? '#065f46' : '#991b1b' }}>
          {message}
        </div>
      )}

      {/* Saved Tests View */}
      {showSaved && (
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem' }}>
          <h2>Saved Tests</h2>
          {loadingTests ? (
            <p>Loading saved tests...</p>
          ) : savedTests.length === 0 ? (
            <p style={{ color: '#6b7280' }}>No saved tests yet. Generate and save a test to see it here.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Subject</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Class</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Term</th>
                  <th style={{ padding: '10px 12px', textAlign: 'left' }}>Component</th>
                  <th style={{ padding: '10px 12px', textAlign: 'center' }}>Questions</th>
                </tr>
              </thead>
              <tbody>
                {savedTests.map((test, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{test.subject}</td>
                    <td style={{ padding: '10px 12px' }}>{test.className}</td>
                    <td style={{ padding: '10px 12px' }}>Term {test.termNumber}</td>
                    <td style={{ padding: '10px 12px' }}>{test.componentName}</td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>{test.questionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Step 1: Configuration */}
      {!showSaved && step === 1 && (
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem' }}>
          <h2>Step 1: Test Configuration</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
            <div>
              <label>Subject *</label>
              <select value={formData.subjectName} onChange={e => updateForm('subjectName', e.target.value)}
                style={inputStyle}>
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.subject_name || s.id} value={s.subject_name}>{s.subject_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Class *</label>
              <select value={formData.className} onChange={e => updateForm('className', e.target.value)}
                disabled={!formData.subjectName} style={inputStyle}>
                <option value="">Select Class</option>
                {getAvailableClasses().map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Term</label>
              <select value={formData.termNumber} onChange={e => updateForm('termNumber', parseInt(e.target.value))} style={inputStyle}>
                {[1, 2].map(t => <option key={t} value={t}>Term {t}</option>)}
              </select>
            </div>
            <div>
              <label>Component *</label>
              <select value={formData.componentName} onChange={e => updateForm('componentName', e.target.value)} style={inputStyle}>
                <option value="">Select</option>
                {['test_1', 'test_2', 'mid', 'final', 'practical_1', 'practical_2', 'book'].map(c => (
                  <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Total Marks</label>
              <input type="number" value={formData.totalMarks}
                onChange={e => setFormData(prev => ({ ...prev, totalMarks: parseInt(e.target.value) || 0 }))}
                min="1" max="100" style={{ ...inputStyle, background: componentMarkValue ? '#e5e7eb' : 'white' }}
                readOnly={!!componentMarkValue}
                title={componentMarkValue ? `Set from mark list (${formData.componentName})` : ''} />
              {componentMarkValue && <small style={{ color: '#6b7280' }}>Set from mark list</small>}
            </div>
            <div>
              <label>Difficulty (select one or more)</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '4px' }}>
                {DIFFICULTIES.map(d => (
                  <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '6px', border: formData.difficulty.includes(d) ? '2px solid #2563eb' : '1px solid #d1d5db', background: formData.difficulty.includes(d) ? '#eff6ff' : 'white', cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.difficulty.includes(d)}
                      onChange={() => {
                        setFormData(prev => ({
                          ...prev,
                          difficulty: prev.difficulty.includes(d)
                            ? prev.difficulty.filter(x => x !== d)
                            : [...prev.difficulty, d]
                        }));
                      }}
                      style={{ margin: 0 }} />
                    {d.charAt(0).toUpperCase() + d.slice(1)}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label>Language</label>
              <select value={formData.language} onChange={e => updateForm('language', e.target.value)} style={inputStyle}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label>Time Limit (minutes, 0 = no limit)</label>
              <input type="number" value={formData.timeLimit} onChange={e => updateForm('timeLimit', parseInt(e.target.value) || 0)}
                min="0" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Topic/Unit (optional)</label>
              <input type="text" value={formData.topic} onChange={e => updateForm('topic', e.target.value)}
                placeholder="e.g., Unit 2: Cell Biology" style={inputStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label>Teacher Notes (optional)</label>
              <textarea value={formData.teacherNotes} onChange={e => updateForm('teacherNotes', e.target.value)}
                placeholder="Any specific instructions for the AI..." rows={2} style={{ ...inputStyle, resize: 'vertical' }} />
            </div>
          </div>

          <h3 style={{ marginTop: '1.5rem' }}>Question Types</h3>
          <p style={{ fontSize: '0.85rem', color: '#6b7280' }}>
            Total configured: {totalConfiguredMarks} / {formData.totalMarks} marks
            {totalConfiguredMarks !== formData.totalMarks && ` (${totalConfiguredMarks > formData.totalMarks ? 'exceeds' : 'needs'} ${Math.abs(totalConfiguredMarks - formData.totalMarks)} marks)`}
          </p>
          
          {formData.questionTypes.map((qt, i) => (
            <div key={i} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem' }}>
              <select value={qt.type} onChange={e => updateQuestionType(i, 'type', e.target.value)} style={{ ...inputStyle, flex: 2 }}>
                {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input type="number" value={qt.count} onChange={e => updateQuestionType(i, 'count', e.target.value)}
                min="1" style={{ ...inputStyle, width: '80px' }} placeholder="Count" />
              <input type="number" value={qt.marksPerQuestion} onChange={e => updateQuestionType(i, 'marksPerQuestion', e.target.value)}
                min="1" style={{ ...inputStyle, width: '80px' }} placeholder="Marks" />
              <span style={{ fontSize: '0.85rem', color: '#6b7280', minWidth: '60px' }}>= {qt.count * qt.marksPerQuestion}m</span>
              {formData.questionTypes.length > 1 && (
                <button onClick={() => removeQuestionType(i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>X</button>
              )}
            </div>
          ))}
          <button onClick={addQuestionType} style={{ background: '#e5e7eb', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer', marginTop: '0.5rem' }}>
            + Add Question Type
          </button>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(2)} disabled={!formData.subjectName || !formData.className || !formData.componentName}
              style={{ ...buttonStyle }}>
              Next: Preview & Generate →
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Preview & Generate */}
      {!showSaved && step === 2 && (
        <div style={{ background: '#f9fafb', borderRadius: '12px', padding: '1.5rem' }}>
          <h2>Step 2: Review Settings & Generate</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem', background: 'white', padding: '1rem', borderRadius: '8px' }}>
            <div><strong>Subject:</strong> {formData.subjectName}</div>
            <div><strong>Class:</strong> {formData.className}</div>
            <div><strong>Term:</strong> {formData.termNumber}</div>
            <div><strong>Component:</strong> {formData.componentName}</div>
            <div><strong>Difficulty:</strong> {Array.isArray(formData.difficulty) ? formData.difficulty.join(', ') : formData.difficulty}</div>
            <div><strong>Language:</strong> {formData.language}</div>
            <div><strong>Total Marks:</strong> {formData.totalMarks}</div>
            <div><strong>Time Limit:</strong> {formData.timeLimit > 0 ? `${formData.timeLimit} min` : 'No limit'}</div>
            <div style={{ gridColumn: '1 / -1' }}>
              <strong>Question Types:</strong>
              {formData.questionTypes.map((qt, i) => (
                <span key={i} style={{ display: 'inline-block', background: '#e5e7eb', borderRadius: '12px', padding: '2px 8px', margin: '2px', fontSize: '0.85rem' }}>
                  {qt.count}x {qt.type} ({qt.marksPerQuestion}m each)
                </span>
              ))}
            </div>
          </div>
          {message && <p style={{ color: '#ef4444', marginTop: '0.5rem' }}>{message}</p>}
          <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(1)} style={{ ...buttonStyle, background: '#e5e7eb', color: '#333' }}>← Back</button>
            <button onClick={handleGenerate} disabled={loading}
              style={{ ...buttonStyle, background: loading ? '#93c5fd' : '#2563eb' }}>
              {loading ? 'Generating with AI...' : '🤖 Generate Test'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review Generated Questions */}
      {!showSaved && step === 3 && (
        <div>
          <h2>Step 3: Review & Edit Questions</h2>
          <p style={{ color: '#6b7280' }}>Generated {generatedQuestions.length} questions. Review, edit, or delete questions below.</p>
          
          {generatedQuestions.map((q, i) => (
            <div key={i} style={{ background: 'white', borderRadius: '8px', padding: '1rem', marginTop: '0.75rem', border: '1px solid #e5e7eb' }}>
              {editingQuestion === i ? (
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <select value={q.type} onChange={e => handleSaveQuestion(i, { ...q, type: e.target.value })} style={inputStyle}>
                      {QUESTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                    <input type="number" value={q.marks} onChange={e => handleSaveQuestion(i, { ...q, marks: parseInt(e.target.value) || 1 })}
                      style={{ ...inputStyle, width: '80px' }} />
                  </div>
                  <textarea value={q.question} onChange={e => handleSaveQuestion(i, { ...q, question: e.target.value })}
                    rows={2} style={{ ...inputStyle, width: '100%', marginBottom: '0.5rem' }} />
                  {q.options.length > 0 && (
                    <textarea value={q.options.join('\n')} 
                      onChange={e => handleSaveQuestion(i, { ...q, options: e.target.value.split('\n').filter(o => o.trim()) })}
                      rows={q.options.length} style={{ ...inputStyle, width: '100%', marginBottom: '0.5rem', fontSize: '0.85rem' }} />
                  )}
                  <input type="text" value={q.answer} onChange={e => handleSaveQuestion(i, { ...q, answer: e.target.value })}
                    placeholder="Answer" style={{ ...inputStyle, width: '100%', marginBottom: '0.5rem' }} />
                  <button onClick={() => setEditingQuestion(null)} style={{ background: '#10b981', color: 'white', border: 'none', borderRadius: '6px', padding: '6px 12px', cursor: 'pointer' }}>
                    Done Editing
                  </button>
                </div>
              ) : (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ background: '#dbeafe', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: 600 }}>
                        Q{i + 1}
                      </span>
                      <span style={{ background: '#f3e8ff', borderRadius: '6px', padding: '2px 8px', fontSize: '0.75rem' }}>
                        {q.type} ({q.marks}m)
                      </span>
                    </div>
                    <p style={{ margin: '0.25rem 0' }}>{q.question}</p>
                    {q.options.length > 0 && (
                      <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
                        {q.options.map((o, oi) => <div key={oi}>{o}</div>)}
                      </div>
                    )}
                    {q.answer && <p style={{ fontSize: '0.85rem', color: '#059669', marginTop: '0.25rem' }}>Answer: {q.answer}</p>}
                    {q.explanation && <p style={{ fontSize: '0.8rem', color: '#6b7280' }}>Explanation: {q.explanation}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button onClick={() => handleEditQuestion(i)} style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>Edit</button>
                    <button onClick={() => handleRemoveQuestion(i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.8rem', cursor: 'pointer' }}>Del</button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(2)} style={{ ...buttonStyle, background: '#e5e7eb', color: '#333' }}>← Regenerate</button>
            <button onClick={handleSaveTest} disabled={loading || generatedQuestions.length === 0}
              style={{ ...buttonStyle, background: loading ? '#93c5fd' : '#10b981' }}>
              {loading ? 'Saving...' : '💾 Save Test'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const inputStyle = {
  width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #d1d5db',
  fontSize: '0.9rem', boxSizing: 'border-box', marginTop: '4px'
};

const buttonStyle = {
  padding: '12px 24px', border: 'none', borderRadius: '8px',
  color: 'white', cursor: 'pointer', fontSize: '1rem', fontWeight: 600
};

export default AITestGenerator;
