import { useState, useEffect } from 'react';
import { FiPlus, FiTrash2, FiChevronDown, FiType, FiEdit2, FiCalendar, FiCheckSquare, FiUpload, FiGlobe, FiX, FiSave, FiCheck, FiEdit3 } from 'react-icons/fi';
import api from '../../../utils/api';
import { useLanguageSelection } from '../../../context/LanguageSelectionContext';

const KG_LEVELS = ['Nursery', 'KG1', 'KG2', 'KG3'];
const GRADES = ['G1','G2','G3','G4','G5','G6','G7','G8','G9','G10','G11','G12'];

const generateSections = (prefix, count) => {
  if (count <= 1) return [prefix];
  const sections = [];
  for (let i = 0; i < count; i++) {
    let suffix;
    if (i < 26) suffix = String.fromCharCode(65 + i);
    else suffix = String.fromCharCode(65 + Math.floor(i / 26) - 1) + String.fromCharCode(65 + (i % 26));
    sections.push(`${prefix}${suffix}`);
  }
  return sections;
};

const totalSectionsAdded = (selections, counts) => {
  return Object.keys(selections).filter(k => selections[k]).reduce((sum, k) => sum + (counts[k] || 1), 0);
};

const CheckboxGrid = ({ items, selections, onChange, columns = 4 }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
    {items.map(item => {
      const checked = selections[item];
      return (
        <label key={item} onClick={() => onChange(item, !checked)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px',
            borderRadius: 8, cursor: 'pointer', userSelect: 'none',
            background: checked ? '#ede9fe' : '#f9fafb',
            border: checked ? '2px solid #7c3aed' : '2px solid #e5e7eb',
            fontWeight: checked ? 600 : 400, fontSize: 14,
          }}>
          <div style={{
            width: 20, height: 20, borderRadius: 4,
            background: checked ? '#7c3aed' : '#fff',
            border: checked ? 'none' : '2px solid #d1d5db',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            {checked && <FiCheck size={14} color="#fff" />}
          </div>
          <span>{item}</span>
        </label>
      );
    })}
  </div>
);

const StudentFormBuilder = ({ onSuccess }) => {
  const { selectedLanguages, getLanguageName, getLanguageNativeName } = useLanguageSelection();
  const [classes, setClasses] = useState([]);
  const [classConfigs, setClassConfigs] = useState({});
  const [customFields, setCustomFields] = useState([]);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [showKgModal, setShowKgModal] = useState(false);
  const [kgSelections, setKgSelections] = useState({ Nursery: false, KG1: false, KG2: false, KG3: false });
  const [kgSectionCounts, setKgSectionCounts] = useState({});

  const [showGradeModal, setShowGradeModal] = useState(false);
  const [gradeSelections, setGradeSelections] = useState({ G1: false, G2: false, G3: false, G4: false, G5: false, G6: false, G7: false, G8: false, G9: false, G10: false, G11: false, G12: false });
  const [gradeStreams, setGradeStreams] = useState({ Science: false, Natural: false });
  const [gradeSectionCounts, setGradeSectionCounts] = useState({});

  const [task1Config, setTask1Config] = useState(null);
  const [editingClass, setEditingClass] = useState(null);
  const [editName, setEditName] = useState('');

  const [newField, setNewField] = useState({
    name: '', label: '', type: 'text', required: false,
    optionCount: 0, options: [], translations: {}
  });

  useEffect(() => {
    const fetchTask1Config = async () => {
      try {
        const response = await api.get('/schedule/config');
        if (response.data) setTask1Config(response.data);
        else setTask1Config({ has_kg: false, total_shifts: 1 });
      } catch {
        setTask1Config({ has_kg: false, total_shifts: 1 });
      }
    };
    fetchTask1Config();
  }, []);

  const [hasExistingForm, setHasExistingForm] = useState(false);
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/students/form-structure');
        if (res.data?.classes?.length > 0) {
          setHasExistingForm(true);
          setClasses(res.data.classes);
          setCustomFields(res.data.customFields || []);
          setClassConfigs(res.data.classConfigs || {});
        }
      } catch(e) { console.error('Form load error:', e); }
    };
    load();
  }, []);

  const fieldTypes = [
    { value: 'text', label: 'Text', icon: <FiType /> },
    { value: 'number', label: 'Number', icon: <FiType /> },
    { value: 'textarea', label: 'Text Area', icon: <FiEdit2 /> },
    { value: 'select', label: 'Dropdown', icon: <FiChevronDown /> },
    { value: 'multi-select', label: 'Multi-Select', icon: <FiCheckSquare /> },
    { value: 'checkbox', label: 'Checkbox', icon: <FiCheckSquare /> },
    { value: 'date', label: 'Date', icon: <FiCalendar /> },
    { value: 'upload', label: 'File Upload', icon: <FiUpload /> }
  ];

  const addKgClasses = () => {
    const selected = KG_LEVELS.filter(l => kgSelections[l]);
    if (selected.length === 0) return;
    const newConfigs = {};
    const toAdd = [];
    for (const level of selected) {
      const count = kgSectionCounts[level] || 3;
      const sections = generateSections(level, count);
      for (const section of sections) {
        if (!classes.includes(section)) { toAdd.push(section); newConfigs[section] = { isKG: true, shift: 1 }; }
      }
    }
    setClasses(prev => [...prev, ...toAdd]);
    setClassConfigs(prev => ({ ...prev, ...newConfigs }));
    setShowKgModal(false);
  };

  const addGradeClasses = () => {
    const selected = GRADES.filter(g => gradeSelections[g]);
    if (selected.length === 0) return;
    const newConfigs = {};
    const toAdd = [];
    for (const grade of selected) {
      const count = gradeSectionCounts[grade] || 4;
      if (grade === 'G11' || grade === 'G12') {
        if (gradeStreams.Science) {
          for (const section of generateSections(`${grade}S`, count)) {
            if (!classes.includes(section)) { toAdd.push(section); newConfigs[section] = { isKG: false, shift: 1 }; }
          }
        }
        if (gradeStreams.Natural) {
          for (const section of generateSections(`${grade}N`, count)) {
            if (!classes.includes(section)) { toAdd.push(section); newConfigs[section] = { isKG: false, shift: 1 }; }
          }
        }
        if (!gradeStreams.Science && !gradeStreams.Natural) {
          for (const section of generateSections(grade, count)) {
            if (!classes.includes(section)) { toAdd.push(section); newConfigs[section] = { isKG: false, shift: 1 }; }
          }
        }
      } else {
        for (const section of generateSections(grade, count)) {
          if (!classes.includes(section)) { toAdd.push(section); newConfigs[section] = { isKG: false, shift: 1 }; }
        }
      }
    }
    setClasses(prev => [...prev, ...toAdd]);
    setClassConfigs(prev => ({ ...prev, ...newConfigs }));
    setShowGradeModal(false);
  };

  const removeClass = (className) => {
    setClasses(prev => prev.filter(c => c !== className));
    setClassConfigs(prev => { const n = { ...prev }; delete n[className]; return n; });
  };

  const handleClassConfigChange = (className, field, value) => {
    setClassConfigs(prev => ({ ...prev, [className]: { ...prev[className], [field]: value } }));
  };

  const saveEdit = () => {
    const old = editingClass;
    const n = editName.trim();
    if (!n || n === old) { setEditingClass(null); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(n)) { setErrorMessage('Letters, numbers, underscores only'); return; }
    if (classes.includes(n)) { setErrorMessage(`"${n}" already exists`); return; }
    setClasses(prev => prev.map(c => c === old ? n : c));
    setClassConfigs(prev => {
      const next = { ...prev };
      if (next[old]) { next[n] = next[old]; delete next[old]; }
      return next;
    });
    setEditingClass(null); setErrorMessage('');
  };

  const handleCreateForm = async () => {
    if (classes.length === 0) { setErrorMessage('Add at least one class.'); return; }
    setIsLoading(true); setErrorMessage('');
    try {
      await api.post('/students/create-form', { classCount: classes.length, classes, customFields, classConfigs });
      setHasExistingForm(true);
      // Mark task as completed in database
      try { await api.post('/tasks/complete/2'); } catch(e) { console.error('Complete save:', e); }
      // Mark in localStorage
      const stored = JSON.parse(localStorage.getItem('completedTasks') || '[]');
      if (!stored.includes(2)) { stored.push(2); localStorage.setItem('completedTasks', JSON.stringify(stored)); }
      onSuccess();
    } catch (err) {
      setErrorMessage('Failed: ' + (err.response?.data?.error || err.message));
    } finally { setIsLoading(false); }
  };

  const totalShifts = task1Config?.total_shifts || 1;
  const shiftOptions = totalShifts === 2 ? [1, 2] : [1];
  const shiftLabels = { 1: 'Shift 1 (Morning)', 2: 'Shift 2 (Afternoon)' };

  const kgCount = Object.keys(kgSelections).filter(k => kgSelections[k]).length;
  const gradeCount = Object.keys(gradeSelections).filter(k => gradeSelections[k]).length;

  return (
    <div style={{ padding: 20, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 4 }}>Create Student Registration Form</h2>
      <p style={{ fontSize: 14, color: '#6b7280', marginBottom: 24 }}>Add KG and grade classes with sections.</p>

      {errorMessage && <div style={{ padding: '10px 16px', background: '#fef2f2', color: '#dc2626', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>{errorMessage}</div>}
      {hasExistingForm && <div style={{ padding: '10px 16px', background: '#f0fdf4', color: '#16a34a', borderRadius: 8, marginBottom: 16, fontSize: 14 }}>✅ Form exists — add more classes or modify fields.</div>}

      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {task1Config?.has_kg && (
          <button onClick={() => setShowKgModal(true)} disabled={isLoading}
            style={{ padding: '10px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiPlus /> Add KG Classes
          </button>
        )}
        <button onClick={() => setShowGradeModal(true)} disabled={isLoading}
          style={{ padding: '10px 20px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiPlus /> Add Grade Classes
        </button>
      </div>

      {showKgModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowKgModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 480, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Add KG Classes</h3>
              <button onClick={() => setShowKgModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}><FiX /></button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <CheckboxGrid items={KG_LEVELS} selections={kgSelections}
                onChange={(item, val) => { setKgSelections(prev => ({ ...prev, [item]: val })); if (val) setKgSectionCounts(prev => ({ ...prev, [item]: prev[item] || 3 })); }}
                columns={2} />
            </div>
            {kgCount > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Sections per Level</label>
                {KG_LEVELS.filter(l => kgSelections[l]).map(l => (
                  <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: '#f5f3ff', borderRadius: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 70, color: '#5b21b6' }}>{l}</span>
                    <input type="number" min={1} max={50} value={kgSectionCounts[l] || 3}
                      onChange={e => setKgSectionCounts(prev => ({ ...prev, [l]: parseInt(e.target.value) || 1 }))}
                      style={{ width: 80, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, textAlign: 'center' }} />
                  </div>
                ))}
              </div>
            )}
            {kgCount > 0 && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#f5f3ff', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#6d28d9', marginBottom: 6 }}>Preview: {totalSectionsAdded(kgSelections, kgSectionCounts)} sections</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {KG_LEVELS.filter(l => kgSelections[l]).map(l => (
                    <span key={l} style={{ padding: '2px 8px', background: '#ede9fe', borderRadius: 4, fontSize: 13, color: '#5b21b6', marginRight: 4 }}>
                      {generateSections(l, kgSectionCounts[l] || 3).join(', ')}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <button onClick={addKgClasses} disabled={kgCount === 0}
              style={{ width: '100%', padding: '10px', background: kgCount === 0 ? '#d1d5db' : '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: kgCount === 0 ? 'default' : 'pointer' }}>
              Add {totalSectionsAdded(kgSelections, kgSectionCounts)} Section{totalSectionsAdded(kgSelections, kgSectionCounts) !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {showGradeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowGradeModal(false)}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 580, maxWidth: '90vw', maxHeight: '85vh', overflowY: 'auto', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Add Grade Classes</h3>
              <button onClick={() => setShowGradeModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}><FiX /></button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <CheckboxGrid items={GRADES} selections={gradeSelections}
                onChange={(item, val) => { setGradeSelections(prev => ({ ...prev, [item]: val })); if (val) setGradeSectionCounts(prev => ({ ...prev, [item]: prev[item] || 4 })); }}
                columns={4} />
            </div>
            {(gradeSelections.G11 || gradeSelections.G12) && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Streams (G11 & G12)</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['Science','Natural'].map(s => {
                    const checked = gradeStreams[s];
                    return (
                      <label key={s} onClick={() => setGradeStreams(prev => ({ ...prev, [s]: !prev[s] }))}
                        style={{ padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 14, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 8,
                          background: checked ? '#dbeafe' : '#f9fafb', border: checked ? '2px solid #2563eb' : '2px solid #e5e7eb' }}>
                        <div style={{ width: 18, height: 18, borderRadius: 4, background: checked ? '#2563eb' : '#fff', border: checked ? 'none' : '2px solid #d1d5db', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {checked && <FiCheck size={12} color="#fff" />}
                        </div>
                        {s}
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            {gradeCount > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#374151', marginBottom: 8 }}>Sections per Grade</label>
                {GRADES.filter(g => gradeSelections[g]).map(g => (
                  <div key={g} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '6px 12px', background: '#eff6ff', borderRadius: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, minWidth: 50, color: '#1d4ed8' }}>{g}</span>
                    <input type="number" min={1} max={50} value={gradeSectionCounts[g] || 4}
                      onChange={e => setGradeSectionCounts(prev => ({ ...prev, [g]: parseInt(e.target.value) || 1 }))}
                      style={{ width: 80, padding: '6px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, textAlign: 'center' }} />
                  </div>
                ))}
              </div>
            )}
            {gradeCount > 0 && (
              <div style={{ marginBottom: 16, padding: '10px 14px', background: '#eff6ff', borderRadius: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#1d4ed8', marginBottom: 6 }}>Preview: {totalSectionsAdded(gradeSelections, gradeSectionCounts)} sections</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {GRADES.filter(g => gradeSelections[g]).map(g => {
                    const count = gradeSectionCounts[g] || 4;
                    const prefixes = (g === 'G11' || g === 'G12')
                      ? [...(gradeStreams.Science ? [`${g}S`] : []), ...(gradeStreams.Natural ? [`${g}N`] : []), ...(!gradeStreams.Science && !gradeStreams.Natural ? [g] : [])]
                      : [g];
                    return prefixes.map(p => (
                      <span key={p} style={{ padding: '2px 8px', background: '#dbeafe', borderRadius: 4, fontSize: 13, color: '#1e40af', marginRight: 4 }}>
                        {generateSections(p, count).join(', ')}
                      </span>
                    ));
                  })}
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
              <button onClick={() => setGradeSelections(Object.fromEntries(GRADES.map(g => [g, true])))} style={{ padding: '6px 14px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Select All</button>
              <button onClick={() => setGradeSelections(Object.fromEntries(GRADES.map(g => [g, false])))} style={{ padding: '6px 14px', background: '#f3f4f6', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Clear All</button>
            </div>
            <button onClick={addGradeClasses} disabled={gradeCount === 0}
              style={{ width: '100%', padding: '10px', background: gradeCount === 0 ? '#d1d5db' : '#2563eb', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: gradeCount === 0 ? 'default' : 'pointer' }}>
              Add {totalSectionsAdded(gradeSelections, gradeSectionCounts)} Section{totalSectionsAdded(gradeSelections, gradeSectionCounts) !== 1 ? 's' : ''}
            </button>
          </div>
        </div>
      )}

      {editingClass && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => { setEditingClass(null); setErrorMessage(''); }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw', boxShadow: '0 25px 50px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 20, fontSize: 18, fontWeight: 600 }}>Edit Class</h3>
            <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
              <input value={editName} onChange={e => setEditName(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()}
                style={{ flex: 1, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
              <button onClick={saveEdit} style={{ padding: '10px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer' }}><FiCheck /></button>
            </div>
            {classConfigs[editingClass] && (
              <div style={{ padding: 12, background: '#f9fafb', borderRadius: 8, fontSize: 13, color: '#6b7280', marginBottom: 8 }}>
                Current: <strong>{editingClass}</strong>
                {classConfigs[editingClass].isKG && <span style={{ marginLeft: 8, padding: '2px 6px', background: '#ede9fe', color: '#6d28d9', borderRadius: 4, fontSize: 12 }}>KG</span>}
                — Shift: <strong>{shiftLabels[classConfigs[editingClass].shift || 1]}</strong>
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button onClick={() =>{ setEditingClass(null); setErrorMessage(''); }} style={{ padding: '8px 20px', background: '#e5e7eb', color: '#374151', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Cancel</button>
              <button onClick={saveEdit} style={{ padding: '8px 20px', background: '#7c3aed', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {classes.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Classes ({classes.length})</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
            {classes.map(cls => {
              const cfg = classConfigs[cls] || {};
              return (
                <div key={cls} style={{
                  display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px',
                  background: cfg.isKG ? '#f5f3ff' : '#f9fafb', borderRadius: 8, border: '1px solid #e5e7eb'
                }}>
                  <span style={{ fontWeight: 600, fontSize: 14, minWidth: 70 }}>{cls}</span>
                  {cfg.isKG && <span style={{ fontSize: 12, padding: '2px 8px', background: '#ede9fe', color: '#6d28d9', borderRadius: 4 }}>KG</span>}
                  {shiftOptions.length > 1 && (
                    <select value={cfg.shift || 1} onChange={e => handleClassConfigChange(cls, 'shift', parseInt(e.target.value))}
                      style={{ padding: '4px 8px', borderRadius: 6, border: '1px solid #d1d5db', fontSize: 12, cursor: 'pointer' }}>
                      {shiftOptions.map(s => <option key={s} value={s}>{shiftLabels[s]}</option>)}
                    </select>
                  )}
                  <button onClick={() => { setEditingClass(cls); setEditName(cls); }} disabled={isLoading}
                    style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer', fontSize: 15 }}><FiEdit3 /></button>
                  <button onClick={() => removeClass(cls)} disabled={isLoading}
                    style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16 }}><FiTrash2 /></button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {classes.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, color: '#9ca3af', fontSize: 14 }}>
          No classes yet. Click {task1Config?.has_kg ? '"Add KG Classes" or ' : ''}"Add Grade Classes" to start.
        </div>
      )}

      <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Custom Fields</h3>
      {customFields.map((field, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', padding: '10px 14px', background: '#fff', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 8 }}>
          <div style={{ flex: 1, fontSize: 14 }}>
            <strong>{field.label}</strong> <span style={{ color: '#6b7280', fontSize: 12 }}>({field.name}) — {field.type}{field.required ? ' • Required' : ''}</span>
            {Object.keys(field.translations || {}).length > 0 && (
              <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}><FiGlobe style={{ marginRight: 4, verticalAlign: 'middle' }} /> {Object.keys(field.translations).map(c => getLanguageName(c)).join(', ')}</div>
            )}
          </div>
          <button onClick={() => setCustomFields(prev => prev.filter((_, i) => i !== index))} style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}><FiTrash2 /></button>
        </div>
      ))}
      {customFields.length === 0 && <p style={{ fontSize: 13, color: '#9ca3af', marginBottom: 12 }}>No custom fields yet.</p>}

      <button onClick={() => setShowFieldModal(true)} disabled={isLoading}
        style={{ padding: '8px 20px', background: '#059669', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 24 }}>
        <FiPlus /> Add Custom Field
      </button>

      {/* FIELD MODAL (unchanged fields) */}
      {showFieldModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', overflowY: 'auto' }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 28, width: 500, maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Add Custom Field</h3>
              <button onClick={() => setShowFieldModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}><FiX /></button>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Field Name</label>
              <input value={newField.name} onChange={e => setNewField({...newField, name: e.target.value.replace(/\s/g, '_')})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} placeholder="favorite_subjects" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Label</label>
              <input value={newField.label} onChange={e => setNewField({...newField, label: e.target.value})}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} placeholder="Favorite Subjects" />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, display: 'block' }}>Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
                {fieldTypes.map(type => (
                  <div key={type.value} onClick={() => setNewField({...newField, type: type.value, options: []})}
                    style={{ padding: '10px 8px', borderRadius: 8, cursor: 'pointer', textAlign: 'center', fontSize: 12, fontWeight: 500,
                      background: newField.type === type.value ? '#ede9fe' : '#f9fafb', border: newField.type === type.value ? '2px solid #7c3aed' : '2px solid #e5e7eb' }}>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{type.icon}</div>
                    <span>{type.label}</span>
                  </div>
                ))}
              </div>
            </div>
            {(newField.type === 'select' || newField.type === 'multi-select') && (
              <><div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 13, fontWeight: 500, marginBottom: 4, display: 'block' }}>Options</label>
                <input type="number" min={1} max={10} value={newField.optionCount}
                  onChange={e => { const c = parseInt(e.target.value)||0; const o=[...newField.options]; while(o.length<c) o.push(''); o.length=c; setNewField({...newField, optionCount:c, options:o}); }}
                  style={{ width: 100, padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }} />
              </div>
              {Array.from({length: newField.optionCount}).map((_, i) => (
                <div key={i} style={{ marginBottom: 8 }}>
                  <input value={newField.options[i]||''} onChange={e => { const o=[...newField.options]; o[i]=e.target.value; setNewField({...newField, options:o}); }}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: 8, fontSize: 14 }}
                    placeholder={`Option ${i+1}`} />
                </div>
              ))}</>
            )}
            <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" checked={newField.required} onChange={e => setNewField({...newField, required: e.target.checked})} />
              <label style={{ fontSize: 14, cursor: 'pointer' }}>Required</label>
            </div>
            {selectedLanguages.length > 0 && (
              <div style={{ marginBottom: 16, padding: 16, background: '#f0f5ff', borderRadius: 8 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}><FiGlobe /> Translations</h4>
                {selectedLanguages.map(langCode => (
                  <div key={langCode} style={{ marginBottom: 12, padding: 12, background: '#fff', borderRadius: 8, border: '1px solid #dbeafe' }}>
                    <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 8 }}>{getLanguageName(langCode)} ({getLanguageNativeName(langCode)})</div>
                    <input value={newField.translations[langCode]?.label||''}
                      onChange={e => setNewField(prev => ({...prev, translations:{...prev.translations, [langCode]:{...prev.translations[langCode], label:e.target.value}}}))}
                      style={{ width: '100%', padding: '8px 10px', border: '1px solid #d1d5db', borderRadius: 6, fontSize: 13, marginBottom: 4 }}
                      placeholder={`Label in ${getLanguageName(langCode)}`} />
                    {(newField.type === 'select' || newField.type === 'multi-select') && newField.optionCount > 0 && Array.from({length: newField.optionCount}).map((_, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4, fontSize: 12 }}>
                        <span style={{ minWidth: 60, color: '#6b7280' }}>{newField.options[i]||`Opt${i+1}`} →</span>
                        <input value={newField.translations[langCode]?.options?.[i]||''}
                          onChange={e => { const opts=[...(newField.translations[langCode]?.options||[])]; opts[i]=e.target.value; setNewField(prev=>({...prev, translations:{...prev.translations, [langCode]:{...prev.translations[langCode], options:opts}}})); }}
                          style={{ flex:1, padding:'6px 8px', border:'1px solid #d1d5db', borderRadius:6, fontSize:12 }}
                          placeholder={`Translation ${i+1}`} />
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
              <button onClick={() => { if (!newField.name.trim()||!newField.label.trim()) return; setCustomFields(prev=>[...prev,{...newField}]); setShowFieldModal(false); setNewField({name:'',label:'',type:'text',required:false,optionCount:0,options:[],translations:{}}); }}
                style={{ padding:'10px 24px', background:'#7c3aed', color:'#fff', border:'none', borderRadius:8, fontSize:14, cursor:'pointer' }}>Add</button>
              <button onClick={() => setShowFieldModal(false)} style={{ padding:'10px 24px', background:'#e5e7eb', color:'#374151', border:'none', borderRadius:8, fontSize:14, cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleCreateForm} disabled={isLoading || classes.length === 0}
        style={{ padding: '12px 32px', background: 'linear-gradient(135deg, #667eea, #764ba2)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiSave /> {isLoading ? 'Saving...' : 'Create Form Structure'}
      </button>
    </div>
  );
};

export default StudentFormBuilder;
