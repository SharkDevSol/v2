/**
 * Button Component Showcase
 * 
 * Visual demonstration of all Button variants, sizes, and states.
 * This file can be used for manual testing and documentation.
 */

import React, { useState } from 'react';
import Button from './Button';
import styles from './ButtonShowcase.module.css';

const ButtonShowcase = () => {
  const [loading, setLoading] = useState(false);

  const handleLoadingClick = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <div className={styles.showcase}>
      <h1>Button Component Showcase</h1>
      
      {/* Variants Section */}
      <section className={styles.section}>
        <h2>Variants</h2>
        <div className={styles.buttonGroup}>
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
          <Button variant="danger">Danger</Button>
          <Button variant="ghost">Ghost</Button>
        </div>
      </section>

      {/* Sizes Section */}
      <section className={styles.section}>
        <h2>Sizes</h2>
        <div className={styles.buttonGroup}>
          <Button size="small">Small</Button>
          <Button size="medium">Medium</Button>
          <Button size="large">Large</Button>
        </div>
      </section>

      {/* States Section */}
      <section className={styles.section}>
        <h2>States</h2>
        <div className={styles.buttonGroup}>
          <Button>Default</Button>
          <Button disabled>Disabled</Button>
          <Button loading={loading} onClick={handleLoadingClick}>
            {loading ? 'Loading...' : 'Click to Load'}
          </Button>
        </div>
      </section>

      {/* With Icons Section */}
      <section className={styles.section}>
        <h2>With Icons</h2>
        <div className={styles.buttonGroup}>
          <Button icon={<span>📁</span>}>Icon Left</Button>
          <Button icon={<span>➡️</span>} iconPosition="right">Icon Right</Button>
          <Button variant="success" icon={<span>✓</span>}>Save</Button>
          <Button variant="danger" icon={<span>✕</span>}>Delete</Button>
        </div>
      </section>

      {/* Full Width Section */}
      <section className={styles.section}>
        <h2>Full Width</h2>
        <div className={styles.fullWidthContainer}>
          <Button fullWidth variant="primary">Full Width Primary</Button>
          <Button fullWidth variant="secondary">Full Width Secondary</Button>
        </div>
      </section>

      {/* All Variants with All Sizes */}
      <section className={styles.section}>
        <h2>All Variants × All Sizes</h2>
        {['primary', 'secondary', 'success', 'warning', 'danger', 'ghost'].map(variant => (
          <div key={variant} className={styles.variantRow}>
            <h3>{variant.charAt(0).toUpperCase() + variant.slice(1)}</h3>
            <div className={styles.buttonGroup}>
              <Button variant={variant} size="small">Small</Button>
              <Button variant={variant} size="medium">Medium</Button>
              <Button variant={variant} size="large">Large</Button>
            </div>
          </div>
        ))}
      </section>

      {/* Accessibility Section */}
      <section className={styles.section}>
        <h2>Accessibility</h2>
        <div className={styles.buttonGroup}>
          <Button ariaLabel="Save document">💾 Save</Button>
          <Button ariaLabel="Delete item" variant="danger">🗑️ Delete</Button>
          <Button ariaLabel="Download file" variant="success">⬇️ Download</Button>
        </div>
        <p className={styles.note}>
          All buttons have proper ARIA labels and keyboard support (Tab, Enter, Space).
          Focus indicators are visible when navigating with keyboard.
        </p>
      </section>
    </div>
  );
};

export default ButtonShowcase;
