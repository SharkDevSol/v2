import { useState, useEffect } from 'react'; import axios from 'axios'; import { FiHelpCircle, FiLoader, FiDownload, FiPrinter, FiCopy } from 'react-icons/fi';
import { exportPDF, printContent, copyToClipboard } from '../../../services/aiExport';
import styles from '../AIDashboard.module.css'; import genStyles from './Generator.module.css'; import useDropdownData from '../components/useDropdownData'; import ErrorDisplay from '../components/ErrorDisplay';
export default function Quiz() {
  const { classList, subjectList } = useDropdownData();
  const [schoolConfig, setSchoolConfig] = useState({ number_of_terms: 4, school_days: [1,2,3,4,5] });
  const [form, setForm] = useState({ grade: 'G10', subject: 'Mathematics', language: 'English', term: 1, totalMarks: 20, timeLimit: 15 });
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => { axios.get('/api/ai/school-config').then(r => { const d = r.data.data; setSchoolConfig(d); }).catch(() => {}); }, []);
  const generate = async () => {
    if (!form.grade || !form.subject) return setError({ type: 'validation', title: 'Missing Fields', description: 'Please select a Grade and Subject first.' });
    setLoading(true); setError(''); setResult(null);
    try { const res = await axios.post('/api/ai/generate/quiz', { ...form, schoolConfig, topic: form.subject }); setResult(res.data.data.quiz); } catch (err) { if (err.response?.data?.type) setError(err.response.data); else setError(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };
  const terms = Array.from({ length: schoolConfig.number_of_terms || 4 }, (_, i) => i + 1);
  return (
    <div className={styles.container}>
      <div className={styles.header}><div className={styles.headerLeft}><div className={styles.headerIcon}><FiHelpCircle /></div><div><h1>Quiz Generator</h1><p>Generate quizzes with answer key</p></div></div></div>
      <div className={styles.genGrid}>
        <div className={styles.formCard}>
          <label className={styles.formLabel}>Grade <select className={styles.formSelect} value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}><option value="">Select Grade</option>{classList.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className={styles.formLabel}>Subject <select className={styles.formSelect} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}><option value="">Select Subject</option>{subjectList.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
          <label className={styles.formLabel}>Term <select className={styles.formSelect} value={form.term} onChange={e => setForm({...form, term: parseInt(e.target.value)})}>{terms.map(t => <option key={t} value={t}>Term {t}</option>)}</select></label>
          <label className={styles.formLabel}>Language <select className={styles.formSelect} value={form.language} onChange={e => setForm({...form, language: e.target.value})}><option>English</option><option>Afan Oromo</option><option>Amharic</option></select></label>
          <label className={styles.formLabel}>Total Marks <input className={styles.formInput} type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: parseInt(e.target.value) || 20})} /></label>
          <label className={styles.formLabel}>Time Limit <input className={styles.formInput} type="number" value={form.timeLimit} onChange={e => setForm({...form, timeLimit: parseInt(e.target.value) || 15})} /></label>
          <button className={styles.genBtn} onClick={generate} disabled={loading}>{loading ? <><FiLoader className={styles.spin} /> Generating...</> : 'Generate Quiz'}</button>
        </div>
        <div className={styles.resultCard}>
          {loading && <div className={styles.skeleton}><div className={styles.shimmer} /></div>}
          {!loading && !result && <ErrorDisplay error={error} />}
          {result && (<>
            <div className={styles.toolbar}>
              <button className={styles.toolBtn} onClick={() => exportPDF(result.title||'Quiz', result)} aria-label="Export PDF"><FiDownload /> Export PDF</button>
              <button className={styles.toolBtn} onClick={() => printContent('quiz-output')} aria-label="Print"><FiPrinter /> Print</button>
              <button className={styles.toolBtn} onClick={() => copyToClipboard(JSON.stringify(result,null,2))} aria-label="Copy to clipboard"><FiCopy /> Copy</button>
            </div>
            <div className={genStyles.output} id="quiz-output">
              <h2 className={genStyles.outputTitle}>{result.title || result.topic}</h2><p className={genStyles.outputMeta}>Total: {result.totalMarks} marks | Time: {result.timeLimit} min | Term {form.term}</p>
              {result.questions?.map((q,i) => (<div key={i} className={genStyles.step}><p><strong>Q{i+1}</strong> ({q.type}) — {q.marks} marks</p><p>{q.question}</p>{q.options && <p>Options: {q.options.join(' | ')}</p>}<p style={{color:'var(--color-success)'}}><strong>Answer:</strong> {q.correctAnswer}</p><p style={{color:'var(--text-secondary)',fontSize:'13px'}}>{q.explanation}</p></div>))}
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}
