import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiPlus, FiTrash2, FiChevronDown, FiType, FiEdit2, FiCalendar, FiCheckSquare, FiUpload, FiGlobe } from 'react-icons/fi';
import axios from 'axios';
import styles from './StudentFormBuilder.module.css';
import { useLanguageSelection } from '../../../context/LanguageSelectionContext';

const StudentFormBuilder = ({ onSuccess }) => {
  const { selectedLanguages, getLanguageName, getLanguageNativeName } = useLanguageSelection();
  const [classCount, setClassCount] = useState(0);
  const [classes, setClasses] = useState([]);
  const [customFields, setCustomFields] = useState([]);
  const [showFieldModal, setShowFieldModal] = useState(false);
  const [newField, setNewField] = useState({
    name: '',
    label: '',
    type: 'text',
    required: false,
    optionCount: 0,
    options: [],
    translations: {} // { langCode: { label: '', options: [] } }
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // V2 Enhancement: Task1 configuration state
  const [task1Config, setTask1Config] = useState(null);
  const [classConfigs, setClassConfigs] = useState({}); // { className: { isKG: bool, isEvening: bool, shift: number } }

  // V2 Enhancement: Fetch Task1 configuration on component mount
  useEffect(() => {
    const fetchTask1Config = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_API_URL}/schedule/config`);
        if (response.data) {
          setTask1Config(response.data);
          console.log('Task1 Config loaded:', response.data);
        }
      } catch (error) {
        console.error('Error fetching Task1 config:', error);
        // Set default config if fetch fails
        setTask1Config({
          has_kg: false,
          has_evening_class: false,
          total_shifts: 1
        });
      }
    };
    fetchTask1Config();
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

  const handleClassCountChange = (e) => {
    const count = parseInt(e.target.value) || 0;
    setClassCount(count);
    const newClasses = Array.from({ length: count }, (_, i) => `Class ${i + 1}`);
    setClasses(newClasses);
    
    // V2 Enhancement: Initialize class configs
    const newConfigs = {};
    newClasses.forEach(className => {
      newConfigs[className] = {
        isKG: false,
        isEvening: false,
        shift: 1
      };
    });
    setClassConfigs(newConfigs);
  };

  const handleClassNameChange = (index, value) => {
    const oldName = classes[index];
    const newClasses = [...classes];
    newClasses[index] = value;
    setClasses(newClasses);
    
    // V2 Enhancement: Update class config key when name changes
    if (oldName !== value && classConfigs[oldName]) {
      const newConfigs = { ...classConfigs };
      newConfigs[value] = newConfigs[oldName];
      delete newConfigs[oldName];
      setClassConfigs(newConfigs);
    }
  };

  // V2 Enhancement: Handle class configuration changes
  const handleClassConfigChange = (className, field, value) => {
    setClassConfigs(prev => ({
      ...prev,
      [className]: {
        ...prev[className],
        [field]: value
      }
    }));
  };

  const handleAddField = () => {
    if (!newField.name.trim()) {
      setErrorMessage('Field name is required');
      return;
    }

    if (!newField.label.trim()) {
      setErrorMessage('Field label is required');
      return;
    }

    // Validate field name format
    const fieldNameRegex = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    if (!fieldNameRegex.test(newField.name)) {
      setErrorMessage('Field name must start with a letter or underscore and contain only letters, numbers, and underscores');
      return;
    }

    // Validate options for select and multi-select
    if ((newField.type === 'select' || newField.type === 'multi-select') && newField.options.some(opt => !opt.trim())) {
      setErrorMessage('All options must be filled for select fields');
      return;
    }

    // Validate translations for selected languages
    for (const langCode of selectedLanguages) {
      if (!newField.translations[langCode]?.label?.trim()) {
        setErrorMessage(`Please provide a label translation for ${getLanguageName(langCode)}`);
        return;
      }
      // Validate option translations for select fields
      if ((newField.type === 'select' || newField.type === 'multi-select') && newField.options.length > 0) {
        const langOptions = newField.translations[langCode]?.options || [];
        if (langOptions.length !== newField.options.length || langOptions.some(opt => !opt.trim())) {
          setErrorMessage(`Please provide all option translations for ${getLanguageName(langCode)}`);
          return;
        }
      }
    }

    setCustomFields([...customFields, { ...newField }]);
    setShowFieldModal(false);
    setNewField({
      name: '',
      label: '',
      type: 'text',
      required: false,
      optionCount: 0,
      options: [],
      translations: {}
    });
    setErrorMessage('');
  };

  // Handle translation label change
  const handleTranslationLabelChange = (langCode, value) => {
    setNewField(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [langCode]: {
          ...prev.translations[langCode],
          label: value
        }
      }
    }));
  };

  // Handle translation option change
  const handleTranslationOptionChange = (langCode, optionIndex, value) => {
    setNewField(prev => {
      const currentOptions = prev.translations[langCode]?.options || [];
      const newOptions = [...currentOptions];
      newOptions[optionIndex] = value;
      return {
        ...prev,
        translations: {
          ...prev.translations,
          [langCode]: {
            ...prev.translations[langCode],
            options: newOptions
          }
        }
      };
    });
  };

  const handleRemoveField = (index) => {
    const newFields = customFields.filter((_, i) => i !== index);
    setCustomFields(newFields);
  };

  const handleCreateForm = async () => {
    if (classCount <= 0 || classes.some(c => !c.trim())) {
      setErrorMessage('Please specify valid class count and names.');
      return;
    }

    // Validate class names
    const invalidClassNames = classes.filter(name => !/^[a-zA-Z0-9_]+$/.test(name));
    if (invalidClassNames.length > 0) {
      setErrorMessage('Class names can only contain letters, numbers, and underscores.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/students/create-form`, {
        classCount,
        classes,
        customFields,
        classConfigs // V2 Enhancement: Include class configurations
      });
      onSuccess();
    } catch (err) {
      setErrorMessage('Failed to create form: ' + (err.response?.data?.error || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={styles.container}>
      <div className={styles.formBuilder}>
        <div className={styles.formHeader}>
          <h2>Create Student Registration Form</h2>
          <p>Set up classes and custom fields for the student registration system.</p>
        </div>
        <div className={styles.formContent}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Number of Classes:</label>
            <input 
              type="number" 
              value={classCount} 
              onChange={handleClassCountChange} 
              min="1"
              max="20"
              disabled={isLoading} 
              className={styles.input}
            />
          </div>
          {classes.map((cls, index) => (
            <div key={index} className={styles.classConfigGroup}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Class {index + 1} Name:</label>
                <input
                  type="text"
                  value={cls}
                  onChange={(e) => handleClassNameChange(index, e.target.value)}
                  disabled={isLoading}
                  className={styles.input}
                  placeholder={`Enter class name (letters, numbers, underscores only)`}
                />
              </div>
              
              {/* V2 Enhancement: Class Configuration Options */}
              {task1Config && (
                <div className={styles.classOptions}>
                  {/* KG Configuration */}
                  {task1Config.has_kg && (
                    <label className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        checked={classConfigs[cls]?.isKG || false}
                        onChange={(e) => handleClassConfigChange(cls, 'isKG', e.target.checked)}
                        disabled={isLoading}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxLabel}>
                        🎨 Kindergarten (KG) Class
                      </span>
                    </label>
                  )}
                  
                  {/* Evening Class Configuration */}
                  {task1Config.has_evening_class && (
                    <label className={styles.checkboxContainer}>
                      <input
                        type="checkbox"
                        checked={classConfigs[cls]?.isEvening || false}
                        onChange={(e) => handleClassConfigChange(cls, 'isEvening', e.target.checked)}
                        disabled={isLoading}
                        className={styles.checkboxInput}
                      />
                      <span className={styles.checkboxLabel}>
                        🌙 Evening Class
                      </span>
                    </label>
                  )}
                  
                  {/* Shift Selection (only if 2 shifts) */}
                  {task1Config.total_shifts === 2 && (
                    <div className={styles.shiftSelection}>
                      <label className={styles.label}>Shift Assignment:</label>
                      <select
                        value={classConfigs[cls]?.shift || 1}
                        onChange={(e) => handleClassConfigChange(cls, 'shift', parseInt(e.target.value))}
                        disabled={isLoading}
                        className={styles.select}
                      >
                        <option value={1}>Shift 1 (Morning)</option>
                        <option value={2}>Shift 2 (Afternoon)</option>
                      </select>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          <h3>Custom Fields</h3>
          {customFields.map((field, index) => (
            <div key={index} className={styles.customField}>
              <div style={{ flex: 1 }}>
                <div>
                  <strong>{field.label}</strong> ({field.name}) - {field.type} 
                  {field.required && ' • Required'}
                  {field.options.length > 0 && ` • ${field.options.length} options`}
                </div>
                {Object.keys(field.translations || {}).length > 0 && (
                  <div style={{ fontSize: '0.8rem', color: '#666', marginTop: '4px' }}>
                    <FiGlobe style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                    Translations: {Object.keys(field.translations).map(code => getLanguageName(code)).join(', ')}
                  </div>
                )}
              </div>
              <button 
                onClick={() => handleRemoveField(index)} 
                disabled={isLoading}
                className={styles.removeField}
              >
                <FiTrash2 />
              </button>
            </div>
          ))}
          <button 
            onClick={() => setShowFieldModal(true)} 
            disabled={isLoading}
            className={styles.button}
          >
            <FiPlus /> Add Custom Field
          </button>

          {showFieldModal && (
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <h3>Add Custom Field</h3>
                {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
                <div className={styles.formGroup}>
                  <label className={styles.label}>Field Name (no spaces, only letters, numbers, underscores):</label>
                  <input 
                    value={newField.name} 
                    onChange={(e) => setNewField({...newField, name: e.target.value.replace(/\s/g, '_')})} 
                    className={styles.input}
                    placeholder="e.g., favorite_subjects"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Field Label (display name):</label>
                  <input 
                    value={newField.label} 
                    onChange={(e) => setNewField({...newField, label: e.target.value})} 
                    className={styles.input}
                    placeholder="e.g., Favorite Subjects"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.label}>Field Type:</label>
                  <div className={styles.fieldTypeGrid}>
                    {fieldTypes.map(type => (
                      <div
                        key={type.value}
                        className={`${styles.fieldTypeOption} ${newField.type === type.value ? styles.selected : ''}`}
                        onClick={() => setNewField({...newField, type: type.value, options: []})}
                      >
                        <div className={styles.fieldTypeIcon}>{type.icon}</div>
                        <span>{type.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {(newField.type === 'select' || newField.type === 'multi-select') && (
                  <>
                    <div className={styles.formGroup}>
                      <label className={styles.label}>Number of Options:</label>
                      <input 
                        type="number" 
                        value={newField.optionCount} 
                        onChange={(e) => {
                          const count = parseInt(e.target.value) || 0;
                          const options = [...newField.options];
                          if (count > options.length) {
                            // Add empty options
                            while (options.length < count) {
                              options.push('');
                            }
                          } else {
                            // Remove extra options
                            options.length = count;
                          }
                          setNewField({...newField, optionCount: count, options});
                        }} 
                        className={styles.input}
                        min="1"
                        max="10"
                      />
                    </div>
                    {Array.from({length: newField.optionCount}).map((_, i) => (
                      <div key={i} className={styles.formGroup}>
                        <label className={styles.label}>Option {i+1}:</label>
                        <input 
                          value={newField.options[i] || ''}
                          onChange={(e) => {
                            const opts = [...newField.options];
                            opts[i] = e.target.value;
                            setNewField({...newField, options: opts});
                          }} 
                          className={styles.input}
                          placeholder={`Enter option ${i+1}`}
                        />
                      </div>
                    ))}
                  </>
                )}
                <div className={styles.checkboxContainer}>
                  <input 
                    type="checkbox" 
                    checked={newField.required} 
                    onChange={(e) => setNewField({...newField, required: e.target.checked})} 
                    className={styles.checkboxInput}
                  />
                  <label className={styles.checkboxLabel}>Required Field</label>
                </div>

                {/* Translation Section */}
                {selectedLanguages.length > 0 && (
                  <div className={styles.translationSection}>
                    <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: '#1565c0' }}>
                      <FiGlobe /> Translations
                    </h4>
                    <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '16px' }}>
                      Provide translations for the selected languages. English label is entered above.
                    </p>
                    {selectedLanguages.map(langCode => (
                      <div key={langCode} className={styles.translationBlock}>
                        <div className={styles.translationHeader}>
                          <span className={styles.langBadge}>{getLanguageName(langCode)}</span>
                          <span className={styles.langNative}>{getLanguageNativeName(langCode)}</span>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.label}>Label in {getLanguageName(langCode)}:</label>
                          <input 
                            value={newField.translations[langCode]?.label || ''} 
                            onChange={(e) => handleTranslationLabelChange(langCode, e.target.value)} 
                            className={styles.input}
                            placeholder={`e.g., ${newField.label || 'Field label'} in ${getLanguageName(langCode)}`}
                          />
                        </div>
                        {/* Option translations for select fields */}
                        {(newField.type === 'select' || newField.type === 'multi-select') && newField.optionCount > 0 && (
                          <div className={styles.optionTranslations}>
                            <label className={styles.label}>Options in {getLanguageName(langCode)}:</label>
                            {Array.from({length: newField.optionCount}).map((_, i) => (
                              <div key={i} className={styles.optionTranslationRow}>
                                <span className={styles.optionOriginal}>{newField.options[i] || `Option ${i+1}`}</span>
                                <span style={{ margin: '0 8px' }}>→</span>
                                <input 
                                  value={newField.translations[langCode]?.options?.[i] || ''} 
                                  onChange={(e) => handleTranslationOptionChange(langCode, i, e.target.value)} 
                                  className={styles.input}
                                  placeholder={`Translation for option ${i+1}`}
                                  style={{ flex: 1 }}
                                />
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* No Languages Selected Info */}
                {selectedLanguages.length === 0 && (
                  <div className={styles.noLanguagesInfo}>
                    <strong>💡 Tip:</strong> You can add additional languages in Task 1 (School Year Setup) to provide translations for field labels.
                  </div>
                )}

                <div className={styles.modalActions}>
                  <button onClick={handleAddField} className={styles.button}>Add Field</button>
                  <button onClick={() => {
                    setShowFieldModal(false);
                    setErrorMessage('');
                  }} className={styles.button}>Cancel</button>
                </div>
              </div>
            </div>
          )}

          <button 
            onClick={handleCreateForm} 
            disabled={isLoading || classCount <= 0}
            className={styles.button}
          >
            {isLoading ? 'Creating Form Structure...' : 'Create Form Structure'}
          </button>
          {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        </div>
      </div>
    </motion.div>
  );
};

export default StudentFormBuilder;