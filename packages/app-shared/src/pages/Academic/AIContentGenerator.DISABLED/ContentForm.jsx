import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { CONTENT_MODES, DIFFICULTY_LEVELS, LANGUAGES } from './contentModes';
import ContentPreview from './ContentPreview';
import styles from './AIContentGenerator.module.css';

const ContentForm = () => {
  const { mode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const modeConfig = CONTENT_MODES.find((m) => m.id === mode);

  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [formData, setFormData] = useState(() => {
    const initial = { language: 'English', difficulty: 'Medium', questionTypes: [] };
    if (modeConfig) {
      modeConfig.fields.forEach((f) => {
        initial[f.name] = f.default !== undefined ? f.default : '';
      });
    }
    return initial;
  });

  const [generated, setGenerated] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(false);

  // Fetch classes and subjects on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await axios.get('/api/classes');
        setClasses(Array.isArray(res.data) ? res.data : []);
      } catch (_) { console.warn('Could not fetch classes'); }
    };
    const fetchSubjects = async () => {
      try {
        const res = await axios.get('/api/subjects');
        setSubjects(Array.isArray(res.data) ? res.data : []);
      } catch (_) { console.warn('Could not fetch subjects'); }
    };
    fetchClasses();
    fetchSubjects();
  }, []);

  // Load existing content if contentId passed via navigation state
  useEffect(() => {
    const contentId = location.state?.contentId;
    if (contentId) {
      const loadContent = async () => {
        try {
          const res = await axios.get(`/api/ai-content/${contentId}`);
          const data = res.data.data;
          if (data) {
            setFormData(prev => ({
              ...prev,
              ...(data.config || {}),
            }));
            setGenerated(data);
          }
        } catch (_) { console.warn('Could not load content'); }
      };
      loadContent();
    }
  }, [location.state]);

  const handleChange = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGenerated(null);

    const teacherId = localStorage.getItem('staffId') || localStorage.getItem('userId') || 1;

    try {
      const response = await axios.post('/api/ai-content/generate', {
        mode,
        config: formData,
        teacherId: parseInt(teacherId)
      });
      setGenerated(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generated) return;
    try {
      await axios.post('/api/ai-content/save', {
        id: generated.id,
        status: 'approved'
      });
      alert('Content saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  if (!modeConfig) {
    return (
      <div className={styles.container}>
        <div className={styles.errorState}>
          <h2>Invalid mode: {mode}</h2>
          <p>Supported modes: lesson_plan, lesson_note, homework, worksheet, exam, test, scramble_exam</p>
          <button className={styles.backButton} onClick={() => navigate('/ai-content')}>
            Back to Content Types
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerRow}>
          <button className={styles.backButton} onClick={() => navigate('/ai-content')}>
            ← Back
          </button>
          <button className={styles.navButton} onClick={() => navigate('/ai-content/saved')}>
            📂 Saved Content
          </button>
        </div>
        <h1 className={styles.title}>
          {modeConfig.icon} {modeConfig.title}
        </h1>
        <p className={styles.subtitle}>{modeConfig.description}</p>
      </div>

      <div className={styles.splitLayout}>
        <div className={styles.formSection}>
          <div className={styles.formCard}>
            <h3 className={styles.formTitle}>Configuration</h3>

            {modeConfig.fields.map((field) => {
              const isGradeField = field.name === 'grade' || field.name === 'class_id';
              const isSubjectField = field.name === 'subject';
              const dropdownOptions = isGradeField ? classes : isSubjectField ? subjects : null;

              return (
              <div key={field.name} className={styles.fieldGroup}>
                <label className={styles.fieldLabel}>
                  {field.label}
                  {field.required && <span className={styles.required}>*</span>}
                </label>
                {isGradeField && classes.length > 0 ? (
                  <select
                    className={styles.fieldInput}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    <option value="">Select {field.label}</option>
                    {classes.map((c) => (
                      <option key={c.id || c.name || c} value={c.name || c}>
                        {c.name || c}
                      </option>
                    ))}
                  </select>
                ) : isSubjectField && subjects.length > 0 ? (
                  <select
                    className={styles.fieldInput}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                  >
                    <option value="">Select {field.label}</option>
                    {subjects.map((s) => (
                      <option key={s.id || s.name || s} value={s.name || s}>
                        {s.name || s}
                      </option>
                    ))}
                  </select>
                ) : field.type === 'textarea' ? (
                  <textarea
                    className={styles.fieldInput}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    rows={3}
                  />
                ) : (
                  <input
                    className={styles.fieldInput}
                    type={field.type}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                    placeholder={`Enter ${field.label.toLowerCase()}`}
                    min={field.type === 'number' ? 1 : undefined}
                  />
                )}
              </div>
              );
            })}

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Language</label>
              <select
                className={styles.fieldInput}
                value={formData.language}
                onChange={(e) => handleChange('language', e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Difficulty</label>
              <select
                className={styles.fieldInput}
                value={formData.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
              >
                {DIFFICULTY_LEVELS.map((level) => (
                  <option key={level} value={level}>{level}</option>
                ))}
              </select>
            </div>

            <button
              className={styles.generateButton}
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate with AI'}
            </button>
          </div>

          {error && (
            <div className={styles.errorBox}>
              {error}
            </div>
          )}
        </div>

        <div className={styles.previewSection}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <p>Generating {modeConfig.title.toLowerCase()}...</p>
            </div>
          )}

          {!loading && !generated && !error && (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>{modeConfig.icon}</div>
              <h3>Ready to Generate</h3>
              <p>Fill in the configuration on the left and click "Generate with AI" to create your {modeConfig.title.toLowerCase()}.</p>
            </div>
          )}

          {!loading && generated && (
            <ContentPreview
              mode={mode}
              data={generated}
              onSave={handleSave}
              onRegenerate={handleRegenerate}
              onEdit={() => setEditing(!editing)}
              editing={editing}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ContentForm;
