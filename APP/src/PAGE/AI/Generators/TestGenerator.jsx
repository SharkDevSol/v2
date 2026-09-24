import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiEdit3, FiLoader, FiSave, FiPlay, FiRefreshCw, FiUpload, FiList, FiCheck } from 'react-icons/fi';
import styles from './TestGenerator.module.css';

const COMPONENTS = ['Monthly Exam', 'Mid-Term Exam', 'Final Exam', 'Quiz', 'Class Work', 'Homework', 'Test'];
const SUBJECTS = ['Mathematics', 'English', 'Biology', 'Chemistry', 'Physics', 'History', 'Geography', 'Civics', 'ICT', 'Amharic', 'Arabic', 'Oromo', 'Business', 'Economics', 'General Science'];
const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const QUESTION_TYPES = [
  { type: 'mcq', label: 'Multiple Choice' },
  { type: 'true_false', label: 'True/False' },
  { type: 'matching', label: 'Matching' },
  { type: 'numeric', label: 'Numeric' },
  { type: 'fill_blank', label: 'Fill in the Blank' },
  { type: 'short_answer', label: 'Short Answer' },
  { type: 'essay', label: 'Essay / Open-Ended' },
  { type: 'transformation', label: 'Transformation' },
];

const TestGenerator = () => {
  const navigate = useNavigate();
  const fileRef = useRef(null);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [mappings, setMappings] = useState([]);
  const [markComponents, setMarkComponents] = useState({});
  const [componentMarkValue, setComponentMarkValue] = useState(null);
  const [bonusTypes, setBonusTypes] = useState([]);
  const [termOptions, setTermOptions] = useState([1, 2]);
  const [form, setForm] = useState({
    subjectName: '', className: '', termNumber: 1, componentName: '',
    difficulty: ['Medium'], language: 'English', topic: '', timeLimit: 40, teacherNotes: ''
  });
  const [questionTypes, setQuestionTypes] = useState(
    QUESTION_TYPES.map(qt => ({ ...qt, count: 0, marksPerQuestion: 1 }))
  );
  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    axios.get('/api/ai/list-classes')
      .then(r => {
        if (r.data.success) {
          setClasses(r.data.data.classes || []);
          if (r.data.data.subjects?.length) setSubjects(r.data.data.subjects);
        }
      })
      .catch(e => console.error('Error fetching classes:', e));
    // Mark-list system: subjects + subject-class mappings
    axios.get('/api/mark-list/subjects')
      .then(r => {
        if (Array.isArray(r.data) && r.data.length) {
          setSubjects(r.data.map(s => (typeof s === 'string' ? s : s.subject_name)).filter(Boolean));
        }
      })
      .catch(() => {});
    axios.get('/api/mark-list/subjects-classes')
      .then(r => { if (Array.isArray(r.data)) setMappings(r.data); })
      .catch(() => {});
    // Term count from school config (Task 1 page storage)
    axios.get('/api/ai/school-config')
      .then(r => {
        const terms = r.data?.data?.number_of_terms || r.data?.number_of_terms || r.data?.data?.terms;
        const n = parseInt(terms);
        if (n >= 1) setTermOptions(Array.from({ length: n }, (_, i) => i + 1));
      })
      .catch(() => {});
  }, []);

  // Mark-list: components (with marks) for the selected subject/class/term
  useEffect(() => {
    if (!form.subjectName || !form.className || !form.termNumber) return;
    axios.get(`/api/mark-list/mark-list/${encodeURIComponent(form.subjectName)}/${encodeURIComponent(form.className)}/${form.termNumber}`)
      .then(r => {
        const config = r.data.config || r.data;
        const comps = config.mark_components || [];
        const map = {};
        comps.forEach(c => { if (c && c.name) map[c.name] = c.percentage; });
        setMarkComponents(map);
      })
      .catch(() => setMarkComponents({}));
  }, [form.subjectName, form.className, form.termNumber]);

  // Total marks auto-set from the selected component
  useEffect(() => {
    if (form.componentName && markComponents[form.componentName] != null) {
      setComponentMarkValue(markComponents[form.componentName]);
    } else {
      setComponentMarkValue(null);
    }
  }, [form.componentName, markComponents]);

  const getAvailableClasses = () => {
    if (!form.subjectName) return classes;
    const fromMappings = mappings
      .filter(m => m.subject_name === form.subjectName)
      .map(m => m.class_name);
    return [...new Set(fromMappings.length > 0 ? fromMappings : classes)];
  };

  // Subjects of the SELECTED CLASS only (from the mark-list page data)
  const getAvailableSubjects = () => {
    if (!form.className) return subjects;
    const fromMappings = mappings
      .filter(m => m.class_name === form.className)
      .map(m => m.subject_name);
    return [...new Set(fromMappings.length > 0 ? fromMappings : subjects)];
  };

  // Class first: when the class changes, reset subject/component if not valid for that class
  const handleClassChange = (className) => {
    setForm(f => {
      const classSubjects = new Set(
        mappings.filter(m => m.class_name === className).map(m => m.subject_name)
      );
      const keepSubject = !f.subjectName || classSubjects.size === 0 || classSubjects.has(f.subjectName);
      return {
        ...f,
        className,
        subjectName: keepSubject ? f.subjectName : '',
        componentName: keepSubject ? f.componentName : '',
      };
    });
    if (!className) setMarkComponents({});
  };

  const componentMarks = componentMarkValue || 0;
  const distTotal = questionTypes.reduce((s, q) => s + q.count * q.marksPerQuestion, 0);
  const bonusTotal = bonusTypes.reduce((s, b) => s + b.count * b.marksPerQuestion, 0);
  const effectiveTotal = distTotal > 0 ? distTotal : componentMarks;

  const totalMarks = questionTypes.reduce((s, q) => s + q.count * q.marksPerQuestion, 0);

  const setField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleDifficulty = (d) => {
    setForm(f => {
      const has = f.difficulty.includes(d);
      return { ...f, difficulty: has ? f.difficulty.filter(x => x !== d) : [...f.difficulty, d] };
    });
  };

  const setQt = (type, field, val) => {
    setQuestionTypes(qs => qs.map(q => q.type === type ? { ...q, [field]: Math.max(0, parseInt(val) || 0) } : q));
  };

  const setBonus = (index, field, val) => {
    setBonusTypes(bs => bs.map((b, i) => i === index ? { ...b, [field]: field === 'type' ? val : Math.max(0, parseInt(val) || 0) } : b));
  };

  const addBonusType = () => setBonusTypes(bs => [...bs, { type: 'mcq', label: 'Multiple Choice', count: 1, marksPerQuestion: 1 }]);
  const removeBonusType = (index) => setBonusTypes(bs => bs.filter((_, i) => i !== index));

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await axios.post('/api/ai/ocr', fd);
      const txt = r.data?.data?.text || r.data?.text || '';
      if (r.data.success && txt) {
        const note = `[Uploaded ${file.name}]\n${txt.slice(0, 80000)}`;
        setForm(f => ({ ...f, teacherNotes: f.teacherNotes ? f.teacherNotes + '\n\n' + note : note }));
        alert('✅ File content added to Teacher Notes (' + txt.length + ' characters)');
      } else if (r.data?.data?.scanned) {
        alert('❌ This PDF is scanned images (no text layer). Please upload a text-based PDF, or type the notes manually in the Teacher Notes box.');
      } else {
        alert('❌ Could not extract text from this file' + (r.data?.data?.error ? ': ' + r.data.data.error : '') + '. Try a different format (PDF, DOCX, XLSX, TXT) or type the notes manually.');
      }
    } catch (err) {
      alert('❌ Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const generate = async () => {
    if (!form.subjectName || !form.className || !form.componentName) {
      setError('Please select Subject, Class, and Component'); return;
    }
    const activeTypes = questionTypes.filter(q => q.count > 0);
    if (activeTypes.length === 0 && effectiveTotal === 0) {
      setError('Select a Component from the mark list, or set at least one question type with a count above 0'); return;
    }
    if (bonusTotal > 5) {
      setError('Bonus marks cannot exceed 5'); return;
    }
    setLoading(true); setError(''); setGenerated(null); setSaved(false);
    try {
      const payload = {
        ...form,
        totalMarks: effectiveTotal || distTotal,
        difficulty: form.difficulty.length ? form.difficulty.map(d => d.toLowerCase()).join(', ') : 'medium',
        questionTypes: activeTypes.map(q => ({ type: q.type, count: q.count, marksPerQuestion: q.marksPerQuestion })),
        bonusQuestions: bonusTotal > 0 ? bonusTypes.map(b => ({ type: b.type, count: b.count, marksPerQuestion: b.marksPerQuestion })) : null,
      };
      const res = await axios.post('/api/ai/generate-test', payload);
      if (res.data.success) setGenerated(res.data);
      else setError(res.data.error || 'Generation failed');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate test');
    } finally {
      setLoading(false);
    }
  };

  const saveTest = async () => {
    if (!generated) return;
    setSaving(true);
    try {
      await axios.post('/api/ai/save-test', {
        subjectName: form.subjectName,
        className: form.className,
        termNumber: form.termNumber,
        componentName: form.componentName,
        questions: generated.questions,
        timeLimit: form.timeLimit,
        language: form.language,
        isPublished: false
      });
      setSaved(true);
      alert('✅ Test saved successfully!');
    } catch (err) {
      alert('❌ Failed to save test: ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const playTest = () => {
    if (!saved && !confirm('The test is not saved yet. Play without saving?')) return;
    const params = new URLSearchParams({
      subject: form.subjectName, class: form.className,
      term: form.termNumber, component: form.componentName
    });
    navigate(`/ai-test-player?${params.toString()}`);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerIcon}><FiEdit3 /></div>
        <div style={{ flex: 1 }}>
          <h1>AI Test Generator</h1>
          <p>Generate exams using AI. Configure the settings and click Generate.</p>
        </div>
        <button className={styles.savedTestsBtn} onClick={() => navigate('/ai-tests')}>
          <FiList /> Saved Tests
        </button>
      </div>

      <h2 className={styles.stepHeader}>Step 1: Test Configuration</h2>

      <div className={styles.mainGrid}>
        <div className={styles.formCard}>
          <div className={styles.formGrid}>
            <div className={styles.field}>
              <label>Class <span className={styles.req}>*</span></label>
              <select value={form.className} onChange={e => handleClassChange(e.target.value)}>
                <option value="">Select Class</option>
                {classes.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Subject <span className={styles.req}>*</span></label>
              <select value={form.subjectName} onChange={e => { setField('subjectName', e.target.value); setField('componentName', ''); setMarkComponents({}); }}
                disabled={!form.className}>
                <option value="">{form.className ? 'Select Subject' : 'Select Class first'}</option>
                {getAvailableSubjects().map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {form.className && getAvailableSubjects().length > 0 && (
                <small style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                  Only subjects of {form.className}
                </small>
              )}
            </div>
            <div className={styles.field}>
              <label>Term</label>
              <select value={form.termNumber} onChange={e => { setField('termNumber', parseInt(e.target.value)); setMarkComponents({}); }}>
                {termOptions.map(t => <option key={t} value={t}>Term {t}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Component <span className={styles.req}>*</span></label>
              <select value={form.componentName} onChange={e => setField('componentName', e.target.value)}>
                <option value="">Select Component</option>
                {Object.keys(markComponents).length > 0
                  ? Object.keys(markComponents).map(c => (
                      <option key={c} value={c}>{c.replace(/_/g, ' ').toUpperCase()} ({markComponents[c]} marks)</option>
                    ))
                  : COMPONENTS.map(c => <option key={c} value={c}>{c}</option>)
                }
              </select>
              {Object.keys(markComponents).length === 0 && form.subjectName && form.className && (
                <small style={{ color: '#9ca3af', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                  No mark list found for this subject/class/term — showing default components
                </small>
              )}
            </div>
            <div className={styles.field}>
              <label>Total Marks</label>
              <input
                type="number"
                value={componentMarkValue != null ? componentMarkValue : distTotal}
                readOnly={componentMarkValue != null}
                className={componentMarkValue != null ? styles.readonly : ''}
                title={componentMarkValue != null ? `Set from mark list (${form.componentName})` : 'Sum of your question distribution'}
              />
              {componentMarkValue != null && (
                <small style={{ color: '#6b7280', fontSize: '0.8rem', display: 'block', marginTop: '4px' }}>
                  Set from mark list{bonusTotal > 0 ? ` + ${bonusTotal} bonus = ${componentMarkValue + bonusTotal} total` : ''} — distribute below: e.g. {componentMarkValue} questions × 1 mark, or 5 × 2 marks, any mix you want
                </small>
              )}
            </div>
            <div className={styles.field}>
              <label>Difficulty (select one or more)</label>
              <div className={styles.diffRow}>
                {DIFFICULTIES.map(d => (
                  <button
                    key={d}
                    type="button"
                    className={form.difficulty.includes(d) ? `${styles.diffCheck} ${styles.diffChecked}` : styles.diffCheck}
                    onClick={() => toggleDifficulty(d)}
                  >
                    {form.difficulty.includes(d) && <FiCheck />} {d}
                  </button>
                ))}
              </div>
            </div>
            <div className={styles.field}>
              <label>Language</label>
              <select value={form.language} onChange={e => setField('language', e.target.value)}>
                {['English', 'Arabic', 'Somali', 'Amharic', 'Oromo'].map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label>Time Limit (minutes, 0 = no limit)</label>
              <input type="number" value={form.timeLimit} onChange={e => setField('timeLimit', parseInt(e.target.value) || 0)} />
            </div>
          </div>

          <div className={styles.field}>
            <label>Topic/Unit (optional)</label>
            <input type="text" value={form.topic} onChange={e => setField('topic', e.target.value)} placeholder="e.g., Unit 2: Cell Biology" />
          </div>

          <div className={styles.field}>
            <label>Teacher Notes (optional — write in ANY language)</label>
            <textarea
              className={styles.textarea}
              rows={4}
              value={form.teacherNotes}
              onChange={e => setField('teacherNotes', e.target.value)}
              placeholder="Write in any language (Somali, Amharic, Arabic, English...). Tell the AI where to generate the test from — e.g. 'I want the test from unit 2' or be more specific: 'unit 2, the second topic'. The test will be written in the Language you selected, not the language you write here."
            />
          </div>

          <button className={styles.uploadBtn} onClick={() => fileRef.current?.click()} disabled={uploading}>
            {uploading ? <><FiLoader className={styles.spin} /> Extracting...</> : <><FiUpload /> Upload PDF/DOC/Excel</>}
          </button>
          <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.txt" style={{ display: 'none' }} onChange={handleUpload} />

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <div className={styles.formCard}>
          <h2 className={styles.stepHeader}>Step 2: Question Distribution</h2>
          <div className={styles.distTable}>
            <div className={`${styles.distRow} ${styles.distHead}`}>
              <span>Question Type</span>
              <span>Count</span>
              <span>Marks each</span>
            </div>
            {questionTypes.map(qt => (
              <div key={qt.type} className={styles.distRow}>
                <span>{qt.label}</span>
                <input type="number" min="0" value={qt.count} onChange={e => setQt(qt.type, 'count', e.target.value)} />
                <input type="number" min="1" value={qt.marksPerQuestion} onChange={e => setQt(qt.type, 'marksPerQuestion', e.target.value)} />
              </div>
            ))}
          </div>
          <div className={styles.totalMarks}>
            Total marks: <strong>{componentMarkValue != null ? componentMarkValue : distTotal}</strong>
            {componentMarkValue != null && distTotal > 0 && distTotal !== componentMarkValue && (
              <span style={{ color: '#dc2626', marginLeft: '8px', fontSize: '0.85rem' }}>
                (your distribution: {distTotal} — component is {componentMarkValue})
              </span>
            )}
            {bonusTotal > 0 && (
              <span style={{ marginLeft: '8px', fontSize: '0.85rem', color: '#b45309' }}>
                🎁 +{bonusTotal} bonus = <strong>{(componentMarkValue != null ? componentMarkValue : distTotal) + bonusTotal} total</strong>
              </span>
            )}
          </div>

          <div style={{ marginTop: '1rem', padding: '12px', borderRadius: '8px', background: '#fffbeb', border: '1px solid #fde68a' }}>
            <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '6px' }}>🎁 Bonus Questions (optional — max 5 bonus marks)</div>
            {bonusTypes.length === 0 && (
              <div style={{ fontSize: '0.85rem', color: '#92400e', marginBottom: '6px' }}>
                Add extra bonus marks on top of the test marks — e.g. test 10 marks + 5 bonus = 15 marks total
              </div>
            )}
            {bonusTypes.map((b, i) => (
              <div key={i} className={styles.distRow} style={{ marginBottom: '6px' }}>
                <select value={b.type} onChange={e => setBonus(i, 'type', e.target.value)} style={{ flex: 1, padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }}>
                  {QUESTION_TYPES.map(t => <option key={t.type} value={t.type}>{t.label}</option>)}
                </select>
                <input type="number" min="1" value={b.count} onChange={e => setBonus(i, 'count', e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="Count" />
                <input type="number" min="1" value={b.marksPerQuestion} onChange={e => setBonus(i, 'marksPerQuestion', e.target.value)} style={{ width: '70px', padding: '6px', borderRadius: '6px', border: '1px solid #d1d5db' }} placeholder="Marks" />
                <span style={{ fontSize: '0.85rem', color: '#6b7280', minWidth: '50px' }}>= {b.count * b.marksPerQuestion}m</span>
                <button type="button" onClick={() => removeBonusType(i)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '6px', padding: '4px 10px', cursor: 'pointer' }}>✕</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button type="button" onClick={addBonusType} style={{ background: '#fef3c7', border: '1px dashed #f59e0b', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}>
                + Add Bonus Question Type
              </button>
              <span style={{ fontSize: '0.85rem', fontWeight: bonusTotal > 5 ? 700 : 400, color: bonusTotal > 5 ? '#dc2626' : '#6b7280' }}>
                Bonus total: {bonusTotal} / 5 marks{bonusTotal > 5 ? ' — EXCEEDS LIMIT!' : ''}
              </span>
            </div>
          </div>

          <button className={styles.generateBtn} onClick={generate} disabled={loading || bonusTotal > 5}>
            {loading ? <><FiLoader className={styles.spin} /> Generating...</> : '⚡ Generate Test'}
          </button>
          {bonusTotal > 5 && (
            <div style={{ color: '#dc2626', fontSize: '0.85rem', marginTop: '6px', textAlign: 'center' }}>
              Bonus exceeds 5 marks — reduce it to generate
            </div>
          )}
        </div>
      </div>

      <div className={styles.resultCard}>
        {loading && (
          <div className={styles.placeholder}>
            <FiLoader className={styles.spin} />
            <p>Generating your test with AI...</p>
            <p className={styles.sub}>This may take 30-60 seconds</p>
          </div>
        )}
        {!loading && !generated && (
          <div className={styles.placeholder}>
            <FiEdit3 />
            <p>Fill in the settings and click Generate Test</p>
          </div>
        )}
        {!loading && generated && (
          <div className={styles.resultContent}>
            <div className={styles.resultHeader}>
              <h3>Generated Test — {generated.questions.length} questions</h3>
              <div className={styles.resultActions}>
                <button onClick={saveTest} disabled={saving || saved} className={styles.saveBtn}><FiSave /> {saving ? 'Saving...' : saved ? 'Saved ✓' : 'Save Test'}</button>
                <button onClick={playTest} className={styles.playBtn}><FiPlay /> Play</button>
                <button onClick={generate} className={styles.regenBtn}><FiRefreshCw /> Regenerate</button>
              </div>
            </div>
            {generated.stats && (
              <div className={styles.statsBar}>
                {Object.entries(generated.stats).filter(([k]) => k !== 'total').map(([k, v]) => (
                  <span key={k} className={styles.statPill}>{k}: {v}</span>
                ))}
              </div>
            )}
            <div className={styles.questionList}>
              {generated.questions.map((q, i) => (
                <div key={i} className={styles.questionCard}>
                  <div className={styles.qHeader}>
                    <span className={styles.qNum}>{i + 1}</span>
                    <span className={styles.qType}>{q.type}</span>
                    <span className={styles.qMarks}>{q.marks} mark{q.marks > 1 ? 's' : ''}</span>
                  </div>
                  <p className={styles.qText}>{q.question}</p>
                  {q.options && q.options.length > 0 && (
                    <div className={styles.qOptions}>
                      {q.options.map((o, j) => <div key={j} className={styles.qOption}>{o}</div>)}
                    </div>
                  )}
                  <div className={styles.qAnswer}><strong>Answer:</strong> {q.answer}</div>
                  {q.explanation && <div className={styles.qExplanation}><strong>Explanation:</strong> {q.explanation}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TestGenerator;
