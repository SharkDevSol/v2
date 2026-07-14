import { useState, useEffect } from 'react'; import axios from 'axios'; import { FiEdit3, FiLoader, FiDownload, FiPrinter, FiCopy } from 'react-icons/fi';
import { exportPDF, printContent, copyToClipboard } from '../../../services/aiExport';
import aiStyles from '../AIDashboard.module.css'; import styles from './Generator.module.css'; import useDropdownData from '../components/useDropdownData'; import ErrorDisplay from '../components/ErrorDisplay';
export default function Exam() {
  const { classList, subjectList } = useDropdownData();
  const [schoolConfig, setSchoolConfig] = useState({ number_of_terms: 4, school_days: [1,2,3,4,5] });
  const [form, setForm] = useState({ grade: 'G10', subject: 'Mathematics', language: 'English', term: 1, examType: 'Monthly', totalMarks: 50, timeLimit: 60, difficulty: 'Medium' });
  const [result, setResult] = useState(null); const [loading, setLoading] = useState(false); const [error, setError] = useState('');
  useEffect(() => { axios.get('/api/ai/school-config').then(r => { const d = r.data.data; setSchoolConfig(d); }).catch(() => {}); }, []);
  const generate = async () => {
    if (!form.grade || !form.subject) return setError({ type: 'validation', title: 'Missing Fields', description: 'Please select a Grade and Subject first.' });
    setLoading(true); setError(''); setResult(null);
    try { const res = await axios.post('/api/ai/generate/exam', { ...form, schoolConfig, topic: form.subject }); setResult(res.data.data.exam); } catch (err) { if (err.response?.data?.type) setError(err.response.data); else setError(err.response?.data?.error || 'Failed'); } finally { setLoading(false); }
  };
  const terms = Array.from({ length: schoolConfig.number_of_terms || 4 }, (_, i) => i + 1);
  return (
    <div className={aiStyles.container}>
      <div className={aiStyles.header}><div className={aiStyles.headerLeft}><div className={aiStyles.headerIcon}><FiEdit3 /></div><div><h1>Exam Generator</h1><p>Generate exams with marking scheme</p></div></div></div>
      <div className={aiStyles.genGrid}>
        <div className={aiStyles.formCard}>
          <label className={aiStyles.formLabel}>Grade <select className={aiStyles.formSelect} value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}><option value="">Select Grade</option>{classList.map(c => <option key={c} value={c}>{c}</option>)}</select></label>
          <label className={aiStyles.formLabel}>Subject <select className={aiStyles.formSelect} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}><option value="">Select Subject</option>{subjectList.map(s => <option key={s} value={s}>{s}</option>)}</select></label>
          <label className={aiStyles.formLabel}>Term <select className={aiStyles.formSelect} value={form.term} onChange={e => setForm({...form, term: parseInt(e.target.value)})}>{terms.map(t => <option key={t} value={t}>Term {t}</option>)}</select></label>
          <label className={aiStyles.formLabel}>Type <select className={aiStyles.formSelect} value={form.examType} onChange={e => setForm({...form, examType: e.target.value})}><option>Monthly</option><option>Mid-Term</option><option>Final</option><option>National</option></select></label>
          <label className={aiStyles.formLabel}>Difficulty <select className={aiStyles.formSelect} value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})}><option>Easy</option><option>Medium</option><option>Hard</option></select></label>
          <label className={aiStyles.formLabel}>Marks <input className={aiStyles.formInput} type="number" value={form.totalMarks} onChange={e => setForm({...form, totalMarks: parseInt(e.target.value) || 50})} /></label>
          <label className={aiStyles.formLabel}>Time <input className={aiStyles.formInput} type="number" value={form.timeLimit} onChange={e => setForm({...form, timeLimit: parseInt(e.target.value) || 60})} /></label>
          <label className={aiStyles.formLabel}>Language <select className={aiStyles.formSelect} value={form.language} onChange={e => setForm({...form, language: e.target.value})}><option>English</option><option>Afan Oromo</option><option>Amharic</option></select></label>
          <button className={aiStyles.genBtn} onClick={generate} disabled={loading}>{loading ? <><FiLoader className={aiStyles.spin} /> Generating...</> : 'Generate Exam'}</button>
        </div>
        <div className={aiStyles.resultCard}>
          {loading && <div className={aiStyles.skeleton}><div className={aiStyles.shimmer} /></div>}
          {!loading && !result && <ErrorDisplay error={error} />}
          {result && (<>
            <div className={aiStyles.toolbar}>
              <button className={aiStyles.toolBtn} onClick={() => exportPDF(result.title||'Exam', result)}><FiDownload /> Export</button>
              <button className={aiStyles.toolBtn} onClick={() => printContent('exam-output')}><FiPrinter /> Print</button>
              <button className={aiStyles.toolBtn} onClick={() => copyToClipboard(JSON.stringify(result,null,2))}><FiCopy /> Copy</button>
            </div>
            <div className={styles.output} id="exam-output">
              <h2>{result.title}</h2><p className={styles.outputMeta}>{result.examType} | {result.totalMarks} marks | {result.timeLimit} min | Term {form.term}</p>
              <h3>Difficulty Distribution</h3><p>Easy {result.difficultyDistribution?.easy}% | Medium {result.difficultyDistribution?.medium}% | Hard {result.difficultyDistribution?.hard}%</p>
              <h3>Sections</h3>{result.sections?.map((s,i) => <div key={i} className={styles.step}><strong>{s.section}: {s.type}</strong><p>{s.marks} marks — {s.instructions}</p></div>)}
            </div>
          </>)}
        </div>
      </div>
    </div>
  );
}
