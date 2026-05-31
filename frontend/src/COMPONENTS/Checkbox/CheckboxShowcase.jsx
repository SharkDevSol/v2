import React, { useState } from 'react';
import Checkbox from './Checkbox';
import styles from './CheckboxShowcase.module.css';

/**
 * Checkbox Showcase Component
 * Demonstrates all features and variants of the Checkbox component
 */
const CheckboxShowcase = () => {
  const [basicChecked, setBasicChecked] = useState(false);
  const [withDescription, setWithDescription] = useState(true);
  const [withHelper, setWithHelper] = useState(false);
  const [withError, setWithError] = useState(false);
  const [required, setRequired] = useState(false);
  const [disabled, setDisabled] = useState(true);
  
  // Select all example
  const [items, setItems] = useState([
    { id: 1, label: 'Item 1', checked: false },
    { id: 2, label: 'Item 2', checked: true },
    { id: 3, label: 'Item 3', checked: false }
  ]);

  const allChecked = items.every(item => item.checked);
  const someChecked = items.some(item => item.checked) && !allChecked;

  const handleSelectAll = (checked) => {
    setItems(items.map(item => ({ ...item, checked })));
  };

  const handleItemChange = (id, checked) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, checked } : item
    ));
  };

  return (
    <div className={styles.showcase}>
      <h1 className={styles.title}>Checkbox Component Showcase</h1>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic Usage</h2>
        <div className={styles.examples}>
          <Checkbox
            label="Basic checkbox"
            checked={basicChecked}
            onChange={setBasicChecked}
          />
          <Checkbox
            label="Checked by default"
            checked={true}
            onChange={() => {}}
          />
          <Checkbox
            label="Unchecked"
            checked={false}
            onChange={() => {}}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>With Description</h2>
        <div className={styles.examples}>
          <Checkbox
            label="Subscribe to newsletter"
            description="Get weekly updates about new features and products"
            checked={withDescription}
            onChange={setWithDescription}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>With Helper Text</h2>
        <div className={styles.examples}>
          <Checkbox
            label="Remember me"
            helperText="You can change this later in settings"
            checked={withHelper}
            onChange={setWithHelper}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>With Error</h2>
        <div className={styles.examples}>
          <Checkbox
            label="Accept terms and conditions"
            error="You must accept the terms to continue"
            checked={withError}
            onChange={setWithError}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Required Field</h2>
        <div className={styles.examples}>
          <Checkbox
            label="I agree to the privacy policy"
            required={true}
            checked={required}
            onChange={setRequired}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Disabled State</h2>
        <div className={styles.examples}>
          <Checkbox
            label="Disabled unchecked"
            checked={false}
            onChange={() => {}}
            disabled={true}
          />
          <Checkbox
            label="Disabled checked"
            checked={disabled}
            onChange={setDisabled}
            disabled={true}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Sizes</h2>
        <div className={styles.examples}>
          <Checkbox
            label="Small checkbox"
            size="sm"
            checked={true}
            onChange={() => {}}
          />
          <Checkbox
            label="Medium checkbox (default)"
            size="md"
            checked={true}
            onChange={() => {}}
          />
          <Checkbox
            label="Large checkbox"
            size="lg"
            checked={true}
            onChange={() => {}}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Indeterminate State (Select All)</h2>
        <div className={styles.examples}>
          <div className={styles.selectAllExample}>
            <Checkbox
              label="Select all items"
              checked={allChecked}
              indeterminate={someChecked}
              onChange={handleSelectAll}
            />
            <div className={styles.itemList}>
              {items.map(item => (
                <Checkbox
                  key={item.id}
                  label={item.label}
                  checked={item.checked}
                  onChange={(checked) => handleItemChange(item.id, checked)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Form Example</h2>
        <div className={styles.examples}>
          <form className={styles.form}>
            <Checkbox
              label="Email notifications"
              description="Receive email updates about your account"
              checked={true}
              onChange={() => {}}
            />
            <Checkbox
              label="SMS notifications"
              description="Receive text messages for important updates"
              checked={false}
              onChange={() => {}}
            />
            <Checkbox
              label="Push notifications"
              description="Get push notifications on your device"
              checked={true}
              onChange={() => {}}
            />
            <Checkbox
              label="Marketing emails"
              description="Receive promotional offers and news"
              checked={false}
              onChange={() => {}}
              helperText="You can unsubscribe at any time"
            />
          </form>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility Features</h2>
        <div className={styles.features}>
          <ul>
            <li>✅ Keyboard navigation (Tab to focus, Space to toggle)</li>
            <li>✅ Screen reader support with ARIA attributes</li>
            <li>✅ Visible focus indicators</li>
            <li>✅ Touch-friendly (44x44px minimum target)</li>
            <li>✅ Error announcements via role="alert"</li>
            <li>✅ Associated labels for all inputs</li>
            <li>✅ RTL layout support</li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default CheckboxShowcase;
