import React, { useState } from 'react';
import Select from './Select';
import styles from './SelectDemo.module.css';

/**
 * SelectDemo - Comprehensive demonstration of Select component features
 * 
 * This demo showcases all Select component capabilities:
 * - Single select mode
 * - Multi-select mode
 * - Searchable dropdown
 * - Grouped options
 * - Validation states (error, required)
 * - Disabled state
 * - RTL layout support
 * - Accessibility features
 */
const SelectDemo = () => {
  // Single select state
  const [singleValue, setSingleValue] = useState('');
  
  // Multi-select state
  const [multiValue, setMultiValue] = useState([]);
  
  // Searchable select state
  const [searchableValue, setSearchableValue] = useState('');
  
  // Grouped options select state
  const [groupedValue, setGroupedValue] = useState('');
  
  // Validation example state
  const [validationValue, setValidationValue] = useState('');
  const [showError, setShowError] = useState(false);
  
  // Disabled example state
  const [disabledValue, setDisabledValue] = useState('option2');

  // Simple options for basic examples
  const simpleOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' },
    { value: 'option4', label: 'Option 4' },
    { value: 'option5', label: 'Option 5' },
  ];

  // Large list of options for searchable example
  const searchableOptions = [
    { value: 'apple', label: 'Apple' },
    { value: 'banana', label: 'Banana' },
    { value: 'cherry', label: 'Cherry' },
    { value: 'date', label: 'Date' },
    { value: 'elderberry', label: 'Elderberry' },
    { value: 'fig', label: 'Fig' },
    { value: 'grape', label: 'Grape' },
    { value: 'honeydew', label: 'Honeydew' },
    { value: 'kiwi', label: 'Kiwi' },
    { value: 'lemon', label: 'Lemon' },
    { value: 'mango', label: 'Mango' },
    { value: 'orange', label: 'Orange' },
    { value: 'papaya', label: 'Papaya' },
    { value: 'quince', label: 'Quince' },
    { value: 'raspberry', label: 'Raspberry' },
  ];

  // Grouped options example
  const groupedOptions = [
    {
      group: 'Fruits',
      options: [
        { value: 'apple', label: 'Apple' },
        { value: 'banana', label: 'Banana' },
        { value: 'orange', label: 'Orange' },
      ],
    },
    {
      group: 'Vegetables',
      options: [
        { value: 'carrot', label: 'Carrot' },
        { value: 'broccoli', label: 'Broccoli' },
        { value: 'spinach', label: 'Spinach' },
      ],
    },
    {
      group: 'Grains',
      options: [
        { value: 'rice', label: 'Rice' },
        { value: 'wheat', label: 'Wheat' },
        { value: 'oats', label: 'Oats' },
      ],
    },
  ];

  // Options with some disabled
  const optionsWithDisabled = [
    { value: 'option1', label: 'Available Option 1' },
    { value: 'option2', label: 'Available Option 2' },
    { value: 'option3', label: 'Disabled Option', disabled: true },
    { value: 'option4', label: 'Available Option 3' },
    { value: 'option5', label: 'Disabled Option 2', disabled: true },
  ];

  const handleValidationSubmit = (e) => {
    e.preventDefault();
    if (!validationValue) {
      setShowError(true);
    } else {
      setShowError(false);
      alert(`Form submitted with value: ${validationValue}`);
    }
  };

  return (
    <div className={styles.demoContainer}>
      <h1 className={styles.title}>Select Component Demo</h1>
      <p className={styles.description}>
        Comprehensive demonstration of the Select component with all features and variants.
      </p>

      <div className={styles.demoGrid}>
        {/* Single Select */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Single Select</h2>
          <p className={styles.sectionDescription}>
            Basic single selection dropdown. Click to open and select one option.
          </p>
          <Select
            label="Choose an option"
            options={simpleOptions}
            value={singleValue}
            onChange={setSingleValue}
            placeholder="Select one option"
            helperText="Select a single option from the list"
          />
          <div className={styles.output}>
            <strong>Selected:</strong> {singleValue || 'None'}
          </div>
        </div>

        {/* Multi-Select */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Multi-Select</h2>
          <p className={styles.sectionDescription}>
            Select multiple options. The dropdown stays open for multiple selections.
          </p>
          <Select
            label="Choose multiple options"
            options={simpleOptions}
            value={multiValue}
            onChange={setMultiValue}
            multiple
            placeholder="Select multiple options"
            helperText="You can select multiple options"
          />
          <div className={styles.output}>
            <strong>Selected:</strong> {multiValue.length > 0 ? multiValue.join(', ') : 'None'}
          </div>
        </div>

        {/* Searchable Select */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Searchable Select</h2>
          <p className={styles.sectionDescription}>
            Large list with search functionality. Type to filter options.
          </p>
          <Select
            label="Search for a fruit"
            options={searchableOptions}
            value={searchableValue}
            onChange={setSearchableValue}
            searchable
            placeholder="Type to search..."
            helperText="Start typing to filter the list"
          />
          <div className={styles.output}>
            <strong>Selected:</strong> {searchableValue || 'None'}
          </div>
        </div>

        {/* Grouped Options */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Grouped Options</h2>
          <p className={styles.sectionDescription}>
            Options organized into groups with labels.
          </p>
          <Select
            label="Choose a food item"
            options={groupedOptions}
            value={groupedValue}
            onChange={setGroupedValue}
            placeholder="Select from groups"
            helperText="Options are organized by category"
          />
          <div className={styles.output}>
            <strong>Selected:</strong> {groupedValue || 'None'}
          </div>
        </div>

        {/* Validation States */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Validation States</h2>
          <p className={styles.sectionDescription}>
            Required field with error validation. Submit without selecting to see error.
          </p>
          <form onSubmit={handleValidationSubmit}>
            <Select
              label="Required field"
              options={simpleOptions}
              value={validationValue}
              onChange={(val) => {
                setValidationValue(val);
                setShowError(false);
              }}
              required
              error={showError ? 'This field is required' : ''}
              placeholder="Please select an option"
            />
            <button type="submit" className={styles.submitButton}>
              Submit
            </button>
          </form>
          <div className={styles.output}>
            <strong>Selected:</strong> {validationValue || 'None'}
          </div>
        </div>

        {/* Disabled State */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Disabled State</h2>
          <p className={styles.sectionDescription}>
            Disabled select that cannot be interacted with.
          </p>
          <Select
            label="Disabled select"
            options={simpleOptions}
            value={disabledValue}
            onChange={setDisabledValue}
            disabled
            helperText="This select is disabled"
          />
          <div className={styles.output}>
            <strong>Value:</strong> {disabledValue}
          </div>
        </div>

        {/* Disabled Options */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Disabled Options</h2>
          <p className={styles.sectionDescription}>
            Some options are disabled and cannot be selected.
          </p>
          <Select
            label="Select with disabled options"
            options={optionsWithDisabled}
            value=""
            onChange={() => {}}
            placeholder="Try selecting disabled options"
            helperText="Some options are disabled"
          />
        </div>

        {/* Searchable Multi-Select with Groups */}
        <div className={styles.demoSection}>
          <h2 className={styles.sectionTitle}>Advanced: Searchable Multi-Select with Groups</h2>
          <p className={styles.sectionDescription}>
            Combines multiple features: searchable, multi-select, and grouped options.
          </p>
          <Select
            label="Advanced select"
            options={groupedOptions}
            value={[]}
            onChange={() => {}}
            multiple
            searchable
            placeholder="Search and select multiple"
            helperText="Combines search, multi-select, and groups"
          />
        </div>
      </div>

      {/* Accessibility Features */}
      <div className={styles.accessibilitySection}>
        <h2 className={styles.sectionTitle}>Accessibility Features</h2>
        <ul className={styles.featureList}>
          <li>✅ Full keyboard navigation (Tab, Enter, Escape, Arrow keys)</li>
          <li>✅ ARIA attributes for screen readers</li>
          <li>✅ Focus indicators for keyboard users</li>
          <li>✅ Proper labeling and descriptions</li>
          <li>✅ Error announcements with aria-live</li>
          <li>✅ RTL (Right-to-Left) layout support</li>
          <li>✅ Touch-friendly targets (44x44px minimum)</li>
        </ul>
      </div>

      {/* Feature Summary */}
      <div className={styles.featureSection}>
        <h2 className={styles.sectionTitle}>All Features</h2>
        <div className={styles.featureGrid}>
          <div className={styles.featureCard}>
            <h3>Single & Multi-Select</h3>
            <p>Support for both single and multiple selection modes</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Searchable</h3>
            <p>Built-in search/filter for large option lists</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Grouped Options</h3>
            <p>Organize options into labeled groups</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Validation</h3>
            <p>Error states, required fields, helper text</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Disabled States</h3>
            <p>Disable entire select or individual options</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Accessibility</h3>
            <p>WCAG AA compliant with full keyboard support</p>
          </div>
          <div className={styles.featureCard}>
            <h3>RTL Support</h3>
            <p>Automatic right-to-left layout for Arabic</p>
          </div>
          <div className={styles.featureCard}>
            <h3>Responsive</h3>
            <p>Works on mobile, tablet, and desktop</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectDemo;
