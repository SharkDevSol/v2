import React, { useState } from 'react';
import FormGroup from './FormGroup';
import Input from '../Input/Input';
import Select from '../Select/Select';
import Checkbox from '../Checkbox/Checkbox';
import Textarea from '../Textarea/Textarea';
import { User, Mail, Phone } from 'lucide-react';

/**
 * FormGroup Usage Examples
 * This file demonstrates various ways to use the FormGroup component
 */

const FormGroupExamples = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    bio: '',
    terms: false
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.terms) newErrors.terms = 'You must accept the terms';
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      console.log('Form submitted:', formData);
      alert('Form submitted successfully!');
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '20px' }}>
      <h1>FormGroup Component Examples</h1>
      
      <form onSubmit={handleSubmit}>
        <h2>Basic Usage</h2>
        
        {/* Example 1: Basic FormGroup with Input */}
        <FormGroup
          label="Full Name"
          required
          error={errors.name}
          helperText="Enter your first and last name"
        >
          <Input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            prefixIcon={<User size={18} />}
          />
        </FormGroup>

        {/* Example 2: FormGroup with error state */}
        <FormGroup
          label="Email Address"
          required
          error={errors.email}
          helperText="We'll never share your email"
        >
          <Input
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="john@example.com"
            prefixIcon={<Mail size={18} />}
          />
        </FormGroup>

        {/* Example 3: FormGroup with icon in label */}
        <FormGroup
          label="Phone Number"
          labelIcon={<Phone size={16} />}
          helperText="Include country code"
        >
          <Input
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="+1 (555) 123-4567"
          />
        </FormGroup>

        {/* Example 4: FormGroup with Select */}
        <FormGroup
          label="Country"
          required
          helperText="Select your country of residence"
        >
          <Select
            value={formData.country}
            onChange={(value) => handleChange('country', value)}
            options={[
              { value: 'us', label: 'United States' },
              { value: 'uk', label: 'United Kingdom' },
              { value: 'et', label: 'Ethiopia' },
              { value: 'ca', label: 'Canada' }
            ]}
            placeholder="Select a country"
          />
        </FormGroup>

        {/* Example 5: FormGroup with Textarea */}
        <FormGroup
          label="Bio"
          helperText="Tell us about yourself (optional)"
        >
          <Textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Write a short bio..."
            rows={4}
          />
        </FormGroup>

        {/* Example 6: FormGroup with Checkbox */}
        <FormGroup
          error={errors.terms}
        >
          <Checkbox
            label="I accept the terms and conditions"
            checked={formData.terms}
            onChange={(checked) => handleChange('terms', checked)}
            required
          />
        </FormGroup>

        <h2>Inline Layout Examples</h2>

        {/* Example 7: Inline FormGroup */}
        <FormGroup
          label="Username"
          inline
          labelWidth="150px"
          helperText="Choose a unique username"
        >
          <Input
            type="text"
            placeholder="username"
          />
        </FormGroup>

        <FormGroup
          label="Password"
          inline
          labelWidth="150px"
          required
        >
          <Input
            type="password"
            placeholder="Enter password"
          />
        </FormGroup>

        {/* Example 8: FormGroup without label */}
        <FormGroup
          helperText="This field has no label"
        >
          <Input
            type="text"
            placeholder="No label input"
          />
        </FormGroup>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
          <button 
            type="submit"
            style={{
              padding: '10px 24px',
              backgroundColor: '#8b5cf6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Submit Form
          </button>
          <button 
            type="button"
            onClick={() => {
              setFormData({
                name: '',
                email: '',
                phone: '',
                country: '',
                bio: '',
                terms: false
              });
              setErrors({});
            }}
            style={{
              padding: '10px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Reset
          </button>
        </div>
      </form>

      <div style={{ marginTop: '40px', padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '8px' }}>
        <h3>Form Data (Debug)</h3>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
        {Object.keys(errors).length > 0 && (
          <>
            <h3 style={{ color: '#ef4444' }}>Errors</h3>
            <pre style={{ fontSize: '12px', overflow: 'auto', color: '#ef4444' }}>
              {JSON.stringify(errors, null, 2)}
            </pre>
          </>
        )}
      </div>
    </div>
  );
};

export default FormGroupExamples;
