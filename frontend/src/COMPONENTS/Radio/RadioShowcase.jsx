import React, { useState } from 'react';
import Radio from './Radio';
import RadioGroup from './RadioGroup';
import styles from './RadioShowcase.module.css';

/**
 * Radio Showcase Component
 * Demonstrates all features and variants of the Radio and RadioGroup components
 */
const RadioShowcase = () => {
  const [basicValue, setBasicValue] = useState('option1');
  const [planValue, setPlanValue] = useState('pro');
  const [paymentValue, setPaymentValue] = useState('');
  const [layoutValue, setLayoutValue] = useState('horizontal');
  const [sizeValue, setSizeValue] = useState('md');
  const [disabledValue, setDisabledValue] = useState('option1');
  const [individualValue, setIndividualValue] = useState('a');

  const basicOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  const planOptions = [
    { 
      value: 'basic', 
      label: 'Basic Plan',
      description: 'Perfect for individuals and small teams'
    },
    { 
      value: 'pro', 
      label: 'Pro Plan',
      description: 'Advanced features for growing businesses'
    },
    { 
      value: 'enterprise', 
      label: 'Enterprise Plan',
      description: 'Custom solutions for large organizations'
    }
  ];

  const paymentOptions = [
    { 
      value: 'card', 
      label: 'Credit/Debit Card',
      description: 'Pay securely with your card'
    },
    { 
      value: 'paypal', 
      label: 'PayPal',
      description: 'Fast and secure PayPal checkout'
    },
    { 
      value: 'bank', 
      label: 'Bank Transfer',
      description: 'Direct bank transfer'
    }
  ];

  const layoutOptions = [
    { value: 'horizontal', label: 'Horizontal' },
    { value: 'vertical', label: 'Vertical' }
  ];

  const sizeOptions = [
    { value: 'sm', label: 'Small' },
    { value: 'md', label: 'Medium' },
    { value: 'lg', label: 'Large' }
  ];

  const disabledOptions = [
    { value: 'option1', label: 'Available Option' },
    { value: 'option2', label: 'Unavailable Option', disabled: true },
    { value: 'option3', label: 'Another Available Option' }
  ];

  return (
    <div className={styles.showcase}>
      <h1 className={styles.title}>Radio Component Showcase</h1>
      
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Basic RadioGroup</h2>
        <div className={styles.examples}>
          <RadioGroup
            name="basic"
            label="Choose an option"
            options={basicOptions}
            value={basicValue}
            onChange={setBasicValue}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>With Descriptions</h2>
        <div className={styles.examples}>
          <RadioGroup
            name="plan"
            label="Select your plan"
            description="Choose the plan that best fits your needs"
            options={planOptions}
            value={planValue}
            onChange={setPlanValue}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>With Validation</h2>
        <div className={styles.examples}>
          <RadioGroup
            name="payment"
            label="Payment method"
            options={paymentOptions}
            value={paymentValue}
            onChange={setPaymentValue}
            required={true}
            error={!paymentValue ? "Please select a payment method" : ""}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>With Helper Text</h2>
        <div className={styles.examples}>
          <RadioGroup
            name="notification"
            label="Notification preference"
            options={[
              { value: 'email', label: 'Email' },
              { value: 'sms', label: 'SMS' },
              { value: 'push', label: 'Push notifications' }
            ]}
            value="email"
            onChange={() => {}}
            helperText="You can change this later in settings"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Layout Options</h2>
        <div className={styles.examples}>
          <div className={styles.layoutExample}>
            <RadioGroup
              name="layout-control"
              label="Choose layout"
              layout="horizontal"
              options={layoutOptions}
              value={layoutValue}
              onChange={setLayoutValue}
            />
            
            <div className={styles.layoutDemo}>
              <h3>Current Layout: {layoutValue}</h3>
              <RadioGroup
                name="layout-demo"
                label="Demo options"
                layout={layoutValue}
                options={basicOptions}
                value="option1"
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Size Variants</h2>
        <div className={styles.examples}>
          <div className={styles.sizeExample}>
            <RadioGroup
              name="size-control"
              label="Choose size"
              layout="horizontal"
              options={sizeOptions}
              value={sizeValue}
              onChange={setSizeValue}
            />
            
            <div className={styles.sizeDemo}>
              <RadioGroup
                name="size-demo"
                label={`${sizeValue.toUpperCase()} Size Demo`}
                size={sizeValue}
                options={basicOptions}
                value="option1"
                onChange={() => {}}
              />
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Disabled Options</h2>
        <div className={styles.examples}>
          <RadioGroup
            name="disabled-options"
            label="Options with disabled state"
            options={disabledOptions}
            value={disabledValue}
            onChange={setDisabledValue}
            helperText="Some options may be unavailable"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Disabled Group</h2>
        <div className={styles.examples}>
          <RadioGroup
            name="disabled-group"
            label="Disabled radio group"
            options={basicOptions}
            value="option2"
            onChange={() => {}}
            disabled={true}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Individual Radio Buttons</h2>
        <div className={styles.examples}>
          <div className={styles.individualExample}>
            <p className={styles.individualLabel}>Manual radio group:</p>
            <Radio
              name="individual"
              value="a"
              label="Option A"
              description="First option"
              checked={individualValue === 'a'}
              onChange={() => setIndividualValue('a')}
            />
            <Radio
              name="individual"
              value="b"
              label="Option B"
              description="Second option"
              checked={individualValue === 'b'}
              onChange={() => setIndividualValue('b')}
            />
            <Radio
              name="individual"
              value="c"
              label="Option C"
              description="Third option"
              checked={individualValue === 'c'}
              onChange={() => setIndividualValue('c')}
            />
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Form Example</h2>
        <div className={styles.examples}>
          <form className={styles.form}>
            <RadioGroup
              name="account-type"
              label="Account Type"
              required={true}
              options={[
                { value: 'personal', label: 'Personal', description: 'For individual use' },
                { value: 'business', label: 'Business', description: 'For organizations' }
              ]}
              value="personal"
              onChange={() => {}}
            />
            
            <RadioGroup
              name="subscription"
              label="Subscription Period"
              layout="horizontal"
              options={[
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' }
              ]}
              value="monthly"
              onChange={() => {}}
              helperText="Save 20% with yearly subscription"
            />
            
            <RadioGroup
              name="newsletter"
              label="Newsletter Frequency"
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'never', label: 'Never' }
              ]}
              value="weekly"
              onChange={() => {}}
            />
          </form>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Accessibility Features</h2>
        <div className={styles.features}>
          <ul>
            <li>✅ Keyboard navigation (Tab to focus, Arrow keys to navigate, Space to select)</li>
            <li>✅ Screen reader support with ARIA attributes</li>
            <li>✅ Proper radiogroup role and semantics</li>
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

export default RadioShowcase;
