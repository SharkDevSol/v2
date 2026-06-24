import React, { useState } from 'react';
import Input from './Input';
import { Mail, Search, User, Lock, Phone, Globe } from 'lucide-react';
import styles from './InputDemo.module.css';

/**
 * Demo component showcasing all Input component features
 */
const InputDemo = () => {
  const [textValue, setTextValue] = useState('');
  const [emailValue, setEmailValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [numberValue, setNumberValue] = useState('');
  const [telValue, setTelValue] = useState('');
  const [urlValue, setUrlValue] = useState('');
  const [dateValue, setDateValue] = useState('');
  const [errorValue, setErrorValue] = useState('invalid@');
  const [successValue, setSuccessValue] = useState('valid@example.com');
  const [warningValue, setWarningValue] = useState('weak');

  return (
    <div className={styles.demo}>
      <h1>Input Component Demo</h1>
      
      <section className={styles.section}>
        <h2>Input Types</h2>
        <div className={styles.grid}>
          <Input
            type="text"
            label="Text Input"
            placeholder="Enter text"
            value={textValue}
            onChange={setTextValue}
            helperText="This is a text input"
          />
          
          <Input
            type="email"
            label="Email Input"
            placeholder="Enter email"
            value={emailValue}
            onChange={setEmailValue}
            prefixIcon={<Mail size={18} />}
            helperText="We'll never share your email"
          />
          
          <Input
            type="password"
            label="Password Input"
            placeholder="Enter password"
            value={passwordValue}
            onChange={setPasswordValue}
            prefixIcon={<Lock size={18} />}
            helperText="Must be at least 8 characters"
          />
          
          <Input
            type="number"
            label="Number Input"
            placeholder="Enter number"
            value={numberValue}
            onChange={setNumberValue}
            helperText="Enter a numeric value"
          />
          
          <Input
            type="tel"
            label="Phone Input"
            placeholder="Enter phone"
            value={telValue}
            onChange={setTelValue}
            prefixIcon={<Phone size={18} />}
            helperText="Format: +1234567890"
          />
          
          <Input
            type="url"
            label="URL Input"
            placeholder="Enter URL"
            value={urlValue}
            onChange={setUrlValue}
            prefixIcon={<Globe size={18} />}
            helperText="Enter a valid URL"
          />
          
          <Input
            type="date"
            label="Date Input"
            value={dateValue}
            onChange={setDateValue}
            helperText="Select a date"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Validation States</h2>
        <div className={styles.grid}>
          <Input
            type="email"
            label="Error State"
            placeholder="Enter email"
            value={errorValue}
            onChange={setErrorValue}
            error="Please enter a valid email address"
          />
          
          <Input
            type="email"
            label="Success State"
            placeholder="Enter email"
            value={successValue}
            onChange={setSuccessValue}
            success="Email is valid!"
          />
          
          <Input
            type="password"
            label="Warning State"
            placeholder="Enter password"
            value={warningValue}
            onChange={setWarningValue}
            warning="Password is weak. Consider using a stronger password."
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Icons</h2>
        <div className={styles.grid}>
          <Input
            label="Prefix Icon"
            placeholder="Search..."
            value=""
            onChange={() => {}}
            prefixIcon={<Search size={18} />}
          />
          
          <Input
            label="Suffix Icon"
            placeholder="Enter username"
            value=""
            onChange={() => {}}
            suffixIcon={<User size={18} />}
          />
          
          <Input
            label="Both Icons"
            placeholder="Enter email"
            value=""
            onChange={() => {}}
            prefixIcon={<Mail size={18} />}
            suffixIcon={<Search size={18} />}
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>States</h2>
        <div className={styles.grid}>
          <Input
            label="Disabled Input"
            placeholder="This is disabled"
            value="Cannot edit"
            onChange={() => {}}
            disabled
          />
          
          <Input
            label="Read-only Input"
            placeholder="This is read-only"
            value="Cannot edit but can focus"
            onChange={() => {}}
            readOnly
          />
          
          <Input
            label="Required Input"
            placeholder="This is required"
            value=""
            onChange={() => {}}
            required
            helperText="This field is required"
          />
        </div>
      </section>

      <section className={styles.section}>
        <h2>Max Length</h2>
        <div className={styles.grid}>
          <Input
            label="Limited Input (10 chars)"
            placeholder="Max 10 characters"
            value=""
            onChange={() => {}}
            maxLength={10}
            helperText="Maximum 10 characters allowed"
          />
        </div>
      </section>
    </div>
  );
};

export default InputDemo;
