import { useState, useEffect } from 'react'; import axios from 'axios'; import { FiShuffle, FiLoader, FiDownload, FiPrinter, FiCopy } from 'react-icons/fi';
import { exportPDF, printContent, copyToClipboard } from '../../../services/aiExport';
import styles from '../AIDashboard.module.css'; import genStyles from './Generator.module.css'; import useDropdownData from '../components/useDropdownData'; import ErrorDisplay from '../components/ErrorDisplay';
export default function ScrambleExam() {
  const { classList, subjectList } = useDropdownData();
  const [schoolConfig, setSchoolConfig] = useState({ number_of_terms: 4, school_days: [1,2,3,4,5] });
  const [form, setForm] = useState({ grade: 'G10', subject: 'Mathematics', language: 'English', term: 1, totalMarks: 50, timeLimit: 60, difficulty: 'Medium' });
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => { axios.get('/api/ai/school-config').then(r => { const d = r.data.data; setSchoolConfig(d); }).catch(() => {}); }, []);
  const generate = async () => {
    if (!form.grade || !form.subject) return setError({ type: 'validation', title: 'Missing Fields', description: 'Please select a Grade and Subject first.' });
    setLoading(true); setError(''); setResult(null);
    try { const res = await axios.post('/api/ai/generate/scramble-exam', { ...form, schoolConfig, topic: form.subject }); setResult(res.data.data.scrambleExam); } catch (err) { if (err.response?.data?.type) setError(err.response.data); else setError(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };
  const terms = Array.from({ length: schoolConfig.number_of_terms || 4 }, (_, i) => i + 1);
  return (
    <div className={styles.container}>
      <div className={styles.header}><div className={styles.headerLeft}><div className={styles.headerIcon}><FiShuffle /></div><div><h1>Scramble Exam Generator</h1><p>Generate 4 shuffled exam versions</p></div></div></div>
      <div className={styles.genGrid}>
        <div className={styles.formCard}>
          <label className={styles.formLabel}>Grade <select className={styles.formSelect} value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}><option value="">Select Grade</option>{classList.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className={styles.formLabel}>Subject <select className={styles.formSelect} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}><option value="">Select Subject</option>{subjectList.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
          <label className={styles.formLabel}>Term <select className={styles.formSelect} value={form.term} onChange={e => setForm({...form, term: parseInt(e.target.value)})}>{terms.map(t => <option key={t} value={t}>Term {t}</option>)}</select></label>
          <label className={styles.formLabel}>Difficulty <select className={styles.formSelect} value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
          <label className={styles.formLabel}>Marks <input className={styles.formInput} type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: parseInt(e.target.value) || 50})} /></label>
          <label className={styles.formLabel}>Time <input className={styles.formInput} type="number" value={form.timeLimit} onChange={e => setForm({...form, timeLimit: parseInt(e.target.value) || 60})} /></label>
          <label className={styles.formLabel}>Language <select className={styles.formSelect} value={form.language} onChange={e => setForm({...form, language: e.target.value})}><option>English</option><option>Afan Oromo</option><option>Amharic</option></select></label>
          <button className={styles.genBtn} onClick={generate} disabled={loading}>{loading ? <><FiLoader className={styles.spin} /> Generating...</> : 'Generate Scramble'}</button>
        </div>
        <div className={styles.resultCard}>
          {loading && <div className={styles.skeleton}><div className={styles.shimmer} /></div>}
          {!loading && !result && <ErrorDisplay error={error} />}
          {result && (<>
            <div className={styles.toolbar}>
              <button className={styles.toolBtn} onClick={() => exportPDF(result.title||'Scramble Exam', result)} aria-label="Export PDF"><FiDownload /> Export PDF</button>
              <button className={styles.toolBtn} onClick={() => printContent('se-output')} aria-label="Print"><FiPrinter /> Print</button>
              <button className={styles.toolBtn} onClick={() => copyToClipboard(JSON.stringify(result,null,2))} aria-label="Copy to clipboard"><FiCopy /> Copy</button>
            </div>
            <div className={genStyles.output} id="se-output">
              <h2 className={genStyles.outputTitle}>{result.title || result.topic}</h2><p className={genStyles.outputMeta}>{result.totalMarks} marks | {result.timeLimit} min | {result.versionCount} versions | Term {form.term}</p>
              {Object.entries(result.versions || {}).map(([key, ver]) => (<div key={key} className={genStyles.step}><h3>{ver.label}</h3>{ver.sections?.map((s,i) => <div key={i}><p><strong>{s.section}</strong> — {s.type}</p></div>)}</div>))}
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}
