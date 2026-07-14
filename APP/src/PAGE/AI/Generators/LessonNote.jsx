import { useState, useEffect } from 'react';
import axios from 'axios';
import { FiBookOpen, FiLoader, FiDownload, FiPrinter, FiCopy } from 'react-icons/fi';
import { exportPDF, printContent, copyToClipboard } from '../../../services/aiExport';
import styles from '../AIDashboard.module.css';
import genStyles from './Generator.module.css';
import useDropdownData from '../components/useDropdownData';
import ErrorDisplay from '../components/ErrorDisplay';

export default function LessonNote() {
  const { classList, subjectList } = useDropdownData();
  const [schoolConfig, setSchoolConfig] = useState({ number_of_terms: 4, school_days: [1,2,3,4,5] });
  const [form, setForm] = useState({ grade: 'G10', subject: 'Mathematics', language: 'English', term: 1 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/ai/school-config').then(r => {
      const d = r.data.data;
      setSchoolConfig(d);
    }).catch(() => {});
  }, []);

  const generate = async () => {
    if (!form.grade || !form.subject) return setError({ type: 'validation', title: 'Missing Fields', description: 'Please select a Grade and Subject first.' });
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await axios.post('/api/ai/generate/lesson-note', {
        ...form, schoolConfig, duration: 40, topic: form.subject
      });
      setResult(res.data.data.lessonNote);
    } catch (err) {
      if (err.response?.data?.type) setError(err.response.data);
      else setError(err.response?.data?.error || 'Generation failed');
    } finally { setLoading(false); }
  };

  const terms = Array.from({ length: schoolConfig.number_of_terms || 4 }, (_, i) => i + 1);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerIcon}><FiBookOpen /></div>
          <div><h1>Lesson Note Generator</h1><p>Generate comprehensive teacher lesson notes</p></div>
        </div>
      </div>
      <div className={styles.genGrid}>
        <div className={styles.formCard}>
          <label className={styles.formLabel}>Grade
            <select className={styles.formSelect} value={form.grade} onChange={e => setForm({...form, grade: e.target.value})}>
              <option value="">Select Grade</option>
              {classList.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
          <label className={styles.formLabel}>Subject
            <select className={styles.formSelect} value={form.subject} onChange={e => setForm({...form, subject: e.target.value})}>
              <option value="">Select Subject</option>
              {subjectList.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </label>
          <label className={styles.formLabel}>Term
            <select className={styles.formSelect} value={form.term} onChange={e => setForm({...form, term: parseInt(e.target.value)})}>
              {terms.map(t => <option key={t} value={t}>Term {t}</option>)}
            </select>
          </label>
          <label className={styles.formLabel}>Language <select className={styles.formSelect} value={form.language} onChange={e => setForm({...form, language: e.target.value})}><option>English</option><option>Afan Oromo</option><option>Amharic</option></select></label>
          <button className={styles.genBtn} onClick={generate} disabled={loading}>{loading ? <><FiLoader className={styles.spin} /> Generating...</> : 'Generate Lesson Note'}</button>
        </div>
        <div className={styles.resultCard}>
          {loading && <div className={styles.skeleton}><div className={styles.shimmer} /></div>}
          {!loading && !result && <ErrorDisplay error={error} />}
          {result && (
            <>
              <div className={styles.toolbar}>
                <button className={styles.toolBtn} onClick={() => exportPDF(result.topic||'Lesson Note', result)} aria-label="Export PDF"><FiDownload /> Export PDF</button>
                <button className={styles.toolBtn} onClick={() => printContent('ln-output')} aria-label="Print"><FiPrinter /> Print</button>
                <button className={styles.toolBtn} onClick={() => copyToClipboard(JSON.stringify(result,null,2))} aria-label="Copy to clipboard"><FiCopy /> Copy</button>
              </div>
              <div className={genStyles.output} id="ln-output">
                <h2 className={genStyles.outputTitle}>{result.topic || result.title}</h2>
                <p className={genStyles.outputMeta}>{result.grade} | {result.subject} | Term {form.term}</p>
                <h3>Definition</h3><p>{result.definition}</p>
                <h3>Explanation</h3><p>{result.explanation}</p>
                <h3>Key Concepts</h3><ul>{result.keywords?.map((k,i) => <li key={i}><strong>{k.term}:</strong> {k.definition}</li>)}</ul>
                <h3>Examples</h3>{result.examples?.map((e,i) => <div key={i} className={genStyles.step}><strong>{e.title}</strong><p>{e.content}</p></div>)}
                <h3>Summary</h3><p>{result.summary}</p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
